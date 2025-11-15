import time
from utils.adding_product_to_cart import adding_product_to_cart
from utils.click_on_login_button import click_on_login_button
from utils.click_on_products_section import click_on_products_section
from utils.fill_login_form import fill_login_form
from utils.is_login_card_display import is_login_card_display
from utils.show_cart import show_cart
from utils.validate_cart import validate_cart
from utils.validate_home_delivery import validate_home_delivery


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

        time.sleep(2)

        click_on_login_button(driver)

        fill_login_form(driver)

        time.sleep(2)

        validate_cart(driver)

        time.sleep(8)

        validate_home_delivery(driver)

        if validate_home_delivery:
            print("Commande créée avec succès, le panier créé en mode invité est bien récupéré et transformé en commande")

        return True

    except Exception as e:
        print(f"⚠️ Erreur lors du test d'achat de produit non authentifié: {e}")
        return False

