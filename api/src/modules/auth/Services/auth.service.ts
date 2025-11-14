import { Injectable, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/Services/user.service';
import * as bcrypt from 'bcrypt';
import { IUserprivate } from '../../user/Interfaces/user.interface';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { JwtRequest } from '../jwt/Jwt-request.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<IUserprivate | null> {
    const user = await this.userService.getByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string } | null> {
    const user = await this.validateUser(email, password);
    if (!user) {
      return null;
    }

    const payload = {
      userId: user.id,
      email: user.email,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }
  logout(): { message: string } {
    return {
      message: 'Logged out successfully (client must discard the token)',
    };
  }
  @Patch('confirm-account')
  @UseGuards(JwtAuthGuard)
  async confirmAccount(@Req() req: JwtRequest) {
    const userId = req.user.userId;

    return this.userService.update(userId, { isConfirmed: true });
  }
}
