from selenium.common import TimeoutException
from selenium.webdriver.common.by import By
from utils.configure_actions import configure_actions


def validate_cart(driver):
    return configure_actions(driver, By.XPATH, "//button[normalize-space()='Valider le panier']")

