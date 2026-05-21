# 🛡️ Live Demo Q&A: Kompilasi Pertanyaan "Jebakan" & Jawaban Teknis

Dokumen ini adalah "Buku Pintar" kamu untuk menghadapi dosen penguji. Berisi **15 pertanyaan komprehensif** (Konsep Dasar, Autentikasi, Edge Cases, hingga Performa Lanjut) beserta *Snippets* Kode dari sistem yang telah dibuat. Hapal dan pahami konsep-konsep ini!

---

## BAB 1: Fondasi Arsitektur (The Big Picture)

### 1. "Kalian pakai Docker untuk Cassandra. Sebenarnya apa itu Docker, cara kerjanya bagaimana, dan kenapa tidak install *database*-nya langsung saja di laptop?"
> **Jawaban Teknis:** "Docker adalah *platform containerization*. Ia membungkus aplikasi (dalam hal ini Apache Cassandra) beserta seluruh sistem operasi mini dan *library* pendukungnya ke dalam sebuah kotak terisolasi yang disebut *Container*. 
> Kenapa kami menggunakannya? Karena ini menjamin **Konsistensi Lingkungan (*Environment Consistency*)**. Jika kami meng-install Cassandra langsung, sering terjadi konflik versi Java atau *environment variables*. Dengan Docker, kami cukup menjalankan `docker-compose up`, dan Cassandra menyala dengan konfigurasi dan versi yang persis 100% sama di laptop siapapun (laptop saya, dosen, maupun server *production*)."

**📌 Bukti Kode (*Setup Client Cassandra*):**
```javascript
// backend/cassandra.js
const client = new cassandra.Client({
  contactPoints: (process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1').split(','),
  localDataCenter: process.env.CASSANDRA_LOCAL_DC || 'datacenter1',
});
```
**Penjelasan Syntax:** `Client` membuat koneksi ke container Docker. `contactPoints` adalah array alamat IP Container. `localDataCenter` menandakan region/node operasional dari layanan container tersebut.

### 2. "Coba jelaskan, bagaimana alur komunikasi data dari *Frontend* (layar pengguna) sampai akhirnya masuk ke *Database* Cassandra?"
> **Jawaban Teknis:** "Sistem kami beroperasi dengan pola **RESTful API**.
> 1. Saat admin mengklik 'Siarkan', React mengemas teks menjadi format JSON dan mengirim HTTP POST *request* ke Backend.
> 2. **Backend (Node.js/Express)** menerima data tadi dan melewatinya ke middleware validasi (cek JWT Token & *Rate Limit*).
> 3. Jika aman, Backend menulis JSON tersebut menjadi *query* CQL dan mengirimkannya melalui driver port 9042 TCP.
> 4. **Database (Cassandra)** mengeksekusi tulis ("write") ke *Commit Log* dan *Memtable*, lalu mengembalikan sinyal sukses ke Backend dan Frontend."

**📌 Bukti Kode (*Query Parametrization*):**
```javascript
// backend/routes/announcements.js - POST API
const result = await client.execute(query, params, { prepare: true });
```
**Penjelasan Syntax:** `client.execute` mengirim instruksi *Query*. Parameter `{ prepare: true }` sangat krusial; instruksi ini meminta Cassandra untuk men-*compile* struktur kueri untuk pencegahan peretasan (sejenis SQL Injection) sebelum nilai dari `params` disuntikkan.

---

## BAB 2: Autentikasi & Manajemen Akun (*JWT & Security*)

### 3. "Bagaimana cara kerja fitur *Login* di sistem kalian? Apa buktinya kalau *password* dan sesi admin itu aman dari peretasan?"
> **Jawaban Teknis:** "Pengamanan dilakukan dalam dua tahap:
> **Fase Penyimpanan:** Kami menggunakan **Bcrypt** dengan teknik *Salting*. Meskipun terjadi kebocoran basis data (*data breach*), sandi asli ('admin123') hanya akan terbaca sebagai *string* acak karena algoritma hash satu arah.
> **Fase Sesi (Login):** Kami memakai **JWT (JSON Web Token)**. Ketika kredensial sah, Backend mencetak 'KTP digital' (token) yang dienkripsi rahasia oleh server. Klien wajib mengandalkan identitas token tersebut di Header saat membuat *request*."

