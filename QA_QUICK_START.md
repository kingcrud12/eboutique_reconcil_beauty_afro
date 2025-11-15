# 🚀 Guide de Démarrage Rapide - QA Engineer

## 📋 Prérequis

- Node.js 20+
- npm ou yarn
- Git
- Chrome/Firefox installé

## ⚡ Installation en 5 minutes

### 1. Installer les dépendances Backend

```bash
cd api
npm install
```

### 2. Installer les dépendances Frontend

```bash
cd ../client
npm install
```

### 3. Installer les dépendances E2E

```bash
cd ../e2e/selenium
npm install
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` dans `e2e/selenium/` :

```env
BASE_URL=http://localhost:3000
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123
HEADLESS=false
BROWSER=chrome
```

## 🧪 Exécuter vos Premiers Tests

### Tests Unitaires Backend

```bash
cd api
npm test
```

### Tests E2E API

```bash
cd api
npm run test:e2e
```

### Tests E2E Selenium

```bash
cd e2e/selenium
npm test
```

## 📚 Parcours d'Apprentissage

### Semaine 1 : Fondations

**Jour 1-2 : Comprendre les Tests**
- [ ] Lire `QA_LEARNING_GUIDE.md`
- [ ] Exécuter les tests existants
- [ ] Comprendre la structure

**Jour 3-4 : Tests Unitaires**
- [ ] Examiner les tests unitaires existants
- [ ] Modifier un test existant
- [ ] Créer un nouveau test unitaire

**Jour 5-7 : Tests API**
- [ ] Exécuter les tests E2E API
- [ ] Comprendre Supertest
- [ ] Écrire un test API simple

### Semaine 2 : Selenium

**Jour 1-2 : Configuration**
- [ ] Installer Selenium
- [ ] Configurer WebDriver
- [ ] Exécuter un test simple

**Jour 3-4 : Page Object Model**
- [ ] Comprendre le POM
- [ ] Examiner les Page Objects existants
- [ ] Créer une nouvelle Page Object

**Jour 5-7 : Tests E2E**
- [ ] Écrire un test de connexion
- [ ] Écrire un test de navigation
- [ ] Écrire un test de formulaire

### Semaine 3 : CI/CD

**Jour 1-2 : GitHub Actions**
- [ ] Comprendre le pipeline
- [ ] Exécuter le pipeline localement
- [ ] Modifier le workflow

**Jour 3-4 : Automatisation**
- [ ] Configurer les triggers
- [ ] Ajouter des notifications
- [ ] Optimiser les temps d'exécution

**Jour 5-7 : Rapports**
- [ ] Configurer les rapports de couverture
- [ ] Ajouter des screenshots
- [ ] Créer des dashboards

### Semaine 4 : Projet Personnel

**Créer votre Portfolio**
- [ ] Forker ce projet
- [ ] Ajouter vos propres tests
- [ ] Documenter vos contributions
- [ ] Créer un README pour votre portfolio

## 🎯 Objectifs par Niveau

### Niveau 1 : Débutant
- ✅ Exécuter les tests existants
- ✅ Comprendre la structure
- ✅ Modifier un test simple

### Niveau 2 : Intermédiaire
- ✅ Créer de nouveaux tests
- ✅ Utiliser le Page Object Model
- ✅ Gérer les erreurs

### Niveau 3 : Avancé
- ✅ Optimiser les tests
- ✅ Créer des helpers réutilisables
- ✅ Configurer CI/CD

## 🐛 Résolution de Problèmes

### Problème : Les tests Selenium ne démarrent pas

**Solution** :
```bash
# Vérifier que ChromeDriver est installé
chromedriver --version

# Installer ChromeDriver
npm install -g chromedriver
```

### Problème : Les tests API échouent

**Solution** :
```bash
# Vérifier que la base de données est accessible
# Vérifier les variables d'environnement
# Vérifier que l'API est démarrée
```

### Problème : Le pipeline CI/CD échoue

**Solution** :
- Vérifier les logs GitHub Actions
- Vérifier les variables d'environnement
- Vérifier les dépendances

## 📖 Ressources Supplémentaires

### Documentation
- [Selenium](https://www.selenium.dev/documentation/)
- [Jest](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [GitHub Actions](https://docs.github.com/en/actions)

### Cours Recommandés
- Udemy: Selenium WebDriver
- Coursera: Software Testing
- FreeCodeCamp: QA Testing

### Communautés
- Stack Overflow
- Reddit: r/QualityAssurance
- LinkedIn: QA Groups

## ✅ Checklist d'Embauchabilité

### Compétences Techniques
- [ ] Maîtriser Selenium WebDriver
- [ ] Connaître les tests API
- [ ] Expérience avec CI/CD
- [ ] Comprendre Git
- [ ] Connaissances en SQL

### Compétences Soft
- [ ] Communication claire
- [ ] Résolution de problèmes
- [ ] Attention aux détails
- [ ] Collaboration

### Portfolio
- [ ] Projet avec tests automatisés
- [ ] Documentation claire
- [ ] Code propre et commenté
- [ ] README professionnel

## 🎉 Prochaines Étapes

1. **Compléter le parcours d'apprentissage**
2. **Créer votre portfolio**
3. **Postuler pour des postes Junior QA**
4. **Continuer à apprendre**

---

**Bon courage dans votre parcours ! 🚀**

