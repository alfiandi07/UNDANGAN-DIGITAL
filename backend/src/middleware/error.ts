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
    res.status(409).json({ error: "Nama produk sudah ada" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan di server" });
}
