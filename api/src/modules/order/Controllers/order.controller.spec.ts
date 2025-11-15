import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../Services/order.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import { CreateOrderDto } from '../Models/order.dto';
import { IOrderUpdate } from '../Interfaces/order.interface';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockOrder = {
    id: 1,
    total: 29.99,
    status: 'pending',
    deliveryMode: 'HOME',
    deliveryAddress: '123 Test Street, Paris',
    userId: 1,
    items: [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        quantity: 2,
        unitPrice: 14.99,
        product: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 14.99,
          stock: 100,
          imageUrl: 'test.jpg',
          category: 'test',
        },
      },
    ],
  };

  const mockOrderService = {
    create: jest.fn(),
    getUserOrder: jest.fn(),
    getOrders: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
    deleteAllForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 1,
        deliveryAddress: '123 Test Street, Paris',
        deliveryMode: 'HOME',
      };

      mockOrderService.create.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockOrderService.create).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('getOrder', () => {
    it('should return user order by id', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockOrderService.getUserOrder.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(mockRequest, 1);

      expect(result).toEqual(mockOrder);
      expect(mockOrderService.getUserOrder).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getOrders', () => {
    it('should return all user orders', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockOrderService.getOrders.mockResolvedValue([mockOrder]);

      const result = await controller.getOrders(mockRequest);

      expect(result).toEqual([mockOrder]);
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(1);
    });
  });

  describe('patchOrder', () => {
    it('should update order successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const updateData: IOrderUpdate = {
        status: 'paid',
        deliveryAddress: '456 Updated Street, Paris',
      };

      mockOrderService.updateOrder.mockResolvedValue(mockOrder);

      const result = await controller.patchOrder(mockRequest, 1, updateData);

      expect(result).toEqual(mockOrder);
      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(1, 1, updateData);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockOrderService.deleteOrder.mockResolvedValue(mockOrder);

      const result = await controller.deleteOrder(mockRequest, 1);

      expect(result).toEqual({
        id: mockOrder.id,
        total: mockOrder.total,
        status: mockOrder.status,
        deliveryMode: mockOrder.deliveryMode,
        deliveryAddress: mockOrder.deliveryAddress,
        userId: mockOrder.userId,
        items: mockOrder.items.map((it) => ({
          id: it.id,
          orderId: it.orderId,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          product: it.product
            ? {
                id: it.product.id,
                name: it.product.name,
                description: it.product.description ?? '',
                price: it.product.price,
                stock: it.product.stock,
                imageUrl: it.product.imageUrl ?? undefined,
                category: it.product.category ?? undefined,
              }
            : undefined,
        })),
      });
      expect(mockOrderService.deleteOrder).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when order not found', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockOrderService.deleteOrder.mockResolvedValue(null);

      await expect(controller.deleteOrder(mockRequest, 999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.deleteOrder(mockRequest, 999)).rejects.toThrow(
        'Commande introuvable ou non autorisée',
      );
    });
  });

  describe('deleteAllOrdersForUser', () => {
    it('should delete all orders for user', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const deleteResult = {
        itemsDeleted: 5,
        ordersDeleted: 3,
      };

      mockOrderService.deleteAllForUser.mockResolvedValue(deleteResult);

      const result = await controller.deleteAllOrdersForUser(mockRequest);

      expect(result).toEqual(deleteResult);
      expect(mockOrderService.deleteAllForUser).toHaveBeenCalledWith(1);
    });
  });
});

