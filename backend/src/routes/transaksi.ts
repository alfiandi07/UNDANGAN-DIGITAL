import { Router } from "express";
import * as transaksi from "../controller/transaksi.js";

export const transaksiRouter = Router();

transaksiRouter.post("/", transaksi.tambah); // POST /api/transaksi
transaksiRouter.get("/", transaksi.daftar); // GET /api/transaksi
transaksiRouter.get("/:id", transaksi.detail); // GET /api/transaksi/:id
