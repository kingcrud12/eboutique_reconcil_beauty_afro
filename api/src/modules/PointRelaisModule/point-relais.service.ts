import { Injectable } from '@nestjs/common';
import { UserService } from '../user/Services/user.service';
import axios from 'axios';
import { ParcelShop, SearchPRResponse } from './types/types';

@Injectable()
export class PointRelaisService {
  private readonly apiBaseUrl = process.env.apiBaseUrl;
  private readonly brand = process.env.brand;
  private readonly deliveryMode = '24R';

  constructor(private readonly usersService: UserService) {}

  async findRelaisByUserId(userId: number): Promise<ParcelShop[]> {
    const user = await this.usersService.get(userId);
    if (!user?.adress) throw new Error('Adresse manquante');

    const [, postalCode, city] = this.parseAddress(user.adress);
    const url = this.buildUrl({ postalCode, city });

    try {
      const response = await axios.get<SearchPRResponse>(url);
      const list = response.data?.PRList ?? [];

      if (list.length === 0) {
        const fallbackUrl = this.buildUrl({ postalCode });
        const fallbackResponse = await axios.get<SearchPRResponse>(fallbackUrl);
        return fallbackResponse.data?.PRList ?? [];
      }

      return list;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Mondial Relay API error:', error.response?.data);
      } else {
        console.error('Unexpected error:', (error as Error).message);
      }
      throw new Error('Erreur lors de la récupération des points relais');
    }
  }

  private parseAddress(address: string): [string, string, string] {
    const parts = address.split(',').map((p) => p.trim());
    if (parts.length < 3) {
      throw new Error(
        'Adresse invalide. Format attendu : "rue, code postal, ville"',
      );
    }
    return [parts[0], parts[1], parts[2]];
  }

  private buildUrl({
    postalCode,
    city,
  }: {
    postalCode: string;
    city?: string;
  }): string {
    const params = new URLSearchParams({
      Brand: this.brand,
      Country: 'FR',
      PostCode: postalCode,
      ColLivMod: this.deliveryMode,
      NbResults: '12',
      SearchFar: '75',
    });
    if (city) params.append('City', city);
    return `${this.apiBaseUrl}?${params.toString()}`;
  }
}
