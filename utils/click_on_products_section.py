from utils.configure_actions import configure_actions
from selenium.webdriver.common.by import By

def click_on_products_section(driver):
    configure_actions(driver, By.XPATH, "//a[normalize-space()='Nos produits']")

