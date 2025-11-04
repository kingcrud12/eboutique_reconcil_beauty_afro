import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { STRIPE_CLIENT } from './stripe.provider';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import Stripe from 'stripe';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: PrismaService;
  let stripeClient: Stripe;

  const mockOrder = {
    id: 1,
    total: 29.99,
    status: 'pending',
    userId: 1,
    paymentIntentId: null,
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        unitPrice: 14.99,
        product: {
          id: 1,
          name: 'Test Product',
          price: 14.99,
        },
      },
    ],
  };

  const mockSlot = {
    id: 1,
    price: 50.00,
    status: 'available',
    userId: 1,
    serviceId: 1,
  };

  const mockPaymentIntent = {
    id: 'pi_test123',
    client_secret: 'pi_test123_secret',
    amount: 2999,
    currency: 'eur',
    status: 'requires_payment_method',
  };

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    slot: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStripeClient = {
    paymentIntents: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: STRIPE_CLIENT,
          useValue: mockStripeClient,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeClient = module.get<Stripe>(STRIPE_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockStripeClient.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        paymentIntentId: 'pi_test123',
      });

      const result = await service.createPaymentIntent(1, 1);

      expect(result).toEqual(mockPaymentIntent);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: { include: { product: true } } },
      });
      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
        {
          amount: 2999,
          currency: 'eur',
          metadata: { orderId: '1', userId: '1' },
          automatic_payment_methods: { enabled: true },
        },
        { idempotencyKey: 'order:1' },
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.createPaymentIntent(999, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createPaymentIntent(999, 1)).rejects.toThrow(
        'Commande introuvable',
      );
    });

    it('should throw ForbiddenException when user does not own order', async () => {
      const otherUserOrder = { ...mockOrder, userId: 2 };
      mockPrismaService.order.findUnique.mockResolvedValue(otherUserOrder);

      await expect(service.createPaymentIntent(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createPaymentIntent(1, 1)).rejects.toThrow(
        'Commande non autorisée',
      );
    });

    it('should throw ForbiddenException when order is not pending', async () => {
      const paidOrder = { ...mockOrder, status: 'paid' };
      mockPrismaService.order.findUnique.mockResolvedValue(paidOrder);

      await expect(service.createPaymentIntent(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createPaymentIntent(1, 1)).rejects.toThrow(
        'Commande déjà payée ou invalide',
      );
    });

    it('should not update paymentIntentId if already exists', async () => {
      const orderWithPaymentIntent = {
        ...mockOrder,
        paymentIntentId: 'existing_pi',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(orderWithPaymentIntent);
      mockStripeClient.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(1, 1);

      expect(result).toEqual(mockPaymentIntent);
      expect(mockPrismaService.order.update).not.toHaveBeenCalled();
    });
  });

  describe('createSlotPaymentIntent', () => {
    it('should create slot payment intent successfully', async () => {
      mockPrismaService.slot.findUnique.mockResolvedValue(mockSlot);
      mockStripeClient.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      mockPrismaService.slot.update.mockResolvedValue({
        ...mockSlot,
        paymentIntentId: 'pi_test123',
      });

      const result = await service.createSlotPaymentIntent(1, 1);

      expect(result).toEqual(mockPaymentIntent);
      expect(mockPrismaService.slot.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
        {
          amount: 5000,
          currency: 'eur',
          metadata: { slotId: '1', userId: '1' },
          automatic_payment_methods: { enabled: true },
        },
        { idempotencyKey: 'slot:1' },
      );
    });

    it('should throw NotFoundException when slot not found', async () => {
      mockPrismaService.slot.findUnique.mockResolvedValue(null);

      await expect(service.createSlotPaymentIntent(999, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createSlotPaymentIntent(999, 1)).rejects.toThrow(
        'Créneau introuvable',
      );
    });

    it('should throw ForbiddenException when user does not own slot', async () => {
      const otherUserSlot = { ...mockSlot, userId: 2 };
      mockPrismaService.slot.findUnique.mockResolvedValue(otherUserSlot);

      await expect(service.createSlotPaymentIntent(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createSlotPaymentIntent(1, 1)).rejects.toThrow(
        'Créneau non autorisé',
      );
    });

    it('should throw ForbiddenException when slot is not available', async () => {
      const unavailableSlot = { ...mockSlot, status: 'booked' };
      mockPrismaService.slot.findUnique.mockResolvedValue(unavailableSlot);

      await expect(service.createSlotPaymentIntent(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createSlotPaymentIntent(1, 1)).rejects.toThrow(
        'Créneau non disponible',
      );
    });
  });
});
