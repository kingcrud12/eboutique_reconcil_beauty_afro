# 🚀 Instructions pour lancer les tests E2E Selenium

## ✅ Problèmes résolus

1. ✅ **ChromeDriver mis à jour** : Compatible avec Chrome 142
2. ✅ **CartPage recréée** : Fichier manquant restauré
3. ✅ **getCurrentUrl() rendu public** : Accessible depuis les tests

## ⚠️ Avant de lancer les tests

**L'application doit être démarrée !**

### Option 1 : Démarrer manuellement

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

### Option 2 : Utiliser les variables d'environnement

Si votre application tourne sur un autre port ou URL :

```bash
cd e2e/selenium
BASE_URL=http://localhost:3000 npm test
```

## 🧪 Commandes disponibles

```bash
# Tous les tests
npm test

# Tests en mode headless (sans interface)
npm run test:headless

# Tests de smoke (tests critiques)
npm run test:smoke

# Tests de régression
npm run test:regression

# Tests sur Firefox
npm run test:firefox

# Tests en mode watch
npm run test:watch
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

## ✅ Résultat attendu

Une fois l'application démarrée, les tests devraient :
- ✅ Se connecter à l'application
- ✅ Exécuter les tests d'authentification
- ✅ Exécuter les tests du panier
- ✅ Générer un rapport

## 🐛 Dépannage

### Erreur : ERR_CONNECTION_REFUSED
→ L'application n'est pas démarrée. Vérifiez que le backend et le frontend tournent.

### Erreur : ChromeDriver version mismatch
→ Exécutez : `npm install chromedriver@latest --save-dev`

### Erreur : Timeout
→ Augmentez le timeout dans `jest.config.js` ou vérifiez que l'application répond rapidement.

