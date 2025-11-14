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
import { Prisma, SlotStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AdminMailService } from '../mailer/admin-mail.service';

type StripeRawRequest = Request & { rawBody: Buffer };
type DeliveryMode = 'HOME' | 'RELAY';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly adminMailService: AdminMailService,
  ) {}

  // --- AJOUT: Helpers idempotence ---
  private async isEventProcessed(eventId: string): Promise<boolean> {
    const row = await this.prisma.stripeEvent.findUnique({
      where: { eventId },
    });
    return !!row && row.status === 'processed';
  }
  private async markProcessing(eventId: string, type: string) {
    try {
      await this.prisma.stripeEvent.create({
        data: { eventId, type, status: 'processing' },
      });
    } catch {
      // si conflit unique (déjà en BDD), on laissera la suite décider
    }
  }
  private async markProcessed(eventId: string) {
    await this.prisma.stripeEvent.update({
      where: { eventId },
      data: { status: 'processed', processedAt: new Date() },
    });
  }
  private async markError(eventId: string, err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : JSON.stringify(err);
    await this.prisma.stripeEvent.update({
      where: { eventId },
      data: { status: 'error', error: message, processedAt: new Date() },
    });
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_ORDER;
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

    // --- AJOUT: idempotence + wrap ---
    if (await this.isEventProcessed(event.id)) {
      return { received: true };
    }
    await this.markProcessing(event.id, event.type);

    try {
      // ====== TON CODE EXISTANT NE BOUGE PAS (switch) ======
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const orderId = Number(session.metadata?.orderId);
          const userId = Number(session.metadata?.userId);
          if (!orderId || !userId) break;

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
                  adress?: string | null;
                  phone?: string | null;
                } | null;
              })
            | null = null;

          await this.prisma.$transaction(
            async (tx) => {
              const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                  user: true,
                  items: { include: { product: true } },
                },
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

              fullOrder = order;
            },
            { timeout: 15000 },
          );

          if (fullOrder?.user?.email) {
            // formatage des items
            const items = fullOrder.items.map((it) => {
              const unit = Number(it.unitPrice);
              const qty = it.quantity;
              const lineTotalNum = Number.isFinite(unit) ? unit * qty : 0;
              return {
                name: it.product?.name ?? `Produit #${it.productId}`,
                quantity: qty,
                unitPrice: Number.isFinite(unit) ? unit.toFixed(2) : '0.00', // string
                lineTotal: lineTotalNum.toFixed(2), // string
              };
            });

            // calcul du sous-total des articles
            const itemsSubtotalNum = items.reduce(
              (s, i) => s + Number(i.lineTotal),
              0,
            );
            const itemsSubtotal = itemsSubtotalNum.toFixed(2); // string

            // shippingFee peut être Decimal | number | string | null
            const shippingFeeRaw = fullOrder.shippingFee as Decimal | number;
            const shippingFeeNum = Number(shippingFeeRaw ?? 0);
            const shippingFee = shippingFeeNum.toFixed(2); // string

            // total
            const totalRaw =
              typeof fullOrder.total === 'number'
                ? fullOrder.total
                : Number(fullOrder.total ?? 0);
            const totalNum = Number.isFinite(totalRaw)
              ? totalRaw
              : itemsSubtotalNum + shippingFeeNum;
            const total = totalNum.toFixed(2); // string

            // envoi mail client
            await this.mailService.sendOrderPaidEmail(fullOrder.user.email, {
              orderId: fullOrder.id,
              customerFirstName: fullOrder.user.firstName ?? undefined,
              customerLastName: fullOrder.user.lastName ?? undefined,
              deliveryMode: fullOrder.deliveryMode as DeliveryMode,
              deliveryAddress: fullOrder.deliveryAddress ?? undefined,
              items,
              itemsSubtotal,
              shippingFee,
              total,
            });

            // envoi mail admins
            await this.adminMailService.sendOrderPaidToAdmins({
              orderId: fullOrder.id,
              customerFirstName: fullOrder.user.firstName ?? undefined,
              customerLastName: fullOrder.user.lastName ?? undefined,
              deliveryMode: fullOrder.deliveryMode as DeliveryMode,
              deliveryAddress: fullOrder.deliveryAddress ?? undefined,
              items,
              itemsSubtotal,
              shippingFee,
              total,
              adress: fullOrder.user.adress ?? undefined,
              phone: fullOrder.user.phone ?? undefined,
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
      // ====== FIN de ton code ======

      await this.markProcessed(event.id);
    } catch (err) {
      console.error('[orders webhook] processing error', err);
      await this.markError(event.id, err);
      // ⚠️ on nève PAS d'exception => on renvoie 200 pour stopper le retry
    }

    return { received: true };
  }

  @Post('/slots')
  @HttpCode(HttpStatus.OK)
  async handleStripeSlotWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_SLOT;
    if (!webhookSecret)
      throw new BadRequestException('Missing STRIPE_SLOT_WEBHOOK_SECRET');
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

    if (await this.isEventProcessed(event.id)) {
      return { received: true };
    }
    await this.markProcessing(event.id, event.type);

    const splitName = (name?: string | null) => {
      if (!name)
        return { first: null as string | null, last: null as string | null };
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return { first: parts[0], last: null };
      return { first: parts[0], last: parts.slice(1).join(' ') };
    };

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object; // ✅ affine le type

          const slotId = session.metadata?.slotId
            ? Number(session.metadata.slotId)
            : null;
          if (!slotId) break;

          const email = session.customer_details?.email ?? null;
          const fullName = session.customer_details?.name ?? null;
          const { first: guestFirstName, last: guestLastName } =
            splitName(fullName);

          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);

          let userId: number | null = null;
          if (email) {
            const existingUser = await this.prisma.user.findUnique({
              where: { email },
              select: { id: true },
            });
            userId = existingUser?.id ?? null;
          }

          const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: { service: true, booking: true },
          });
          if (!slot) break;

          await this.prisma.$transaction(
            async (tx: Prisma.TransactionClient) => {
              // ✅ typage du tx
              // 1) Passe le slot en booked + mémorise le PI si nouveau
              if (
                slot.status !== SlotStatus.booked ||
                (paymentIntentId && slot.paymentIntentId !== paymentIntentId)
              ) {
                await tx.slot.update({
                  where: { id: slotId },
                  data: {
                    status: SlotStatus.booked,
                    ...(paymentIntentId ? { paymentIntentId } : {}),
                  },
                });
              }

              // 2) Crée la Booking si absente
              if (!slot.booking) {
                const data: Prisma.BookingCreateInput = {
                  // ✅ objet data typé
                  slot: { connect: { id: slotId } },
                  ...(userId ? { user: { connect: { id: userId } } } : {}),
                  ...(!userId && email ? { guestEmail: email } : {}),
                  ...(!userId && guestFirstName ? { guestFirstName } : {}),
                  ...(!userId && guestLastName ? { guestLastName } : {}),
                  ...(paymentIntentId ? { paymentIntentId } : {}),
                };
                await tx.booking.create({ data }); // ✅ plus d'accès “unsafe”
              }
            },
          );

          // Mail de confirmation
          if (email && slot.service) {
            const tz = process.env.MAIL_TZ ?? 'Europe/Paris';
            const df = new Intl.DateTimeFormat('fr-FR', {
              dateStyle: 'full',
              timeStyle: 'short',
              timeZone: tz,
            });

            const startAtLocal = df.format(new Date(slot.startAt));
            const endAtLocal = df.format(new Date(slot.endAt));
            const depositAmountEUR = Number(
              (Number(slot.service.price) * 0.3).toFixed(2),
            );

            await this.mailService.sendSlotBookedEmail(email, {
              serviceName: slot.service.name,
              startAtLocal,
              endAtLocal,
              depositAmountEUR,
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

      await this.markProcessed(event.id);
    } catch (err) {
      console.error('[slots webhook] processing error', err);
      await this.markError(event.id, err as Error);
    }

    return { received: true };
  }
}
