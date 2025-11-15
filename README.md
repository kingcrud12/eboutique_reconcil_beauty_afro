# Reconcil Beauty Afro

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![NestJS](https://img.shields.io/badge/NestJS-9.x-red)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blueviolet)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**Reconcil Beauty Afro** est ensemble de trois technlogies qui assurent la vente et l'achat de produits de beauté Afro, la réservation de prestations de coiffure ainsi que la gestion du catalogue produit coté administrateur, la gestion de clients, de commandes, des créneaux de prestations de coiffures. Les trois technologies sont les suivantes :

- **Une API** – Serveur back-end gérant les données, l’authentification, les commandes et les points relais.  
- **Un Backoffice** – Interface admin pour gérer les produits, les services et les utilisateurs.  
- **Un Client web** – Application front-end pour les utilisateurs finaux afin de consulter, réserver et acheter des prestations.

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Utilisation](#utilisation)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Fonctionnalités

### API
- Authentification JWT (inscription, login, logout)  
- Gestion des utilisateurs, rôles et permissions  
- Gestion des produits et prestations (CRUD)  
- Gestion du panier et commandes  
- Points relais pour livraison (inspiré Mondial Relay)  
- Notifications par email (acompte, réinitialisation mot de passe)  

### Backoffice
- Tableau de bord administrateur  
- Gestion des produits et services  
- Gestion des commandes et clients  
- Gestion des rôles et permissions  

### Client
- Navigation et catalogue des prestations et produits  
- Réservation de prestations et commande en ligne  
- Gestion du panier  
- Sélection de points relais pour livraison  
- Formulaire de paiement sécurisé  

---

## Technologies

### API
- **Node.js + NestJS**  
- **TypeScript**  
- **Prisma ORM** (MySQL)  
- **JWT** pour authentification  
- **SendGrid / Mailjet** pour email  
- **Docker** (optionnel pour déploiement)  

### Backoffice & Client
- **React** + TypeScript  
- **React Router** pour le routage  
- **TailwindCSS / Bootstrap** pour le style  
- **Fetch / Axios** pour appels API  
- **Shadcn / Lucide-react** pour UI components  

---

## Structure du projet

### API
```bash

Notre API est découpée en modules, chaque module gère une fonctionnalité précise :

---


src/
├─ auth/           # Module d'authentification
├─ user/           # Gestion des utilisateurs
├─ mailer/         # Gestion du mailing
├─ product/        # Gestion des produits
├─ cart/           # Gestion du panier
├─ order/          # Gestion des commandes
├─ payment/        # Gestion des paiements
├─ service/        # Gestion des prestations
├─ point-relay/    # Gestion des points relais
└─ main.ts         # point d'entrée de notre api


| Méthode | Endpoint               | Description                            | Auth 
| ------- | ---------------------- | -------------------------------------- | ----  
| POST    | `/auth/signup`         | Inscription utilisateur                | ❌    
| POST    | `/auth/login`          | Connexion utilisateur                  | ❌    
| POST    | `/auth/logout`         | Déconnexion utilisateur                | ✅    
| GET     | `/user/me`             | Récupérer profil utilisateur           | ✅    
| GET     | `/products`            | Lister tous les produits               | ❌    
| GET     | `/products/:id`        | Détails d’un produit                   | ❌    
| POST    | `/products`            | Créer un produit (admin)               | ✅    
| PATCH   | `/products/:id`        | Modifier un produit (admin)            | ✅    
| DELETE  | `/products/:id`        | Supprimer un produit (admin)           | ✅    
| POST    | `/carts`               | Ajouter un produit au panier           | ✅    
| GET     | `/carts`               | Récupérer le panier                    | ✅    
| POST    | `/orders`              | Créer une commande                     | ✅    
| POST    | `/point-relay/:userId` | Trouver un point relais pour livraison | ✅  

```

## Utilisation

- Créez un compte via l’interface client ou admin.

- Connectez-vous pour explorer les prestations ou produits.

- Ajoutez des produits ou prestations au panier.

- Choisissez un point relais pour la livraison et validez votre commande.

- Les administrateurs peuvent gérer le catalogue, les commandes et les utilisateurs via le backoffice.


---

## 🧪 Tests d'automatisation Selenium

Ce projet inclut une suite de tests d'automatisation avec Selenium et Python pour valider les fonctionnalités de l'application.

### Structure des tests

- **TC001** : Test d'inscription d'un nouvel utilisateur
- **TC002** : Test de connexion avec des identifiants valides
- **TC003** : Test de connexion avec des identifiants invalides (test négatif)
- **TC004** : Test d'achat de produit par un utilisateur non authentifié

### Architecture des tests

Les tests utilisent une architecture orientée objet avec deux approches :

#### Tests utilisant BaseTest (TC001, TC002, TC003)

Ces tests utilisent la classe de base `BaseTest` qui centralise toute la logique commune :

- **`utils/base_test.py`** : Classe `BaseTest` qui gère :
  - La création et configuration du driver Selenium
  - La détection automatique du mode CI/headless
  - Le cycle de vie des tests (setup, execution, teardown)
  - La gestion des messages de succès/échec
  - La pause interactive (uniquement en mode local)

Chaque test instancie simplement `BaseTest` avec ses paramètres spécifiques :

```python
# Exemple TC001
test = BaseTest(
    test_function=fill_register_form,
    success_message="✅ Formulaire d'inscription rempli avec succès",
    failure_message="⚠️ Échec du remplissage du formulaire"
)
test.run()
```

#### Test avec classe dédiée (TC004)

Le test TC004 utilise une classe dédiée `TestBuyingProductNonAuthenticated` adaptée à ses besoins spécifiques :

- **`TC004/test_buying_product_non_authenticated.py`** : Classe indépendante qui gère :
  - La création et configuration du driver Selenium
  - La détection automatique du mode CI/headless
  - Le cycle de vie du test (setup, execution, teardown)
  - La logique spécifique au parcours d'achat non authentifié

```python
# TC004.py
test = TestBuyingProductNonAuthenticated()
test.run()
```

Cette architecture permet :
- ✅ **DRY** : Évite la duplication de code (BaseTest pour les tests similaires)
- ✅ **Flexibilité** : Permet des classes dédiées pour des besoins spécifiques
- ✅ **Maintenabilité** : Modifications centralisées ou isolées selon les besoins
- ✅ **Extensibilité** : Facile d'ajouter de nouveaux tests
- ✅ **Simplicité** : Chaque test se concentre sur sa logique spécifique

### Pipeline CI/CD

Les tests s'exécutent automatiquement via GitHub Actions à chaque push sur les branches `main`, `master` ou `develop`.

**Configuration requise** :
- Les secrets GitHub doivent être configurés (voir `GITHUB_ACTIONS_SETUP.md`)
- Les tests s'exécutent en mode headless dans GitHub Actions

**Documentation complète** : Consultez `GITHUB_ACTIONS_SETUP.md` pour les instructions détaillées de configuration.

---

Licence

Ce projet est sous licence MIT.
© 2025 Reconcil Beauty Afro
