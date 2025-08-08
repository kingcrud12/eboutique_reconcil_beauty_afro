import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IProduct } from 'src/modules/product/Interfaces/product.interface';

export interface IOrder {
  id: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  userId?: number;
  items: IOrderItem[];
}

export interface IOrderCreate {
  deliveryAddress: string;
  userId?: number;
}

export interface IOrderUpdate {
  status?: string;
  deliveryAddress?: string;
  paymentIntentId?: string;
}

export interface IOrderItem {
  id: number;
  quantity: number;
  unitPrice: Decimal;
  orderId: number;
  productId: number;
  product?: IProduct;
}
