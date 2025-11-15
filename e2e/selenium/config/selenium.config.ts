/**
 * Configuration Selenium WebDriver
 * 
 * Ce fichier configure les drivers pour différents navigateurs
 * et définit les options communes pour tous les tests.
 */

import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as firefox from 'selenium-webdriver/firefox';
import { ServiceBuilder } from 'selenium-webdriver/chrome';

export enum Browser {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
}

export interface SeleniumConfig {
  browser: Browser;
  headless: boolean;
  baseUrl: string;
  implicitWait: number;
  pageLoadTimeout: number;
  windowSize?: { width: number; height: number };
}

/**
 * Configuration par défaut
 */
export const defaultConfig: SeleniumConfig = {
  browser: Browser.CHROME,
  headless: process.env.HEADLESS === 'true' || false,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  implicitWait: 10000, // 10 secondes
  pageLoadTimeout: 30000, // 30 secondes
  windowSize: { width: 1920, height: 1080 },
};

/**
 * Crée une instance WebDriver selon la configuration
 */
export async function createDriver(config: SeleniumConfig = defaultConfig): Promise<WebDriver> {
  let driver: WebDriver;

  const browser = process.env.BROWSER || config.browser;

  switch (browser) {
    case Browser.FIREFOX:
      driver = await createFirefoxDriver(config);
      break;
    case Browser.CHROME:
    default:
      driver = await createChromeDriver(config);
      break;
  }

  // Configuration commune
  await driver.manage().setTimeouts({
    implicit: config.implicitWait,
    pageLoad: config.pageLoadTimeout,
  });

  if (config.windowSize) {
    await driver.manage().window().setSize(
      config.windowSize.width,
      config.windowSize.height
    );
  } else {
    await driver.manage().window().maximize();
  }

  return driver;
}

/**
 * Crée un driver Chrome
 */
async function createChromeDriver(config: SeleniumConfig): Promise<WebDriver> {
  const options = new chrome.Options();

  if (config.headless) {
    options.addArguments('--headless=new');
  }

  // Options pour la stabilité des tests
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-infobars');
  options.addArguments('--disable-notifications');
  options.addArguments('--remote-allow-origins=*');

  // Désactiver les logs Chrome
  options.setLoggingPrefs({ browser: 'SEVERE' });

  // Utiliser le service ChromeDriver avec la version automatique
  const chromedriverPath = require('chromedriver').path;
  const service = new ServiceBuilder(chromedriverPath);

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();
}

/**
 * Crée un driver Firefox
 */
async function createFirefoxDriver(config: SeleniumConfig): Promise<WebDriver> {
  const options = new firefox.Options();

  if (config.headless) {
    options.addArguments('--headless');
  }

  // Options pour la stabilité
  options.setPreference('dom.webnotifications.enabled', false);
  options.setPreference('media.navigator.streams.fake', true);

  return new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();
}

/**
 * Ferme proprement le driver
 */
export async function quitDriver(driver: WebDriver): Promise<void> {
  try {
    await driver.quit();
  } catch (error) {
    console.error('Erreur lors de la fermeture du driver:', error);
  }
}

