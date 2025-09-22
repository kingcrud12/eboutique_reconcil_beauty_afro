// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { IUser, IUserCreate } from '../Interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from '../Models/user.dto';
import { JwtRequest } from '../../auth/jwt/Jwt-request.interface';
import { MailService } from 'src/modules/mailer/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un compte utilisateur',
  })
  async create(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.isUserExistOrNot(userDto.email);
    if (user) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userService.create(userDto);

    const token = this.jwtService.sign(
      { sub: newUser.id },
      { expiresIn: '1d' },
    );

    await this.mailerService.sendConfirmationEmail(newUser.email, token);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      user: newUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Récupérer des informations de mon compte utilisateur',
  })
  async getProfile(@Req() req: JwtRequest) {
    const userId = req.user.userId;
    return this.userService.get(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({
    summary: 'Modifier mon compte utilisateur',
  })
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

  @Post('send-password-reset-link')
  @ApiOperation({
    summary: 'Envoyer un lien pour modifier mon mot de passe',
  })
  async resetPasswordLink(@Body('email') email: string) {
    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
    }

    const token = this.jwtService.sign({ sub: user.id }, { expiresIn: '15m' });

    await this.mailerService.sendPasswordResetEmail(user.email, token);

    return { message: 'Un e-mail de réinitialisation a été envoyé.' };
  }

  @Patch('reset-password')
  @ApiOperation({
    summary: 'Modifier mon mot de passe',
  })
  async resetPassword(
    @Query('token') token: string,
    @Body() body: { password: string },
  ) {
    if (!token) {
      throw new HttpException('Token manquant', HttpStatus.BAD_REQUEST);
    }

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new HttpException(
        'Token invalide ou expiré',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = Number(payload.sub);
    const updatedUser = await this.userService.update(userId, {
      password: body.password,
    });

    if (!updatedUser) {
      throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
    }

    return { message: 'Mot de passe mis à jour avec succès' };
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
