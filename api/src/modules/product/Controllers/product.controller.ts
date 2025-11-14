import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from '../Services/product.service';
import { IProduct } from '../Interfaces/product.interface';
import { Product as PrismaProduct } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAll(): Promise<IProduct[]> {
    return this.productService.getAll();
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number): Promise<IProduct> {
    await this.verifyProduct(id);
    return this.productService.get(id);
  }
  private async verifyProduct(id: number): Promise<PrismaProduct> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }
}
