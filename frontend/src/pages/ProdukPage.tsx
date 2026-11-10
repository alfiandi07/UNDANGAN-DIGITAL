import { useState, useEffect, type FormEvent } from "react";
import * as api from "../lib/api";
import type { Produk, DataProduk } from "../lib/api";

export default function ProdukPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Produk</h2>
          <p className="text-sm text-gray-500">
            Kelola katalog tema atau template undangan digital Anda
          </p>
        </div>
        <button
          onClick={handleBukaTambah}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <span>➕</span> Tambah Produk
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabel Produk */}
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
                        className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleHapus(p.id, p.nama)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
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

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
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
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, harga: Number(e.target.value) })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, stok: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Contoh: 10"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

