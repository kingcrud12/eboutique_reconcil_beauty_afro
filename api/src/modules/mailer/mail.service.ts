import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(to: string, token: string) {
    const confirmUrl = `https://eboutique-reconcil-beauty-afro.vercel.app/confirm-account?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Confirmez votre compte',
      template: 'confirm',
      context: {
        url: confirmUrl,
      },
    });
  }
  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `https://eboutique-reconcil-beauty-afro.vercel.app/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'reset-password',
      context: {
        url: resetUrl,
        year: new Date().getFullYear(),
      },
    });
  }
}
