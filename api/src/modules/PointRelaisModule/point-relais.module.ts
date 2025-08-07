// point-relais.module.ts
import { Module } from '@nestjs/common';
import { PointRelaisService } from './point-relais.service';
import { PointRelaisController } from './point-relais.controller';
import { UserModule } from '../user/user.module';
import { createClientAsync } from 'soap';

@Module({
  imports: [UserModule],
  providers: [
    {
      provide: 'MR_SOAP_CLIENT',
      useFactory: async () => {
        const wsdlUrl =
          'https://www.mondialrelay.fr/webservice/Web_Services.asmx?wsdl';
        return await createClientAsync(wsdlUrl);
      },
    },
    PointRelaisService,
  ],
  controllers: [PointRelaisController],
})
export class PointRelaisModule {}
