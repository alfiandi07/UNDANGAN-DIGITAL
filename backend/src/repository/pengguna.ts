import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import type { Pengguna, Peran } from "../models/pengguna.js";
type BarisPengguna = RowDataPacket & Pengguna & { password: string };
export async function semuaPengguna(): Promise<Pengguna[]> {
  const [rows] = await pool.execute<BarisPengguna[]>(
    "SELECT id, nama, email, peran FROM pengguna ORDER BY id",
  );
  return rows.map((r) => ({
    id: r.id,
    nama: r.nama,
    email: r.email,
    peran: r.peran,
  }));
}
// Dipakai saat login: ikut mengambil hash password
export async function cariPenggunaByEmail(
  email: string,
): Promise<BarisPengguna | null> {
  const [rows] = await pool.execute<BarisPengguna[]>(
    "SELECT id, nama, email, password, peran FROM pengguna WHERE email = ?",

    [email],
  );
  return rows.length > 0 ? rows[0] : null;
}
export async function tambahPengguna(
  nama: string,
  email: string,
  hash: string,
  peran: Peran,
): Promise<Pengguna> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    "INSERT INTO pengguna (nama, email, password, peran) VALUES (?, ?, ?, ?)",
    [nama, email, hash, peran],
  );
  return { id: hasil.insertId, nama, email, peran };
}
