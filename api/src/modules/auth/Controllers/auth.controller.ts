import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/Services/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.authService.login(body.email, body.password);
    if (!payload) {
      throw new HttpException(
        'Identifiants invalides',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: 'eboutique-reconcil-beauty-afro.onrender.com',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { message: 'Connexion réussie' };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Déconnexion à mon compte',
  })
  logout(): { message: string } {
    return this.authService.logout();
  }

  @Patch('confirm-account')
  @ApiOperation({
    summary: 'Confirmation de la création de mon compte utiilisateur',
  })
  async confirmAccount(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token manquant', HttpStatus.BAD_REQUEST);
    }

    try {
      const payload = this.jwtService.verify<IJwtPayload>(token);

      const userId = Number(payload.sub);

      await this.userService.update(userId, { isConfirmed: true });

      return { message: 'Votre compte a été confirmé avec succès.' };
    } catch {
      throw new HttpException(
        'Lien invalide ou expiré',
        HttpStatus.UNAUTHORIZED,
      );
    }
    interface IJwtPayload {
      sub: string | number;
      iat?: number;
      exp?: number;
    }
  }
}
