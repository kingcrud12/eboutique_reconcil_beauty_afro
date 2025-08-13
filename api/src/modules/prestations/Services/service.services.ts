import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IService,
  IServiceCreate,
  IServiceUpdate,
} from '../Interfaces/service.interface';
import { Prisma, Service as PrismaServiceModel } from '@prisma/client';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: IServiceCreate): Promise<IService> {
    const created = await this.prisma.service.create({
      data: {
        name: data.name,
        duration: Number(data.duration),
        price: new Prisma.Decimal(data.price),
        imageUrl: data.imageUrl,
        category: data.category,
        subcategory: data.subcategory,
      },
    });
    return this.exportToInterface(created);
  }

  async getAll(): Promise<IService[]> {
    const rows = await this.prisma.service.findMany();
    return rows.map((row) => this.exportToInterface(row));
  }

  async get(id: number): Promise<IService> {
    const row = await this.verify(id);
    return this.exportToInterface(row);
  }

  async update(id: number, data: IServiceUpdate): Promise<IService> {
    await this.verify(id);
    const updated = await this.prisma.service.update({
      where: { id },
      data,
    });
    return this.exportToInterface(updated);
  }

  async delete(id: number): Promise<IService> {
    await this.verify(id);
    const deleted = await this.prisma.service.delete({
      where: { id },
    });
    return this.exportToInterface(deleted);
  }

  // --- Helpers ---
  private exportToInterface(row: PrismaServiceModel): IService {
    return {
      id: row.id,
      name: row.name,
      duration: row.duration,
      price: row.price,
      imageUrl: row.imageUrl as string,
      category: row.category,
      subcategory: row.subcategory,
    };
  }

  private async verify(id: number): Promise<PrismaServiceModel> {
    const found = await this.prisma.service.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Service introuvable');
    return found;
  }
}
