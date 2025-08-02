import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { LoginDto } from '../Models/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/Services/user.service';
import { JwtRequest } from '../jwt/Jwt-request.interface';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const token = await this.authService.login(email, password);

    if (!token) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    return token;
  }

  @Post('logout')
  logout(): { message: string } {
    return this.authService.logout();
  }

  @Patch('confirm-account')
  @UseGuards(JwtAuthGuard)
  async confirmAccount(@Req() req: JwtRequest) {
    const userId = req.user.userId;

    if (!userId) {
      throw new HttpException('member only', HttpStatus.UNAUTHORIZED);
    }

    return this.userService.update(userId, { isConfirmed: true });
  }
}
