from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import os

def create_driver(headless=False):
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    if headless:
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")

    # Utiliser webdriver-manager si disponible, sinon utiliser le chemin personnalisé
    chromedriver_path = os.getenv("CHROMEDRIVER_PATH")
    
    if chromedriver_path:
        service = Service(chromedriver_path)
    else:
        # Essayer d'utiliser webdriver-manager
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            service = Service(ChromeDriverManager().install())
        except ImportError:
            # Fallback vers le chemin par défaut
            service = Service("/opt/homebrew/bin/chromedriver")
    
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(2)
    return driver
