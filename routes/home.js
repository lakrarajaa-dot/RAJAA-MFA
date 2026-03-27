// ============================================================
// routes/home.js — Page d'accueil et actions
// ============================================================
const express = require('express');
const path    = require('path');
const { log } = require('../middleware/logger');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

// ── Page d'accueil ────────────────────────────────────────────
router.get('/accueil', requireAuth, (req, res) => {
  log('PAGE_ACCUEIL', req.session.userId, {}, req);
  res.sendFile(path.join(__dirname, '../public/accueil.html'));
});

// ── Page Blog ─────────────────────────────────────────────────
router.get('/blog', requireAuth, (req, res) => {
  log('PAGE_BLOG', req.session.userId, {}, req);
  res.sendFile(path.join(__dirname, '../public/blog.html'));
});
// ── Page Logs ─────────────────────────────────────────────
router.get('/logs', requireAuth, (req, res) => {
  log('PAGE_LOGS', req.session.userId, {}, req);
  res.sendFile(path.join(__dirname, '../public/logs.html'));
});
// ── Récupérer infos de l'utilisateur connecté ─────────────────
router.get('/api/me', requireAuth, (req, res) => {
  res.json({
    userId:   req.session.userId,
    userName: req.session.userName
  });
});

// ── Exemple d'action sur l'accueil ───────────────────────────
router.post('/accueil/action', requireAuth, (req, res) => {
  const { actionType, payload } = req.body;

  log('ACTION_ACCUEIL', req.session.userId, { actionType, payload }, req);

  // Ici tu mets ta vraie logique métier
  res.json({
    message: `Action "${actionType}" effectuée avec succès !`,
    result:  { actionType, payload, executedAt: new Date().toISOString() }
  });
});

// ── Consultation des logs (admin) ─────────────────────────────
const fs = require('fs');
router.get('/api/logs', requireAuth, (req, res) => {
  const logPath = require('path').join(__dirname, '../logs/actions.log');
  const raw     = fs.readFileSync(logPath, 'utf-8');
  const entries = raw.trim().split('\n').filter(Boolean).map(JSON.parse).reverse();

  log('VIEW_LOGS', req.session.userId, { count: entries.length }, req);
  res.json(entries);
});

module.exports = router;
