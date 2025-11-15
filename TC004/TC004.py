import os
import time

from utils.adding_product_to_cart import adding_product_to_cart
from utils.click_on_products_section import click_on_products_section
from utils.driver import create_driver
from utils.get_url import get_url
from utils.is_login_card_display import is_login_card_display
from utils.show_cart import show_cart
from utils.validate_cart import validate_cart


def test_buying_product_non_authenticated():
    is_ci = os.getenv("CI") == "true"
    headless_mode = is_ci or os.getenv("HEADLESS", "false").lower() == "true"

    driver = None
    try:
        driver = create_driver(headless=headless_mode)

        get_url(driver)

        click_on_products_section(driver)

        adding_product_to_cart(driver)

        time.sleep(2)

        show_cart(driver)

        cart_validated = validate_cart(driver)

        if cart_validated:
            print("Panier créé avec succès, le front créé bien un panier pour l'utilisateur non connecté")

        login_card_displayed = is_login_card_display(driver)

        if login_card_displayed:
            print("le front demande bien à l'utilisateur non connecté de se connecter pour valider le panier")

        if not is_ci:
            input("Appuie sur Entrée pour fermer le navigateur...")
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    test_buying_product_non_authenticated()
