// point-relais/types/types.ts
export interface ParcelShop {
  Adresse1: string;
  Adresse2: string;
  Available: boolean;
  CP: string;
  HoursHtmlTable: string;
  ID: string;
  Lat: string;
  Long: string;
  Nature: string;
  Nom: string;
  Pays: string;
  Photo: string | null;
  Ville: string;
  Warning: string;
}

export interface SearchPRResponse {
  PRList: ParcelShop[];
}
