/**
 * Tests E2E pour l'authentification
 * 
 * Ces tests vérifient :
 * - La connexion utilisateur
 * - La déconnexion
 * - La gestion des erreurs
 * - La navigation après connexion
 */

import { LoginPage } from '../pages/LoginPage';
import { closeDriver, navigateTo, sleep } from '../utils/driver';

describe('Tests d\'authentification', () => {
  let loginPage: LoginPage;

  beforeAll(async () => {
    loginPage = new LoginPage();
  });

  afterAll(async () => {
    await closeDriver();
  });

  beforeEach(async () => {
    await loginPage.navigate();
    await sleep(1000); // Attendre le chargement
  });

  describe('Page de connexion', () => {
    test('smoke - La page de connexion se charge correctement', async () => {
      const isLoaded = await loginPage.isLoaded();
      expect(isLoaded).toBe(true);
    });

    test('Le champ email est visible', async () => {
      const isVisible = await loginPage.isEmailFieldVisible();
      expect(isVisible).toBe(true);
    });
  });

  describe('Connexion utilisateur', () => {
    test('smoke - Connexion réussie avec des identifiants valides', async () => {
      // ⚠️ Remplacez par des identifiants de test valides
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const testPassword = process.env.TEST_PASSWORD || 'password123';

      await loginPage.login(testEmail, testPassword);
      await sleep(2000); // Attendre la redirection

      const currentUrl = await loginPage.getCurrentUrl();
      // Vérifier qu'on n'est plus sur la page de login
      expect(currentUrl).not.toContain('/login');
    });

    test('regression - Erreur avec email invalide', async () => {
      await loginPage.login('invalid-email', 'password123');
      await sleep(1000);

      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });

    test('regression - Erreur avec mot de passe incorrect', async () => {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      
      await loginPage.login(testEmail, 'wrongpassword');
      await sleep(1000);

      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });

    test('regression - Erreur avec champs vides', async () => {
      await loginPage.login('', '');
      await sleep(1000);

      // Le formulaire ne devrait pas se soumettre ou afficher une erreur
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });
  });

  describe('Navigation', () => {
    test('Le lien d\'inscription redirige vers la page d\'inscription', async () => {
      await loginPage.clickRegisterLink();
      await sleep(1000);

      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('register');
    });
  });
});

