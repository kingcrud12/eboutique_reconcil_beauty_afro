/**
 * Tests E2E pour les produits API
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Products E2E Tests', () => {
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

  describe('GET /products', () => {
    it('smoke - Devrait retourner la liste des produits', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Les produits devraient avoir les propriétés requises', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      if (response.body.length > 0) {
        const product = response.body[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
      }
    });
  });

  describe('GET /products/:id', () => {
    it('smoke - Devrait retourner un produit spécifique', async () => {
      // Récupérer d'abord la liste pour avoir un ID valide
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      if (productsResponse.body.length > 0) {
        const productId = productsResponse.body[0].id;

        const response = await request(app.getHttpServer())
          .get(`/products/${productId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', productId);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('price');
      }
    });

    it('regression - Devrait retourner 404 pour un produit inexistant', async () => {
      await request(app.getHttpServer())
        .get('/products/99999')
        .expect(404);
    });
  });
});

