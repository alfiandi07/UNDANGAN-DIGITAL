import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as api from "../lib/api";
import type { Template } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import CheckoutModal from "../components/CheckoutModal";
import { formatRupiah } from "../utils/format";
import "../styles/BerandaKatalog.css";

const DEFAULT_MASTER_TEMPLATES: Template[] = [
  {
    id: 1,
    slug: "jawa-keraton-royal",
    title: "Jawa Keraton Royal",
    category: "wedding",
    package_type: "premium",
    theme_style: "Adat Jawa",
    thumbnail_url: "/assets/templates/jawa-keraton.webp",
    demo_url: "/demo/jawa-keraton-royal",
    price_basic: 79000,
    price_standard: 99000,
    price_special: 149000,
    price: 149000,
    is_active: true,
  },
  {
    id: 2,
    slug: "sunda-siger-luxury",
    title: "Sunda Siger Luxury",
    category: "wedding",
    package_type: "premium",
    theme_style: "Adat Sunda",
    thumbnail_url: "/assets/templates/sunda-siger.webp",
    demo_url: "/demo/sunda-siger-luxury",
    price_basic: 79000,
    price_standard: 99000,
    price_special: 149000,
    price: 149000,
    is_active: true,
  },
  {
    id: 3,
    slug: "modern-minimalist-couture",
    title: "Modern Minimalist Couture",
    category: "wedding",
    package_type: "standard",
    theme_style: "Modern Minimalis",
    thumbnail_url: "/assets/templates/modern-minimalist.webp",
    demo_url: "/demo/modern-minimalist-couture",
    price_basic: 79000,
    price_standard: 79000,
    price_special: 120000,
    price: 79000,
    is_active: true,
  },
  {
    id: 4,
    slug: "islamic-luxe-andalusia",
    title: "Islamic Luxe Andalusia",
    category: "wedding",
    package_type: "standard",
    theme_style: "Islamic Luxe",
    thumbnail_url: "/assets/templates/islamic-luxe.webp",
    demo_url: "/demo/islamic-luxe-andalusia",
    price_basic: 79000,
    price_standard: 79000,
    price_special: 120000,
    price: 79000,
    is_active: true,
  },
  {
    id: 5,
    slug: "earthy-botanical-warm",
    title: "Earthy Botanical Warm",
    category: "wedding",
    package_type: "premium",
    theme_style: "Floral & Rustic",
    thumbnail_url: "/assets/templates/earthy-botanical.webp",
    demo_url: "/demo/earthy-botanical-warm",
    price_basic: 79000,
    price_standard: 99000,
    price_special: 149000,
    price: 149000,
    is_active: true,
  },
  {
    id: 6,
    slug: "khitan-barokah-ceria",
    title: "Khitan Barokah Ceria",
    category: "khitan",
    package_type: "standard",
    theme_style: "Syukuran Khitan",
    thumbnail_url: "/assets/templates/khitan-ceria.webp",
    demo_url: "/demo/khitan-barokah-ceria",
    price_basic: 79000,
    price_standard: 79000,
    price_special: 120000,
    price: 79000,
    is_active: true,
  },
];

