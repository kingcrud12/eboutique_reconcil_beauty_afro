# Guide : Déployer les tests sur eboutique_reconcil_beauty_afro

Ce guide explique comment intégrer ce projet de tests d'automatisation dans le repository [eboutique_reconcil_beauty_afro](https://github.com/kingcrud12/eboutique_reconcil_beauty_afro.git).

## 🎯 Objectif

Faire en sorte que le pipeline GitHub Actions s'exécute automatiquement sur le repository `eboutique_reconcil_beauty_afro` à chaque push.

## 📋 Options de déploiement

### Option 1 : Créer un sous-dossier (Recommandé)

Cette option préserve la structure existante du repository et ajoute les tests dans un dossier dédié.

#### Étapes

1. **Créer une branche pour les tests**

```bash
git checkout -b add-selenium-tests
```

2. **Pousser vers le repository eboutique**

```bash
# Créer un sous-dossier pour les tests
mkdir selenium_tests
# Copier tous les fichiers du projet actuel dans selenium_tests
# (ou utiliser git subtree si vous préférez)

# Pousser vers le remote eboutique
git push eboutique add-selenium-tests:main
```

**OU** plus simplement, pousser directement le contenu actuel :

```bash
# Pousser la branche actuelle vers eboutique
git push eboutique main:selenium-automation
```

3. **Créer une Pull Request** sur GitHub pour fusionner dans `main`

### Option 2 : Intégration directe à la racine

Si vous voulez que les tests soient à la racine du repository `eboutique_reconcil_beauty_afro` :

```bash
# S'assurer d'être sur la branche main
git checkout main

# Pousser vers eboutique
git push eboutique main
```

⚠️ **Attention** : Cette option peut créer des conflits si des fichiers avec les mêmes noms existent déjà.

### Option 3 : Utiliser un sous-module Git (Avancé)

Pour garder les tests dans un repository séparé mais les référencer depuis eboutique :

```bash
# Depuis le repository eboutique_reconcil_beauty_afro
git submodule add https://github.com/kingcrud12/selenium_automation_project.git selenium_tests
```

## 🚀 Méthode recommandée : Push direct

La méthode la plus simple est de pousser directement votre code actuel vers le repository eboutique :

### Commandes à exécuter

```bash
# 1. Vérifier que vous êtes sur la branche main et que tout est commité
git status

# 2. Si nécessaire, commiter les changements
git add .
git commit -m "Ajout du pipeline GitHub Actions pour les tests Selenium"

# 3. Pousser vers le repository eboutique
git push eboutique main
```

### Si le repository eboutique a déjà une branche main

Si le repository `eboutique_reconcil_beauty_afro` a déjà du contenu sur `main`, créez une nouvelle branche :

```bash
# Créer une nouvelle branche
git checkout -b selenium-automation

# Pousser cette branche
git push eboutique selenium-automation

# Ensuite, créer une Pull Request sur GitHub pour fusionner
```

## ✅ Vérification

Après avoir poussé le code :

1. **Vérifier sur GitHub**
   - Allez sur https://github.com/kingcrud12/eboutique_reconcil_beauty_afro
   - Vérifiez que le dossier `.github/workflows/run_tests.yml` est présent

2. **Configurer les secrets** (si pas déjà fait)
   - Settings → Secrets and variables → Actions
   - Ajouter les 7 secrets nécessaires (voir `GITHUB_ACTIONS_SETUP.md`)

3. **Déclencher le workflow**
   - Faites un nouveau push ou allez dans Actions → "Tests d'automatisation Selenium" → "Run workflow"

## 🔧 Configuration du workflow pour un sous-dossier

Si vous avez choisi l'option 1 (sous-dossier), vous devrez modifier le workflow pour qu'il s'exécute depuis le bon répertoire :

```yaml
# Dans .github/workflows/run_tests.yml, ajouter :
defaults:
  run:
    working-directory: ./selenium_tests  # Si vous avez mis les tests dans selenium_tests

# Et modifier les chemins des tests :
- name: Exécution des tests TC001
  run: |
    cd selenium_tests  # Si nécessaire
    python TC001/TC001.py
```

## 📝 Notes importantes

- ⚠️ Le workflow GitHub Actions s'exécute **automatiquement** sur le repository où il est présent
- ✅ Une fois le code poussé sur `eboutique_reconcil_beauty_afro`, le workflow sera actif
- 🔐 N'oubliez pas de configurer les secrets GitHub avant la première exécution
- 📁 Le workflow cherche les fichiers à la racine du repository par défaut

## 🆘 Dépannage

### Erreur : "remote already exists"
Si le remote `eboutique` existe déjà :
```bash
git remote remove eboutique
git remote add eboutique https://github.com/kingcrud12/eboutique_reconcil_beauty_afro.git
```

### Erreur : "failed to push"
Vérifiez que vous avez les droits d'écriture sur le repository :
- Settings → Collaborators (pour les repositories personnels)
- Ou vérifiez les permissions de votre compte

### Le workflow ne se déclenche pas
1. Vérifiez que le fichier `.github/workflows/run_tests.yml` est bien présent
2. Vérifiez la syntaxe YAML (pas d'erreurs)
3. Vérifiez que vous avez fait un push sur une branche configurée (`main`, `master`, `develop`)

---

**Une fois le code poussé, le pipeline s'exécutera automatiquement ! 🚀**

