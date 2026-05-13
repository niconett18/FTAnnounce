/**
 * server.js — FTAnnounce Backend Entry Point
 * 
 * Arsitektur:
 *   React (Frontend) → Express (Backend) → Cassandra (Database)
 * 
 * Ini adalah API Gateway yang menghubungkan frontend React
 * dengan database Apache Cassandra (Wide-Column Store).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase } = require('./cassandra');
const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcements');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// === Middleware Global ===
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '256kb' })); // Parse JSON body, capped to prevent payload bomb

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);

// === Health Check ===
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'FTAnnounce Backend',
    timestamp: new Date().toISOString(),
    database: 'Cassandra (Wide-Column Store)',
  });
});

// === Root ===
app.get('/', (req, res) => {
  res.json({
    message: '🎓 FTAnnounce API — Fakultas Teknik Announcement Feed',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      getAnnouncements: 'GET /api/announcements/:channel',
      createAnnouncement: 'POST /api/announcements (auth required)',
      editProfile: 'PUT /api/admin/profile (auth required, personal only)',
    },
  });
});

// === Start Server ===
async function startServer() {
  try {
    // Step 1: Inisialisasi Cassandra (buat keyspace + tabel)
    await initializeDatabase();

    // Step 2: Jalankan Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('  🎓 FTAnnounce Backend is LIVE!');
      console.log(`  📡 Server:    http://localhost:${PORT}`);
      console.log(`  🗄️  Database:  Cassandra (Wide-Column Store)`);
      console.log(`  🔐 Auth:      JWT + Passcode`);
      console.log(`  🛡️  Security:  Rate Limiting + Helmet`);
      console.log('═══════════════════════════════════════════');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Gagal memulai server:', err.message);
    console.error('');
    console.error('💡 Pastikan:');
    console.error('   1. Docker Desktop sedang berjalan');
    console.error('   2. Cassandra container aktif: docker-compose up -d');
    console.error('   3. Tunggu ~30 detik setelah container start');
    console.error('');
    process.exit(1);
  }
}

startServer();
