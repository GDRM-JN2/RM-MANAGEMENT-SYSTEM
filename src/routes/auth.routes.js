const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// Batasi percobaan login supaya tidak gampang di-brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,
  message: { error: 'Terlalu banyak percobaan login, coba lagi beberapa menit lagi' },
});

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;
