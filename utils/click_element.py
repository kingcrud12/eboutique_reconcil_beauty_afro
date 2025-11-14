from utils.wait_element import wait_for_element

def click_element(driver, by, selector, timeout=10):
    element = wait_for_element(driver, by, selector, timeout)
    if element:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.click()
        return True
    return False
