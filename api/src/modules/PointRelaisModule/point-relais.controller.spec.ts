import { Test, TestingModule } from '@nestjs/testing';
import { PointRelaisController } from './point-relais.controller';
import { PointRelaisService } from './point-relais.service';
import { ParcelShop } from './types/types';

describe('PointRelaisController', () => {
  let controller: PointRelaisController;
  let pointRelaisService: PointRelaisService;

  const mockParcelShops: ParcelShop[] = [
    {
      Num: '12345',
      Name: 'Test Point Relais',
      Adress1: '123 Test Street',
      Adress2: '',
      City: 'Paris',
      ZipCode: '75001',
      Country: 'FR',
      Latitude: '48.8566',
      Longitude: '2.3522',
      ActivityCode: '24R',
      DeliveryMode: '24R',
      Distance: '0.5',
      LocalisationDetails: 'Test details',
    },
  ];

  const mockPointRelaisService = {
    findRelaisByUserId: jest.fn(),
    findRelaisByAddress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointRelaisController],
      providers: [
        {
          provide: PointRelaisService,
          useValue: mockPointRelaisService,
        },
      ],
    }).compile();

    controller = module.get<PointRelaisController>(PointRelaisController);
    pointRelaisService = module.get<PointRelaisService>(PointRelaisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRelais', () => {
    it('should return relay points for user', async () => {
      mockPointRelaisService.findRelaisByUserId.mockResolvedValue(mockParcelShops);

      const result = await controller.getRelais(1);

      expect(result).toEqual(mockParcelShops);
      expect(mockPointRelaisService.findRelaisByUserId).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no relay points found', async () => {
      mockPointRelaisService.findRelaisByUserId.mockResolvedValue([]);

      const result = await controller.getRelais(1);

      expect(result).toEqual([]);
    });
  });

  describe('findByAddress', () => {
    it('should return relay points for address', async () => {
      const address = '123 Test Street, 75001 Paris';
      mockPointRelaisService.findRelaisByAddress.mockResolvedValue(mockParcelShops);

      const result = await controller.findByAddress({ address });

      expect(result).toEqual(mockParcelShops);
      expect(mockPointRelaisService.findRelaisByAddress).toHaveBeenCalledWith(address);
    });

    it('should return empty array when no relay points found for address', async () => {
      const address = '999 Non-existent Street, 99999 Nowhere';
      mockPointRelaisService.findRelaisByAddress.mockResolvedValue([]);

      const result = await controller.findByAddress({ address });

      expect(result).toEqual([]);
    });
  });
});

