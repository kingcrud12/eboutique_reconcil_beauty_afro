import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;
  let mailerService: MailerService;
  let prismaService: PrismaService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
  };

  const mockAdmins = [
    { id: 1, email: 'admin1@example.com' },
    { id: 2, email: 'admin2@example.com' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
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

    service = module.get<ContactService>(ContactService);
    mailerService = module.get<MailerService>(MailerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendContactMessage', () => {
    it('should send contact message to admins successfully', async () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const message = 'Hello, I have a question about your products.';

      mockPrismaService.user.findMany.mockResolvedValue(mockAdmins);
      mockMailerService.sendMail.mockResolvedValue(undefined);

      const result = await service.sendContactMessage(name, email, message);

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: 'admin' },
        select: { email: true, id: true },
      });
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: ['admin1@example.com', 'admin2@example.com'],
        subject: `Nouveau message de contact — ${name}`,
        template: 'contact',
        context: {
          name,
          email,
          message,
          receivedAt: expect.any(String),
        },
      });
    });

    it('should return success with info when no admins found', async () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const message = 'Hello, I have a question about your products.';

      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.sendContactMessage(name, email, message);

      expect(result).toEqual({
        success: true,
        info: 'Aucun administrateur trouvé.',
      });
      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should filter out admins with null emails', async () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const message = 'Hello, I have a question about your products.';

      const adminsWithNullEmail = [
        { id: 1, email: 'admin1@example.com' },
        { id: 2, email: null },
        { id: 3, email: 'admin3@example.com' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(adminsWithNullEmail);
      mockMailerService.sendMail.mockResolvedValue(undefined);

      const result = await service.sendContactMessage(name, email, message);

      expect(result).toEqual({ success: true });
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: ['admin1@example.com', 'admin3@example.com'],
        subject: `Nouveau message de contact — ${name}`,
        template: 'contact',
        context: {
          name,
          email,
          message,
          receivedAt: expect.any(String),
        },
      });
    });

    it('should return error when mail sending fails', async () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const message = 'Hello, I have a question about your products.';

      mockPrismaService.user.findMany.mockResolvedValue(mockAdmins);
      mockMailerService.sendMail.mockRejectedValue(new Error('Mail service error'));

      const result = await service.sendContactMessage(name, email, message);

      expect(result).toEqual({
        success: false,
        error: 'Failed to send mail',
      });
    });

    it('should handle empty admin emails array', async () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const message = 'Hello, I have a question about your products.';

      const adminsWithEmptyEmails = [
        { id: 1, email: null },
        { id: 2, email: '' },
        { id: 3, email: undefined },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(adminsWithEmptyEmails);

      const result = await service.sendContactMessage(name, email, message);

      expect(result).toEqual({
        success: true,
        info: 'Aucun administrateur trouvé.',
      });
      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });
  });
});

