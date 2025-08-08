import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  IOrder,
  IOrderCreate,
  IOrderItem,
  IOrderUpdate,
} from '../Interfaces/order.interface';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ProductDto } from 'src/modules/product/Models/product.dto';
import { IProduct } from 'src/modules/product/Interfaces/product.interface';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateOrderDto implements IOrderCreate {
  @ApiProperty({ description: 'Adresse de livraison', example: 1 })
  @IsString()
  deliveryAddress: string;

  @ApiProperty({ description: 'Adresse de livraison', example: 1 })
  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class UpdateOrderDto implements IOrderUpdate {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}

export class OrderItemDto implements IOrderItem {
  @ApiProperty({ description: 'ID de l’item', example: 1 })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Quantité de produit commandée', example: 2 })
  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @ApiProperty({ description: 'Prix unitaire', example: 8.5 })
  @IsNotEmpty()
  @IsInt()
  unitPrice: Decimal;

  @ApiProperty({ description: 'ID du produit', example: 3 })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'ID de la commande', example: 5 })
  @IsNotEmpty()
  @IsInt()
  orderId: number;

  @ApiProperty({ description: 'Produit associé', type: () => ProductDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDto)
  product?: IProduct;
}

export class OrderDto implements IOrder {
  @ApiProperty({ description: 'ID de la commande', example: 1 })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Montant total de la commande', example: 17.7 })
  @IsNotEmpty()
  @IsInt()
  total: number;

  @ApiProperty({ enum: OrderStatus, example: 'pending' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Adresse de livraison',
    example: '12 rue du Marché, 75000 Paris',
  })
  @IsNotEmpty()
  @IsString()
  deliveryAddress: string;

  @ApiProperty({
    description: 'ID de paiement Stripe (le cas échéant)',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @ApiProperty({
    description: 'ID utilisateur associé à la commande',
    required: false,
    example: 4,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    type: () => [OrderItemDto],
    description: 'Liste des items commandés',
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: IOrderItem[];
}
