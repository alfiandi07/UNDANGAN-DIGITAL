/**
 * Helper untuk sanitasi URL tautan (mencegah XSS via skema javascript:, data:, vbscript:, serta open redirect via //protocol-relative URL)
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return "#";
  const clean = url.trim();
  // Hanya izinkan http://, https://, mailto:, tel:, dan relative path (/) yang TIDAK diikuti oleh / atau \
  if (/^(https?:\/\/|\/(?!\/|\\)|mailto:|tel:)/i.test(clean)) {
    return clean;
  }
  return "#";
}

