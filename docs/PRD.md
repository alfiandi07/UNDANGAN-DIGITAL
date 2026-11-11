# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Nama Proyek:** Platform Katalog & Generator Undangan Digital (`asm.invitation` / `undang_an.digital`)  
**Model Operasional:** Studio Kolektif Tim Inti (3 Orang Admin/Kreator)  
**Target Rilis MVP:** 30 Master Template Awal (10 Template per Anggota Tim)  
**Tech Stack Utama:** Node.js, Express.js, MySQL, Tailwind CSS, Cloudinary API, Midtrans Payment Gateway  
**Status Dokumen:** *Ready for Development*  

---

## 1. RINGKASAN EKSEKUTIF & TUJUAN PRODUK

### 1.1. Latar Belakang Produk
`asm.invitation` (`undang_an.digital`) adalah platform web katalog dan generator undangan digital multi-acara (Pernikahan, Khitanan, Ulang Tahun, Aqiqah, dan Tasyakuran) yang dirancang dengan standar visual *high-end* dan pendekatan *Mobile-First* (`100dvh`). 

Berbeda dengan *marketplace* terbuka yang rumit, platform ini menggunakan model **Studio Kolektif Internal (3 Orang)** di mana seluruh template diproduksi dan dikurasi oleh tim inti di bawah satu bendera brand **`asm`**. Sistem dirancang agar proses eksplorasi katalog, pembayaran, kustomisasi data oleh pembeli, pembatasan kuota server, hingga perhitungan bagi hasil bersih (*Net Profit*) berjalan **100% otomatis**.

### 1.2. Masalah yang Diselesaikan
1. **Bagi Pembeli (Klien):** Mengatasi masalah template undangan murah di *marketplace* umum yang kaku, lambat, berjarak renggang di layar HP, dan berbau teks AI generik.
2. **Bagi Tim Inti (3 Orang):** Menghilangkan kerumitan pembagian komisi manual dan mencegah pembengkakan biaya penyimpanan server (*cloud storage*) akibat tumpukan foto dari acara yang sudah lewat.

---

## 2. ARSITEKTUR TEKNIS & TECH STACK

| Komponen | Teknologi yang Digunakan | Fungsi & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend & API** | Node.js + Express.js | Menangani *routing*, logika transaksi, *webhook* pembayaran, *middleware* kuota foto, dan *cron job* pembersih server. |
| **Database** | MySQL | Menyimpan data pesanan, akun klien, RSVP tamu, serta detail acara menggunakan tipe kolom `JSON` agar fleksibel untuk berbagai jenis acara. |
| **Frontend & UI** | HTML5, Tailwind CSS, JS/TS | Membangun halaman katalog responsif dan template undangan *Mobile-First* dengan animasi CSS murni & vektor SVG tajam. |
| **Cloud Storage** | Cloudinary API | Menyimpan foto klien secara terpisah dari VPS, kompresi otomatis ke format `.webp`, dan mendukung penghapusan otomatis (*auto-cleanup*). |
| **Payment Gateway** | Midtrans (Snap API) | Memproses pembayaran otomatis via QRIS, Virtual Account Bank, dan E-Wallet beserta notifikasi *Webhook* *real-time*. |
| **Infrastruktur** | VPS Linux (1GB–2GB RAM) + PM2 | Menjalankan aplikasi Node.js dengan biaya operasional bulanan yang sangat rendah dan stabil. |

---

## 3. ATURAN BISNIS, PAKET HARGA & PEMBATAS SISTEM (SYSTEM LIMITER)

Sistem menerapkan pembatasan otomatis pada tingkat database dan *middleware* berdasarkan paket yang dipilih pembeli:

| Parameter & Fitur | Paket Basic (Rp 79.000) | Paket Standard (Rp 99.000) | Paket Spesial / VIP (Rp 120.000) |
| :--- | :--- | :--- | :--- |
| **Kode Sistem (`package_type`)** | `basic` | `standard` | `special` |
| **Batas Kuota Foto (`max_photos`)** | Maksimal **15 Foto** | Maksimal **15 Foto** | Maksimal **30 Foto** |
| **Batas Ukuran per Foto** | Maks. 500 KB (Auto-WebP) | Maks. 500 KB (Auto-WebP) | Maks. 800 KB (Auto-WebP) |
| **Masa Aktif Link (`expires_at`)** | **3 Bulan** (90 Hari) | **6 Bulan** (180 Hari) | **12 Bulan** (365 Hari) |
| **Fitur Interaktif Utama** | Hitung Mundur, Maps, RSVP, Generator Nama Tamu | Semua fitur Basic + **Amplop Digital/QRIS & Musik Latar** | Semua fitur Standard + **Custom Elemen & Audio Khusus** |
| **Jadwal Auto-Delete Cloudinary** | **H+7** setelah *Expired* | **H+7** setelah *Expired* | **H+14** setelah *Expired* |

