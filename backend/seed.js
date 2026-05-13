/**
 * seed.js — Seed data untuk development
 */

const bcrypt = require('bcryptjs');
const { client, initializeDatabase, types } = require('./cassandra');

const sampleAnnouncements = [
  {
    channel_id: 'dts',
    author_name: 'Dr. Ir. Budi Santoso, M.T.',
    author_role: 'Dosen DTS',
    author_account_type: 'personal',
    title: 'Perubahan Jadwal UAS Semester Genap 2025/2026',
    content: 'Diberitahukan kepada seluruh mahasiswa Departemen Teknik Sipil & Lingkungan bahwa terdapat perubahan jadwal Ujian Akhir Semester (UAS) untuk mata kuliah Mekanika Tanah dan Rekayasa Pondasi. Jadwal baru akan dimulai pada tanggal 26 Mei 2026. Silakan cek portal akademik untuk detail lengkap perubahan ruangan dan waktu.',
    priority: 'darurat',
    attachments: ['Jadwal_UAS_Revisi.pdf'],
    pinDays: 7, // pin 1 minggu
  },
  {
    channel_id: 'dts',
    author_name: 'Dr. Ir. Budi Santoso, M.T.',
    author_role: 'Dosen DTS',
    author_account_type: 'personal',
    title: 'Pengumpulan Tugas Besar Struktur Beton Bertulang',
    content: 'Deadline pengumpulan Tugas Besar mata kuliah Struktur Beton Bertulang diperpanjang hingga 18 Mei 2026 pukul 23:59 WIB. Format pengumpulan melalui eCourse SCELE. Keterlambatan pengumpulan akan dikenakan pengurangan nilai 10% per hari.',
    priority: 'penting',
    attachments: [],
  },
  {
    channel_id: 'dtm',
    author_name: 'Ir. Ahmad Fauzi, M.Eng.',
    author_role: 'Dosen DTM',
    author_account_type: 'personal',
    title: 'Jadwal Responsi Termodinamika II',
    content: 'Responsi mata kuliah Termodinamika II akan diadakan setiap Jumat pukul 13:00-15:00 di ruang K-301. Dimulai dari minggu ke-5. Harap membawa kalkulator ilmiah.',
    priority: 'info',
    attachments: [],
  },
  {
    channel_id: 'dte',
    author_name: 'Prof. Dr. Ir. Hendra Kusuma',
    author_role: 'Dosen DTE',
    author_account_type: 'personal',
    title: 'Perubahan Jadwal Kuliah Sistem Digital',
    content: 'Perkuliahan Sistem Digital kelas A dan B dipindahkan ke Gedung Baru Lt.4 R.401 mulai minggu depan. Perubahan ini berlaku hingga akhir semester.',
    priority: 'darurat',
    attachments: ['Jadwal_Revisi_TE.pdf'],
  },
  {
    channel_id: 'beasiswa',
    author_name: 'BEM FT',
    author_role: null,
    author_account_type: 'organization',
    title: 'Beasiswa Bank Indonesia 2026 — Pendaftaran Dibuka',
    content: 'Bank Indonesia membuka program beasiswa untuk mahasiswa S1 aktif dengan IPK minimal 3.00. Benefit meliputi biaya pendidikan, tunjangan buku, dan program mentoring. Pendaftaran online melalui website resmi BI hingga 31 Mei 2026.',
    priority: 'darurat',
    attachments: ['Info_Beasiswa_BI_2026.pdf'],
    pinDays: 30, // pin 1 bulan
  },
  {
    channel_id: 'magang-karir',
    author_name: 'BEM FT',
    author_role: null,
    author_account_type: 'organization',
    title: 'Job Fair Fakultas Teknik 2026',
    content: 'Job Fair tahunan Fakultas Teknik UI akan diadakan pada 28-29 Mei 2026 di Balairung UI. Lebih dari 50 perusahaan top nasional dan multinasional akan hadir. Persiapkan CV terbaikmu!',
    priority: 'penting',
    attachments: ['Poster_JobFair2026.jpg', 'Daftar_Perusahaan.pdf'],
  },
  {
    channel_id: 'dtmm',
    author_name: 'Dr. Rina Kartika, M.Met.',
    author_role: 'Dosen DTMM',
    author_account_type: 'personal',
    title: 'Kunjungan Industri ke PT Krakatau Steel',
    content: 'Departemen Metalurgi & Material menyelenggarakan kunjungan industri ke PT Krakatau Steel, Cilegon, pada 24 Mei 2026. Pendaftaran dibuka untuk mahasiswa semester 4 ke atas. Biaya transportasi ditanggung departemen. Kuota 35 peserta.',
    priority: 'info',
    attachments: [],
  },
  {
    channel_id: 'da',
    author_name: 'Dr. Maya Indira, IAI',
    author_role: 'Dosen DA',
    author_account_type: 'personal',
    title: 'Review Studio Desain 5 — Jadwal Presentasi',
    content: 'Presentasi akhir Studio Desain 5 akan dilaksanakan pada 20-21 Mei 2026 di Studio Arsitektur Lt.3. Setiap kelompok wajib menyiapkan maket fisik 1:200 dan poster A1.',
    priority: 'penting',
    attachments: ['Panduan_Presentasi_SD5.pdf'],
  },
];

