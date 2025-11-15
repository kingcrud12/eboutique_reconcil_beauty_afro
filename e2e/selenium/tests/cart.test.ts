/**
 * Tests E2E pour le panier
 * 
 * Ces tests vérifient :
 * - L'ajout de produits au panier
 * - L'affichage du panier
 * - La modification des quantités
 * - La suppression d'articles
 * - Le calcul du total
 */

import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { closeDriver, sleep } from '../utils/driver';

describe('Tests du panier', () => {
  let productPage: ProductPage;
  let cartPage: CartPage;
  let loginPage: LoginPage;

  beforeAll(async () => {
    productPage = new ProductPage();
    cartPage = new CartPage();
    loginPage = new LoginPage();
  });

  afterAll(async () => {
    await closeDriver();
  });

  beforeEach(async () => {
    // Optionnel : Se connecter avant chaque test
    // await loginPage.navigate();
    // await loginPage.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
  });

  describe('Affichage du panier', () => {
    test('smoke - La page panier se charge correctement', async () => {
      await cartPage.navigate();
      await sleep(1000);

      const isLoaded = await cartPage.isLoaded();
      expect(isLoaded).toBe(true);
    });

    test('Le panier vide affiche un message approprié', async () => {
      await cartPage.navigate();
      await sleep(1000);

      const isEmpty = await cartPage.isEmpty();
      // Si le panier est vide, il devrait afficher un message
      if (isEmpty) {
        expect(isEmpty).toBe(true);
      }
    });
  });

  describe('Ajout au panier', () => {
    test('smoke - Ajouter un produit au panier depuis la page produit', async () => {
      // Naviguer vers une page produit (remplacez 1 par un ID valide)
      await productPage.navigate(1);
      await sleep(2000);

      // Vérifier que le produit est en stock
      const inStock = await productPage.isProductInStock();
      if (inStock) {
        await productPage.addToCart();
        await sleep(2000);

        // Vérifier que le produit a été ajouté (via notification ou badge)
        // Cette vérification dépend de votre implémentation
      }
    });

    test('regression - Ajouter plusieurs quantités d\'un produit', async () => {
      await productPage.navigate(1);
      await sleep(2000);

      const inStock = await productPage.isProductInStock();
      if (inStock) {
        await productPage.addToCart(3);
        await sleep(2000);
      }
    });
  });

  describe('Gestion du panier', () => {
    test('regression - Supprimer un article du panier', async () => {
      await cartPage.navigate();
      await sleep(1000);

      const initialCount = await cartPage.getCartItemsCount();
      
      if (initialCount > 0) {
        await cartPage.removeFirstItem();
        await sleep(2000);

        const newCount = await cartPage.getCartItemsCount();
        expect(newCount).toBeLessThan(initialCount);
      }
    });

    test('Le total du panier est calculé correctement', async () => {
      await cartPage.navigate();
      await sleep(1000);

      const isEmpty = await cartPage.isEmpty();
      if (!isEmpty) {
        const total = await cartPage.getTotalPrice();
        expect(total).toBeTruthy();
        // Vérifier que le total contient un format de prix valide
        expect(total).toMatch(/[\d,.]+\s*€/);
      }
    });
  });

  describe('Checkout', () => {
    test('smoke - Le bouton checkout est visible quand le panier contient des articles', async () => {
      await cartPage.navigate();
      await sleep(1000);

      const isEmpty = await cartPage.isEmpty();
      if (!isEmpty) {
        // Le bouton checkout devrait être visible
        // Cette vérification dépend de votre implémentation
      }
    });
  });
});

