/**
 * rateLimit.js — Rate Limiting Middleware
 * 
 * Ini adalah bagian dari jawaban "Stress Test 100 Admin".
 * Membatasi jumlah request per admin untuk mencegah spam/overload.
 */

const { rateLimit } = require('express-rate-limit');

// Rate limiter untuk operasi WRITE (POST, PUT, DELETE)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 30, // Maks 30 write request per menit per admin
  keyGenerator: (req) => req.user?.username || 'anonymous',
  message: {
    error: 'Terlalu banyak request. Coba lagi dalam 1 menit.',
    retryAfter: '60 detik'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disable validation to avoid IPv6 warning
});

// Rate limiter untuk operasi READ (lebih longgar)
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // Maks 100 read per menit
  message: {
    error: 'Terlalu banyak request. Coba lagi dalam 1 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk login (ketat, anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maks 5 percobaan login per 15 menit (OWASP standard)
  message: {
    error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { writeLimiter, readLimiter, loginLimiter };
