import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  async sendContactMessage(name: string, email: string, message: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true, id: true },
    });

    const adminEmails = admins.map((a) => a.email).filter(Boolean);

    if (adminEmails.length === 0) {
      this.logger.warn(
        'Aucun admin trouvé pour recevoir le message de contact.',
      );
      return { success: true, info: 'Aucun administrateur trouvé.' };
    }

    try {
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: `Nouveau message de contact — ${name}`,
        template: 'contact',
        context: {
          name,
          email,
          message,
          receivedAt: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Message de contact envoyé aux admins (${adminEmails.length})`,
      );
      return { success: true };
    } catch (err) {
      this.logger.error('Erreur envoi mail contact', err as Error);
      return { success: false, error: 'Failed to send mail' };
    }
  }
}
