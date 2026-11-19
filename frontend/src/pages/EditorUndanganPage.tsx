import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Invitation, EventDetails } from "../lib/api";
import "../styles/EditorUndangan.css";
import FormMempelai from "../components/editor/FormMempelai";
import FormAcara from "../components/editor/FormAcara";
import FormGaleri from "../components/editor/FormGaleri";
import FormAmplop from "../components/editor/FormAmplop";
import FormTamuWhatsApp from "../components/editor/FormTamuWhatsApp";

export default function EditorUndanganPage() {
  const { slug } = useParams<{ slug: string }>();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"mempelai" | "acara" | "galeri" | "amplop" | "tamu">(
    "mempelai"
  );

  // Form State
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    mempelai: {
      pria: { nama: "", panggilan: "", ayah: "", ibu: "" },
      wanita: { nama: "", panggilan: "", ayah: "", ibu: "" },
    },
    akad: { tanggal: "", jam: "", lokasi: "", alamat: "", maps_url: "" },
    resepsi: { tanggal: "", jam: "", lokasi: "", alamat: "", maps_url: "" },
    music_url: "",
    amplop: [],
    photos: [],
    love_story: [],
  });

  // State Foto Input
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State Amplop Input
  const [newBank, setNewBank] = useState("BCA");
  const [newNoRek, setNewNoRek] = useState("");
  const [newAtasNama, setNewAtasNama] = useState("");

  // State WhatsApp Guest Generator (FR-C3)
  const [guestInput, setGuestInput] = useState("");
  const [guestList, setGuestList] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function muatUndangan() {
      if (!slug) return;
      setLoading(true);
      setError("");
      try {
        const data = await api.ambilDetailUndangan(slug);
        setInvitation(data);
        if (data.event_details) {
          setEventDetails({
            mempelai: {
              pria: {
                nama: data.event_details.mempelai?.pria?.nama ?? "",
                panggilan: data.event_details.mempelai?.pria?.panggilan ?? "",
                ayah: data.event_details.mempelai?.pria?.ayah ?? "",
                ibu: data.event_details.mempelai?.pria?.ibu ?? "",
                foto: data.event_details.mempelai?.pria?.foto ?? "",
              },
              wanita: {
                nama: data.event_details.mempelai?.wanita?.nama ?? "",
                panggilan: data.event_details.mempelai?.wanita?.panggilan ?? "",
                ayah: data.event_details.mempelai?.wanita?.ayah ?? "",
                ibu: data.event_details.mempelai?.wanita?.ibu ?? "",
                foto: data.event_details.mempelai?.wanita?.foto ?? "",
              },
            },
            akad: {
              tanggal: data.event_details.akad?.tanggal ?? "",
              jam: data.event_details.akad?.jam ?? "",
              lokasi: data.event_details.akad?.lokasi ?? "",
              alamat: data.event_details.akad?.alamat ?? "",
              maps_url: data.event_details.akad?.maps_url ?? "",
            },
            resepsi: {
              tanggal: data.event_details.resepsi?.tanggal ?? "",
              jam: data.event_details.resepsi?.jam ?? "",
              lokasi: data.event_details.resepsi?.lokasi ?? "",
              alamat: data.event_details.resepsi?.alamat ?? "",
              maps_url: data.event_details.resepsi?.maps_url ?? "",
            },
            music_url: data.event_details.music_url ?? "",
            amplop: data.event_details.amplop ?? [],
            photos: data.event_details.photos ?? [],
            love_story: data.event_details.love_story ?? [],
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat undangan");
      } finally {
        setLoading(false);
      }
    }

    muatUndangan();
  }, [slug]);

  async function handleSimpan(e: FormEvent) {
    e.preventDefault();
    if (!slug) return;

    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.simpanEventDetails(slug, eventDetails);
      setSuccessMsg("Detail acara berhasil disimpan!");
      setInvitation(res.invitation);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  // Foto Handlers (FR-C2 Cloudinary Uploader & Kuota Limiter)
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !slug) return;

    const max = invitation?.max_photos ?? 20;
    const current = eventDetails.photos?.length ?? 0;

    if (max === 0) {
      alert("Paket Standar tidak menyertakan fitur galeri foto.");
      e.target.value = "";
      return;
    }

    if (current >= max) {
      alert(`Kuota foto maksimal (${max} foto) sudah tercapai!`);
      e.target.value = "";
      return;
    }

    const file = files[0];
    setUploadingPhoto(true);
    setUploadProgressMsg("Mengunggah & mengompresi ke WebP Cloudinary...");

    try {
      const res = await api.uploadFotoCloudinary(slug, file);
      setEventDetails((prev) => ({
        ...prev,
        photos: [...(prev.photos ?? []), res.photo_url],
      }));
      if (invitation) {
        setInvitation({
          ...invitation,
          current_photos: res.current_photos,
        });
      }
      setUploadProgressMsg("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  function handleTambahFoto() {
    if (!newPhotoUrl.trim()) return;
    const max = invitation?.max_photos ?? 20;
    const current = eventDetails.photos?.length ?? 0;

    if (max === 0) {
      alert("Paket Standar tidak menyertakan fitur galeri foto.");
      return;
    }

    if (current >= max) {
      alert(`Kuota foto maksimal (${max} foto) sudah tercapai!`);
      return;
    }

    setEventDetails((prev) => ({
      ...prev,
      photos: [...(prev.photos ?? []), newPhotoUrl.trim()],
    }));
    setNewPhotoUrl("");
  }

  async function handleHapusFoto(idx: number, photoUrl?: string) {
    if (!confirm("Hapus foto ini dari galeri?")) return;

    if (slug && photoUrl && photoUrl.includes("cloudinary.com")) {
      try {
        await api.hapusFotoCloudinary(slug, photoUrl);
      } catch (e) {
        console.warn("Gagal menghapus dari Cloudinary, melanjutkan hapus lokal:", e);
      }
    }

    setEventDetails((prev) => ({
      ...prev,
      photos: (prev.photos ?? []).filter((_, i) => i !== idx),
    }));

    if (invitation) {
      setInvitation({
        ...invitation,
        current_photos: Math.max(0, (invitation.current_photos || 1) - 1),
      });
    }
  }

  // Amplop Handlers
  function handleTambahAmplop() {
    if (!newNoRek.trim() || !newAtasNama.trim()) {
      alert("Nomor rekening dan nama pemilik wajib diisi");
      return;
    }
    setEventDetails((prev) => ({
      ...prev,
      amplop: [
        ...(prev.amplop ?? []),
        { bank: newBank, no_rek: newNoRek.trim(), atas_nama: newAtasNama.trim() },
      ],
    }));
    setNewNoRek("");
    setNewAtasNama("");
  }

  function handleHapusAmplop(idx: number) {
    setEventDetails((prev) => ({
      ...prev,
      amplop: (prev.amplop ?? []).filter((_, i) => i !== idx),
    }));
  }

  // WhatsApp Guest List Generator (FR-C3)
  function handleGenerateTamu() {
    const lines = guestInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setGuestList(lines);
  }

  function buatTeksWhatsApp(namaTamu: string): string {
    const pria = eventDetails.mempelai?.pria?.panggilan || "Mempelai Pria";
    const wanita = eventDetails.mempelai?.wanita?.panggilan || "Mempelai Wanita";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://asminvitation.my.id";
    const linkUndangan = `${baseUrl}/${slug}?to=${encodeURIComponent(namaTamu)}`;

    return `Kepada Yth. Bapak/Ibu/Saudara/i *${namaTamu}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di momen bahagia pernikahan kami:\n\n*${pria} & ${wanita}*\n\nInformasi lengkap dan tautan undangan digital dapat diakses pada link berikut:\n${linkUndangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;
  }

  function handleSalinPesan(namaTamu: string, idx: number) {
    const teks = buatTeksWhatsApp(namaTamu);
    navigator.clipboard.writeText(teks);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3E2F] mb-3" />
        <p className="text-sm">Memuat editor acara...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-center max-w-lg mx-auto space-y-3">
        <p className="font-bold">Terjadi Kesalahan</p>
        <p className="text-xs">{error}</p>
        <Link
          to="/dashboard/transaksi"
          className="inline-block px-4 py-2 bg-[#2D3E2F] text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Daftar Undangan
        </Link>
      </div>
    );
  }

  const currentPhotosCount = eventDetails.photos?.length ?? 0;
  const maxPhotosCount = invitation?.max_photos ?? 20;
  const isQuotaFull = currentPhotosCount >= maxPhotosCount;

  return (
    <div className="editor-page-container">
      {/* Header Bar */}
      <div className="editor-topbar">
        <div>
          <div className="editor-breadcrumbs">
            <Link to="/dashboard/transaksi" className="editor-breadcrumb-link">
              ← Undangan Saya
            </Link>
            <span className="editor-breadcrumb-separator">/</span>
            <span className="editor-breadcrumb-slug">/{slug}</span>
          </div>
          <h2 className="editor-title">Editor Detail Acara Undangan</h2>
          <p className="editor-meta">
            Template: <strong>{invitation?.template_title}</strong> • Paket:{" "}
            <span className="editor-meta-package">{invitation?.package_type}</span>
          </p>
        </div>

        <div className="editor-topbar-actions">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="editor-btn-preview"
          >
            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Pratinjau Web</span>
          </a>
          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="editor-btn-save"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="editor-alert-success flex items-center gap-2">
          <svg className="w-4 h-4 text-[#3A5438] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="editor-alert-error flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="editor-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab("mempelai")}
          className={`editor-tab-btn ${activeTab === "mempelai" ? "editor-tab-btn--active" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Mempelai &amp; Orang Tua</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("acara")}
          className={`editor-tab-btn ${activeTab === "acara" ? "editor-tab-btn--active" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Jadwal Akad &amp; Resepsi</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("galeri")}
          className={`editor-tab-btn ${activeTab === "galeri" ? "editor-tab-btn--active" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Galeri &amp; Musik ({currentPhotosCount}/{maxPhotosCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("amplop")}
          className={`editor-tab-btn ${activeTab === "amplop" ? "editor-tab-btn--active" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Amplop Digital &amp; Cerita</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tamu")}
          className={`editor-tab-btn ${activeTab === "tamu" ? "editor-tab-btn--active" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Sebar Tautan WhatsApp (FR-C3)</span>
        </button>
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSimpan} className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-xs border border-[#DCD7CA]">
        {/* TAB 1: MEMPELAI & ORANG TUA */}
        {activeTab === "mempelai" && (
          <FormMempelai
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
          />
        )}

        {/* TAB 2: JADWAL AKAD & RESEPSI */}
        {activeTab === "acara" && (
          <FormAcara
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
          />
        )}

        {/* TAB 3: GALERI FOTO & MUSIK (FR-C2 LIMITER) */}
        {activeTab === "galeri" && (
          <FormGaleri
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
            invitation={invitation}
            maxPhotosCount={maxPhotosCount}
            currentPhotosCount={currentPhotosCount}
            isQuotaFull={isQuotaFull}
            uploadingPhoto={uploadingPhoto}
            uploadProgressMsg={uploadProgressMsg}
            newPhotoUrl={newPhotoUrl}
            setNewPhotoUrl={setNewPhotoUrl}
            fileInputRef={fileInputRef}
            handleFileSelected={handleFileSelected}
            handleTambahFoto={handleTambahFoto}
            handleHapusFoto={handleHapusFoto}
          />
        )}

        {/* TAB 4: AMPLOP DIGITAL & LOVE STORY */}
        {activeTab === "amplop" && (
          <FormAmplop
            eventDetails={eventDetails}
            newBank={newBank}
            setNewBank={setNewBank}
            newNoRek={newNoRek}
            setNewNoRek={setNewNoRek}
            newAtasNama={newAtasNama}
            setNewAtasNama={setNewAtasNama}
            handleTambahAmplop={handleTambahAmplop}
            handleHapusAmplop={handleHapusAmplop}
          />
        )}

        {/* TAB 5: WHATSAPP GUEST LINK GENERATOR (FR-C3) */}
        {activeTab === "tamu" && (
          <FormTamuWhatsApp
            slug={slug || ""}
            guestInput={guestInput}
            setGuestInput={setGuestInput}
            guestList={guestList}
            copiedIndex={copiedIndex}
            handleGenerateTamu={handleGenerateTamu}
            handleSalinPesan={handleSalinPesan}
            buatTeksWhatsApp={buatTeksWhatsApp}
          />
        )}

        {/* Bottom Save Bar */}
        <div className="pt-6 border-t border-[#DCD7CA] flex justify-end gap-3">
          <Link
            to="/dashboard/transaksi"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F7F5EE] rounded-xl transition-colors"
          >
            Kembali
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-[#2D3E2F] hover:bg-[#1E2B20] text-white rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan Acara"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
