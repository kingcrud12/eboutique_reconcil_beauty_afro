from utils.wait_element import wait_for_element
from selenium.common import TimeoutException

def configure_actions(driver, by, selector):
    try:
        element = wait_for_element(driver, by, selector)
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.click()
        return True
    except TimeoutException:
        pass
    return False
