// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminMailService } from './admin-mail.service';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [MailerModule],
  providers: [MailService, AdminMailService, InvoiceService],
  exports: [MailService, AdminMailService, InvoiceService],
})
export class MailModule {}
