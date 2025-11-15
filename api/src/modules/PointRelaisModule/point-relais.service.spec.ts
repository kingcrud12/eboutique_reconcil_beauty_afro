import { Test, TestingModule } from '@nestjs/testing';
import { PointRelaisService } from './point-relais.service';
import { UserService } from '../user/Services/user.service';
import { ParcelShop, SearchPRResponse } from './types/types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PointRelaisService', () => {
  let service: PointRelaisService;
  let userService: UserService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    adress: '123 Test Street, 75001 Paris',
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockSearchResponse: SearchPRResponse = {
    PRList: mockParcelShops,
  };

  const mockUserService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointRelaisService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<PointRelaisService>(PointRelaisService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findRelaisByUserId', () => {
    it('should find relay points for user successfully', async () => {
      mockUserService.get.mockResolvedValue(mockUser);
      mockedAxios.get.mockResolvedValue({ data: mockSearchResponse });

      const result = await service.findRelaisByUserId(1);

      expect(result).toEqual(mockParcelShops);
      expect(mockUserService.get).toHaveBeenCalledWith(1);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should throw error when user has no address', async () => {
      const userWithoutAddress = { ...mockUser, adress: null };
      mockUserService.get.mockResolvedValue(userWithoutAddress);

      await expect(service.findRelaisByUserId(1)).rejects.toThrow(
        'Adresse utilisateur non renseignée',
      );
    });

    it('should throw error when address format is invalid', async () => {
      const userWithInvalidAddress = { ...mockUser, adress: 'Invalid Address' };
      mockUserService.get.mockResolvedValue(userWithInvalidAddress);

      await expect(service.findRelaisByUserId(1)).rejects.toThrow(
        'Format d\'adresse invalide',
      );
    });

    it('should use fallback URL when no results found', async () => {
      mockUserService.get.mockResolvedValue(mockUser);
      mockedAxios.get
        .mockResolvedValueOnce({ data: { PRList: [] } })
        .mockResolvedValueOnce({ data: mockSearchResponse });

      const result = await service.findRelaisByUserId(1);

      expect(result).toEqual(mockParcelShops);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      mockUserService.get.mockResolvedValue(mockUser);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.findRelaisByUserId(1)).rejects.toThrow('API Error');
    });
  });

  describe('findRelaisByAddress', () => {
    it('should find relay points by address successfully', async () => {
      const address = '123 Test Street, 75001 Paris';
      mockedAxios.get.mockResolvedValue({ data: mockSearchResponse });

      const result = await service.findRelaisByAddress(address);

      expect(result).toEqual(mockParcelShops);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should throw error when address format is invalid', async () => {
      const invalidAddress = 'Invalid Address';

      await expect(service.findRelaisByAddress(invalidAddress)).rejects.toThrow(
        'Format d\'adresse invalide',
      );
    });

    it('should use fallback URL when no results found', async () => {
      const address = '123 Test Street, 75001 Paris';
      mockedAxios.get
        .mockResolvedValueOnce({ data: { PRList: [] } })
        .mockResolvedValueOnce({ data: mockSearchResponse });

      const result = await service.findRelaisByAddress(address);

      expect(result).toEqual(mockParcelShops);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      const address = '123 Test Street, 75001 Paris';
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.findRelaisByAddress(address)).rejects.toThrow('API Error');
    });
  });

  describe('parseAddress', () => {
    it('should parse comma-separated address correctly', () => {
      const address = '123 Test Street, 75001, Paris';
      const result = service['parseAddress'](address);

      expect(result).toEqual(['123 Test Street', '75001', 'Paris']);
    });

    it('should parse standard French address correctly', () => {
      const address = '123 Test Street 75001 Paris';
      const result = service['parseAddress'](address);

      expect(result).toEqual(['123 Test Street', '75001', 'Paris']);
    });

    it('should throw error for invalid address format', () => {
      const invalidAddress = 'Invalid Address';

      expect(() => service['parseAddress'](invalidAddress)).toThrow(
        'Adresse invalide',
      );
    });
  });

  describe('buildUrl', () => {
    it('should build URL with postal code and city', () => {
      const params = { postalCode: '75001', city: 'Paris' };
      const result = service['buildUrl'](params);

      expect(result).toContain('75001');
      expect(result).toContain('Paris');
    });

    it('should build URL with only postal code', () => {
      const params = { postalCode: '75001' };
      const result = service['buildUrl'](params);

      expect(result).toContain('75001');
    });
  });
});