**📌 Bukti Kode (*Auth Flow*):**
```javascript
// backend/routes/auth.js
const isValid = await bcrypt.compare(password, admin.password_hash);

const token = jwt.sign(
  { username: admin.username, accountType: admin.account_type },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```
**Penjelasan Syntax:** `bcrypt.compare()` bertugas mencocokkan input sandi mentah dengan versi Hash-nya. `jwt.sign()` meracik token berupa *payload* (isi data mini) dan menguncinya dengan variabel env `JWT_SECRET` yang usianya diatur kadaluwarsa dalam 24 jam.

### 4. "Apa bedanya Akun Admin Personal (Dosen) dengan Akun Organisasi (BEM/Himpunan)? Kenapa harus dibedakan secara sistem?"
> **Jawaban Teknis:** "Kami membedakannya untuk menjamin **Validitas Identitas (Anti-Spoofing)**.
> - **Akun Personal:** Ditujukan untuk pengajar. Mereka bebas memperbarui Nama Tampilan, gelar/jabatan, dan Foto Profil kapan saja.
> - **Akun Organisasi:** Ditujukan untuk himpunan (dibuat murni oleh Root). Kami **mengunci permanen** akses *edit profile* pada tahap API (`403 Forbidden`). Ini untuk mencegah pengurus BEM sembarangan mengganti nama profil himpunannya menjadi fakultas lain yang memicu hoaks fatal di tingkat mahasiswa."

**📌 Bukti Kode (*Edit Permission Block*):**
```javascript
// backend/routes/admin.js (PUT /profile)
if (req.user.accountType === 'organization') {
  return res.status(403).json({ 
    error: 'Forbidden: Akun organisasi tidak diizinkan mengubah profil.' 
  });
}
```
**Penjelasan Syntax:** Sebelum query `UPDATE` diproses, ada validasi *early-return*. Nilai `req.user` disedot dari JWT di *middleware*. Begitu terdeteksi tipe akun `organization`, sistem membatalkan *request* disertai peringatan `403`.

### 5. "Bagaimana jika Akun BEM FT dipakai oleh 5 pengurus dari 5 laptop berbeda bersamaan di detik yang sama?"
> **Jawaban Teknis:** "Sistem ini bebas dari bentrokan karena menganut sistem **Stateless Authentification** JWT. Arsitektur jadul umumnya menyimpan *session ID* di RAM server sehingga bisa menendang (kick-out) pengguna sebelumnya jika login ganda. Karena JWT murni token telegrafis dan diverifikasi independen, ke-5 admin BEM bisa login dan mem-posting secara simultan secara sah."

**📌 Bukti Kode (*Verify Middleware*):**
```javascript
// backend/middleware/auth.js
const token = authHeader.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // Ditempelkan ke request tujuan
```
**Penjelasan Syntax:** Header diurai spasi `.split(' ')[1]` untuk menarik string token setelah "Bearer ". `jwt.verify` membongkarnya. Proses validasi memvalidasi algoritma matematis kriptografi sehingga RAM Backend tidak pusing menjadwalkan/melacak memori sesi (stateless).

---

## BAB 3: Manipulasi Data & Arsitektur NoSQL Cassandra

### 6. "Sistem kalian aneh. Kenapa pengumuman cuma bisa ditambah (Append-Only), tapi tidak ada fitur Edit atau Delete? Apa untungnya?"
> **Jawaban Teknis:** "Ini adalah keputusan arsitektur strategis dengan dua alasan kuat:
> 1. **Keamanan & Konsistensi (Tamper-proof):** Pengumuman bernilai esensial. Jika perihal ujian salah diketik, siarkanlah ralat/postingan baru, dilarang manipulasi sejarah.
> 2. **Kesesuaian Filosofis Cassandra:** Wide-Column dioptimalkan untuk I/O *inserting*. Kalau kami mengaktifkan fitur hapus, Cassandra memproduksi "Tombstone" (kuburan penanda) yang memakan kapasitas pemindaian selama proses pencarian (Read). Makanya filosofi *Append-Only* paling memuaskan untuk arsitektur tersebut."

