import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { IProductCreate, IProductUpdate } from '../Interfaces/product.interface';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;

  const mockProduct = {
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

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const productData: IProductCreate = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        stock: 100,
        weight: 0.5,
        imageUrl: 'test.jpg',
        category: 'test',
      };

      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(productData);

      expect(result).toBeDefined();
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 29.99,
          stock: 100,
          weight: 0.5,
          imageUrl: 'test.jpg',
          category: 'test',
        },
      });
    });

    it('should create product with null optional fields', async () => {
      const productData: IProductCreate = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        stock: 100,
        weight: 0.5,
      };

      const productWithoutOptionals = {
        ...mockProduct,
        imageUrl: null,
        category: null,
      };

      mockPrismaService.product.create.mockResolvedValue(productWithoutOptionals);

      const result = await service.create(productData);

      expect(result).toBeDefined();
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 29.99,
          stock: 100,
          weight: 0.5,
          imageUrl: null,
          category: null,
        },
      });
    });
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.get(1);

      expect(result).toBeDefined();
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.get(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const updateData: IProductUpdate = {
        name: 'Updated Product',
        price: 39.99,
      };

      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        price: new Decimal(39.99),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      const updateData: IProductUpdate = { name: 'Updated Product' };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.delete(1);

      expect(result).toBeDefined();
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});