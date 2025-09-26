import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma/prisma.service';

type DeliveryMode = 'EXPRESS' | 'HOME' | 'RELAY';

interface OrderItemCtx {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
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
    private readonly prisma: PrismaService, // ✅ injection de Prisma
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

    await this.mailerService.sendMail({
      to: adminEmails,
      subject: `Nouvelle commande payée #${ctx.orderId}`,
      template: 'order-paid-admin', // créer un template dédié
      context: { ...ctx, etaDays },
    });
  }
}
