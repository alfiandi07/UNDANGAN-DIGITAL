import crypto from "crypto";

export type TokenPayload = {
  id: number;
  email: string;
  peran: "admin" | "user";
  exp: number; // Unix timestamp in seconds
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY ERROR: JWT_SECRET wajib dikonfigurasi di file .env pada environment produksi! Server dihentikan demi keamanan."
      );
    }
    console.warn(
      "[SECURITY WARNING] JWT_SECRET tidak ditemukan di .env. Menggunakan runtime random secret untuk sesi development lokal."
    );
    // Hasilkan random secret 64-char unik setiap restart jika di dev dan belum pasang .env
    return crypto.randomBytes(32).toString("hex");
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Generate standard RFC 7519 HMAC-SHA256 JWT using Node.js crypto
 * Default validity: 7 days
 */
export function signToken(
  user: { id: number; email: string; peran: "admin" | "user" },
  expiresInSeconds = 7 * 24 * 60 * 60
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: TokenPayload = {
    id: user.id,
    email: user.email.toLowerCase(),
    peran: user.peran,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signatureInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${signature}`;
}

/**
 * Verify and decode HMAC-SHA256 JWT
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(signatureInput)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== "number" || payload.exp < now) {
      return null; // Missing or expired exp
    }

    return payload;
  } catch {
    return null;
  }
}