**📌 Bukti Kode (*Absennya DELETE Route*):**
```javascript
// backend/routes/announcements.js
router.get('/:channel', readLimiter, async (req, res) => { ... });
router.post('/', authenticate, writeLimiter, async (req, res) => { ... });
// Route sepenuhnya BERAKHIR DI SINI (Tanpa Delete/Put API)!
```
**Penjelasan Syntax:** Membuktikan bahwa aplikasi dibatasi pada tahapan `GET` dan `POST`. Permintaan untuk menimpa data, terlepas dipaksa pakai _curl_ sekalipun, otomatis ditolak karena Backend Express tidak menyediakan _endpoints_ (`404 Not Found`).

### 7. "Lalu bagaimana Cassandra mengelola puluhan ribu pengumuman agar fitur feed *infinite scroll* tak *lemot* walau data meluber?"
> **Jawaban Teknis:** "Kami memformulasikan *Primary Key* menggunakan skema radikal bernama **Time-Series Bucketing**.
> *Partition Key* merupakan persekutuan dari string ID dan Tanggal (contoh: `dts-2026-05`). Data se-fakultas secara logis dipecah per-bulan dan diparkir pada kluster (node) yang berbeda. Ketika antarmuka meminta *feed*, Cassandra tidak kewalahan memilah dari tahun berdiri, ia cukup mencungkil partisi bulan ini."

**📌 Bukti Kode (*Cassandra Table PK*):**
```javascript
// backend/cassandra.js
`CREATE TABLE IF NOT EXISTS announcements_by_channel (
   // ...kolom-kolom...
   PRIMARY KEY ((channel_id, month_year_bucket), created_at, id)
 ) WITH CLUSTERING ORDER BY (created_at DESC)`
```
**Penjelasan Syntax:** Parameter kurung ganda `(( ... ))` meresmikan kedua properti sebagai *Composite Partition Key*. Adanya `created_at DESC` berarti begitu satu bulan ditarik, datanya dijamin otomatis dalam keadaan mundur (Terbaru ke Terlama).

### 8. "Apa jadinya kalau 100 Admin memukul tombol 'Siarkan' di *milisecond* yang berbarengan? Bisa bentrok datanya di Database?"
> **Jawaban Teknis:** "Tidak mungkin menumpuk. Kami memfasilitasi setiap row dengan UUID tipe khas. Secara spesifik, sebuah pengidentifikasi UUID versi 1 yang disuntik dari `cassandra-driver`. Mustahil secara proporsi matematis terjadi tabrakan. Selain LSM Tree, antrean padat di-blok langsung oleh *Rate Limiter*."

**📌 Bukti Kode (*UUID Insertion & Limiter*):**
```javascript
// backend/middleware/rateLimit.js
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 }); // Maks 1 Menit/30 Kali Hit

// backend/routes/announcements.js
const id = cassandra.types.TimeUuid.now();
```
**Penjelasan Syntax:** `writeLimiter` melindungi dari spam buatan *bot*. `TimeUuid.now()` mengekspor String UUID Tipe V1 terderivasi dari kalkulasi rentang Waktu Komputer dan spesifikasi *Mac Address* sistem per detik, menjamin tingkat keunikan alam semesta di setiap eksekusi. 

---

## BAB 4: *Edge Cases* & Eksperimentasi Keamanan

### 9. "Bagaimana kalau saya buka Himpunan Angkatan jadul yang mati (tak ada post) 6 bulan belakangan? Apakah algoritmamu akan nge-*hang/Infinite Loop* mencari datanya ke belakang?"
> **Jawaban Teknis (The Ghost Town Test):** "Tidak, Pak/Bu. Sistem ini dilindungi oleh pagar penahan (*circuit breaker*). Jika sebuah bulan kosong melompong, `While Loop` dilarang menggali masa lalu terlalu dalam lewat pembatas `maxBucketsToCheck = 5`. Begitu melampaui 5 bulan mundur berturut-turut tanpa hasil, prosesnya menyerah dengan elegan berbekal `[]` array kembali ke *Frontend*."

**📌 Bukti Kode (*Max Buckets Fallback*):**
```javascript
// backend/routes/announcements.js (GET API)
let bucketsChecked = 0;
const maxBucketsToCheck = 5;

while (allAnnouncements.length < limit && bucketsChecked < maxBucketsToCheck) {
  // ... Query penarikan ke DB ...
  bucketsChecked++;
}
```
**Penjelasan Syntax:** Variabel penanda pencarian mundur ditambahkan di akhir iterasi pakai skema `++`. Pengerukan ke belakang ditahan dengan operan logika `&& bucketsChecked < maxBucketsToCheck` melepaskan server dari belenggu putungan sirkular.