async function seed() {
  try {
    console.log('🌱 Memulai seeding...\n');
    await initializeDatabase();

    // 1. Buat admin default
    console.log('\n👤 Membuat admin default...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    
    // Admin Personal (Dosen/Staff)
    await client.execute(
      `INSERT INTO admins (username, password_hash, display_name, account_type, role_title, profile_picture)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin', hash, 'Admin FT', 'personal', 'Administrasi FT UI', null],
      { prepare: true }
    );
    console.log('   ✅ Admin Personal: username="admin", password="admin123", role="Administrasi FT UI"');

    // Admin Organization (BEM)
    await client.execute(
      `INSERT INTO admins (username, password_hash, display_name, account_type, role_title, profile_picture)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['bem', hash, 'BEM FT', 'organization', null, null],
      { prepare: true }
    );
    console.log('   ✅ Admin Organization: username="bem", password="admin123"');

    // ============================================================
    // 📝 TEMPLATE TAMBAH AKUN BARU
    // ============================================================
    // Salin blok di bawah, ganti nilai-nilainya, lalu jalankan:
    //   node seed.js
    //
    // ATURAN:
    // - username  : huruf kecil, tanpa spasi (ini untuk login)
    // - password  : akan di-hash otomatis oleh bcrypt
    // - account_type: 'personal' (dosen/staff) atau 'organization' (BEM/himpunan)
    // - role_title: hanya untuk 'personal' (misal "Dosen DTE"), null untuk 'organization'
    // - profile_picture: URL gambar atau null
    // ============================================================

    // --- Contoh 1: Akun Dosen ---
    // const hashDosen = await bcrypt.hash('passwordDosen123', salt);
    // await client.execute(
    //   `INSERT INTO admins (username, password_hash, display_name, account_type, role_title, profile_picture)
    //    VALUES (?, ?, ?, ?, ?, ?)`,
    //   ['budi.santoso', hashDosen, 'Dr. Ir. Budi Santoso, M.T.', 'personal', 'Dosen DTS', null],
    //   { prepare: true }
    // );
    // console.log('   ✅ Dosen: username="budi.santoso"');

    // --- Contoh 2: Akun Staff ---
    // const hashStaff = await bcrypt.hash('passwordStaff456', salt);
    // await client.execute(
    //   `INSERT INTO admins (username, password_hash, display_name, account_type, role_title, profile_picture)
    //    VALUES (?, ?, ?, ?, ?, ?)`,
    //   ['sari.admin', hashStaff, 'Sari Dewi, S.Kom.', 'personal', 'Staff Administrasi FT', null],
    //   { prepare: true }
    // );
    // console.log('   ✅ Staff: username="sari.admin"');

    // --- Contoh 3: Akun Organisasi (Himpunan) ---
    // const hashHmtl = await bcrypt.hash('passwordHimpunan789', salt);
    // await client.execute(
    //   `INSERT INTO admins (username, password_hash, display_name, account_type, role_title, profile_picture)
    //    VALUES (?, ?, ?, ?, ?, ?)`,
    //   ['hmtl', hashHmtl, 'HMTL FT UI', 'organization', null, null],
    //   { prepare: true }
    // );
    // console.log('   ✅ Organisasi: username="hmtl"');

    // ============================================================
    // END TEMPLATE — Uncomment blok di atas & sesuaikan nilainya
    // ============================================================

    // 2. Insert sample announcements
    console.log('\n📢 Memasukkan pengumuman contoh...');
    
    for (let i = 0; i < sampleAnnouncements.length; i++) {
      const a = sampleAnnouncements[i];
      const id = types.Uuid.random();
      const createdAt = new Date(Date.now() - (sampleAnnouncements.length - i) * 3600000);
      const bucket = `${createdAt.getUTCFullYear()}-${String(createdAt.getUTCMonth() + 1).padStart(2, '0')}`;

      // Hitung pin_until jika ada
      const pinUntil = a.pinDays ? new Date(Date.now() + a.pinDays * 24 * 60 * 60 * 1000) : null;

      await client.execute(
        `INSERT INTO announcements_by_channel 
         (channel_id, month_year_bucket, created_at, id, author_name, author_role, author_account_type, title, content, priority, attachment_url, pin_until)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.channel_id, bucket, createdAt, id, a.author_name, a.author_role, a.author_account_type, a.title, a.content, a.priority, a.attachments, pinUntil],
        { prepare: true }
      );

      const pinLabel = pinUntil ? ` 📌 (pin ${a.pinDays}d)` : '';
      console.log(`   ✅ [${a.channel_id}] ${a.title}${pinLabel}`);
    }

    console.log('\n🎉 Seeding selesai!');
    console.log('\n📋 Ringkasan:');
    console.log('   - 2 admin accounts (admin & bem)');
    console.log(`   - ${sampleAnnouncements.length} pengumuman contoh`);
    console.log(`   - ${sampleAnnouncements.filter(a => a.pinDays).length} pengumuman disematkan`);
    console.log('\n🚀 Sekarang jalankan: npm run dev\n');

  } catch (err) {
    console.error('❌ Seeding gagal:', err);
  } finally {
    await client.shutdown();
    process.exit(0);
  }
}

seed();
