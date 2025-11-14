# Guide Complet : CI/CD avec GitHub Actions - Explication Détaillée

Ce guide explique **pas à pas** tout ce qui a été mis en place pour automatiser les tests Selenium avec GitHub Actions.

---

## 📚 Table des matières

1. [Concepts de base](#concepts-de-base)
2. [Fusion de deux repositories](#fusion-de-deux-repositories)
3. [Adaptation des tests pour le CI](#adaptation-des-tests-pour-le-ci)
4. [Création du pipeline GitHub Actions](#création-du-pipeline-github-actions)
5. [Configuration et résolution des problèmes](#configuration-et-résolution-des-problèmes)
6. [Résumé de ce qui a été fait](#résumé-de-ce-qui-a-été-fait)

---

## 🎓 Concepts de base

### Qu'est-ce que le CI/CD ?

**CI** = **Continuous Integration** (Intégration Continue)
- Automatise l'exécution des tests à chaque modification du code
- Détecte les erreurs rapidement
- Garantit que le code fonctionne toujours

**CD** = **Continuous Deployment** (Déploiement Continu)
- Déploie automatiquement le code après les tests
- (Non utilisé dans ce projet, mais c'est la suite logique)

### GitHub Actions : Les concepts fondamentaux

#### 1. **Workflow** (Flux de travail)
Un **workflow** est un fichier YAML qui décrit **un processus automatisé complet**.

**Analogie** : C'est comme une recette de cuisine qui dit :
- "Prends les ingrédients"
- "Fais cuire"
- "Sers"

**Dans notre cas** : Le workflow dit :
- "Récupère le code"
- "Installe Python et Chrome"
- "Lance les tests"

**Fichier** : `.github/workflows/run_tests.yml`

#### 2. **Job** (Tâche)
Un **job** est une **étape majeure** dans un workflow. Un workflow peut avoir plusieurs jobs qui s'exécutent en parallèle ou séquentiellement.

**Analogie** : Dans une recette, un job serait "Préparer les ingrédients" ou "Faire cuire le plat"

**Dans notre cas** : Nous avons **1 seul job** appelé `test` qui exécute tous les tests.

#### 3. **Step** (Étape)
Un **step** est une **action individuelle** dans un job. C'est la plus petite unité.

**Analogie** : "Couper les légumes" ou "Ajouter du sel"

**Dans notre cas** : 
- Step 1 : Récupérer le code
- Step 2 : Installer Python
- Step 3 : Installer Chrome
- Step 4 : Lancer les tests

#### 4. **Pipeline** (Pipeline)
Un **pipeline** est l'**ensemble du processus** : workflow + jobs + steps.

**Analogie** : C'est toute la chaîne de production, de A à Z.

**Dans notre cas** : Le pipeline complet va de "récupération du code" jusqu'à "rapport des résultats des tests".

### Schéma visuel

```
Pipeline (tout le processus)
│
└─── Workflow (run_tests.yml)
     │
     └─── Job (test)
          │
          ├─── Step 1: Checkout du code
          ├─── Step 2: Configuration Python
          ├─── Step 3: Installation Chrome
          ├─── Step 4: Installation dépendances
          ├─── Step 5: Test TC001
          ├─── Step 6: Test TC002
          └─── Step 7: Test TC003
```

---

## 🔀 Fusion de deux repositories

### Situation initiale

Vous aviez **deux repositories séparés** :

1. **`selenium_automation_project`** (votre projet local)
   - Contient les tests Selenium
   - Structure : `TC001/`, `TC002/`, `TC003/`, `utils/`

2. **`eboutique_reconcil_beauty_afro`** (sur GitHub)
   - Contient l'application complète (API, backoffice, client)
   - Structure : `api/`, `backoffice/`, `client/`

### Objectif

Fusionner les tests Selenium dans le repository de l'application pour que les tests s'exécutent automatiquement à chaque modification de l'application.

### Étapes de la fusion

#### Étape 1 : Ajouter un remote Git

```bash
git remote add eboutique https://github.com/kingcrud12/eboutique_reconcil_beauty_afro.git
```

**Explication** : 
- Un **remote** est un lien vers un autre repository Git
- `origin` = votre repository actuel (`selenium_automation_project`)
- `eboutique` = le repository cible (`eboutique_reconcil_beauty_afro`)

**Résultat** : Vous pouvez maintenant pousser vers les deux repositories.

#### Étape 2 : Récupérer le contenu du repository cible

```bash
git fetch eboutique
```

**Explication** :
- Télécharge l'historique et les branches du repository `eboutique`
- Ne modifie pas encore votre code local
- Permet de voir ce qui existe dans l'autre repository

**Résultat** : Vous avez maintenant accès à `eboutique/main` (la branche main du repository eboutique).

#### Étape 3 : Fusionner les deux historiques

```bash
git merge eboutique/main --allow-unrelated-histories
```

**Explication** :
- `merge` = fusionner deux branches
- `eboutique/main` = la branche main du repository eboutique
- `--allow-unrelated-histories` = nécessaire car les deux repositories n'ont pas d'historique commun

**Ce qui se passe** :
1. Git combine les fichiers des deux repositories
2. Si un fichier existe dans les deux (comme `README.md`), Git crée un **conflit**
3. Vous devez résoudre les conflits manuellement

**Résultat** : Tous les fichiers des deux repositories sont maintenant dans votre repository local.

#### Étape 4 : Résoudre les conflits

**Conflit sur `README.md`** :
- Le repository `selenium_automation_project` avait un README pour les tests
- Le repository `eboutique` avait un README pour l'application

**Solution** :
```bash
git checkout --theirs README.md  # Prendre le README de l'eboutique
# Puis ajouter une section sur les tests Selenium
```

**Résultat** : Un README unique qui décrit l'application ET les tests.

#### Étape 5 : Pousser vers le repository cible

```bash
git push eboutique main
```

**Explication** :
- `push` = envoyer vos modifications vers un repository distant
- `eboutique` = le remote (repository cible)
- `main` = la branche à pousser

**Résultat** : Tous vos fichiers (tests + workflow) sont maintenant dans le repository `eboutique_reconcil_beauty_afro`.

### Structure finale après fusion

```
eboutique_reconcil_beauty_afro/
├── api/                    # API NestJS (existant)
├── backoffice/             # Interface admin (existant)
├── client/                 # Application client (existant)
├── TC001/                  # Test 1 (ajouté)
├── TC002/                  # Test 2 (ajouté)
├── TC003/                  # Test 3 (ajouté)
├── utils/                  # Utilitaires Selenium (ajouté)
├── .github/
│   └── workflows/
│       └── run_tests.yml   # Pipeline CI/CD (ajouté)
└── README.md               # Fusionné (application + tests)
```

---

## 🔧 Adaptation des tests pour le CI

### Problème initial

Les tests étaient conçus pour s'exécuter **localement** avec un navigateur visible :

```python
# AVANT (TC001.py)
def test_register_user():
    driver = create_driver(headless=False)  # Navigateur visible
    # ...
    input("Appuie sur Entrée pour fermer...")  # Pause interactive
```

**Problèmes en CI** :
1. ❌ Pas d'interface graphique → `headless=False` ne fonctionne pas
2. ❌ Pas d'interaction utilisateur → `input()` bloque indéfiniment
3. ❌ Les tests doivent s'exécuter automatiquement sans intervention

### Solution : Détection automatique du mode CI

#### Modification 1 : Détection de l'environnement CI

```python
# APRÈS (TC001.py)
import os

def test_register_user():
    # Détecter si on est en CI (GitHub Actions)
    is_ci = os.getenv("CI") == "true"
    headless_mode = is_ci or os.getenv("HEADLESS", "false").lower() == "true"
    
    driver = create_driver(headless=headless_mode)  # Headless en CI
    # ...
    if not is_ci:  # Pause seulement en local
        input("Appuie sur Entrée pour fermer...")
```

**Explication** :
- `os.getenv("CI")` : GitHub Actions définit automatiquement `CI=true`
- Si `CI=true` → mode headless activé automatiquement
- Si `CI=true` → pas de pause interactive

#### Modification 2 : Codes de sortie pour les échecs

```python
if success:
    print("✅ Succès")
else:
    print("⚠️ Échec")
    exit(1)  # Code d'erreur pour signaler l'échec à GitHub Actions
```

**Explication** :
- `exit(1)` = code d'erreur (0 = succès, 1+ = échec)
- GitHub Actions détecte ce code et marque le test comme "échec"

#### Modification 3 : Gestion des variables d'environnement

**Problème** : Les tests utilisaient un fichier `.env` local, mais en CI il n'y a pas de fichier `.env`.

**Solution** : Modifier `utils/get_env_var.py` pour supporter les deux modes :

```python
# AVANT
load_dotenv(ENV_PATH)  # Charge uniquement depuis .env

# APRÈS
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=False)  # Charge .env si existe
else:
    load_dotenv(override=False)  # Sinon, utilise les variables système

# os.getenv() lit toujours les variables d'environnement système
value = os.getenv(name)  # Fonctionne avec .env ET avec les variables système
```

**Explication** :
- En local : lit depuis `.env`
- En CI : lit depuis les variables d'environnement définies dans GitHub Actions

---

## 🚀 Création du pipeline GitHub Actions

### Étape 1 : Créer la structure

```bash
mkdir -p .github/workflows
touch .github/workflows/run_tests.yml
```

**Explication** :
- `.github/workflows/` = dossier standard pour les workflows GitHub Actions
- `run_tests.yml` = notre fichier de workflow (nom libre)

### Étape 2 : Définir le déclenchement

```yaml
name: Tests d'automatisation Selenium

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]
  workflow_dispatch:
```

**Explication** :
- `name` : Nom du workflow (affiché dans GitHub)
- `on.push` : Se déclenche à chaque push sur `main`, `master`, ou `develop`
- `on.pull_request` : Se déclenche à chaque Pull Request
- `on.workflow_dispatch` : Permet de déclencher manuellement depuis l'interface GitHub

### Étape 3 : Définir le job

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
```

**Explication** :
- `jobs` : Liste des jobs (tâches majeures)
- `test` : Nom du job (libre)
- `runs-on: ubuntu-latest` : Exécute sur une machine Ubuntu (gratuite pour les repos publics)

### Étape 4 : Définir les steps (étapes)

#### Step 1 : Récupérer le code

```yaml
- name: Checkout du code
  uses: actions/checkout@v4
```

**Explication** :
- `uses` : Utilise une action pré-construite (comme une fonction)
- `actions/checkout@v4` : Action officielle qui récupère le code du repository
- **Résultat** : Le code est disponible dans `/home/runner/work/eboutique_reconcil_beauty_afro/`

#### Step 2 : Configurer Python

```yaml
- name: Configuration de Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
```

**Explication** :
- `actions/setup-python@v5` : Action qui installe Python
- `python-version: '3.11'` : Version spécifique de Python
- `cache: 'pip'` : Cache les packages pip pour accélérer les prochaines exécutions

#### Step 3 : Installer Chrome

```yaml
- name: Installation de Google Chrome
  run: |
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable
```

**Explication** :
- `run` : Exécute des commandes shell
- Ces commandes installent Google Chrome sur Ubuntu
- Nécessaire car Selenium a besoin d'un navigateur

#### Step 4 : Installer les dépendances Python

```yaml
- name: Installation des dépendances Python
  run: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
```

**Explication** :
- Met à jour pip
- Installe tous les packages listés dans `requirements.txt` (selenium, python-dotenv, etc.)

#### Step 5 : Exécuter les tests

```yaml
- name: Exécution des tests TC001 (Inscription)
  env:
    CI: true
    PYTHONPATH: ${{ github.workspace }}
    LASTNAME: ${{ secrets.LASTNAME }}
    FIRSTNAME: ${{ secrets.FIRSTNAME }}
    # ...
  run: |
    python TC001/TC001.py
```

**Explication** :
- `env` : Définit des variables d'environnement pour cette étape
- `CI: true` : Active le mode CI dans les tests
- `PYTHONPATH: ${{ github.workspace }}` : Permet à Python de trouver le module `utils`
- `${{ secrets.LASTNAME }}` : Lit un secret GitHub (identifiants de test)
- `run` : Exécute le test Python

### Schéma complet du pipeline

```
┌─────────────────────────────────────────┐
│  Push sur main → Déclenche le workflow │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Job: test                               │
│  ┌─────────────────────────────────────┐ │
│  │ Step 1: Checkout (récupère code)   │ │
│  │ Step 2: Setup Python 3.11           │ │
│  │ Step 3: Install Chrome              │ │
│  │ Step 4: Install dépendances Python  │ │
│  │ Step 5: Test TC001                  │ │
│  │ Step 6: Test TC002                  │ │
│  │ Step 7: Test TC003                  │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Résultat : ✅ Succès ou ❌ Échec       │
└─────────────────────────────────────────┘
```

---

## 🔍 Configuration et résolution des problèmes

### Problème 1 : ModuleNotFoundError

**Erreur** :
```
ModuleNotFoundError: No module named 'utils'
```

**Cause** : Python ne trouvait pas le module `utils` car la racine du projet n'était pas dans le PYTHONPATH.

**Solution** :
```yaml
env:
  PYTHONPATH: ${{ github.workspace }}
```

**Explication** :
- `${{ github.workspace }}` = chemin absolu vers le code (ex: `/home/runner/work/eboutique_reconcil_beauty_afro/eboutique_reconcil_beauty_afro`)
- `PYTHONPATH` = variable d'environnement qui dit à Python où chercher les modules
- Résultat : Python peut maintenant trouver `utils/`

### Problème 2 : Variables d'environnement non trouvées

**Erreur** :
```
⚠️ La variable d'environnement LASTNAME doit être définie dans .env
```

**Cause** : Le code cherchait les variables dans un fichier `.env` qui n'existe pas en CI.

**Solution 1** : Modifier `get_env_var.py` pour supporter les variables système :
```python
# Charge .env seulement s'il existe
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=False)
else:
    load_dotenv(override=False)

# os.getenv() lit les variables système (définies dans GitHub Actions)
value = os.getenv(name)
```

**Solution 2** : Définir les variables dans le workflow :
```yaml
env:
  LASTNAME: ${{ secrets.LASTNAME }}
  FIRSTNAME: ${{ secrets.FIRSTNAME }}
  # ...
```

**Explication** :
- Les secrets GitHub sont stockés de manière sécurisée
- `${{ secrets.LASTNAME }}` injecte la valeur du secret comme variable d'environnement
- Le code Python lit cette variable avec `os.getenv("LASTNAME")`

### Configuration des secrets GitHub

**Où** : Settings → Secrets and variables → Actions

**Secrets à créer** :
- `LASTNAME`
- `FIRSTNAME`
- `LOGIN_USERNAME`
- `LOGIN_PASSWORD`
- `WRONG_EMAIL`
- `WRONG_PASSWORD`
- `LOGIN_USERNAME_REGISTER`

**Pourquoi des secrets ?** :
- Les identifiants ne doivent pas être dans le code (sécurité)
- Les secrets sont chiffrés et masqués dans les logs

---

## 📊 Résumé de ce qui a été fait

### 1. Fusion des repositories ✅

- Ajout du remote `eboutique`
- Fusion des deux historiques Git
- Résolution du conflit sur `README.md`
- Push vers `eboutique_reconcil_beauty_afro/main`

**Résultat** : Les tests Selenium sont maintenant dans le même repository que l'application.

### 2. Adaptation des tests pour le CI ✅

- Détection automatique du mode CI (`CI=true`)
- Activation automatique du mode headless en CI
- Suppression des pauses interactives en CI
- Codes de sortie pour signaler les échecs
- Support des variables d'environnement système

**Résultat** : Les tests fonctionnent à la fois en local ET en CI.

### 3. Création du pipeline GitHub Actions ✅

- Création du fichier `.github/workflows/run_tests.yml`
- Configuration du déclenchement (push, PR, manuel)
- Définition du job `test`
- Ajout des steps : checkout, Python, Chrome, dépendances, tests
- Configuration des variables d'environnement et secrets

**Résultat** : Pipeline complet qui s'exécute automatiquement.

### 4. Résolution des problèmes ✅

- Fix du `ModuleNotFoundError` avec `PYTHONPATH`
- Fix de la gestion des variables d'environnement
- Ajout d'une étape de debug pour vérifier les variables

**Résultat** : Pipeline fonctionnel.

---

## 🎯 Ce que vous avez maintenant

### Un pipeline CI/CD complet

1. **Déclenchement automatique** : À chaque push sur `main`
2. **Environnement isolé** : Chaque exécution utilise une machine Ubuntu propre
3. **Tests automatisés** : TC001, TC002, TC003 s'exécutent automatiquement
4. **Rapports** : Résultats visibles dans l'onglet Actions de GitHub
5. **Sécurité** : Identifiants stockés comme secrets

### Structure finale

```
eboutique_reconcil_beauty_afro/
├── .github/
│   └── workflows/
│       └── run_tests.yml    ← Pipeline CI/CD
├── TC001/                   ← Test 1
├── TC002/                   ← Test 2
├── TC003/                   ← Test 3
├── utils/                   ← Utilitaires Selenium
└── requirements.txt         ← Dépendances Python
```

---

## 📚 Glossaire

- **Workflow** : Fichier YAML qui décrit un processus automatisé
- **Job** : Tâche majeure dans un workflow (peut contenir plusieurs steps)
- **Step** : Action individuelle dans un job
- **Pipeline** : Ensemble du processus (workflow + jobs + steps)
- **CI** : Continuous Integration (exécution automatique des tests)
- **CD** : Continuous Deployment (déploiement automatique)
- **Headless** : Mode sans interface graphique (pour les serveurs)
- **Secret** : Variable sensible stockée de manière sécurisée dans GitHub
- **Remote** : Lien vers un autre repository Git

---

## 🚀 Prochaines étapes possibles

1. **Ajouter plus de tests** : TC004, TC005, etc.
2. **Notifications** : Envoyer un email en cas d'échec
3. **Rapports** : Générer des rapports de test (Allure, HTML)
4. **Parallélisation** : Exécuter les tests en parallèle pour aller plus vite
5. **Déploiement automatique** : Si les tests passent, déployer automatiquement

---

**Félicitations ! Vous avez maintenant un pipeline CI/CD fonctionnel ! 🎉**

