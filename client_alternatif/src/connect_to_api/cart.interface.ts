import { IProduct } from "./product.interface";

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
  createdAt: string;
  items: ICartItem[];
}
