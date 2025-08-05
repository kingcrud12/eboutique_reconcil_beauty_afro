import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDto } from '../../product/Models/product.dto';
import {
  ICartItem,
  ICartItemCreate,
  ICartItemUpdate,
} from '../Interfaces/cartItem.interface';

export class CartItemDto implements ICartItem {
  @ApiProperty({ description: 'cart id', example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'product id', example: 42 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'product quantity', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: () => ProductDto })
  @ValidateNested()
  @Type(() => ProductDto)
  product: ProductDto;
}

export class CartItemCreateDto implements ICartItemCreate {
  @ApiProperty({ description: 'product id', example: 42 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'product quantity', example: 2 })
  @IsInt()
  @Min(-100)
  quantity: number;
}

export class CartItemUpdateDto implements ICartItemUpdate {
  @ApiProperty({ description: 'product id', example: 42 })
  @IsInt()
  @IsOptional()
  productId: number;

  @ApiProperty({ description: 'product quantity', example: 2 })
  @IsInt()
  @IsOptional()
  @Min(-100)
  quantity: number;
}
