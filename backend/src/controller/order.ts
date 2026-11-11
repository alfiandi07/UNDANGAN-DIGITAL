import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as repo from "../repository/order.js";
import * as templateRepo from "../repository/template.js";
import * as userRepo from "../repository/pengguna.js";
import type { PackageType } from "../models/order.js";

function hitungMasaAktif(packageType: PackageType): Date {
  const now = new Date();
  if (packageType === "basic") {
    now.setMonth(now.getMonth() + 3); // 3 bulan
  } else if (packageType === "standard") {
    now.setMonth(now.getMonth() + 6); // 6 bulan
  } else {
    now.setFullYear(now.getFullYear() + 1); // 12 bulan (1 tahun)
  }
  return now;
}

// POST /api/orders (Checkout & Buat Pesanan)
export async function createOrder(req: Request, res: Response) {
  try {
    const {
      buyer_name,
      buyer_whatsapp,
      buyer_email,
      password,
      template_id,
      package_type,
      slug,
    } = req.body ?? {};

    if (!buyer_name || !buyer_whatsapp || !buyer_email || !password || !template_id || !slug) {
      res.status(400).json({ error: "Seluruh kolom wajib diisi lengkap" });
      return;
    }

    // 1. Normalisasi & Validasi Slug
    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (cleanSlug.length < 3) {
      res.status(400).json({ error: "Slug minimal 3 karakter (hanya huruf, angka, dan strip -)" });
      return;
    }

    const slugTersedia = await templateRepo.isSlugTersedia(cleanSlug);
    if (!slugTersedia) {
      res.status(400).json({ error: `Tautan tautan/${cleanSlug} sudah digunakan, silakan pilih slug lain.` });
      return;
    }

    // 2. Ambil detail template & hitung harga sesuai paket PRD
    const template = await templateRepo.cariTemplateById(Number(template_id));
    if (!template) {
      res.status(404).json({ error: "Template tidak ditemukan" });
      return;
    }

    const pkg: PackageType =
      package_type === "standard" || package_type === "special" ? package_type : "basic";

    let grossAmount = template.price_basic;
    let maxPhotos = 15;

    if (pkg === "standard") {
      grossAmount = template.price_standard;
      maxPhotos = 15;
    } else if (pkg === "special") {
      grossAmount = template.price_special;
      maxPhotos = 30;
    }

    const expiresAt = hitungMasaAktif(pkg);

    // 3. Hash password pembeli & daftarkan ke tabel pengguna agar bisa login
    const passwordHash = await bcrypt.hash(String(password), 10);
    const existingUser = await userRepo.cariPenggunaByEmail(String(buyer_email).trim());
    if (!existingUser) {
      await userRepo.tambahPengguna(
        String(buyer_name).trim(),
        String(buyer_email).trim(),
        passwordHash,
        "user"
      );
    }

    // 4. Generate order_id unik: ASM-YYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderId = `ASM-${dateStr}-${randomHex}`;

    // 5. Inisialisasi draf detail acara awal
    const initialEventDetails = {
      title: `${template.title} - ${buyer_name}`,
      mempelai: {
        pria: { nama: "", panggilan: "", ayah: "", ibu: "" },
        wanita: { nama: "", panggilan: "", ayah: "", ibu: "" },
      },
      akad: { tanggal: "", jam: "", lokasi: "", alamat: "", maps_url: "" },
      resepsi: { tanggal: "", jam: "", lokasi: "", alamat: "", maps_url: "" },
      music_url: "",
      amplop: [],
      photos: [],
      love_story: [],
    };

    const { order, invitation } = await repo.buatOrderDanUndangan({
      order_id: orderId,
      buyer_name: String(buyer_name).trim(),
      buyer_whatsapp: String(buyer_whatsapp).trim(),
      buyer_email: String(buyer_email).trim(),
      password_hash: passwordHash,
      template_id: template.id,
      package_type: pkg,
      gross_amount: grossAmount,
      slug: cleanSlug,
      max_photos: maxPhotos,
      expires_at: expiresAt,
      initial_event_details: initialEventDetails,
    });

    // 6. Midtrans Snap Token Integration
    let snapToken = "";
    let redirectUrl = "";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (serverKey) {
      try {
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
        const snapApiUrl = isProduction
          ? "https://app.midtrans.com/snap/v1/transactions"
          : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        const snapResponse = await fetch(snapApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderId,
              gross_amount: grossAmount,
            },
            customer_details: {
              first_name: buyer_name,
              email: buyer_email,
              phone: buyer_whatsapp,
            },
            item_details: [
              {
                id: template.slug,
                price: grossAmount,
                quantity: 1,
                name: `${template.title} (${pkg.toUpperCase()})`.slice(0, 50),
              },
            ],
          }),
        });

        if (snapResponse.ok) {
          const snapData = (await snapResponse.json()) as { token?: string; redirect_url?: string };
          snapToken = snapData.token ?? "";
          redirectUrl = snapData.redirect_url ?? "";
        }
      } catch (e) {
        console.warn("Midtrans API call failed, falling back to simulator:", e);
      }
    }

    // Fallback snap token untuk simulasi lokal / sandbox
    if (!snapToken) {
      snapToken = `SNAP-SIM-${orderId}`;
      redirectUrl = `/bayar-simulasi/${orderId}`;
    }

    res.status(201).json({
      success: true,
      order,
      invitation,
      snap_token: snapToken,
      redirect_url: redirectUrl,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    let pesanError = "Terjadi kendala pada server saat memproses pesanan. Silakan coba kembali beberapa saat lagi.";
    if (err instanceof Error) {
      const msg = err.message;
      if (msg.includes("Duplicate entry") || (err as { code?: string }).code === "ER_DUP_ENTRY") {
        pesanError = "Tautan undangan ini sudah pernah digunakan oleh pengantin lain. Silakan pilih tautan (slug) lain.";
      } else if (!msg.includes("Table") && !msg.includes("SQL") && !msg.includes("doesn't exist")) {
        pesanError = msg;
      }
    }
    res.status(500).json({ error: pesanError });
  }
}

