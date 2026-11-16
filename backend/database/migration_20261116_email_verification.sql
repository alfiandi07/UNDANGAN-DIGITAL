-- ========================================================
-- MIGRATION: Email Verification & OTP Support (FR-F1..F4)
-- Tanggal: 16 November 2026
-- ========================================================

-- 1. Tambah kolom verifikasi di tabel orders (pembeli/user)
ALTER TABLE orders 
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN verification_otp VARCHAR(6) NULL,
ADD COLUMN otp_expires_at DATETIME NULL;

-- 2. Tambah kolom verifikasi di tabel admins (admin tim inti)
ALTER TABLE admins 
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT TRUE;

