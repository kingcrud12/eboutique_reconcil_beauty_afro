# Guide : Programmation Orientée Objet (POO) en Python

Ce guide explique les concepts de base de la POO en Python, en particulier le mot-clé `self` et comment comprendre le code de `BaseTest`.

---

## 🎯 Qu'est-ce que `self` ?

### Concept de base

`self` est une référence à **l'instance** (l'objet) de la classe. C'est comme dire "moi-même" ou "cet objet-ci".

**Analogie simple** :
- Imaginez une classe `Personne` qui représente un être humain
- `self` = "moi" (la personne spécifique)
- `self.nom` = "mon nom" (le nom de cette personne spécifique)

### Exemple simple

```python
class Personne:
    def __init__(self, nom, age):
        self.nom = nom      # self.nom = "mon nom"
        self.age = age      # self.age = "mon âge"
    
    def se_presenter(self):
        print(f"Je m'appelle {self.nom} et j'ai {self.age} ans")
        # self.nom = "mon nom à moi"
        # self.age = "mon âge à moi"

# Création de deux personnes différentes
personne1 = Personne("Alice", 25)
personne2 = Personne("Bob", 30)

personne1.se_presenter()  # Affiche : "Je m'appelle Alice et j'ai 25 ans"
personne2.se_presenter()  # Affiche : "Je m'appelle Bob et j'ai 30 ans"
```

**Explication** :
- `personne1` et `personne2` sont deux **instances** différentes de la classe `Personne`
- Quand on appelle `personne1.se_presenter()`, `self` = `personne1`
- Quand on appelle `personne2.se_presenter()`, `self` = `personne2`
- Chaque instance a ses propres valeurs (`self.nom`, `self.age`)

---

## 📚 Concepts de base de la POO

### 1. Classe vs Instance

**Classe** = Le modèle, le plan de construction
**Instance** = L'objet concret créé à partir de la classe

```python
# CLASSE (le modèle)
class Voiture:
    def __init__(self, marque, couleur):
        self.marque = marque
        self.couleur = couleur

# INSTANCES (les objets concrets)
ma_voiture = Voiture("Toyota", "rouge")      # Instance 1
ta_voiture = Voiture("BMW", "bleue")         # Instance 2

print(ma_voiture.marque)  # "Toyota"
print(ta_voiture.marque)  # "BMW"
```

### 2. `__init__` : Le constructeur

`__init__` est appelé automatiquement quand on crée une instance.

```python
class Voiture:
    def __init__(self, marque, couleur):
        # Ce code s'exécute automatiquement quand on fait : Voiture("Toyota", "rouge")
        self.marque = marque
        self.couleur = couleur
        print(f"Une nouvelle voiture {marque} {couleur} a été créée !")

ma_voiture = Voiture("Toyota", "rouge")
# Affiche automatiquement : "Une nouvelle voiture Toyota rouge a été créée !"
```

### 3. Méthodes vs Attributs

**Attributs** = Variables qui stockent des données (`self.nom`, `self.age`)
**Méthodes** = Fonctions qui font des actions (`def se_presenter(self)`)

```python
class Personne:
    def __init__(self, nom):
        self.nom = nom  # ATTRIBUT (variable)
    
    def dire_bonjour(self):  # MÉTHODE (fonction)
        print(f"Bonjour, je suis {self.nom}")
```

---

## 🔍 Explication ligne par ligne de `BaseTest`

Maintenant, analysons le code de `BaseTest` :

```python
import os
from typing import Callable
from selenium.webdriver.remote.webdriver import WebDriver
from utils.driver import create_driver
from utils.get_url import get_url
```

**Explication** : Import des modules nécessaires
- `os` : Pour lire les variables d'environnement
- `Callable` : Type hint pour dire "c'est une fonction"
- `WebDriver` : Type hint pour le driver Selenium
- `create_driver`, `get_url` : Fonctions utilitaires

---

```python
class BaseTest:
```

**Explication** : Définition de la classe `BaseTest`
- C'est le modèle pour créer des objets de test

---

```python
def __init__(
    self,
    test_function: Callable[[WebDriver], bool],
    success_message: str,
    failure_message: str,
    exit_on_failure: bool = True
):
```

**Explication** : Le constructeur (s'exécute à la création de l'objet)

