// src/modules/payments/stripe-event.cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // ✅ import correct et typé
import { PrismaService } from '../../prisma/prisma.service';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

@Injectable()
export class StripeEventCleanupService {
  private readonly logger = new Logger(StripeEventCleanupService.name);

  private readonly keepProcessedDays = Number(
    process.env.STRIPE_EVENT_RETENTION_DAYS ?? 7,
  );
  private readonly keepErrorDays = Number(
    process.env.STRIPE_EVENT_ERROR_RETENTION_DAYS ?? 30,
  );
  private readonly batchSize = Number(
    process.env.STRIPE_EVENT_DELETE_BATCH ?? 1000,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nettoyage périodique des événements Stripe.
   * NB: ajuste l’expression CRON si tu préfères un autre rythme.
   */
  @Cron(CronExpression.EVERY_HOUR) // ✅ plus d'erreur ESLint/TS
  async purgeOldEvents(): Promise<void> {
    // ⚠️ Adapte le champ temporel à TON schéma.
    // Si ta table a "createdAt" (cas le plus courant), on l’utilise.
    // Si tu as "receivedAt", remplace "createdAt" par "receivedAt" dans les deux blocs.
    const processedBefore = daysAgo(this.keepProcessedDays);
    const errorBefore = daysAgo(this.keepErrorDays);

    let totalProcessed = 0;
    while (true) {
      const ids = await this.prisma.stripeEvent.findMany({
        where: {
          status: 'processed',
          // ⬇️ utilise "createdAt" si c’est ce que tu as dans Prisma
          createdAt: { lt: processedBefore },
        },
        select: { id: true },
        take: this.batchSize,
      });
      if (ids.length === 0) break;

      await this.prisma.stripeEvent.deleteMany({
        where: { id: { in: ids.map((i) => i.id) } },
      });
      totalProcessed += ids.length;

      if (ids.length < this.batchSize) break;
    }

    let totalErrors = 0;
    while (true) {
      const ids = await this.prisma.stripeEvent.findMany({
        where: {
          status: 'error',
          createdAt: { lt: errorBefore }, // ⬅️ idem
        },
        select: { id: true },
        take: this.batchSize,
      });
      if (ids.length === 0) break;

      await this.prisma.stripeEvent.deleteMany({
        where: { id: { in: ids.map((i) => i.id) } },
      });
      totalErrors += ids.length;

      if (ids.length < this.batchSize) break;
    }

    if (totalProcessed || totalErrors) {
      this.logger.log(
        `StripeEvent cleanup: deleted processed=${totalProcessed}, error=${totalErrors}`,
      );
    }
  }
}
