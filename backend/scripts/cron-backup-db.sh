#!/bin/bash
# ========================================================
# ASM.INVITATION - CRONJOB PENCADANGAN DATABASE (NFR-6)
# Dijalankan setiap hari pukul 03:00 WIB via Crontab Linux
# Rotasi backup: 7 hari terakhir
# ========================================================

TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/asm-invitation"
DB_NAME="ASMUdanganDigital"
DB_USER="root"
# Ganti dengan password database jika diperlukan
# DB_PASS="password_anda"

mkdir -p "${BACKUP_DIR}"

BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

echo "[$(date "+%Y-%m-%d %H:%M:%S")] [ASM-BACKUP] Memulai dump database ${DB_NAME}..."

# Eksekusi mysqldump langsung dikompresi gzip
mysqldump -u "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "[$(date "+%Y-%m-%d %H:%M:%S")] [ASM-BACKUP] Sukses! File tersimpan di: ${BACKUP_FILE}"
else
  echo "[$(date "+%Y-%m-%d %H:%M:%S")] [ASM-BACKUP] Gagal melakukan dump database!"
fi

# Rotasi backup: Hapus file backup yang lebih tua dari 7 hari
find "${BACKUP_DIR}" -type f -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "[$(date "+%Y-%m-%d %H:%M:%S")] [ASM-BACKUP] Rotasi 7 hari selesai."
