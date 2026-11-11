import type { Request, Response } from "express";
import * as repo from "../repository/finance.js";

// GET /api/finance/summary (FR-E2 Ringkasan Keuangan & Bagi Hasil)
export async function getSummary(_req: Request, res: Response) {
  try {
    const summary = await repo.hitungRingkasanFinansial();
    res.json(summary);
  } catch (err) {
    console.error("Finance summary error:", err);
    res.status(500).json({ error: "Gagal mengambil laporan keuangan" });
  }
}

// POST /api/finance/expenses (Catat Pengeluaran Baru)
export async function addExpense(req: Request, res: Response) {
  try {
    const { period_month, expense_name, amount } = req.body ?? {};
    if (!expense_name || !amount) {
      res.status(400).json({ error: "Nama pengeluaran dan jumlah nominal wajib diisi" });
      return;
    }

    const currentMonth = period_month || new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const created = await repo.tambahBiayaOperasional(
      String(currentMonth),
      String(expense_name).trim(),
      Number(amount)
    );

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Gagal mencatat pengeluaran operasional" });
  }
}

// DELETE /api/finance/expenses/:id
export async function deleteExpense(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json({ error: "ID pengeluaran tidak valid" });
      return;
    }

    const success = await repo.hapusBiayaOperasional(id);
    if (!success) {
      res.status(404).json({ error: "Data pengeluaran tidak ditemukan" });
      return;
    }

    res.json({ message: "Biaya operasional berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus biaya operasional" });
  }
}

// POST /api/finance/cleanup-now (Manual / Cron Trigger FR-E3)
export async function triggerCleanup(_req: Request, res: Response) {
  try {
    const result = await repo.jalankanCleanupServer();
    res.json({
      success: true,
      message: `Pembersihan server berhasil! ${result.cleaned_count} undangan kedaluwarsa telah dibersihkan.`,
      result,
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).json({ error: "Gagal menjalankan pembersihan server" });
  }
}

