/**
 * Helper untuk sanitasi URL tautan (mencegah XSS via skema javascript:, data:, atau vbscript:)
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return "#";
  const clean = url.trim();
  // Hanya izinkan http, https, mailto, tel, dan relative path (/)
  if (/^(https?:\/\/|\/|mailto:|tel:)/i.test(clean)) {
    return clean;
  }
  return "#";
}
