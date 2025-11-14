import os
from utils.driver import create_driver
from utils.fill_login_form import fill_login_form

def test_login_user_with_wrong_credentials():
    # Mode headless en CI (GitHub Actions)
    is_ci = os.getenv("CI") == "true"
    headless_mode = is_ci or os.getenv("HEADLESS", "false").lower() == "true"

    driver = create_driver(headless=headless_mode)
    driver.get("https://eboutique-reconcil-beauty-afro.vercel.app")

    try:
        success = fill_login_form(driver, username_env="WRONG_EMAIL", password_env="WRONG_PASSWORD")
        if success:
            print("✅ Formulaire de connexion rempli avec succès (test négatif)")
        else:
            print("⚠️ Échec du remplissage du formulaire (attendu pour test négatif)")
            # Pour un test négatif, on peut considérer que l'échec est attendu
            # ou vérifier qu'un message d'erreur est affiché

        # Pause uniquement en mode interactif (pas en CI)
        if not is_ci:
            input("Appuie sur Entrée pour fermer le navigateur...")

    finally:
        driver.quit()


if __name__ == "__main__":
    test_login_user_with_wrong_credentials()
