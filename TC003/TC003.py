from utils.base_test import BaseTest
from utils.fill_login_form import fill_login_form


def test_login_user_with_wrong_credentials():
    def fill_login_with_wrong_credentials(driver):
        return fill_login_form(
            driver,
            username_env="WRONG_EMAIL",
            password_env="WRONG_PASSWORD"
        )
    
    test = BaseTest(
        test_function=fill_login_with_wrong_credentials,
        success_message="✅ Formulaire de connexion rempli avec succès (test négatif)",
        failure_message="⚠️ Échec du remplissage du formulaire (attendu pour test négatif)",
        exit_on_failure=False
    )
    test.run()


if __name__ == "__main__":
    test_login_user_with_wrong_credentials()
