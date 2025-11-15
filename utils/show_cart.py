from selenium.common import TimeoutException
from selenium.webdriver.common.by import By
from utils.configure_actions import configure_actions


def show_cart(driver):
    configure_actions(driver, By.CSS_SELECTOR, "svg.lucide-shopping-cart")

