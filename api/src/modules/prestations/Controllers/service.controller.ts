import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceService } from '../Services/service.services';
import {
  IService,
  IServiceCreate,
  IServiceUpdate,
} from '../Interfaces/service.interface';
import { JwtRequest } from 'src/modules/auth/jwt/Jwt-request.interface';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/utils/cloudinary.service';

@Controller('admin/services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // --- CREATE ---
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Req() req: JwtRequest,
    @Body() data: IServiceCreate,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<IService> {
    const user = req.user;
    this.ensureIsAdmin(user);
    const existing = await this.prisma.service.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new HttpException(
        `Un service nommé "${data.name}" existe déjà.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!image) throw new BadRequestException('Aucune image fournie');
    const imageUrl = await this.cloudinaryService.uploadToCloudinary(image);

    return this.serviceService.create({ ...data, imageUrl });
  }

  // --- READ ALL ---
  @Get()
  async getAll(@Req() req: JwtRequest): Promise<IService[]> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.serviceService.getAll();
  }

  // --- READ ONE ---
  @Get(':id')
  async get(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IService> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.serviceService.get(id);
  }

  // --- UPDATE ---
  @Put(':id')
  async update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: IServiceUpdate,
  ): Promise<IService> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.serviceService.update(id, data);
  }

  // --- DELETE ---
  @Delete(':id')
  async delete(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IService> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.serviceService.delete(id);
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
