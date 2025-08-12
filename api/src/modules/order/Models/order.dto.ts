import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  DeliveryModeEnum,
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

export class CreateOrderDto implements IOrderCreate {
  @ApiProperty({
    description: 'Adresse de livraison',
    example: '244 rue de Bercy, 75012 Paris',
  })
  @IsString()
  deliveryAddress: string;

  @ApiProperty({
    description: 'ID utilisateur (optionnel si invité)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ enum: DeliveryModeEnum, example: 'relay' })
  @IsEnum(DeliveryModeEnum)
  deliveryMode: DeliveryModeEnum;
}

export class UpdateOrderDto implements IOrderUpdate {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.paid,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: 'Nouvelle adresse de livraison',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({
    description: 'Identifiant de paiement Stripe',
    required: false,
  })
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
  @IsNumber({ maxDecimalPlaces: 2 })
  unitPrice: number; // ✅ number au lieu de Decimal

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
  @IsNumber({ maxDecimalPlaces: 2 })
  total: number; // ✅ number au lieu de Decimal

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Date de création de la commande',
    example: '2025-08-12',
    required: false, // 👈 important pour Swagger
  })
  @IsDate()
  @IsOptional() // 👈 important pour la validation
  createdAt?: Date;

  @ApiProperty({ enum: DeliveryModeEnum, example: 'relay' })
  @IsEnum(DeliveryModeEnum)
  deliveryMode: DeliveryModeEnum;

  @ApiProperty({
    description: 'Adresse de livraison',
    example: '12 rue du Marché, 75000 Paris',
  })
  @IsNotEmpty()
  @IsString()
  deliveryAddress: string;

  @ApiProperty({
    description: 'ID de paiement Stripe (optionnel)',
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
  items: OrderItemDto[];
}
