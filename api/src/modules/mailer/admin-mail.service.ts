import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma/prisma.service';

type DeliveryMode = 'EXPRESS' | 'HOME' | 'RELAY';

interface OrderItemCtx {
  name: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
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
  itemsSubtotal: number | string;
  shippingFee: number | string;
  total: number | string;

  // possibilité de passer directement phone / adress depuis le webhook
  phone?: string | null;
  adress?: string | null;
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

    // --- Résolution phone/adress : préférer ctx, sinon lire en DB ---
    let resolvedPhone: string | null = ctx.phone ?? null;
    let resolvedAdress: string | null = ctx.adress ?? null;

    if ((resolvedPhone === null || resolvedAdress === null) && ctx.orderId) {
      const orderIdNum = Number(ctx.orderId);
      if (!Number.isNaN(orderIdNum)) {
        const order = await this.prisma.order.findUnique({
          where: { id: orderIdNum },
          select: { userId: true },
        });

        if (order?.userId) {
          const user = await this.prisma.user.findUnique({
            where: { id: order.userId },
            select: { phone: true, adress: true },
          });
          if (user) {
            if (resolvedPhone === null)
              resolvedPhone = (user.phone as string) ?? null;
            if (resolvedAdress === null) resolvedAdress = user.adress ?? null;
          }
        }
      }
    }
    // ---------------------------------------------------------------

    // formater les montants en string "xx.xx"
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
        phone: resolvedPhone,
        adress: resolvedAdress,
        etaDays,
        items,
        itemsSubtotal,
        shippingFee,
        total,
      },
    });
  }
}
