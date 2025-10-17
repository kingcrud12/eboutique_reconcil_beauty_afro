import { OrderStatus } from '@prisma/client';
import { IProduct } from '../../product/Interfaces/product.interface';
import { Decimal } from '@prisma/client/runtime/library';

export enum DeliveryModeEnum {
  RELAY = 'RELAY',
  HOME = 'HOME',
  LOCKER = 'LOCKER',
}

export interface IOrder {
  id: number;
  total: number;
  status: OrderStatus;
  createdAt?: Date;
  shippingFee?: Decimal;
  totalWeightGrams?: number;
  deliveryMode: DeliveryModeEnum;
  deliveryAddress: string;
  userId?: number;
  items: IOrderItem[];
}

export interface IOrderCreate {
  [x: string]: any;
  deliveryAddress: string;
  userId?: number;
  shippingFee?: Decimal;
  totalWeightGrams?: number;
  deliveryMode: DeliveryModeEnum;
}

export interface IOrderUpdate {
  status?: string;
  items?: IOrderItem[];
  shippingFee?: Decimal;
  totalWeightGrams?: number;
  deliveryAddress?: string;
  paymentIntentId?: string;
}

export interface IOrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  orderId: number;
  productId: number;
  shippingFee?: Decimal;
  totalWeightGrams?: number;
  product?: IProduct;
}
