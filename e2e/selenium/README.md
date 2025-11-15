# Tests E2E avec Selenium

## 📚 Guide d'Apprentissage

Ce dossier contient tous les tests E2E automatisés avec Selenium WebDriver.

## 🚀 Installation

```bash
cd e2e/selenium
npm install
```

## 🧪 Exécution des Tests

### Tous les tests
```bash
npm test
```

### Tests en mode watch
```bash
npm run test:watch
```

### Tests sur Chrome
```bash
npm run test:chrome
```

### Tests sur Firefox
```bash
npm run test:firefox
```

### Tests en mode headless (sans interface)
```bash
npm run test:headless
```

### Tests de smoke (tests critiques)
```bash
npm run test:smoke
```

### Tests de régression
```bash
npm run test:regression
```

## 📁 Structure

```
selenium/
├── config/              # Configuration Selenium
├── pages/              # Page Object Model
├── tests/              # Tests E2E
├── utils/              # Utilitaires
└── screenshots/        # Captures d'écran (générées)
```

## 🎯 Concepts Appris

### 1. Page Object Model (POM)

**Principe** : Séparer la logique de test de la logique de navigation

**Avantages** :
- ✅ Réutilisabilité
- ✅ Maintenabilité
- ✅ Lisibilité

**Exemple** :
```typescript
// pages/LoginPage.ts
export class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}

// tests/auth.test.ts
test('should login successfully', async () => {
  await loginPage.login('user@example.com', 'password');
});
```

### 2. Localisateurs

**Types de localisateurs** :
- `By.id()` - Par ID
- `By.className()` - Par classe CSS
- `By.css()` - Sélecteur CSS
- `By.xpath()` - XPath
- `By.linkText()` - Par texte de lien

**Bonnes pratiques** :
- Préférer les IDs stables
- Éviter les XPath complexes
- Utiliser des data-testid

### 3. Attentes (Waits)

**Types d'attentes** :
- **Implicit Wait** : Attente globale
- **Explicit Wait** : Attente conditionnelle
- **Fluent Wait** : Attente avec conditions

**Exemple** :
```typescript
await driver.wait(until.elementLocated(By.id('button')), 10000);
```

### 4. Gestion des Erreurs

**Stratégies** :
- Try-catch pour les éléments optionnels
- Screenshots en cas d'échec
- Logs détaillés

## 📝 Écrire un Nouveau Test

### Étape 1 : Créer la Page Object

```typescript
// pages/MyPage.ts
export class MyPage extends BasePage {
  private readonly myButton = By.id('my-button');
  
  async clickMyButton() {
    await this.click(this.myButton);
  }
}
```

### Étape 2 : Écrire le Test

```typescript
// tests/my.test.ts
describe('My Feature', () => {
  let myPage: MyPage;
  
  beforeAll(() => {
    myPage = new MyPage();
  });
  
  test('should do something', async () => {
    await myPage.navigate();
    await myPage.clickMyButton();
    // Assertions
  });
});
```

## 🐛 Debugging

### Mode Debug
```bash
DEBUG=true npm test
```

### Screenshots
Les screenshots sont automatiquement sauvegardés dans `screenshots/` en cas d'échec.

### Logs
Les logs du navigateur sont capturés et affichés en cas d'erreur.

## 📊 Rapports

Les tests génèrent des rapports :
- Console : Résumé des tests
- Coverage : Couverture de code (si configuré)
- Screenshots : Captures d'écran des échecs

## 🎓 Exercices Pratiques

### Niveau 1 : Débutant
1. Exécuter les tests existants
2. Modifier un test existant
3. Ajouter une assertion

### Niveau 2 : Intermédiaire
1. Créer une nouvelle Page Object
2. Écrire un test complet
3. Gérer les erreurs

### Niveau 3 : Avancé
1. Optimiser les temps d'attente
2. Créer des helpers réutilisables
3. Implémenter des tests de performance

## 🔗 Ressources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [WebDriver API](https://www.selenium.dev/selenium/docs/api/javascript/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## ✅ Checklist QA Engineer

- [ ] Comprendre le Page Object Model
- [ ] Maîtriser les localisateurs
- [ ] Gérer les attentes
- [ ] Écrire des tests maintenables
- [ ] Debugger les tests
- [ ] Optimiser les performances
- [ ] Intégrer dans CI/CD

