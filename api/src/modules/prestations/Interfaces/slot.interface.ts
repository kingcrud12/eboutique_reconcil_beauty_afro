import { SlotStatus } from '@prisma/client';

export interface ISlot {
  id: number;
  serviceId: number;
  startAt: Date;
  endAt: Date;
  status: SlotStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISlotCreate {
  serviceId: number;
  startAt: Date;
  endAt: Date;
  status?: SlotStatus;
}

export interface ISlotUpdate {
  startAt?: Date;
  endAt?: Date;
  status?: SlotStatus;
}
