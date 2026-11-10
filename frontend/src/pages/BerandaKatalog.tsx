import { useState, useEffect } from "react";
import * as api from "../lib/api";
import type { Produk } from "../lib/api";

export default function BerandaKatalog() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [keyword, setKeyword] = useState("");

  const kategoriPilihan = [
    "Semua",
    "Adat Jawa",
    "Adat Sunda",
    "Modern Minimalis",
    "Islamic Luxe",
    "Floral & Rustic",
  ];

  useEffect(() => {
    api.ambilSemuaProduk().then(setProdukList).catch(console.error);
  }, []);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <div className="katalog-page-wrapper min-h-screen bg-[#FFFDF9] text-[#2D2424] font-sans">
      {/* ========================================================
          1. NAVBAR HEADER
      ======================================================== */}
      <header className="katalog-navbar sticky top-0 z-50 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#F0EBE1] py-3.5 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="katalog-navbar__brand flex items-center gap-2">
            <span className="text-xl font-serif font-black tracking-wider text-[#4A151E]">
              ASMInvitation
            </span>
          </div>

          <nav className="katalog-navbar__menu hidden md:flex items-center gap-8 text-sm font-medium text-[#5C4F4F]">
            <a
              href="#katalog"
              className="text-[#4A151E] font-bold border-b-2 border-[#4A151E] pb-1"
            >
              Katalog Tema
            </a>
            <a href="#custom" className="hover:text-[#4A151E] transition">
              Custom Builder
            </a>
            <a href="#kontak" className="hover:text-[#4A151E] transition">
              Kontak & Konsultasi
            </a>
          </nav>

          <div className="katalog-navbar__cta flex items-center gap-3">
            <button className="text-xs font-bold px-4 py-2 bg-[#4A151E] hover:bg-[#380F16] text-[#FAF6F0] rounded-full shadow-sm transition cursor-pointer">
              Mulai Buat Undangan
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION
      ======================================================== */}
      <section className="katalog-hero pt-14 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFE6] border border-[#E8DEC8] text-[#7A6237] text-xs font-bold tracking-wide uppercase">
            <span>✨</span> BISA CUSTOM WARNA, ILUSTRASI & TEKS SESUAI ACARA
          </div>

          <h1 className="katalog-hero__title font-serif text-3xl sm:text-5xl font-extrabold text-[#381118] tracking-tight leading-tight">
            Katalog Eksklusif Undangan Digital Modern
          </h1>

          <p className="katalog-hero__desc text-sm sm:text-base text-[#6E5D53] max-w-2xl mx-auto leading-relaxed">
            Pilih template undangan pernikahan custom berteknologi interaktif.
            Musik otomatis, amplop digital, hitung mundur, dan reservasi RSVP
            langsung.
          </p>
        </div>

        {/* ========================================================
            3. SEARCH BAR & FITUR MINI
        ======================================================== */}
        <div className="katalog-filter-bar max-w-2xl mx-auto mt-8 px-2 space-y-4">
          <div className="katalog-search-box flex items-center gap-2 bg-white border border-[#E3D9C9] rounded-full p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#4A151E]/20">
            <span className="pl-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Cari tema, adat, gaya, atau nuansa warna..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            <button className="px-4 py-2 bg-[#4A151E] text-white text-xs font-semibold rounded-full hover:bg-[#380F16] transition cursor-pointer">
              Filter ▾
            </button>
          </div>

          {/* Mini Badges Fitur */}
          <div className="katalog-features-badges flex flex-wrap justify-center gap-4 text-xs font-medium text-[#7D6B60]">
            <span>📱 Garansi 100% Mobile Ready</span>
            <span>⚡ Aktif Instan dalam 10 Menit</span>
            <span>🎵 Lisensi Musik Eksklusif</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="katalog-category-chips flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mt-6">
          {kategoriPilihan.map((kat) => (
            <button
              key={kat}
              onClick={() => setKategoriAktif(kat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                kategoriAktif === kat
                  ? "bg-[#4A151E] text-[#FFF9F2] shadow-sm"
                  : "bg-white border border-[#E3D9C9] text-[#69584F] hover:bg-[#F8F4ED]"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. KATALOG CARD GRID
      ======================================================== */}
      <main
        id="katalog"
        className="katalog-grid-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {produkList.map((item) => (
            <div
              key={item.id}
              className="template-card bg-white rounded-2xl border border-[#EBE3D5] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Preview Mockup Container */}
              <div className="template-card__preview relative h-64 bg-[#F7F2EA] flex items-center justify-center overflow-hidden border-b border-[#EBE3D5]">
                {/* Badges pojok atas */}
                <span className="template-card__badge-exclusive absolute top-3 left-3 bg-[#4A151E] text-[#FFF9F2] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                  EXCLUSIVE DESIGN
                </span>
                <span className="template-card__badge-discount absolute top-3 right-3 bg-[#FFC554] text-[#422B00] text-[10px] font-extrabold px-2 py-0.5 rounded">
                  HEMAT 40%
                </span>

                {/* Smartphone Screen Mockup Dummy */}
                <div className="template-card__phone-mockup w-32 h-48 bg-white rounded-xl shadow-md border-4 border-gray-800 flex flex-col items-center justify-center p-2 text-center text-xs text-gray-400">
                  <div className="w-8 h-1 bg-gray-700 rounded-full mb-auto" />
                  <span className="text-2xl my-auto">💍</span>
                  <p className="text-[9px] font-serif font-bold text-gray-700">
                    {item.nama}
                  </p>
                </div>

                {/* Fitur Mini di Bawah Mockup */}
                <div className="absolute bottom-2 inset-x-2 flex justify-center gap-2 text-[10px] text-gray-500 bg-white/80 backdrop-blur-xs py-1 rounded-md">
                  <span>🎵 Autoplay</span>
                  <span>💌 Amplop</span>
                  <span>📍 Live Maps</span>
                </div>
              </div>

              {/* Info Detail Produk */}
              <div className="template-card__body p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="template-card__category font-bold text-[#8C6D3B] uppercase tracking-wider text-[10px]">
                    {item.kategory || "ADAT JAWA LUXURY"}
                  </span>
                  <span className="template-card__rating font-bold text-[#2E2424] flex items-center gap-1">
                    ⭐ 4.9{" "}
                    <span className="text-gray-400 font-normal">(121)</span>
                  </span>
                </div>

                <h3 className="template-card__title font-serif text-lg font-bold text-[#3B171D]">
                  {item.nama}
                </h3>

                <p className="template-card__snippet text-xs text-[#706057] line-clamp-2 leading-relaxed">
                  Perpaduan desain eksklusif, ornamen klasik mewah, animasi
                  halus, dan pengalaman interaktif bagi tamu undangan Anda.
                </p>

                {/* Harga Promo vs Coret */}
                <div className="template-card__price-wrapper pt-1 border-t border-gray-100 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="template-card__price-current font-extrabold text-xl text-[#3B171D]">
                      {formatRupiah(item.harga)}
                    </span>
                    <span className="template-card__price-old text-xs text-gray-400 line-through">
                      {formatRupiah(item.harga + 100000)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    TOTAL NETTO
                  </span>
                </div>

                {/* Tombol Aksi */}
                <div className="template-card__actions grid grid-cols-2 gap-2 pt-2">
                  <button className="template-card__btn-demo py-2 px-3 border border-[#D5C9B8] rounded-xl text-xs font-semibold text-[#4A151E] hover:bg-[#F9F5EE] transition cursor-pointer">
                    👁️ Coba Demo
                  </button>
                  <button className="template-card__btn-order py-2 px-3 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer">
                    🎁 Pesan via WA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ========================================================
          5. CALL TO ACTION BANNER (DESAIN CUSTOM)
      ======================================================== */}
      <section className="custom-banner-cta max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="custom-banner-card bg-gradient-to-r from-[#2B0B11] to-[#4A151E] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-extrabold bg-[#FFD782]/20 text-[#FFD782] px-3 py-1 rounded-full uppercase tracking-wider">
              ✦ CUSTOM REQUEST SPECIAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold leading-snug">
              Ingin Desain Custom Sesuai Seleramu?
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Buka Custom Builder untuk request skema warna khusus, kombinasi
              tipografi roman/script, susunan susunan urutan, hingga audio musik
              personal.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-300">
              <span>🎨 Drag & Drop Visual Block</span>
              <span>⚡ Real-Time Mobile Preview</span>
              <span>💬 Asistensi Desainer Grafis</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button className="px-6 py-3 bg-[#FFC554] hover:bg-[#E8B043] text-[#331C00] font-bold text-sm rounded-xl transition shadow-md cursor-pointer">
              Buka Custom Builder →
            </button>
            <button className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white font-medium text-sm rounded-xl transition cursor-pointer">
              💬 Tanya Desainer
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FOOTER
      ======================================================== */}
      <footer className="katalog-footer border-t border-[#EDE5D8] py-8 text-center text-xs text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Vowly Undangan Digital. Dibuat
          dengan cinta untuk hari istimewamu.
        </p>
      </footer>
    </div>
  );
}
