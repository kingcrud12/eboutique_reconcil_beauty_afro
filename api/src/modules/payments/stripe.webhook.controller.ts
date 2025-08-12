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
import { MailService } from '../../modules/mailer/mail.service'; // ✅ AJOUT

type StripeRawRequest = Request & { rawBody: Buffer };
type DeliveryMode = 'EXPRESS' | 'HOME' | 'RELAY';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService, // ✅ AJOUT
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret)
      throw new BadRequestException('Missing STRIPE_WEBHOOK_SECRET');
    if (!signature)
      throw new BadRequestException('Missing Stripe signature header');

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
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = Number(session.metadata?.orderId);
        const userId = Number(session.metadata?.userId);
        if (!orderId || !userId) break;

        // On récupérera la commande complète pour le mail après la transaction
        let fullOrder:
          | (Awaited<ReturnType<typeof this.prisma.order.findUnique>> & {
              items: Array<{
                product?: { name?: string } | null;
                unitPrice: any;
                quantity: number;
                productId: number;
              }>;
              user?: {
                email: string | null;
                firstName?: string | null;
                lastName?: string | null;
              } | null;
            })
          | null = null;

        await this.prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: {
              user: true, // ✅ pour l'email
              items: { include: { product: true } }, // ✅ pour les libellés
            },
          });
          if (!order) throw new BadRequestException('Order not found');

          // décrément stock
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

          // statut paid
          await tx.order.update({
            where: { id: orderId },
            data: { status: 'paid' },
          });

          // vider panier
          if (order.userId) {
            const cart = await tx.cart.findFirst({
              where: { userId: order.userId },
            });
            if (cart) {
              await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
              await tx.cart.delete({ where: { id: cart.id } });
            }
          }

          fullOrder = order; // ✅ conserver pour l'email
        });

        // ✅ ENVOI DU MAIL (après la transaction)
        if (fullOrder?.user?.email) {
          const items = fullOrder.items.map((it) => {
            const unit = Number(it.unitPrice);
            const qty = it.quantity;
            return {
              name: it.product?.name ?? `Produit #${it.productId}`,
              quantity: qty,
              unitPrice: Number.isFinite(unit) ? unit : 0,
              lineTotal: Number.isFinite(unit) ? +(unit * qty).toFixed(2) : 0,
            };
          });

          await this.mailService.sendOrderPaidEmail(fullOrder.user.email, {
            orderId: fullOrder.id,
            customerFirstName: fullOrder.user.firstName ?? undefined,
            customerLastName: fullOrder.user.lastName ?? undefined,
            deliveryMode: fullOrder.deliveryMode as DeliveryMode,
            deliveryAddress: fullOrder.deliveryAddress ?? undefined, // ✅ ton modèle ne gère pas le point relais
            items,
            total:
              typeof fullOrder.total === 'number'
                ? fullOrder.total
                : Number(fullOrder.total as any) ||
                  items.reduce((s, i) => s + i.lineTotal, 0),
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        break;
      }
      default:
        break;
    }

    return { received: true };
  }
}
