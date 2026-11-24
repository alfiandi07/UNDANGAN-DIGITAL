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
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : undefined) ||
      req.ip ||
      req.socket.remoteAddress ||
      "unknown-client";

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

