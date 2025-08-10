import { OrderStatus } from '@prisma/client';
import { IProduct } from '../../product/Interfaces/product.interface';

export enum DeliveryModeEnum {
  RELAY = 'RELAY',
  HOME = 'HOME',
  EXPRESS = 'EXPRESS',
}

export interface IOrder {
  id: number;
  total: number;
  status: OrderStatus;
  deliveryMode: DeliveryModeEnum;
  deliveryAddress: string;
  userId?: number;
  items: IOrderItem[];
}

export interface IOrderCreate {
  [x: string]: any;
  deliveryAddress: string;
  userId?: number;
  deliveryMode: DeliveryModeEnum;
}

export interface IOrderUpdate {
  status?: string;
  deliveryAddress?: string;
  paymentIntentId?: string;
}

export interface IOrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  orderId: number;
  productId: number;
  product?: IProduct;
}
