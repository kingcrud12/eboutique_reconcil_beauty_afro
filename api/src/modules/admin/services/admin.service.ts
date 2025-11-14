import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/Services/user.service';
import { IUser } from '../../user/Interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../auth/Services/auth.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<IUser[]> {
    return this.userService.getUsers();
  }

  async login(email: string): Promise<{ token: string }> {
    const user = await this.userService.getByEmail(email);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  logout(): { message: string } {
    return {
      message: 'Admin logged out (client must discard the token)',
    };
  }
}
