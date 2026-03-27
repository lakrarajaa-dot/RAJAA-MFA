# 🔐 Triple MFA Auth — Guide de démarrage

## Structure du projet

```
mfa-project/
├── server.js                  ← Point d'entrée
├── package.json
├── routes/
│   ├── auth.js                ← MFA (login, verify-email, verify-sms, logout)
│   └── home.js                ← Page d'accueil + actions + logs
├── middleware/
│   ├── logger.js              ← Système de logs
│   └── requireAuth.js         ← Protection des routes
├── public/
│   ├── index.html             ← Page de connexion (3 étapes)
│   └── accueil.html           ← Page d'accueil
└── logs/
    └── actions.log            ← Journal des actions (auto-généré)
```

## 🚀 Installation & Lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur
npm start
# ou en mode dev (rechargement auto) :
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
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'ton@email.com', pass: 'TON_MOT_DE_PASSE_APP' }
});

async function sendEmail(email, message) {
  await transporter.sendMail({
    from: 'ton@email.com',
    to: email,
    subject: 'Code de vérification',
    text: message
  });
}
```

## 📱 Activer les vrais SMS (Twilio)

```bash
npm install twilio
```

```js
const twilio = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

async function sendSMS(phone, message) {
  await twilio.messages.create({
    body: message,
    from: '+1XXXXXXXXXX', // ton numéro Twilio
    to: phone
  });
}
```

## 🗄️ Passer à une vraie base de données

Remplace le tableau `USERS` dans `routes/auth.js` par des appels
à ta base de données (MongoDB, PostgreSQL, MySQL...).

Pour les codes temporaires, utilise **Redis** avec un TTL de 5 minutes
à la place de l'objet `tempCodes` en mémoire.
