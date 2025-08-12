import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { UserService } from '../../user/Services/user.service';
import { Role } from '@prisma/client';
import { LoginDto } from 'src/modules/auth/Models/login.dto';
import { JwtRequest } from 'src/modules/auth/jwt/Jwt-request.interface';
import { AuthService } from 'src/modules/auth/Services/auth.service';
import { OrderService } from 'src/modules/order/Services/order.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly authservice: AuthService,
    private readonly orderService: OrderService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.authservice.validateUser(email, password);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    await this.ensureIsAdmin(user);

    return await this.adminService.login(email);
  }

  @Post('logout')
  logout() {
    return this.adminService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(@Req() req: JwtRequest) {
    const user = req.user;
    await this.ensureIsAdmin(user);
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Req() req: JwtRequest) {
    const user = req.user;
    await this.ensureIsAdmin(user);
    return this.orderService.getAllOrders();
  }

  private ensureIsAdmin(user: { role: string }) {
    if (user.role !== Role.admin) {
      throw new HttpException(
        'Access denied: Admin only',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return Promise.resolve();
  }
}
