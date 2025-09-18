# Reconcil Beauty Afro

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![NestJS](https://img.shields.io/badge/NestJS-9.x-red)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blueviolet)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**Reconcil Beauty Afro** est une plateforme complète pour la gestion et la réservation de prestations beauté afro. Le projet se compose de trois parties :

- **API** – Serveur back-end gérant les données, l’authentification, les commandes et les points relais.  
- **Backoffice** – Interface admin pour gérer les produits, les services et les utilisateurs.  
- **Client** – Application front-end pour les utilisateurs finaux afin de consulter, réserver et acheter des prestations.

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

## Installation

### API
```bash
git clone <repo-api-url>
cd api
npm install
cp .env.example .env # remplissez les variables d'environnement
npx prisma migrate dev # crée la base de données
npm run start:dev
