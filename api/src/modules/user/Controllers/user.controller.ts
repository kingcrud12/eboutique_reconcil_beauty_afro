// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { IUser, IUserCreate } from '../Interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from '../Models/user.dto';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import { MailService } from 'src/modules/mailer/mailer.service';
import { AuthService } from 'src/modules/auth/Services/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() userDto: CreateUserDto) {
    const user = await this.isUserExistOrNot(userDto.email);
    const { email, password } = userDto;
    if (user) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }
    const { token } = await this.authService.login(email, password);
    await this.mailerService.sendConfirmationEmail(user.email, token);
    return await this.userService.create(userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: JwtRequest) {
    const userId = req.user.userId;
    return this.userService.get(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: JwtRequest,
  ) {
    const userId = req.user.userId;
    const updatedUser = await this.userService.update(userId, updateUserDto);

    if (!updatedUser) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async isUserExistOrNot(
    email?: string,
    id?: number,
  ): Promise<IUser | IUserCreate> {
    if (email) {
      return await this.userService.getByEmail(email);
    }
    return await this.userService.get(id);
  }
}
