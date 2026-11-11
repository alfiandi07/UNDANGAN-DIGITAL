import "dotenv/config"; // WAJIB baris pertama: isi .env dibaca sebelum db.ts
import express from "express";
import { pool } from "./db.js";
import { produkRouter } from "./routes/produk.js";
import { authRouter, penggunaRouter } from "./routes/pengguna.js";
import { errorHandler } from "./middleware/error.js";
import { transaksiRouter } from "./routes/transaksi.js";
import { templateRouter } from "./routes/template.js";
import { checkSlug } from "./controller/template.js";
const app = express();
const PORT = Number(process.env.PORT ?? 3001);
app.use(express.json());
app.get(
  "/api/cek",

  async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",

      database: "terhubung",
    });
  },
);
// Tiga router dipasang: /api/produk,api/auth, /api/pengguna, /api/transaksi.
app.use(
  "/api/produk",

  produkRouter,
);

app.use(
  "/api/auth",

  authRouter,
);

app.use(
  "/api/pengguna",

  penggunaRouter,
);
app.use("/api/transaksi", transaksiRouter);
app.use("/api/templates", templateRouter); // GET /api/templates
app.post("/api/check-slug", checkSlug); // POST /api/check-slug (PRD FR-A3)

// Urutan penting: route → 404 → errorHandler paling akhir
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// listen(PORT): server mulai menerima request.
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`API UndanganDigital jalan di http://localhost:${PORT}`);
});
