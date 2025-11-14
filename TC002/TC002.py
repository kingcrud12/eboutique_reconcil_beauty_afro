import os
from utils.driver import create_driver
from utils.fill_login_form import fill_login_form

def test_login_user():
    # Mode headless en CI (GitHub Actions)
    is_ci = os.getenv("CI") == "true"
    headless_mode = is_ci or os.getenv("HEADLESS", "false").lower() == "true"

    driver = create_driver(headless=headless_mode)
    driver.get("https://eboutique-reconcil-beauty-afro.vercel.app")

    try:
        success = fill_login_form(driver)
        if success:
            print("✅ Formulaire de connexion rempli avec succès")
        else:
            print("⚠️ Échec du remplissage du formulaire")
            exit(1)

        # Pause uniquement en mode interactif (pas en CI)
        if not is_ci:
            input("Appuie sur Entrée pour fermer le navigateur...")

    finally:
        driver.quit()


if __name__ == "__main__":
    test_login_user()