export default function BerandaKatalog() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [templateList, setTemplateList] = useState<Template[]>(
    DEFAULT_MASTER_TEMPLATES,
  );
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [keyword, setKeyword] = useState("");
  const [activeNav, setActiveNav] = useState<"katalog" | "paket" | "custom">(
    "katalog",
  );

  // Modal Checkout Template Terpilih
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  // Auto-open Checkout Modal jika datang dari Live Demo (?checkout=slug)
  const checkoutSlug = searchParams.get("checkout");
  useEffect(() => {
    if (checkoutSlug && templateList.length > 0) {
      const match = templateList.find((t) => t.slug === checkoutSlug);
      if (match) {
        setSelectedTemplate(match);
      }
    }
  }, [checkoutSlug, templateList]);

  const kategoriPilihan = [
    { label: "Semua Acara", val: "Semua" },
    { label: "Pernikahan", val: "wedding" },
    { label: "Khitanan", val: "khitan" },
    { label: "Ulang Tahun", val: "birthday" },
    { label: "Aqiqah", val: "aqiqah" },
  ];

  useEffect(() => {
    let isMounted = true;
    const categoryParam = kategoriAktif === "Semua" ? undefined : kategoriAktif;
    api
      .ambilSemuaTemplates(categoryParam)
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTemplateList(data);
        }
      })
      .catch((err) => {
        console.warn(
          "Gagal memuat template dari API, menggunakan fallback master:",
          err,
        );
      });

    return () => {
      isMounted = false;
    };
  }, [kategoriAktif]);

  const filteredTemplates = templateList.filter((t) => {
    const matchCategory =
      kategoriAktif === "Semua" || t.category === kategoriAktif;
    const matchKeyword =
      !keyword ||
      (t.title && t.title.toLowerCase().includes(keyword.toLowerCase())) ||
      (t.theme_style &&
        t.theme_style.toLowerCase().includes(keyword.toLowerCase()));
    return matchCategory && matchKeyword;
  });

  return (
    <div className="katalog-page">
      {/* Full Fixed Floral Wallpaper Background (Full Sampai Bawah) */}
      <div className="katalog-floral-bg" aria-hidden="true" />

      {/* ========================================================
          1. NAVBAR HEADER
      ======================================================== */}
      <header className="katalog-navbar">
        <div className="katalog-navbar__container">
          <Link to="/" className="katalog-navbar__brand">
            <span className="katalog-navbar__brand-text">asm.invitation</span>
            <span className="katalog-navbar__brand-badge">Studio</span>
          </Link>

          <nav className="katalog-navbar__menu">
            <a
              href="#katalog"
              onClick={() => setActiveNav("katalog")}
              className={`katalog-navbar__link ${activeNav === "katalog" ? "katalog-navbar__link--active" : ""}`}
            >
              Katalog Master
            </a>

            <a
              href="#paket"
              onClick={() => setActiveNav("paket")}
              className={`katalog-navbar__link ${activeNav === "paket" ? "katalog-navbar__link--active" : ""}`}
            >
              Paket Harga
            </a>

            <a
              href="#custom"
              onClick={() => setActiveNav("custom")}
              className={`katalog-navbar__link ${activeNav === "custom" ? "katalog-navbar__link--active" : ""}`}
            >
              Kontak
            </a>
          </nav>

          <div className="katalog-navbar__actions">
            {user ? (
              <Link to="/dashboard" className="katalog-btn-cta">
                Dashboard ({user.nama.split(" ")[0]})
              </Link>
            ) : (
              <>
                <Link to="/login" className="katalog-btn-login">
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION - SPLIT ARCHITECTURAL WEDDING ARCH
      ======================================================== */}
      <section className="katalog-hero">
        <div className="katalog-hero__container">
          {/* Kolom Kiri: Headline & Aksi Pencarian */}
          <div className="katalog-hero__content">
            <div className="katalog-hero__badge">
              <span className="katalog-hero__badge-dot animate-pulse"></span>
              <span>STUDIO UNDANGAN DIGITAL #1</span>
            </div>

            <h1 className="katalog-hero__title">
              Katalog Eksklusif Undangan Digital Modern
            </h1>

            <p className="katalog-hero__desc">
              Pernikahan, Khitanan, Ulang Tahun, & Aqiqah Mobile-First (100dvh). Dilengkapi musik autoplay, amplop digital, navigasi Google Maps presisi, dan konfirmasi RSVP realtime.
            </p>

            {/* Search Bar */}
            <div className="katalog-search-wrapper">
              <div className="katalog-search-box">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari tema: Adat Sunda, Jawa Keraton, Modern Minimalis..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="katalog-search-input"
                />
                <button
                  type="button"
                  className="katalog-search-btn"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="katalog-chips-container">
              {kategoriPilihan.map((kat) => (
                <button
                  key={kat.val}
                  type="button"
                  onClick={() => setKategoriAktif(kat.val)}
                  className={`katalog-chip ${kategoriAktif === kat.val ? "katalog-chip--active" : ""}`}
                >
                  {kat.label}
                </button>
              ))}
            </div>

            {/* Social Proof Stats */}
            <div className="katalog-hero__stats">
              <div>
                <p className="katalog-stat-val">100+</p>
                <p className="katalog-stat-label">Master Template</p>
              </div>
              <div>
                <p className="katalog-stat-val">4.9/5</p>
                <p className="katalog-stat-label">Rating Pasangan</p>
              </div>
              <div>
                <p className="katalog-stat-val">100%</p>
                <p className="katalog-stat-label">Mobile Ready</p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Architectural Wedding Arch (Gaya 1: Full Bunga & Dedaunan) */}
          <div className="katalog-hero__showcase">
            <div className="katalog-arch-wrapper">
              {/* Botanical Crown Overlap SVG */}
              <div className="katalog-arch-crown">
                <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
                  <path d="M100 10 C60 20 40 50 50 110" stroke="#3A5438" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="80" cy="25" r="9" fill="#4B6A49"/>
                  <circle cx="55" cy="45" r="10" fill="#5C7F59"/>
                  <circle cx="45" cy="75" r="9" fill="#3A5438"/>
                  <circle cx="75" cy="55" r="16" fill="#FFFFFF" stroke="#DCD7CA" strokeWidth="1.5"/>
                  <circle cx="75" cy="55" r="9" fill="#F5EFE3"/>
                  <circle cx="75" cy="55" r="5" fill="#A2583E"/>
                </svg>
              </div>

              {/* Glowing Aura Frame */}
              <div className="katalog-arch-glow"></div>

              {/* Main Wedding Arch Card */}
              <div className="katalog-arch-card">
                <div className="katalog-arch-image-box">
                  <img
                    src="/botanical-moss-arch.jpg"
                    alt="Lush Botanical Wedding Arch"
                    className="katalog-arch-image"
                  />

                  {/* Gradient Vignette & Information */}
                  <div className="katalog-arch-overlay">
                    <span className="katalog-arch-tag">
                      100% Floral Asli
                    </span>
                    <h3 className="katalog-arch-title">
                      Lush Botanical Arch
                    </h3>
                    <p className="katalog-arch-desc">
                      Dekorasi mawar putih, lumut sage asli, dan dedaunan eucalyptus rimbun.
                    </p>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="katalog-arch-badge-rating">
                  <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold text-[#2D3E2F]">4.9</span>
                  <span className="text-[10px] text-[#556050] font-medium">Tema Favorit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. KATALOG CARD GRID
      ======================================================== */}
      <main id="katalog" className="katalog-grid-section">
        {filteredTemplates.length === 0 ? (
          <div className="katalog-empty-state">
            <p className="katalog-empty-title">
              Template tidak ditemukan
            </p>
            <p className="katalog-empty-desc">
              Coba kata kunci lain atau pilih kategori acara berbeda.
            </p>
          </div>
        ) : (
          <div className="katalog-grid">
            {filteredTemplates.map((item) => (
              <div key={item.id} className="katalog-card">
                {/* Mockup Preview */}
                <div className="katalog-card__preview">
                  <span className="katalog-card__category-tag">
                    {item.category}
                  </span>

                  <div className="katalog-card__phone-frame">
                    <div className="katalog-card__phone-notch" />
                    <span className="katalog-card__phone-icon">
                      <svg className="w-6 h-6 text-[#82622B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0a2 2 0 100-4 2 2 0 000 4zm-8 4v-4m0 0a2 2 0 100-4 2 2 0 000 4zm14-12l-1.5 1.5M6 6l1.5 1.5M12 21a9 9 0 100-18 9 9 0 000 18z" />
                      </svg>
                    </span>
                    <p className="katalog-card__phone-title">{item.title}</p>
                  </div>

                  <div className="katalog-card__features-bar">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#3A5438]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      Autoplay
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#82622B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Amplop
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#A2583E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Maps
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="katalog-card__body">
                  <div className="katalog-card__meta">
                    <span className="katalog-card__theme">
                      {item.theme_style}
                    </span>
                  </div>

                  <h3 className="katalog-card__title">{item.title}</h3>

                  <div className="katalog-card__pricing">
                    <div>
                      <p className="katalog-card__price-sub">
                        {item.package_type === "premium"
                          ? "Paket Premium"
                          : "Paket Basic"}
                      </p>
                      <p className="katalog-card__price-val">
                        {formatRupiah(
                          item.price ||
                            (item.package_type === "premium"
                              ? item.price_standard || 149000
                              : item.price_basic || 79000),
                        )}
                      </p>
                    </div>
                    <span
                      className={`katalog-card__quota-badge ${
                        item.package_type === "premium"
                          ? "katalog-card__quota-badge--premium"
                          : "katalog-card__quota-badge--basic"
                      }`}
                    >
                      {item.package_type === "premium"
                        ? "Kuota 20 Foto"
                        : "Tanpa Foto"}
                    </span>
                  </div>

                  <div className="katalog-card__buttons">
                    <a
                      href={item.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="katalog-card__btn-demo"
                    >
                      Live Demo
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(item)}
                      className="katalog-card__btn-order"
                    >
                      Pesan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================
          4. SECTION PAKET HARGA (#paket)
      ======================================================== */}
      <section id="paket" className="katalog-pricing-section">
        <h2 className="katalog-section-title">Pilihan Paket Undangan Resmi</h2>
        <p className="katalog-section-desc">
          Transparan, tanpa biaya tersembunyi, dan aktif otomatis via sistem
          pembayaran Midtrans.
        </p>

        <div className="katalog-pricing-grid">
          {/* Paket Basic */}
          <div className="pricing-table-card">
            <h3 className="pricing-plan-title">
              Paket Basic
            </h3>
            <p className="pricing-plan-price">
              Rp 79.000
            </p>
            <ul className="pricing-plan-list">
              <li>Tanpa Galeri Foto (0 Foto)</li>
              <li>Masa Aktif 3 Bulan</li>
              <li>Form Data Acara Lengkap (Akad/Resepsi)</li>
              <li>Integrasi Google Maps</li>
              <li>Amplop Digital & Nomor Rekening</li>
            </ul>
          </div>

          {/* Paket Premium */}
          <div className="pricing-table-card pricing-table-card--featured">
            <span className="pricing-badge-popular">Paling Diminati</span>
            <h3 className="pricing-plan-title">
              Paket Premium
            </h3>
            <p className="pricing-plan-price">
              Rp 149.000
            </p>
            <ul className="pricing-plan-list">
              <li>
                <strong>Galeri Kuota 20 Foto</strong>
              </li>
              <li>
                <strong>Masa Aktif 12 Bulan Penuh</strong>
              </li>
              <li>Background Music Autoplay</li>
              <li>Live Buku Tamu & Ucapan Doa</li>
              <li>Hitung Mundur Presisi (Countdown)</li>
              <li>Fitur Kisah Cinta (Love Story)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECTION DESAIN CUSTOM (#custom)
      ======================================================== */}
      <section id="custom" className="katalog-custom-section">
        <h2 className="katalog-custom-title">
          Punya Konsep Desain Impian Sendiri?
        </h2>
        <p className="katalog-custom-desc">
          Tim desainer studio asm.invitation siap membuatkan tema eksklusif
          sesuai adat, warna, dan konsep pernikahanmu.
        </p>
        <a
          href="https://wa.me/62881012202821?text=Halo%20tim%20asm.invitation,%20saya%20tertarik%20konsultasi%20pembuatan%20undangan%20desain%20custom"
          target="_blank"
          rel="noreferrer"
          className="katalog-custom-btn"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.768c0 5.518-4.482 10-10 10-1.745 0-3.415-.45-4.886-1.291l-7.114 1.863 1.894-6.924c-.958-1.523-1.464-3.287-1.464-5.097 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z"/>
          </svg>
          <span>Konsultasi Desain Custom via WhatsApp</span>
        </a>
      </section>

      {/* ========================================================
          6. MODAL CHECKOUT & SLUG CHECKER (PRD MODUL B)
      ======================================================== */}
      {selectedTemplate && (
        <CheckoutModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}

      {/* ========================================================
          7. FOOTER
      ======================================================== */}
      <footer className="katalog-footer">
        <p>
          &copy; {new Date().getFullYear()} asm.invitation (undang_an.digital).
          Dibuat dengan cinta untuk hari istimewamu.
        </p>
      </footer>
    </div>
  );
}
