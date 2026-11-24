import { Router } from "express";
import * as transaksi from "../controller/transaksi.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const transaksiRouter = Router();

// Seluruh akses ke transaksi dilindungi khusus Administrator
transaksiRouter.use(authMiddleware, requireAdmin);

transaksiRouter.post("/", transaksi.tambah); // POST /api/transaksi
transaksiRouter.get("/", transaksi.daftar); // GET /api/transaksi
transaksiRouter.get("/:id", transaksi.detail); // GET /api/transaksi/:id