### 10. "Admin ngetik berita, ditinggal tidur sejam. Saat Token JWT-nya mati, lantas ia klik 'Siarkan', apa layar bakal membeku?"
> **Jawaban Teknis (The Expiry Trap):** "Momen kadaluwarsa token ini sudah diantisipasi sempurna. Backend menangkap token busuk dan otomatis memprotes dengan HTTP `401 Unauthorized`. Di _frontend_, Axios Interceptor bertugas layaknya penjaga gawang mencegat respons tersebut. Admin ditarik paksa dari memori React kembali ke modul Sign in lewat *hard-redirect* tanpa membekukan layar."

**📌 Bukti Kode (*Axios Interceptor & Redirect*):**
```javascript
// frontend/src/api.js & App.jsx
axios.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401 && logoutCallback) { logoutCallback(); }
  return Promise.reject(err);
});

// App.jsx Hook Layout
setLogoutCallback(() => {
  logout(); 
  window.location.href = '/loginAdmin'; // Penyelamatan Instan!
});
```
**Penjelasan Syntax:** `axios.interceptors` mengevaluasi semua kedatangan respons HTTP. Saat blok kode rahasia `401` tertangkap, fungsi me-*reset global state user* milik Zustand (`logout()`) kemudian skema `window.location.href` akan secara murni menulis ulang bilah muat peramban *(browser)* ke alamat aman log masuk.

---

## BAB 5: Keamanan Tingkat Lanjut & Optimalisasi (The Pro-Level)

### 11. "Selain sekadar Rate Limiting API, lantas bagaimana Node.js API kalian bertahan kalau diserang teknik *Payload Bomb* / Data JSON Raksasa berukuran 5 Gigabytes yang membuat memorinya jebol?"
> **Jawaban Teknis:** "Otomatis tertolak dari ambang pintu gerbang utama (Early-Rejection). Sebagai bagian proteksi DOS/DDoS Server Level, kami membatasi ukuran maksimal JSON yang mentolerir transmisi ke parser *Express.js* hanya di 256 Kilobytes. Ditambah juga **Helmet.js** menanam lapisan keamanan meta-header tambahan anti XSS dan injeksi sembarang _frame_ asing."

**📌 Bukti Kode (*Security Configurations*):**
```javascript
// backend/server.js
app.use(helmet()); 
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '256kb' })); 
```
**Penjelasan Syntax:** Baris `app.use(helmet())` menyalakan proteksi pengaya respon HTML *header*. Di barisan parsasi JSON terpatok spesifikasi batas sangat ekstrim `limit: '256kb'`. Tak terikat seberapa jumbo *Hacker* menyuntik body POST, mesin bakal memotongnya sebelum menyulut *Memory Overflow*.

### 12. "Sistem data Lampiran Berkas/File Gambar di aplikasi kok tidak diciptakan terpisah di tabel `tbl_attachments` lantas nanti di-JOIN saat merender Pengumuman layaknya di MySQL?"
> **Jawaban Teknis:** "Apache Cassandra secara harfiah merilis instruktur sistem bahwa Ia **Tidak Mendukung Operasi JOIN** sebab data diradiasikan meluncur antar Node di mesin server yang berlainan raga (luar biasa lambat). Oleh karena itu, skema sistem tidak menganut Relasi melainkan model skema kami sengaja melanggarnya dengan men-denormalisasi data melalui properti Koleksi (Collection Type)."

**📌 Bukti Kode (*Denormalized LIST Columns*):**
```javascript
// backend/cassandra.js
`CREATE TABLE IF NOT EXISTS announcements_by_channel (
  // ...kolom dasar...
  attachment_url LIST<TEXT>,
  priority       TEXT,
  // ...
)`
```
**Penjelasan Syntax:** Menautkan tipe `LIST<TEXT>` merupakan rancang-bangun arsitektural kolom berformat list tipe kuat. Deretan URL *string* melekat solid di dalam *row* pengumuman tersebut sehingga waktu baca untuk memuat berapapun lampirannya berjalan konstan cepat bak petir kecepatan *O(1)*.

