import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../Services/product.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { IProduct } from '../Interfaces/product.interface';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;
  let prismaService: PrismaService;

  const mockProduct: IProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 100,
    weight: 0.5,
    imageUrl: 'test.jpg',
    category: 'test',
  };

  const mockPrismaProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: new Decimal(29.99),
    stock: 100,
    weight: new Decimal(0.5),
    imageUrl: 'test.jpg',
    category: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductService = {
    getAll: jest.fn(),
    get: jest.fn(),
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      mockProductService.getAll.mockResolvedValue([mockProduct]);

      const result = await controller.getAll();

      expect(result).toEqual([mockProduct]);
      expect(mockProductService.getAll).toHaveBeenCalled();
    });

    it('should return empty array when no products', async () => {
      mockProductService.getAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockPrismaProduct);
      mockProductService.get.mockResolvedValue(mockProduct);

      const result = await controller.get(1);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockProductService.get).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(controller.get(999)).rejects.toThrow(NotFoundException);
      await expect(controller.get(999)).rejects.toThrow('Produit introuvable');
    });
  });
});