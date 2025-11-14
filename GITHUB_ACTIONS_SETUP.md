# Configuration GitHub Actions

Ce guide explique comment configurer le pipeline CI/CD avec GitHub Actions pour ce projet d'automatisation Selenium.

## 📋 Prérequis

1. Un repository GitHub (https://github.com/kingcrud12/eboutique_reconcil_beauty_afro.git)
2. Les droits d'administration sur le repository
3. Les identifiants de test configurés

## 🔐 Configuration des Secrets GitHub

Les tests nécessitent des variables d'environnement pour fonctionner. Dans GitHub Actions, ces valeurs sensibles doivent être stockées comme **Secrets**.

### Étapes pour configurer les secrets

1. **Accéder aux paramètres du repository**
   - Allez sur votre repository GitHub
   - Cliquez sur **Settings** (Paramètres)
   - Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**

2. **Ajouter les secrets suivants**

   Cliquez sur **New repository secret** pour chaque variable :

   | Nom du Secret | Description | Exemple |
   |--------------|-------------|---------|
   | `LASTNAME` | Nom de famille pour l'inscription | `Dupont` |
   | `FIRSTNAME` | Prénom pour l'inscription | `Jean` |
   | `LOGIN_USERNAME` | Email de connexion valide | `user@example.com` |
   | `LOGIN_PASSWORD` | Mot de passe de connexion | `MotDePasse123!` |
   | `WRONG_EMAIL` | Email invalide pour test négatif | `wrong@example.com` |
   | `WRONG_PASSWORD` | Mot de passe invalide | `WrongPassword123!` |
   | `LOGIN_USERNAME_REGISTER` | Email pour création de compte | `test+1@example.com` |

3. **Vérification**

   Après avoir ajouté tous les secrets, vous devriez voir 7 secrets dans la liste.

## 🚀 Fonctionnement du Pipeline

### Déclenchement automatique

Le pipeline s'exécute automatiquement dans les cas suivants :

- **Push sur les branches** : `main`, `master`, `develop`
- **Pull Request** vers les branches : `main`, `master`, `develop`
- **Déclenchement manuel** : Via l'onglet "Actions" de GitHub

### Étapes du pipeline

1. **Checkout du code** : Récupération du code source
2. **Configuration Python** : Installation de Python 3.11
3. **Installation Chrome** : Installation de Google Chrome
4. **Installation dépendances** : Installation des packages Python
5. **Exécution des tests** :
   - TC001 : Test d'inscription
   - TC002 : Test de connexion valide
   - TC003 : Test de connexion invalide

### Mode Headless

Les tests s'exécutent automatiquement en mode **headless** (sans interface graphique) dans GitHub Actions pour des raisons de performance et de compatibilité.

## 📊 Visualisation des résultats

### Accéder aux résultats

1. Allez sur votre repository GitHub
2. Cliquez sur l'onglet **Actions**
3. Sélectionnez le workflow "Tests d'automatisation Selenium"
4. Cliquez sur la dernière exécution pour voir les détails

### Interprétation des résultats

- ✅ **Succès (vert)** : Tous les tests ont réussi
- ❌ **Échec (rouge)** : Au moins un test a échoué
- ⚠️ **Annulé (gris)** : Le workflow a été annulé

### Logs détaillés

Pour chaque étape, vous pouvez :
- Voir les logs en cliquant sur l'étape
- Télécharger les artefacts (logs, screenshots) en cas d'échec

## 🔧 Personnalisation

### Modifier les branches déclenchantes

Éditez `.github/workflows/run_tests.yml` :

```yaml
on:
  push:
    branches: [ main, master, develop, votre-branche ]
```

### Ajouter des tests supplémentaires

Ajoutez une nouvelle étape dans le workflow :

```yaml
- name: Exécution des tests TC004
  env:
    CI: true
    # Vos variables d'environnement
  run: |
    python TC004/TC004.py
```

### Modifier la version de Python

Dans `.github/workflows/run_tests.yml` :

```yaml
- name: Configuration de Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.12'  # Changez la version ici
```

## 🐛 Dépannage

### Les tests échouent avec "ChromeDriver not found"

**Solution** : Le workflow utilise maintenant `webdriver-manager` qui télécharge automatiquement ChromeDriver. Vérifiez que `webdriver-manager` est dans `requirements.txt`.

### Les tests échouent avec "Element not found"

**Causes possibles** :
- L'URL de l'application a changé
- Les sélecteurs CSS/XPath ont changé
- Le site est temporairement indisponible

**Solution** : Vérifiez les logs détaillés dans GitHub Actions pour voir l'erreur exacte.

### Les secrets ne sont pas reconnus

**Vérifications** :
1. Les noms des secrets correspondent exactement (sensible à la casse)
2. Les secrets sont bien configurés dans Settings → Secrets and variables → Actions
3. Le workflow utilise bien `${{ secrets.NOM_SECRET }}`

### Le pipeline ne se déclenche pas

**Vérifications** :
1. Le fichier `.github/workflows/run_tests.yml` est bien présent dans le repository
2. Vous avez fait un push sur une branche configurée (`main`, `master`, `develop`)
3. Le fichier workflow est valide (syntaxe YAML correcte)

## 📝 Notes importantes

- ⚠️ **Ne jamais commiter les secrets** dans le code ou les fichiers `.env`
- ✅ Les secrets sont automatiquement masqués dans les logs GitHub Actions
- 🔒 Les secrets sont chiffrés par GitHub et ne sont accessibles qu'aux personnes autorisées
- 🚀 Le pipeline s'exécute sur des runners Ubuntu (gratuits pour les repositories publics)

## 🔗 Ressources

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Gestion des secrets GitHub](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Documentation Selenium](https://selenium-python.readthedocs.io/)

---

**Bon test ! 🚀**

