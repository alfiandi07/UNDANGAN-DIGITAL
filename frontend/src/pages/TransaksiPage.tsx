import { useState, useEffect } from "react";
import * as api from "../lib/api";
import type { Transaksi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function TransaksiPage() {
  const { user } = useAuth();
  const isAdmin = user?.peran === "admin";

  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function muatTransaksi() {
      setLoading(true);
      setError("");
      try {
        const data = await api.ambilSemuaTransaksi();
        // Jika creator, filter transaksi miliknya sendiri
        if (!isAdmin && user) {
          setTransaksiList(data.filter((t) => t.id_pengguna === user.id));
        } else {
          setTransaksiList(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat transaksi");
      } finally {
        setLoading(false);
      }
    }

    muatTransaksi();
  }, [isAdmin, user]);

  function formatRupiah(nilai: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(nilai);
  }

  function formatTanggal(tanggalStr: string) {
    try {
      const d = new Date(tanggalStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return tanggalStr;
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "Laporan Semua Transaksi (Admin)" : "Riwayat Pesanan Saya"}
          </h2>
          <p className="text-sm text-gray-500">
            {isAdmin
              ? "Semua data transaksi penjualan template undangan digital di sistem"
              : "Daftar template undangan yang pernah Anda pesan"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
            <p>Memuat data transaksi...</p>
          </div>
        ) : transaksiList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg">Belum ada riwayat transaksi</p>
            <p className="text-sm">
              {isAdmin
                ? "Belum ada pesanan dari pengguna."
                : "Anda belum pernah memesan template undangan."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">No. Transaksi</th>
                  {isAdmin && <th className="px-6 py-4">ID Pengguna</th>}
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Total Bayar</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {transaksiList.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      #TRX-{t.id}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-gray-600 font-mono">
                        User #{t.id_pengguna}
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-600">
                      {formatTanggal(t.created_at)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatRupiah(t.total_harga)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          t.status === "sukses"
                            ? "bg-emerald-100 text-emerald-700"
                            : t.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

