/**
 * Utilitaires pour la gestion du WebDriver
 * 
 * Ce fichier fournit des helpers pour faciliter l'utilisation de Selenium
/**
 * Utilitaires pour la gestion du WebDriver
 * 
 * Ce fichier fournit des helpers pour faciliter l'utilisation de Selenium
 */

import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import { createDriver, quitDriver, defaultConfig } from '../config/selenium.config';

let driverInstance: WebDriver | null = null;

/**
 * Obtient ou crée une instance de driver (singleton)
 */
export async function getDriver(): Promise<WebDriver> {
  if (!driverInstance) {
    driverInstance = await createDriver(defaultConfig);
  }
  return driverInstance;
}

/**
 * Ferme le driver
 */
export async function closeDriver(): Promise<void> {
  if (driverInstance) {
    await quitDriver(driverInstance);
    driverInstance = null;
  }
}

/**
 * Navigue vers une URL
 */
export async function navigateTo(url: string): Promise<void> {
  const driver = await getDriver();
  await driver.get(url);
}

/**
 * Attend qu'un élément soit visible
 */
export async function waitForElement(
  locator: By,
  timeout: number = 10000
): Promise<WebElement> {
  const driver = await getDriver();
  return await driver.wait(until.elementLocated(locator), timeout);
}

/**
 * Attend qu'un élément soit cliquable
 */
export async function waitForClickable(
  locator: By,
  timeout: number = 10000
): Promise<WebElement> {
  const driver = await getDriver();
  const element = await waitForElement(locator, timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  return element;
}

/**
 * Clique sur un élément
 */
export async function clickElement(locator: By): Promise<void> {
  const element = await waitForClickable(locator);
  await element.click();
}

/**
 * Saisit du texte dans un champ
 */
export async function typeText(locator: By, text: string): Promise<void> {
  const element = await waitForElement(locator);
  await element.clear();
  await element.sendKeys(text);
}

/**
 * Récupère le texte d'un élément
 */
export async function getText(locator: By): Promise<string> {
  const element = await waitForElement(locator);
  return await element.getText();
}

/**
 * Vérifie si un élément est visible
 */
export async function isElementVisible(locator: By): Promise<boolean> {
  try {
    const driver = await getDriver();
    const element = await driver.findElement(locator);
    return await element.isDisplayed();
  } catch {
    return false;
  }
}

/**
 * Prend une capture d'écran
 */
export async function takeScreenshot(filename: string): Promise<void> {
  const driver = await getDriver();
  const screenshot = await driver.takeScreenshot();
  const fs = require('fs');
  const path = require('path');
  
  const screenshotsDir = path.join(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(screenshotsDir, `${filename}.png`),
    screenshot,
    'base64'
  );
}

/**
 * Fait défiler jusqu'à un élément
 */
export async function scrollToElement(locator: By): Promise<void> {
  const driver = await getDriver();
  const element = await waitForElement(locator);
  await driver.executeScript('arguments[0].scrollIntoView(true);', element);
  await driver.sleep(500); // Attendre le scroll
}

/**
 * Attend un délai (à utiliser avec parcimonie)
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

