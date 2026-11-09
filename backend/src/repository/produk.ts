import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import { Produk } from "../models/produk.js";
import type { DataProduk } from "../models/produk.js";
type BarisProduk = RowDataPacket & {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  kategory: string;
};
export async function semuaProduk(): Promise<Produk[]> {
  const [rows] = await pool.execute<BarisProduk[]>(
    "SELECT id, nama, harga, stok FROM produk ORDER BY id",
  );
  return rows.map((r) => Produk.fromJSON(r));
}
export async function cariProduk(id: number): Promise<Produk | null> {
  const [rows] = await pool.execute<BarisProduk[]>(
    "SELECT id, nama, harga, stok FROM produk WHERE id = ?",

    [id],
  );
  return rows.length > 0 ? Produk.fromJSON(rows[0]) : null;
}
export async function tambahProduk(data: DataProduk): Promise<Produk> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    "INSERT INTO produk (nama, harga, stok) VALUES (?, ?, ?)",
    [data.nama, data.harga, data.stok],
  );
  return new Produk(
    hasil.insertId,
    data.nama,
    data.harga,
    data.stok,
    data.kategory,
  );
}
export async function ubahProduk(
  id: number,
  data: DataProduk,
): Promise<Produk | null> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    "UPDATE produk SET nama = ?, harga = ?, stok = ? WHERE id = ?",
    [data.nama, data.harga, data.stok, id],
  );
  return hasil.affectedRows > 0
    ? new Produk(id, data.nama, data.harga, data.stok, data.kategory)
    : null;
}
export async function hapusProduk(id: number): Promise<boolean> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    "DELETE FROM produk WHERE id = ?",

    [id],
  );
  return hasil.affectedRows > 0;
}
