import type { Request, Response } from "express";
import * as repoTransaksi from "../repository/transaksi.js";
import * as repoProduk from "../repository/produk.js";

// ==========================================
// 1. Handler Tambah Transaksi (Checkout)
// ==========================================
export async function tambah(req: Request, res: Response) {
  const { id_pengguna, items } = req.body ?? {};

  // Validasi input awal
  if (!id_pengguna || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({
      error: "id_pengguna dan daftar items wajib diisi",
    });
    return;
  }

  // Siapkan data item yang valid & hitung total
  const itemValid: { id_produk: number; jumlah: number; harga: number }[] = [];
  let totalHarga = 0;

  for (const item of items) {
    const idProduk = Number(item.id_produk);
    const jumlah = Number(item.jumlah);

    if (!idProduk || !jumlah || jumlah <= 0) {
      res.status(400).json({ error: "Item produk atau jumlah tidak valid" });
      return;
    }

    // Ambil produk dari database untuk cek harga & stok asli
    const produk = await repoProduk.cariProduk(idProduk);
    if (!produk) {
      res.status(404).json({ error: `Produk ID ${idProduk} tidak ditemukan` });
      return;
    }

    if (produk.stok < jumlah) {
      res.status(400).json({
        error: `Stok produk "${produk.nama}" tidak mencukupi (tersisa: ${produk.stok})`,
      });
      return;
    }

    const subtotal = produk.harga * jumlah;
    totalHarga += subtotal;

    itemValid.push({
      id_produk: idProduk,
      jumlah: jumlah,
      harga: produk.harga, // Pakai harga asli dari DB (bukan dari client agar aman)
    });
  }

  // Simpan ke database via repository
  try {
    const hasil = await repoTransaksi.buatTransaksi(
      Number(id_pengguna),
      itemValid,
      totalHarga,
    );
    res.status(201).json(hasil);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Gagal memproses transaksi",
    });
  }
}

// ==========================================
// 2. Handler Daftar Transaksi (Riwayat)
// ==========================================
export async function daftar(_req: Request, res: Response) {
  const data = await repoTransaksi.semuaTransaksi();
  res.json(data);
}

// ==========================================
// 3. Handler Detail Transaksi
// ==========================================
export async function detail(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = await repoTransaksi.cariTransaksi(id);

  if (!data) {
    res.status(404).json({ error: "Transaksi tidak ditemukan" });
    return;
  }

  res.json(data);
}
