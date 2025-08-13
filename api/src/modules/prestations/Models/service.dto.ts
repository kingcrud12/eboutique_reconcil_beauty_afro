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
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto implements IServiceCreate {
  @ApiProperty({
    description: 'Service name',
    example: 'Nattes collees basiques',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    description: 'temps de réalisation du service',
    example: '1h',
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  duration!: number;

  @ApiProperty({ description: 'Prix du service', example: '45.00 euros' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'price doit être un décimal' },
  )
  @Type(() => Decimal)
  @Min(0)
  price!: Decimal;

  @IsString()
  @IsOptional()
  imageUrl?: string;

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

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(Category)
  @IsOptional()
  category: Category;

  @IsEnum(Subcategory)
  @IsOptional()
  subcategory: Subcategory;
}
