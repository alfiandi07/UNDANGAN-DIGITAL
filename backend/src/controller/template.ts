import type { Request, Response } from "express";
import * as repo from "../repository/template.js";

// GET /api/templates
export async function daftar(req: Request, res: Response) {
  try {
    const kategori = typeof req.query.category === "string" ? req.query.category : undefined;
    const data = await repo.semuaTemplates(kategori);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil daftar template" });
  }
}

// GET /api/templates/admin/semua
export async function daftarAdmin(_req: Request, res: Response) {
  try {
    const data = await repo.semuaTemplatesAdmin();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data template untuk admin" });
  }
}

// POST /api/templates
export async function tambah(req: Request, res: Response) {
  try {
    const {
      slug,
      title,
      category,
      theme_style,
      thumbnail_url,
      demo_url,
      price_basic,
      price_standard,
      price_special,
      is_active,
    } = req.body ?? {};

    if (!title || !slug) {
      res.status(400).json({ error: "Judul dan slug template wajib diisi" });
      return;
    }

    const created = await repo.tambahTemplate({
      slug: String(slug).trim().toLowerCase(),
      title: String(title).trim(),
      category: category || "wedding",
      theme_style: String(theme_style ?? "Modern").trim(),
      thumbnail_url: String(thumbnail_url ?? "").trim(),
      demo_url: String(demo_url ?? `/demo/${slug}`).trim(),
      price_basic: Number(price_basic) || 79000,
      price_standard: Number(price_standard) || 99000,
      price_special: Number(price_special) || 120000,
      is_active: is_active ?? true,
    });

    res.status(201).json(created);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal menambah template";
    res.status(500).json({ error: msg });
  }
}

// PUT /api/templates/:id
export async function ubah(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json({ error: "ID template tidak valid" });
      return;
    }

    const updated = await repo.ubahTemplate(id, req.body ?? {});
    if (!updated) {
      res.status(404).json({ error: "Template tidak ditemukan" });
      return;
    }

    res.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui template";
    res.status(500).json({ error: msg });
  }
}

// DELETE /api/templates/:id
export async function hapus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json({ error: "ID template tidak valid" });
      return;
    }

    const success = await repo.hapusTemplate(id);
    if (!success) {
      res.status(404).json({ error: "Template tidak ditemukan" });
      return;
    }

    res.json({ message: "Template berhasil dihapus" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus template";
    res.status(500).json({ error: msg });
  }
}

// GET /api/templates/:slug
export async function detail(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const template = await repo.cariTemplateBySlug(slug);

    if (!template) {
      res.status(404).json({ error: "Template tidak ditemukan" });
      return;
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil detail template" });
  }
}

// POST /api/check-slug (PRD FR-A3)
export async function checkSlug(req: Request, res: Response) {
  try {
    const rawSlug = String(req.body?.slug ?? "").trim().toLowerCase();
    
    // Normalisasi slug: hanya huruf kecil, angka, dan tanda strip (-)
    const slug = rawSlug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    if (!slug || slug.length < 3) {
      res.status(400).json({
        available: false,
        error: "Slug minimal 3 karakter (hanya huruf, angka, dan tanda -)",
      });
      return;
    }

    const available = await repo.isSlugTersedia(slug);

    res.json({
      slug,
      available,
      message: available
        ? `Tautan undang_an.digital/${slug} tersedia!`
        : `Tautan undang_an.digital/${slug} sudah digunakan oleh pengantin lain.`,
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal memeriksa ketersediaan tautan" });
  }
}
