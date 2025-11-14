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

    // ⚠️ Désormais on se base sur le total stocké (incluant shippingFee)
    const amountCents = Math.round(Number(order.total) * 100);

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
  async createSlotCheckout(slotId: number) {
    const slot = await this.prisma.slot.findUnique({
      where: { id: slotId },
      include: { service: true },
    });

    if (!slot) throw new NotFoundException('Créneau introuvable');
    if (slot.status !== SlotStatus.open)
      throw new ForbiddenException('Ce créneau n’est pas disponible');

    const depositAmount = Math.round(Number(slot.service.price) * 0.3 * 100);

    const FRONTEND_URL_SLOT = process.env.FRONTEND_URL_SLOT;
    if (!FRONTEND_URL_SLOT) {
      throw new Error(
        'FRONTEND_URL manquant dans les variables d’environnement',
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      // ✅ on laisse Stripe collecter l’email
      // customer_email: undefined,

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

      // ✅ on garde le slotId (plus de userId)
      metadata: {
        slotId: String(slot.id),
      },

      // ✅ succès: comme avant (ou adapte si besoin)
      success_url: `${FRONTEND_URL_SLOT}/checkout/success/slot?session_id={CHECKOUT_SESSION_ID}`,

      // ✅ abandon: redirige vers la page publique demandée
      cancel_url: `https://eboutique-reconcil-beauty-afro.vercel.app/appointment`,
    });

    await this.prisma.slot.update({
      where: { id: slot.id },
      data: { paymentIntentId: session.payment_intent as string },
    });

    return { url: session.url };
  }
}
