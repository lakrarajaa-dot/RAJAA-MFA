# Smart Application - Système d'Authentification Multi-Facteurs (MFA)

Une application web moderne avec authentification renforcée en 3 étapes (Email + Mot de passe → Code par email → Code TOTP via Google Authenticator).

## 🚀 Présentation

Smart Application est une plateforme sécurisée implémentant un système **Multi-Factor Authentication (MFA)** complet avec :

- Authentification classique (email + mot de passe)
- Vérification par code envoyé par email
- Authentification TOTP (Google Authenticator, Microsoft Authenticator, etc.)
- Interface moderne avec arrière-plan animé
- Journal d'audit des connexions complet

## ✨ Fonctionnalités

- Authentification en 3 étapes (MFA)
- Configuration automatique du TOTP (QR Code + clé secrète)
- Journal d'audit détaillé des connexions
- Interface utilisateur moderne et responsive
- Arrière-plan animé sur toutes les pages
- Système de sessions sécurisé
- Export des logs en CSV

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **npm** (inclus avec Node.js)
- Un éditeur de code (VS Code recommandé)

### Dépendances requises

```bash
express
express-session
bcrypt
nodemailer
speakeasy
qrcode
dotenv
Installation
1. Cloner le projet
Bashgit clone https://github.com/votre-utilisateur/smart-application.git
cd smart-application
2. Installer les dépendances
Bashnpm install
3. Structure du projet
textsmart-application/
├── public/
│   ├── index.html
│   ├── accueil.html
│   ├── blog.html
│   └── logs.html
├── routes/
│   ├── auth.js
│   └── home.js
├── middleware/
│   └── logger.js
├── .env
├── server.js
├── package.json
└── README.md
Configuration
1. Créer le fichier .env
À la racine du projet, créez un fichier .env avec le contenu suivant :
env# Configuration serveur
PORT=3000

# Session
SESSION_SECRET=super_secret_key_changez_moi_en_production

# Configuration Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# Base de données (optionnel pour l'instant)
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=
Important : Pour Gmail, utilisez un mot de passe d'application (pas votre mot de passe normal).
2. Configuration de la session
Dans server.js, assurez-vous que la clé secrète est bien définie (elle sera automatiquement prise depuis .env si vous l'améliorez).
Lancement de l'application
Mode développement
Bashnode server.js
Ou avec nodemon (recommandé) :
Bashnpm install -g nodemon
nodemon server.js
L'application sera accessible à l'adresse :
→ http://localhost:3000
Routes Principales



RouteDescription/Page de connexion MFA/accueilTableau de bord après connexion/blogPage blog/logsJournal d'audit des connexions/logoutDéconnexion
Tests
Tester manuellement

Accédez à http://localhost:3000
Connectez-vous avec vos identifiants
Vérifiez la réception du code par email
Scannez le QR Code avec Google Authenticator
Validez le code TOTP
Vérifiez l'accès à la page d'accueil
Consultez le journal des connexions sur /logs

Tests automatisés (à venir)
Vous pouvez ajouter des tests avec Jest ou Supertest dans un dossier tests/.
Structure des Étapes d'Authentification

Étape 1 : Email + Mot de passe
Étape 2 : Code de vérification envoyé par email
Étape 3 : Code TOTP (Google Authenticator)

Technologies Utilisées

Backend : Node.js + Express
Sessions : express-session
Authentification : Speakeasy (TOTP) + Nodemailer
Frontend : HTML5, CSS3, Vanilla JavaScript
Design : Interface moderne avec arrière-plan animé
Icônes : Material Symbols

Sécurité

Sessions sécurisées (httpOnly)
Protection contre les attaques par force brute (à améliorer)
Hashing des mots de passe (recommandé avec bcrypt)
Journalisation complète des tentatives de connexion

Améliorations futures

Ajout d'une vraie base de données (MongoDB / PostgreSQL)
Système de rôles (Admin / Utilisateur)
Protection CSRF
Rate limiting
Mode sombre
Responsive avancé


Auteur : RAJAA
Version : 1.0.0
Date : Mars 2026