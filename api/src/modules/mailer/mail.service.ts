// src/mailer/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type deliveryMode = 'EXPRESS' | 'HOME' | 'RELAY';

interface OrderItemCtx {
  name: string;
  quantity: number;
  unitPrice: number; // en €
  shippingFee: number; // en €
  lineTotal: number; // en €
}

interface OrderMailContext {
  orderId: number | string;
  customerFirstName?: string;
  customerLastName?: string;
  deliveryMode: deliveryMode;
  shippingFee: number; // en €
  deliveryAddress?: string; // si livraison à domicile
  relayLabel?: string; // si point relais
  relayAddress?: string; // si point relais
  etaDays: number;
  items: OrderItemCtx[];
  total: number; // en €
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

  private estimateDays(mode: deliveryMode): number {
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
    await this.mailerService.sendMail({
      to,
      subject: `Votre paiement est confirmé – commande #${ctx.orderId}`,
      template: 'order-paid', // src/templates/order-paid.hbs
      context: { ...ctx, etaDays },
    });
  }

  async sendSlotBookedEmail(
    to: string,
    ctx: {
      serviceName: string;
      startAtLocal: string; // ex: "vendredi 15 août 2025 à 11:30"
      endAtLocal: string; // ex: "vendredi 15 août 2025 à 12:30"
      depositAmountEUR: number; // 13.5
    },
  ) {
    await this.mailerService.sendMail({
      to,
      subject: `Réservation confirmée – ${ctx.serviceName}`,
      template: 'slot-booked', // src/templates/slot-booked.hbs
      context: ctx,
    });
  }
}
