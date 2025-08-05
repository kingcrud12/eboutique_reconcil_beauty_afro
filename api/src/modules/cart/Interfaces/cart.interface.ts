import {
  ICartItem,
  ICartItemCreate,
  ICartItemUpdate,
} from './cartItem.interface';

export interface ICart {
  id: number;
  userId?: number;
  guestId?: number;
  createdAt: Date;
  items: ICartItem[];
}

export interface ICartCreate {
  userId?: number;
  guestId?: number;
  items?: ICartItemCreate[];
}

export interface ICartCreateUpdate {
  userId?: number;
  guestId?: number;
  items?: ICartItemUpdate[];
}