**Fitur Upselling / Add-on Otomatis di Dashboard Klien:**
* **Tambah Kuota Foto (+Rp 20.000):** Menambahkan $+10$ pada nilai `max_photos` di database.
* **Perpanjang Masa Aktif (+Rp 25.000):** Menambahkan $+3\text{ Bulan}$ pada nilai `expires_at` di database.

---

## 4. SPESIFIKASI FITUR FUNGSIONAL (FUNCTIONAL REQUIREMENTS)

### 4.1. Modul A: Katalog Publik & Live Demo (Frictionless Browsing)
* **FR-A1 (Eksplorasi Tanpa Login):** Pengunjung dapat membuka halaman katalog utama, memfilter berdasarkan jenis acara (*Pernikahan, Khitanan, Ulang Tahun, Aqiqah*) atau tema (*Adat Jawa, Modern, Rustic, Islami*) tanpa harus login.
* **FR-A2 (Interactive Live Demo):** Setiap kartu produk memiliki tombol **"Live Demo"** yang menampilkan pratinjau undangan sesungguhnya dalam bingkai rasio HP (`max-w-md`), lengkap dengan musik dan animasi sampul.
* **FR-A3 (Real-time Slug Checker):** Saat tombol **"Pesan Sekarang"** diklik, pembeli dapat mengetik *slug* URL impian mereka (contoh: `undang_an.digital/bagas-sekar`) dan sistem langsung memvalidasi ketersediaannya ke database MySQL.

### 4.2. Modul B: Checkout & Integrasi Midtrans Webhook
* **FR-B1 (Snap Checkout):** Sistem menghasilkan `order_id` unik dan memunculkan pop-up pembayaran Midtrans sesuai harga paket (Rp 79.000 / Rp 99.000 / Rp 120.000).
* **FR-B2 (Auto-Activation Webhook):** Endpoint `POST /api/payment/webhook` menangkap sinyal `settlement` atau `capture` dari Midtrans, lalu secara otomatis:
  1. Mengubah status pesanan menjadi `paid`.
  2. Mengaktifkan akses dashboard klien.
  3. Mengatur nilai `max_photos` ($15$ atau $30$) dan menghitung tanggal `expires_at` ($+3$, $+6$, atau $+12$ bulan dari tanggal bayar).

### 4.3. Modul C: Dashboard Klien & Editor Undangan (Multi-Acara)
* **FR-C1 (Dynamic Event Form):** Formulir pengisian data menyesuaikan labelnya secara dinamis berdasarkan kategori acara:
  * *Pernikahan:* Mempelai Pria & Wanita, Orang Tua, Akad/Panggih, Resepsi.
  * *Khitanan:* Nama Anak, Nama Orang Tua, Waktu & Lokasi Syukuran Khitan.
  * *Ulang Tahun:* Nama yang Berulang Tahun, Usia/Keberapa, Waktu & Lokasi Pesta.
* **FR-C2 (Photo Quota Enforcer):** *Middleware* Express.js memeriksa jumlah foto yang sudah diunggah ($\text{current\_photos} < \text{max\_photos}$). Jika kuota penuh, unggahan ditolak dan sistem menampilkan tombol *Upgrade Kuota*.
* **FR-C3 (WhatsApp Guest Link Generator):** Fitur bagi klien untuk memasukkan daftar nama tamu (per baris) dan menghasilkan tautan siap bagikan ke WhatsApp dengan parameter `?to=Nama+Tamu`.

### 4.4. Modul D: Halaman Undangan Tamu (Guest View & Viral Loop)
* **FR-D1 (Standar UI/UX Layar HP):**
  * Layar Sampul (*Cover*) wajib terkunci proporsional di tengah layar HP (`fixed inset-0 h-[100dvh] flex flex-col justify-center`) agar tidak ada elemen yang terlempar ke luar layar.
  * Menggunakan ornamen vektor (Inline SVG) agar tajam dan tidak pecah di layar Retina/AMOLED.
  * Menggunakan bahasa sapaan yang natural dan hangat sesuai adat/tema (bukan terjemahan kaku AI).
