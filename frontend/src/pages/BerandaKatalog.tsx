import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Template } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function BerandaKatalog() {
  const { user } = useAuth();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [keyword, setKeyword] = useState("");

  // Modal Slug Checker State (PRD FR-A3)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [slugInput, setSlugInput] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugResult, setSlugResult] = useState<{ available: boolean; message: string } | null>(null);

  const kategoriPilihan = [
    { label: "Semua Acara", val: "Semua" },
    { label: "💍 Pernikahan", val: "wedding" },
    { label: "✂️ Khitanan", val: "khitan" },
    { label: "🎂 Ulang Tahun", val: "birthday" },
    { label: "👶 Aqiqah", val: "aqiqah" },
  ];

  useEffect(() => {
    setLoading(true);
    const categoryParam = kategoriAktif === "Semua" ? undefined : kategoriAktif;
    api.ambilSemuaTemplates(categoryParam)
      .then((data) => setTemplateList(data))
      .catch((err) => console.error("Gagal memuat template:", err))
      .finally(() => setLoading(false));
  }, [kategoriAktif]);

  // Real-time Slug Checker
  async function handleCekSlug(val: string) {
    setSlugInput(val);
    setSlugResult(null);

    const clean = val.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    if (clean.length < 3) return;

    setSlugChecking(true);
    try {
      const res = await api.cekKetersediaanSlug(clean);
      setSlugResult({ available: res.available, message: res.message });
    } catch (err) {
      setSlugResult({
        available: false,
        message: err instanceof Error ? err.message : "Gagal memeriksa tautan",
      });
    } finally {
      setSlugChecking(false);
    }
  }

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const filteredTemplates = templateList.filter(
    (t) =>
      t.title.toLowerCase().includes(keyword.toLowerCase()) ||
      t.theme_style.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="katalog-page-wrapper min-h-screen bg-[#FFFDF9] text-[#2D2424] font-sans">
      {/* ========================================================
          1. NAVBAR HEADER
      ======================================================== */}
      <header className="katalog-navbar sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#F0EBE1] py-3.5 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="katalog-navbar__brand flex items-center gap-2">
            <span className="text-xl font-serif font-black tracking-wider text-[#4A151E]">
              asm.invitation
            </span>
            <span className="text-[10px] font-bold bg-[#EFE9DF] text-[#695A5A] px-2 py-0.5 rounded uppercase tracking-wider">
              Studio
            </span>
          </Link>

          <nav className="katalog-navbar__menu hidden md:flex items-center gap-8 text-sm font-medium text-[#5C4F4F]">
            <a href="#katalog" className="text-[#4A151E] font-bold border-b-2 border-[#4A151E] pb-1">
              Katalog Master
            </a>
            <a href="#paket" className="hover:text-[#4A151E] transition">
              Paket Harga
            </a>
            <a href="#custom" className="hover:text-[#4A151E] transition">
              Desain Custom
            </a>
          </nav>

          <div className="katalog-navbar__cta flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="text-xs font-bold px-4 py-2 bg-[#4A151E] hover:bg-[#380F16] text-[#FAF6F0] rounded-full shadow-sm transition"
              >
                Dashboard ({user.nama.split(" ")[0]})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3.5 py-2 border border-[#D5C9B8] rounded-full text-[#4A151E] hover:bg-[#F7F3EC] transition"
                >
                  Masuk Klien
                </Link>
                <a
                  href="#katalog"
                  className="text-xs font-bold px-4 py-2 bg-[#4A151E] hover:bg-[#380F16] text-[#FAF6F0] rounded-full shadow-sm transition"
                >
                  Pilih Template
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION
      ======================================================== */}
      <section className="katalog-hero pt-14 pb-8 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFE6] border border-[#E8DEC8] text-[#7A6237] text-xs font-bold tracking-wide uppercase">
            <span>✨</span> STUDIO KOLEKTIF 30 MASTER TEMPLATE MULTI-ACARA
          </div>

          <h1 className="katalog-hero__title font-serif text-3xl sm:text-5xl font-extrabold text-[#381118] tracking-tight leading-tight">
            Katalog Eksklusif Undangan Digital Modern
          </h1>

          <p className="katalog-hero__desc text-sm sm:text-base text-[#6E5D53] max-w-2xl mx-auto leading-relaxed">
            Pernikahan, Khitanan, Ulang Tahun, & Aqiqah dengan standar visual <em>Mobile-First (100dvh)</em>. Musik otomatis,
            amplop digital, RSVP realtime, dan hitung mundur presisi.
          </p>
        </div>

        {/* Search Bar & Badges */}
        <div className="katalog-filter-bar max-w-2xl mx-auto mt-8 px-2 space-y-4">
          <div className="katalog-search-box flex items-center gap-2 bg-white border border-[#E3D9C9] rounded-full p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#4A151E]/20">
            <span className="pl-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Cari tema, adat, gaya, atau nama template..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="katalog-features-badges flex flex-wrap justify-center gap-4 text-xs font-medium text-[#7D6B60]">
            <span>📱 100% Mobile Ready</span>
            <span>⚡ Aktif Instan via Midtrans</span>
            <span>☁️ Kompresi Foto Cloudinary</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="katalog-category-chips flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mt-6">
          {kategoriPilihan.map((kat) => (
            <button
              key={kat.val}
              onClick={() => setKategoriAktif(kat.val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                kategoriAktif === kat.val
                  ? "bg-[#4A151E] text-[#FFF9F2] shadow-sm"
                  : "bg-white border border-[#E3D9C9] text-[#69584F] hover:bg-[#F8F4ED]"
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. KATALOG CARD GRID
      ======================================================== */}
      <main id="katalog" className="katalog-grid-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A151E] mb-3" />
            <p className="text-sm">Memuat master template dari server...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-bold">Template tidak ditemukan</p>
            <p className="text-sm">Coba kata kunci lain atau pilih kategori acara berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((item) => (
              <div
                key={item.id}
                className="template-card bg-white rounded-2xl border border-[#EBE3D5] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Preview Mockup Container */}
                <div className="template-card__preview relative h-64 bg-[#F7F2EA] flex items-center justify-center overflow-hidden border-b border-[#EBE3D5]">
                  <span className="template-card__badge-exclusive absolute top-3 left-3 bg-[#4A151E] text-[#FFF9F2] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    MASTER TEMPLATE
                  </span>
                  <span className="template-card__badge-discount absolute top-3 right-3 bg-[#FFC554] text-[#422B00] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                    {item.category}
                  </span>

                  {/* Smartphone Frame Mockup */}
                  <div className="template-card__phone-mockup w-32 h-48 bg-white rounded-xl shadow-md border-4 border-gray-800 flex flex-col items-center justify-center p-2 text-center text-xs text-gray-400">
                    <div className="w-8 h-1 bg-gray-700 rounded-full mb-auto" />
                    <span className="text-3xl my-auto">
                      {item.category === "wedding"
                        ? "💍"
                        : item.category === "khitan"
                        ? "✂️"
                        : item.category === "birthday"
                        ? "🎂"
                        : "👶"}
                    </span>
                    <p className="text-[9px] font-serif font-bold text-gray-700 line-clamp-1">{item.title}</p>
                  </div>

                  <div className="absolute bottom-2 inset-x-2 flex justify-center gap-2 text-[10px] text-gray-500 bg-white/80 backdrop-blur-xs py-1 rounded-md">
                    <span>🎵 Autoplay</span>
                    <span>💌 Amplop</span>
                    <span>📍 Maps</span>
                  </div>
                </div>

                {/* Info Detail Produk */}
                <div className="template-card__body p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="template-card__category font-bold text-[#8C6D3B] uppercase tracking-wider text-[10px]">
                      {item.theme_style}
                    </span>
                    <span className="template-card__rating font-bold text-[#2E2424] flex items-center gap-1">
                      ⭐ 5.0 <span className="text-gray-400 font-normal">(Kurasi Studio)</span>
                    </span>
                  </div>

                  <h3 className="template-card__title font-serif text-lg font-bold text-[#3B171D]">
                    {item.title}
                  </h3>

                  <div className="template-card__price-wrapper pt-1 border-t border-gray-100 flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Mulai Paket Basic</p>
                      <span className="template-card__price-current font-extrabold text-xl text-[#3B171D]">
                        {formatRupiah(item.price_basic)}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Kuota 15 Foto
                    </span>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="template-card__actions grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={item.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="template-card__btn-demo text-center py-2 px-3 border border-[#D5C9B8] rounded-xl text-xs font-semibold text-[#4A151E] hover:bg-[#F9F5EE] transition cursor-pointer"
                    >
                      👁️ Live Demo
                    </a>
                    <button
                      onClick={() => {
                        setSelectedTemplate(item);
                        setSlugInput("");
                        setSlugResult(null);
                      }}
                      className="template-card__btn-order py-2 px-3 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      🎁 Pesan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================
          4. MODAL REALTIME SLUG CHECKER (PRD FR-A3)
      ======================================================== */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in duration-150">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8C6D3B] tracking-wider">
                  Langkah 1: Tentukan Tautan Undangan
                </span>
                <h3 className="text-xl font-bold font-serif text-[#3B171D]">
                  {selectedTemplate.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5">
              Ketik nama/slug yang lo inginkan untuk link undanganmu. Sistem kami akan mengecek ketersediaannya secara <em>real-time</em> ke database.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tautan Impian Anda
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#4A151E]/20 bg-gray-50">
                  <span className="text-xs text-gray-400 select-none">undang_an.digital/</span>
                  <input
                    type="text"
                    placeholder="contoh: bagas-sekar"
                    value={slugInput}
                    onChange={(e) => handleCekSlug(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none pl-1"
                  />
                  {slugChecking && <span className="text-xs text-gray-400 animate-spin">⏳</span>}
                </div>
              </div>

              {slugResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    slugResult.available
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <span>{slugResult.available ? "✅" : "❌"}</span>
                  <span>{slugResult.message}</span>
                </div>
              )}

              {/* Pilihan Paket Harga Sesuai PRD */}
              <div className="bg-[#FFFDF9] border border-[#EBE3D5] p-4 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-[#3B171D]">Pilihan Paket Resmi PRD:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 border rounded-xl bg-white">
                    <p className="font-bold text-gray-800">Basic</p>
                    <p className="text-[#4A151E] font-extrabold">{formatRupiah(selectedTemplate.price_basic)}</p>
                    <p className="text-[10px] text-gray-400">15 Foto / 3 Bln</p>
                  </div>
                  <div className="p-2 border-2 border-[#4A151E] rounded-xl bg-white shadow-xs">
                    <span className="text-[8px] bg-[#4A151E] text-white px-1 rounded font-bold uppercase">Popular</span>
                    <p className="font-bold text-gray-800">Standard</p>
                    <p className="text-[#4A151E] font-extrabold">{formatRupiah(selectedTemplate.price_standard)}</p>
                    <p className="text-[10px] text-gray-400">15 Foto / 6 Bln</p>
                  </div>
                  <div className="p-2 border rounded-xl bg-white">
                    <p className="font-bold text-gray-800">Special</p>
                    <p className="text-[#4A151E] font-extrabold">{formatRupiah(selectedTemplate.price_special)}</p>
                    <p className="text-[10px] text-gray-400">30 Foto / 12 Bln</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Tutup
                </button>
                <Link
                  to={slugResult?.available ? `/daftar?template=${selectedTemplate.slug}&slug=${slugInput}` : "#"}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-xs ${
                    slugResult?.available
                      ? "bg-[#4A151E] hover:bg-[#360F15] text-white cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  Lanjut ke Pembayaran Midtrans →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. FOOTER
      ======================================================== */}
      <footer className="katalog-footer border-t border-[#EDE5D8] py-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} asm.invitation (undang_an.digital). Dibuat dengan cinta untuk hari istimewamu.</p>
      </footer>
    </div>
  );
}
