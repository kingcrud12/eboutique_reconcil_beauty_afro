/**
 * Page Object pour la page produit
 */

import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { navigateTo } from '../utils/driver';

export class ProductPage extends BasePage {
  private readonly productTitle = By.css('h1') || By.css('[data-testid="product-title"]');
  private readonly productPrice = By.css('[data-testid="product-price"]') || By.css('.price');
  private readonly addToCartButton = By.css('button[data-testid="add-to-cart"]') || By.xpath('//button[contains(text(), "Ajouter au panier")]');
  private readonly cartIcon = By.css('[data-testid="cart-icon"]') || By.css('a[href*="cart"]');
  private readonly productImage = By.css('img[data-testid="product-image"]') || By.css('.product-image img');
  private readonly quantityInput = By.css('input[type="number"]') || By.css('[data-testid="quantity"]');
  private readonly stockStatus = By.css('[data-testid="stock-status"]') || By.css('.stock');

  async navigate(productId?: number): Promise<void> {
    const url = productId 
      ? `${process.env.BASE_URL || 'http://localhost:3000'}/product/${productId}`
      : `${process.env.BASE_URL || 'http://localhost:3000'}/products`;
    await navigateTo(url);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.productTitle);
      return true;
    } catch {
      return false;
    }
  }

  async getProductTitle(): Promise<string> {
    return await this.getText(this.productTitle);
  }

  async getProductPrice(): Promise<string> {
    return await this.getText(this.productPrice);
  }

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.type(this.quantityInput, quantity.toString());
    }
    await this.click(this.addToCartButton);
  }

  async clickCartIcon(): Promise<void> {
    await this.click(this.cartIcon);
  }

  async isProductInStock(): Promise<boolean> {
    try {
      const status = await this.getText(this.stockStatus);
      return !status.toLowerCase().includes('indisponible');
    } catch {
      return true; // Si pas de statut, on assume disponible
    }
  }
}