- `self` : Référence à l'instance créée
- `test_function` : Une fonction à exécuter (ex: `fill_register_form`)
- `success_message` : Message à afficher en cas de succès
- `failure_message` : Message à afficher en cas d'échec
- `exit_on_failure` : Si `True`, quitte avec erreur en cas d'échec (par défaut `True`)

**Exemple d'utilisation** :
```python
test = BaseTest(
    test_function=fill_register_form,  # La fonction à exécuter
    success_message="✅ Succès",
    failure_message="❌ Échec"
)
```

---

```python
    self.driver: WebDriver = None
    self.test_function = test_function
    self.success_message = success_message
    self.failure_message = failure_message
    self.exit_on_failure = exit_on_failure
```

**Explication** : Création des attributs de l'instance

- `self.driver = None` : Variable pour stocker le driver Selenium (initialement vide)
- `self.test_function = test_function` : Sauvegarde la fonction passée en paramètre
- `self.success_message = success_message` : Sauvegarde le message de succès
- `self.failure_message = failure_message` : Sauvegarde le message d'échec
- `self.exit_on_failure = exit_on_failure` : Sauvegarde le choix de quitter ou non

**Pourquoi `self.` ?**
- Pour que chaque instance ait ses propres valeurs
- Si on crée 2 tests différents, chacun a ses propres messages

**Exemple** :
```python
test1 = BaseTest(..., success_message="Test 1 réussi", ...)
test2 = BaseTest(..., success_message="Test 2 réussi", ...)

# test1 a son propre success_message
# test2 a son propre success_message
# Ils ne se mélangent pas !
```

---

```python
    self.is_ci = os.getenv("CI") == "true"
    self.headless_mode = self.is_ci or os.getenv("HEADLESS", "false").lower() == "true"
```

**Explication** : Détection de l'environnement

- `self.is_ci` : Vérifie si on est en CI (GitHub Actions définit `CI=true`)
- `self.headless_mode` : Active le mode headless si on est en CI ou si `HEADLESS=true`

**Pourquoi `self.` ?**
- Pour que chaque instance sache si elle est en CI ou non
- Chaque test peut vérifier indépendamment son environnement

---

```python
def setup(self):
    self.driver = create_driver(headless=self.headless_mode)
    get_url(self.driver)
```

**Explication** : Méthode pour initialiser le test

- `self` : Référence à l'instance (pour accéder à `self.headless_mode` et `self.driver`)
- `self.driver = create_driver(...)` : Crée le driver et le stocke dans `self.driver`
- `get_url(self.driver)` : Charge l'URL dans le navigateur

**Pourquoi `self.driver` ?**
- Pour que le driver soit accessible dans toutes les méthodes de l'instance
- `self.driver` peut être utilisé dans `run()`, `teardown()`, etc.

---

```python
def teardown(self):
    if self.driver:
        self.driver.quit()
```

**Explication** : Méthode pour nettoyer (fermer le navigateur)

- `self` : Référence à l'instance
- `if self.driver` : Vérifie si le driver existe
- `self.driver.quit()` : Ferme le navigateur

**Pourquoi `self.driver` ?**
- Pour accéder au driver créé dans `setup()`
- Chaque instance ferme son propre driver

---

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

**Explication ligne par ligne** :

1. `def run(self):` : Méthode principale qui exécute le test
   - `self` : Pour accéder à tous les attributs et méthodes

2. `try:` : Bloc pour gérer les erreurs
   - Si une erreur survient, on exécute quand même `finally`

3. `self.setup()` : Appelle la méthode `setup()` de cette instance
   - Crée le driver et charge l'URL

4. `success = self.test_function(self.driver)` : Exécute la fonction de test
   - `self.test_function` : La fonction passée lors de la création (ex: `fill_register_form`)
   - `self.driver` : Le driver créé dans `setup()`
   - `success` : `True` ou `False` selon le résultat

5. `if success:` : Si le test a réussi
   - `print(self.success_message)` : Affiche le message de succès de cette instance

6. `else:` : Si le test a échoué
   - `print(self.failure_message)` : Affiche le message d'échec de cette instance
   - `if self.exit_on_failure:` : Si on doit quitter avec erreur
     - `exit(1)` : Quitte avec code d'erreur (pour GitHub Actions)

