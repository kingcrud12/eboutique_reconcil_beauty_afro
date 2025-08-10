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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from '../Services/order.service';
import { OrderDto } from '../Models/order.dto';
import { CreateOrderDto } from '../Models/order.dto';

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

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer les commandes du client' })
  @ApiOkResponse({ description: 'Liste des commandes', type: [OrderDto] })
  async getOrders(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<OrderDto[]> {
    return await this.orderService.getOrders(userId);
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
}
