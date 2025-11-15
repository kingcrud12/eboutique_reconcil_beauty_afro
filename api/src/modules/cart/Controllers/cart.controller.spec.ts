import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from '../Services/cart.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import { CreateCartDto, UpdateCartDto } from '../Models/cart.dto';
import { ICart, ICartCreate } from '../Interfaces/cart.interface';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;
  let prismaService: PrismaService;

  const mockCart: ICart = {
    id: 1,
    userId: 1,
    createdAt: new Date(),
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 10.99,
          stock: 100,
          weight: 0.5,
          imageUrl: 'test.jpg',
          category: 'test',
        },
      },
    ],
  };

  const mockCartService = {
    create: jest.fn(),
    getCartById: jest.fn(),
    getCartsByUser: jest.fn(),
    updateCart: jest.fn(),
    deleteCart: jest.fn(),
  };

  const mockPrismaService = {
    guest: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cart: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a cart successfully', async () => {
      const createCartDto: CreateCartDto = {
        userId: 1,
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      mockCartService.create.mockResolvedValue(mockCart);

      const result = await controller.create(createCartDto);

      expect(result).toEqual(mockCart);
      expect(mockCartService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 1,
              quantity: 2,
            }),
          ]),
        }),
      );
    });

    it('should throw HttpException when cart creation fails', async () => {
      const createCartDto: CreateCartDto = {
        userId: 1,
        items: [],
      };

      mockCartService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createCartDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.create(createCartDto)).rejects.toThrow(
        'Erreur lors de la création du panier',
      );
    });
  });

  describe('getUserCarts', () => {
    it('should return user carts successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockCartService.getCartsByUser.mockResolvedValue([mockCart]);

      const result = await controller.getUserCarts(mockRequest);

      expect(result).toEqual([mockCart]);
      expect(mockCartService.getCartsByUser).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no carts found', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockCartService.getCartsByUser.mockResolvedValue(null);

      const result = await controller.getUserCarts(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update cart successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const updateCartDto: UpdateCartDto = {
        items: [
          {
            productId: 1,
            quantity: 3,
          },
        ],
      };

      mockCartService.getCartById.mockResolvedValue(mockCart);
      mockCartService.updateCart.mockResolvedValue(mockCart);

      const result = await controller.update(mockRequest, 1, updateCartDto);

      expect(result).toEqual(mockCart);
      expect(mockCartService.getCartById).toHaveBeenCalledWith(1);
      expect(mockCartService.updateCart).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should throw HttpException when cart not found', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const updateCartDto: UpdateCartDto = { items: [] };

      mockCartService.getCartById.mockResolvedValue(null);

      await expect(controller.update(mockRequest, 1, updateCartDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.update(mockRequest, 1, updateCartDto)).rejects.toThrow(
        'Panier introuvable',
      );
    });

    it('should throw HttpException when user does not own cart', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 2 },
      } as JwtRequest;

      const updateCartDto: UpdateCartDto = { items: [] };

      mockCartService.getCartById.mockResolvedValue(mockCart);

      await expect(controller.update(mockRequest, 1, updateCartDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.update(mockRequest, 1, updateCartDto)).rejects.toThrow(
        'Accès interdit à ce panier',
      );
    });
  });

  describe('delete', () => {
    it('should delete cart successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockCartService.getCartById.mockResolvedValue(mockCart);
      mockCartService.deleteCart.mockResolvedValue(mockCart);

      const result = await controller.delete(mockRequest, 1);

      expect(result).toEqual(mockCart);
      expect(mockCartService.deleteCart).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when cart not found', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockCartService.getCartById.mockResolvedValue(null);

      await expect(controller.delete(mockRequest, 1)).rejects.toThrow(HttpException);
      await expect(controller.delete(mockRequest, 1)).rejects.toThrow(
        'Panier introuvable',
      );
    });
  });

  describe('get', () => {
    it('should return cart by id', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockCartService.getCartById.mockResolvedValue(mockCart);

      const result = await controller.get(mockRequest, 1);

      expect(result).toEqual(mockCart);
      expect(mockCartService.getCartById).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when cart not found', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockCartService.getCartById.mockResolvedValue(null);

      await expect(controller.get(mockRequest, 1)).rejects.toThrow(HttpException);
      await expect(controller.get(mockRequest, 1)).rejects.toThrow(
        'Panier introuvable',
      );
    });
  });

  describe('createGuestCart', () => {
    it('should create guest cart successfully', async () => {
      const uuid = 'test-uuid';
      const data = {
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      const mockGuest = { id: 1, uuid };
      const mockCart = { id: 1, guestId: 1 };

      mockPrismaService.guest.findUnique.mockResolvedValue(mockGuest);
      mockCartService.create.mockResolvedValue(mockCart);

      const result = await controller.createGuestCart(uuid, data);

      expect(result).toEqual(mockCart);
      expect(mockPrismaService.guest.findUnique).toHaveBeenCalledWith({
        where: { uuid },
      });
    });

    it('should create guest if not exists', async () => {
      const uuid = 'test-uuid';
      const data = { items: [] };

      const mockGuest = { id: 1, uuid };
      const mockCart = { id: 1, guestId: 1 };

      mockPrismaService.guest.findUnique.mockResolvedValue(null);
      mockPrismaService.guest.create.mockResolvedValue(mockGuest);
      mockCartService.create.mockResolvedValue(mockCart);

      const result = await controller.createGuestCart(uuid, data);

      expect(result).toEqual(mockCart);
      expect(mockPrismaService.guest.create).toHaveBeenCalledWith({
        data: { uuid },
      });
    });
  });

  describe('updateGuestCart', () => {
    it('should update guest cart successfully', async () => {
      const uuid = 'test-uuid';
      const data: UpdateCartDto = {
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      const mockGuest = { id: 1, uuid };
      const mockCart = { id: 1, guestId: 1 };

      mockPrismaService.guest.findUnique.mockResolvedValue(mockGuest);
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockCartService.updateCart.mockResolvedValue(mockCart);

      const result = await controller.updateGuestCart(uuid, data);

      expect(result).toEqual(mockCart);
      expect(mockCartService.updateCart).toHaveBeenCalledWith(mockCart.id, data);
    });

    it('should handle guest creation error with P2002 code', async () => {
      const uuid = 'test-uuid';
      const data: UpdateCartDto = { items: [] };

      const mockGuest = { id: 1, uuid };
      const mockCart = { id: 1, guestId: 1 };

      mockPrismaService.guest.findUnique.mockResolvedValue(null);
      mockPrismaService.guest.create.mockRejectedValue({ code: 'P2002' });
      mockPrismaService.guest.findUnique.mockResolvedValueOnce(mockGuest);
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockCartService.updateCart.mockResolvedValue(mockCart);

      const result = await controller.updateGuestCart(uuid, data);

      expect(result).toEqual(mockCart);
    });

    it('should throw HttpException on error', async () => {
      const uuid = 'test-uuid';
      const data: UpdateCartDto = { items: [] };

      mockPrismaService.guest.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(controller.updateGuestCart(uuid, data)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.updateGuestCart(uuid, data)).rejects.toThrow(
        'Erreur lors de la mise à jour du panier guest',
      );
    });
  });
});

