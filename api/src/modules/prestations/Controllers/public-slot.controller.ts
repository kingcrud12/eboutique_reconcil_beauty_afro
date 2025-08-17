// src/modules/prestations/Controllers/public-slot.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SlotService } from '../Services/slot.service';
import { ISlot } from '../Interfaces/slot.interface';

@Controller('slots')
export class PublicSlotController {
  constructor(private readonly slotService: SlotService) {}

  // GET /slots  (public)
  @Get()
  async getAll(): Promise<ISlot[]> {
    return this.slotService.getAll();
  }

  // GET /slots/:id  (public)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<ISlot> {
    return this.slotService.get(id);
  }
}
