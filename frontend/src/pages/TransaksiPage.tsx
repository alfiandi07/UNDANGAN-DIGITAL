import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Order, Invitation } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import "../styles/TransaksiPage.css";

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
    <div className="transaksi-page-container">
      {/* Header Banner */}
      <div className="transaksi-header-card">
        <div>
          <h2 className="transaksi-header-title">
            {isAdmin ? "Laporan Seluruh Pesanan (Admin)" : "Undangan & Pesanan Saya"}
          </h2>
          <p className="transaksi-header-subtitle">
            {isAdmin
              ? "Semua data pesanan masuk dari pembeli beserta status transaksi Midtrans"
              : "Daftar undangan digital yang Anda miliki, kuota foto, dan masa aktif tautan"}
          </p>
        </div>

        {!isAdmin && (
          <Link
            to="/"
            className="transaksi-btn-pesan-baru"
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
          <h3 className="invitation-section-title">
            💌 Undangan Digital Anda
          </h3>
          <div className="invitation-grid">
            {invitations.map((inv) => (
              <div key={inv.id} className="invitation-card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="invitation-package-tag">
                      Paket {inv.package_type}
                    </span>
                    <h4 className="invitation-card-title">
                      {inv.template_title ?? "Undangan Digital"}
                    </h4>
                  </div>
                  <span
                    className={
                      inv.status === "active"
                        ? "badge-status-active"
                        : "badge-status-draft"
                    }
                  >
                    {inv.status === "active" ? "● Aktif" : "○ Draft (Belum Lunas)"}
                  </span>
                </div>

                <div className="invitation-info-box">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tautan Undangan:</span>
                    <span className="font-mono font-bold text-sky-800 select-all">
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
                    className="invitation-btn-preview"
                  >
                    👁️ Pratinjau
                  </a>
                  <Link
                    to={`/dashboard/undangan/${inv.slug}/edit`}
                    className="invitation-btn-edit"
                  >
                    ✏️ Edit Acara
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel Pesanan (Admin & Pembeli) */}
      <div className="transaksi-table-card">
        <div className="transaksi-table-header-box">
          <h3 className="transaksi-table-title">
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
            <table className="transaksi-table">
              <thead>
                <tr>
                  <th className="transaksi-th">No. Order</th>
                  {isAdmin && <th className="transaksi-th">Pemesan</th>}
                  <th className="transaksi-th">Template & Paket</th>
                  <th className="transaksi-th">Nominal</th>
                  <th className="transaksi-th">Status Bayar</th>
                  <th className="transaksi-th">Waktu Pesan</th>
                  <th className="transaksi-th text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="transaksi-row">
                    <td className="transaksi-td font-mono font-bold text-gray-900">
                      {o.order_id}
                    </td>

                    {isAdmin && (
                      <td className="transaksi-td">
                        <p className="font-bold text-gray-800">{o.buyer_name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{o.buyer_whatsapp}</p>
                        <p className="text-[11px] text-gray-400">{o.buyer_email}</p>
                      </td>
                    )}

                    <td className="transaksi-td">
                      <p className="font-semibold text-gray-800">{o.template_title ?? "Template"}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase bg-sky-100 text-sky-800">
                        {o.package_type}
                      </span>
                    </td>

                    <td className="transaksi-td font-bold text-gray-900 text-sm">
                      {formatRupiah(o.gross_amount)}
                    </td>

                    <td className="transaksi-td">
                      <span
                        className={
                          o.payment_status === "paid"
                            ? "badge-payment-paid"
                            : o.payment_status === "pending"
                            ? "badge-payment-pending"
                            : "badge-payment-failed"
                        }
                      >
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="transaksi-td text-gray-500">
                      {formatTanggal(o.created_at)}
                    </td>

                    <td className="transaksi-td text-center">
                      {o.payment_status === "pending" ? (
                        <button
                          disabled={payingId === o.order_id}
                          onClick={() => handleBayarSimulasi(o.order_id)}
                          className="btn-bayar-simulasi"
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
