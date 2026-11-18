import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Template, DataTemplateInput } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import TemplateModalForm from "../components/template/TemplateModalForm";
import "./ProdukPage.css";

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
    package_type: "standard",
    price: 99000,
    theme_style: "Modern Minimalis",
    thumbnail_url: "",
    demo_url: "",
    price_basic: 99000,
    price_standard: 99000,
    price_special: 99000,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);

  async function muatData() {
    setLoading(true);
    setError("");
    try {
      const data = await api.ambilSemuaTemplatesAdmin();
      setTemplateList(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat template undangan",
      );
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
    setZipFile(null);
    setFormData({
      title: "",
      slug: "",
      category: "" as any,
      package_type: "standard",
      price: 99000,
      theme_style: "Modern Minimalis",
      thumbnail_url: "",
      demo_url: "",
      price_basic: 99000,
      price_standard: 99000,
      price_special: 99000,
      is_active: true,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function handleBukaEdit(item: Template) {
    setEditId(item.id);
    setZipFile(null);
    const tier = item.package_type || "standard";
    const price = item.price || item.price_standard || 99000;
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category,
      package_type: tier,
      price: price,
      theme_style: item.theme_style,
      thumbnail_url: item.thumbnail_url || "",
      demo_url: item.demo_url || `/demo/${item.slug}`,
      price_basic: item.price_basic || price,
      price_standard: item.price_standard || price,
      price_special: item.price_special || price,
      is_active: Boolean(item.is_active),
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSimpan(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    // Validasi Wajib Kategori
    if (!formData.category || String(formData.category).trim() === "") {
      setFormError("Kategori wajib diisi");
      return;
    }

    if (!formData.title || !formData.slug) {
      setFormError("Judul dan slug template wajib diisi");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setFormError("Harga template wajib diisi dan harus lebih dari 0");
      return;
    }

    setSubmitting(true);
    try {
      if (zipFile) {
        const payloadZip = new FormData();
        payloadZip.append("file", zipFile);
        payloadZip.append("title", formData.title.trim());
        payloadZip.append("slug", formData.slug.trim());
        payloadZip.append("category", formData.category);
        payloadZip.append("package_type", formData.package_type || "standard");
        payloadZip.append("price", String(formData.price || 99000));
        payloadZip.append(
          "theme_style",
          (formData.theme_style || "Custom ZIP").trim(),
        );
        payloadZip.append(
          "thumbnail_url",
          (formData.thumbnail_url || "").trim(),
        );

        await api.uploadTemplateZip(payloadZip);
      } else {
        const payload = {
          ...formData,
          price_standard: formData.price,
          price_basic: formData.price,
          price_special: formData.price,
        };

        if (editId) {
          await api.ubahTemplate(editId, payload);
        } else {
          await api.tambahTemplate(payload);
        }
      }
      setZipFile(null);
      setIsModalOpen(false);
      await muatData();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Gagal menyimpan template",
      );
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
      alert(
        err instanceof Error ? err.message : "Gagal mengubah status template",
      );
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
            Studio Kolektif: Atur katalog template, upload gambar cover, harga 3
            paket, dan tautan demo.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleBukaTambah}
            className="btn-primary-action"
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
      <div className="produk-card">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
            <p className="text-sm">Memuat data template...</p>
          </div>
        ) : templateList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-base font-semibold">Belum ada master template</p>
            <p className="text-sm mt-1">
              Klik tombol &ldquo;Tambah Template Baru&rdquo; untuk mendaftarkan
              template pertama Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="produk-table-header">
                <tr>
                  <th className="produk-table-th">Preview</th>
                  <th className="produk-table-th">Template & Slug</th>
                  <th className="produk-table-th">Kategori & Paket</th>
                  <th className="produk-table-th">Harga Produk</th>
                  <th className="produk-table-th">Status</th>
                  <th className="produk-table-th text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templateList.map((item) => (
                  <tr key={item.id} className="produk-table-row">
                    {/* Thumbnail */}
                    <td className="produk-table-td">
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
                          <span className="text-xs text-gray-400 font-medium">
                            Polos
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Judul & Slug */}
                    <td className="produk-table-td">
                      <p className="font-bold text-gray-900 text-base">
                        {item.title}
                      </p>
                      <p className="text-xs text-indigo-600 font-mono mt-0.5">
                        /{item.slug}
                      </p>
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

                    {/* Kategori & Paket */}
                    <td className="produk-table-td">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge-category">
                          {item.category}
                        </span>
                        {item.package_type === "premium" ? (
                          <span className="badge-tier-premium">
                            👑 PREMIUM
                          </span>
                        ) : (
                          <span className="badge-tier-standard">
                            ⚡ STANDAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {item.theme_style}
                      </p>
                    </td>

                    {/* Harga Produk */}
                    <td className="produk-table-td">
                      <p className="text-base font-extrabold text-[#4A151E]">
                        {formatRupiah(
                          item.price || item.price_standard || 99000,
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.package_type === "premium"
                          ? "Maks. 10 Foto • 12 Bln"
                          : "Tanpa Foto • 6 Bln"}
                      </p>
                    </td>

                    {/* Status Aktif */}
                    <td className="produk-table-td">
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
                    <td className="produk-table-td text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleBukaEdit(item)}
                          className="btn-action-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleHapus(item.id, item.title)}
                          className="btn-action-delete"
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
      <TemplateModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setZipFile(null);
          setIsModalOpen(false);
        }}
        editId={editId}
        formData={formData}
        setFormData={setFormData}
        zipFile={zipFile}
        setZipFile={setZipFile}
        onSubmit={handleSimpan}
        submitting={submitting}
        formError={formError}
        onJudulChange={handleJudulChange}
        generateSlug={generateSlug}
      />
    </div>
  );
}
