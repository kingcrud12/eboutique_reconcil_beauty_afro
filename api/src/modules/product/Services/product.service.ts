import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IProduct,
  IProductCreate,
  IProductUpdate,
} from '../Interfaces/product.interface';
import { Product as PrismaProduct } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: IProductCreate): Promise<IProduct> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: Number(data.stock),
        imageUrl: data.imageUrl ?? null,
        category: data.category ?? null,
      },
    });

    return this.exportToProductInterface(product);
  }

  async getAll(): Promise<IProduct[]> {
    const products = await this.prisma.product.findMany();
    return products.map((product) => this.exportToProductInterface(product));
  }

  async get(id: number): Promise<IProduct> {
    const product = await this.verifyProduct(id);
    return this.exportToProductInterface(product);
  }

  async update(id: number, data: IProductUpdate): Promise<IProduct> {
    await this.verifyProduct(id);
    const updated = await this.prisma.product.update({
      where: { id },
      data,
    });
    return this.exportToProductInterface(updated);
  }

  async delete(id: number): Promise<IProduct> {
    await this.verifyProduct(id);
    const deleted = await this.prisma.product.delete({ where: { id } });
    return this.exportToProductInterface(deleted);
  }

  private exportToProductInterface(product: PrismaProduct): IProduct {
    return {
      id: product.id,
      name: product.name as string,
      description: product.description,
      price: product.price as Decimal,
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category as string | undefined,
    };
  }

  private async verifyProduct(id: number): Promise<PrismaProduct> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }
}
