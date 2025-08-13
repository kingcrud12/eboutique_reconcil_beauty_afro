import { Category, Subcategory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface IService {
  id: number;
  name: string;
  duration: number;
  price: Decimal;
  imageUrl?: string;
  category: Category;
  subcategory: Subcategory;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IServiceCreate {
  name: string;
  duration: number;
  price: Decimal;
  imageUrl?: string;
  category: Category;
  subcategory: Subcategory;
}

export interface IServiceUpdate {
  name?: string;
  duration?: number;
  price?: Decimal;
  imageUrl?: string;
  category?: Category;
  subcategory?: Subcategory;
}
