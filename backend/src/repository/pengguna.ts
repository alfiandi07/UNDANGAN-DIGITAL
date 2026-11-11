import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import type { Pengguna, Peran } from "../models/pengguna.js";

type BarisPengguna = RowDataPacket & Pengguna & { password: string };

// Mengambil seluruh pengguna (Admin tim inti + Klien pembeli yang memesan)
export async function semuaPengguna(): Promise<Pengguna[]> {
  const [adminRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name as nama, email, 'admin' as peran FROM admins ORDER BY id ASC"
  );

  const [orderRows] = await pool.execute<RowDataPacket[]>(
    `SELECT MIN(id) as id, buyer_name as nama, buyer_email as email, 'user' as peran
     FROM orders 
     GROUP BY buyer_email, buyer_name
     ORDER BY id DESC`
  );

  const list: Pengguna[] = [];

  for (const r of adminRows) {
    list.push({ id: r.id, nama: r.nama, email: r.email, peran: "admin" });
  }

  for (const r of orderRows) {
    list.push({ id: r.id, nama: r.nama, email: r.email, peran: "user" });
  }

  return list;
}

// Dipakai saat login: cek admin dulu di tabel admins, jika tidak ada, cek pembeli di orders
export async function cariPenggunaByEmail(
  email: string
): Promise<BarisPengguna | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Cek tabel admins
  const [adminRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name as nama, email, password_hash as password, 'admin' as peran FROM admins WHERE LOWER(email) = ?",
    [cleanEmail]
  );

  if (adminRows.length > 0) {
    return adminRows[0] as BarisPengguna;
  }

  // 2. Cek tabel orders (pembeli)
  const [orderRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, buyer_name as nama, buyer_email as email, password_hash as password, 'user' as peran 
     FROM orders 
     WHERE LOWER(buyer_email) = ? 
     ORDER BY id DESC LIMIT 1`,
    [cleanEmail]
  );

  if (orderRows.length > 0) {
    return orderRows[0] as BarisPengguna;
  }

  return null;
}

export async function tambahPengguna(
  nama: string,
  email: string,
  hash: string,
  peran: Peran
): Promise<Pengguna> {
  if (peran === "admin") {
    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
      [nama, email, hash]
    );
    return { id: hasil.insertId, nama, email, peran: "admin" };
  } else {
    const orderId = `REG-${Date.now()}`;
    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO orders 
       (order_id, buyer_name, buyer_whatsapp, buyer_email, password_hash, template_id, package_type, gross_amount, payment_status)
       VALUES (?, ?, '-', ?, ?, 1, 'basic', 0, 'pending')`,
      [orderId, nama, email, hash]
    );
    return { id: hasil.insertId, nama, email, peran: "user" };
  }
}
