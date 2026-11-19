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
      <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 text-rose-700 text-center max-w-md mx-auto my-12 space-y-2">
        <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="font-bold text-base font-serif">Akses Terbatas</h3>
        <p className="text-xs text-rose-600">Laporan finansial studio hanya dapat diakses oleh Admin Tim Inti.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#DCD7CA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#82622B] tracking-wider">
            PRD MODUL E: STUDIO KOLEKTIF 3 ORANG
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight mt-0.5">
            Laporan Finansial &amp; Bagi Hasil
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Kalkulator otomatis bagi hasil bersih (*Net Profit*) untuk 3 anggota tim inti setelah dikurangi biaya operasional.
          </p>
        </div>

        <button
          onClick={handleCleanupManual}
          disabled={cleaning}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D3E2F] hover:bg-[#1E2B20] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          title="Menghapus foto undangan yang lewat masa tenggang"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>{cleaning ? "Membersihkan Server..." : "Auto-Cleanup Server (FR-E3)"}</span>
        </button>
      </div>

      {cleanupResult && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{cleanupResult}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs font-medium border border-rose-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3E2F] mb-3" />
          <p className="text-xs">Menghitung kalkulasi finansial studio...</p>
        </div>
      ) : summary ? (
        <>
          {/* 4 KPI STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Omset */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCD7CA] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Omset Lunas
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#212C22]">
                {formatRupiah(summary.total_omset)}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{summary.total_orders_paid} Pesanan Terbayar</span>
              </p>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCD7CA] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Biaya Operasional
              </span>
              <p className="text-xl sm:text-2xl font-bold text-rose-800">
                {formatRupiah(summary.total_expenses)}
              </p>
              <p className="text-[10px] text-slate-400">
                VPS, Domain, &amp; Kas Studio
              </p>
            </div>

            {/* Laba Bersih */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCD7CA] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Laba Bersih (Net Profit)
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700">
                {formatRupiah(summary.net_profit)}
              </p>
              <p className="text-[10px] text-slate-400">
                Omset - Biaya Operasional
              </p>
            </div>

            {/* Bagian Per Orang */}
            <div className="bg-[#2D3E2F] text-white p-5 rounded-2xl shadow-md space-y-1 border border-[#1E2B20]">
              <span className="text-[10px] font-bold text-[#EBDCBF] uppercase tracking-wider">
                Hak / Anggota (Bagi 3)
              </span>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {formatRupiah(summary.share_per_member)}
              </p>
              <p className="text-[10px] text-[#EBDCBF]/80">
                Laba Bersih dibagi rata 3 orang
              </p>
            </div>
          </div>

          {/* BAGIAN BAGI HASIL 3 ANGGOTA TIM INTI (FR-E2) */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCD7CA] shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Bagi Hasil Tim Bertiga (Studio Kolektif)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rumus PRD: <code>Net Profit = Omset - (Biaya VPS &amp; Domain + Kas)</code>, kemudian dibagi rata 3 orang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.team_members.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#DCD7CA] space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2D3E2F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{member.name}</h4>
                      <p className="text-[11px] text-slate-400">{member.role}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#DCD7CA]/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Hak Komisi Bersih
                    </span>
                    <p className="text-base font-bold text-[#2D3E2F] mt-0.5">
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
            <div className="bg-white p-6 rounded-2xl border border-[#DCD7CA] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 tracking-tight">
                Catat Biaya Operasional
              </h3>
              <form onSubmit={handleTambahBiaya} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Pengeluaran <span className="text-rose-500 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaBiaya}
                    onChange={(e) => setNamaBiaya(e.target.value)}
                    placeholder="Contoh: Sewa VPS Server 13"
                    className="w-full px-3.5 py-2.5 border border-[#DCD7CA] rounded-xl focus:ring-2 focus:ring-[#2D3E2F]/15 focus:border-[#2D3E2F] outline-none text-xs text-slate-900 bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nominal Biaya (Rp) <span className="text-rose-500 font-semibold">*</span>
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
                    className="w-full px-3.5 py-2.5 border border-[#DCD7CA] rounded-xl focus:ring-2 focus:ring-[#2D3E2F]/15 focus:border-[#2D3E2F] outline-none text-xs text-slate-900 bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="w-full py-2.5 bg-[#2D3E2F] hover:bg-[#1E2B20] text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submittingExpense ? "Menyimpan..." : "Tambah Pengeluaran"}
                </button>
              </form>
            </div>

            {/* Tabel Daftar Pengeluaran */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DCD7CA] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="px-6 py-4 border-b border-[#DCD7CA] bg-[#EAE6DC]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#556050]">
                  Daftar Biaya Operasional Studio ({summary.expenses.length})
                </h3>
              </div>

              {summary.expenses.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Belum ada biaya operasional yang dicatat.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#EAE6DC] text-[11px] font-bold uppercase tracking-wider text-[#556050] border-b border-[#DCD7CA]">
                        <th className="px-5 py-3.5">Bulan</th>
                        <th className="px-5 py-3.5">Nama Pengeluaran</th>
                        <th className="px-5 py-3.5">Nominal</th>
                        <th className="px-5 py-3.5">Tanggal Catat</th>
                        <th className="px-5 py-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD7CA]/60">
                      {summary.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-[#FBF9F5] transition-colors">
                          <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                            {exp.period_month}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {exp.expense_name}
                          </td>
                          <td className="px-5 py-4 font-bold text-rose-800">
                            {formatRupiah(exp.amount)}
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs">
                            {formatTanggal(exp.created_at)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleHapusBiaya(exp.id, exp.expense_name)}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus pengeluaran ini"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
