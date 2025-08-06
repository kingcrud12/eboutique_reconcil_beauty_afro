import { IProduct } from './product.interface';

export interface ICartItem {
  id: number;
  productId: number;
  quantity: number;
  product: IProduct;
}

export interface ICart {
  id: number;
  userId?: number;
  guestId?: number;
  createdAt: string; // ou Date, selon ce que renvoie l’API
  items: ICartItem[];
}
