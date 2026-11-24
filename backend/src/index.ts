import "dotenv/config"; // WAJIB baris pertama: isi .env dibaca sebelum db.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import { produkRouter } from "./routes/produk.js";
import { authRouter, penggunaRouter } from "./routes/pengguna.js";
import { errorHandler } from "./middleware/error.js";
import { transaksiRouter } from "./routes/transaksi.js";
import { templateRouter } from "./routes/template.js";
import { checkSlug } from "./controller/template.js";
import { orderRouter } from "./routes/order.js";
import {
  midtransWebhook,
  getInvitationBySlug,
  saveEventDetails,
  uploadPhotoHandler,
  deletePhotoHandler,
} from "./controller/order.js";
import { uploadImage } from "./middleware/upload.js";
import { authMiddleware, requireOwnerOrAdmin } from "./middleware/auth.js";
import { daftarRsvps, kirimRsvp } from "./controller/rsvp.js";
import { financeRouter } from "./routes/finance.js";
import { rsvpRateLimiter } from "./middleware/rateLimiter.js";
const app = express();
const PORT = Number(process.env.PORT ?? 3001);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Sajikan folder static template hasil ekstrak ZIP (PRD: Zip Template Engine)
app.use("/templates", express.static(path.join(__dirname, "../public/templates")));
// Sajikan folder static gambar cover template
app.use("/covers", express.static(path.join(__dirname, "../public/covers")));
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
app.get("/api/invitations/:slug", getInvitationBySlug); // PRD Modul C & D (Public Display)
app.put("/api/invitations/:slug", authMiddleware, requireOwnerOrAdmin, saveEventDetails); // PRD Modul C: Editor Acara (Protected: Owner/Admin)
app.post(
  "/api/client/invitations/:slug/photo",
  authMiddleware,
  requireOwnerOrAdmin,
  uploadImage.single("photo"),
  uploadPhotoHandler,
); // PRD FR-C2 & Endpoint 7: Upload Foto Cloudinary (Protected: Owner/Admin)
app.delete("/api/client/invitations/:slug/photo", authMiddleware, requireOwnerOrAdmin, deletePhotoHandler); // Protected: Owner/Admin
app.get("/api/invitations/:slug/rsvps", daftarRsvps); // PRD Modul D: Daftar Ucapan Doa
app.post("/api/invitations/:slug/rsvps", rsvpRateLimiter, kirimRsvp); // PRD Modul D: Submit RSVP & Ucapan Tamu (Protected by RateLimiter)
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
