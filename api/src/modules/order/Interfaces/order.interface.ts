import { DeliveryMode, OrderStatus } from '@prisma/client';
import { IProduct } from '../../product/Interfaces/product.interface';

export interface IOrder {
  id: number;
  total: number;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  deliveryAddress: string;
  userId?: number;
  items: IOrderItem[];
}

export interface IOrderCreate {
  [x: string]: any;
  deliveryAddress: string;
  userId?: number;
  deliveryMode: DeliveryMode;
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
