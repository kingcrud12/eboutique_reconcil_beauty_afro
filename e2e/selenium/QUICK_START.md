# 🚀 Guide Rapide - Tests E2E Selenium

## ⚡ Démarrage Rapide

### Option 1 : Démarrage Automatique (Recommandé)

```bash
cd e2e/selenium
npm run test:auto
```

Cette commande va :
1. ✅ Démarrer automatiquement le backend et le frontend
2. ✅ Attendre que l'application soit prête
3. ✅ Exécuter les tests
4. ✅ Arrêter l'application après les tests

### Option 2 : Démarrage Manuel

**Terminal 1 - Backend :**
```bash
cd api
npm run start:dev
```

**Terminal 2 - Frontend :**
```bash
cd client
npm start
```

**Terminal 3 - Tests :**
```bash
cd e2e/selenium
npm test
```

## 📋 Commandes Disponibles

```bash
# Vérifier si l'application est démarrée
npm run check:app

# Démarrer l'application automatiquement
npm run start:app

# Arrêter l'application
npm run stop:app

# Lancer les tests (nécessite l'application démarrée)
npm test

# Tests avec vérification automatique
npm run test:with-check

# Tests avec démarrage/arrêt automatique
npm run test:auto

# Tests en mode headless (sans interface)
npm run test:headless

# Tests de smoke (tests critiques)
npm run test:smoke

# Tests de régression
npm run test:regression
```

## 🐛 Résolution de Problèmes

### Erreur : ERR_CONNECTION_REFUSED

**Solution :** L'application n'est pas démarrée
```bash
npm run start:app
# Attendez que l'application soit prête, puis :
npm test
```

### Erreur : ChromeDriver version mismatch

**Solution :**
```bash
npm install chromedriver@latest --save-dev
```

### Les tests sont trop lents

**Solution :** Utilisez le mode headless
```bash
npm run test:headless
```

## 📝 Configuration

Créez un fichier `.env` dans `e2e/selenium/` :

```env
BASE_URL=http://localhost:3000
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123
HEADLESS=false
BROWSER=chrome
```

## ✅ Checklist Avant de Lancer les Tests

- [ ] Backend démarré (port 3001)
- [ ] Frontend démarré (port 3000)
- [ ] Base de données accessible
- [ ] ChromeDriver installé et à jour
- [ ] Variables d'environnement configurées (optionnel)

## 🎯 Résultat Attendu

Une fois tout configuré, vous devriez voir :

```
PASS  tests/auth.test.ts
  Tests d'authentification
    ✓ smoke - La page de connexion se charge correctement
    ✓ Le champ email est visible
    ...

PASS  tests/cart.test.ts
  Tests du panier
    ✓ smoke - La page panier se charge correctement
    ...

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
```

---

**Besoin d'aide ?** Consultez `TEST_RUN_INSTRUCTIONS.md` pour plus de détails.

