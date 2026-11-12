#!/bin/bash
# ========================================================
# ASM.INVITATION - CRONJOB PEMBERSIH SERVER OTOMATIS (FR-E3)
# Dijalankan setiap hari pukul 02:00 WIB via Crontab Linux
# ========================================================

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
API_URL="http://localhost:3001/api/finance/cleanup-now"

echo "[${TIMESTAMP}] [ASM-CRON] Memulai pembersihan otomatis undangan kedaluwarsa..."

# Panggil endpoint pembersih internal
RESPONSE=$(curl -s -X POST "${API_URL}" -H "Content-Type: application/json")

echo "[${TIMESTAMP}] [ASM-CRON] Hasil: ${RESPONSE}"
echo "[${TIMESTAMP}] [ASM-CRON] Selesai."
