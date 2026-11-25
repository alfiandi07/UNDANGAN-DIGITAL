import type { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const clients = new Map<string, ClientRecord>();

  // Pembersihan berkala memori setiap 60 detik agar tidak ada memory leak
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, 60 * 1000);

  // Unref agar tidak menahan proses Node.js saat shutdown/test
  if (interval.unref) {
    interval.unref();
  }

  return function rateLimiterMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Gunakan req.ip (yang telah divalidasi oleh Express trust proxy) untuk mencegah spoofing X-Forwarded-For
    const ip = req.ip || req.socket.remoteAddress || "unknown-client";

    const now = Date.now();
    const record = clients.get(ip);

    if (!record || now > record.resetTime) {
      clients.set(ip, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      next();
      return;
    }

    if (record.count >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        error: options.message,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// 1. Rate limiter untuk Login: Maksimal 5 percobaan gagal/akses per 15 menit per IP
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Terlalu banyak percobaan login. Akses dibatasi sementara selama 15 menit demi keamanan.",
});

// 2. Rate limiter untuk OTP Verifikasi & Reset Password: Maksimal 5 percobaan per 15 menit
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Terlalu banyak permintaan verifikasi kode OTP. Silakan tunggu beberapa saat lagi.",
});

// 3. Rate limiter untuk Ucapan & RSVP Tamu: Maksimal 10 ucapan per 5 menit per IP (mencegah spam bot)
export const rsvpRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: "Terlalu banyak pengiriman ucapan dari perangkat Anda. Silakan tunggu 5 menit sebelum mengirim kembali.",
});

// 4. Rate limiter untuk Pemesanan / Checkout: Maksimal 5 pesanan per 10 menit per IP (mencegah spam pesanan/slug locking)
export const orderRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: "Terlalu banyak pembuatan pesanan dalam waktu singkat. Silakan tunggu beberapa saat.",
});

// 5. Rate limiter untuk Registrasi Akun: Maksimal 5 pendaftaran per 15 menit per IP (mencegah spam OTP email)
export const registerRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Terlalu banyak pendaftaran akun dari perangkat Anda. Silakan tunggu 15 menit.",
});

