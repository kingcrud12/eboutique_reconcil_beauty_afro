export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  weight?: number;
  imageUrl: string;
  category?: string;
}

export interface IProductUpdate {
  id?: number;
  name?: string;
  description?: string;
  price?: string;
  stock?: number;
  weight?: number;
  imageUrl?: string;
  category?: string;
}
