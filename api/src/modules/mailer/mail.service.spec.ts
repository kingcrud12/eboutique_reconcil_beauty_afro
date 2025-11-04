import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email successfully', async () => {
      const to = 'test@example.com';
      const token = 'confirmation-token-123';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendConfirmationEmail(to, token);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Confirmez votre compte',
        template: 'confirm',
        context: {
          url: `https://eboutique-reconcil-beauty-afro.vercel.app/confirm-account?token=${token}`,
        },
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const to = 'test@example.com';
      const token = 'reset-token-123';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendPasswordResetEmail(to, token);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Réinitialisation de votre mot de passe',
        template: 'reset-password',
        context: {
          url: `https://eboutique-reconcil-beauty-afro.vercel.app/reset-password?token=${token}`,
          year: new Date().getFullYear(),
        },
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendWelcomeEmail(user);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: user.email,
        subject: 'Bienvenue chez Reconcil\'Afro Beauty',
        template: 'welcome',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          year: new Date().getFullYear(),
        },
      });
    });
  });

  describe('sendOrderConfirmationEmail', () => {
    it('should send order confirmation email for HOME delivery', async () => {
      const to = 'test@example.com';
      const orderContext = {
        orderId: 123,
        customerFirstName: 'John',
        customerLastName: 'Doe',
        deliveryMode: 'HOME' as const,
        deliveryAddress: '123 Test Street, Paris',
        etaDays: 4,
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            unitPrice: '14.99',
            lineTotal: '29.98',
          },
        ],
        itemsSubtotal: '29.98',
        shippingFee: '5.99',
        total: '35.97',
      };

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendOrderConfirmationEmail(to, orderContext);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Confirmation de commande #123',
        template: 'order-confirmation',
        context: orderContext,
      });
    });

    it('should send order confirmation email for RELAY delivery', async () => {
      const to = 'test@example.com';
      const orderContext = {
        orderId: 123,
        customerFirstName: 'John',
        customerLastName: 'Doe',
        deliveryMode: 'RELAY' as const,
        relayLabel: 'Test Point Relais',
        relayAddress: '123 Relay Street, Paris',
        etaDays: 4,
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            unitPrice: '14.99',
            lineTotal: '29.98',
          },
        ],
        itemsSubtotal: '29.98',
        shippingFee: '4.99',
        total: '34.97',
      };

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendOrderConfirmationEmail(to, orderContext);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Confirmation de commande #123',
        template: 'order-confirmation',
        context: orderContext,
      });
    });
  });
});
