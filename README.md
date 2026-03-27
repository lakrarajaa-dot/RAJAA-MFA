#  Triple MFA Auth — Application Node.js

Application web d'authentification à **trois facteurs** (3FA) construite avec Express.js. Elle implémente un flux MFA progressif : mot de passe → code email (OTP) → code TOTP (Google Authenticator).

---

## Table des matières

1. [Prérequis](#-prérequis)
2. [Installation](#-installation)
3. [Configuration](#-configuration)
4. [Structure du projet](#-structure-du-projet)
5. [Flux d'authentification](#-flux-dauthentification)
6. [API — Endpoints](#-api--endpoints)
7. [Logs](#-logs)
8. [Tests manuels](#-tests-manuels)
9. [Passage en production](#-passage-en-production)

---

##  Prérequis

| Outil | Version minimale | Vérification |
|-------|-----------------|-------------|
| **Node.js** | 18.x ou supérieur | `node -v` |
| **npm** | 9.x ou supérieur | `npm -v` |
| **Google Authenticator** | toute version | Application mobile (iOS / Android) |
| Compte **Gmail** (si emails réels) | — | Nécessite un mot de passe d'application |

> **Note :** En mode développement, les codes email s'affichent directement dans la console — aucun compte Gmail n'est indispensable pour tester.

---

##  Installation

```bash
# 1. Cloner ou décompresser le projet
git clone <url-du-repo> mfa-project
cd mfa-project

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement (rechargement automatique)
npm run dev

# — ou en mode production —
npm start
```

Le serveur démarre sur **http://localhost:3000** par défaut.

### Dépendances installées

| Package | Rôle |
|---------|------|
| `express` | Serveur web HTTP |
| `express-session` | Gestion des sessions utilisateur |
| `bcryptjs` | Hachage des mots de passe |
| `nodemailer` | Envoi d'emails (OTP étape 2) |
| `speakeasy` | Génération / vérification TOTP |
| `qrcode` | Génération du QR code Google Authenticator |
| `nodemon` *(dev)* | Rechargement automatique du serveur |

---

##  Configuration

### 1. Secret de session

Dans `server.js`, remplacez la valeur par défaut par une chaîne longue et aléatoire :

```js
// server.js
app.use(session({
  secret: 'REMPLACEZ_PAR_UNE_CLE_ALEATOIRE_LONGUE',  // ← obligatoire en prod
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,          // ← activer en HTTPS (production)
    maxAge: 30 * 60 * 1000 // session de 30 minutes
  }
}));
```

Vous pouvez générer une clé aléatoire avec :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Compte email (Nodemailer / Gmail)

Dans `routes/auth.js`, configurez le transporteur avec votre compte Gmail et un **mot de passe d'application** (pas votre mot de passe habituel) :

```js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'votre.email@gmail.com',
    pass: 'xxxx xxxx xxxx xxxx'  // mot de passe d'application Gmail
  }
});
```

> Pour générer un mot de passe d'application Gmail : **Mon compte Google → Sécurité → Mots de passe des applications**.  
> La vérification en deux étapes doit être activée sur le compte.

### 3. Utilisateurs (base simulée)

En développement, les utilisateurs sont définis directement dans `routes/auth.js` :

```js
const USERS = [
  {
    id: 'user_001',
    email: 'lakrarajaa@email.com',
    passwordHash: bcrypt.hashSync('RAJAA@123', 10),
    totpSecret: speakeasy.generateSecret({ name: 'MFA App (lakrarajaa@email.com)' }),
    phone: '+33600000000',
    name: 'RAJAA'
  }
];
```

> **En production**, remplacez ce tableau par des appels à une base de données (voir section [Passage en production](#-passage-en-production)).

### 4. Variables d'environnement (recommandé)

Pour ne pas stocker de secrets dans le code, utilisez un fichier `.env` :

```bash
# .env
PORT=3000
SESSION_SECRET=votre_cle_secrete_longue
GMAIL_USER=votre@gmail.com
GMAIL_PASS=xxxx_xxxx_xxxx_xxxx
```

Puis dans le code :

```bash
npm install dotenv
```

```js
// En tête de server.js
require('dotenv').config();
const secret = process.env.SESSION_SECRET;
```

---

##  Structure du projet

```
mfa-project/
├── server.js                  ← Point d'entrée, configuration Express + session
├── package.json               ← Dépendances et scripts npm
│
├── routes/
│   ├── auth.js                ← Logique MFA : login, verify-email, verify-totp, logout
│   └── home.js                ← Pages protégées : accueil, blog, logs, actions
│
├── middleware/
│   ├── logger.js              ← Journalisation des actions dans logs/actions.log
│   └── requireAuth.js         ← Garde-route : vérifie que la session est complète
│
├── public/
│   ├── index.html             ← Page de connexion (formulaire 3 étapes)
│   ├── accueil.html           ← Page d'accueil (après authentification)
│   ├── blog.html              ← Page blog (protégée)
│   └── logs.html              ← Visualisation des logs (protégée)
│
└── logs/
    └── actions.log            ← Journal JSON des actions (créé automatiquement)
```

---

## Flux d'authentification

```
┌─────────────┐     POST /login          ┌─────────────────────────┐
│  Utilisateur │ ──── email + mdp ──────► │  Étape 1 : Mot de passe │
└─────────────┘                           │  bcrypt.compareSync()   │
                                          └────────────┬────────────┘
                                                       │ ✅ OK → envoie OTP par email
                                                       ▼
                                          ┌─────────────────────────┐
                   POST /verify-email     │  Étape 2 : Code Email   │
               ──── code OTP 6 chiffres ► │  OTP valable 5 minutes  │
                                          └────────────┬────────────┘
                                                       │ ✅ OK → génère QR code TOTP
                                                       ▼
                                          ┌─────────────────────────┐
                   POST /verify-totp      │  Étape 3 : Google Auth  │
               ──── code TOTP 6 chiffres ►│  speakeasy.totp.verify()│
                                          └────────────┬────────────┘
                                                       │ ✅ OK → session.verified = true
                                                       ▼
                                          ┌─────────────────────────┐
                   GET /accueil           │   Accès autorisé        │
               ◄─────────────────────────│   requireAuth() validé  │
                                          └─────────────────────────┘
```

**État de la session** à chaque étape :

| Étape | `session.step` | `session.verified` |
|-------|---------------|-------------------|
| Non connecté | `undefined` | `false` |
| Après mot de passe | `2` | `false` |
| Après code email | `3` | `false` |
| Après TOTP | `null` | **`true`** |

---

##  API — Endpoints

### Authentification

| Méthode | Route | Corps (JSON) | Description |
|---------|-------|-------------|-------------|
| `POST` | `/login` | `{ email, password }` | Étape 1 — vérifie le mot de passe, envoie l'OTP email |
| `POST` | `/verify-email` | `{ code }` | Étape 2 — vérifie l'OTP email, renvoie le QR code TOTP |
| `POST` | `/verify-totp` | `{ code }` | Étape 3 — vérifie le TOTP, ouvre la session |
| `POST` | `/logout` | — | Détruit la session (authentification requise) |

### Pages protégées (nécessitent `session.verified = true`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/accueil` | Page d'accueil principale |
| `GET` | `/blog` | Page blog |
| `GET` | `/logs` | Interface de visualisation des logs |
| `GET` | `/api/me` | Retourne `{ userId, userName }` de l'utilisateur connecté |
| `POST` | `/accueil/action` | Déclenche une action métier `{ actionType, payload }` |
| `GET` | `/api/logs` | Retourne les logs en JSON (ordre chronologique inverse) |

---

##  Logs

Chaque action est enregistrée dans `logs/actions.log` au format JSON (une entrée par ligne).

**Exemple d'entrée :**

```json
{
  "timestamp": "2026-03-25T09:55:46.714Z",
  "userId": "user_001",
  "action": "LOGIN_SUCCESS",
  "details": { "mfaCompleted": true },
  "ip": "::1"
}
```

**Actions enregistrées :**

| Action | Déclencheur |
|--------|-------------|
| `MFA_STEP1_OK` / `MFA_STEP1_FAIL` | Tentative de connexion (mot de passe) |
| `MFA_STEP2_OK` / `MFA_STEP2_FAIL` | Vérification du code email |
| `MFA_STEP3_FAIL` | Code TOTP incorrect |
| `LOGIN_SUCCESS` | Authentification 3FA complète |
| `LOGOUT` | Déconnexion |
| `PAGE_ACCUEIL` / `PAGE_BLOG` / `PAGE_LOGS` | Navigation |
| `ACTION_ACCUEIL` | Action métier déclenchée |
| `VIEW_LOGS` | Consultation des logs |

Les logs sont consultables via l'interface web à `/logs` ou via l'API `/api/logs`.

---

##  Tests manuels

### Compte de test par défaut

| Champ | Valeur |
|-------|--------|
| Email | `lakrarajaa@gmail.com` |
| Mot de passe | `RAJAA@123` |
| Code email | Reçu par email ou affiché dans la console |
| Code TOTP | Généré par Google Authenticator après scan du QR code |

### Scénario de test complet

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir http://localhost:3000 dans le navigateur

# 3. Saisir email + mot de passe → vérifier que le code email arrive
# 4. Entrer le code email → vérifier l'affichage du QR code
# 5. Scanner le QR code avec Google Authenticator
# 6. Saisir le code TOTP à 6 chiffres → vérifier la redirection vers /accueil
# 7. Cliquer sur Déconnexion → vérifier la redirection vers /
```

### Tester les cas d'erreur

```bash
# Mot de passe incorrect → doit retourner 401
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lakrarajaa@gmail.com","password":"mauvais"}'

# Accès direct à une route protégée sans session → doit retourner 401
curl http://localhost:3000/accueil

# Code email expiré (attendre 5 min) → doit retourner 401
curl -X POST http://localhost:3000/verify-email \
  -H "Content-Type: application/json" \
  -d '{"code":"000000"}'
```

### Vérifier les logs

```bash
# Voir les dernières entrées du log
tail -20 logs/actions.log | jq .

# Filtrer uniquement les connexions réussies
grep LOGIN_SUCCESS logs/actions.log | jq .

# Filtrer les échecs
grep FAIL logs/actions.log | jq .
```

---

## Passage en production

### 1. Remplacer la base de données en mémoire

Le tableau `USERS` et l'objet `tempCodes` dans `routes/auth.js` sont des solutions de développement uniquement. En production :

```bash
# MongoDB
npm install mongoose

# ou PostgreSQL
npm install pg
```

Les codes OTP temporaires doivent être stockés dans **Redis** avec un TTL de 5 minutes :

```bash
npm install ioredis
```

```js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Stocker un code
await redis.setex(`otp:${userId}:email`, 300, code); // expire en 300s

// Vérifier un code
const stored = await redis.get(`otp:${userId}:email`);
```

### 2. Activer les vrais SMS (Twilio)

```bash
npm install twilio
```

```js
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function sendSMS(phone, message) {
  await twilio.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
}
```

### 3. Sécurité en production

- **HTTPS obligatoire** — activer `cookie.secure: true` dans `server.js`
- **Helmet** pour les en-têtes de sécurité HTTP : `npm install helmet`
- **Rate limiting** pour éviter le brute-force : `npm install express-rate-limit`
- **Variables d'environnement** — ne jamais commiter de secrets dans le code
- **Persistance des sessions** — utiliser `connect-redis` à la place du store en mémoire par défaut

```bash
npm install helmet express-rate-limit connect-redis
```

---

*Projet développé en Node.js — Express.js · speakeasy · nodemailer · bcryptjs*