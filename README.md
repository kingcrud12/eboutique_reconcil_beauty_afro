# Documentation du Projet Selenium Automation

## 📚 Support de cours : Devenez QA Automation Engineer

Cette documentation présente un projet d'automatisation de tests web avec Selenium et Python. Ce projet sert de support pédagogique pour comprendre les concepts fondamentaux de l'automatisation de tests.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure du projet](#structure-du-projet)
3. [Concepts Python utilisés](#concepts-python-utilisés)
4. [Concepts Selenium utilisés](#concepts-selenium-utilisés)
5. [Guide de démarrage](#guide-de-démarrage)
6. [Comment refaire un projet similaire](#comment-refaire-un-projet-similaire)
7. [Bonnes pratiques](#bonnes-pratiques)

---

## 🎯 Vue d'ensemble

Ce projet automatise les tests d'une application e-commerce en utilisant Selenium WebDriver. Il couvre plusieurs scénarios de test :

- **TC001** : Test d'inscription d'un nouvel utilisateur
- **TC002** : Test de connexion avec des identifiants valides
- **TC003** : Test de connexion avec des identifiants invalides (test négatif)

### Technologies utilisées

- **Python 3.x** : Langage de programmation
- **Selenium WebDriver** : Framework d'automatisation web
- **python-dotenv** : Gestion des variables d'environnement
- **webdriver-manager** : Gestion automatique des drivers
- **faker** : Génération de données de test (prévu pour usage futur)

---

## 📁 Structure du projet

```
selenium_automation_project/
│
├── TC001/                    # Test Case 001 : Inscription
│   ├── __init__.py
│   └── TC001.py
│
├── TC002/                    # Test Case 002 : Connexion valide
│   ├── __init__.py
│   └── TC002.py
│
├── TC003/                    # Test Case 003 : Connexion invalide
│   ├── __init__.py
│   └── TC003.py
│
├── utils/                     # Utilitaires réutilisables
│   ├── __init__.py
│   ├── driver.py              # Configuration du driver Selenium
│   ├── wait_element.py        # Attente explicite d'éléments
│   ├── click_element.py       # Clic sur éléments
│   ├── fill_input.py          # Remplissage de champs
│   ├── fill_login_form.py     # Formulaire de connexion
│   ├── fill_register_form.py  # Formulaire d'inscription
│   ├── create_account.py      # Actions pour créer un compte
│   ├── logger_util.py         # Utilitaires de navigation
│   └── get_env_var.py         # Gestion des variables d'environnement
│
├── .env                       # Variables d'environnement (à créer)
├── exemple.env                # Exemple de fichier .env
├── requirements.txt           # Dépendances Python
└── README.md                  # Cette documentation
```

### Explication de la structure

#### Dossiers de tests (TC001, TC002, TC003)

Chaque dossier contient un cas de test isolé. Cette organisation permet :
- **Séparation des préoccupations** : Chaque test est indépendant
- **Maintenabilité** : Facile de trouver et modifier un test spécifique
- **Scalabilité** : Facile d'ajouter de nouveaux tests

#### Dossier `utils/`

Contient toutes les fonctions utilitaires réutilisables :
- **Abstraction** : Encapsule les opérations Selenium complexes
- **Réutilisabilité** : Évite la duplication de code
- **Maintenabilité** : Un changement dans une fonction affecte tous les tests

---

## 🐍 Concepts Python utilisés

### 1. Modules et packages

#### Import de modules

```python
from utils.driver import create_driver
from utils.fill_login_form import fill_login_form
```

**Explication** :
- `from ... import ...` : Importe une fonction spécifique d'un module
- Permet d'utiliser directement `create_driver()` au lieu de `utils.driver.create_driver()`
- Améliore la lisibilité du code

#### Packages Python (`__init__.py`)

Les fichiers `__init__.py` (même vides) transforment les dossiers en packages Python :
- Permettent l'importation de modules depuis ces dossiers
- Facilite l'organisation modulaire du code

### 2. Fonctions et paramètres

#### Définition de fonctions avec paramètres par défaut

```python
def fill_login_form(driver, username_env="LOGIN_USERNAME", password_env="LOGIN_PASSWORD"):
    # ...
```

**Concepts** :
- **Paramètres par défaut** : `username_env="LOGIN_USERNAME"` permet d'appeler la fonction sans spécifier ce paramètre
- **Flexibilité** : Permet de tester différents scénarios (ex: TC003 utilise des identifiants incorrects)

#### Retour de valeurs booléennes

```python
def click_element(driver, by, selector, timeout=10):
    element = wait_for_element(driver, by, selector, timeout)
    if element:
        element.click()
        return True
    return False
```

**Concepts** :
- **Valeurs de retour** : Indiquent le succès ou l'échec d'une opération
- **Gestion d'erreurs** : Permet aux tests de réagir selon le résultat

### 3. Gestion des exceptions

#### Try/Except

```python
try:
    success = fill_login_form(driver)
    if success:
        print("✅ Formulaire rempli avec succès")
    else:
        print("⚠️ Échec du remplissage")
except Exception as e:
    print(f"⚠️ Erreur : {e}")
finally:
    driver.quit()
```

**Concepts** :
- **try/except** : Capture les erreurs pour éviter l'arrêt brutal du programme
- **finally** : S'exécute toujours, même en cas d'erreur (idéal pour nettoyer les ressources)
- **Gestion propre** : Assure la fermeture du navigateur même en cas d'erreur

### 4. Variables d'environnement

#### Utilisation de `os.getenv()`

```python
import os
from dotenv import load_dotenv

load_dotenv()
value = os.getenv("LOGIN_USERNAME")
```

**Concepts** :
- **Sécurité** : Les identifiants ne sont pas hardcodés dans le code
- **Configuration** : Facile de changer les valeurs sans modifier le code
- **Environnements multiples** : Différents fichiers `.env` pour dev/test/prod

#### Path avec `pathlib`

```python
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"
```

**Concepts** :
- **`pathlib.Path`** : Gestion moderne des chemins de fichiers (Python 3.4+)
- **`.parents[1]`** : Remonte d'un niveau dans l'arborescence
- **`/`** : Opérateur de concaténation de chemins (plus lisible que `os.path.join()`)

### 5. Exécution conditionnelle

#### `if __name__ == "__main__"`

```python
if __name__ == "__main__":
    test_login_user()
```

**Concepts** :
- Permet d'exécuter le script directement : `python TC002/TC002.py`
- Empêche l'exécution lors d'un import : `from TC002 import test_login_user`
- Pattern standard en Python pour les scripts exécutables

### 6. F-strings (formatage de chaînes)

```python
print(f"⚠️ Erreur lors du remplissage du formulaire: {e}")
```

**Concepts** :
- **f-strings** : Formatage moderne et lisible (Python 3.6+)
- Plus performant et plus clair que `.format()` ou `%`

---

## 🔧 Concepts Selenium utilisés

### 1. WebDriver et ChromeDriver

#### Création du driver

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")  # Mode sans interface
service = Service("/path/to/chromedriver")
driver = webdriver.Chrome(service=service, options=options)
```

**Concepts** :
- **WebDriver** : Interface standard pour contrôler les navigateurs
- **ChromeOptions** : Configuration du navigateur Chrome
- **Service** : Gère le processus du driver Chrome
- **Arguments** : Options de ligne de commande pour Chrome

#### Options Chrome importantes

- `--headless=new` : Exécution sans interface graphique (pour CI/CD)
- `--no-sandbox` : Nécessaire dans certains environnements (Docker, CI)
- `--disable-dev-shm-usage` : Évite les problèmes de mémoire partagée

### 2. Navigation

#### Chargement d'une page

```python
driver.get("https://eboutique-reconcil-beauty-afro.vercel.app")
```

**Concepts** :
- `get()` : Charge une URL dans le navigateur
- Attend que la page soit complètement chargée (équivalent à `window.onload`)

### 3. Localisation d'éléments (Locators)

#### Types de sélecteurs

```python
from selenium.webdriver.common.by import By

# Par ID
element = driver.find_element(By.ID, "email")

# Par CSS Selector
element = driver.find_element(By.CSS_SELECTOR, "svg.lucide-user")

# Par XPath
element = driver.find_element(By.XPATH, "//button[normalize-space()='Connexion']")
```

**Concepts** :

1. **By.ID** : Le plus rapide et fiable (si l'ID est unique)
2. **By.CSS_SELECTOR** : Puissant, syntaxe CSS familière
3. **By.XPATH** : Très flexible, peut naviguer dans le DOM
   - `normalize-space()` : Ignore les espaces supplémentaires
   - `translate()` : Gère les caractères spéciaux

**Bonnes pratiques** :
- Préférer ID > CSS > XPath (ordre de performance)
- XPath pour les cas complexes (texte, hiérarchie)

### 4. Attentes explicites (Explicit Waits)

#### WebDriverWait

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, timeout=10)
element = wait.until(EC.presence_of_element_located((By.ID, "email")))
```

**Concepts** :
- **Explicit Wait** : Attend qu'une condition soit vraie avant de continuer
- **WebDriverWait** : Classe pour gérer les attentes
- **Expected Conditions (EC)** : Conditions prédéfinies (présence, visibilité, cliquabilité, etc.)

**Types de conditions** :
- `presence_of_element_located` : L'élément existe dans le DOM
- `visibility_of_element_located` : L'élément est visible
- `element_to_be_clickable` : L'élément est cliquable

**Avantages** :
- Évite les erreurs de timing (éléments pas encore chargés)
- Plus efficace que `time.sleep()`
- Timeout configurable

### 5. Attente implicite (Implicit Wait)

```python
driver.implicitly_wait(2)
```

**Concepts** :
- Attend un certain temps avant de déclarer qu'un élément n'existe pas
- S'applique à toutes les opérations `find_element`
- **Attention** : Peut ralentir les tests, préférer les explicit waits

### 6. Interactions avec les éléments

#### Clic

```python
element.click()
```

#### Remplissage de champs

```python
element.clear()        # Efface le contenu existant
element.send_keys("texte")  # Tape du texte
```

**Concepts** :
- `clear()` : Important pour éviter les valeurs résiduelles
- `send_keys()` : Simule la frappe au clavier

### 7. Exécution de JavaScript

```python
driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
```

**Concepts** :
- Permet d'exécuter du code JavaScript dans le navigateur
- Utile pour :
  - Scroller jusqu'à un élément (pour le rendre visible)
  - Contourner des problèmes de Selenium
  - Accéder à des propriétés JavaScript

**Dans ce projet** : Utilisé pour scroller jusqu'aux éléments avant de cliquer/remplir

### 8. Gestion du driver

#### Fermeture

```python
driver.quit()  # Ferme le navigateur et libère les ressources
```

**Concepts** :
- `quit()` : Ferme toutes les fenêtres et termine le processus
- `close()` : Ferme seulement la fenêtre courante
- **Toujours utiliser `quit()`** à la fin des tests

---

## 🚀 Guide de démarrage

### Prérequis

1. **Python 3.8+** installé
2. **Chrome** installé
3. **ChromeDriver** installé (ou utiliser webdriver-manager)

### Installation

1. **Cloner ou télécharger le projet**

2. **Créer un environnement virtuel** (recommandé)

```bash
python -m venv venv
source venv/bin/activate  # Sur macOS/Linux
# ou
venv\Scripts\activate  # Sur Windows
```

3. **Installer les dépendances**

```bash
pip install -r requirements.txt
```

4. **Configurer les variables d'environnement**

```bash
cp exemple.env .env
```

Éditer `.env` avec vos valeurs :

```env
LASTNAME=VotreNom
FIRSTNAME=VotrePrenom
LOGIN_USERNAME=votre.email@gmail.com
LOGIN_PASSWORD=votreMotDePasse
WRONG_EMAIL=email.incorrect@gmail.com
WRONG_PASSWORD=mauvaisMotDePasse
LOGIN_USERNAME_REGISTER=test+1@gmail.com
```

5. **Configurer ChromeDriver** (si nécessaire)

Option 1 : Utiliser webdriver-manager (automatique)
```python
from webdriver_manager.chrome import ChromeDriverManager
service = Service(ChromeDriverManager().install())
```

Option 2 : Chemin manuel dans `.env`
```env
CHROMEDRIVER_PATH=/opt/homebrew/bin/chromedriver
```

### Exécution des tests

#### Exécuter un test individuel

```bash
python TC001/TC001.py
python TC002/TC002.py
python TC003/TC003.py
```

#### Exécuter tous les tests (avec pytest, optionnel)

```bash
pytest TC001/ TC002/ TC003/
```

---

## 🏗️ Comment refaire un projet similaire

### Étape 1 : Structure de base

1. **Créer la structure de dossiers**

```bash
mkdir -p selenium_project/{utils,TC001,TC002}
touch selenium_project/{utils,TC001,TC002}/__init__.py
```

2. **Initialiser le projet Python**

```bash
cd selenium_project
python -m venv venv
source venv/bin/activate
```

### Étape 2 : Dépendances

Créer `requirements.txt` :

```txt
selenium>=4.15.0
python-dotenv>=1.0.0
webdriver-manager>=4.0.1
```

Installer :

```bash
pip install -r requirements.txt
```

### Étape 3 : Créer les utilitaires de base

#### `utils/driver.py`

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import os

def create_driver(headless=False):
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    if headless:
        options.add_argument("--headless=new")
    
    service = Service(os.getenv("CHROMEDRIVER_PATH", "/path/to/chromedriver"))
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(2)
    return driver
```

#### `utils/wait_element.py`

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common import TimeoutException

def wait_for_element(driver, by, selector, timeout=10):
    wait = WebDriverWait(driver, timeout)
    try:
        element = wait.until(EC.presence_of_element_located((by, selector)))
        return element
    except TimeoutException:
        return None
```

#### `utils/click_element.py`

```python
from utils.wait_element import wait_for_element

def click_element(driver, by, selector, timeout=10):
    element = wait_for_element(driver, by, selector, timeout)
    if element:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.click()
        return True
    return False
```

#### `utils/fill_input.py`

```python
from utils.wait_element import wait_for_element

def fill_input(driver, by, selector, value, timeout=10):
    element = wait_for_element(driver, by, selector, timeout)
    if element:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.clear()
        element.send_keys(value)
        return True
    return False
```

#### `utils/get_env_var.py`

```python
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(ENV_PATH)

def get_env_var(name: str, required=True):
    value = os.getenv(name)
    if required and not value:
        raise ValueError(f"⚠️ La variable d'environnement {name} doit être définie")
    return value
```

### Étape 4 : Créer votre premier test

#### `TC001/test_example.py`

```python
from utils.driver import create_driver
from utils.click_element import click_element
from utils.fill_input import fill_input
from selenium.webdriver.common.by import By

def test_example():
    driver = create_driver(headless=False)
    driver.get("https://example.com")
    
    try:
        # Votre logique de test ici
        click_element(driver, By.ID, "button-id")
        fill_input(driver, By.ID, "input-id", "valeur")
        
        print("✅ Test réussi")
        input("Appuyez sur Entrée pour fermer...")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_example()
```

### Étape 5 : Identifier les éléments de la page

#### Outils recommandés

1. **Chrome DevTools** (F12)
   - Inspecter les éléments
   - Copier le sélecteur CSS ou XPath

2. **Selenium IDE** (extension Chrome)
   - Enregistrer les actions
   - Exporter en Python

3. **XPath Helper** (extension Chrome)
   - Tester les XPath directement

#### Stratégie de sélection

1. **ID** : Si présent et unique → `By.ID`
2. **Classe CSS** : Si unique → `By.CSS_SELECTOR`
3. **XPath** : Pour les cas complexes (texte, hiérarchie)

**Exemple** :

```python
# Bon : ID unique
By.ID, "email"

# Bon : Classe CSS unique
By.CSS_SELECTOR, "button.submit-btn"

# Acceptable : XPath pour texte
By.XPATH, "//button[normalize-space()='Connexion']"
```

### Étape 6 : Gérer les attentes

**Problème courant** : Les éléments ne sont pas encore chargés

**Solution** : Toujours utiliser des explicit waits

```python
# ❌ Mauvais
time.sleep(5)
element = driver.find_element(By.ID, "email")

# ✅ Bon
element = wait_for_element(driver, By.ID, "email", timeout=10)
```

### Étape 7 : Organiser le code

#### Principe DRY (Don't Repeat Yourself)

**❌ Mauvais** : Code dupliqué dans chaque test

```python
# Dans TC001
driver = webdriver.Chrome()
driver.get("https://example.com")
element = WebDriverWait(driver, 10).until(...)
element.click()

# Dans TC002 (même code répété)
driver = webdriver.Chrome()
driver.get("https://example.com")
element = WebDriverWait(driver, 10).until(...)
element.click()
```

**✅ Bon** : Fonctions réutilisables

```python
# Dans utils/driver.py
def create_driver():
    # ...

# Dans utils/click_element.py
def click_element(driver, by, selector):
    # ...

# Dans les tests
driver = create_driver()
click_element(driver, By.ID, "button")
```

### Étape 8 : Gestion des erreurs

Toujours utiliser try/except/finally :

```python
def test_example():
    driver = create_driver()
    try:
        # Test logic
        pass
    except Exception as e:
        print(f"Erreur : {e}")
    finally:
        driver.quit()  # Toujours fermer
```

### Étape 9 : Variables d'environnement

1. Créer `.env` (ne pas commiter dans Git)
2. Créer `.env.example` (template à commiter)
3. Utiliser `python-dotenv` pour charger

```python
# .env.example
LOGIN_USERNAME=your.email@example.com
LOGIN_PASSWORD=yourPassword
```

### Étape 10 : Améliorations progressives

1. **Ajouter des logs** : Utiliser le module `logging`
2. **Screenshots** : Capturer en cas d'erreur
3. **Page Object Model** : Pour des projets plus grands
4. **Pytest** : Framework de test plus robuste
5. **CI/CD** : Intégration continue (GitHub Actions, GitLab CI)

---

## ✅ Bonnes pratiques

### 1. Organisation du code

- ✅ **Séparer les tests des utilitaires**
- ✅ **Un fichier par test case**
- ✅ **Fonctions courtes et focalisées**
- ✅ **Noms explicites** : `fill_login_form()` plutôt que `fill_form()`

### 2. Gestion des éléments

- ✅ **Préférer ID > CSS > XPath** (ordre de performance)
- ✅ **Toujours utiliser des explicit waits**
- ✅ **Éviter les XPath absolus** (`/html/body/div[1]/div[2]...`)
- ✅ **Utiliser des sélecteurs stables** (pas de classes générées dynamiquement)

### 3. Gestion des données

- ✅ **Variables d'environnement** pour les identifiants
- ✅ **Faker** pour générer des données de test
- ✅ **Ne jamais hardcoder** les valeurs sensibles

### 4. Robustesse

- ✅ **Try/except/finally** pour la gestion d'erreurs
- ✅ **Toujours fermer le driver** dans `finally`
- ✅ **Timeouts appropriés** (pas trop courts, pas trop longs)
- ✅ **Scroller avant interaction** si l'élément n'est pas visible

### 5. Maintenabilité

- ✅ **Documentation** : Commentaires pour les parties complexes
- ✅ **Versioning** : Git pour suivre les changements
- ✅ **Tests isolés** : Chaque test doit être indépendant
- ✅ **Refactoring** : Améliorer le code régulièrement

### 6. Performance

- ✅ **Mode headless** pour CI/CD
- ✅ **Fermer les drivers** après chaque test
- ✅ **Éviter les `time.sleep()`** inutiles
- ✅ **Parallélisation** pour les gros projets (pytest-xdist)

---

## 🔍 Exemples de code commentés

### Exemple complet : Test de connexion

```python
# Import des utilitaires
from utils.driver import create_driver
from utils.fill_login_form import fill_login_form

def test_login_user():
    # 1. Créer le driver (navigateur)
    driver = create_driver(headless=False)
    
    # 2. Naviguer vers l'application
    driver.get("https://eboutique-reconcil-beauty-afro.vercel.app")
    
    try:
        # 3. Exécuter le test
        success = fill_login_form(driver)
        
        # 4. Vérifier le résultat
        if success:
            print("✅ Formulaire rempli avec succès")
        else:
            print("⚠️ Échec du remplissage")
        
        # 5. Pause pour observation (développement uniquement)
        input("Appuie sur Entrée pour fermer...")
        
    finally:
        # 6. Toujours fermer le navigateur
        driver.quit()

# Point d'entrée du script
if __name__ == "__main__":
    test_login_user()
```

### Exemple : Fonction utilitaire avec gestion d'erreurs

```python
from selenium.webdriver.common.by import By
from utils.wait_element import wait_for_element

def fill_input(driver, by, selector, value, timeout=10):
    """
    Remplit un champ de formulaire.
    
    Args:
        driver: Instance WebDriver
        by: Type de sélecteur (By.ID, By.CSS_SELECTOR, etc.)
        selector: Sélecteur de l'élément
        value: Valeur à saisir
        timeout: Temps d'attente en secondes
    
    Returns:
        bool: True si succès, False sinon
    """
    # 1. Attendre que l'élément soit présent
    element = wait_for_element(driver, by, selector, timeout)
    
    if element:
        # 2. Scroller pour rendre l'élément visible
        driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", 
            element
        )
        
        # 3. Effacer le contenu existant
        element.clear()
        
        # 4. Saisir la nouvelle valeur
        element.send_keys(value)
        
        return True
    
    # 5. Retourner False si l'élément n'a pas été trouvé
    return False
```

---

## 📚 Ressources supplémentaires

### Documentation officielle

- [Selenium Python Documentation](https://selenium-python.readthedocs.io/)
- [Python Documentation](https://docs.python.org/3/)
- [WebDriver Specification](https://www.w3.org/TR/webdriver/)

### Outils utiles

- **Chrome DevTools** : Inspecter les éléments
- **Selenium IDE** : Enregistrer et exporter des tests
- **XPath Helper** : Tester les expressions XPath
- **SelectorsHub** : Aide à trouver les meilleurs sélecteurs

### Concepts avancés (pour aller plus loin)

1. **Page Object Model (POM)** : Pattern de design pour organiser le code
2. **Pytest** : Framework de test plus puissant
3. **Allure Reports** : Rapports de test visuels
4. **Docker** : Exécuter les tests dans des conteneurs
5. **CI/CD** : Automatisation de l'exécution des tests

---

## 🎓 Conclusion

Ce projet démontre les concepts fondamentaux de l'automatisation de tests web :

1. **Structure modulaire** : Code organisé et réutilisable
2. **Gestion des éléments** : Localisation fiable avec Selenium
3. **Attentes explicites** : Gestion robuste du timing
4. **Bonnes pratiques** : Code maintenable et extensible

En suivant cette documentation et en pratiquant, vous serez capable de créer vos propres projets d'automatisation de tests.

**Bon apprentissage ! 🚀**

---

## 📝 Notes

- Ce projet est un support pédagogique
- Adaptez les sélecteurs selon votre application cible
- Testez toujours sur différents navigateurs si nécessaire
- Gardez vos identifiants sécurisés (ne jamais commiter `.env`)

