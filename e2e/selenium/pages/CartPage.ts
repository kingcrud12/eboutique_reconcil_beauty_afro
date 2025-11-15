/**
 * Page Object pour la page panier
 */

import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { navigateTo } from '../utils/driver';

export class CartPage extends BasePage {
  private readonly cartItems = By.css('[data-testid="cart-item"]') || By.css('.cart-item');
  private readonly emptyCartMessage = By.css('[data-testid="empty-cart"]') || By.xpath('//*[contains(text(), "panier est vide")]');
  private readonly checkoutButton = By.css('button[data-testid="checkout"]') || By.xpath('//button[contains(text(), "Commander")]');
  private readonly totalPrice = By.css('[data-testid="cart-total"]') || By.css('.total-price');
  private readonly removeItemButton = By.css('button[data-testid="remove-item"]') || By.css('.remove-item');
  private readonly updateQuantityInput = By.css('input[data-testid="quantity"]') || By.css('input[type="number"]');

  async navigate(): Promise<void> {
    await navigateTo(`${process.env.BASE_URL || 'http://localhost:3000'}/cart`);
  }

  async isLoaded(): Promise<boolean> {
    try {
      // La page peut être vide ou contenir des items
      await this.waitForElement(this.emptyCartMessage).catch(() => {});
      await this.waitForElement(this.cartItems).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  async getCartItemsCount(): Promise<number> {
    try {
      await this.initDriver();
      const items = await this.driver.findElements(this.cartItems);
      return items.length;
    } catch {
      return 0;
    }
  }

  async isEmpty(): Promise<boolean> {
    try {
      await this.waitForElement(this.emptyCartMessage);
      return true;
    } catch {
      return false;
    }
  }

  async getTotalPrice(): Promise<string> {
    return await this.getText(this.totalPrice);
  }

  async clickCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
  }

  async removeFirstItem(): Promise<void> {
    await this.initDriver();
    const removeButtons = await this.driver.findElements(this.removeItemButton);
    if (removeButtons.length > 0) {
      await removeButtons[0].click();
    }
  }
}

