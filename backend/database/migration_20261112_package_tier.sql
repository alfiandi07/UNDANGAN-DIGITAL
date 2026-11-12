-- ========================================================
-- MIGRATION: PAKET STANDAR VS PREMIUM & HARGA DINAMIS ADMIN
-- Sesuai PRD asm.invitation (docs/PRD.md Bab 3 & Bab 6)
-- ========================================================

USE ASMUdanganDigital;

-- 1. Tambah kolom package_type dan price ke tabel templates (jika belum ada)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS package_type ENUM('standard', 'premium') NOT NULL DEFAULT 'standard' AFTER category,
ADD COLUMN IF NOT EXISTS price INT UNSIGNED NOT NULL DEFAULT 99000 AFTER package_type;

-- 2. Sinkronkan nilai price dari template yang sudah ada sebelumnya
UPDATE templates 
SET price = COALESCE(price_standard, 99000) 
WHERE price IS NULL OR price = 0;

-- 3. Perbarui enum package_type pada orders & invitations agar mendukung 'standard' dan 'premium'
ALTER TABLE orders 
MODIFY COLUMN package_type ENUM('basic', 'standard', 'special', 'premium') NOT NULL DEFAULT 'standard';

ALTER TABLE invitations 
MODIFY COLUMN package_type ENUM('basic', 'standard', 'special', 'premium') NOT NULL DEFAULT 'standard';

