import { useState, useEffect, type FormEvent } from "react";
import * as api from "../lib/api";
import type { Produk, DataProduk } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ProdukPage() {
  const { user } = useAuth();
  const isAdmin = user?.peran === "admin";

  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State Admin (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataProduk>({
    nama: "",
    harga: 0,
    stok: 0,
    kategory: "Undangan",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal State Creator (Checkout / Pesan)
  const [beliProduk, setBeliProduk] = useState<Produk | null>(null);
  const [jumlahBeli, setJumlahBeli] = useState(1);
  const [beliLoading, setBeliLoading] = useState(false);
  const [beliError, setBeliError] = useState("");
  const [beliSukses, setBeliSukses] = useState("");

  async function muatData() {
    setLoading(true);
    setError("");
    try {
      const data = await api.ambilSemuaProduk();
      setProdukList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  // Admin handlers
  function handleBukaTambah() {
    setEditId(null);
    setFormData({ nama: "", harga: 0, stok: 0, kategory: "Undangan" });
    setFormError("");
    setIsModalOpen(true);
  }

  function handleBukaEdit(p: Produk) {
    setEditId(p.id);
    setFormData({
      nama: p.nama,
      harga: p.harga,
      stok: p.stok,
      kategory: p.kategory || "Undangan",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSimpan(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (editId) {
        await api.ubahProduk(editId, formData);
      } else {
        await api.tambahProduk(formData);
      }
      setIsModalOpen(false);
      await muatData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(id: number, nama: string) {
    if (!confirm(`Yakin ingin menghapus produk "${nama}"?`)) return;
    try {
      await api.hapusProduk(id);
      await muatData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus produk");
    }
  }

  // Creator Checkout Handler
  async function handleBeli(e: FormEvent) {
    e.preventDefault();
    if (!beliProduk || !user) return;
    setBeliLoading(true);
    setBeliError("");
    setBeliSukses("");
    try {
      await api.buatTransaksi({
        id_pengguna: user.id,
        items: [{ id_produk: beliProduk.id, jumlah: jumlahBeli }],
      });
      setBeliSukses(`Pesanan template "${beliProduk.nama}" berhasil dibuat!`);
      await muatData();
      setTimeout(() => {
        setBeliProduk(null);
        setBeliSukses("");
      }, 1500);
    } catch (err) {
      setBeliError(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setBeliLoading(false);
    }
  }

  function formatRupiah(nilai: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(nilai);
  }

  function getStatusStok(stok: number) {
    if (stok === 0) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          Habis
        </span>
      );
    }
    if (stok < 5) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
          Menipis
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
        Aman
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "Manajemen Produk (Admin Panel)" : "Katalog Template Undangan Digital"}
          </h2>
          <p className="text-sm text-gray-500">
            {isAdmin
              ? "Kelola, edit, dan hapus template undangan yang tersedia di sistem"
              : "Pilih template undangan digital favorit Anda dan pesan dengan mudah"}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleBukaTambah}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            <span>➕</span> Tambah Produk
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Konten Berdasarkan Role */}
      {isAdmin ? (
        /* ================= TAMPILAN ADMIN (TABEL KELOLA CRUD) ================= */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
              <p>Memuat data produk...</p>
            </div>
          ) : produkList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg">Belum ada produk</p>
              <p className="text-sm">Klik tombol &ldquo;Tambah Produk&rdquo; untuk menambahkan produk pertama Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nama Produk</th>
                    <th className="px-6 py-4">Harga</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {produkList.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-mono text-gray-500">#{p.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{p.nama}</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">{formatRupiah(p.harga)}</td>
                      <td className="px-6 py-4 text-gray-600">{p.stok} unit</td>
                      <td className="px-6 py-4">{getStatusStok(p.stok)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleBukaEdit(p)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleHapus(p.id, p.nama)}
                          className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ================= TAMPILAN CREATOR (GRID KATALOG TEMPLATE) ================= */
        <div>
          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
              <p>Memuat katalog...</p>
            </div>
          ) : produkList.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white rounded-xl">
              <p className="text-lg">Katalog sedang kosong</p>
              <p className="text-sm">Admin belum menambahkan tema undangan baru.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produkList.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                        {p.kategory || "Undangan"}
                      </span>
                      {getStatusStok(p.stok)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{p.nama}</h3>
                    <p className="text-2xl font-extrabold text-indigo-600 mb-4">
                      {formatRupiah(p.harga)}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">Tersisa: {p.stok} kuota lisensi</p>
                  </div>

                  <button
                    disabled={p.stok === 0}
                    onClick={() => {
                      setBeliProduk(p);
                      setJumlahBeli(1);
                      setBeliError("");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>🛒</span> {p.stok === 0 ? "Stok Habis" : "Pesan Template"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Admin: Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editId ? "Edit Produk" : "Tambah Produk Baru"}
            </h3>

            {formError && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSimpan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Contoh: Undangan Rustik Elegan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.harga || ""}
                  onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Contoh: 150000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Contoh: 10"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Creator: Konfirmasi Pemesanan */}
      {beliProduk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pesanan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Anda akan memesan template: <strong className="text-gray-800">{beliProduk.nama}</strong>
            </p>

            {beliError && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-4">
                {beliError}
              </div>
            )}

            {beliSukses && (
              <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg border border-emerald-200 mb-4 font-medium">
                {beliSukses}
              </div>
            )}

            <form onSubmit={handleBeli} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Lisensi
                </label>
                <input
                  type="number"
                  min="1"
                  max={beliProduk.stok}
                  value={jumlahBeli}
                  onChange={(e) => setJumlahBeli(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Harga Satuan:</span>
                  <span>{formatRupiah(beliProduk.harga)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
                  <span>Total Bayar:</span>
                  <span className="text-indigo-600">
                    {formatRupiah(beliProduk.harga * jumlahBeli)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBeliProduk(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={beliLoading || !beliProduk.stok}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {beliLoading ? "Memproses..." : "Konfirmasi & Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
