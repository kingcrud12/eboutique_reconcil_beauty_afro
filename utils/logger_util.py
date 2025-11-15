from selenium.common import TimeoutException
from selenium.webdriver.common.by import By

from utils.wait_element import wait_for_element


def click_login_div(driver):
    try:
        el = wait_for_element(driver, By.CSS_SELECTOR, "svg.lucide-user", timeout=10)
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
        el.click()
        return True
    except TimeoutException:
        pass
    return False

def click_on_login_button(driver):
    try:
        btn = wait_for_element(driver, By.XPATH, "//button[normalize-space()='Connexion']", timeout=10)
        btn.click()
        return True
    except TimeoutException:
        pass
    return False

