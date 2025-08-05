// cart.module.ts
import { Module } from '@nestjs/common';
import { CartService } from '../cart/Services/cart.service';
import { CartController } from '../cart/Controllers/cart.controller';

@Module({
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
