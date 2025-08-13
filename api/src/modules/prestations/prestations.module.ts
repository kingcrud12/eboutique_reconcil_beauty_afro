import { Module } from '@nestjs/common';

import { ServiceService } from './Services/service.services';
import { ServiceController } from './Controllers/service.controller';
import { SlotController } from './Controllers/slot.service';
import { SlotService } from './Services/slot.service';

@Module({
  controllers: [ServiceController, SlotController],
  providers: [ServiceService, SlotService],
  exports: [ServiceService, SlotService],
})
export class PrestationsModule {}
