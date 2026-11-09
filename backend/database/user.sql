-- User khusus aplikasi (jangan pakai root di aplikasi)
CREATE USER IF NOT EXISTS 'ASMUndanganDigital'@'localhost' IDENTIFIED BY 'ganti_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ASMUdanganDigital.* TO 'ASMUndanganDigital'@'localhost';
FLUSH PRIVILEGES;