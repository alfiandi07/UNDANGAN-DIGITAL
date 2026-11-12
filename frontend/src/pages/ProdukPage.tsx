import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Template, DataTemplateInput } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ProdukPage() {
  const { user } = useAuth();
  const isAdmin = user?.peran === "admin";

  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State Admin (Tambah / Edit Template)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataTemplateInput>({
    title: "",
    slug: "",
    category: "wedding",
    theme_style: "Modern Minimalis",
    thumbnail_url: "",
    demo_url: "",
    price_basic: 79000,
    price_standard: 99000,
    price_special: 120000,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function muatData() {
    setLoading(true);
    setError("");
    try {
      const data = await api.ambilSemuaTemplatesAdmin();
      setTemplateList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat template undangan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleJudulChange(judul: string) {
    if (!editId) {
      // Auto generate slug jika buat template baru
      const newSlug = generateSlug(judul);
      setFormData((prev) => ({
        ...prev,
        title: judul,
        slug: newSlug,
        demo_url: `/demo/${newSlug}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, title: judul }));
    }
  }

  function handleBukaTambah() {
    setEditId(null);
    setFormData({
      title: "",
      slug: "",
      category: "wedding",
      theme_style: "Modern Minimalis",
      thumbnail_url: "",
      demo_url: "",
      price_basic: 79000,
      price_standard: 99000,
      price_special: 120000,
      is_active: true,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function handleBukaEdit(item: Template) {
    setEditId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category,
      theme_style: item.theme_style,
      thumbnail_url: item.thumbnail_url || "",
      demo_url: item.demo_url || `/demo/${item.slug}`,
      price_basic: item.price_basic,
      price_standard: item.price_standard,
      price_special: item.price_special,
      is_active: Boolean(item.is_active),
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
        await api.ubahTemplate(editId, formData);
      } else {
        await api.tambahTemplate(formData);
      }
      setIsModalOpen(false);
      await muatData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan template");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(id: number, title: string) {
    if (!confirm(`Yakin ingin menghapus master template "${title}"?`)) return;
    try {
      await api.hapusTemplate(id);
      await muatData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus template");
    }
  }

  async function handleToggleStatus(item: Template) {
    try {
      await api.ubahTemplate(item.id, { is_active: !item.is_active });
      await muatData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status template");
    }
  }

  function formatRupiah(nilai: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(nilai);
  }

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
        <span className="text-4xl">🔒</span>
        <h3 className="text-lg font-bold text-gray-800">Akses Terbatas</h3>
        <p className="text-sm text-gray-500">
          Halaman kelola master template hanya dapat diakses oleh Admin Studio.
        </p>
        <Link
          to="/dashboard/transaksi"
          className="inline-block px-5 py-2.5 bg-[#4A151E] hover:bg-[#381118] text-white rounded-xl text-xs font-bold transition"
        >
          Lihat Undangan Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">
            Kelola Master Template Undangan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Studio Kolektif: Atur katalog template, upload gambar cover, harga 3 paket, dan tautan demo.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleBukaTambah}
            className="inline-flex items-center gap-2 bg-[#4A151E] hover:bg-[#381118] text-white font-medium px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer text-sm"
          >
            <span>➕</span> Tambah Template Baru
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabel Template */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
            <p className="text-sm">Memuat data template...</p>
          </div>
        ) : templateList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-base font-semibold">Belum ada master template</p>
            <p className="text-sm mt-1">
              Klik tombol &ldquo;Tambah Template Baru&rdquo; untuk mendaftarkan template pertama Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-[#FAF7F2] text-xs uppercase text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Template & Slug</th>
                  <th className="px-6 py-4">Kategori & Gaya</th>
                  <th className="px-6 py-4">Harga 3 Paket (PRD)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templateList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    {/* Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="w-14 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Polos</span>
                        )}
                      </div>
                    </td>

                    {/* Judul & Slug */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">{item.title}</p>
                      <p className="text-xs text-indigo-600 font-mono mt-0.5">/{item.slug}</p>
                      {item.demo_url && (
                        <a
                          href={item.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 mt-1"
                        >
                          🔗 Demo: {item.demo_url}
                        </a>
                      )}
                    </td>

                    {/* Kategori & Gaya */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                        {item.category}
                      </span>
                      <p className="text-xs text-gray-500 font-medium mt-1">{item.theme_style}</p>
                    </td>

                    {/* 3 Paket Harga */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="text-xs flex items-center gap-2">
                        <span className="w-16 text-gray-400">Basic:</span>
                        <strong className="text-gray-800">{formatRupiah(item.price_basic)}</strong>
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        <span className="w-16 text-gray-400">Standard:</span>
                        <strong className="text-gray-800">{formatRupiah(item.price_standard)}</strong>
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        <span className="w-16 text-gray-400">Special:</span>
                        <strong className="text-gray-800">{formatRupiah(item.price_special)}</strong>
                      </div>
                    </td>

                    {/* Status Aktif */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer transition ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                        title="Klik untuk ubah status tampil di katalog"
                      >
                        {item.is_active ? "● Aktif di Katalog" : "○ Nonaktif"}
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleBukaEdit(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleHapus(item.id, item.title)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Admin: Tambah / Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <h3 className="text-xl font-bold text-gray-900 font-serif mb-1">
              {editId ? "Edit Master Template" : "Tambah Master Template Baru"}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Kelola informasi template yang akan ditampilkan di katalog publik.
            </p>

            {formError && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSimpan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Judul Template <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleJudulChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm"
                    placeholder="Contoh: Jawa Keraton Royal"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Slug Tautan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none font-mono text-sm"
                    placeholder="jawa-keraton-royal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kategori Acara <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as DataTemplateInput["category"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm bg-white"
                  >
                    <option value="wedding">💍 Pernikahan (wedding)</option>
                    <option value="khitan">✂️ Khitanan (khitan)</option>
                    <option value="birthday">🎂 Ulang Tahun (birthday)</option>
                    <option value="aqiqah">👶 Aqiqah (aqiqah)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Gaya / Tema Adat
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.theme_style}
                    onChange={(e) => setFormData({ ...formData, theme_style: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm"
                    placeholder="Contoh: Adat Jawa, Modern, Islamic"
                  />
                </div>
              </div>

              {/* URL Cover Image */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  URL Gambar Cover (Thumbnail)
                </label>
                <input
                  type="text"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm"
                  placeholder="https://... atau /assets/templates/..."
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Masukkan tautan URL foto cover yang ingin ditampilkan di katalog.
                </p>
              </div>

              {/* URL Demo */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  URL Live Demo
                </label>
                <input
                  type="text"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm"
                  placeholder="/demo/jawa-keraton-royal"
                />
              </div>

              {/* 3 Tingkat Harga (PRD asm.invitation) */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                <p className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  3 Paket Harga Resmi (PRD)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">
                      Paket Basic (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price_basic}
                      onChange={(e) =>
                        setFormData({ ...formData, price_basic: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-600 mb-1">
                      Paket Standard (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price_standard}
                      onChange={(e) =>
                        setFormData({ ...formData, price_standard: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-600 mb-1">
                      Paket Special (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price_special}
                      onChange={(e) =>
                        setFormData({ ...formData, price_special: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#4A151E] rounded focus:ring-[#4A151E]"
                />
                <label htmlFor="is_active" className="text-gray-700 font-medium cursor-pointer">
                  Tampilkan template ini di Katalog publik (Aktif)
                </label>
              </div>

              {/* Tombol Simpan / Batal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#4A151E] hover:bg-[#381118] rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? "Menyimpan..." : "Simpan Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
