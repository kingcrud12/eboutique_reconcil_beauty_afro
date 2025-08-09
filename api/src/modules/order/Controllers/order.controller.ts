import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
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
}
