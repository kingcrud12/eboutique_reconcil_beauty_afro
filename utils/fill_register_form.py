from selenium.webdriver.common.by import By
from utils.get_env_var import get_env_var
from utils.fill_input import fill_input
from utils.click_element import click_element
from utils.logger_util import click_login_div, click_on_login_button
from utils.create_account import click_on_create_account_text

def fill_register_form(driver):
    try:
        click_login_div(driver)
        click_on_login_button(driver)
        click_on_create_account_text(driver)

        lastname = get_env_var("LASTNAME")
        firstname = get_env_var("FIRSTNAME")
        username = get_env_var("LOGIN_USERNAME_REGISTER")
        password = get_env_var("LOGIN_PASSWORD")

        fill_input(driver, By.ID, "lastName", lastname)
        fill_input(driver, By.ID, "firstName", firstname)
        fill_input(driver, By.ID, "email", username)
        fill_input(driver, By.ID, "password", password)

        click_element(driver, By.XPATH, "//button[translate(normalize-space(.), \"'’\", '') = 'Sinscrire']")

        return True

    except Exception as e:
        print(f"⚠️ Erreur lors du remplissage du formulaire: {e}")
        return False
