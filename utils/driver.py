from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import os

def create_driver(headless=False):
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    if headless:
        options.add_argument("--headless=new")

    service = Service(os.getenv("CHROMEDRIVER_PATH", "/opt/homebrew/bin/chromedriver"))
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(2)
    return driver
