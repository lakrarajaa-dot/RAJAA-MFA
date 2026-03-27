# Smart Application - Documentation Technique

**Système d'Authentification Multi-Facteurs (MFA) en 3 étapes**

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Structure du projet](#structure-du-projet)
6. [Lancement de l'application](#lancement-de-lapplication)
7. [Routes de l'application](#routes-de-lapplication)
8. [Fonctionnement de l'authentification](#fonctionnement-de-lauthentification)
9. [Tests](#tests)
10. [Sécurité](#sécurité)
11. [Améliorations futures](#améliorations-futures)

---

## Introduction

**Smart Application** est une plateforme web moderne implémentant un système d'authentification multi-facteurs (MFA) complet en trois étapes :

- **Étape 1** : Authentification classique (Email + Mot de passe)
- **Étape 2** : Vérification par code envoyé par email
- **Étape 3** : Authentification TOTP (Google Authenticator / Microsoft Authenticator)

L'application inclut également :
- Un journal d'audit complet des connexions
- Une interface utilisateur moderne avec arrière-plan animé
- Un design responsive et professionnel

---

## Prérequis

### Logiciels nécessaires

- **Node.js** ≥ 18
- **npm** (inclus avec Node.js)
- Un navigateur moderne (Chrome, Firefox, Edge)

### Dépendances principales

| Dépendance            | Utilisation                          |
|-----------------------|--------------------------------------|
| `express`             | Framework web                        |
| `express-session`     | Gestion des sessions                 |
| `nodemailer`          | Envoi des codes par email            |
| `speakeasy`           | Génération et vérification TOTP      |
| `qrcode`              | Génération du QR Code                |
| `dotenv`              | Gestion des variables d'environnement |

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-de-votre-repo>
cd smart-application


2. Installer les dépendances
Bashnpm install
3. Créer le fichier d'environnement
Créez un fichier .env à la racine du projet :
env# Port du serveur
PORT=3000

# Clé secrète pour les sessions (à changer en production)
SESSION_SECRET=super_secret_key_2026_changez_moi

# Configuration Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application_gmail

# Mode développement / production
NODE_ENV=development
Note : Pour Gmail, utilisez un mot de passe d'application (App Password), pas votre mot de passe habituel.

Structure du projet
plaintextsmart-application/
├── public/
│   ├── index.html          # Page de connexion MFA
│   ├── accueil.html        # Tableau de bord
│   ├── blog.html           # Page Blog
│   └── logs.html           # Journal des connexions
├── routes/
│   ├── auth.js             # Routes d'authentification
│   └── home.js             # Routes des pages protégées
├── middleware/
│   └── logger.js           # Journalisation des actions
├── .env                    # Variables d'environnement
├── server.js               # Point d'entrée principal
├── package.json
└── README.md

Lancement de l'application
En développement
Bashnode server.js
Ou avec nodemon (recommandé) :
Bashnpm install -g nodemon
nodemon server.js
L'application sera disponible à l'adresse :
http://localhost:3000

Routes de l'application

MéthodeRouteDescriptionAccèsGET/Page de connexion MFAPublicGET/accueilTableau de bord utilisateurProtégéGET/blogPage des articlesProtégéGET/logsJournal d'audit des connexionsProtégéGET/logoutDéconnexion de l'utilisateurProtégéPOST/loginAuthentification étape 1PublicPOST/verify-emailVérification du code emailPublicPOST/verify-totpVérification du code TOTPPublic

Fonctionnement de l'authentification
L'authentification se déroule en 3 étapes distinctes :
Étape 1 : Identifiants

Saisie de l'email et du mot de passe
Vérification des identifiants

Étape 2 : Code par email

Envoi d'un code à 6 chiffres par email
Validation du code reçu

Étape 3 : Code TOTP

Affichage du QR Code pour configuration (première connexion)
Saisie du code généré par l'application d'authentification (Google Authenticator, etc.)
Validation finale et connexion réussie


Tests
Tests manuels recommandés

Test de connexion complète
Accéder à /
Saisir email + mot de passe
Recevoir et valider le code email
Scanner le QR Code et valider le code TOTP
Vérifier l'accès à /accueil

Test du journal d'audit
Se connecter
Aller sur /logs
Vérifier que toutes les étapes sont bien enregistrées

Test de déconnexion
Cliquer sur "Déconnexion"
Vérifier la redirection vers la page de login

Test de sécurité
Tenter d'accéder à /accueil sans être connecté
Vérifier que l'accès est refusé



Sécurité

Utilisation de sessions sécurisées (httpOnly)
Protection des mots de passe (recommandé : bcrypt)
Journalisation complète des tentatives de connexion
Codes TOTP à usage unique
Arrière-plan animé moderne avec glassmorphism sur la carte de connexion

Recommandations de sécurité :

Toujours utiliser HTTPS en production
Changer la clé secrète de session
Implémenter un rate limiting
Ajouter une protection CSRF


Améliorations futures

Intégration d'une base de données (MongoDB / PostgreSQL)
Système de gestion des utilisateurs (CRUD)
Mode sombre
Notifications en temps réel
Authentification biométrique
Dashboard administrateur
Tests automatisés (Jest + Supertest)


Auteur
RAJAA
Projet MFA - Smart Application
Mars 2026