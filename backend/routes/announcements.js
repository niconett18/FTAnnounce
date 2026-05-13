/**
 * routes/announcements.js — Announcement Routes (Append-Only)
 */

const express = require('express');
const router = express.Router();
const { client, types } = require('../cassandra');
const authenticate = require('../middleware/auth');
const { writeLimiter, readLimiter } = require('../middleware/rateLimit');

// Channel whitelist — harus sinkron dengan frontend/data/channels.js
const VALID_CHANNELS = [
  'dtm', 'dts', 'dte', 'dti', 'dtmm', 'dtk', 'da', 'pi',
  'beasiswa', 'magang-karir', 'seminar', 'lomba',
  'jadwal-kuliah', 'tugas-akhir', 'krs-perwalian',
  'eim', 'chemical-archive', 'ism', 'gardisun', 'tb-mechanical', 'intervoice', 'archetype', 'civilrights',
];

function isCassandraDown(err) {
  return err?.name === 'NoHostAvailableError' || err?.message?.includes('Connection timeout') || err?.message?.includes('All host(s) tried');
}

function getMonthYearBucket(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getPreviousMonthBucket(currentBucket) {
  const [yearStr, monthStr] = currentBucket.split('-');
  let year = parseInt(yearStr);
  let month = parseInt(monthStr);
  month -= 1;
  if (month === 0) { month = 12; year -= 1; }
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Helper: hitung jumlah pin aktif di channel
async function countActivePins(channelId) {
  const now = new Date();
  const currentBucket = getMonthYearBucket(now);
  const prevBucket = getPreviousMonthBucket(currentBucket);

  let count = 0;
  for (const bucket of [currentBucket, prevBucket]) {
    const result = await client.execute(
      `SELECT pin_until FROM announcements_by_channel WHERE channel_id = ? AND month_year_bucket = ?`,
      [channelId, bucket],
      { prepare: true }
    );
    for (const row of result.rows) {
      if (row.pin_until && new Date(row.pin_until) > now) {
        count++;
      }
    }
  }
  return count;
}

// ==========================================
// GET /api/announcements/:channel
// ==========================================
router.get('/:channel', readLimiter, async (req, res) => {
  try {
    const { channel } = req.params;
    const { last_timestamp } = req.query;
    const limit = 20;

    let currentBucket;
    let maxTimestamp;

    if (last_timestamp) {
      const date = new Date(last_timestamp);
      currentBucket = getMonthYearBucket(date);
      maxTimestamp = date;
    } else {
      currentBucket = getMonthYearBucket(new Date());
      maxTimestamp = new Date();
    }

    let allAnnouncements = [];
    let bucketsChecked = 0;
    const maxBucketsToCheck = 5;

    while (allAnnouncements.length < limit && bucketsChecked < maxBucketsToCheck) {
      let query = `
        SELECT * FROM announcements_by_channel 
        WHERE channel_id = ? AND month_year_bucket = ?
      `;
      let params = [channel, currentBucket];

      if (maxTimestamp) {
        query += ` AND created_at < ?`;
        params.push(maxTimestamp);
      }

      query += ` LIMIT ?`;
      params.push(limit - allAnnouncements.length);

      const result = await client.execute(query, params, { prepare: true });
      
      const mapped = result.rows.map(row => ({
        id: row.id.toString(),
        channelId: row.channel_id,
        authorName: row.author_name,
        authorRole: row.author_role || null,
        authorAccountType: row.author_account_type || null,
        title: row.title,
        content: row.content,
        priority: row.priority,
        attachments: row.attachment_url || [],
        createdAt: row.created_at,
        pinUntil: row.pin_until || null,
      }));

      allAnnouncements = allAnnouncements.concat(mapped);

      if (allAnnouncements.length < limit) {
        currentBucket = getPreviousMonthBucket(currentBucket);
        maxTimestamp = null;
        bucketsChecked++;
      } else {
        break;
      }
    }

    let nextTimestamp = null;
    if (allAnnouncements.length > 0) {
      nextTimestamp = allAnnouncements[allAnnouncements.length - 1].createdAt;
    }

    res.json({
      channel,
      count: allAnnouncements.length,
      announcements: allAnnouncements,
      nextTimestamp,
    });

  } catch (err) {
    console.error('GET announcements error:', err);
    if (isCassandraDown(err)) {
      return res.status(503).json({ error: 'Database sedang tidak tersedia. Coba lagi nanti.' });
    }
    res.status(500).json({ error: 'Gagal mengambil pengumuman.' });
  }
});

// ==========================================
// POST /api/announcements
// ==========================================
router.post('/', authenticate, writeLimiter, async (req, res) => {
  try {
    const { channelId, title, content, priority, attachments, pinDuration } = req.body;

    if (!channelId || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'channelId, title, dan content wajib diisi (tidak boleh kosong/spasi saja).' });
    }

    if (!VALID_CHANNELS.includes(channelId)) {
      return res.status(400).json({ error: 'Channel tidak valid.' });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'Judul maksimal 200 karakter.' });
    }
    if (content.trim().length > 10000) {
      return res.status(400).json({ error: 'Konten maksimal 10.000 karakter.' });
    }

    const validPriorities = ['info', 'penting', 'darurat'];
    const announcementPriority = validPriorities.includes(priority) ? priority : 'info';

    let finalAttachments = [];
    if (Array.isArray(attachments)) {
      finalAttachments = attachments.slice(0, 3);
    } else if (attachments) {
      finalAttachments = [attachments];
    }

    // Ambil data terbaru dari DB (bukan JWT) agar snapshot selalu fresh
    const adminResult = await client.execute(
      'SELECT display_name, role_title, account_type FROM admins WHERE username = ?',
      [req.user.username],
      { prepare: true }
    );

    const adminData = adminResult.rows[0];
    const authorName = adminData.display_name;
    const authorRole = adminData.role_title || null;
    const authorAccountType = adminData.account_type;

    // Hitung pin_until jika diminta
    let pinUntil = null;
    const validPinDurations = { '1day': 1, '1week': 7, '1month': 30 };
    if (pinDuration && validPinDurations[pinDuration]) {
      const activePins = await countActivePins(channelId);
      if (activePins >= 2) {
        return res.status(400).json({
          error: 'Maksimum 2 pengumuman yang disematkan per channel. Tunggu sematan lain kedaluwarsa.'
        });
      }
      const days = validPinDurations[pinDuration];
      pinUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    const id = types.Uuid.random();
    const now = new Date();
    const bucket = getMonthYearBucket(now);

    await client.execute(
      `INSERT INTO announcements_by_channel 
       (channel_id, month_year_bucket, created_at, id, author_name, author_role, author_account_type, title, content, priority, attachment_url, pin_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [channelId, bucket, now, id, authorName, authorRole, authorAccountType, title, content, announcementPriority, finalAttachments, pinUntil],
      { prepare: true }
    );

    res.status(201).json({
      message: 'Pengumuman berhasil dipublikasikan!',
      announcement: {
        id: id.toString(),
        channelId,
        authorName,
        authorRole,
        authorAccountType,
        title,
        content,
        priority: announcementPriority,
        attachments: finalAttachments,
        createdAt: now,
        pinUntil,
      },
    });

  } catch (err) {
    console.error('POST announcement error:', err);
    if (isCassandraDown(err)) {
      return res.status(503).json({ error: 'Database sedang tidak tersedia. Coba lagi nanti.' });
    }
    res.status(500).json({ error: 'Gagal membuat pengumuman.' });
  }
});

module.exports = router;