### 13. "Untuk fitur 'Sematkan (Pin) ke atas', apakah Backend mensetup *Cron Job / Scheduled Tasks* terjadwal di latar belakang Server mendeteksi jam kadaluwarsanya?"
> **Jawaban Teknis:** "Sama sekali Tidak. Menaruh siklus loop *Cron Job* akan menelan daya operasional CPU & Daya secara rakus tiap detiknya. Fitur *un-pin* diringankan murni dengan format kalkulasi waktu nyata (*On-The-Fly-Calculation*) pada antarmuka Klien. Setiap per detik dirender, _browser_ bereaksi otomatis bila durasinya kadaluwarsa, menghapus pendaran Birunya seketika."

**📌 Bukti Kode (*Client-side Pin Validation*):**
```javascript
// frontend/src/components/AnnouncementCard.jsx
function isPinActive(pinUntil) {
  if (!pinUntil) return false;
  return new Date(pinUntil) > new Date(); // komparasi waktu lokal
}

const pinned = isPinActive(pinUntil); // Menjadi 'false' jika sudah kadaluwarsa
```
**Penjelasan Syntax:** Fungsi matematis `new Date(pinUntil)` melambangkan *Date Objejct* standar patokan dari Backend. Angka kronologis ini dibandingkan native operand `>` pada penanggalan terkini _(live observer)_ antarmuka `new Date()`. Menghasilkan *output* boolean mutlak akurat hitungan milidetiknya. 

### 14. "Apakah *State* Global sebesar Tema Malam dan Akun Autentikasi disebarkan menuruni ratusan susunan halaman (*Prop-Drilling*) pada arsitektur React JS Anda?"
> **Jawaban Teknis:** "Tidak melewati *Prop-drilling*. Manajemen pemantauan global dititipkan langsung terhadap sebuah solusi modular yang disebut **Zustand**. Bila arsitektur *Redux* dinilai kaku lantaran tuntutan berbaris modul _action/dispatch_ serta rawan re-render tak wajar, _Zustand_ mendaratkan wujud fungsional *state* micro. Mengganti wujud tema menjadi hitam hanya mendelegasikan 1 baris modul penyetel variabel tanpa memecah _rendering_ blok _Feed_ lain."

**📌 Bukti Kode (*Zustand Store Hook*):**
```javascript
// frontend/src/store/useAppStore.js
import { create } from 'zustand';

const useAppStore = create((set) => ({
  isDarkMode: false,
  setIsDarkMode: (isDark) => set({ isDarkMode: isDark }),
}));
```
**Penjelasan Syntax:** `create` meracik _Object Store_ state siap saji. Sesudahnya `setIsDarkMode` disentuh pada modul *header* React, ia bermodifikasi mutlak di instrumen `isDarkMode`. _Hooks_ penonton memantulkan nilai yang terubah ke selongsong pembungkus DOM seketika.

### 15. "Keseluruhan data ribuan pengumuman menumpuk di 1 wadah besar. Bila mahasiswa prodi Sistem Informasi membaca timeline serentak saat angkatan Elektro pun _online_, apakah Backend atau Disk mesinnya memacet antre parah bergiliran (*Table-Level Locking*)?"
> **Jawaban Teknis:** "Nol Kemungkinan Memacet (No Bottlenecking / No Locks). Di sinilah kunci kedahsyatan Cassandra terekspos. Mengusung `Partition Key` berbasis identitas awalan ID Channel (Misal: dte, dti), wadah fisik disk memori membelah diri (Hash Routing) ke partisi rak yg bersilangan arah. *Retrieval* DTI takkan mengorbankan _Space-Read_ DTE walau berada bersama di kerangka kolom tabel `announcements_by_channel`. Paralel Seratus Persen!"

**📌 Bukti Kode (*Routing Data Partisi Fisik Berorientasi Kueri*):**
```javascript
// backend/routes/announcements.js - GET Selection
let query = `
  SELECT * FROM announcements_by_channel 
  WHERE channel_id = ? AND month_year_bucket = ?
`;
```
**Penjelasan Syntax:** Aturan mutlak kueri spesifik CQL, _parameter_ indeks di penempatan WHERE (`channel_id`) wajib diutarakan lebih utama dikarenakan fungsinya menavigasi lorong pemisahan partisi (Cluster Routing Hash), menyuruh perabotan _Disket Database_ berjalan cuma langsung fokus menerka data lorong itu bebas dari malapetaka efektivitas *Full-Table Scan* pencarian seluruh tabel.
