import { Module } from '@nestjs/common';
import { PointRelaisService } from './point-relais.service';
import { PointRelaisController } from './point-relais.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [PointRelaisService],
  controllers: [PointRelaisController],
})
export class PointRelaisModule {}
