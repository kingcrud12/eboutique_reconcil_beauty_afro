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
import { PrismaService } from 'src/prisma/prisma.service';
import { IBookingPublic } from '../Interfaces/booking.interface';

@Controller('admin/slots')
@UseGuards(JwtAuthGuard)
export class SlotController {
  constructor(
    private readonly slotService: SlotService,
    private readonly prisma: PrismaService,
  ) {}

  // --- CREATE ---
  @Post()
  async create(
    @Req() req: JwtRequest,
    @Body() data: ISlotCreate,
  ): Promise<ISlot> {
    const user = req.user;
    this.ensureIsAdmin(user);

    // 1) Normaliser les dates
    const startAt = new Date(data.startAt as unknown as string);
    const endAt = new Date(data.endAt as unknown as string);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new HttpException(
        'startAt / endAt invalides (ISO 8601 attendu).',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existing = await this.prisma.slot.findFirst({
      where: {
        OR: [{ startAt }, { endAt }],
      },
      select: { id: true, startAt: true, endAt: true },
    });

    if (existing) {
      const s = existing.startAt.toISOString();
      const e = existing.endAt.toISOString();
      throw new HttpException(
        `Un slot existe déjà pour ce créneau (startAt=${s}, endAt=${e}).`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3) Passer les dates normalisées au service
    return this.slotService.create({ ...data, startAt, endAt });
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

  @Get(':id/booking')
  async getBooking(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IBookingPublic> {
    const user = req.user;
    this.ensureIsAdmin(user);
    return this.slotService.getBookingForSlot(id);
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
