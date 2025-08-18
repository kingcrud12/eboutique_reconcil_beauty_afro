import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { LoginDto } from '../Models/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/Services/user.service';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Connexion à mon compte',
  })
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const token = await this.authService.login(email, password);

    if (!token) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    return token;
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
