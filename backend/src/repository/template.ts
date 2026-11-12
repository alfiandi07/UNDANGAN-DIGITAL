import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db.js";
import type { Template, DataTemplate } from "../models/template.js";

type BarisTemplate = RowDataPacket & Template;

export async function semuaTemplates(kategori?: string, packageType?: string): Promise<Template[]> {
  let query = "SELECT * FROM templates WHERE is_active = TRUE";
  const params: string[] = [];

  if (kategori && kategori !== "all" && kategori !== "Semua") {
    query += " AND category = ?";
    params.push(kategori);
  }

  if (packageType && packageType !== "all" && packageType !== "Semua") {
    query += " AND package_type = ?";
    params.push(packageType);
  }

  query += " ORDER BY id ASC";

  const [rows] = await pool.execute<BarisTemplate[]>(query, params);
  return rows;
}

export async function semuaTemplatesAdmin(): Promise<Template[]> {
  const [rows] = await pool.execute<BarisTemplate[]>(
    "SELECT * FROM templates ORDER BY id DESC"
  );
  return rows;
}

export async function cariTemplateById(id: number): Promise<Template | null> {
  const [rows] = await pool.execute<BarisTemplate[]>(
    "SELECT * FROM templates WHERE id = ?",
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function cariTemplateBySlug(slug: string): Promise<Template | null> {
  const [rows] = await pool.execute<BarisTemplate[]>(
    "SELECT * FROM templates WHERE slug = ? AND is_active = TRUE",
    [slug],
  );
  return rows.length > 0 ? rows[0] : null;
}

// Cek apakah slug undangan sudah pernah dipakai oleh pengantin/klien lain di tabel invitations
export async function isSlugTersedia(slug: string): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM invitations WHERE slug = ?",
    [slug],
  );
  return rows.length === 0;
}

export async function tambahTemplate(data: DataTemplate): Promise<Template> {
  const isActive = data.is_active ?? true;
  const packageType = data.package_type || "standard";
  const finalPrice = Number(data.price) || Number(data.price_standard) || 99000;

  const [res] = await pool.execute<ResultSetHeader>(
    `INSERT INTO templates (slug, title, category, package_type, price, theme_style, thumbnail_url, demo_url, price_basic, price_standard, price_special, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.category,
      packageType,
      finalPrice,
      data.theme_style,
      data.thumbnail_url || "",
      data.demo_url || `/demo/${data.slug}`,
      data.price_basic || finalPrice,
      data.price_standard || finalPrice,
      data.price_special || finalPrice,
      isActive,
    ]
  );
  const created = await cariTemplateById(res.insertId);
  if (!created) throw new Error("Gagal mengambil data template yang baru dibuat");
  return created;
}

export async function ubahTemplate(id: number, data: Partial<DataTemplate>): Promise<Template | null> {
  const existing = await cariTemplateById(id);
  if (!existing) return null;

  const slug = data.slug ?? existing.slug;
  const title = data.title ?? existing.title;
  const category = data.category ?? existing.category;
  const package_type = data.package_type ?? existing.package_type ?? "standard";
  const price = data.price ?? existing.price ?? existing.price_standard ?? 99000;
  const theme_style = data.theme_style ?? existing.theme_style;
  const thumbnail_url = data.thumbnail_url ?? existing.thumbnail_url;
  const demo_url = data.demo_url ?? existing.demo_url;
  const price_basic = data.price_basic ?? existing.price_basic;
  const price_standard = data.price_standard ?? existing.price_standard;
  const price_special = data.price_special ?? existing.price_special;
  const is_active = data.is_active ?? existing.is_active;

  await pool.execute(
    `UPDATE templates 
     SET slug = ?, title = ?, category = ?, package_type = ?, price = ?, theme_style = ?, thumbnail_url = ?, demo_url = ?, price_basic = ?, price_standard = ?, price_special = ?, is_active = ?
     WHERE id = ?`,
    [
      slug,
      title,
      category,
      package_type,
      price,
      theme_style,
      thumbnail_url,
      demo_url,
      price_basic,
      price_standard,
      price_special,
      is_active,
      id,
    ]
  );

  return cariTemplateById(id);
}

export async function hapusTemplate(id: number): Promise<boolean> {
  const [res] = await pool.execute<ResultSetHeader>(
    "DELETE FROM templates WHERE id = ?",
    [id]
  );
  return res.affectedRows > 0;
}

