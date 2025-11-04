import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { IOrderCreate, IOrderUpdate } from '../Interfaces/order.interface';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  const mockOrder = {
    id: 1,
    total: new Decimal(29.99),
    status: 'pending',
    deliveryMode: 'HOME',
    deliveryAddress: '123 Test Street, Paris',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        quantity: 2,
        unitPrice: new Decimal(14.99),
        product: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: new Decimal(14.99),
          stock: 100,
          weight: new Decimal(0.5),
          imageUrl: 'test.jpg',
          category: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  const mockCart = {
    id: 1,
    userId: 1,
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
          price: new Decimal(14.99),
          stock: 100,
          weight: new Decimal(0.5),
          imageUrl: 'test.jpg',
          category: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    cart: {
      findFirst: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const orderData: IOrderCreate = {
        userId: 1,
        deliveryAddress: '123 Test Street, Paris',
        deliveryMode: 'HOME',
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(orderData);

      expect(result).toBeDefined();
      expect(mockPrismaService.cart.findFirst).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('should return null when no userId provided', async () => {
      const orderData: IOrderCreate = {
        deliveryAddress: '123 Test Street, Paris',
        deliveryMode: 'HOME',
      };

      const result = await service.create(orderData);

      expect(result).toBeNull();
    });

    it('should return null when no cart found', async () => {
      const orderData: IOrderCreate = {
        userId: 1,
        deliveryAddress: '123 Test Street, Paris',
        deliveryMode: 'HOME',
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(null);

      const result = await service.create(orderData);

      expect(result).toBeNull();
    });

    it('should return null when cart has no items', async () => {
      const orderData: IOrderCreate = {
        userId: 1,
        deliveryAddress: '123 Test Street, Paris',
        deliveryMode: 'HOME',
      };

      const emptyCart = { ...mockCart, items: [] };
      mockPrismaService.cart.findFirst.mockResolvedValue(emptyCart);

      const result = await service.create(orderData);

      expect(result).toBeNull();
    });
  });

  describe('getUserOrder', () => {
    it('should return user order by id', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getUserOrder(1, 1);

      expect(result).toBeDefined();
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.getUserOrder(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own order', async () => {
      const otherUserOrder = { ...mockOrder, userId: 2 };
      mockPrismaService.order.findUnique.mockResolvedValue(otherUserOrder);

      await expect(service.getUserOrder(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getOrders', () => {
    it('should return all user orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.getOrders(1);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no orders found', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.getOrders(1);

      expect(result).toEqual([]);
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const updateData: IOrderUpdate = {
        status: 'paid',
        deliveryAddress: '456 Updated Street, Paris',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'paid',
        deliveryAddress: '456 Updated Street, Paris',
      });

      const result = await service.updateOrder(1, 1, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'paid',
          deliveryAddress: '456 Updated Street, Paris',
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      const updateData: IOrderUpdate = { status: 'paid' };

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.updateOrder(999, 1, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own order', async () => {
      const updateData: IOrderUpdate = { status: 'paid' };
      const otherUserOrder = { ...mockOrder, userId: 2 };

      mockPrismaService.order.findUnique.mockResolvedValue(otherUserOrder);

      await expect(service.updateOrder(1, 1, updateData)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderItem.deleteMany.mockResolvedValue({});
      mockPrismaService.order.delete.mockResolvedValue(mockOrder);

      const result = await service.deleteOrder(1, 1);

      expect(result).toBeDefined();
      expect(mockPrismaService.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderId: 1 },
      });
      expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      const result = await service.deleteOrder(999, 1);

      expect(result).toBeNull();
    });

    it('should return null when user does not own order', async () => {
      const otherUserOrder = { ...mockOrder, userId: 2 };
      mockPrismaService.order.findUnique.mockResolvedValue(otherUserOrder);

      const result = await service.deleteOrder(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('deleteAllForUser', () => {
    it('should delete all orders for user', async () => {
      const mockOrders = [mockOrder, { ...mockOrder, id: 2 }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.orderItem.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.order.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.deleteAllForUser(1);

      expect(result).toEqual({
        itemsDeleted: 10,
        ordersDeleted: 2,
      });
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { items: true },
      });
      expect(mockPrismaService.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderId: { in: [1, 2] } },
      });
      expect(mockPrismaService.order.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should return zero counts when no orders found', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.deleteAllForUser(1);

      expect(result).toEqual({
        itemsDeleted: 0,
        ordersDeleted: 0,
      });
    });
  });
});
