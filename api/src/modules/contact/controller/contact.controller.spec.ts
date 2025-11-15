import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from '../service/contact.service';
import { BadRequestException } from '@nestjs/common';

describe('ContactController', () => {
  let controller: ContactController;
  let contactService: ContactService;

  const mockContactService = {
    sendContactMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockContactService,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    contactService = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send contact message successfully', async () => {
      const contactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I have a question about your products.',
      };

      const expectedResult = { success: true };
      mockContactService.sendContactMessage.mockResolvedValue(expectedResult);

      const result = await controller.sendMessage(contactDto);

      expect(result).toEqual(expectedResult);
      expect(mockContactService.sendContactMessage).toHaveBeenCalledWith(
        contactDto.name,
        contactDto.email,
        contactDto.message,
      );
    });

    it('should throw BadRequestException when name is missing', async () => {
      const contactDto = {
        name: '',
        email: 'john@example.com',
        message: 'Hello, I have a question about your products.',
      };

      await expect(controller.sendMessage(contactDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.sendMessage(contactDto)).rejects.toThrow(
        'Missing contact fields',
      );
    });

    it('should throw BadRequestException when email is missing', async () => {
      const contactDto = {
        name: 'John Doe',
        email: '',
        message: 'Hello, I have a question about your products.',
      };

      await expect(controller.sendMessage(contactDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.sendMessage(contactDto)).rejects.toThrow(
        'Missing contact fields',
      );
    });

    it('should throw BadRequestException when message is missing', async () => {
      const contactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: '',
      };

      await expect(controller.sendMessage(contactDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.sendMessage(contactDto)).rejects.toThrow(
        'Missing contact fields',
      );
    });

    it('should throw BadRequestException when dto is null', async () => {
      await expect(controller.sendMessage(null)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.sendMessage(null)).rejects.toThrow(
        'Missing contact fields',
      );
    });

    it('should throw BadRequestException when dto is undefined', async () => {
      await expect(controller.sendMessage(undefined)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.sendMessage(undefined)).rejects.toThrow(
        'Missing contact fields',
      );
    });
  });
});

