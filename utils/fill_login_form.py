from selenium.webdriver.common.by import By
from utils.get_env_var import get_env_var
from utils.fill_input import fill_input
from utils.click_element import click_element
from utils.logger_util import click_login_div, click_on_login_button


def fill_login_form(driver, username_env="LOGIN_USERNAME", password_env="LOGIN_PASSWORD"):
    try:
        click_login_div(driver)
        click_on_login_button(driver)

        username = get_env_var(username_env)
        password = get_env_var(password_env)

        fill_input(driver, By.ID, "email", username)
        fill_input(driver, By.ID, "password", password)

        click_element(driver, By.XPATH, "//button[normalize-space()='Se connecter']")

        return True

    except Exception as e:
        print(f"⚠️ Erreur lors du remplissage du formulaire: {e}")
        return False
