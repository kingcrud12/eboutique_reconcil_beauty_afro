// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from '../mailer/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminMailService } from './admin-mail.service';

@Module({
  imports: [MailerModule],
  providers: [MailService, AdminMailService],
  exports: [MailService, AdminMailService],
})
export class MailModule {}
