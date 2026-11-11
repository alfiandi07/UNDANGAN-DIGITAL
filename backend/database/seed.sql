-- ========================================================
-- DATA AWAL (SEED) PLATFORM UNDANGAN DIGITAL
-- ========================================================

USE ASMUdanganDigital;

-- 1. SEED AKUN ADMIN TIM INTI (3 ORANG)
-- Password default: admin123 (hash bcrypt)
INSERT INTO admins (name, email, password_hash) VALUES
('Admin ASM 1', 'admin1@asm.invitation', '$2a$10$7.P5wWz8V/3y9V6Hq8kGne9X0M8l7wJq5W2x5P3K4Y1Z9L0N2O4S2'),
('Admin ASM 2', 'admin2@asm.invitation', '$2a$10$7.P5wWz8V/3y9V6Hq8kGne9X0M8l7wJq5W2x5P3K4Y1Z9L0N2O4S2'),
('Admin ASM 3', 'admin3@asm.invitation', '$2a$10$7.P5wWz8V/3y9V6Hq8kGne9X0M8l7wJq5W2x5P3K4Y1Z9L0N2O4S2');

-- 2. SEED 6 MASTER TEMPLATE AWAL
INSERT INTO templates (slug, title, category, theme_style, thumbnail_url, demo_url, price_basic, price_standard, price_special, is_active) VALUES
(
    'jawa-keraton-royal',
    'Jawa Keraton Royal',
    'wedding',
    'Adat Jawa',
    '/assets/templates/jawa-keraton.webp',
    '/demo/jawa-keraton-royal',
    79000, 99000, 120000,
    TRUE
),
(
    'sunda-siger-luxury',
    'Sunda Siger Luxury',
    'wedding',
    'Adat Sunda',
    '/assets/templates/sunda-siger.webp',
    '/demo/sunda-siger-luxury',
    79000, 99000, 120000,
    TRUE
),
(
    'modern-minimalist-couture',
    'Modern Minimalist Couture',
    'wedding',
    'Modern Minimalis',
    '/assets/templates/modern-minimalist.webp',
    '/demo/modern-minimalist-couture',
    79000, 99000, 120000,
    TRUE
),
(
    'islamic-luxe-andalusia',
    'Islamic Luxe Andalusia',
    'wedding',
    'Islamic Luxe',
    '/assets/templates/islamic-luxe.webp',
    '/demo/islamic-luxe-andalusia',
    79000, 99000, 120000,
    TRUE
),
(
    'earthy-botanical-warm',
    'Earthy Botanical Warm',
    'wedding',
    'Floral & Rustic',
    '/assets/templates/earthy-botanical.webp',
    '/demo/earthy-botanical-warm',
    79000, 99000, 120000,
    TRUE
),
(
    'khitan-barokah-ceria',
    'Khitan Barokah Ceria',
    'khitan',
    'Syukuran Khitan',
    '/assets/templates/khitan-ceria.webp',
    '/demo/khitan-barokah-ceria',
    79000, 99000, 120000,
    TRUE
);

-- 3. SEED BIAYA OPERASIONAL BULANAN CONTOH (BULAN INI)
INSERT INTO operational_costs (period_month, expense_name, amount) VALUES
('2026-11', 'Sewa VPS Linux BBPVP / Hosting', 60000.00),
('2026-11', 'Kas Iklan & Domain', 40000.00);
