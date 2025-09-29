import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
  Get,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { UserService } from '../../user/Services/user.service';
import { JwtService } from '@nestjs/jwt';
import { OrderService } from '../../order/Services/order.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import axios from 'axios';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly orderService: OrderService,
  ) {}

  AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  CLIENT_ID = process.env.AUTH0_CLIENT_ID;
  CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
  REDIRECT_URI = process.env.AUTH0_ADMIN_REDIRECT_URI;

  // --- LOGIN (PKCE / Auth0) ---
  @Get('login')
  login(
    @Query('code_challenge') codeChallenge: string,
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ) {
    if (!codeChallenge || !redirectUri) {
      throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: 'openid profile email offline_access',
    });

    return res.redirect(
      `https://${this.AUTH0_DOMAIN}/authorize?${params.toString()}`,
    );
  }

  // --- CALLBACK (PKCE) ---
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ) {
    if (!code || !redirectUri) {
      throw new HttpException(
        'Missing code or redirect_uri',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      interface Auth0TokenResponse {
        access_token: string;
        id_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type?: string;
      }

      const tokenRes = await axios.post<Auth0TokenResponse>(
        `https://${this.AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: 'authorization_code',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
          code_verifier: state,
        },
      );

      const { access_token } = tokenRes.data;

      // ici on peut valider le token pour s'assurer que l'utilisateur est admin
      // ou le faire via un JwtAuthGuard côté front
      res.cookie('token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.redirect(redirectUri);
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'OAuth token exchange failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --- LOGOUT ---
  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion de mon compte administrateur' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'Logged out' };
  }

  // --- ADMIN PROTECTED ROUTES ---
  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(@Req() req: JwtRequest) {
    const user = req.user;
    await this.ensureIsAdmin(user);
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
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
  ) {
    const user = req.user;
    await this.ensureIsAdmin(user);
    return this.orderService.getOrder(orderId);
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
