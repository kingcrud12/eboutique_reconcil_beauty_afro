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
import { SlotStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  /**
   * Paiement d'une commande classique
   */
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

  /**
   * Paiement de l'acompte pour un slot
   */
  async createSlotCheckout(slotId: number, userId: number) {
    const slot = await this.prisma.slot.findUnique({
      where: { id: slotId },
      include: { service: true },
    });

    if (!slot) throw new NotFoundException('Créneau introuvable');
    if (slot.status !== SlotStatus.open)
      throw new ForbiddenException('Ce créneau n’est pas disponible');

    // Calcul acompte 30%
    const depositAmount = Math.round(Number(slot.service.price) * 0.3 * 100);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${slot.service.name} - Acompte réservation`,
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        slotId: String(slot.id),
        userId: String(userId),
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    // Sauvegarde de l'identifiant Stripe dans le slot
    await this.prisma.slot.update({
      where: { id: slot.id },
      data: { paymentIntentId: session.payment_intent as string },
    });

    return { url: session.url };
  }
}
