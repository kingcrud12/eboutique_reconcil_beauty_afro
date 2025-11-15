import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ICart, ICartCreate, ICartCreateUpdate } from '../Interfaces/cart.interface';
import { Cart, CartItem } from '@prisma/client';

describe('CartService', () => {
  let service: CartService;
  let prismaService: PrismaService;

  const mockCart: Cart & { items: (CartItem & { product: any })[] } = {
    id: 1,
    userId: 1,
    guestId: null,
    uuid: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 1,
        cartId: 1,
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  const mockPrismaService = {
    cart: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a cart with userId', async () => {
      const cartData: ICartCreate = {
        userId: 1,
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      mockPrismaService.cart.create.mockResolvedValue(mockCart);

      const result = await service.create(cartData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          guestId: null,
          uuid: null,
          items: {
            create: [
              {
                productId: 1,
                quantity: 2,
              },
            ],
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });

    it('should create a cart with guestId', async () => {
      const cartData: ICartCreate = {
        guestId: 1,
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      mockPrismaService.cart.create.mockResolvedValue(mockCart);

      const result = await service.create(cartData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: {
          userId: null,
          guestId: 1,
          uuid: null,
          items: {
            create: [
              {
                productId: 1,
                quantity: 2,
              },
            ],
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });

    it('should return null when neither userId nor guestId provided', async () => {
      const cartData: ICartCreate = {};

      const result = await service.create(cartData);

      expect(result).toBeNull();
      expect(mockPrismaService.cart.create).not.toHaveBeenCalled();
    });

    it('should create cart without items when items array is empty', async () => {
      const cartData: ICartCreate = {
        userId: 1,
        items: [],
      };

      mockPrismaService.cart.create.mockResolvedValue(mockCart);

      const result = await service.create(cartData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          guestId: null,
          uuid: null,
          items: undefined,
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });
  });

  describe('getCartById', () => {
    it('should return cart by id', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

      const result = await service.getCartById(1);

      expect(result).toBeDefined();
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });

    it('should return null when cart not found', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      const result = await service.getCartById(999);

      expect(result).toBeNull();
    });
  });

  describe('getCarts', () => {
    it('should return all carts', async () => {
      mockPrismaService.cart.findMany.mockResolvedValue([mockCart]);

      const result = await service.getCarts();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.cart.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it('should return null when no carts found', async () => {
      mockPrismaService.cart.findMany.mockResolvedValue(null);

      const result = await service.getCarts();

      expect(result).toBeNull();
    });
  });

  describe('getCartsByUser', () => {
    it('should return user carts', async () => {
      mockPrismaService.cart.findMany.mockResolvedValue([mockCart]);

      const result = await service.getCartsByUser(1);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.cart.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it('should return null when no carts found for user', async () => {
      mockPrismaService.cart.findMany.mockResolvedValue([]);

      const result = await service.getCartsByUser(1);

      expect(result).toBeNull();
    });
  });

  describe('updateCart', () => {
    it('should update cart successfully', async () => {
      const updateData: ICartCreateUpdate = {
        userId: 1,
        items: [
          {
            productId: 1,
            quantity: 3,
          },
        ],
      };

      const existingCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            cartId: 1,
            productId: 1,
            quantity: 2,
          },
        ],
      };

      mockPrismaService.cart.findUnique.mockResolvedValue(existingCart);
      mockPrismaService.cart.update.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(existingCart.items[0]);
      mockPrismaService.cartItem.update.mockResolvedValue({});
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

      const result = await service.updateCart(1, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cart.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          userId: 1,
          uuid: undefined,
          guestId: undefined,
        },
      });
    });

    it('should return null when cart not found', async () => {
      const updateData: ICartCreateUpdate = { userId: 1 };

      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      const result = await service.updateCart(999, updateData);

      expect(result).toBeNull();
    });

    it('should create new item when item does not exist', async () => {
      const updateData: ICartCreateUpdate = {
        items: [
          {
            productId: 2,
            quantity: 1,
          },
        ],
      };

      const existingCart = {
        id: 1,
        userId: 1,
        items: [],
      };

      mockPrismaService.cart.findUnique.mockResolvedValue(existingCart);
      mockPrismaService.cart.update.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(null);
      mockPrismaService.cartItem.create.mockResolvedValue({});
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

      const result = await service.updateCart(1, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 1,
          productId: 2,
          quantity: 1,
        },
      });
    });

    it('should delete item when quantity becomes zero or negative', async () => {
      const updateData: ICartCreateUpdate = {
        items: [
          {
            productId: 1,
            quantity: -2, // This will make total quantity <= 0
          },
        ],
      };

      const existingCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            cartId: 1,
            productId: 1,
            quantity: 2,
          },
        ],
      };

      mockPrismaService.cart.findUnique.mockResolvedValue(existingCart);
      mockPrismaService.cart.update.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(existingCart.items[0]);
      mockPrismaService.cartItem.delete.mockResolvedValue({});
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

      const result = await service.updateCart(1, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('deleteCart', () => {
    it('should delete cart successfully', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({});
      mockPrismaService.cart.delete.mockResolvedValue(mockCart);

      const result = await service.deleteCart(1);

      expect(result).toBeDefined();
      expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 1 },
      });
      expect(mockPrismaService.cart.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when cart not found', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      const result = await service.deleteCart(999);

      expect(result).toBeNull();
    });
  });
});

