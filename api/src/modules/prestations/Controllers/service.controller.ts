import {
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
  UseGuards,
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

@Controller('admin/services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // --- CREATE ---
  @Post()
  async create(
    @Req() req: JwtRequest,
    @Body() data: IServiceCreate,
  ): Promise<IService> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.serviceService.create(data);
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
