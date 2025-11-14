from selenium.common import TimeoutException
from selenium.webdriver.common.by import By

from utils.wait_element import wait_for_element


def click_on_create_account_text(driver):
    try:
        el = wait_for_element(driver, By.XPATH, "//a[normalize-space()='Créer un compte']", timeout=10)
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
        el.click()
        return True
    except TimeoutException:
        pass
    return False

