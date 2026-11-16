import dns from "dns/promises";

// Daftar domain email sementara (Disposable/Burner Email) populer
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "sharklasers.com",
  "yopmail.com",
  "yopmail.net",
  "yopmail.fr",
  "throwawaymail.com",
  "dispostable.com",
  "trashmail.com",
  "trashmail.net",
  "getnada.com",
  "inboxkitten.com",
  "burnermail.io",
  "fakeinbox.com",
  "mohmal.com",
  "crazymailing.com",
  "tempail.com",
  "emailondeck.com",
  "generator.email",
  "maildrop.cc",
  "nada.ltd",
  "mytemp.email",
  "tempr.email",
  "discard.email",
  "discardmail.com",
  "spambog.com",
  "fakemailgenerator.com",
]);

/**
 * Validasi apakah format email valid
 */
export function isValidEmailFormat(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email);
}

/**
 * Validasi apakah domain email terdaftar sebagai email sementara
 */
export function isDisposableDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Validasi keberadaan Mail Server (DNS MX Record) pada domain email
 */
export async function hasValidMxRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;

  try {
    const mxRecords = await dns.resolveMx(domain);
    return Boolean(mxRecords && mxRecords.length > 0);
  } catch {
    // Domain tidak ditemukan atau tidak memiliki server penanganan email aktif
    return false;
  }
}

/**
 * Verifikasi lengkap email asli
 */
export async function validateRealEmail(email: string): Promise<{ valid: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Cek format
  if (!cleanEmail || !isValidEmailFormat(cleanEmail)) {
    return { valid: false, error: "Format alamat email tidak valid" };
  }

  // 2. Cek email sementara / disposable
  if (isDisposableDomain(cleanEmail)) {
    return {
      valid: false,
      error: "Alamat email sementara (temporary/burner email) tidak diizinkan. Harap gunakan email asli (Gmail, Yahoo, iCloud, dll).",
    };
  }

  // 3. Cek DNS MX Record
  const mxValid = await hasValidMxRecord(cleanEmail);
  if (!mxValid) {
    return {
      valid: false,
      error: "Domain email tidak valid atau tidak memiliki mail server aktif. Pastikan tidak ada salah ketik pada alamat email Anda.",
    };
  }

  return { valid: true };
}

