import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/Services/user.service';
import * as bcrypt from 'bcrypt';
import { IUserprivate } from '../../user/Interfaces/user.interface';

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
      sub: user.id,
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
}
