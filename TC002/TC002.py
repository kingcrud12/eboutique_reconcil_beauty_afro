from utils.base_test import BaseTest
from utils.fill_login_form import fill_login_form


def test_login_user():
    test = BaseTest(
        test_function=fill_login_form,
        success_message="✅ Formulaire de connexion rempli avec succès",
        failure_message="⚠️ Échec du remplissage du formulaire"
    )
    test.run()


if __name__ == "__main__":
    test_login_user()
