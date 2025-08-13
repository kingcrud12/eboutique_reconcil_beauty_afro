import { IsEnum, IsInt, IsOptional, IsISO8601, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SlotStatus } from '@prisma/client';
import { ISlotCreate, ISlotUpdate } from '../Interfaces/slot.interface';

export class CreateSlotDto implements ISlotCreate {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  serviceId!: number;

  @IsISO8601({}, { message: 'startAt doit être une date ISO valide' })
  startAt!: Date;

  @IsISO8601({}, { message: 'endAt doit être une date ISO valide' })
  endAt!: Date;

  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}

export class UpdateSlotDto implements ISlotUpdate {
  @IsISO8601({}, { message: 'startAt doit être une date ISO valide' })
  @IsOptional()
  startAt: Date;

  @IsISO8601({}, { message: 'endAt doit être une date ISO valide' })
  @IsOptional()
  endAt: Date;

  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}
