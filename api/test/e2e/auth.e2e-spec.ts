/**
 * Tests E2E pour l'authentification API
 * 
 * Ces tests vérifient les endpoints d'authentification
 * sans avoir besoin d'un navigateur.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('smoke - Devrait se connecter avec des identifiants valides', async () => {
      const loginDto = {
        email: process.env.TEST_EMAIL || 'test@example.com',
        password: process.env.TEST_PASSWORD || 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.access_token).toBeTruthy();
    });

    it('regression - Devrait retourner 401 avec email invalide', async () => {
      const loginDto = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('regression - Devrait retourner 401 avec mot de passe incorrect', async () => {
      const loginDto = {
        email: process.env.TEST_EMAIL || 'test@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('regression - Devrait retourner 400 avec données manquantes', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('smoke - Devrait créer un nouvel utilisateur', async () => {
      const registerDto = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registerDto.email);
    });

    it('regression - Devrait retourner 400 avec email déjà utilisé', async () => {
      const registerDto = {
        email: process.env.TEST_EMAIL || 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });
});

