from utils.wait_element import wait_for_element
from selenium.common import TimeoutException

def configure_actions(driver, by, selector):
    try:
        element = wait_for_element(driver, by, selector)
        if element is None:
            print(f"⚠️ Élément non trouvé: {by}={selector}")
            return False
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.click()
        return True
    except TimeoutException:
        print(f"⚠️ TimeoutException pour: {by}={selector}")
        pass
    except (AttributeError, Exception) as e:
        print(f"⚠️ Erreur dans configure_actions pour {by}={selector}: {e}")
    return False
