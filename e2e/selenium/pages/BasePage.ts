/**
 * Page Object de base
 * 
 * Toutes les pages héritent de cette classe pour avoir
 * accès aux méthodes communes.
 */

import { WebDriver, By, WebElement } from 'selenium-webdriver';
import { getDriver, waitForElement, waitForClickable, clickElement, typeText, getText } from '../utils/driver';

export abstract class BasePage {
  protected driver: WebDriver;

  constructor() {
    // Le driver sera initialisé lors de la première utilisation
    this.driver = null as any;
  }

  /**
   * Initialise le driver (appelé avant chaque action)
   */
  protected async initDriver(): Promise<void> {
    if (!this.driver) {
      this.driver = await getDriver();
    }
  }

  /**
   * Navigue vers l'URL de la page
   */
  abstract navigate(): Promise<void>;

  /**
   * Vérifie que la page est chargée
   */
  abstract isLoaded(): Promise<boolean>;

  /**
   * Attend qu'un élément soit visible
   */
  protected async waitForElement(locator: By): Promise<WebElement> {
    await this.initDriver();
    return await waitForElement(locator);
  }

  /**
   * Clique sur un élément
   */
  protected async click(locator: By): Promise<void> {
    await this.initDriver();
    await clickElement(locator);
  }

  /**
   * Saisit du texte
   */
  protected async type(locator: By, text: string): Promise<void> {
    await this.initDriver();
    await typeText(locator, text);
  }

  /**
   * Récupère le texte d'un élément
   */
  protected async getText(locator: By): Promise<string> {
    await this.initDriver();
    return await getText(locator);
  }

  /**
   * Récupère l'URL actuelle
   */
  public async getCurrentUrl(): Promise<string> {
    await this.initDriver();
    return await this.driver.getCurrentUrl();
  }

  /**
   * Récupère le titre de la page
   */
  protected async getTitle(): Promise<string> {
    await this.initDriver();
    return await this.driver.getTitle();
  }
}

