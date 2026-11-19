import {
  useState,
  useRef,
  type FormEvent,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import * as api from "../../lib/api";
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
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverLoadError, setCoverLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePilihCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih berkas foto gambar (JPG, PNG, atau WEBP)");
      return;
    }

    setUploadingCover(true);
    setCoverLoadError(false);
    try {
      const fd = new FormData();
      fd.append("cover", file);
      const res = await api.uploadCoverTemplate(fd);
      setFormData((prev) => ({ ...prev, thumbnail_url: res.url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto cover");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!isOpen) return null;

  return (
    <div className="template-modal-overlay">
      <div className="template-modal-container">
        {/* 1. Header (Sticky) */}
        <div className="template-modal-header">
          <div className="template-modal-header-left">
            <div className="template-modal-header-icon">
              {editId ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="template-modal-title">
                {editId ? "Edit Master Template" : "Tambah Master Template"}
              </h3>
              <p className="template-modal-subtitle">
                {editId
                  ? `Mengubah rincian template: ${formData.title || formData.slug}`
                  : "Tambahkan template baru untuk katalog publik."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="template-modal-close-btn"
            title="Tutup Form (Esc)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <form onSubmit={onSubmit} className="template-modal-form">
          <div className="template-modal-body">
            {formError && (
              <div className="template-modal-error-banner">
                <svg
                  className="w-4 h-4 shrink-0 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {/* Bagian 1: Identitas Template */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="form-field-group">
                  <label className="form-field-label">
                    Judul Template{" "}
                    <span className="form-field-label-req">*</span>
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

                <div className="form-field-group">
                  <label className="form-field-label">
                    Slug Tautan <span className="form-field-label-req">*</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="form-field-group">
                  <label className="form-field-label">
                    Kategori Acara{" "}
                    <span className="form-field-label-req">*</span>
                  </label>
                  <select
                    required
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target
                          .value as DataTemplateInput["category"],
                      })
                    }
                    className={`form-field-input ${
                      !formData.category
                        ? "border-amber-300 bg-amber-50/20"
                        : ""
                    }`}
                  >
                    <option value="">-- Pilih Kategori Acara --</option>
                    <option value="wedding">Pernikahan (Wedding)</option>
                    <option value="khitan">Khitanan (Khitan)</option>
                    <option value="birthday">Ulang Tahun (Birthday)</option>
                    <option value="aqiqah">Aqiqah (Aqiqah)</option>
                  </select>
                  {!formData.category && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      Pilih kategori agar template terkelompok dengan benar di
                      katalog.
                    </p>
                  )}
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Gaya / Tema Adat</label>
                  <input
                    type="text"
                    required
                    value={formData.theme_style}
                    onChange={(e) =>
                      setFormData({ ...formData, theme_style: e.target.value })
                    }
                    className="form-field-input"
                    placeholder="Contoh: Adat Jawa, Modern Minimalist, Islamic"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Paket & Harga */}
            <div className="form-section-divider">
              <span className="form-section-title">
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Paket Desain &amp; Penentuan Harga
              </span>

              {/* Tipe Paket Desain (Standar vs Premium) */}
              <div className="form-field-group">
                <label className="form-field-label">
                  Tipe Paket Desain{" "}
                  <span className="form-field-label-req">*</span>
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
                    <div>
                      <div className="tier-card-header">
                        <span className="tier-card-title">
                          <svg
                            className="w-3.5 h-3.5 text-slate-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          STANDAR
                        </span>
                        <div
                          className={`tier-card-radio ${
                            formData.package_type === "standard"
                              ? "tier-card-radio--active-standard"
                              : ""
                          }`}
                        >
                          {formData.package_type === "standard" && (
                            <div className="tier-card-radio-dot" />
                          )}
                        </div>
                      </div>
                      <p className="tier-card-desc">
                        Desain clean &amp; responsif •{" "}
                        <strong>Tanpa galeri foto</strong> • Masa aktif 6 bulan
                      </p>
                    </div>
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
                    <div>
                      <div className="tier-card-header">
                        <span className="tier-card-title text-amber-900">
                          <svg
                            className="w-3.5 h-3.5 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                          PREMIUM
                        </span>
                        <div
                          className={`tier-card-radio ${
                            formData.package_type === "premium"
                              ? "tier-card-radio--active-premium"
                              : ""
                          }`}
                        >
                          {formData.package_type === "premium" && (
                            <div className="tier-card-radio-dot" />
                          )}
                        </div>
                      </div>
                      <p className="tier-card-desc">
                        Desain mewah • <strong>Galeri 20 foto</strong> • Musik
                        autoplay • Masa aktif 12 bulan
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Box Input Harga Template */}
              <div className="price-input-box">
                <div className="price-input-header">
                  <label>
                    Harga Template (Rp){" "}
                    <span className="form-field-label-req">*</span>
                  </label>
                  <span>Ditentukan bebas oleh Admin</span>
                </div>
                <div className="price-input-wrapper">
                  <span className="price-input-prefix">Rp</span>
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
                  Nominal ini yang akan ditagihkan kepada pembeli saat memesan
                  template ini.
                </p>
              </div>
            </div>

            {/* Bagian 3: Media & Berkas */}
            <div className="form-section-divider">
              <span className="form-section-title">
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Media &amp; Berkas Template
              </span>

              {/* Foto Cover Thumbnail (Upload Gambar Asli) */}
              <div className="cover-upload-section">
                <label className="form-field-label">
                  Foto Cover Template (Thumbnail)
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handlePilihCover}
                />

                {formData.thumbnail_url && !coverLoadError ? (
                  /* Card Preview jika foto sudah ada / terpilih */
                  <div className="cover-preview-card">
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview Cover"
                      className="cover-preview-img"
                      onError={() => setCoverLoadError(true)}
                    />
                    <div className="cover-preview-info">
                      <span className="cover-preview-badge">
                        <svg
                          className="w-3 h-3 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {uploadingCover ? "Mengunggah..." : "Foto Terpasang"}
                      </span>
                      <span
                        className="cover-preview-url"
                        title={formData.thumbnail_url}
                      >
                        {formData.thumbnail_url}
                      </span>
                      <div className="cover-preview-actions">
                        <button
                          type="button"
                          disabled={uploadingCover}
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-cover-replace"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          {uploadingCover ? "Mengunggah..." : "Ganti Foto"}
                        </button>
                        <button
                          type="button"
                          disabled={uploadingCover}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              thumbnail_url: "",
                            }))
                          }
                          className="btn-cover-remove"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-rose-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Kotak Upload jika belum ada foto */
                  <div
                    onClick={() =>
                      !uploadingCover && fileInputRef.current?.click()
                    }
                    className="cover-upload-box"
                  >
                    <div className="cover-upload-icon">
                      <svg
                        className="w-5 h-5 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="cover-upload-text">
                      {uploadingCover
                        ? "Sedang mengunggah foto..."
                        : "Klik untuk memilih foto cover dari komputer / HP"}
                    </p>
                    <p className="cover-upload-hint">
                      Format didukung: JPG, PNG, atau WEBP (Maksimal 8 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Upload File ZIP Template */}
              <div className="zip-upload-container">
                <div className="zip-upload-header">
                  <label className="form-field-label">
                    Upload Berkas Template (.ZIP){" "}
                    <span className="text-slate-400 font-normal">
                      (Opsional jika URL demo diisi manual)
                    </span>
                  </label>
                </div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                  className="zip-file-input"
                />
                <p className="form-field-hint">
                  Wajib format <strong>.zip</strong> yang berisi{" "}
                  <code>index.html</code> serta folder assets. Sistem akan
                  otomatis mengekstrak &amp; memperbarui tautan live demo.
                </p>
                {zipFile && (
                  <p className="zip-file-selected">
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      Berkas terpilih: <strong>{zipFile.name}</strong> (
                      {(zipFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </p>
                )}

                {/* Panduan Struktur Folder ZIP */}
                <TemplateZipGuide />
              </div>
            </div>

            {/* Bagian 4: Pengaturan Publikasi */}
            <div className="form-section-divider">
              <span className="form-section-title">
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Pengaturan Publikasi
              </span>

              {/* URL Demo */}
              <div className="form-field-group">
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
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-[#2D3E2F] rounded-md border-slate-300 focus:ring-[#2D3E2F] cursor-pointer"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs text-slate-700 font-medium cursor-pointer select-none"
                >
                  Tampilkan template ini di katalog publik (Status Aktif)
                </label>
              </div>
            </div>
          </div>

          {/* 3. Footer (Sticky) */}
          <div className="template-modal-footer">
            <button type="button" onClick={onClose} className="btn-form-cancel">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-form-submit"
            >
              {submitting ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Template</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