// POST /api/payment/webhook (Midtrans Callback FR-B2)
export async function midtransWebhook(req: Request, res: Response) {
  try {
    const { order_id, transaction_status, fraud_status, status_code, signature_key, gross_amount } =
      req.body ?? {};

    if (!order_id) {
      res.status(400).json({ error: "Missing order_id" });
      return;
    }

    // Verifikasi signature jika Server Key tersedia (NFR-3 SHA-512)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && signature_key) {
      const payload = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const expectedSignature = crypto.createHash("sha512").update(payload).digest("hex");
      if (signature_key !== expectedSignature) {
        res.status(403).json({ error: "Invalid signature key" });
        return;
      }
    }

    // Cek status pembayaran
    const isPaid =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isPaid) {
      const order = await repo.cariOrderByOrderId(String(order_id));
      if (order) {
        const expiresAt = hitungMasaAktif(order.package_type);
        await repo.setOrderPaid(order.order_id, expiresAt);
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Midtrans webhook error:", err);
    res.status(500).json({ error: "Webhook processing error" });
  }
}

// POST /api/orders/:orderId/simulasi-bayar (Untuk pengujian instan tanpa kartu kredit)
export async function simulasiBayar(req: Request, res: Response) {
  try {
    const orderId = String(req.params.orderId);
    const order = await repo.cariOrderByOrderId(orderId);
    if (!order) {
      res.status(404).json({ error: "Pesanan tidak ditemukan" });
      return;
    }

    const expiresAt = hitungMasaAktif(order.package_type);
    await repo.setOrderPaid(orderId, expiresAt);

    res.json({
      success: true,
      message: `Pesanan ${orderId} berhasil diaktifkan (Status: PAID)!`,
      order: await repo.cariOrderByOrderId(orderId),
      invitation: await repo.cariInvitationByOrderId(orderId),
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal simulasi pembayaran" });
  }
}

// GET /api/orders/my-orders (Pesanan & Undangan milik pembeli yang login)
export async function getBuyerOrders(req: Request, res: Response) {
  try {
    const email = String(req.query.email ?? "").trim();
    if (!email) {
      res.status(400).json({ error: "Email pembeli diperlukan" });
      return;
    }
    const orders = await repo.semuaOrdersByEmail(email);
    const invitations = await repo.semuaInvitationsByEmail(email);
    res.json({ orders, invitations });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data pesanan pembeli" });
  }
}

// GET /api/orders/admin/all (Semua pesanan untuk Admin Panel)
export async function getAllOrdersAdmin(_req: Request, res: Response) {
  try {
    const orders = await repo.semuaOrdersAdmin();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil daftar pesanan untuk admin" });
  }
}

// GET /api/orders/:orderId
export async function getOrderDetail(req: Request, res: Response) {
  try {
    const orderId = String(req.params.orderId);
    const order = await repo.cariOrderByOrderId(orderId);
    if (!order) {
      res.status(404).json({ error: "Pesanan tidak ditemukan" });
      return;
    }
    const invitation = await repo.cariInvitationByOrderId(orderId);
    res.json({ order, invitation });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil detail pesanan" });
  }
}

// GET /api/invitations/:slug (Ambil detail undangan untuk Editor & Tampilan Tamu)
export async function getInvitationBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const invitation = await repo.cariInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }
    res.json(invitation);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data undangan" });
  }
}

// PUT /api/invitations/:slug (Simpan Data Acara & Foto - PRD Modul C)
export async function saveEventDetails(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const invitation = await repo.cariInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }

    const { event_details } = req.body ?? {};
    if (!event_details || typeof event_details !== "object") {
      res.status(400).json({ error: "Format data acara tidak valid" });
      return;
    }

    // FR-C2: Photo Quota Enforcer Middleware check
    const photos: string[] = Array.isArray(event_details.photos) ? event_details.photos : [];
    if (photos.length > invitation.max_photos) {
      res.status(400).json({
        error: `Kuota foto terlampaui! Batas maksimal untuk Paket ${invitation.package_type.toUpperCase()} adalah ${invitation.max_photos} foto (Anda mengunggah ${photos.length} foto).`,
      });
      return;
    }

    const updated = await repo.updateEventDetails(slug, event_details, photos.length);
    res.json({
      success: true,
      message: "Data acara berhasil disimpan!",
      invitation: updated,
    });
  } catch (err) {
    console.error("Save event error:", err);
    res.status(500).json({ error: "Gagal menyimpan detail acara" });
  }
}

