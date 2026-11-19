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
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Pesan Undangan Baru</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Konten Klien / Pembeli: Kartu Undangan */}
      {!isAdmin && invitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="invitation-section-title">
            <svg className="w-4 h-4 text-[#8C6D38] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Undangan Digital Anda</span>
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
                    <span className={`w-1.5 h-1.5 rounded-full ${inv.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {inv.status === "active" ? "Aktif" : "Draft (Belum Lunas)"}
                  </span>
                </div>

                <div className="invitation-info-box">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tautan Undangan:</span>
                    <span className="font-mono font-semibold text-slate-800 select-all">
                      asminvitation.my.id/{inv.slug}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Kuota Foto:</span>
                    <strong className="text-slate-800 font-semibold">
                      {inv.current_photos} / {inv.max_photos} Foto
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Masa Aktif S/D:</span>
                    <strong className="text-slate-800 font-semibold">{formatTanggal(inv.expires_at)}</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={`/${inv.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="invitation-btn-preview"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Pratinjau</span>
                  </a>
                  <Link
                    to={`/dashboard/undangan/${inv.slug}/edit`}
                    className="invitation-btn-edit"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Acara</span>
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
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
            <p className="text-xs">Memuat data transaksi...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-700">Belum ada data pesanan</p>
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
                  <th className="transaksi-th">Template &amp; Paket</th>
                  <th className="transaksi-th">Nominal</th>
                  <th className="transaksi-th">Status Bayar</th>
                  <th className="transaksi-th">Waktu Pesan</th>
                  <th className="transaksi-th text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E4DC]/60">
                {orders.map((o) => (
                  <tr key={o.id} className="transaksi-row">
                    <td className="transaksi-td font-mono font-bold text-slate-900">
                      {o.order_id}
                    </td>

                    {isAdmin && (
                      <td className="transaksi-td">
                        <p className="font-semibold text-slate-900 text-sm">{o.buyer_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{o.buyer_whatsapp}</p>
                        <p className="text-[11px] text-slate-400">{o.buyer_email}</p>
                      </td>
                    )}

                    <td className="transaksi-td">
                      <p className="font-semibold text-slate-800">{o.template_title ?? "Template"}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FAF4E8] text-[#8C6D38] border border-[#E9DCBF]">
                        {o.package_type}
                      </span>
                    </td>

                    <td className="transaksi-td font-bold text-slate-900 text-sm">
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
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          o.payment_status === "paid"
                            ? "bg-emerald-500"
                            : o.payment_status === "pending"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`} />
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="transaksi-td text-slate-500 text-xs">
                      {formatTanggal(o.created_at)}
                    </td>

                    <td className="transaksi-td text-center">
                      {o.payment_status === "pending" ? (
                        <button
                          disabled={payingId === o.order_id}
                          onClick={() => handleBayarSimulasi(o.order_id)}
                          className="btn-bayar-simulasi"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{payingId === o.order_id ? "Proses..." : "Bayar (Simulasi)"}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Lunas</span>
                        </span>
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
