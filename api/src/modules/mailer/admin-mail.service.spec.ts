import { Test, TestingModule } from '@nestjs/testing';
import { AdminMailService } from './admin-mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminMailService', () => {
  let service: AdminMailService;
  let mailerService: MailerService;
  let prismaService: PrismaService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminMailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminMailService>(AdminMailService);
    mailerService = module.get<MailerService>(MailerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOrderPaidToAdmins', () => {
    it('should send order paid email to admins for HOME delivery', async () => {
      const orderContext = {
        orderId: 123,
        customerFirstName: 'John',
        customerLastName: 'Doe',
        deliveryMode: 'HOME' as const,
        deliveryAddress: '123 Test Street, Paris',
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            unitPrice: 14.99,
            lineTotal: 29.98,
          },
        ],
        itemsSubtotal: 29.98,
        shippingFee: 5.99,
        total: 35.97,
        phone: '1234567890',
        adress: '123 Test Street, Paris',
      };

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendOrderPaidToAdmins(orderContext);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'reconcilafrobeauty@gmail.com',
        subject: 'Nouvelle commande payée #123',
        template: 'admin-order-paid',
        context: {
          ...orderContext,
          etaDays: 4,
        },
      });
    });

    it('should send order paid email to admins for RELAY delivery', async () => {
      const orderContext = {
        orderId: 123,
        customerFirstName: 'John',
        customerLastName: 'Doe',
        deliveryMode: 'RELAY' as const,
        relayLabel: 'Test Point Relais',
        relayAddress: '123 Relay Street, Paris',
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            unitPrice: 14.99,
            lineTotal: 29.98,
          },
        ],
        itemsSubtotal: 29.98,
        shippingFee: 4.99,
        total: 34.97,
        phone: '1234567890',
        adress: '123 Test Street, Paris',
      };

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendOrderPaidToAdmins(orderContext);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'reconcilafrobeauty@gmail.com',
        subject: 'Nouvelle commande payée #123',
        template: 'admin-order-paid',
        context: {
          ...orderContext,
          etaDays: 4,
        },
      });
    });
  });

  describe('estimateDays', () => {
    it('should return 4 days for HOME delivery', () => {
      const result = service['estimateDays']('HOME');
      expect(result).toBe(4);
    });

    it('should return 4 days for RELAY delivery', () => {
      const result = service['estimateDays']('RELAY');
      expect(result).toBe(4);
    });
  });
});
