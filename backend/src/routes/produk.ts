import { Router } from "express";
import * as produk from "../controller/produk.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const produkRouter = Router();

produkRouter.get("/", produk.daftar); // GET /api/produk (Public)
produkRouter.get("/:id", produk.detail); // GET /api/produk/:id (Public)

// Modifikasi produk khusus Admin
produkRouter.post("/", authMiddleware, requireAdmin, produk.tambah); // POST /api/produk
produkRouter.put("/:id", authMiddleware, requireAdmin, produk.ubah); // PUT /api/produk/:id
produkRouter.delete("/:id", authMiddleware, requireAdmin, produk.hapus); // DELETE /api/produk/:id
