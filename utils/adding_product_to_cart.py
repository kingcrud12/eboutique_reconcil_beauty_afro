from utils.configure_actions import configure_actions
from selenium.webdriver.common.by import By

def adding_product_to_cart(driver):
    configure_actions(driver, By.XPATH, "//button[normalize-space()='Ajouter au panier']" )

