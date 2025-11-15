from selenium.webdriver.common.by import By
from utils.wait_element import wait_for_element


def is_login_card_display(driver):
    element = wait_for_element(driver, By.XPATH, "//button[normalize-space()='Se connecter']", timeout=20)
    return element is not None