* **FR-D2 (Expiration Gatekeeper):** Saat tamu mengakses `GET /:slug`, server memeriksa apakah $\text{NOW()} > \text{expires\_at}$. Jika sudah lewat, tampilkan halaman **"Masa Aktif Undangan Telah Berakhir"** beserta tombol perpanjangan untuk pemilik acara.
* **FR-D3 (Real-time RSVP & Amplop Cashless):** Tamu dapat menyalin nomor rekening sekali klik dan mengirim ucapan doa/konfirmasi kehadiran yang langsung tampil tanpa *reload* halaman.
* **FR-D4 (Viral Loop Footer):** Setiap bagian bawah undangan memuat tautan aktif *"Created with 🤍 by asm.invitation"* yang mengarahkan tamu ke halaman katalog utama.

### 4.5. Modul E: Panel Admin Tim Inti & Otomatisasi Bagi Hasil
* **FR-E1 (Manajemen 30 Template):** Halaman khusus admin untuk mendaftarkan rute template baru, mengunggah *thumbnail*, dan mengatur kategori tanpa sistem vendor eksternal.
* **FR-E2 (Automated Net Profit Calculator):** Halaman keuangan internal (`/admin/finance`) yang menghitung pembagian komisi tim bertiga secara *real-time* menggunakan rumus:
  $$\text{Net Profit} = \text{Total Omset Lunas (Midtrans)} - (\text{Biaya VPS \& Domain} + \text{Biaya MDR} + \text{Kas Marketing})$$
  $$\text{Bagian Per Anggota Tim} = \frac{\text{Net Profit}}{3}$$
* **FR-E3 (Nightly Auto-Cleanup Cron Job):** Skrip `node-cron` yang berjalan setiap pukul 02:00 WIB untuk mencari undangan yang sudah melewati masa tenggang *expired* (H+7 atau H+14), menghapus seluruh fotonya dari Cloudinary via API, dan mengosongkan daftar foto di database.

---

## 5. KEBUTUHAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)

* **NFR-1 (Performa & Kecepatan Muat):** Waktu muat halaman undangan (*First Contentful Paint*) wajib di bawah $2,5\text{ detik}$ pada jaringan seluler 4G melalui kompresi gambar `.webp` otomatis dan penggunaan SVG inline.
* **NFR-2 (Kompatibilitas Perangkat):** Tampilan wajib proporsional 100% pada berbagai rasio layar *smartphone* (iOS Safari, Android Chrome, dan *In-App Browser* WhatsApp/Instagram).
* **NFR-3 (Keamanan Transaksi & Data):** Validasi *Signature Key* dari Webhook Midtrans wajib diverifikasi menggunakan algoritma `SHA-512` sebelum mengaktifkan pesanan untuk mencegah pemalsuan status pembayaran.
* **NFR-4 (Efisiensi Penyimpanan Server):** Penggunaan kapasitas Cloudinary harus dijaga tetap di bawah batas *Free Tier* ($25\text{ GB}$) melalui mekanisme kompresi *client-side* dan penghapusan otomatis undangan yang sudah kedaluwarsa.
* **NFR-5 (Optimasi Kecepatan & Bobot Aset Ringan):**
  * Server Nginx wajib mengaktifkan modul kompresi **`gzip on`** untuk seluruh file teks, CSS, dan JS agar ukuran transfer turun drastis (hingga 70–80% lebih hemat kuota).
  * Seluruh ikon dan ornamen wajib menggunakan vektor **SVG inline** atau *CSS styling* murni, dilarang memakai gambar `.png`/`.jpg` berat untuk elemen ikon antarmuka.
  * Menerapkan teknik **`Lazy Loading`** (`loading="lazy"`) pada semua kartu pratinjau template di katalog sehingga HP pengunjung hanya mendownload gambar yang terlihat di layar.
  * Total muatan aset halaman utama (Landing Page) dibatasi maksimal **$< 1\text{ MB}$**.
* **NFR-6 (Strategi Pencadangan Database / Database Backup):**
  * Skrip pencadangan otomatis menggunakan utilitas bawaan **`mysqldump`** yang dijadwalkan berjalan di latar belakang server (*background cron*) pada jam sepi pengunjung (misal: 03:00 WIB).
  * Proses `mysqldump` terisolasi 100% dari alur web pengunjung sehingga **sama sekali tidak mempengaruhi kecepatan buka website (0% latensi)**.
  * File dump database dirotasi secara berkala dengan masa simpan (*retention*) 7 hari terakhir.

---

## 6. SKEMA DATABASE UTAMA (MySQL)

Berikut adalah struktur tabel inti yang wajib dibuat di MySQL:

