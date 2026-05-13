/**
 * routes/admin.js — Admin Profile Management
 */

const express = require('express');
const router = express.Router();
const { client } = require('../cassandra');
const authenticate = require('../middleware/auth');

function isCassandraDown(err) {
  return err?.name === 'NoHostAvailableError' || err?.message?.includes('Connection timeout') || err?.message?.includes('All host(s) tried');
}

// ==========================================
// PUT /api/admin/profile
// Edit display_name, role_title, profile_picture (personal only)
// ==========================================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { displayName, roleTitle, profilePicture } = req.body;

    // Organisasi tidak boleh ubah apapun
    if (req.user.accountType === 'organization') {
      return res.status(403).json({ 
        error: 'Forbidden: Akun organisasi tidak diizinkan mengubah profil.' 
      });
    }

    // Bangun query UPDATE secara dinamis
    const updates = [];
    const params = [];

    if (displayName && displayName.trim() !== '') {
      updates.push('display_name = ?');
      params.push(displayName.trim());
    }
    if (roleTitle !== undefined) {
      updates.push('role_title = ?');
      params.push(roleTitle.trim());
    }
    if (profilePicture !== undefined) {
      updates.push('profile_picture = ?');
      params.push(profilePicture.trim() || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang diubah.' });
    }

    params.push(req.user.username);

    await client.execute(
      `UPDATE admins SET ${updates.join(', ')} WHERE username = ?`,
      params,
      { prepare: true }
    );

    // Ambil data terbaru untuk response
    const result = await client.execute(
      'SELECT * FROM admins WHERE username = ?',
      [req.user.username],
      { prepare: true }
    );
    const admin = result.rows[0];

    res.json({
      message: 'Profil berhasil diperbarui.',
      user: {
        username: admin.username,
        displayName: admin.display_name,
        accountType: admin.account_type,
        roleTitle: admin.role_title || null,
        profilePicture: admin.profile_picture || null,
        role: 'admin',
      }
    });

  } catch (err) {
    console.error('PUT profile error:', err);
    if (isCassandraDown(err)) {
      return res.status(503).json({ error: 'Database sedang tidak tersedia. Coba lagi nanti.' });
    }
    res.status(500).json({ error: 'Gagal memperbarui profil.' });
  }
});

module.exports = router;
