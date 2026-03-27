# 🔐 Triple MFA Auth — Guide de démarrage

## Structure du projet

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
    └── actions.log            ← Journal des actions (auto-généré)
```

## 🚀 Installation & Lancement

```bash
# 1. Démarrer le serveur
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:3000
```

## 🧪 Compte de test

| Champ        | Valeur              |
|-------------|---------------------|
| Email        | alice@exemple.com   |
| Mot de passe | MotDePasse123       |
| Code email   | Affiché dans la console du serveur |
| Code SMS     | Affiché dans la console du serveur |

> En mode développement, les codes email/SMS s'affichent directement
> dans la console au lieu d'être vraiment envoyés.

## 🔄 Flux d'authentification

```
POST /login          → Étape 1 : Vérif mot de passe + envoi code email
POST /verify-email   → Étape 2 : Vérif code email + envoi code SMS
POST /verify-sms     → Étape 3 : Vérif code SMS → session ouverte
GET  /accueil        → Page d'accueil (protégée)
POST /logout         → Destruction de la session
```

## 📧 Activer les vrais emails (nodemailer)

Dans `routes/auth.js`, remplace la fonction `sendEmail` :

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

## 🗄️ Passer à une vraie base de données

Remplace le tableau `USERS` dans `routes/auth.js` par des appels
à ta base de données (MongoDB, PostgreSQL, MySQL...).

Pour les codes temporaires, utilise **Redis** avec un TTL de 5 minutes
à la place de l'objet `tempCodes` en mémoire.
