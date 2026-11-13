/**
 * ============================================================================
 * UTILS: FORMATTING & HELPER FUNCTIONS
 * Proyek: ASM Undangan Digital (undang_an.digital)
 * ============================================================================
 */

/**
 * [FITUR] Format Angka ke Rupiah (IDR)
 * Contoh: 79000 -> "Rp 79.000"
 */
export function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * [FITUR] Format Tanggal ke Bahasa Indonesia
 * Contoh: "2026-12-20" -> "Sabtu, 20 Desember 2026"
 */
export function formatTanggalIndonesia(tanggalStr: string, withWeekday: boolean = true): string {
  if (!tanggalStr) return "";
  const date = new Date(tanggalStr);
  if (isNaN(date.getTime())) return tanggalStr;

  return date.toLocaleDateString("id-ID", {
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * [FITUR] Pembersih Format Slug Tautan Undangan
 * Hanya mengizinkan huruf kecil a-z, angka 0-9, dan tanda strip (-)
 * Contoh: "Dimas & Dinda!" -> "dimas-dinda"
 */
export function sanitizeSlug(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

