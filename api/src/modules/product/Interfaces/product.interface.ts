import { Decimal } from '@prisma/client/runtime/library';

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: Decimal;
  stock: number;
  imageUrl?: string;
}

export interface IProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface IProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}
