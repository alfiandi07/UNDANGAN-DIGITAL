import type { FormEvent, Dispatch, SetStateAction } from "react";
import type { DataTemplateInput } from "../../lib/api";
import TemplateZipGuide from "./TemplateZipGuide";
import "../../styles/TemplateModalForm.css";

interface TemplateModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  editId: number | null;
  formData: DataTemplateInput;
  setFormData: Dispatch<SetStateAction<DataTemplateInput>>;
  zipFile: File | null;
  setZipFile: Dispatch<SetStateAction<File | null>>;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  formError: string;
  onJudulChange: (judul: string) => void;
  generateSlug: (text: string) => string;
}

export default function TemplateModalForm({
  isOpen,
  onClose,
  editId,
  formData,
  setFormData,
  zipFile,
  setZipFile,
  onSubmit,
  submitting,
  formError,
  onJudulChange,
  generateSlug,
}: TemplateModalFormProps) {
  if (!isOpen) return null;

  return (
    <div className="template-modal-overlay">
      <div className="template-modal-container">
        
        {/* 1. Header (Sticky) */}
        <div className="template-modal-header">
          <div>
            <h3 className="template-modal-title">
              {editId ? "✏️ Edit Master Template" : "➕ Tambah Master Template Baru"}
            </h3>
            <p className="template-modal-subtitle">
              {editId
                ? `Mengubah template: ${formData.title || formData.slug}`
                : "Isi data template undangan yang akan ditampilkan di katalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="template-modal-close-btn"
            title="Tutup Form (Esc)"
          >
            ✕
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <form onSubmit={onSubmit} className="template-modal-form">
          <div className="template-modal-body">
            {formError && (
              <div className="template-modal-error-banner">
                {formError}
              </div>
            )}

            {/* Judul & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-field-label">
                  Judul Template <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => onJudulChange(e.target.value)}
                  className="form-field-input"
                  placeholder="Contoh: Jawa Keraton Royal"
                />
              </div>

              <div>
                <label className="form-field-label">
                  Slug Tautan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  className="form-field-input-mono"
                  placeholder="jawa-keraton-royal"
                />
              </div>
            </div>

            {/* Kategori Acara & Gaya Tema */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-field-label">
                  Kategori Acara <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as DataTemplateInput["category"],
                    })
                  }
                  className={`form-field-input ${
                    !formData.category ? "border-amber-400 bg-amber-50/20" : ""
                  }`}
                >
                  <option value="">-- Pilih Kategori Acara (Wajib) --</option>
                  <option value="wedding">Pernikahan (wedding)</option>
                  <option value="khitan">Khitanan (khitan)</option>
                  <option value="birthday">Ulang Tahun (birthday)</option>
                  <option value="aqiqah">Aqiqah (aqiqah)</option>
                </select>
                {!formData.category && (
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    Kategori wajib dipilih sebelum menyimpan.
                  </p>
                )}
              </div>

              <div>
                <label className="form-field-label">Gaya / Tema Adat</label>
                <input
                  type="text"
                  required
                  value={formData.theme_style}
                  onChange={(e) =>
                    setFormData({ ...formData, theme_style: e.target.value })
                  }
                  className="form-field-input"
                  placeholder="Contoh: Adat Jawa, Modern, Islamic"
                />
              </div>
            </div>

            {/* Tipe Paket Desain (Standar vs Premium) */}
            <div>
              <label className="form-field-label">
                Tipe Paket Desain <span className="text-red-500">*</span>
              </label>
              <div className="tier-selection-grid">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, package_type: "standard" })
                  }
                  className={`tier-card-btn ${
                    formData.package_type === "standard"
                      ? "tier-card-btn--standard-active"
                      : ""
                  }`}
                >
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    ⚡ STANDAR
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Desain clean & elegan • <strong>Tanpa galeri foto</strong> •
                    Masa aktif 6 bulan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, package_type: "premium" })
                  }
                  className={`tier-card-btn ${
                    formData.package_type === "premium"
                      ? "tier-card-btn--premium-active"
                      : ""
                  }`}
                >
                  <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    👑 PREMIUM
                  </span>
                  <span className="text-xs text-amber-800 mt-1">
                    Desain mewah • <strong>Galeri 30 foto</strong> • Musik
                    autoplay • Masa aktif 12 bulan
                  </span>
                </button>
              </div>
            </div>

            {/* Box Input Harga Template */}
            <div className="price-input-box">
              <div className="price-input-header">
                <label className="block font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Harga Produk Template (Rp){" "}
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-500 font-medium">
                  Ditentukan bebas oleh Admin
                </span>
              </div>
              <div className="price-input-wrapper">
                <span className="price-input-prefix">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                      price_standard: Number(e.target.value),
                      price_basic: Number(e.target.value),
                      price_special: Number(e.target.value),
                    })
                  }
                  className="price-input-field"
                  placeholder="Contoh: 99000"
                />
              </div>
              <p className="form-field-hint">
                Harga nominal ini yang akan langsung ditagihkan kepada pembeli
                saat memesan template ini.
              </p>
            </div>

            {/* URL Cover Image */}
            <div>
              <label className="form-field-label">
                URL Gambar Cover (Thumbnail)
              </label>
              <input
                type="text"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
                className="form-field-input"
                placeholder="https://... atau /assets/templates/..."
              />
              <p className="form-field-hint">
                Masukkan tautan URL foto cover yang ingin ditampilkan di katalog.
              </p>
            </div>

            {/* Upload File ZIP Template */}
            <div className="zip-upload-container">
              <label className="block font-bold text-gray-800 text-xs">
                📦 Upload Berkas Template (.ZIP){" "}
                <span className="text-gray-400 font-normal">
                  (Opsional jika URL demo diisi manual)
                </span>
              </label>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#4A151E] file:text-white file:font-semibold hover:file:opacity-90 cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
              />
              <p className="text-[11px] text-gray-500">
                Wajib format <strong>.zip</strong> yang berisi{" "}
                <code>index.html</code>, berkas CSS/JS/assets. Sistem akan
                otomatis mengekstrak &amp; memperbarui tautan live demo.
              </p>
              {zipFile && (
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  ✓ Berkas terpilih: {zipFile.name} (
                  {(zipFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}

              {/* Panduan Struktur Folder ZIP */}
              <TemplateZipGuide />
            </div>

            {/* URL Demo */}
            <div>
              <label className="form-field-label">URL Live Demo</label>
              <input
                type="text"
                value={formData.demo_url}
                onChange={(e) =>
                  setFormData({ ...formData, demo_url: e.target.value })
                }
                className="form-field-input"
                placeholder="/demo/jawa-keraton-royal"
              />
            </div>

            {/* Checkbox Status Aktif */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-[#4A151E] rounded focus:ring-[#4A151E]"
              />
              <label
                htmlFor="is_active"
                className="text-gray-700 font-medium cursor-pointer"
              >
                Tampilkan template ini di Katalog publik (Aktif)
              </label>
            </div>
          </div>

          {/* 3. Footer (Sticky) */}
          <div className="template-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-form-cancel"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-form-submit"
            >
              {submitting ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
