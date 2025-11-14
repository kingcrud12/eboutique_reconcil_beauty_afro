// src/modules/PointRelaisModule/soap-client.provider.ts
import { FactoryProvider } from '@nestjs/common';
import { createClientAsync } from 'soap';

export const soapClientProvider: FactoryProvider = {
  provide: 'MR_SOAP_CLIENT',
  useFactory: async () => {
    const wsdlUrl =
      'https://www.mondialrelay.fr/WebService/Web_Services.asmx?WSDL';
    return await createClientAsync(wsdlUrl);
  },
};
