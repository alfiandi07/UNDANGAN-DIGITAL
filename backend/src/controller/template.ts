import type { Request, Response } from "express";
import * as repo from "../repository/template.js";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/templates
export async function daftar(req: Request, res: Response) {
  try {
    const kategori =
      typeof req.query.category === "string" ? req.query.category : undefined;
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
    res
      .status(500)
      .json({ error: "Gagal mengambil data template untuk admin" });
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
    const msg =
      err instanceof Error ? err.message : "Gagal memperbarui template";
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
    const rawSlug = String(req.body?.slug ?? "")
      .trim()
      .toLowerCase();

    // Normalisasi slug: hanya huruf kecil, angka, dan tanda strip (-)
    const slug = rawSlug
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

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

// POST /api/templates/upload-zip (PRD: Zip Template Engine)
export async function uploadZipHandler(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "File .zip template wajib diunggah!" });
      return;
    }

    const {
      title,
      slug: rawSlug,
      category,
      package_type,
      price,
      theme_style,
      thumbnail_url,
    } = req.body ?? {};

    if (!title) {
      res.status(400).json({ error: "Judul template wajib diisi!" });
      return;
    }

    // Normalisasi slug
    const cleanSlug = String(rawSlug || title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug || cleanSlug.length < 3) {
      res.status(400).json({ error: "Slug tidak valid atau kurang dari 3 karakter!" });
      return;
    }

    // 1. Ekstrak file zip dengan AdmZip
    const zip = new AdmZip(file.buffer);
    const zipEntries = zip.getEntries();

    // Verifikasi: apakah ada index.html di dalam zip?
    const hasIndexHtml = zipEntries.some(
      (entry: any) =>
        entry.entryName.toLowerCase() === "index.html" ||
        entry.entryName.toLowerCase().endsWith("/index.html")
    );

    if (!hasIndexHtml) {
      res.status(400).json({
        error:
          "File .zip tidak valid! Di dalam file zip wajib terdapat file 'index.html' sebagai halaman utama desain.",
      });
      return;
    }

    // Target folder ekstraksi: backend/public/templates/[slug]
    const targetDir = path.join(__dirname, "../../public/templates", cleanSlug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Ekstrak seluruh isi file zip
    zip.extractAllTo(targetDir, true);

    // Cari letak index.html (bisa di root zip atau di dalam subfolder)
    let demoPath = `/templates/${cleanSlug}/index.html`;
    const rootIndex = zipEntries.find(
      (e: any) => e.entryName.toLowerCase() === "index.html"
    );
    if (!rootIndex) {
      const nestedIndex = zipEntries.find((e: any) =>
        e.entryName.toLowerCase().endsWith("/index.html")
      );
      if (nestedIndex) {
        demoPath = `/templates/${cleanSlug}/${nestedIndex.entryName}`;
      }
    }

    const pkgType = package_type === "premium" ? "premium" : "standard";
    const finalPrice = Number(price) || (pkgType === "premium" ? 149000 : 79000);

    // Cek apakah template dengan slug ini sudah ada di database
    const existing = await repo.cariTemplateBySlug(cleanSlug);
    let result;

    if (existing) {
      result = await repo.ubahTemplate(existing.id, {
        title: String(title).trim(),
        category: category || existing.category,
        package_type: pkgType,
        price: finalPrice,
        theme_style: String(theme_style || existing.theme_style).trim(),
        thumbnail_url: String(thumbnail_url || existing.thumbnail_url).trim(),
        demo_url: demoPath,
        price_basic: finalPrice,
        price_standard: finalPrice,
        price_special: finalPrice,
      });
    } else {
      result = await repo.tambahTemplate({
        slug: cleanSlug,
        title: String(title).trim(),
        category: category || "wedding",
        package_type: pkgType,
        price: finalPrice,
        theme_style: String(theme_style || "Custom ZIP").trim(),
        thumbnail_url: String(thumbnail_url || "").trim(),
        demo_url: demoPath,
        price_basic: finalPrice,
        price_standard: finalPrice,
        price_special: finalPrice,
        is_active: true,
      });
    }

    res.status(201).json({
      success: true,
      message: `Template "${title}" berhasil diekstrak dan disimpan!`,
      demo_url: demoPath,
      template: result,
    });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal memproses upload file zip template";
    res.status(500).json({ error: msg });
  }
}

// POST /api/templates/upload-cover
export async function uploadCoverHandler(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "Berkas gambar cover wajib diunggah" });
      return;
    }

    const targetDir = path.join(__dirname, "../../public/covers");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || ".jpg";
    const cleanExt = ext.startsWith(".") ? ext : `.${ext}`;
    const filename = `cover-${Date.now()}-${Math.floor(Math.random() * 10000)}${cleanExt}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const publicUrl = `/covers/${filename}`;

    res.status(201).json({
      success: true,
      message: "Foto cover template berhasil diunggah",
      url: publicUrl,
    });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal mengunggah foto cover template";
    res.status(500).json({ error: msg });
  }
}
