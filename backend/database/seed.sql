-- Data awal: 10 produk dan 2 pengguna
USE ASMUdanganDigital;
INSERT IGNORE INTO produk (nama, harga, stok, kategori) VALUES
('ADAT JAWA', 75000, 8, 'Adat Jawa'),
('Tema 1', 18000, 3,'modern'),
('Tema 2', 16000, 0,'Elegant'),
('Tema 3', 2500, 40, 'Animasi 3d'),
('Adat Sunda', 2000, 15, 'Adat Sunda'),
('Adat Minang', 28000, 12, 'Adat Minang');

-- Password: rahasia123 (Sari) dan budi12345 (Budi), disimpan sebagai hash bcrypt
INSERT INTO pengguna (nama, email, password, peran) VALUES
('Sari','sari@ASMUndanganDigital.id','1234567890','admin'),

('Budi', 'budi@ASMUndanganDigital.id', '1234567890', 'creator');