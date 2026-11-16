import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import type { Pengguna, Peran } from "../models/pengguna.js";

type BarisPengguna = RowDataPacket & Pengguna & {
  password: string;
  verification_otp?: string | null;
  otp_expires_at?: Date | null;
};

// Mengambil seluruh pengguna (Admin tim inti + Klien pembeli yang memesan)
export async function semuaPengguna(): Promise<Pengguna[]> {
  try {
    const [adminRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name as nama, email, 'admin' as peran, is_verified FROM admins ORDER BY id ASC"
    );

    const [orderRows] = await pool.execute<RowDataPacket[]>(
      `SELECT MIN(id) as id, buyer_name as nama, buyer_email as email, 'user' as peran, MAX(is_verified) as is_verified
       FROM orders 
       GROUP BY buyer_email, buyer_name
       ORDER BY id DESC`
    );

    const list: Pengguna[] = [];

    for (const r of adminRows) {
      list.push({ id: r.id, nama: r.nama, email: r.email, peran: "admin", is_verified: Boolean(r.is_verified) });
    }

    for (const r of orderRows) {
      list.push({ id: r.id, nama: r.nama, email: r.email, peran: "user", is_verified: Boolean(r.is_verified) });
    }

    return list;
  } catch (err: any) {
    // Fallback jika kolom is_verified belum dibuat di database server
    if (err?.code === "ER_BAD_FIELD_ERROR" || String(err?.message).includes("is_verified")) {
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
        list.push({ id: r.id, nama: r.nama, email: r.email, peran: "admin", is_verified: true });
      }
      for (const r of orderRows) {
        list.push({ id: r.id, nama: r.nama, email: r.email, peran: "user", is_verified: true });
      }
      return list;
    }
    throw err;
  }
}

// Dipakai saat login: cek admin dulu di tabel admins, jika tidak ada, cek pembeli di orders
export async function cariPenggunaByEmail(
  email: string
): Promise<BarisPengguna | null> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Cek tabel admins
    const [adminRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name as nama, email, password_hash as password, 'admin' as peran, is_verified, NULL as verification_otp, NULL as otp_expires_at FROM admins WHERE LOWER(email) = ?",
      [cleanEmail]
    );

    if (adminRows.length > 0) {
      return adminRows[0] as BarisPengguna;
    }

    // 2. Cek tabel orders (pembeli)
    const [orderRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, buyer_name as nama, buyer_email as email, password_hash as password, 'user' as peran, is_verified, verification_otp, otp_expires_at 
       FROM orders 
       WHERE LOWER(buyer_email) = ? 
       ORDER BY id DESC LIMIT 1`,
      [cleanEmail]
    );

    if (orderRows.length > 0) {
      return orderRows[0] as BarisPengguna;
    }

    return null;
  } catch (err: any) {
    // Fallback jika is_verified belum ada di database
    if (err?.code === "ER_BAD_FIELD_ERROR" || String(err?.message).includes("is_verified")) {
      const [adminRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id, name as nama, email, password_hash as password, 'admin' as peran FROM admins WHERE LOWER(email) = ?",
        [cleanEmail]
      );
      if (adminRows.length > 0) {
        const u = adminRows[0] as BarisPengguna;
        u.is_verified = true;
        return u;
      }
      const [orderRows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, buyer_name as nama, buyer_email as email, password_hash as password, 'user' as peran 
         FROM orders 
         WHERE LOWER(buyer_email) = ? 
         ORDER BY id DESC LIMIT 1`,
        [cleanEmail]
      );
      if (orderRows.length > 0) {
        const u = orderRows[0] as BarisPengguna;
        u.is_verified = true;
        return u;
      }
    }
    throw err;
  }
}

export async function tambahPengguna(
  nama: string,
  email: string,
  hash: string,
  peran: Peran,
  otp?: string,
  otpExpires?: Date
): Promise<Pengguna> {
  if (peran === "admin") {
    const [hasil] = await pool.execute<ResultSetHeader>(
      "INSERT INTO admins (name, email, password_hash, is_verified) VALUES (?, ?, ?, TRUE)",
      [nama, email, hash]
    );
    return { id: hasil.insertId, nama, email, peran: "admin", is_verified: true };
  } else {
    const orderId = `REG-${Date.now()}`;
    const [hasil] = await pool.execute<ResultSetHeader>(
      `INSERT INTO orders 
       (order_id, buyer_name, buyer_whatsapp, buyer_email, password_hash, template_id, package_type, gross_amount, payment_status, is_verified, verification_otp, otp_expires_at)
       VALUES (?, ?, '-', ?, ?, 1, 'basic', 0, 'pending', FALSE, ?, ?)`,
      [orderId, nama, email, hash, otp || null, otpExpires || null]
    );
    return { id: hasil.insertId, nama, email, peran: "user", is_verified: false };
  }
}

// Verifikasi kode OTP user
export async function verifikasiOtp(email: string, otp: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, verification_otp, otp_expires_at 
     FROM orders 
     WHERE LOWER(buyer_email) = ? 
     ORDER BY id DESC LIMIT 1`,
    [cleanEmail]
  );

  if (rows.length === 0) return false;

  const user = rows[0];
  if (!user.verification_otp || user.verification_otp !== cleanOtp) {
    return false;
  }

  if (user.otp_expires_at && new Date() > new Date(user.otp_expires_at)) {
    return false; // OTP kedaluwarsa
  }

  // Sukses verifikasi
  await pool.execute(
    `UPDATE orders 
     SET is_verified = TRUE, verification_otp = NULL, otp_expires_at = NULL 
     WHERE LOWER(buyer_email) = ?`,
    [cleanEmail]
  );

  return true;
}

// Simpan kode OTP baru (Resend OTP)
export async function simpanOtpBaru(
  email: string,
  otp: string,
  otpExpires: Date
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE orders 
     SET verification_otp = ?, otp_expires_at = ? 
     WHERE LOWER(buyer_email) = ?`,
    [otp, otpExpires, cleanEmail]
  );

  return result.affectedRows > 0;
}

