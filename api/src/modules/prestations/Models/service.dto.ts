import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, Subcategory } from '@prisma/client';
import {
  IServiceCreate,
  IServiceUpdate,
} from '../Interfaces/service.interface';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateServiceDto implements IServiceCreate {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  duration!: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'price doit être un nombre' },
  )
  @Type(() => Decimal)
  @Min(0)
  price!: Decimal;

  @IsEnum(Category)
  category!: Category;

  @IsEnum(Subcategory)
  subcategory!: Subcategory;
}

export class UpdateServiceDto implements IServiceUpdate {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  duration: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'price doit être un nombre' },
  )
  @Type(() => Decimal)
  @Min(0)
  @IsOptional()
  price: Decimal;

  @IsEnum(Category)
  @IsOptional()
  category: Category;

  @IsEnum(Subcategory)
  @IsOptional()
  subcategory: Subcategory;
}
