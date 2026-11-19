/**
 * ============================================================================
 * KOMPONEN: CHECKOUT & SLUG CHECKER MODAL
 * Proyek: ASM Undangan Digital (PRD Modul B)
 * 
 * [FITUR-1] Pilihan 2 Paket Resmi (Basic vs Premium)
 * [FITUR-2] Real-time Slug Checker dengan Debounce 300ms (Anti Spam)
 * [FITUR-3] Slot Status Terkunci 24px (Zero Layout Shift - Anti Naik Turun)
 * [FITUR-4] Form Data Pemesan & Registrasi Akun Klien
 * [FITUR-5] Simulasi Bayar Midtrans & Aktivasi Undangan Instan
 * ============================================================================
 */

import { useState, useRef, useEffect } from "react";
import * as api from "../lib/api";
import type { Template, CreateOrderResponse, PackageType } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatRupiah, sanitizeSlug } from "../utils/format";
import "../styles/CheckoutModal.css";

interface CheckoutModalProps {
  template: Template;
  onClose: () => void;
}

export default function CheckoutModal({ template, onClose }: CheckoutModalProps) {
  const { user } = useAuth();

  // [STATE] Tahapan Checkout: 1 = Slug, 2 = Form Pemesan, 3 = Pembayaran
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);

  // [LOGIKA] Paket & Harga Terkunci Sesuai PRD Section 3 & FR-A3
  const isPremiumTemplate =
    template.package_type === "premium" ||
    (template.price !== undefined && template.price >= 100000);
  const selectedPackage: PackageType = isPremiumTemplate ? "premium" : "standard";
  const packagePrice =
    template.price ||
    (isPremiumTemplate ? template.price_standard || 149000 : template.price_basic || 79000);

  function getSelectedPackagePrice(): number {
    return packagePrice;
  }

  // [STATE] Slug Checker
  const [slugInput, setSlugInput] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugResult, setSlugResult] = useState<{ available: boolean; message: string } | null>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // [STATE] Form Pemesan
  const [buyerName, setBuyerName] = useState(user?.nama ?? "");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [buyerPassword, setBuyerPassword] = useState("");

  // [STATE] Status Order & Midtrans
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [createdOrderData, setCreatedOrderData] = useState<CreateOrderResponse | null>(null);
  const [paySimulating, setPaySimulating] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  // [LIFECYCLE] Bersihkan timer saat modal ditutup
  useEffect(() => {
    return () => {
      if (slugDebounceRef.current) {
        clearTimeout(slugDebounceRef.current);
      }
    };
  }, []);

  // [LOGIKA] Pengecekan Slug dengan Debounce 300ms
  function handleSlugChange(val: string) {
    const clean = sanitizeSlug(val);
    setSlugInput(clean);

    if (slugDebounceRef.current) {
      clearTimeout(slugDebounceRef.current);
    }

    if (clean.length < 3) {
      setSlugChecking(false);
      setSlugResult(null);
      return;
    }

    setSlugChecking(true);
    slugDebounceRef.current = setTimeout(async () => {
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
    }, 300);
  }

  // [LOGIKA] Pembuatan Pesanan ke Backend
  async function handleBuatPesanan(e: React.FormEvent) {
    e.preventDefault();
    if (!slugResult?.available) return;

    setOrderSubmitting(true);
    setOrderError("");
    try {
      const res = await api.buatOrder({
        buyer_name: buyerName,
        buyer_whatsapp: buyerWhatsapp,
        buyer_email: buyerEmail,
        password: buyerPassword,
        template_id: template.id,
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

  // [LOGIKA] Simulasi Bayar Midtrans
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

  return (
    <div className="checkout-modal-backdrop">
      <div className="checkout-modal-card">
        {/* ========================================================
            HEADER MODAL
        ======================================================== */}
        <div className="checkout-header">
          <div>
            <span className="checkout-header__step">
              {checkoutStep === 1
                ? "Langkah 1/3: Cek Tautan / Slug Undangan"
                : checkoutStep === 2
                ? "Langkah 2/3: Data Pemesan & Akun Klien"
                : "Langkah 3/3: Konfirmasi & Pembayaran"}
            </span>
            <h3 className="checkout-header__title">{template.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="checkout-header__close-btn"
            aria-label="Tutup"
          >
            <svg className="w-4 h-4 text-slate-400 hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ========================================================
            STEP 1: RINGKASAN PAKET TERKUNCI & CEK SLUG (PRD FR-A3)
        ======================================================== */}
        {checkoutStep === 1 && (
          <div className="checkout-step-body">
            <div>
              {/* Ringkasan Paket Terkunci Sesuai PRD Section 3 */}
              <label className="checkout-section-label">Paket & Harga Desain (Terkunci):</label>
              <div
                className="checkout-package-card checkout-package-card--selected checkout-package-card--static"
              >
                <span className="checkout-package-card__badge">
                  {selectedPackage === "premium" ? "Paket Premium Resmi" : "Paket Basic Resmi"}
                </span>
                <p className="checkout-package-card__name">
                  {template.title} • {selectedPackage === "premium" ? "Paket Premium" : "Paket Basic"}
                </p>
                <p className="checkout-package-card__price">{formatRupiah(packagePrice)}</p>
                <p className="checkout-package-card__features">
                  {selectedPackage === "premium"
                    ? "Maksimal 20 Foto (Cloudinary) • Musik Autoplay • Masa Aktif 12 Bulan"
                    : "Tanpa Galeri Foto (0 Foto) • Form Acara Lengkap • Masa Aktif 6 Bulan"}
                </p>
              </div>

              {/* Input Slug & Slot Status 24px */}
              <div className="checkout-slug-group">
                <label className="checkout-section-label">Tautan / Slug Undangan Anda:</label>
                <div
                  className={`checkout-slug-input-box ${
                    slugResult
                      ? slugResult.available
                        ? "checkout-slug-input-box--valid"
                        : "checkout-slug-input-box--invalid"
                      : ""
                  }`}
                >
                  <span className="checkout-slug-prefix">undang_an.digital/</span>
                  <input
                    type="text"
                    placeholder="contoh: dimas-dinda"
                    value={slugInput}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="checkout-slug-field"
                  />
                  {slugChecking && (
                    <span className="checkout-slug-icon--loading">
                      <div className="w-3.5 h-3.5 border-2 border-[#2D3E2F] border-t-transparent rounded-full animate-spin" />
                    </span>
                  )}
                  {!slugChecking && slugResult && (
                    <span className="checkout-slug-icon">
                      {slugResult.available ? (
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>

                {/* KUNCI ZERO LAYOUT SHIFT: Slot berukuran tetap 24px */}
                <div className="checkout-slug-status-slot">
                  {slugChecking ? (
                    <span className="checkout-slug-status--checking">
                      <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Memeriksa ketersediaan tautan...</span>
                    </span>
                  ) : slugResult ? (
                    <span
                      className={
                        slugResult.available
                          ? "checkout-slug-status--available"
                          : "checkout-slug-status--unavailable"
                      }
                    >
                      {slugResult.available ? (
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="5" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>{slugResult.message}</span>
                    </span>
                  ) : (
                    <span className="checkout-slug-status--hint">
                      Gunakan huruf kecil, angka, dan strip (minimal 3 karakter).
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Aksi Step 1 */}
            <div className="checkout-footer">
              <div>
                <span className="checkout-total-label">Total Biaya:</span>
                <strong className="checkout-total-amount">
                  {formatRupiah(getSelectedPackagePrice())}
                </strong>
              </div>
              <button
                type="button"
                disabled={!slugResult?.available}
                onClick={() => setCheckoutStep(2)}
                className="checkout-btn-primary"
              >
                Lanjut Isi Data Pemesan →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: DATA PEMESAN & AKUN KLIEN
        ======================================================== */}
        {checkoutStep === 2 && (
          <form onSubmit={handleBuatPesanan} className="checkout-step-body">
            <div>
              {orderError && <div className="checkout-error-banner">{orderError}</div>}

              <div className="checkout-form-row">
                <label className="checkout-section-label">
                  Nama Lengkap Pemesan <span className="checkout-req-star">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="checkout-form-input"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-form-row">
                  <label className="checkout-section-label">
                    Nomor WhatsApp <span className="checkout-req-star">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerWhatsapp}
                    onChange={(e) => setBuyerWhatsapp(e.target.value)}
                    className="checkout-form-input"
                    placeholder="081234567890"
                  />
                </div>

                <div className="checkout-form-row">
                  <label className="checkout-section-label">
                    Email Pembeli <span className="checkout-req-star">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="checkout-form-input"
                    placeholder="budi@example.com"
                  />
                </div>
              </div>

              <div className="checkout-form-row">
                <label className="checkout-section-label">
                  Password Akun Klien <span className="checkout-req-star">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={buyerPassword}
                  onChange={(e) => setBuyerPassword(e.target.value)}
                  className="checkout-form-input"
                  placeholder="Minimal 6 karakter"
                />
                <p className="checkout-form-hint">
                  Password ini akan dipakai login ke Dashboard Klien untuk edit acara & foto.
                </p>
              </div>

              <div className="checkout-summary-box">
                <div className="checkout-summary-row">
                  <span>Tautan Undangan:</span>
                  <strong className="checkout-summary-code">
                    /{slugInput}
                  </strong>
                </div>
                <div className="checkout-summary-row">
                  <span>Paket Pilihan:</span>
                  <strong className="checkout-summary-package">{selectedPackage}</strong>
                </div>
                <div className="checkout-summary-row checkout-summary-row--total">
                  <span>Total Pembayaran:</span>
                  <span className="checkout-summary-price">
                    {formatRupiah(getSelectedPackagePrice())}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Aksi Step 2 */}
            <div className="checkout-footer">
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="checkout-btn-back"
              >
                ← Kembali
              </button>
              <button
                type="submit"
                disabled={orderSubmitting}
                className="checkout-btn-primary"
              >
                {orderSubmitting ? "Memproses Order..." : "Konfirmasi & Lanjut Bayar →"}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 3: STATUS ORDER & SIMULASI MIDTRANS
        ======================================================== */}
        {checkoutStep === 3 && createdOrderData && (
          <div className="checkout-step-body">
            <div className="checkout-success-view">
              <div className="checkout-success-icon">
                {createdOrderData.order.payment_status === "paid" ? (
                  <svg className="w-8 h-8 text-[#3A5438]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-[#82622B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>

              <h4 className="checkout-success-title">
                {createdOrderData.order.payment_status === "paid"
                  ? "Pembayaran Berhasil & Undangan Aktif!"
                  : "Pesanan Berhasil Dibuat!"}
              </h4>
              <p className="checkout-order-number">
                Nomor Pesanan: <strong>{createdOrderData.order.order_id}</strong>
              </p>

              {paymentSuccessMsg && (
                <div className="checkout-success-banner">
                  <p className="checkout-success-banner__desc">{paymentSuccessMsg}</p>
                </div>
              )}

              <div className="checkout-summary-box checkout-summary-box--left">
                <div className="checkout-summary-row">
                  <span>Pemesan:</span>
                  <strong>{createdOrderData.order.buyer_name}</strong>
                </div>
                <div className="checkout-summary-row">
                  <span>Tautan:</span>
                  <strong className="checkout-summary-code--link">
                    undang_an.digital/{createdOrderData.invitation.slug}
                  </strong>
                </div>
                <div className="checkout-summary-row">
                  <span>Total:</span>
                  <strong>{formatRupiah(createdOrderData.order.gross_amount)}</strong>
                </div>
                <div className="checkout-summary-row checkout-summary-row--total">
                  <span>Status Pembayaran:</span>
                  <span className="checkout-status-badge--success">
                    {createdOrderData.order.payment_status}
                  </span>
                </div>
              </div>

              {createdOrderData.order.payment_status !== "paid" ? (
                <button
                  type="button"
                  disabled={paySimulating}
                  onClick={handleBayarSimulasi}
                  className="checkout-btn-pay"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>
                    {paySimulating
                      ? "Memproses Aktivasi..."
                      : "Bayar Sekarang (Simulasi Midtrans Lunas)"}
                  </span>
                </button>
              ) : (
                <a
                  href={`/${createdOrderData.invitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="checkout-btn-pay checkout-btn-pay--link"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Buka Undangan Digital Tamu</span>
                </a>
              )}
            </div>

            <div className="checkout-footer checkout-footer--center">
              <button type="button" onClick={onClose} className="checkout-btn-back">
                Tutup Jendela
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

