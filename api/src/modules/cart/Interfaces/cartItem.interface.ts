import { IProduct } from '../../product/Interfaces/product.interface';

export interface ICartItem {
  id: number;
  productId: number;
  quantity: number;
  product: IProduct;
}

export interface ICartItemCreate {
  productId: number;
  quantity: number;
}

export interface ICartItemUpdate {
  productId?: number;
  quantity?: number;
}