// Menghapus pengguna (Admin atau Klien User)
export async function hapusPengguna(id: number, peran: Peran): Promise<boolean> {
  if (peran === "admin") {
    // Cegah menghapus jika tersisa hanya 1 admin
    const [countRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM admins"
    );
    const total = Number(countRows[0]?.total || 0);
    if (total <= 1) {
      throw new Error("Tidak dapat menghapus admin terakhir pada sistem");
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM admins WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } else {
    // Cari email pembeli berdasarkan ID
    const [orderRows] = await pool.execute<RowDataPacket[]>(
      "SELECT buyer_email FROM orders WHERE id = ?",
      [id]
    );
    if (orderRows.length === 0) return false;
    const email = orderRows[0].buyer_email;

    // Hapus data akun & pesanan (otomatis cascade ke invitations dan rsvps)
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM orders WHERE LOWER(buyer_email) = ?",
      [email.toLowerCase()]
    );
    return result.affectedRows > 0;
  }
}

// Mengubah data pengguna (Nama, Email, Peran, Password Baru)
export async function ubahPengguna(
  id: number,
  peranLama: Peran,
  data: {
    nama: string;
    email: string;
    peran: Peran;
    passwordHash?: string;
  }
): Promise<Pengguna | null> {
  const cleanNama = data.nama.trim();
  const cleanEmail = data.email.trim().toLowerCase();

  if (peranLama === "admin") {
    // 1. Cek jika admin ingin diubah menjadi user (downgrade)
    if (data.peran === "user") {
      const [countRows] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as total FROM admins"
      );
      const total = Number(countRows[0]?.total || 0);
      if (total <= 1) {
        throw new Error("Tidak dapat mengubah role admin terakhir menjadi user.");
      }

      // Ambil password lama jika password baru tidak diberikan
      let hash = data.passwordHash;
      if (!hash) {
        const [adm] = await pool.execute<RowDataPacket[]>(
          "SELECT password_hash FROM admins WHERE id = ?",
          [id]
        );
        hash = String(adm[0]?.password_hash || "");
      }
      const finalHash = hash || "";

      // Hapus dari admins dan buatkan di orders
      await pool.execute("DELETE FROM admins WHERE id = ?", [id]);
      const orderId = `REG-${Date.now()}`;
      const [ins] = await pool.execute<ResultSetHeader>(
        `INSERT INTO orders 
         (order_id, buyer_name, buyer_whatsapp, buyer_email, password_hash, template_id, package_type, gross_amount, payment_status, is_verified)
         VALUES (?, ?, '-', ?, ?, 1, 'basic', 0, 'pending', TRUE)`,
        [orderId, cleanNama, cleanEmail, finalHash]
      );
      return { id: ins.insertId, nama: cleanNama, email: cleanEmail, peran: "user", is_verified: true };
    }

    // Tetap admin -> Update data admins
    if (data.passwordHash) {
      await pool.execute(
        "UPDATE admins SET name = ?, email = ?, password_hash = ? WHERE id = ?",
        [cleanNama, cleanEmail, data.passwordHash, id]
      );
    } else {
      await pool.execute(
        "UPDATE admins SET name = ?, email = ? WHERE id = ?",
        [cleanNama, cleanEmail, id]
      );
    }
    return { id, nama: cleanNama, email: cleanEmail, peran: "admin", is_verified: true };
  } else {
    // Akun asal: User
    // 2. Cek jika user ingin dinaikkan menjadi admin (promote)
    if (data.peran === "admin") {
      let hash = data.passwordHash;
      if (!hash) {
        const [ord] = await pool.execute<RowDataPacket[]>(
          "SELECT password_hash FROM orders WHERE id = ?",
          [id]
        );
        hash = String(ord[0]?.password_hash || "");
      }
      const finalHash = hash || "";

      // Masukkan ke tabel admins
      const [ins] = await pool.execute<ResultSetHeader>(
        "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
        [cleanNama, cleanEmail, finalHash]
      );
      // Update juga nama & email di orders agar data pesanan tetap sinkron
      await pool.execute(
        "UPDATE orders SET buyer_name = ?, buyer_email = ? WHERE id = ?",
        [cleanNama, cleanEmail, id]
      );
      return { id: ins.insertId, nama: cleanNama, email: cleanEmail, peran: "admin", is_verified: true };
    }

    // Tetap user -> Update data orders
    if (data.passwordHash) {
      await pool.execute(
        "UPDATE orders SET buyer_name = ?, buyer_email = ?, password_hash = ? WHERE id = ?",
        [cleanNama, cleanEmail, data.passwordHash, id]
      );
    } else {
      await pool.execute(
        "UPDATE orders SET buyer_name = ?, buyer_email = ? WHERE id = ?",
        [cleanNama, cleanEmail, id]
      );
    }
    return { id, nama: cleanNama, email: cleanEmail, peran: "user", is_verified: true };
  }
}
