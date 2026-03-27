
// middleware/logger.js — Système de logs

const fs   = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/actions.log');

/**
 * Enregistre une action dans le fichier de log.
 * @param {string} action   - Nom de l'action (ex: "LOGIN_SUCCESS")
 * @param {string} userId   - ID de l'utilisateur
 * @param {object} details  - Infos supplémentaires optionnelles
 * @param {object} req      - Objet Request Express (optionnel, pour l'IP)
 */
function log(action, userId = 'anonymous', details = {}, req = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
    ip: req?.ip ?? 'N/A'
  };

  // Écriture dans le fichier (une entrée JSON par ligne)
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');

  // Affichage console coloré
  console.log(
    `\x1b[36m[LOG]\x1b[0m ${entry.timestamp} | \x1b[33m${action}\x1b[0m | user:${userId}`
  );
}

module.exports = { log };
