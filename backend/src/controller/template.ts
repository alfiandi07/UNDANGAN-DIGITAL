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
