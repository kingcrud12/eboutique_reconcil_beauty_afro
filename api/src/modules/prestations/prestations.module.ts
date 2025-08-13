import { Module } from '@nestjs/common';

import { ServiceService } from './Services/service.services';
import { ServiceController } from './Controllers/service.controller';
import { SlotController } from './Controllers/slot.controller';
import { SlotService } from './Services/slot.service';
import { CloudinaryModule } from 'src/utils/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ServiceController, SlotController],
  providers: [ServiceService, SlotService],
  exports: [ServiceService, SlotService],
})
export class PrestationsModule {}
