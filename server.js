// ============================================================
// server.js — Point d'entrée principal
// ============================================================
const express = require('express');
const session = require('express-session');
const path    = require('path');

const authRoutes  = require('./routes/auth');
const homeRoutes  = require('./routes/home');
const { log }     = require('./middleware/logger');

const app = express();

// ── Middlewares globaux ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ──────────────────────────────────────────────────
app.use(session({
  secret: 'CHANGE_MOI_EN_PRODUCTION',   // ← à remplacer par une vraie clé
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,          // mettre true en HTTPS (production)
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

// ── Routes ───────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/', homeRoutes);

// ── Démarrage ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Serveur lancé sur http://localhost:${PORT}`);
});