```sql
-- 1. Tabel Katalog Master Template (Dikelola Tim Bertiga)
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('wedding', 'khitan', 'birthday', 'aqiqah') NOT NULL,
    theme_style VARCHAR(100) NOT NULL, -- contoh: Adat Jawa, Modern, Rustic
    thumbnail_url VARCHAR(255) NOT NULL,
    demo_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Transaksi & Pesanan (Integrasi Midtrans)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL, -- contoh: ASM-20261111-001
    buyer_name VARCHAR(100) NOT NULL,
    buyer_whatsapp VARCHAR(30) NOT NULL,
    buyer_email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    template_id INT NOT NULL,
    package_type ENUM('basic', 'standard', 'special') NOT NULL,
    gross_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT 'pending',
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- 3. Tabel Undangan Aktif & Limiter (Inti Sistem)
CREATE TABLE invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- contoh: bagas-sekar
    template_id INT NOT NULL,
    package_type ENUM('basic', 'standard', 'special') NOT NULL,
    max_photos INT NOT NULL DEFAULT 15, -- 15 untuk Basic/Std, 30 untuk Special
    current_photos INT NOT NULL DEFAULT 0,
    event_details JSON NOT NULL, -- Menyimpan profil acara, waktu, maps, & array foto Cloudinary
    status ENUM('draft', 'active', 'expired', 'cleaned') DEFAULT 'draft',
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 4. Tabel RSVP & Ucapan Tamu
CREATE TABLE rsvps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invitation_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    attendance ENUM('hadir', 'tidak_hadir', 'ragu') NOT NULL,
    pax INT DEFAULT 1,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- 5. Tabel Biaya Operasional Bulanan (Untuk Hitung Net Profit Bagi 3)
CREATE TABLE operational_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_month VARCHAR(7) NOT NULL, -- contoh: '2026-11'
    expense_name VARCHAR(150) NOT NULL, -- contoh: 'Sewa VPS 1GB', 'Alokasi Iklan'
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. DAFTAR ENDPOINT API (EXPRESS.JS)

| Method | Endpoint URL | Deskripsi Tugas |
| :--- | :--- | :--- |
| `GET` | `/api/templates` | Mengambil daftar katalog template beserta filter kategori. |
| `POST` | `/api/check-slug` | Mengecek apakah URL `undang_an.digital/:slug` masih tersedia. |
| `POST` | `/api/orders/checkout` | Membuat transaksi baru & memanggil token Snap Midtrans. |
| `POST` | `/api/payment/webhook` | Menerima notifikasi lunas dari Midtrans, set kuota $15/30$ foto & masa aktif. |
| `PUT` | `/api/client/invitation/:slug` | Menyimpan perubahan data acara (`JSON`) dari dashboard klien. |
| `POST` | `/api/client/invitation/:slug/photo` | *Middleware* cek kuota foto $\rightarrow$ Upload ke Cloudinary $\rightarrow$ Update DB. |
| `GET` | `/:slug` | Mengecek `expires_at` $\rightarrow$ Merender undangan ke tamu atau halaman *Expired*. |
| `POST` | `/api/invitation/:slug/rsvp` | Menyimpan ucapan doa & konfirmasi kehadiran tamu. |
| `GET` | `/api/admin/profit-summary` | Menghitung otomatis Omset $-$ Biaya Operasional dan membagi $3$ (*Net Profit*). |

---

## 8. ROADMAP PENGERJAAN TIM BERTIGA (MILESTONES)

1. **Fase 1: Setup Fondasi & Repository (Minggu 1)**
   * Inisialisasi Git & GitHub (`UNDANGAN-DIGITAL`), pembuatan struktur folder Express.js, dan eksekusi tabel MySQL di atas.
2. **Fase 2: Katalog, Checkout & Limitasi Sistem (Minggu 2)**
   * Pembuatan halaman katalog, integrasi Midtrans Sandbox, pembuatan dashboard input klien, serta *middleware* pembatas $15/30$ foto.
3. **Fase 3: Produksi 30 Template Kolektif (Minggu 3–4)**
   * Kamu ($10$ template), Teman A ($10$ template), dan Teman B ($10$ template) merakit desain *Mobile-First* (Pernikahan, Khitanan, Ultah) menggunakan variabel JSON yang seragam.
4. **Fase 4: Testing di HP & Deployment VPS (Minggu 5)**
   * Pengujian tampilan di berbagai ukuran layar *smartphone*, setup VPS + PM2 + Domain, dan peluncuran promosi awal (*Early Bird*).

