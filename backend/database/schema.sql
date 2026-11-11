-- ========================================================
-- SKEMA RESMI PLATFORM UNDANGAN DIGITAL (PRD ASM INVITATION)
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS ASMUdanganDigital
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ASMUdanganDigital;

-- Bersihkan tabel lama
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS operational_costs;
DROP TABLE IF EXISTS admins;
-- Bersihkan sisa tabel kasir lama jika ada
DROP TABLE IF EXISTS detail_transaksi;
DROP TABLE IF EXISTS transaksi;
DROP TABLE IF EXISTS produk;
DROP TABLE IF EXISTS pengguna;

-- --------------------------------------------------------
-- 1. TABEL ADMIN TIM INTI (3 ORANG)
-- --------------------------------------------------------
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 2. TABEL KATALOG MASTER TEMPLATE (DIKELOLA TIM BERTIGA)
-- --------------------------------------------------------
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('wedding', 'khitan', 'birthday', 'aqiqah') NOT NULL,
    theme_style VARCHAR(100) NOT NULL, -- contoh: Adat Jawa, Modern, Rustic, Islamic
    thumbnail_url VARCHAR(255) NOT NULL,
    demo_url VARCHAR(255) NOT NULL,
    price_basic INT UNSIGNED NOT NULL DEFAULT 79000,
    price_standard INT UNSIGNED NOT NULL DEFAULT 99000,
    price_special INT UNSIGNED NOT NULL DEFAULT 120000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 3. TABEL TRANSAKSI & PESANAN (INTEGRASI MIDTRANS)
-- --------------------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL, -- contoh: ASM-20261111-001
    buyer_name VARCHAR(100) NOT NULL,
    buyer_whatsapp VARCHAR(30) NOT NULL,
    buyer_email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- password login klien ke dashboard
    template_id INT NOT NULL,
    package_type ENUM('basic', 'standard', 'special') NOT NULL,
    gross_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT 'pending',
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 4. TABEL UNDANGAN AKTIF & LIMITER KUOTA (INTI SISTEM)
-- --------------------------------------------------------
CREATE TABLE invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- contoh: bagas-sekar
    template_id INT NOT NULL,
    package_type ENUM('basic', 'standard', 'special') NOT NULL,
    max_photos INT NOT NULL DEFAULT 15, -- 15 untuk Basic/Std, 30 untuk Special
    current_photos INT NOT NULL DEFAULT 0,
    event_details JSON NOT NULL, -- Data mempelai, waktu, peta, array URL foto Cloudinary
    status ENUM('draft', 'active', 'expired', 'cleaned') DEFAULT 'draft',
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 5. TABEL RSVP & UCAPAN DOA TAMU
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- 6. TABEL BIAYA OPERASIONAL BULANAN (BAGI HASIL BERTIGA)
-- --------------------------------------------------------
CREATE TABLE operational_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_month VARCHAR(7) NOT NULL, -- format: '2026-11'
    expense_name VARCHAR(150) NOT NULL, -- contoh: 'Sewa VPS 1GB', 'Domain'
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;
