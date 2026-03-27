
// routes/auth.js — Authentification triple facteur + déconnexion
const express = require('express');
const bcrypt  = require('bcryptjs');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { log } = require('../middleware/logger');
const { requireAuth } = require('../middleware/requireAuth');

// ── Configuration Nodemailer (Gmail) ────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lakrarajaa@gmail.com',
    pass: 'pckfplnbeesolbpf'
  }
});

const router = express.Router();

// ── Base de données simulée (à remplacer par une vraie DB) ──
const USERS = [
  {
    id: 'user_001',
    email: 'lakrarajaa@gmail.com',
    passwordHash: bcrypt.hashSync('RAJAA@123', 10),
    totpSecret: speakeasy.generateSecret({ name: 'MFA App (lakrarajaa@gmail.com)' }),
    phone: '+33600000000',
    name: 'RAJAA'
  }
];

// Codes temporaires en mémoire (en prod → Redis avec TTL)
const tempCodes = {}; // { userId: { email: '123456', sms: '789012' } }

// ── Helpers ─────────────────────────────────────────────────

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeCode(userId, channel, code) {
  if (!tempCodes[userId]) tempCodes[userId] = {};
  tempCodes[userId][channel] = { code, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min
}

function verifyCode(userId, channel, inputCode) {
  const stored = tempCodes[userId]?.[channel];
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) return false; // expiré
  return stored.code === inputCode;
}

// Envoie un email via Nodemailer
async function sendEmail(email, message) {
  try {
    const code = message.split(': ')[1];
    await transporter.sendMail({
      from: 'lakrarajaa@gmail.com',
      to: email,
      subject: '🔐 Code de vérification MFA',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #333;">Votre code de vérification</h2>
          <p>Vous avez demandé un code pour sécuriser votre connexion.</p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Code :</p>
            <h1 style="font-size: 32px; color: #007bff; margin: 10px 0; letter-spacing: 5px;">${code}</h1>
            <p style="font-size: 12px; color: #999; margin: 10px 0;">Ce code expire dans 5 minutes</p>
          </div>
          <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        </div>
      `
    });
    console.log(`✅ [EMAIL] Email envoyé à ${email}`);
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] ${error.message}`);
  }
}

// Simule l'envoi d'un SMS (remplace par Twilio/Vonage en prod)
async function sendSMS(phone, message) {
  console.log(`\x1b[34m[SMS → ${phone}]\x1b[0m ${message}`);
  // En production :
  // await twilioClient.messages.create({ to: phone, from: '+33...', body: message });
}

// ── ÉTAPE 1 : Mot de passe ───────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = USERS.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    log('MFA_STEP1_FAIL', email, {}, req);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }

  // Génère et envoie le code email
  const codeEmail = generateCode();
  storeCode(user.id, 'email', codeEmail);
  await sendEmail(user.email, `Votre code de vérification : ${codeEmail}`);

  // Met à jour la session
  req.session.userId   = user.id;
  req.session.userName = user.name;
  req.session.step     = 2;
  req.session.verified = false;

  log('MFA_STEP1_OK', user.id, { nextStep: 2 }, req);
  res.json({ message: 'Mot de passe validé. Code envoyé par email.', nextStep: 2 });
});

// ── ÉTAPE 2 : Code Email ─────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  if (req.session?.step !== 2) {
    return res.status(403).json({ error: 'Étape invalide. Recommencez la connexion.' });
  }

  const { code } = req.body;
  const userId   = req.session.userId;
  const user     = USERS.find(u => u.id === userId);

  if (!verifyCode(userId, 'email', code)) {
    log('MFA_STEP2_FAIL', userId, {}, req);
    return res.status(401).json({ error: 'Code email incorrect ou expiré.' });
  }

  // Génère un QR code pour Google Authenticator
  try {
    const qrCodeUrl = await QRCode.toDataURL(user.totpSecret.otpauth_url);

    req.session.step = 3;
    req.session.totpSecret = user.totpSecret.base32; // Sauvegarde le secret temporairement

    log('MFA_STEP2_OK', userId, { nextStep: 3 }, req);
    res.json({ 
      message: 'Code email validé. Scannez le QR code avec Google Authenticator.',
      nextStep: 3,
      qrCode: qrCodeUrl,
      secret: user.totpSecret.base32 // En cas de scan manuel
    });
  } catch (error) {
    console.error('❌ [QR CODE ERROR]', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code.' });
  }
});

// ── ÉTAPE 3 : Code TOTP (Google Authenticator) → Connexion accordée ──
router.post('/verify-totp', async (req, res) => {
  if (req.session?.step !== 3) {
    return res.status(403).json({ error: 'Étape invalide. Recommencez la connexion.' });
  }

  const { code } = req.body;
  const userId   = req.session.userId;
  const user     = USERS.find(u => u.id === userId);

  // Vérifie le code TOTP avec une tolérance de ±1 pas de 30 secondes
  const isValid = speakeasy.totp.verify({
    secret: user.totpSecret.base32,
    encoding: 'base32',
    token: code,
    window: 2 // ±2 pas pour plus de flexibilité
  });

  if (!isValid) {
    log('MFA_STEP3_FAIL', userId, {}, req);
    return res.status(401).json({ error: 'Code TOTP incorrect ou expiré.' });
  }

  req.session.step     = null;
  req.session.verified = true; // ✅ Authentification complète

  log('LOGIN_SUCCESS', userId, { mfaCompleted: true }, req);
  res.json({ message: 'Connexion réussie !', redirect: '/accueil' });
});

// ── DÉCONNEXION ───────────────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  const userId = req.session.userId;

  log('LOGOUT', userId, {}, req);

  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnecté avec succès.' });
  });
});

module.exports = router;
