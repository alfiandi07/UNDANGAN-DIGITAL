import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Template, DataTemplateInput } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import TemplateModalForm from "../components/template/TemplateModalForm";
import { sanitizeUrl } from "../utils/sanitizeUrl";
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
      <div className="bg-white p-8 rounded-2xl border border-[#DCD7CA] text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800">Akses Terbatas</h3>
        <p className="text-xs text-slate-500">
          Halaman kelola master template hanya dapat diakses oleh Admin Studio.
        </p>
        <Link
          to="/dashboard/transaksi"
          className="inline-block px-5 py-2.5 bg-[#2D3E2F] hover:bg-[#1E2B20] text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Lihat Undangan Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-[#DCD7CA]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight">
            Kelola Master Template Undangan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Studio Kolektif: Atur katalog template, upload gambar cover, harga paket, dan tautan demo live.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleBukaTambah}
            className="btn-primary-action"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Template Baru</span>
          </button>
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

      {/* Tabel Template */}
      <div className="produk-card">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3E2F] mb-3" />
            <p className="text-xs">Memuat data template...</p>
          </div>
        ) : templateList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-700">Belum ada master template</p>
            <p className="text-xs mt-1">
              Klik tombol &ldquo;Tambah Template Baru&rdquo; untuk mendaftarkan
              template pertama Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="produk-table-header">
                <tr>
                  <th className="produk-table-th">Preview</th>
                  <th className="produk-table-th">Template &amp; Slug</th>
                  <th className="produk-table-th">Kategori &amp; Paket</th>
                  <th className="produk-table-th">Harga Produk</th>
                  <th className="produk-table-th">Status</th>
                  <th className="produk-table-th text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD7CA]/60">
                {templateList.map((item) => (
                  <tr key={item.id} className="produk-table-row">
                    {/* Thumbnail */}
                    <td className="produk-table-td">
                      <div className="w-14 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/80 flex items-center justify-center shrink-0">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Polos
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Judul & Slug */}
                    <td className="produk-table-td">
                      <p className="font-bold text-slate-900 text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        /{item.slug}
                      </p>
                      {item.demo_url && (
                        <a
                          href={sanitizeUrl(item.demo_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-[#2D3E2F] mt-1.5 transition-colors"
                        >
                          <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>Demo: {item.demo_url}</span>
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
                            <svg className="w-3 h-3 text-[#82622B] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            PREMIUM
                          </span>
                        ) : (
                          <span className="badge-tier-standard">
                            <svg className="w-3 h-3 text-[#3A5438] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            STANDAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {item.theme_style}
                      </p>
                    </td>

                    {/* Harga Produk */}
                    <td className="produk-table-td">
                      <p className="text-sm font-bold text-[#2D3E2F]">
                        {formatRupiah(
                          item.price || item.price_standard || 99000,
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.package_type === "premium"
                          ? "Maks. 20 Foto • 12 Bln"
                          : "Tanpa Foto • 6 Bln"}
                      </p>
                    </td>

                    {/* Status Aktif */}
                    <td className="produk-table-td">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border cursor-pointer transition-colors ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Klik untuk ubah status tampil di katalog"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span>{item.is_active ? "Aktif di Katalog" : "Nonaktif"}</span>
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="produk-table-td text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleBukaEdit(item)}
                          className="btn-action-edit"
                          title="Edit Template"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleHapus(item.id, item.title)}
                          className="btn-action-delete"
                          title="Hapus Template"
                        >
                          <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
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
