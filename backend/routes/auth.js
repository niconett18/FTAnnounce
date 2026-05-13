/**
 * routes/auth.js — Authentication Routes
 * POST /api/auth/login → Login admin, dapatkan JWT
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { client } = require('../cassandra');
const { loginLimiter } = require('../middleware/rateLimit');

function isCassandraDown(err) {
  return err?.name === 'NoHostAvailableError' || err?.message?.includes('Connection timeout') || err?.message?.includes('All host(s) tried');
}

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const result = await client.execute(
      'SELECT * FROM admins WHERE username = ?',
      [username.toLowerCase()],
      { prepare: true }
    );

    if (result.rowLength === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const admin = result.rows[0];

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    // JWT tetap lean: hanya username, displayName, accountType
    const token = jwt.sign(
      {
        username: admin.username,
        displayName: admin.display_name,
        accountType: admin.account_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Response menyertakan semua field profil untuk UI
    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        username: admin.username,
        displayName: admin.display_name,
        accountType: admin.account_type,
        roleTitle: admin.role_title || null,
        profilePicture: admin.profile_picture || null,
        role: 'admin',
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    if (isCassandraDown(err)) {
      return res.status(503).json({ error: 'Database sedang tidak tersedia. Coba lagi nanti.' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
