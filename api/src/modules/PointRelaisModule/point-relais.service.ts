import { Injectable, Inject } from '@nestjs/common';
import { Client } from 'soap';
import { UserService } from '../user/Services/user.service';
import { IMondialRelayPoint } from './IMondialRelayPoint';

interface RechercheResult {
  WSI2_RecherchePointRelaisResult?: {
    PR01?: Record<string, IMondialRelayPoint>;
  };
}

@Injectable()
export class PointRelaisService {
  constructor(
    @Inject('MR_SOAP_CLIENT') private readonly soapClient: Client,
    private readonly usersService: UserService,
  ) {}

  async findRelaisByUserId(userId: number): Promise<IMondialRelayPoint[]> {
    const user = await this.usersService.get(userId);
    if (!user?.adress) throw new Error('Adresse manquante');
    const [city, postalCode] = this.parseAddress(user.adress);

    const params = {
      Enseigne: 'AM_LABEL',
      Pays: 'FR',
      Ville: city,
      CP: postalCode,
      Taille: 'M',
      Poids: '1000',
      Action: '24R',
      Security: '',
    };

    const soapClientTyped = this.soapClient as unknown as {
      WSI2_RecherchePointRelaisAsync: (
        args: typeof params,
      ) => Promise<[RechercheResult]>;
    };

    const [raw] = await soapClientTyped.WSI2_RecherchePointRelaisAsync(params);
    const result = raw.WSI2_RecherchePointRelaisResult;
    return result?.PR01 ? Object.values(result.PR01) : [];
  }

  private parseAddress(address: string): [string, string] {
    const parts = address.split(',');
    if (parts.length < 2) throw new Error('Adresse invalide');
    return [parts[0].trim(), parts[1].trim()];
  }
}
