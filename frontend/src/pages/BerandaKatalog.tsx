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
  const [paketAktif, setPaketAktif] = useState("Semua");
  const [keyword, setKeyword] = useState("");

  // Modal Slug Checker & Checkout State (PRD Modul B)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [selectedPackage, setSelectedPackage] = useState<api.PackageType>("standard");
  const [slugInput, setSlugInput] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugResult, setSlugResult] = useState<{ available: boolean; message: string } | null>(null);

  // Form Pembeli
  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPassword, setBuyerPassword] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [createdOrderData, setCreatedOrderData] = useState<api.CreateOrderResponse | null>(null);
  const [paySimulating, setPaySimulating] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  const kategoriPilihan = [
    { label: "Semua Acara", val: "Semua" },
    { label: "💍 Pernikahan", val: "wedding" },
    { label: "✂️ Khitanan", val: "khitan" },
    { label: "🎂 Ulang Tahun", val: "birthday" },
    { label: "👶 Aqiqah", val: "aqiqah" },
  ];

  const paketPilihan = [
    { label: "Semua Tipe", val: "Semua" },
    { label: "⚡ Standar (Tanpa Foto)", val: "standard" },
    { label: "👑 Koleksi Premium (Mewah)", val: "premium" },
  ];

  useEffect(() => {
    setLoading(true);
    const categoryParam = kategoriAktif === "Semua" ? undefined : kategoriAktif;
    const packageParam = paketAktif === "Semua" ? undefined : paketAktif;
    api.ambilSemuaTemplates(categoryParam, packageParam)
      .then((data) => setTemplateList(data))
      .catch((err) => console.error("Gagal memuat template:", err))
      .finally(() => setLoading(false));
  }, [kategoriAktif, paketAktif]);

  function handleBukaCheckout(item: Template) {
    setSelectedTemplate(item);
    setCheckoutStep(1);
    setSelectedPackage((item.package_type as api.PackageType) || "standard");
    setSlugInput("");
    setSlugResult(null);
    setBuyerName(user?.nama ?? "");
    setBuyerWhatsapp("");
    setBuyerEmail(user?.email ?? "");
    setBuyerPassword("");
    setOrderError("");
    setCreatedOrderData(null);
    setPaymentSuccessMsg("");
  }

  function getSelectedPackagePrice(): number {
    if (!selectedTemplate) return 0;
    return selectedTemplate.price || selectedTemplate.price_standard || 99000;
  }

  async function handleBuatPesanan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTemplate || !slugResult?.available) return;

    setOrderSubmitting(true);
    setOrderError("");
    try {
      const res = await api.buatOrder({
        buyer_name: buyerName,
        buyer_whatsapp: buyerWhatsapp,
        buyer_email: buyerEmail,
        password: buyerPassword,
        template_id: selectedTemplate.id,
        package_type: selectedPackage,
        slug: slugInput,
      });

      setCreatedOrderData(res);
      setCheckoutStep(3);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Gagal memproses pesanan");
    } finally {
      setOrderSubmitting(false);
    }
  }

  async function handleBayarSimulasi() {
    if (!createdOrderData) return;
    setPaySimulating(true);
    try {
      const res = await api.simulasiBayarOrder(createdOrderData.order.order_id);
      setPaymentSuccessMsg(res.message);
      setCreatedOrderData((prev) =>
        prev
          ? {
              ...prev,
              order: { ...prev.order, payment_status: "paid" },
              invitation: { ...prev.invitation, status: "active" },
            }
          : null
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal simulasi bayar");
    } finally {
      setPaySimulating(false);
    }
  }

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

        {/* Category & Package Filter Chips */}
        <div className="space-y-3 max-w-4xl mx-auto mt-6">
          {/* Baris 1: Filter Kategori Acara */}
          <div className="katalog-category-chips flex flex-wrap justify-center gap-2">
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

          {/* Baris 2: Filter Tipe Paket (Standar vs Premium) */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Tipe Desain:
            </span>
            {paketPilihan.map((pkt) => (
              <button
                key={pkt.val}
                onClick={() => setPaketAktif(pkt.val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  paketAktif === pkt.val
                    ? pkt.val === "premium"
                      ? "bg-amber-600 text-white font-bold shadow-xs"
                      : "bg-[#2D2424] text-white shadow-xs"
                    : "bg-[#F5EFE6]/60 border border-[#E3D9C9] text-gray-600 hover:bg-[#EFE7D8]"
                }`}
              >
                {pkt.label}
              </button>
            ))}
          </div>
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
                    {item.category}
                  </span>
                  <span
                    className={`template-card__badge-discount absolute top-3 right-3 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wide shadow-xs ${
                      item.package_type === "premium"
                        ? "bg-amber-400 text-amber-950 border border-amber-300"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {item.package_type === "premium" ? "👑 PREMIUM" : "⚡ STANDAR"}
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
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Harga Desain</p>
                      <span className="template-card__price-current font-extrabold text-xl text-[#3B171D]">
                        {formatRupiah(item.price || item.price_standard || 99000)}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        item.package_type === "premium"
                          ? "text-amber-800 bg-amber-50 border border-amber-200"
                          : "text-blue-800 bg-blue-50 border border-blue-200"
                      }`}
                    >
                      {item.package_type === "premium" ? "30 Foto • 12 Bln" : "Tanpa Foto • 6 Bln"}
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
                      onClick={() => handleBukaCheckout(item)}
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
          4. MODAL CHECKOUT & SLUG CHECKER (PRD MODUL B)
      ======================================================== */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in duration-200 my-8">
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8C6D3B] tracking-wider">
                  {checkoutStep === 1
                    ? "Langkah 1/3: Pilih Paket & Cek Slug"
                    : checkoutStep === 2
                    ? "Langkah 2/3: Data Pemesan & Akun Klien"
                    : "Langkah 3/3: Konfirmasi & Pembayaran"}
                </span>
                <h3 className="text-xl font-bold font-serif text-[#3B171D]">
                  {selectedTemplate.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: INFORMASI TEMPLATE & SLUG CHECKER */}
            {checkoutStep === 1 && (
              <div className="space-y-4">
                {/* Detail Paket & Harga Template Terkunci */}
                <div className="p-4 rounded-2xl border border-[#EBE3D5] bg-[#FAF7F2] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedTemplate.package_type === "premium" ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-2xs">
                          👑 PAKET PREMIUM
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                          ⚡ PAKET STANDAR
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-medium">
                        {selectedTemplate.theme_style}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#4A151E]">
                        {formatRupiah(getSelectedPackagePrice())}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedTemplate.package_type === "premium"
                      ? "✨ Desain mewah & eksklusif, galeri foto hingga 30 foto (Auto-WebP), musik autoplay, amplop digital QRIS, dan masa aktif 12 bulan."
                      : "⚡ Desain minimalis clean & elegan, teks acara lengkap, peta Google Maps, RSVP realtime, dan masa aktif 6 bulan (tanpa galeri foto)."}
                  </p>
                </div>

                {/* Slug Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tautan / Slug Undangan Anda:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#4A151E]/20 bg-gray-50">
                    <span className="text-xs text-gray-400 select-none">undang_an.digital/</span>
                    <input
                      type="text"
                      placeholder="contoh: dimas-dinda"
                      value={slugInput}
                      onChange={(e) => handleCekSlug(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none pl-1"
                    />
                    {slugChecking && <span className="text-xs text-gray-400 animate-spin">⏳</span>}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Hanya gunakan huruf kecil, angka, dan strip (minimal 3 huruf).
                  </p>
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

                <div className="pt-3 flex justify-between items-center border-t border-gray-100">
                  <div className="text-xs">
                    <span className="text-gray-400">Total Biaya: </span>
                    <strong className="text-sm text-[#4A151E]">
                      {formatRupiah(getSelectedPackagePrice())}
                    </strong>
                  </div>
                  <button
                    type="button"
                    disabled={!slugResult?.available}
                    onClick={() => setCheckoutStep(2)}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-xs bg-[#4A151E] hover:bg-[#360F15] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Lanjut Isi Data Pemesan →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATA PEMESAN & AKUN LOGIN */}
            {checkoutStep === 2 && (
              <form onSubmit={handleBuatPesanan} className="space-y-4">
                {orderError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200">
                    {orderError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Lengkap Pemesan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A151E] outline-none text-xs"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerWhatsapp}
                      onChange={(e) => setBuyerWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A151E] outline-none text-xs"
                      placeholder="081234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email Pembeli <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A151E] outline-none text-xs"
                      placeholder="budi@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Password Akun Klien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={buyerPassword}
                    onChange={(e) => setBuyerPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A151E] outline-none text-xs"
                    placeholder="Minimal 6 karakter (untuk login dashboard)"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Password ini akan dipakai login ke Dashboard Klien untuk edit acara & upload foto.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1 border border-[#EBE3D5]">
                  <div className="flex justify-between text-gray-600">
                    <span>Tautan Undangan:</span>
                    <strong className="font-mono text-[#4A151E]">/{slugInput}</strong>
                  </div>
                  <div className="flex justify-between text-gray-600 items-center">
                    <span>Paket Desain:</span>
                    <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded bg-white border border-[#E8DEC8]">
                      {selectedTemplate.package_type === "premium" ? "👑 PREMIUM" : "⚡ STANDAR"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-900 border-t border-gray-200 pt-1 font-bold">
                    <span>Total Pembayaran:</span>
                    <span className="text-[#4A151E]">{formatRupiah(getSelectedPackagePrice())}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-xs bg-[#4A151E] hover:bg-[#360F15] text-white disabled:opacity-50 cursor-pointer"
                  >
                    {orderSubmitting ? "Memproses Order..." : "Konfirmasi & Lanjut Bayar →"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: STATUS PEMESANAN & PEMBAYARAN MIDTRANS */}
            {checkoutStep === 3 && createdOrderData && (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl mx-auto">
                  {createdOrderData.order.payment_status === "paid" ? "🎉" : "📋"}
                </div>

                <div>
                  <h4 className="text-lg font-serif font-bold text-gray-900">
                    {createdOrderData.order.payment_status === "paid"
                      ? "Pembayaran Berhasil & Undangan Aktif!"
                      : "Pesanan Berhasil Dibuat!"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Nomor Pesanan:{" "}
                    <strong className="font-mono text-gray-800">{createdOrderData.order.order_id}</strong>
                  </p>
                </div>

                {paymentSuccessMsg && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-medium border border-emerald-200">
                    {paymentSuccessMsg}
                  </div>
                )}

                <div className="bg-[#FAF7F2] p-4 rounded-2xl text-xs text-left space-y-2 border border-[#EBE3D5]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pemesan:</span>
                    <strong className="text-gray-800">{createdOrderData.order.buyer_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tautan:</span>
                    <strong className="font-mono text-indigo-700">undang_an.digital/{createdOrderData.invitation.slug}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <strong className="text-gray-900">{formatRupiah(createdOrderData.order.gross_amount)}</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                    <span className="text-gray-500">Status Pembayaran:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        createdOrderData.order.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {createdOrderData.order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {createdOrderData.order.payment_status !== "paid" ? (
                    <button
                      type="button"
                      disabled={paySimulating}
                      onClick={handleBayarSimulasi}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>⚡</span> {paySimulating ? "Memproses Aktivasi..." : "Bayar Sekarang (Simulasi Midtrans Lunas)"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full py-3 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-xs text-center cursor-pointer block"
                    >
                      Masuk ke Dashboard Klien & Isi Acara →
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="w-full py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    Kembali ke Katalog
                  </button>
                </div>
              </div>
            )}
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
