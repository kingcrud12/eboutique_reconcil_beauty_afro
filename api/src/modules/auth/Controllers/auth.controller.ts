import {
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  Get,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/Services/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import axios from 'axios';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  CLIENT_ID = process.env.AUTH0_CLIENT_ID;
  CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
  REDIRECT_URI = process.env.AUTH0_REDIRECT_URI;

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
    @Query('state') state: string, // ici tu peux stocker le code_verifier côté front dans sessionStorage et le récupérer
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
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'Logged out' };
  }

  // --- CONFIRM ACCOUNT ---
  @Patch('confirm-account')
  @ApiOperation({
    summary: 'Confirmation de la création de mon compte utilisateur',
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
