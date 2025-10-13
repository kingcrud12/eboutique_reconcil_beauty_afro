import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, ValidateNested } from 'class-validator';
import {
  CartItemCreateDto,
  CartItemDto,
  CartItemUpdateDto,
} from './cartItem.dto';

export class CartDto {
  @ApiProperty({ description: 'cart id', example: 1 })
  @IsInt()
  id: number;

  @ApiPropertyOptional({ description: 'user id', example: 22 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'guest id', example: 1 })
  @IsOptional()
  @IsInt()
  guestId?: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ type: () => [CartItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

export class CreateCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  guestId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  uuid?: number;

  @ApiPropertyOptional({ type: () => [CartItemCreateDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CartItemCreateDto)
  items?: CartItemDto[];
}

export class UpdateCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  guestId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  uuid?: number;

  @ApiPropertyOptional({ type: () => [CartItemUpdateDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CartItemUpdateDto)
  items?: CartItemUpdateDto[];
}
