import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../lib/auth.js";
import { cariInvitationBySlug } from "../repository/order.js";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Validasi JWT Bearer token dari header Authorization
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali." });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: "Token autentikasi tidak valid atau sudah kedaluwarsa. Silakan login kembali." });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Memastikan pengguna memiliki peran Admin
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.peran !== "admin") {
    res.status(403).json({ error: "Akses ditolak: Fitur ini khusus untuk Administrator sistem." });
    return;
  }
  next();
}

/**
 * Memastikan pengguna adalah Pemilik Asli Undangan (berdasarkan email pesanan) atau Admin
 */
export async function requireOwnerOrAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const slug = String(req.params.slug || "");
  if (!slug) {
    res.status(400).json({ error: "Slug undangan tidak ditemukan" });
    return;
  }

  const invitation = await cariInvitationBySlug(slug);
  if (!invitation) {
    res.status(404).json({ error: "Undangan tidak ditemukan" });
    return;
  }

  // Jika admin, beri izin penuh
  if (req.user?.peran === "admin") {
    next();
    return;
  }

  // Cek apakah email user yang login sama dengan email pemesan undangan
  const userEmail = (req.user?.email || "").toLowerCase();
  const ownerEmail = (invitation.buyer_email || "").toLowerCase();

  if (!userEmail || userEmail !== ownerEmail) {
    res.status(403).json({
      error: "Akses ditolak: Anda tidak memiliki izin untuk mengubah data undangan ini.",
    });
    return;
  }

  next();
}

