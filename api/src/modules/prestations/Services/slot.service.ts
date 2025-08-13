import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ISlot, ISlotCreate, ISlotUpdate } from '../Interfaces/slot.interface';
import { Slot, SlotStatus } from '@prisma/client';

@Injectable()
export class SlotService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ISlotCreate): Promise<ISlot> {
    const created = await this.prisma.slot.create({
      data: {
        serviceId: data.serviceId,
        startAt: data.startAt,
        endAt: data.endAt,
        status: data.status ?? SlotStatus.open,
      },
    });
    return this.exportToSlotInterface(created);
  }

  async getAll(): Promise<ISlot[]> {
    const slots = await this.prisma.slot.findMany();
    return slots.map((slot) => this.exportToSlotInterface(slot));
  }

  async get(id: number): Promise<ISlot> {
    const slot = await this.verifySlot(id);
    return this.exportToSlotInterface(slot);
  }

  async update(id: number, data: ISlotUpdate): Promise<ISlot> {
    await this.verifySlot(id);
    const updated = await this.prisma.slot.update({
      where: { id },
      data,
    });
    return this.exportToSlotInterface(updated);
  }

  async delete(id: number): Promise<ISlot> {
    await this.verifySlot(id);
    const deleted = await this.prisma.slot.delete({ where: { id } });
    return this.exportToSlotInterface(deleted);
  }

  // ---------- Helpers ----------
  private exportToSlotInterface(slot: Slot): ISlot {
    return {
      id: slot.id,
      serviceId: slot.serviceId,
      startAt: slot.startAt,
      endAt: slot.endAt,
      status: slot.status,
      createdAt: slot.createdAt ?? undefined,
      updatedAt: slot.updatedAt ?? undefined,
    };
  }

  private async verifySlot(id: number): Promise<Slot> {
    const slot = await this.prisma.slot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException('Créneau introuvable');
    return slot;
  }
}
