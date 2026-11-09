import type { Request, Response } from "express";
import * as repo from "../repository/produk.js";
import type { DataProduk } from "../models/produk.js";
type HasilValidasi = { data: DataProduk } | { error: string };
function validasi(body: Record<string, unknown>): HasilValidasi {
  const nama = String(body.nama ?? "").trim();
  const harga = Number(body.harga);
  const stok = Number(body.stok ?? 0);
  const kategory = String(body.kategory ?? "").trim();
  if (nama === "") return { error: "Nama produk wajib diisi" };
  if (!Number.isInteger(harga) || harga <= 0)
    return { error: "Harga harus angka bulat > 0" };
  if (!Number.isInteger(stok) || stok < 0)
    return { error: "Stok tidak boleh negatif" };
  return { data: { nama, harga, stok, kategory } };
}
export async function daftar(_req: Request, res: Response) {
  res.json(await repo.semuaProduk());
}
export async function detail(req: Request, res: Response) {
  const produk = await repo.cariProduk(Number(req.params.id));
  if (!produk) {
    res.status(404).json({ error: "Produk tidak ditemukan" });
    return;
  }
  res.json(produk);
}
export async function tambah(req: Request, res: Response) {
  const hasil = validasi(req.body ?? {});
  if ("error" in hasil) {
    res.status(400).json({ error: hasil.error });
    return;
  }
  res.status(201).json(await repo.tambahProduk(hasil.data));
}
export async function ubah(req: Request, res: Response) {
  const hasil = validasi(req.body ?? {});
  if ("error" in hasil) {
    res.status(400).json({ error: hasil.error });
    return;
  }
  const produk = await repo.ubahProduk(Number(req.params.id), hasil.data);
  if (!produk) {
    res.status(404).json({ error: "Produk tidak ditemukan" });
    return;
  }
  res.json(produk);
}
export async function hapus(req: Request, res: Response) {
  const berhasil = await repo.hapusProduk(Number(req.params.id));
  if (!berhasil) {
    res.status(404).json({ error: "Produk tidak ditemukan" });
    return;
  }
  res.json({ pesan: "Produk dihapus" });
}
