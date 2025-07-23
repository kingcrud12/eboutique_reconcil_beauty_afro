import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { LoginDto } from '../Models/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
