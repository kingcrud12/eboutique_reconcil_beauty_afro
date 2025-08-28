import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // 👈 seulement ton dossier Playwright
  testMatch: ['**/*.spec.ts'], // uniquement .spec.ts dans ce dossier
  use: {
    baseURL: process.env.API_URL || 'http://localhost:3003/reconcil/api/shop',
  },
});
