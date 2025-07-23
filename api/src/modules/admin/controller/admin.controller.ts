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

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.verifyUser({ email });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    if (user.role !== Role.admin) {
      throw new HttpException(
        'Access denied: Admin only',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.adminService.login(email, password);
  }

  @Post('logout')
  logout() {
    return this.adminService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(@Req() req: JwtRequest) {
    const user = req.user;

    if (user.role !== Role.admin) {
      throw new HttpException(
        'Access denied: Admin only',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.adminService.getAllUsers();
  }
}
