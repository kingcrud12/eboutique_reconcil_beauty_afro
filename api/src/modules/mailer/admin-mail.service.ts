import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma/prisma.service';

type DeliveryMode = 'EXPRESS' | 'HOME' | 'RELAY';

interface OrderItemCtx {
  name: string;
  quantity: number;
  unitPrice: number; // sera formaté en "xx.xx"
  lineTotal: number; // sera formaté en "xx.xx"
}

interface AdminOrderMailContext {
  orderId: number | string;
  customerFirstName?: string;
  customerLastName?: string;
  deliveryMode: DeliveryMode;
  deliveryAddress?: string;
  relayLabel?: string;
  relayAddress?: string;
  etaDays?: number;

  items: OrderItemCtx[];
  itemsSubtotal: number;
  shippingFee: number;
  total: number;
}

@Injectable()
export class AdminMailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

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

  async sendOrderPaidToAdmins(ctx: Omit<AdminOrderMailContext, 'etaDays'>) {
    const etaDays = this.estimateDays(ctx.deliveryMode);

    // récupérer tous les utilisateurs avec rôle 'admin'
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true },
    });

    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    if (adminEmails.length === 0) return;

    // formater les montants en "xx.xx"
    const items = ctx.items.map((it) => ({
      ...it,
      unitPrice: Number(it.unitPrice).toFixed(2),
      lineTotal: Number(it.lineTotal).toFixed(2),
    }));

    const itemsSubtotal = Number(ctx.itemsSubtotal).toFixed(2);
    const shippingFee = Number(ctx.shippingFee).toFixed(2);
    const total = Number(ctx.total).toFixed(2);

    await this.mailerService.sendMail({
      to: adminEmails,
      subject: `Nouvelle commande payée #${ctx.orderId}`,
      template: 'order-paid-admin',
      context: {
        ...ctx,
        etaDays,
        items,
        itemsSubtotal,
        shippingFee,
        total,
      },
    });
  }
}
