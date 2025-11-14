from utils.wait_element import wait_for_element

def fill_input(driver, by, selector, value, timeout=10):
    element = wait_for_element(driver, by, selector, timeout)
    if element:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.clear()
        element.send_keys(value)
        return True
    return False
