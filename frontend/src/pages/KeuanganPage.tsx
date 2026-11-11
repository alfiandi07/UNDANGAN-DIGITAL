import { useState, useEffect, type FormEvent } from "react";
import * as api from "../lib/api";
import type { FinanceSummary } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function KeuanganPage() {
  const { user } = useAuth();
  const isAdmin = user?.peran === "admin";

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form Input Biaya Operasional
  const [namaBiaya, setNamaBiaya] = useState("");
  const [nominalBiaya, setNominalBiaya] = useState<number | "">("");
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Cleanup Cron Trigger
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  async function muatData() {
    setLoading(true);
    setError("");
    try {
      const data = await api.ambilLaporanFinansial();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat laporan keuangan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  async function handleTambahBiaya(e: FormEvent) {
    e.preventDefault();
    if (!namaBiaya.trim() || !nominalBiaya || Number(nominalBiaya) <= 0) return;

    setSubmittingExpense(true);
    try {
      await api.tambahBiayaOperasional({
        expense_name: namaBiaya.trim(),
        amount: Number(nominalBiaya),
      });
      setNamaBiaya("");
      setNominalBiaya("");
      await muatData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mencatat biaya");
    } finally {
      setSubmittingExpense(false);
    }
  }

  async function handleHapusBiaya(id: number, nama: string) {
    if (!confirm(`Hapus pencatatan biaya "${nama}"?`)) return;
    try {
      await api.hapusBiayaOperasional(id);
      await muatData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus biaya");
    }
  }

  async function handleCleanupManual() {
    if (!confirm("Jalankan pembersihan foto untuk seluruh undangan yang telah kedaluwarsa?")) return;
    setCleaning(true);
    setCleanupResult(null);
    try {
      const res = await api.jalankanCleanupServer();
      setCleanupResult(res.message);
      setTimeout(() => setCleanupResult(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menjalankan pembersihan");
    } finally {
      setCleaning(false);
    }
  }

  function formatRupiah(nilai: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(nilai);
  }

  function formatTanggal(tanggalStr?: string) {
    if (!tanggalStr) return "-";
    try {
      const d = new Date(tanggalStr);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return tanggalStr;
    }
  }

  if (!isAdmin) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-center max-w-md mx-auto my-12 space-y-2">
        <span className="text-3xl">🔒</span>
        <h3 className="font-bold text-base">Akses Terbatas</h3>
        <p className="text-xs">Laporan finansial studio hanya dapat diakses oleh Admin Tim Inti.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#8C6D3B] tracking-wider">
            PRD MODUL E: STUDIO KOLEKTIF 3 ORANG
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 mt-0.5">
            Laporan Finansial & Bagi Hasil
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kalkulator otomatis bagi hasil bersih (*Net Profit*) untuk 3 anggota tim inti setelah dikurangi biaya operasional.
          </p>
        </div>

        <button
          onClick={handleCleanupManual}
          disabled={cleaning}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          title="Menghapus foto undangan yang lewat H+7 atau H+14 masa tenggang"
        >
          <span>🧹</span> {cleaning ? "Membersihkan Server..." : "Auto-Cleanup Server (FR-E3)"}
        </button>
      </div>

      {cleanupResult && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-medium border border-emerald-200">
          ✅ {cleanupResult}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-medium border border-red-200">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
          <p className="text-xs">Menghitung kalkulasi finansial studio...</p>
        </div>
      ) : summary ? (
        <>
          {/* 4 KPI STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Omset */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Omset Lunas
              </span>
              <p className="text-2xl font-extrabold text-[#381118]">
                {formatRupiah(summary.total_omset)}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">
                ✓ {summary.total_orders_paid} Pesanan Terbayar
              </p>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Biaya Operasional
              </span>
              <p className="text-2xl font-extrabold text-red-600">
                {formatRupiah(summary.total_expenses)}
              </p>
              <p className="text-[10px] text-gray-400">
                VPS, Domain, & Kas Studio
              </p>
            </div>

            {/* Laba Bersih */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Laba Bersih (Net Profit)
              </span>
              <p className="text-2xl font-extrabold text-emerald-700">
                {formatRupiah(summary.net_profit)}
              </p>
              <p className="text-[10px] text-gray-400">
                Omset - Biaya Operasional
              </p>
            </div>

            {/* Bagian Per Orang */}
            <div className="bg-[#4A151E] text-white p-5 rounded-2xl shadow-lg space-y-1">
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                Hak / Anggota (Bagi 3)
              </span>
              <p className="text-2xl font-extrabold text-[#FFF3E3]">
                {formatRupiah(summary.share_per_member)}
              </p>
              <p className="text-[10px] text-amber-200/80">
                Laba Bersih dibagi rata 3 orang
              </p>
            </div>
          </div>

          {/* BAGIAN BAGI HASIL 3 ANGGOTA TIM INTI (FR-E2) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Bagi Hasil Tim Bertiga (Studio Kolektif)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Rumus PRD: <code>Net Profit = Omset - (Biaya VPS & Domain + Kas)</code>, kemudian dibagi rata 3 orang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.team_members.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#EBE3D5] space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4A151E] text-white flex items-center justify-center font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{member.name}</h4>
                      <p className="text-[10px] text-gray-500">{member.role}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Hak Komisi Bersih
                    </span>
                    <p className="text-lg font-extrabold text-[#4A151E] mt-0.5">
                      {formatRupiah(member.share_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MANAJEMEN BIAYA OPERASIONAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Catat Biaya */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-gray-900">
                + Catat Biaya Operasional
              </h3>
              <form onSubmit={handleTambahBiaya} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nama Pengeluaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaBiaya}
                    onChange={(e) => setNamaBiaya(e.target.value)}
                    placeholder="Contoh: Sewa VPS Server 13"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nominal Biaya (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={nominalBiaya}
                    onChange={(e) =>
                      setNominalBiaya(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="Contoh: 150000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="w-full py-2.5 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submittingExpense ? "Menyimpan..." : "+ Tambah Pengeluaran"}
                </button>
              </form>
            </div>

            {/* Tabel Daftar Pengeluaran */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Daftar Biaya Operasional Studio ({summary.expenses.length})
                </h3>
              </div>

              {summary.expenses.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs">
                  Belum ada biaya operasional yang dicatat.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-[#FAF7F2] text-[11px] uppercase text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3">Bulan</th>
                        <th className="px-5 py-3">Nama Pengeluaran</th>
                        <th className="px-5 py-3">Nominal</th>
                        <th className="px-5 py-3">Tanggal Catat</th>
                        <th className="px-5 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summary.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/70 transition">
                          <td className="px-5 py-3 font-mono font-bold text-gray-800">
                            {exp.period_month}
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-900">
                            {exp.expense_name}
                          </td>
                          <td className="px-5 py-3 font-bold text-red-600">
                            {formatRupiah(exp.amount)}
                          </td>
                          <td className="px-5 py-3 text-gray-400">
                            {formatTanggal(exp.created_at)}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => handleHapusBiaya(exp.id, exp.expense_name)}
                              className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer"
                              title="Hapus pengeluaran ini"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

