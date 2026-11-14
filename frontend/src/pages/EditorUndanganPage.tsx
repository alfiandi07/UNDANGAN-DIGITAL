import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Invitation, EventDetails } from "../lib/api";
import "../styles/EditorUndangan.css";

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
              },
              wanita: {
                nama: data.event_details.mempelai?.wanita?.nama ?? "",
                panggilan: data.event_details.mempelai?.wanita?.panggilan ?? "",
                ayah: data.event_details.mempelai?.wanita?.ayah ?? "",
                ibu: data.event_details.mempelai?.wanita?.ibu ?? "",
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

    const max = invitation?.max_photos ?? 30;
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
    const max = invitation?.max_photos ?? 30;
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
    const linkUndangan = `http://103.247.11.210/${slug}?to=${encodeURIComponent(namaTamu)}`;

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
  const maxPhotosCount = invitation?.max_photos ?? 15;
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
            <span style={{ color: "#d1d5db" }}>/</span>
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
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
              Data Mempelai Pria & Wanita
            </h3>

            {/* Pria */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5] space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A151E]">
                🤵 Mempelai Pria
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Lengkap Mempelai Pria
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.pria?.nama ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          pria: { ...p.mempelai?.pria, nama: e.target.value },
                        },
                      }))
                    }
                    placeholder="Contoh: Dimas Pratama, S.Kom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.pria?.panggilan ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          pria: { ...p.mempelai?.pria, panggilan: e.target.value },
                        },
                      }))
                    }
                    placeholder="Dimas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Ayah Kandung
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.pria?.ayah ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          pria: { ...p.mempelai?.pria, ayah: e.target.value },
                        },
                      }))
                    }
                    placeholder="Bpk. Hendra Gunawan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Ibu Kandung
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.pria?.ibu ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          pria: { ...p.mempelai?.pria, ibu: e.target.value },
                        },
                      }))
                    }
                    placeholder="Ibu Siti Rahmawati"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
              </div>
            </div>

            {/* Wanita */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5] space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A151E]">
                👰 Mempelai Wanita
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Lengkap Mempelai Wanita
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.wanita?.nama ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          wanita: { ...p.mempelai?.wanita, nama: e.target.value },
                        },
                      }))
                    }
                    placeholder="Contoh: Adinda Putri Lestari, S.E"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.wanita?.panggilan ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          wanita: { ...p.mempelai?.wanita, panggilan: e.target.value },
                        },
                      }))
                    }
                    placeholder="Dinda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Ayah Kandung
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.wanita?.ayah ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          wanita: { ...p.mempelai?.wanita, ayah: e.target.value },
                        },
                      }))
                    }
                    placeholder="Bpk. Bambang Sudiro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Ibu Kandung
                  </label>
                  <input
                    type="text"
                    value={eventDetails.mempelai?.wanita?.ibu ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        mempelai: {
                          ...p.mempelai,
                          wanita: { ...p.mempelai?.wanita, ibu: e.target.value },
                        },
                      }))
                    }
                    placeholder="Ibu Ratna Dewi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JADWAL AKAD & RESEPSI */}
        {activeTab === "acara" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
              Jadwal & Lokasi Acara
            </h3>

            {/* Akad */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                💍 Waktu & Lokasi Akad Nikah / Pemberkatan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Akad</label>
                  <input
                    type="date"
                    value={eventDetails.akad?.tanggal ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        akad: { ...p.akad, tanggal: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Waktu / Jam (WIB)</label>
                  <input
                    type="text"
                    value={eventDetails.akad?.jam ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        akad: { ...p.akad, jam: e.target.value },
                      }))
                    }
                    placeholder="Contoh: 08:00 - 10:00 WIB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Gedung / Masjid</label>
                  <input
                    type="text"
                    value={eventDetails.akad?.lokasi ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        akad: { ...p.akad, lokasi: e.target.value },
                      }))
                    }
                    placeholder="Masjid Agung Al-Barkah Bekasi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tautan Google Maps</label>
                  <input
                    type="url"
                    value={eventDetails.akad?.maps_url ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        akad: { ...p.akad, maps_url: e.target.value },
                      }))
                    }
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={eventDetails.akad?.alamat ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        akad: { ...p.akad, alamat: e.target.value },
                      }))
                    }
                    placeholder="Jl. Veteran No. 46, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
              </div>
            </div>

            {/* Resepsi */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                🎉 Waktu & Lokasi Resepsi Pernikahan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Resepsi</label>
                  <input
                    type="date"
                    value={eventDetails.resepsi?.tanggal ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        resepsi: { ...p.resepsi, tanggal: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Waktu / Jam (WIB)</label>
                  <input
                    type="text"
                    value={eventDetails.resepsi?.jam ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        resepsi: { ...p.resepsi, jam: e.target.value },
                      }))
                    }
                    placeholder="Contoh: 11:00 - 14:00 WIB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Ballroom / Gedung</label>
                  <input
                    type="text"
                    value={eventDetails.resepsi?.lokasi ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        resepsi: { ...p.resepsi, lokasi: e.target.value },
                      }))
                    }
                    placeholder="Grand Ballroom Hotel Horison Bekasi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tautan Google Maps</label>
                  <input
                    type="url"
                    value={eventDetails.resepsi?.maps_url ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        resepsi: { ...p.resepsi, maps_url: e.target.value },
                      }))
                    }
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Lengkap Resepsi</label>
                  <textarea
                    rows={2}
                    value={eventDetails.resepsi?.alamat ?? ""}
                    onChange={(e) =>
                      setEventDetails((p) => ({
                        ...p,
                        resepsi: { ...p.resepsi, alamat: e.target.value },
                      }))
                    }
                    placeholder="Jl. KH. Noer Ali, Pekayon Jaya, Kota Bekasi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GALERI FOTO & MUSIK (FR-C2 LIMITER) */}
        {activeTab === "galeri" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-800">Galeri Foto & Musik Latar</h3>
                <p className="text-xs text-gray-500">
                  Paket <strong>{invitation?.package_type.toUpperCase()}</strong>: Kuota maksimal{" "}
                  <strong>{maxPhotosCount} foto</strong>.
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isQuotaFull ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {currentPhotosCount} / {maxPhotosCount} Foto Terpakai
                </span>
              </div>
            </div>

            {/* Input Tambah Foto atau Pemberitahuan Paket Standar */}
            {maxPhotosCount === 0 ? (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                <span className="text-3xl">📷</span>
                <h4 className="font-bold text-amber-900 text-sm">Paket Standar Tanpa Galeri Foto</h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                  Undangan Anda terdaftar pada <strong>Paket Standar</strong> dengan layout elegan tanpa galeri foto. Jika ingin menambahkan galeri hingga 30 foto berkualitas tinggi, silakan upgrade ke <strong>Paket Premium</strong>.
                </p>
              </div>
            ) : (
              <>
                {/* Uploader Langsung ke Cloudinary */}
                <div className="p-5 bg-sky-50/60 rounded-2xl border-2 border-dashed border-sky-300 space-y-3 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    accept="image/*"
                    disabled={isQuotaFull || uploadingPhoto}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">☁️</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        Unggah Foto Galeri ke Cloudinary
                      </h4>
                      <p className="text-xs text-gray-500">
                        Otomatis dikompresi ke format <strong>.WebP</strong> super ringan & tajam (Maks. 8 MB).
                      </p>
                    </div>

                    {uploadingPhoto ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 rounded-xl text-xs font-bold animate-pulse">
                        <span>⏳</span> {uploadProgressMsg || "Sedang mengunggah ke Cloudinary..."}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isQuotaFull}
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-40 cursor-pointer"
                      >
                        <span>📁</span>
                        {isQuotaFull ? "Kuota 30 Foto Penuh" : "Pilih Foto dari Galeri HP / PC"}
                      </button>
                    )}
                  </div>

                  {/* Input Alternatif URL Teks Manual */}
                  <div className="pt-3 border-t border-sky-200/60 flex items-center gap-2 text-left">
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">Atau URL luar:</span>
                    <input
                      type="url"
                      disabled={isQuotaFull || uploadingPhoto}
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://... URL foto luar"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#4A151E]"
                    />
                    <button
                      type="button"
                      disabled={isQuotaFull || !newPhotoUrl.trim() || uploadingPhoto}
                      onClick={handleTambahFoto}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

                {/* Grid Pratinjau Foto */}
                {eventDetails.photos && eventDetails.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {eventDetails.photos.map((foto, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-xs"
                      >
                        <img src={foto} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleHapusFoto(idx, foto)}
                          className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                          title="Hapus foto ini dari Cloudinary"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border border-dashed rounded-2xl">
                    <p className="text-sm">Belum ada foto yang ditambahkan ke galeri.</p>
                  </div>
                )}
              </>
            )}

            {/* Musik Latar */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Tautan Musik Latar / Background Audio (MP3 / Audio URL)
              </label>
              <input
                type="url"
                value={eventDetails.music_url ?? ""}
                onChange={(e) => setEventDetails((p) => ({ ...p, music_url: e.target.value }))}
                placeholder="https://... lagu-pernikahan.mp3"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
              />
              <p className="text-[11px] text-gray-400">
                Musik akan diputar otomatis secara lembut begitu tamu membuka sampul undangan.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: AMPLOP DIGITAL & LOVE STORY */}
        {activeTab === "amplop" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
              Amplop Digital Cashless (Kado & Doa)
            </h3>

            {/* Tambah Rekening */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Tambah Rekening Bank / e-Wallet:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  <option value="Dana">DANA</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                </select>
                <input
                  type="text"
                  value={newNoRek}
                  onChange={(e) => setNewNoRek(e.target.value)}
                  placeholder="Nomor Rekening / No. HP"
                  className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  value={newAtasNama}
                  onChange={(e) => setNewAtasNama(e.target.value)}
                  placeholder="Atas Nama Pemilik"
                  className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleTambahAmplop}
                className="px-4 py-2 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                + Daftarkan Rekening
              </button>
            </div>

            {/* Daftar Rekening */}
            {eventDetails.amplop && eventDetails.amplop.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eventDetails.amplop.map((rek, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                        {rek.bank}
                      </span>
                      <p className="font-mono font-bold text-gray-900 text-sm mt-1">{rek.no_rek}</p>
                      <p className="text-xs text-gray-500">a.n. {rek.atas_nama}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleHapusAmplop(idx)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold p-2 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Belum ada nomor rekening yang didaftarkan.</p>
            )}
          </div>
        )}

        {/* TAB 5: WHATSAPP GUEST LINK GENERATOR (FR-C3) */}
        {activeTab === "tamu" && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-800">
                WhatsApp Guest Link Generator (FR-C3)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ketik nama-nama tamu undangan (1 nama per baris), lalu klik tombol generate. Anda bisa langsung kirim tautan personalisasi ke WhatsApp mereka!
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Daftar Nama Tamu (Ketik 1 baris untuk setiap nama):
              </label>
              <textarea
                rows={5}
                value={guestInput}
                onChange={(e) => setGuestInput(e.target.value)}
                placeholder="Contoh:&#10;Bpk. Hendra & Keluarga&#10;Dr. Sarah Amelia&#10;Sahabat Andi Pratama&#10;Rian & Pasangan"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-xs font-sans outline-none focus:ring-2 focus:ring-[#4A151E]"
              />
              <button
                type="button"
                onClick={handleGenerateTamu}
                className="px-5 py-2.5 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                ⚡ Buat Tautan Sebar WhatsApp
              </button>
            </div>

            {/* Hasil Generate Tautan Tamu */}
            {guestList.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Daftar Tamu Siap Sebar ({guestList.length} Tamu):
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                  {guestList.map((nama, idx) => {
                    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      buatTeksWhatsApp(nama)
                    )}`;
                    return (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 bg-white hover:bg-gray-50/80 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                      >
                        <div>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">{nama}</p>
                          <p className="text-[11px] font-mono text-indigo-700">
                            undang_an.digital/{slug}?to={encodeURIComponent(nama)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSalinPesan(nama, idx)}
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
                          >
                            {copiedIndex === idx ? "✓ Tersalin!" : "📋 Salin Teks"}
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>📲</span> Kirim WA
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
