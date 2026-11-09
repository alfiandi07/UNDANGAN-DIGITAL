import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as repo from "../repository/pengguna.js";
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
  res.json({
    id: baris.id,
    nama: baris.nama,
    email: baris.email,
    peran: baris.peran,
  });
}
export async function daftar(req: Request, res: Response) {
  const nama = String(req.body?.nama ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (nama === "" || !email.includes("@") || password.length < 8) {
    res.status(400).json({ error: "Nama, email, atau password tidak valid" });
    return;
  }
  if (await repo.cariPenggunaByEmail(email)) {
    res.status(409).json({ error: "Email sudah terdaftar" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  res.status(201).json(
    await repo.tambahPengguna(
      nama,
      email,
      hash,

      "user",
    ),
  );
}
