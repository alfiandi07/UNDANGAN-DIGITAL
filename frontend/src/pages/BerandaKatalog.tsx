import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Template } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import CheckoutModal from "../components/CheckoutModal";
import { formatRupiah } from "../utils/format";
import "../styles/BerandaKatalog.css";

export default function BerandaKatalog() {
  const { user } = useAuth();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [keyword, setKeyword] = useState("");
  const [activeNav, setActiveNav] = useState<"katalog" | "paket" | "custom">(
    "katalog",
  );

  // Modal Checkout Template Terpilih
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

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
    api
      .ambilSemuaTemplates(categoryParam)
      .then((data) => setTemplateList(data))
      .catch((err) => console.error("Gagal memuat template:", err))
      .finally(() => setLoading(false));
  }, [kategoriAktif]);

  const filteredTemplates = templateList.filter(
    (t) =>
      t.title.toLowerCase().includes(keyword.toLowerCase()) ||
      t.theme_style.toLowerCase().includes(keyword.toLowerCase()),
  );

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
              Desain Custom
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
          <span>✨</span> PILIH TEMPLATE UNDANGAN ANDA
        </div>

        <h1 className="katalog-hero__title">
          Katalog Eksklusif Undangan Digital Modern
        </h1>

        <p className="katalog-hero__desc">
          Pernikahan, Khitanan, Ulang Tahun, & Aqiqah dengan standar visual{" "}
          <em>Mobile-First (100dvh)</em>. Musik otomatis, amplop digital, RSVP
          realtime, dan hitung mundur presisi.
        </p>

        {/* Search Bar */}
        <div className="katalog-search-wrapper">
          <div className="katalog-search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Cari tema, adat, gaya, atau nama template..."
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
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}
          >
            <p>Memuat master template dari server...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}
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
                  <span className="katalog-card__badge-tag">
                    MASTER TEMPLATE
                  </span>
                  <span className="katalog-card__category-tag">
                    {item.category}
                  </span>

                  <div className="katalog-card__phone-frame">
                    <div className="katalog-card__phone-notch" />
                    <span className="katalog-card__phone-icon">
                      {item.category === "wedding"
                        ? "💍"
                        : item.category === "khitan"
                          ? "✂️"
                          : item.category === "birthday"
                            ? "🎂"
                            : "👶"}
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
                    <span style={{ fontWeight: 700 }}>
                      ⭐ 5.0 (Kurasi Studio)
                    </span>
                  </div>

                  <h3 className="katalog-card__title">{item.title}</h3>

                  <div className="katalog-card__pricing">
                    <div>
                      <p className="katalog-card__price-sub">
                        Mulai Paket Basic
                      </p>
                      <p className="katalog-card__price-val">
                        {formatRupiah(item.price_basic)}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#047857",
                      }}
                    >
                      Fitur Lengkap
                    </span>
                  </div>

                  <div className="katalog-card__buttons">
                    <a
                      href={item.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="katalog-card__btn-demo"
                    >
                      👁️ Live Demo
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(item)}
                      className="katalog-card__btn-order"
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
                <strong>Galeri Kuota 30 Foto</strong> (Cloudinary)
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
