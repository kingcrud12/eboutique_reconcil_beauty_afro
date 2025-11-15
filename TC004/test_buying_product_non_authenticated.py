import os
from selenium.webdriver.remote.webdriver import WebDriver
from utils.buy_product_non_authenticated import buy_product_non_authenticated
from utils.driver import create_driver
from utils.get_url import get_url


class TestBuyingProductNonAuthenticated:
    
    def __init__(self):
        self.driver: WebDriver = None
        self.is_ci = os.getenv("CI") == "true"
        self.headless_mode = self.is_ci or os.getenv("HEADLESS", "false").lower() == "true"
    
    def setup(self):
        self.driver = create_driver(headless=self.headless_mode)
        get_url(self.driver)
    
    def teardown(self):
        if self.driver:
            self.driver.quit()
    
    def run(self):
        try:
            self.setup()
            success = buy_product_non_authenticated(self.driver)
            
            if success:
                print("✅ Test d'achat de produit non authentifié réussi")
            else:
                print("⚠️ Échec du test d'achat de produit non authentifié")
                exit(1)
            
            if not self.is_ci:
                input("Appuie sur Entrée pour fermer le navigateur...")
        
        finally:
            self.teardown()

