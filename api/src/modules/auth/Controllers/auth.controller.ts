import {
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/modules/user/Services/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import axios from 'axios';
import { PrismaService } from 'src/prisma';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
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

  @Post('callback')
  async callback(
    @Body() body: { code: string; code_verifier: string; redirect_uri: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { code, code_verifier, redirect_uri } = body;

    if (!code || !code_verifier || !redirect_uri) {
      throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1️⃣ Échange code PKCE contre tokens Auth0
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
          redirect_uri,
          code_verifier,
        },
      );

      const access_token = tokenRes.data.access_token;

      // 2️⃣ Récupération du profil utilisateur depuis Auth0
      interface Auth0User {
        sub: string;
        email: string;
        name?: string;
        firstName?: string;
        lastName?: string;
      }

      const userRes = await axios.get<Auth0User>(
        `https://${this.AUTH0_DOMAIN}/userinfo`,
        { headers: { Authorization: `Bearer ${access_token}` } },
      );

      const auth0User = userRes.data;

      // 3️⃣ Vérifie si l’utilisateur existe en DB, sinon crée-le
      let user = await this.userService.getByEmail(auth0User.email);
      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email: auth0User.email,
            firstName: auth0User.firstName || auth0User.name || 'User',
            lastName: auth0User.lastName || '',
            password: Math.random().toString(36).slice(-8), // mot de passe aléatoire pour social login
            isConfirmed: true,
          },
        });
      }

      // 4️⃣ Génère un JWT interne pour ton app avec l'id user
      const jwtPayload = { userId: user.id };
      const jwtToken = this.jwtService.sign(jwtPayload, { expiresIn: '1d' });

      // 5️⃣ Crée un cookie httpOnly pour la session
      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 jour
      });

      // 6️⃣ Retourne un status 200 avec l’utilisateur
      return { message: 'Authentification réussie', user };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          'Auth0 callback error:',
          err.response?.data || err.message,
        );
      } else if (err instanceof Error) {
        console.error('Auth0 callback error:', err.message);
      } else {
        console.error('Auth0 callback error: unknown error', err);
      }

      throw new HttpException(
        'OAuth token exchange failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --- LOGOUT ---
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    const auth0LogoutUrl = `${process.env.AUTH0_LOGOUT_URL}?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(process.env.REDIRECT_URL_AFTER_LOGOUT)}`;

    res.redirect(auth0LogoutUrl);

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
