import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../Services/user.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { CreateUserDto } from '../Models/user.dto';

// Un mock simple de UserService
const mockUserService = {
  create: jest.fn(),
  get: jest.fn(),
  getByEmail: jest.fn(),
  update: jest.fn(),
};

// Un mock de JwtAuthGuard pour le bypass
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call UserService.create and return created user', async () => {
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123456',
      };

      mockUserService.getByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({ ...dto, id: 1 });

      const result = await controller.create(dto);

      expect(mockUserService.getByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ ...dto, id: 1 });
    });

    it('should throw error if email already exists', async () => {
      const dto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password',
      };

      mockUserService.getByEmail.mockResolvedValue(dto);

      await expect(controller.create(dto)).rejects.toThrow(
        'Email already in use',
      );
    });
  });
});
