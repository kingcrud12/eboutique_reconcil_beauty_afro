// src/contact/contact.module.ts
import { Module } from '@nestjs/common';
import { ContactService } from './service/contact.service';
import { ContactController } from './controller/contact.controller';
import { MailModule } from '../mailer/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
