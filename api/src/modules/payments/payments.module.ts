// src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeProvider } from './stripe.provider';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { MailModule } from '../mailer/mail.module';
import { StripeEventCleanupService } from './stripe-event.cleanup.service';

@Module({
  imports: [MailModule],
  providers: [
    PrismaService,
    StripeProvider,
    PaymentService,
    StripeEventCleanupService,
  ],
  exports: [PaymentService],
  controllers: [PaymentController, StripeWebhookController],
})
export class PaymentsModule {}
