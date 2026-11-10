import type { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export async function buatTransaksi(
  idPengguna: number,
  items: { id_produk: number; jumlah: number; harga: number }[],
  total: number,
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Simpan header transaksi
    const [resHeader]: any = await conn.execute(
      "INSERT INTO transaksi (id_pengguna, total_harga, status) VALUES (?, ?, 'sukses')",
      [idPengguna, total],
    );
    const idTransaksi = resHeader.insertId;

    // 2. Simpan setiap item detail & kurangi stok
    for (const item of items) {
      await conn.execute(
        "INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, harga_satuan) VALUES (?, ?, ?, ?)",
        [idTransaksi, item.id_produk, item.jumlah, item.harga],
      );

      // Kurangi stok produk
      await conn.execute(
        "UPDATE produk SET stok = stok - ? WHERE id = ? AND stok >= ?",
        [item.jumlah, item.id_produk, item.jumlah],
      );
    }

    await conn.commit();
    return { id: idTransaksi, status: "sukses", total_harga: total };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function semuaTransaksi(): Promise<RowDataPacket[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, id_pengguna, total_harga, status, created_at FROM transaksi ORDER BY id DESC",
  );
  return rows;
}

export async function cariTransaksi(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, id_pengguna, total_harga, status, created_at FROM transaksi WHERE id = ?",
    [id],
  );
  if (rows.length === 0) return null;

  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT dt.id_produk, p.nama, dt.jumlah, dt.harga_satuan, (dt.jumlah * dt.harga_satuan) AS subtotal
     FROM detail_transaksi dt
     JOIN produk p ON dt.id_produk = p.id
     WHERE dt.id_transaksi = ?`,
    [id],
  );

  return {
    ...rows[0],
    items,
  };
}

