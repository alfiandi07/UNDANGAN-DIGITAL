import type { RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import type { Template } from "../models/template.js";

type BarisTemplate = RowDataPacket & Template;

export async function semuaTemplates(kategori?: string): Promise<Template[]> {
  let query = "SELECT * FROM templates WHERE is_active = TRUE";
  const params: string[] = [];

  if (kategori && kategori !== "all" && kategori !== "Semua") {
    query += " AND category = ?";
    params.push(kategori);
  }

  query += " ORDER BY id ASC";

  const [rows] = await pool.execute<BarisTemplate[]>(query, params);
  return rows;
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
