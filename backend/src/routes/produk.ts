import { Router } from "express";
import * as produk from "../controller/produk.js";
export const produkRouter = Router();
produkRouter.get(
  "/",

  produk.daftar,
); // GET /api/produk

produkRouter.get(
  "/:id",

  produk.detail,
); // GET /api/produk/1

produkRouter.post(
  "/",

  produk.tambah,
); // POST /api/produk

produkRouter.put(
  "/:id",

  produk.ubah,
); // PUT /api/produk/1

produkRouter.delete(
  "/:id",

  produk.hapus,
); // DELETE /api/produk/1
