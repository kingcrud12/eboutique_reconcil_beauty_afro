import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  ParseIntPipe,
  Param,
  Res,
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
import { OrderDto } from 'src/modules/order/Models/order.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Admin')
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
  @ApiOperation({
    summary: 'Connexion à mon compte administrateur',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = loginDto;

    const user = await this.authservice.validateUser(email, password);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    await this.ensureIsAdmin(user);

    const { token } = await this.adminService.login(email);

    res.clearCookie('token', { path: '/' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return { message: 'Login successful', token: token };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Déconnexion de mon compte administrateur',
  })
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
  @Get('me')
  @ApiOperation({
    summary: 'Récupérer les informations du compte administrateur connecté',
  })
  async getMe(@Req() req: JwtRequest) {
    const user = req.user;
    await this.ensureIsAdmin(user);
    return {
      id: user.userId,
      email: user.email,
      role: user.role,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Req() req: JwtRequest) {
    const user = req.user;
    await this.ensureIsAdmin(user);
    return this.orderService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:orderId')
  async getOrder(
    @Req() req: JwtRequest,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderDto> {
    const user = req.user;
    await this.ensureIsAdmin(user);
    const order = await this.orderService.getOrder(orderId);
    return order;
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
