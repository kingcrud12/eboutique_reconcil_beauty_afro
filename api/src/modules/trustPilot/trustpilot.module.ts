import { Module } from '@nestjs/common';
import { TrustpilotService } from './service/trutpilot.service';
import { TrustpilotController } from './controllers/trutpilot.controller';

@Module({
  providers: [TrustpilotService],
  controllers: [TrustpilotController],
  exports: [TrustpilotService],
})
export class TrustpilotModule {}
