import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  NotFoundException,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrderService } from '../Services/order.service';
import { OrderDto } from '../Models/order.dto';
import { CreateOrderDto } from '../Models/order.dto';
import { IOrderUpdate } from '../Interfaces/order.interface';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une commande à partir du panier utilisateur',
  })
  @ApiResponse({ status: 201, description: 'Commande créée', type: OrderDto })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async createOrder(@Body() body: CreateOrderDto): Promise<OrderDto> {
    const order = await this.orderService.create(body);
    return order;
  }

  @Get(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'récuperer une commande' })
  @ApiParam({ name: 'orderId', type: Number, description: 'ID de la commande' })
  @ApiQuery({
    name: 'userId',
    type: Number,
    description: "ID de l'utilisateur propriétaire",
  })
  @ApiOkResponse({
    description: 'Commande supprimée (snapshot)',
    type: OrderDto,
  })
  async getOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<OrderDto> {
    return this.orderService.getUserOrder(orderId, userId);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer les commandes du client' })
  @ApiOkResponse({ description: 'Liste des commandes', type: [OrderDto] })
  async getOrders(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<OrderDto[]> {
    return await this.orderService.getOrders(userId);
  }

  @Patch(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Mettre à jour une commande (ajout/suppression/maj d’articles, statut, adresse)',
  })
  @ApiParam({ name: 'orderId', type: Number, description: 'ID de la commande' })
  @ApiQuery({
    name: 'userId',
    type: Number,
    description: "ID de l'utilisateur propriétaire",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'pending' },
        deliveryAddress: {
          type: 'string',
          example: '10 rue de Paris, 75000 Paris',
        },
        paymentIntentId: { type: 'string', example: 'pi_123' },
        items: {
          type: 'array',
          description:
            'Liste des modifications d’articles. quantity > 0 = ajout/augmentation, < 0 = diminution, = 0 ignoré. Si après calcul la quantité devient 0, la ligne est supprimée.',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number', example: 42 },
              quantity: { type: 'integer', example: 1 },
              unitPrice: {
                type: 'number',
                example: 12.5,
                description:
                  '(optionnel) ignoré par le service, le prix unitaire est repris du produit côté BDD',
              },
            },
            required: ['productId', 'quantity'],
          },
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Commande mise à jour', type: OrderDto })
  async patchOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Body() body: IOrderUpdate,
  ): Promise<OrderDto> {
    // délègue toute la logique au service (vérifs, upsert items, recalcul total)
    const updated = await this.orderService.updateOrder(orderId, userId, body);
    return updated;
  }

  @Delete(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une commande' })
  @ApiParam({ name: 'orderId', type: Number, description: 'ID de la commande' })
  @ApiQuery({
    name: 'userId',
    type: Number,
    description: "ID de l'utilisateur propriétaire",
  })
  @ApiOkResponse({
    description: 'Commande supprimée (snapshot)',
    type: OrderDto,
  })
  async deleteOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<OrderDto> {
    const deleted = await this.orderService.deleteOrder(orderId, userId);
    if (!deleted) {
      throw new NotFoundException('Commande introuvable ou non autorisée');
    }
    return {
      id: deleted.id,
      total: deleted.total,
      status: deleted.status,
      deliveryMode: deleted.deliveryMode,
      deliveryAddress: deleted.deliveryAddress,
      userId: deleted.userId,
      items: deleted.items.map((it) => ({
        id: it.id,
        orderId: it.orderId,
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        product: it.product
          ? {
              id: it.product.id,
              name: it.product.name,
              description: it.product.description ?? '',
              price: it.product.price,
              stock: it.product.stock,
              imageUrl: it.product.imageUrl ?? undefined,
              category: it.product.category ?? undefined,
            }
          : undefined,
      })),
    };
  }
  @Delete('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Supprimer toutes les commandes et leurs items pour un utilisateur',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: "ID de l'utilisateur",
  })
  @ApiOkResponse({
    description: 'Compte des commandes et items supprimés',
    schema: {
      type: 'object',
      properties: {
        itemsDeleted: { type: 'number' },
        ordersDeleted: { type: 'number' },
      },
    },
  })
  async deleteAllOrdersForUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ itemsDeleted: number; ordersDeleted: number }> {
    return await this.orderService.deleteAllForUser(userId);
  }
}
