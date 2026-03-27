
// middleware/requireAuth.js — Protection des routes


/**
 * Middleware : bloque l'accès si l'utilisateur n'est pas
 * complètement authentifié (les 3 étapes MFA validées).
 */
function requireAuth(req, res, next) {
  if (!req.session?.verified) {
    return res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
  }
  next();
}

module.exports = { requireAuth };
