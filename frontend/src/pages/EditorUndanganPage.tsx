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

    return `Kepada Yth. Bapak/Ibu/Saudara/i *${namaTamu}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di momen bahagia pernikahan kami:\n\n*${pria} & ${wanita}*\n\nInformasi lengkap dan tautan undangan digital dapat diakses pada link berikut:\n${linkUndangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih 🤍`;
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
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
          className="inline-block px-4 py-2 bg-[#4A151E] text-white rounded-xl text-xs font-bold"
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
            👁️ Pratinjau Web
          </a>
          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="editor-btn-save"
          >
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="editor-alert-success">
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="editor-alert-error">
          ❌ {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="editor-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab("mempelai")}
          className={`editor-tab-btn ${activeTab === "mempelai" ? "editor-tab-btn--active" : ""}`}
        >
          👫 Mempelai & Orang Tua
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("acara")}
          className={`editor-tab-btn ${activeTab === "acara" ? "editor-tab-btn--active" : ""}`}
        >
          📅 Jadwal Akad & Resepsi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("galeri")}
          className={`editor-tab-btn ${activeTab === "galeri" ? "editor-tab-btn--active" : ""}`}
        >
          📸 Galeri & Musik ({currentPhotosCount}/{maxPhotosCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("amplop")}
          className={`editor-tab-btn ${activeTab === "amplop" ? "editor-tab-btn--active" : ""}`}
        >
          💌 Amplop Digital & Cerita
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tamu")}
          className={`editor-tab-btn ${activeTab === "tamu" ? "editor-tab-btn--active" : ""}`}
        >
          📲 Sebar Tautan WhatsApp (FR-C3)
        </button>
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSimpan} className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-xs border border-gray-100">
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
        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link
            to="/dashboard/transaksi"
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition"
          >
            Kembali
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan Acara"}
          </button>
        </div>
      </form>
    </div>
  );
}
