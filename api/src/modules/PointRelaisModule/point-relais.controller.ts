import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { PointRelaisService } from './point-relais.service';

@Controller('point-relais')
export class PointRelaisController {
  constructor(private readonly service: PointRelaisService) {}

  @Post(':id')
  async getRelais(@Param('id', ParseIntPipe) id: number) {
    return this.service.findRelaisByUserId(id);
  }
}
