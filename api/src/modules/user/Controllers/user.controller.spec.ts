import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../Services/user.service';
import { MailService } from '../../mailer/mail.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../Models/user.dto';
import { IUser } from '../Interfaces/user.interface';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import { Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let mailerService: MailService;
  let jwtService: JwtService;

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    adress: '123 Test Street',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    create: jest.fn(),
    get: jest.fn(),
    getByEmail: jest.fn(),
    update: jest.fn(),
    isUserExistOrNot: jest.fn(),
  };

  const mockMailerService = {
    sendWelcomeEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailService,
          useValue: mockMailerService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    mailerService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        adress: '123 Test Street',
      };

      mockUserService.isUserExistOrNot.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockMailerService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await controller.create(createUserDto, mockResponse);

      expect(result).toEqual({
        message: 'User created successfully',
        user: mockUser,
      });
      expect(mockUserService.isUserExistOrNot).toHaveBeenCalledWith('test@example.com');
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id },
        { expiresIn: '1d' },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith('token', 'mock-jwt-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      expect(mockMailerService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser);
    });

    it('should throw HttpException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserService.isUserExistOrNot.mockResolvedValue(mockUser);

      await expect(controller.create(createUserDto, mockResponse)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.create(createUserDto, mockResponse)).rejects.toThrow(
        'Email already in use',
      );
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      mockUserService.get.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockUserService.get).toHaveBeenCalledWith(1);
    });
  });

  describe('updateMe', () => {
    it('should update current user', async () => {
      const mockRequest: JwtRequest = {
        user: { userId: 1 },
      } as JwtRequest;

      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = { ...mockUser, firstName: 'Jane', lastName: 'Smith' };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockRequest, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      mockUserService.getAll.mockResolvedValue([mockUser]);

      const result = await controller.getAll();

      expect(result).toEqual([mockUser]);
      expect(mockUserService.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      mockUserService.get.mockResolvedValue(mockUser);

      const result = await controller.getById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserService.get).toHaveBeenCalledWith(1);
    });
  });

  describe('updateById', () => {
    it('should update user by id', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      const updatedUser = { ...mockUser, firstName: 'Updated' };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateById(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });
});