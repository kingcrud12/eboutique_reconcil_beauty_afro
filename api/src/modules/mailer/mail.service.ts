import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type DeliveryMode = 'EXPRESS' | 'HOME' | 'RELAY';

interface OrderItemCtx {
  name: string;
  quantity: number;
  unitPrice: string; // formaté en "xx.yy"
  lineTotal: string; // formaté en "xx.yy"
}

interface OrderMailContext {
  orderId: number | string;
  customerFirstName?: string;
  customerLastName?: string;
  deliveryMode: DeliveryMode;
  deliveryAddress?: string;
  relayLabel?: string;
  relayAddress?: string;
  etaDays?: number;

  items: OrderItemCtx[];
  itemsSubtotal: string; // formaté
  shippingFee: string; // formaté
  total: string; // formaté
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(to: string, token: string) {
    const confirmUrl = `https://eboutique-reconcil-beauty-afro.vercel.app/confirm-account?token=${token}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Confirmez votre compte',
      template: 'confirm',
      context: { url: confirmUrl },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `https://eboutique-reconcil-beauty-afro.vercel.app/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'reset-password',
      context: { url: resetUrl, year: new Date().getFullYear() },
    });
  }

  private estimateDays(mode: DeliveryMode): number {
    switch (mode) {
      case 'EXPRESS':
        return 2;
      case 'HOME':
      case 'RELAY':
      default:
        return 4;
    }
  }

  async sendOrderPaidEmail(to: string, ctx: Omit<OrderMailContext, 'etaDays'>) {
    const etaDays = this.estimateDays(ctx.deliveryMode);

    // format des montants
    const itemsFormatted = ctx.items.map((it) => ({
      ...it,
      unitPrice: isNaN(Number(it.unitPrice))
        ? '0.00'
        : Number(it.unitPrice).toFixed(2),
      lineTotal: isNaN(Number(it.lineTotal))
        ? '0.00'
        : Number(it.lineTotal).toFixed(2),
    }));
    const itemsSubtotal = isNaN(Number(ctx.itemsSubtotal))
      ? '0.00'
      : Number(ctx.itemsSubtotal).toFixed(2);

    const shippingFee = isNaN(Number(ctx.shippingFee))
      ? '0.00'
      : Number(ctx.shippingFee).toFixed(2);

    const total = isNaN(Number(ctx.total))
      ? '0.00'
      : Number(ctx.total).toFixed(2);

    await this.mailerService.sendMail({
      to,
      subject: `Votre paiement est confirmé – commande #${ctx.orderId}`,
      template: 'order-paid',
      context: {
        ...ctx,
        etaDays,
        items: itemsFormatted,
        itemsSubtotal,
        shippingFee,
        total,
      },
    });
  }

  async sendSlotBookedEmail(
    to: string,
    ctx: {
      serviceName: string;
      startAtLocal: string;
      endAtLocal: string;
      depositAmountEUR: number;
    },
  ) {
    await this.mailerService.sendMail({
      to,
      subject: `Réservation confirmée – ${ctx.serviceName}`,
      template: 'slot-booked',
      context: { ...ctx, depositAmountEUR: ctx.depositAmountEUR.toFixed(2) },
    });
  }
}
