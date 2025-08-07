import { Injectable, Inject } from '@nestjs/common';
import { Client } from 'soap';
import { UserService } from '../user/Services/user.service';
import { IMondialRelayPoint } from './IMondialRelayPoint';
import * as crypto from 'crypto';

interface RechercheResult {
  WSI2_RecherchePointRelaisResult?: {
    PR01?: Record<string, IMondialRelayPoint>;
  };
}

@Injectable()
export class PointRelaisService {
  private readonly enseigne = 'BDTEST';
  private readonly privateKey = ''; // Remplace par ta clé privée reçue de Mondial Relay

  constructor(
    @Inject('MR_SOAP_CLIENT') private readonly soapClient: Client,
    private readonly usersService: UserService,
  ) {}

  async findRelaisByUserId(userId: number): Promise<IMondialRelayPoint[]> {
    const user = await this.usersService.get(userId);
    if (!user?.adress) throw new Error('Adresse manquante');

    const [street, postalCode, city] = this.parseAddress(user.adress);

    const params = {
      Enseigne: this.enseigne,
      Pays: 'FR',
      Ville: city,
      CP: postalCode,
      Taille: 'M',
      Poids: '1000',
      Action: '24R',
    };

    const securityString = `${this.enseigne}${street}${postalCode}${city}24R${this.privateKey}`;
    const security = crypto
      .createHash('md5')
      .update(securityString)
      .digest('hex')
      .toUpperCase();

    const fullParams = { ...params, Security: security };

    const soapClientTyped = this.soapClient as unknown as {
      WSI2_RecherchePointRelaisAsync: (
        args: typeof fullParams,
      ) => Promise<[RechercheResult]>;
    };

    const [raw] =
      await soapClientTyped.WSI2_RecherchePointRelaisAsync(fullParams);
    const result = raw.WSI2_RecherchePointRelaisResult;

    return result?.PR01 ? Object.values(result.PR01) : [];
  }

  private parseAddress(address: string): [string, string, string] {
    const parts = address.split(',').map((p) => p.trim());
    if (parts.length < 3)
      throw new Error(
        'Adresse invalide. Format attendu : "rue, code postal, ville"',
      );
    return [parts[0], parts[1], parts[2]];
  }
}
