from utils.driver import create_driver
from utils.fill_login_form import fill_login_form

def test_login_user():

    driver = create_driver(headless=False)
    driver.get("https://eboutique-reconcil-beauty-afro.vercel.app")

    try:
        success = fill_login_form(driver)
        if success:
            print("✅ Formulaire d'inscription rempli avec succès")
        else:
            print("⚠️ Échec du remplissage du formulaire")

        input("Appuie sur Entrée pour fermer le navigateur...")

    finally:
        driver.quit()


if __name__ == "__main__":
    test_login_user()