7. `if not self.is_ci:` : Si on n'est pas en CI (mode local)
   - `input(...)` : Pause pour voir le résultat

8. `finally:` : S'exécute toujours, même en cas d'erreur
   - `self.teardown()` : Ferme le navigateur

---

## 🎬 Exemple complet : Comment ça fonctionne

```python
# 1. Création d'une instance
test = BaseTest(
    test_function=fill_register_form,
    success_message="✅ Inscription réussie",
    failure_message="❌ Échec inscription"
)

# 2. À ce moment, Python appelle automatiquement __init__
# self = test (l'instance créée)
# self.test_function = fill_register_form
# self.success_message = "✅ Inscription réussie"
# self.failure_message = "❌ Échec inscription"
# self.is_ci = False (si on est en local)
# self.headless_mode = False (si on est en local)

# 3. Appel de la méthode run()
test.run()

# 4. Dans run(), self = test
# self.setup() → crée self.driver
# self.test_function(self.driver) → exécute fill_register_form(test.driver)
# self.success_message → "✅ Inscription réussie"
# self.teardown() → ferme self.driver
```

---

## 🔑 Points clés à retenir

### 1. `self` = "cet objet-ci"

```python
class Test:
    def __init__(self, nom):
        self.nom = nom  # self.nom = "le nom de CET objet-ci"
    
    def afficher(self):
        print(self.nom)  # Affiche "le nom de CET objet-ci"

test1 = Test("Test 1")
test2 = Test("Test 2")

test1.afficher()  # Affiche "Test 1" (self = test1)
test2.afficher()  # Affiche "Test 2" (self = test2)
```

### 2. `self.` pour accéder aux attributs

```python
class Test:
    def __init__(self, valeur):
        self.valeur = valeur  # Créer un attribut
    
    def afficher(self):
        print(self.valeur)  # Accéder à l'attribut (obligatoire d'utiliser self.)
```

### 3. `self` est toujours le premier paramètre

```python
class Test:
    def methode(self, autre_parametre):
        # self = toujours le premier paramètre
        # autre_parametre = paramètre supplémentaire
        pass
```

### 4. Chaque instance est indépendante

```python
test1 = BaseTest(..., success_message="Message 1", ...)
test2 = BaseTest(..., success_message="Message 2", ...)

# test1 et test2 sont complètement indépendants
# Chacun a ses propres valeurs
```

---

## 📝 Résumé visuel

```
┌─────────────────────────────────────┐
│  CLASSE BaseTest (le modèle)        │
│                                     │
│  Attributs :                        │
│    - driver                         │
│    - test_function                  │
│    - success_message                │
│    - failure_message                │
│    - exit_on_failure                │
│    - is_ci                          │
│    - headless_mode                  │
│                                     │
│  Méthodes :                         │
│    - __init__()                     │
│    - setup()                        │
│    - teardown()                     │
│    - run()                          │
└─────────────────────────────────────┘
            │
            │ Création d'instances
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌─────────┐
│ test1   │   │ test2   │
│         │   │         │
│ self =  │   │ self =  │
│ test1   │   │ test2   │
│         │   │         │
│ driver  │   │ driver  │
│ msg: ✅ │   │ msg: ❌ │
└─────────┘   └─────────┘
```

---

## 🎓 Pour aller plus loin

### Différence entre fonction et méthode

```python
# FONCTION (indépendante)
def fonction_independante(x):
    return x * 2

# MÉTHODE (appartient à une classe)
class MaClasse:
    def methode(self, x):
        return x * 2
        # self permet d'accéder aux attributs de l'instance
```

### Pourquoi `self` est obligatoire ?

En Python, `self` est **toujours** le premier paramètre des méthodes d'instance. C'est une convention Python.

```python
class Test:
    def methode(self):  # self est obligatoire
        pass
```

---

## ✅ Conclusion

- **`self`** = référence à l'instance (l'objet créé)
- **`self.attribut`** = accéder à un attribut de cette instance
- **Chaque instance** a ses propres valeurs
- **`self`** est toujours le premier paramètre des méthodes

Le code de `BaseTest` crée un modèle réutilisable où chaque test peut avoir ses propres paramètres tout en partageant la même logique commune !

---

**Questions ?** N'hésitez pas à relire les exemples et à expérimenter avec du code simple !

