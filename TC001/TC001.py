from utils.base_test import BaseTest
from utils.fill_register_form import fill_register_form


def test_register_user():
    test = BaseTest(
        test_function=fill_register_form,
        success_message="✅ Formulaire d'inscription rempli avec succès",
        failure_message="⚠️ Échec du remplissage du formulaire"
    )
    test.run()


if __name__ == "__main__":
    test_register_user()
