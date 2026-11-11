import type { NextFunction, Request, Response } from "express";
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const e = err as { code?: string; type?: string };
  if (e.type === "entity.parse.failed") {
    res.status(400).json({ error: "Format JSON salah" });
    return;
  }
  if (e.code === "ER_DUP_ENTRY") {
    res.status(409).json({ error: "Tautan atau data ini sudah terdaftar di sistem. Silakan gunakan nama tautan lain." });
    return;
  }
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Terjadi kendala pada sistem server. Silakan coba beberapa saat lagi." });
}
