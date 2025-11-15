# Explication Visuelle du Code BaseTest

Ce document explique le code de `BaseTest` de manière visuelle et étape par étape.

---

## 🎬 Scénario : Création et utilisation d'un test

### Étape 1 : Création de l'instance

```python
test = BaseTest(
    test_function=fill_register_form,
    success_message="✅ Inscription réussie",
    failure_message="❌ Échec inscription"
)
```

**Ce qui se passe en coulisse :**

```
1. Python crée un nouvel objet (instance) de type BaseTest
2. Python appelle automatiquement __init__ avec :
   - self = l'objet créé (notre "test")
   - test_function = fill_register_form
   - success_message = "✅ Inscription réussie"
   - failure_message = "❌ Échec inscription"
   - exit_on_failure = True (par défaut)

3. Dans __init__, on stocke tout dans self :
   self.test_function = fill_register_form
   self.success_message = "✅ Inscription réussie"
   self.failure_message = "❌ Échec inscription"
   self.exit_on_failure = True
   self.driver = None  (pas encore créé)
   self.is_ci = False  (si on est en local)
   self.headless_mode = False  (si on est en local)
```

**Résultat :** L'objet `test` contient maintenant toutes ces informations.

---

### Étape 2 : Appel de `test.run()`

```python
test.run()
```

**Ce qui se passe dans `run()` :**

```
┌─────────────────────────────────────────┐
│  def run(self):                        │
│      # self = test (notre objet)      │
│                                        │
│  1. self.setup()                      │
│     └─> Crée self.driver               │
│     └─> Charge l'URL                   │
│                                        │
│  2. success = self.test_function(     │
│                    self.driver)       │
│     └─> Exécute fill_register_form(   │
│                    test.driver)       │
│     └─> Retourne True ou False         │
│                                        │
│  3. if success:                       │
│        print(self.success_message)    │
│        # Affiche "✅ Inscription réussie"
│     else:                              │
│        print(self.failure_message)     │
│        if self.exit_on_failure:        │
│            exit(1)                     │
│                                        │
│  4. if not self.is_ci:                │
│        input("Appuie sur Entrée...")   │
│                                        │
│  5. finally:                           │
│        self.teardown()                 │
│        └─> Ferme self.driver           │
└─────────────────────────────────────────┘
```

---

## 🔍 Détail ligne par ligne avec exemples

### Ligne 1-5 : Les imports

```python
import os
from typing import Callable
from selenium.webdriver.remote.webdriver import WebDriver
from utils.driver import create_driver
from utils.get_url import get_url
```

**Explication :**
- `os` : Pour lire les variables d'environnement (`os.getenv("CI")`)
- `Callable` : Type hint (juste pour la documentation, dit "c'est une fonction")
- `WebDriver` : Type hint (dit "c'est un driver Selenium")
- `create_driver` : Fonction qui crée le navigateur
- `get_url` : Fonction qui charge l'URL

---

### Ligne 8 : Définition de la classe

```python
class BaseTest:
```

**Explication :**
- C'est le modèle (comme un moule à gâteau)
- On peut créer plusieurs instances (plusieurs gâteaux) à partir de ce modèle

---

### Ligne 10-16 : Le constructeur `__init__`

```python
def __init__(
    self,
    test_function: Callable[[WebDriver], bool],
    success_message: str,
    failure_message: str,
    exit_on_failure: bool = True
):
```

**Explication :**
- `self` : Toujours le premier paramètre (c'est l'objet créé)
- `test_function` : Une fonction à exécuter (ex: `fill_register_form`)
- `success_message` : Message si le test réussit
- `failure_message` : Message si le test échoue
- `exit_on_failure` : Si `True`, quitte avec erreur en cas d'échec

