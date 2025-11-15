/**
 * Page Object pour la page de connexion
 * 
 * Cette classe encapsule tous les éléments et actions
 * liés à la page de connexion.
 */

import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { navigateTo } from '../utils/driver';

export class LoginPage extends BasePage {
  // Localisateurs des éléments de la page
  private readonly emailInput = By.id('email') || By.name('email') || By.css('input[type="email"]');
  private readonly passwordInput = By.id('password') || By.name('password') || By.css('input[type="password"]');
  private readonly loginButton = By.css('button[type="submit"]') || By.xpath('//button[contains(text(), "Connexion")]');
  private readonly errorMessage = By.css('.error-message') || By.css('[role="alert"]');
  private readonly registerLink = By.linkText('Créer un compte') || By.partialLinkText('inscription');

  /**
   * Navigue vers la page de connexion
   */
  async navigate(): Promise<void> {
    await navigateTo(`${process.env.BASE_URL || 'http://localhost:3000'}/login`);
  }

  /**
   * Vérifie que la page est chargée
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.emailInput);
      await this.waitForElement(this.passwordInput);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Se connecte avec email et mot de passe
   */
  async login(email: string, password: string): Promise<void> {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  /**
   * Récupère le message d'erreur s'il existe
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      return await this.getText(this.errorMessage);
    } catch {
      return null;
    }
  }

  /**
   * Clique sur le lien d'inscription
   */
  async clickRegisterLink(): Promise<void> {
    await this.click(this.registerLink);
  }

  /**
   * Vérifie si le champ email est visible
   */
  async isEmailFieldVisible(): Promise<boolean> {
    try {
      await this.waitForElement(this.emailInput);
      return true;
    } catch {
      return false;
    }
  }
}

