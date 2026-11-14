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
          2. HERO SECTION
      ======================================================== */}
      <section className="katalog-hero">
        <div className="katalog-hero__badge">
          <span></span> PILIH TEMPLATE UNDANGAN ANDA
        </div>

        <h1 className="katalog-hero__title">
          Katalog Eksklusif Undangan Digital Modern
        </h1>

        <p className="katalog-hero__desc">
          Pernikahan, Khitanan, Ulang Tahun, & Aqiqah{" "}
          <em>Mobile-First (100dvh)</em>. musik, amplop digital, RSVP realtime,
          dan hitung mundur presisi.
        </p>

        {/* Search Bar */}
        <div className="katalog-search-wrapper">
          <div className="katalog-search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Cari tema"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="katalog-search-input"
            />
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
      </section>

      {/* ========================================================
          3. KATALOG CARD GRID
      ======================================================== */}
      <main id="katalog" className="katalog-grid-section">
        {filteredTemplates.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 0",
              color: "#010710ff",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Template tidak ditemukan
            </p>
            <p style={{ fontSize: "0.85rem" }}>
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
                      {item.category === "wedding"
                        ? "💍"
                        : item.category === "khitan"
                          ? ""
                          : item.category === "birthday"
                            ? ""
                            : ""}
                    </span>
                    <p className="katalog-card__phone-title">{item.title}</p>
                  </div>

                  <div className="katalog-card__features-bar">
                    <span>🎵 Autoplay</span>
                    <span>💌 Amplop</span>
                    <span>📍 Maps</span>
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
                          : "Paket Standar"}
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
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color:
                          item.package_type === "premium"
                            ? "#6B1D2F"
                            : "#047857",
                      }}
                    >
                      {item.package_type === "premium"
                        ? "Kuota 30 Foto"
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
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                margin: "0 0 0.5rem 0",
                color: "#1f2937",
              }}
            >
              Paket Basic
            </h3>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#4a151e",
                margin: "0 0 1rem 0",
              }}
            >
              Rp 79.000
            </p>
            <ul
              style={{
                fontSize: "0.8rem",
                color: "#4b5563",
                lineHeight: 1.8,
                paddingLeft: "1.2rem",
                margin: 0,
              }}
            >
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
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                margin: "0 0 0.5rem 0",
                color: "#1f2937",
              }}
            >
              Paket Premium
            </h3>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#4a151e",
                margin: "0 0 1rem 0",
              }}
            >
              Rp 149.000
            </p>
            <ul
              style={{
                fontSize: "0.8rem",
                color: "#4b5563",
                lineHeight: 1.8,
                paddingLeft: "1.2rem",
                margin: 0,
              }}
            >
              <li>
                <strong>Galeri Kuota 30 Foto</strong>
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
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: 800,
            margin: "0 0 0.5rem 0",
          }}
        >
          Punya Konsep Desain Impian Sendiri?
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#f3e8e2",
            maxWidth: "36rem",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Tim desainer studio asm.invitation siap membuatkan tema eksklusif
          sesuai adat, warna, dan konsep pernikahanmu.
        </p>
        <a
          href="https://wa.me/6281234567890?text=Halo%20tim%20asm.invitation,%20saya%20tertarik%20konsultasi%20pembuatan%20undangan%20desain%20custom"
          target="_blank"
          rel="noreferrer"
          className="katalog-custom-btn"
        >
          <span>💬</span> Konsultasi Desain Custom via WhatsApp
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
