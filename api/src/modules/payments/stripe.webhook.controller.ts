// src/payments/stripe.webhook.controller.ts
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './stripe.provider';
import { Request } from 'express';

type StripeRawRequest = Request & { rawBody: Buffer }; // ✅ no any

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string, // may be undefined
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Missing STRIPE_WEBHOOK_SECRET');
    }
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    // ✅ Use the typed request; fallback to body (stringify) if rawBody missing
    const typedReq = req as StripeRawRequest;
    const rawBody: Buffer =
      typedReq.rawBody ?? Buffer.from(JSON.stringify(req.body));

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;

        const orderId = Number(pi.metadata?.orderId);
        const userId = Number(pi.metadata?.userId);
        if (!orderId || !userId) break;

        await this.prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
          });
          if (!order) throw new BadRequestException('Order not found');

          for (const it of order.items) {
            const prod = await tx.product.findUnique({
              where: { id: it.productId },
            });
            if (!prod || prod.stock < it.quantity) {
              throw new BadRequestException('Stock insuffisant');
            }
            await tx.product.update({
              where: { id: it.productId },
              data: { stock: prod.stock - it.quantity },
            });
          }

          await tx.order.update({
            where: { id: orderId },
            data: { status: 'paid' },
          });

          if (order.userId) {
            const cart = await tx.cart.findFirst({
              where: { userId: order.userId },
            });
            if (cart) {
              await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
              await tx.cart.delete({ where: { id: cart.id } });
            }
          }
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        // optional: log / notify
        break;
      }
      default:
        // ignore others
        break;
    }

    return { received: true };
  }
}
