import os
from typing import Callable
from selenium.webdriver.remote.webdriver import WebDriver
from utils.driver import create_driver
from utils.get_url import get_url


class BaseTest:
    
    def __init__(
        self,
        test_function: Callable[[WebDriver], bool],
        success_message: str,
        failure_message: str,
        exit_on_failure: bool = True
    ):
        self.driver: WebDriver = None
        self.test_function = test_function
        self.success_message = success_message
        self.failure_message = failure_message
        self.exit_on_failure = exit_on_failure
        self.is_ci = os.getenv("CI") == "true"
        self.headless_mode = self.is_ci or os.getenv("HEADLESS", "false").lower() == "true"
    
    def setup(self):
        self.driver = create_driver(headless=self.headless_mode)
        get_url(self.driver)
    
    def teardown(self):
        if self.driver:
            self.driver.quit()
    
    def run(self):
        try:
            self.setup()
            success = self.test_function(self.driver)
            
            if success:
                print(self.success_message)
            else:
                print(self.failure_message)
                if self.exit_on_failure:
                    exit(1)

            if not self.is_ci:
                input("Appuie sur Entrée pour fermer le navigateur...")
        
        finally:
            self.teardown()