**Exemple concret :**
```python
# Quand on fait :
test = BaseTest(
    test_function=fill_register_form,
    success_message="✅ Réussi",
    failure_message="❌ Échoué"
)

# Python fait automatiquement :
# BaseTest.__init__(test, fill_register_form, "✅ Réussi", "❌ Échoué", True)
#                    ↑
#                    self = test
```

---

### Ligne 17-23 : Stockage dans `self`

```python
    self.driver: WebDriver = None
    self.test_function = test_function
    self.success_message = success_message
    self.failure_message = failure_message
    self.exit_on_failure = exit_on_failure
    self.is_ci = os.getenv("CI") == "true"
    self.headless_mode = self.is_ci or os.getenv("HEADLESS", "false").lower() == "true"
```

**Explication ligne par ligne :**

1. `self.driver = None`
   - Crée une variable `driver` dans l'objet
   - Initialement vide (`None`)
   - Sera rempli plus tard dans `setup()`

2. `self.test_function = test_function`
   - Stocke la fonction passée en paramètre
   - `test.test_function` = `fill_register_form`

3. `self.success_message = success_message`
   - Stocke le message de succès
   - `test.success_message` = `"✅ Inscription réussie"`

4. `self.failure_message = failure_message`
   - Stocke le message d'échec
   - `test.failure_message` = `"❌ Échec inscription"`

5. `self.exit_on_failure = exit_on_failure`
   - Stocke si on doit quitter avec erreur
   - `test.exit_on_failure` = `True`

6. `self.is_ci = os.getenv("CI") == "true"`
   - Vérifie si on est en CI (GitHub Actions)
   - `os.getenv("CI")` retourne `"true"` en CI, `None` en local
   - `test.is_ci` = `False` en local, `True` en CI

7. `self.headless_mode = self.is_ci or ...`
   - Active le mode headless si on est en CI
   - `test.headless_mode` = `False` en local, `True` en CI

**Pourquoi `self.` ?**
- Pour que chaque instance ait ses propres valeurs
- Si on crée 2 tests, chacun a ses propres messages

---

### Ligne 25-27 : Méthode `setup()`

```python
def setup(self):
    self.driver = create_driver(headless=self.headless_mode)
    get_url(self.driver)
```

**Explication :**

1. `def setup(self):`
   - Méthode pour initialiser le test
   - `self` = l'instance (ex: `test`)

2. `self.driver = create_driver(headless=self.headless_mode)`
   - Crée le navigateur Chrome
   - `self.headless_mode` : Utilise la valeur stockée dans l'objet
   - Stocke le driver dans `self.driver`

3. `get_url(self.driver)`
   - Charge l'URL dans le navigateur
   - `self.driver` : Le driver créé juste avant

**Exemple :**
```python
test = BaseTest(...)
test.setup()
# Maintenant test.driver contient le navigateur Chrome
```

---

### Ligne 29-31 : Méthode `teardown()`

```python
def teardown(self):
    if self.driver:
        self.driver.quit()
```

**Explication :**

1. `def teardown(self):`
   - Méthode pour nettoyer (fermer le navigateur)
   - `self` = l'instance

2. `if self.driver:`
   - Vérifie si le driver existe
   - Évite les erreurs si `setup()` n'a pas été appelé

3. `self.driver.quit()`
   - Ferme le navigateur
   - Libère les ressources

**Exemple :**
```python
test = BaseTest(...)
test.setup()    # Crée le driver
# ... faire des tests ...
test.teardown() # Ferme le driver
```

---

### Ligne 33-49 : Méthode `run()` - Le cœur du test

```python
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
```

**Explication ligne par ligne :**

1. `def run(self):`
   - Méthode principale qui exécute tout le test
   - `self` = l'instance

2. `try:`
   - Bloc pour gérer les erreurs
   - Si une erreur survient, on exécute quand même `finally`

3. `self.setup()`
   - Appelle la méthode `setup()` de cette instance
   - Crée le driver et charge l'URL
   - Maintenant `self.driver` contient le navigateur

