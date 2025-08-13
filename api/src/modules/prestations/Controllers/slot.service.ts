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
import { SlotService } from '../Services/slot.service';
import { ISlot, ISlotCreate, ISlotUpdate } from '../Interfaces/slot.interface';
import { JwtRequest } from 'src/modules/auth/jwt/Jwt-request.interface';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';

@Controller('admin/slots')
@UseGuards(JwtAuthGuard)
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  // --- CREATE ---
  @Post()
  async create(
    @Req() req: JwtRequest,
    @Body() data: ISlotCreate,
  ): Promise<ISlot> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.slotService.create(data);
  }

  // --- READ ALL ---
  @Get()
  async getAll(@Req() req: JwtRequest): Promise<ISlot[]> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.slotService.getAll();
  }

  // --- READ ONE ---
  @Get(':id')
  async get(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ISlot> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.slotService.get(id);
  }

  // --- UPDATE ---
  @Put(':id')
  async update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ISlotUpdate,
  ): Promise<ISlot> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.slotService.update(id, data);
  }

  // --- DELETE ---
  @Delete(':id')
  async delete(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ISlot> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.slotService.delete(id);
  }

  // --- Security Helper ---
  private ensureIsAdmin(user: { role: string }) {
    if (user.role !== Role.admin) {
      throw new HttpException(
        'Access denied: Admin only',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
