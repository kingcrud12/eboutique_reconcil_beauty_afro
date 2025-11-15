from utils.click_on_login_button import click_on_login_button
from utils.driver import create_driver


def login_and_validate_delivery_adress():
    driver = create_driver(headless=False)

    click_on_login_button(driver)

    input("Appuie sur Entrée pour fermer le navigateur...")


if __name__ == "__main__":
    login_and_validate_delivery_adress()