4. `success = self.test_function(self.driver)`
   - **C'est ici que le test spécifique s'exécute !**
   - `self.test_function` : La fonction passée lors de la création (ex: `fill_register_form`)
   - `self.driver` : Le driver créé dans `setup()`
   - `success` : `True` si le test réussit, `False` sinon

5. `if success:`
   - Si le test a réussi
   - `print(self.success_message)` : Affiche le message de succès de cette instance

6. `else:`
   - Si le test a échoué
   - `print(self.failure_message)` : Affiche le message d'échec
   - `if self.exit_on_failure:` : Si on doit quitter avec erreur
     - `exit(1)` : Quitte avec code d'erreur (pour GitHub Actions)

7. `if not self.is_ci:`
   - Si on n'est pas en CI (mode local)
   - `input(...)` : Pause pour voir le résultat

8. `finally:`
   - S'exécute **toujours**, même en cas d'erreur
   - `self.teardown()` : Ferme le navigateur
   - Garantit que le navigateur est toujours fermé

---

## 🎯 Schéma complet du flux

```
┌─────────────────────────────────────────────┐
│  1. Création : test = BaseTest(...)        │
│     └─> __init__() stocke tout dans self    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  2. Exécution : test.run()                 │
│     └─> self = test                        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  3. setup()                                 │
│     └─> Crée self.driver                   │
│     └─> Charge l'URL                       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  4. self.test_function(self.driver)        │
│     └─> Exécute fill_register_form()       │
│     └─> Retourne True/False                │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  5. Affiche le résultat                    │
│     └─> print(self.success_message)        │
│         ou                                  │
│     └─> print(self.failure_message)       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  6. finally: teardown()                    │
│     └─> Ferme self.driver                  │
└─────────────────────────────────────────────┘
```

---

## 💡 Points clés à retenir

1. **`self` = l'instance (l'objet créé)**
   - Quand on fait `test = BaseTest(...)`, `self` = `test` dans toutes les méthodes

2. **`self.attribut` = variable de cette instance**
   - `self.driver` = le driver de cette instance
   - `self.success_message` = le message de cette instance

3. **Chaque instance est indépendante**
   - `test1 = BaseTest(...)` a ses propres valeurs
   - `test2 = BaseTest(...)` a ses propres valeurs
   - Elles ne se mélangent pas !

4. **`self` est toujours le premier paramètre**
   - C'est une convention Python
   - Permet d'accéder aux attributs de l'instance

---

## 🎓 Pourquoi cette architecture ?

**Avant (code dupliqué) :**
```python
# TC001.py
def test_register_user():
    is_ci = os.getenv("CI") == "true"
    headless_mode = is_ci or ...
    driver = create_driver(headless=headless_mode)
    get_url(driver)
    try:
        success = fill_register_form(driver)
        if success:
            print("✅ Succès")
        else:
            print("❌ Échec")
            exit(1)
        if not is_ci:
            input("...")
    finally:
        driver.quit()

# TC002.py - MÊME CODE répété !
def test_login_user():
    is_ci = os.getenv("CI") == "true"
    headless_mode = is_ci or ...
    # ... exactement le même code ...
```

**Après (avec BaseTest) :**
```python
# TC001.py - Simple et concis
def test_register_user():
    test = BaseTest(
        test_function=fill_register_form,
        success_message="✅ Succès",
        failure_message="❌ Échec"
    )
    test.run()

# TC002.py - Simple et concis
def test_login_user():
    test = BaseTest(
        test_function=fill_login_form,
        success_message="✅ Succès",
        failure_message="❌ Échec"
    )
    test.run()
```

**Avantages :**
- ✅ Code commun dans un seul endroit (`BaseTest`)
- ✅ Facile à modifier (changement dans `BaseTest` = changement partout)
- ✅ Facile à étendre (nouveau test = juste instancier `BaseTest`)

---

**Maintenant vous comprenez comment fonctionne `self` et la POO en Python ! 🎉**

