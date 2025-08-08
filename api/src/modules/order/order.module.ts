import { Module } from '@nestjs/common';
import { OrderController } from './Controllers/order.controller';
import { OrderService } from './Services/order.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
  exports: [OrderService],
})
export class OrderModule {}
