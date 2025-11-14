import { Decimal } from '@prisma/client/runtime/library';

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: Decimal;
  stock: number;
  weight?: number;
  imageUrl?: string;
  category?: string;
}

export interface IProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  weight?: number;
  imageUrl?: string;
  category?: string;
}

export interface IProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
  weight?: number;
  imageUrl?: string;
  category?: string;
}
