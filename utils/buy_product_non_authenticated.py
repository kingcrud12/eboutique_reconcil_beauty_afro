import time
from utils.adding_product_to_cart import adding_product_to_cart
from utils.click_on_products_section import click_on_products_section
from utils.is_login_card_display import is_login_card_display
from utils.show_cart import show_cart
from utils.validate_cart import validate_cart


def buy_product_non_authenticated(driver):
    try:
        click_on_products_section(driver)

        adding_product_to_cart(driver)

        time.sleep(2)

        show_cart(driver)

        cart_validated = validate_cart(driver)

        if cart_validated:
            print("Panier créé avec succès, le front créé bien un panier pour l'utilisateur non connecté")
        else:
            print("⚠️ Échec de la validation du panier")
            return False

        login_card_displayed = is_login_card_display(driver)

        if login_card_displayed:
            print("le front demande bien à l'utilisateur non connecté de se connecter pour valider le panier")
        else:
            print("⚠️ Le front n'a pas demandé la connexion")
            return False

        return True

    except Exception as e:
        print(f"⚠️ Erreur lors du test d'achat de produit non authentifié: {e}")
        return False

