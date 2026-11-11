import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Order, Invitation } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function TransaksiPage() {
  const { user } = useAuth();
  const isAdmin = user?.peran === "admin";

  const [orders, setOrders] = useState<Order[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  async function muatData() {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const data = await api.ambilSemuaPesananAdmin();
        setOrders(data);
      } else if (user?.email) {
        const data = await api.ambilPesananSaya(user.email);
        setOrders(data.orders);
        setInvitations(data.invitations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, [isAdmin, user]);

  async function handleBayarSimulasi(orderId: string) {
    if (!confirm(`Konfirmasi pembayaran lunas simulasi untuk ${orderId}?`)) return;
    setPayingId(orderId);
    try {
      await api.simulasiBayarOrder(orderId);
      await muatData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memproses pembayaran");
    } finally {
      setPayingId(null);
    }
  }

  function formatRupiah(nilai: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(nilai);
  }

  function formatTanggal(tanggalStr?: string | null) {
    if (!tanggalStr) return "-";
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
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900">
            {isAdmin ? "Laporan Seluruh Pesanan (Admin)" : "Undangan & Pesanan Saya"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isAdmin
              ? "Semua data pesanan masuk dari pembeli beserta status transaksi Midtrans"
              : "Daftar undangan digital yang Anda miliki, kuota foto, dan masa aktif tautan"}
          </p>
        </div>

        {!isAdmin && (
          <Link
            to="/"
            className="px-4 py-2 bg-[#4A151E] hover:bg-[#381118] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Pesan Undangan Baru
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Konten Klien / Pembeli: Kartu Undangan */}
      {!isAdmin && invitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            💌 Undangan Digital Anda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white p-5 rounded-2xl border border-[#EBE3D5] shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8C6D3B] tracking-wider">
                      Paket {inv.package_type}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-[#3B171D]">
                      {inv.template_title ?? "Undangan Digital"}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                      inv.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {inv.status === "active" ? "● Aktif" : "○ Draft (Belum Lunas)"}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1.5 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tautan Undangan:</span>
                    <span className="font-mono font-bold text-indigo-700 select-all">
                      undang_an.digital/{inv.slug}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kuota Foto:</span>
                    <strong className="text-gray-800">
                      {inv.current_photos} / {inv.max_photos} Foto
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Masa Aktif S/D:</span>
                    <strong className="text-gray-800">{formatTanggal(inv.expires_at)}</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={`/${inv.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 text-center text-xs font-bold border border-[#D5C9B8] rounded-xl text-[#4A151E] hover:bg-[#FAF7F2] transition"
                  >
                    👁️ Pratinjau
                  </a>
                  <button
                    onClick={() => alert(`Fitur Editor Acara untuk /${inv.slug} (Modul C) siap diisi!`)}
                    className="flex-1 py-2 text-center text-xs font-bold bg-[#4A151E] hover:bg-[#381118] text-white rounded-xl transition shadow-xs cursor-pointer"
                  >
                    ✏️ Edit Acara
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel Pesanan */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">
            {isAdmin ? "Daftar Transaksi Masuk" : "Riwayat Tagihan Pesanan"}
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
            <p className="text-xs">Memuat data transaksi...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-base font-semibold">Belum ada data pesanan</p>
            <p className="text-xs mt-1">
              {isAdmin
                ? "Belum ada pesanan yang masuk dari pembeli."
                : "Anda belum pernah melakukan pemesanan template undangan."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#FAF7F2] text-[11px] uppercase text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">No. Order</th>
                  {isAdmin && <th className="px-6 py-4">Pemesan</th>}
                  <th className="px-6 py-4">Template & Paket</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Status Bayar</th>
                  <th className="px-6 py-4">Waktu Pesan</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      {o.order_id}
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{o.buyer_name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{o.buyer_whatsapp}</p>
                        <p className="text-[11px] text-gray-400">{o.buyer_email}</p>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{o.template_title ?? "Template"}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                        {o.package_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {formatRupiah(o.gross_amount)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                          o.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : o.payment_status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {formatTanggal(o.created_at)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {o.payment_status === "pending" ? (
                        <button
                          disabled={payingId === o.order_id}
                          onClick={() => handleBayarSimulasi(o.order_id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {payingId === o.order_id ? "Proses..." : "⚡ Bayar (Simulasi)"}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs">✓ Lunas</span>
                      )}
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
