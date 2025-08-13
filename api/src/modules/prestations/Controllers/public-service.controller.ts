// src/modules/prestations/Controllers/public-service.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceService } from '../Services/service.services';
import { IService } from '../Interfaces/service.interface';

@Controller('services')
export class PublicServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // GET /services  (public)
  @Get()
  async getAll(): Promise<IService[]> {
    return this.serviceService.getAll();
  }

  // GET /services/:id  (public)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<IService> {
    return this.serviceService.get(id);
  }
}
