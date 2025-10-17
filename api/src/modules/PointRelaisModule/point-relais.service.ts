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

    if (!user.adress) {
      throw new Error('Adresse utilisateur non renseignée');
    }

    let postalCode: string;
    let city: string;
    let url: string;

    try {
      const [, parsedPostalCode, parsedCity] = this.parseAddress(user.adress);
      postalCode = parsedPostalCode;
      city = parsedCity;
      url = this.buildUrl({ postalCode, city });
    } catch {
      throw new Error(
        `Format d'adresse invalide. Format attendu : "rue, code postal, ville". Adresse actuelle : "${user.adress}"`,
      );
    }

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
    if (!address || typeof address !== 'string') {
      throw new Error('Adresse manquante ou invalide');
    }

    const parts = address.split(',').map((p) => p.trim());

    // Gestion des formats d'adresse plus flexibles
    if (parts.length >= 3) {
      return [parts[0], parts[1], parts[2]];
    }

    // Tentative de parsing avec d'autres séparateurs
    const alternativeFormats = [
      address.split(' - '), // "rue - code postal - ville"
      address.split(' | '), // "rue | code postal | ville"
      address.split(';'), // "rue; code postal; ville"
    ];

    for (const format of alternativeFormats) {
      if (format.length >= 3) {
        return [format[0].trim(), format[1].trim(), format[2].trim()];
      }
    }

    // Si on a au moins 2 parties, on essaie de deviner
    if (parts.length === 2) {
      // Si la deuxième partie ressemble à un code postal + ville
      const secondPart = parts[1];
      const postalCodeMatch = secondPart.match(/^(\d{5})\s*(.+)$/);
      if (postalCodeMatch) {
        return [parts[0], postalCodeMatch[1], postalCodeMatch[2]];
      }
    }

    throw new Error(
      `Adresse invalide. Format attendu : "rue, code postal, ville". Adresse reçue : "${address}"`,
    );
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

  async findRelaisByAddress(address: string): Promise<ParcelShop[]> {
    const [, postalCode, city] = this.parseAddress(address);
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
        console.error(
          'Mondial Relay API error (address):',
          error.response?.data,
        );
      } else {
        console.error('Unexpected error (address):', (error as Error).message);
      }
      throw new Error(
        'Erreur lors de la récupération des points relais avec adresse saisie',
      );
    }
  }
}
