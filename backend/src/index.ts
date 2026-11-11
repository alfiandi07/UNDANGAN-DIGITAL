import "dotenv/config"; // WAJIB baris pertama: isi .env dibaca sebelum db.ts
import express from "express";
import { pool } from "./db.js";
import { produkRouter } from "./routes/produk.js";
import { authRouter, penggunaRouter } from "./routes/pengguna.js";
import { errorHandler } from "./middleware/error.js";
import { transaksiRouter } from "./routes/transaksi.js";
import { templateRouter } from "./routes/template.js";
import { checkSlug } from "./controller/template.js";
import { orderRouter } from "./routes/order.js";
import { midtransWebhook, getInvitationBySlug, saveEventDetails } from "./controller/order.js";
import { daftarRsvps, kirimRsvp } from "./controller/rsvp.js";
import { financeRouter } from "./routes/finance.js";
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
// Router dipasang: /api/produk, api/auth, /api/pengguna, /api/transaksi, /api/templates, /api/orders
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
app.use("/api/orders", orderRouter); // PRD Modul B: Checkout & Orders
app.post("/api/payment/webhook", midtransWebhook); // PRD FR-B2: Midtrans Webhook URL standard
app.get("/api/invitations/:slug", getInvitationBySlug); // PRD Modul C & D
app.put("/api/invitations/:slug", saveEventDetails); // PRD Modul C: Editor Acara & Photo Quota
app.get("/api/invitations/:slug/rsvps", daftarRsvps); // PRD Modul D: Daftar Ucapan Doa
app.post("/api/invitations/:slug/rsvps", kirimRsvp); // PRD Modul D: Submit RSVP & Ucapan Tamu
app.use("/api/finance", financeRouter); // PRD Modul E: Laporan Finansial & Auto-Cleanup

// Urutan penting: route → 404 → errorHandler paling akhir
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// listen(PORT): server mulai menerima request.
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`API UndanganDigital jalan di http://localhost:${PORT}`);
});
