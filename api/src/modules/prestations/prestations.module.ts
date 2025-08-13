import { Module } from '@nestjs/common';

import { ServiceService } from './Services/service.services';
import { ServiceController } from './Controllers/service.controller';
import { SlotController } from './Controllers/slot.controller';
import { SlotService } from './Services/slot.service';
import { CloudinaryModule } from 'src/utils/cloudinary.module';
import { PublicServiceController } from './Controllers/public-service.controller';
import { PublicSlotController } from './Controllers/public-slot.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [
    ServiceController,
    SlotController,
    PublicServiceController,
    PublicSlotController,
  ],
  providers: [ServiceService, SlotService],
  exports: [ServiceService, SlotService],
})
export class PrestationsModule {}
