from utils.configure_actions import configure_actions
from selenium.webdriver.common.by import By

def validate_home_delivery(driver):
    configure_actions(driver, By.XPATH, "//button[normalize-space()='Livraison à domicile (Colissimo)']")
