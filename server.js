// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const { log } = require('./middleware/logger');

const app = express();

// ── Middlewares globaux ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ──────────────────────────────────────────────────
app.use(session({
  secret: 'CHANGE_MOI_EN_PRODUCTION',   // ← Change ça en production !
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,          // Mets true quand tu seras en HTTPS
    maxAge: 30 * 60 * 1000  // 30 minutes
  }
}));

// ── Routes ───────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/', homeRoutes);

// ── Route de Déconnexion (AJOUTÉE ICI) ───────────────────────
app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion :', err);
        return res.redirect('/accueil'); // En cas d'erreur, on reste sur l'accueil
      }
      
      // Supprime proprement le cookie de session
      res.clearCookie('connect.sid');
      
      // Redirection vers la page de connexion (login)
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

// ── Démarrage du serveur ─────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});