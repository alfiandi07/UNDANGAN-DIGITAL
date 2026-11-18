import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as repo from "../repository/pengguna.js";
import type { Peran } from "../models/pengguna.js";
import { validateRealEmail } from "../lib/emailValidator.js";
import { generateOtp, kirimEmailOtp, kirimEmailResetPassword } from "../lib/mailer.js";

export async function daftarPengguna(_req: Request, res: Response) {
  res.json(await repo.semuaPengguna());
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email dan password wajib diisi" });
    return;
  }
  const baris = await repo.cariPenggunaByEmail(String(email));
  const cocok = baris
    ? await bcrypt.compare(String(password), baris.password)
    : false;
  if (!baris || !cocok) {
    res.status(401).json({ error: "Email atau password salah" });
    return;
  }

  // Cek apakah akun sudah diverifikasi (khusus klien user)
  if (baris.peran !== "admin" && !baris.is_verified) {
    res.status(403).json({
      error: "Akun Anda belum diverifikasi. Silakan masukkan 6 digit kode OTP yang telah dikirim ke email Anda.",
      needs_verification: true,
      email: baris.email,
    });
    return;
  }

  res.json({
    id: baris.id,
    nama: baris.nama,
    email: baris.email,
    peran: baris.peran,
    is_verified: baris.is_verified,
  });
}

export async function daftar(req: Request, res: Response) {
  const nama = String(req.body?.nama ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  if (nama === "" || password.length < 6) {
    res.status(400).json({ error: "Nama dan password (min. 6 karakter) wajib diisi" });
    return;
  }

  // 1. Validasi Keaslian Email (Format, Anti-Disposable, DNS MX Record)
  const emailCheck = await validateRealEmail(email);
  if (!emailCheck.valid) {
    res.status(400).json({ error: emailCheck.error });
    return;
  }

  // 2. Cek apakah email sudah terdaftar
  if (await repo.cariPenggunaByEmail(email)) {
    res.status(409).json({ error: "Email sudah terdaftar. Silakan gunakan email lain atau login." });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const peran: Peran = req.body?.peran === "admin" ? "admin" : "user";

  // 3. Generate Kode OTP 6 Digit & waktu kedaluwarsa (15 menit)
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

  const pengguna = await repo.tambahPengguna(nama, email, hash, peran, otp, otpExpires);

  // 4. Kirim Email OTP ke alamat user
  await kirimEmailOtp(email, nama, otp);

  res.status(201).json({
    ...pengguna,
    message: "Pendaftaran berhasil! Kode verifikasi 6 digit telah dikirim ke email Anda.",
    needs_verification: peran !== "admin",
  });
}

// POST /api/auth/verify-otp
export async function verifikasiOtpHandler(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const otp = String(req.body?.otp ?? "").trim();

  if (!email || !otp) {
    res.status(400).json({ error: "Email dan kode OTP wajib diisi" });
    return;
  }

  const sukses = await repo.verifikasiOtp(email, otp);
  if (!sukses) {
    res.status(400).json({ error: "Kode OTP salah atau telah kedaluwarsa. Silakan minta kode baru." });
    return;
  }

  const pengguna = await repo.cariPenggunaByEmail(email);

  res.json({
    success: true,
    message: "Selamat! Email Anda berhasil diverifikasi. Akun Anda telah aktif.",
    user: pengguna
      ? {
          id: pengguna.id,
          nama: pengguna.nama,
          email: pengguna.email,
          peran: pengguna.peran,
          is_verified: true,
        }
      : null,
  });
}

// POST /api/auth/resend-otp
export async function kirimUlangOtpHandler(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: "Alamat email wajib diisi" });
    return;
  }

  const pengguna = await repo.cariPenggunaByEmail(email);
  if (!pengguna) {
    res.status(404).json({ error: "Akun dengan email tersebut tidak ditemukan" });
    return;
  }

  if (pengguna.is_verified) {
    res.status(400).json({ error: "Akun ini sudah terverifikasi sebelumnya. Silakan langsung login." });
    return;
  }

  const newOtp = generateOtp();
  const newExpires = new Date(Date.now() + 15 * 60 * 1000);

  await repo.simpanOtpBaru(email, newOtp, newExpires);
  await kirimEmailOtp(email, pengguna.nama, newOtp);

  res.json({
    success: true,
    message: "Kode OTP baru telah berhasil dikirim ke email Anda.",
  });
}

// POST /api/auth/forgot-password
export async function lupaPasswordHandler(req: Request, res: Response) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!email) {
      res.status(400).json({ error: "Alamat email wajib diisi" });
      return;
    }

    const pengguna = await repo.cariPenggunaByEmail(email);
    if (!pengguna) {
      res.status(404).json({ error: "Akun dengan email tersebut tidak ditemukan" });
      return;
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const result = await repo.simpanResetOtp(email, otp, otpExpires);
    await kirimEmailResetPassword(email, result.nama, otp);

    res.json({
      success: true,
      message: "Kode OTP untuk reset password telah dikirim ke email Anda.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal memproses lupa password";
    res.status(500).json({ error: msg });
  }
}

// POST /api/auth/reset-password
export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const otp = String(req.body?.otp ?? "").trim();
    const password = String(req.body?.password ?? "");

    if (!email || !otp || !password) {
      res.status(400).json({ error: "Email, kode OTP, dan password baru wajib diisi" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password baru minimal 6 karakter" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const hasil = await repo.verifikasiResetOtpDanUbahPassword(email, otp, hash);

    if (!hasil.success) {
      res.status(400).json({ error: hasil.message || "Gagal mengatur ulang password" });
      return;
    }

    res.json({
      success: true,
      message: "Password berhasil diperbarui! Silakan login dengan password baru Anda.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal mengatur ulang password";
    res.status(500).json({ error: msg });
  }
}

// DELETE /api/pengguna/:id
export async function hapusPenggunaHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const peran = String(req.query.peran || "user") as Peran;

    if (!id || isNaN(id)) {
      res.status(400).json({ error: "ID pengguna tidak valid" });
      return;
    }

    const sukses = await repo.hapusPengguna(id, peran);
    if (!sukses) {
      res.status(404).json({ error: "Pengguna tidak ditemukan atau sudah dihapus" });
      return;
    }

    res.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus pengguna";
    res.status(500).json({ error: msg });
  }
}

// PUT /api/pengguna/:id
export async function ubahPenggunaHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const peranLama = String(req.query.peran || "user") as Peran;
    const { nama, email, peran, password } = req.body ?? {};

    if (!id || isNaN(id)) {
      res.status(400).json({ error: "ID pengguna tidak valid" });
      return;
    }

    if (!nama || !email) {
      res.status(400).json({ error: "Nama dan email wajib diisi" });
      return;
    }

    if (!String(email).includes("@")) {
      res.status(400).json({ error: "Format email tidak valid" });
      return;
    }

    let passwordHash: string | undefined = undefined;
    if (password && String(password).trim().length > 0) {
      if (String(password).length < 6) {
        res.status(400).json({ error: "Password baru minimal 6 karakter" });
        return;
      }
      passwordHash = await bcrypt.hash(String(password), 10);
    }

    const updated = await repo.ubahPengguna(id, peranLama, {
      nama: String(nama),
      email: String(email),
      peran: (peran === "admin" ? "admin" : "user") as Peran,
      passwordHash,
    });

    if (!updated) {
      res.status(404).json({ error: "Pengguna tidak ditemukan" });
      return;
    }

    res.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui pengguna";
    res.status(500).json({ error: msg });
  }
}
