// src/modules/payments/payment.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './stripe.provider';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe, // ✅ OK
  ) {}

  async createPaymentIntent(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId)
      throw new ForbiddenException('Commande non autorisée');
    if (order.status !== 'pending')
      throw new ForbiddenException('Commande déjà payée ou invalide');

    const amountCents = order.items.reduce((sum, it) => {
      const unit = Number(it.unitPrice);
      return sum + Math.round(unit * 100) * it.quantity;
    }, 0);

    const pi = await this.stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: 'eur',
        metadata: { orderId: String(order.id), userId: String(userId) },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `order:${order.id}` },
    );

    if (!order.paymentIntentId) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: pi.id },
      });
    }

    return { clientSecret: pi.client_secret, paymentIntentId: pi.id };
  }
}
