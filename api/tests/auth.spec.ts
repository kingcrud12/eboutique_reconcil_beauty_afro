// tests/api/auth.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('API Auth & Produits', () => {
  test('Login utilisateur', async ({ baseURL }) => {
    // 1) Crée un contexte de requêtes HTTP
    const api = await request.newContext({ baseURL });

    // 2) Login
    const loginRes = await api.post('/auth/login', {
      data: { email: 'test@example.com', password: 'Passw0rd!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    //const { access_token } = await loginRes.json();
  });
});
