// src/modules/product/controllers/admin-product.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Req,
  HttpException,
  HttpStatus,
  Get,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../Services/product.service';
import { CreateProductDto, UpdateProductDto } from '../Models/product.dto';
import { IProduct } from '../Interfaces/product.interface';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { JwtRequest } from 'src/modules/auth/jwt/Jwt-request.interface';
import { Role } from '@prisma/client';
import { Product as PrismaProduct } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { uploadToCloudinary } from 'src/utils/cloudinary.service';

@Controller('admin/products')
@UseGuards(JwtAuthGuard)
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() data: CreateProductDto,
    @Req() req: JwtRequest,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<IProduct> {
    const user = req.user;
    this.ensureIsAdmin(user);

    const existing = await this.prisma.product.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new HttpException(
        `Un produit nommé "${data.name}" existe déjà.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let imageUrl: string | null = null;

    if (image) {
      try {
        const result = await uploadToCloudinary(image, 'products');
        imageUrl = result.secure_url;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new HttpException(
          'Erreur lors de l’upload de l’image sur Cloudinary',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return this.productService.create({ ...data, imageUrl });
  }

  @Get()
  async getAll(@Req() req: JwtRequest): Promise<IProduct[]> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.productService.getAll();
  }

  @Get(':id')
  async get(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IProduct> {
    const user = req.user;
    this.ensureIsAdmin(user);
    await this.verifyProduct(id);
    return this.productService.get(id);
  }

  @Patch(':id')
  async update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateProductDto,
  ): Promise<IProduct> {
    const user = req.user;
    this.ensureIsAdmin(user);
    await this.verifyProduct(id);
    if (user.role !== Role.admin) {
      throw new HttpException(
        'Access denied: Admin only',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.productService.update(id, data);
  }

  @Delete(':id')
  async delete(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IProduct> {
    const user = req.user;
    this.ensureIsAdmin(user);
    await this.verifyProduct(id);
    return this.productService.delete(id);
  }
  private async verifyProduct(id: number): Promise<PrismaProduct> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }
  private ensureIsAdmin(user: { role: string }) {
    if (user.role !== Role.admin) {
      throw new HttpException(
        'Access denied: Admin only',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
