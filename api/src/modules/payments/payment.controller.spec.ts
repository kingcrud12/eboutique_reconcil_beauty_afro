import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { STRIPE_CLIENT } from './stripe.provider';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import Stripe from 'stripe';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;
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

  const mockPaymentIntent = {
    id: 'pi_test123',
    client_secret: 'pi_test123_secret',
    amount: 2999,
    currency: 'eur',
    status: 'requires_payment_method',
  };

  const mockPaymentService = {
    createPaymentIntent: jest.fn(),
    createSlotPaymentIntent: jest.fn(),
  };

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
    },
    slot: {
      findUnique: jest.fn(),
    },
  };

  const mockStripeClient = {
    paymentIntents: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
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

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeClient = module.get<Stripe>(STRIPE_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const createPaymentIntentDto = {
        orderId: 1,
        userId: 1,
      };

      mockPaymentService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);

      const result = await controller.createPaymentIntent(
        mockRequest,
        createPaymentIntentDto,
      );

      expect(result).toEqual(mockPaymentIntent);
      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('createSlotPaymentIntent', () => {
    it('should create slot payment intent successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const createSlotPaymentIntentDto = {
        slotId: 1,
        userId: 1,
      };

      mockPaymentService.createSlotPaymentIntent.mockResolvedValue(mockPaymentIntent);

      const result = await controller.createSlotPaymentIntent(
        mockRequest,
        createSlotPaymentIntentDto,
      );

      expect(result).toEqual(mockPaymentIntent);
      expect(mockPaymentService.createSlotPaymentIntent).toHaveBeenCalledWith(1, 1);
    });
  });
});
