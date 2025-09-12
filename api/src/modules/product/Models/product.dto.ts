import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IProductCreate,
  IProductUpdate,
  IProduct,
} from '../Interfaces/product.interface';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateProductDto implements IProductCreate {
  @ApiProperty({ description: 'Product name', example: 'Shampoo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Embrace your beauty',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: '9,50 euros',
  })
  @IsNotEmpty()
  @IsString()
  price: number;

  @ApiProperty({
    description: 'Product stock',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateProductDto implements IProductUpdate {
  @ApiProperty({ description: 'Product name', example: 'Shampoo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Embrace your beauty',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: '9,50 euros',
  })
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Product stock',
    example: '2',
  })
  @IsOptional()
  stock?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product image',
    example: 'Product1.png',
  })
  @IsOptional()
  @IsOptional()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  category?: string;
}

export class ProductDto implements IProduct {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Product name', example: 'Shampoo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Embrace your beauty',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 9.5,
  })
  @IsNotEmpty()
  @IsNumber()
  price: Decimal;

  @ApiProperty({
    description: 'Product stock',
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  stock: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product image',
    example: 'Product1.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Cheveux',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
