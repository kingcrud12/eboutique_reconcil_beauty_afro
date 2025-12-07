from utils.configure_actions import configure_actions
from selenium.webdriver.common.by import By

def click_on_login_button(driver):
    configure_actions(driver, By.XPATH, "//button[normalize-space()='Se connecter']")
