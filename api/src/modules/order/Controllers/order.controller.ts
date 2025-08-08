import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
}
