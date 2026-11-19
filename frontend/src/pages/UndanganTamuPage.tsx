import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Invitation, Rsvp, Attendance } from "../lib/api";
import { getDemoData, DEMO_INVITATIONS } from "../utils/demoData";
import "../styles/UndanganTamu.css";

interface UndanganTamuPageProps {
  isDemo?: boolean;
}

export default function UndanganTamuPage({ isDemo = false }: UndanganTamuPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const guestParam = searchParams.get("to") || "";

  const isDemoMode =
    isDemo ||
    location.pathname.startsWith("/demo") ||
    Boolean(slug && DEMO_INVITATIONS[slug]);

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cover State (FR-D1 100dvh)
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form State
  const [namaTamu, setNamaTamu] = useState(guestParam);
  const [kehadiran, setKehadiran] = useState<Attendance>("hadir");
  const [pax, setPax] = useState(1);
  const [pesanDoa, setPesanDoa] = useState("");
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState("");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  useEffect(() => {
    async function muatData() {
      if (!slug) return;
      setLoading(true);
      setError("");

      // Mode Demo: Gunakan data demo master langsung
      if (isDemoMode) {
        const demo = getDemoData(slug);
        setInvitation(demo.invitation);
        setRsvps(demo.rsvps);
        setLoading(false);
        return;
      }

      try {
        const invData = await api.ambilDetailUndangan(slug);
        setInvitation(invData);

        const rsvpData = await api.ambilDaftarRsvps(slug);
        setRsvps(rsvpData);
      } catch (err) {
        // Jika API gagal / belum ada order di database tapi ada data demo, gunakan fallback demo
        if (DEMO_INVITATIONS[slug]) {
          const fallbackDemo = getDemoData(slug);
          setInvitation(fallbackDemo.invitation);
          setRsvps(fallbackDemo.rsvps);
        } else {
          setError(err instanceof Error ? err.message : "Gagal memuat undangan");
        }
      } finally {
        setLoading(false);
      }
    }

    muatData();
  }, [slug, isDemoMode]);

  // Update Countdown Timer
  useEffect(() => {
    if (!invitation?.event_details?.akad?.tanggal) return;

    const targetDate = new Date(
      `${invitation.event_details.akad.tanggal}T08:00:00`
    ).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invitation]);

  function handleBukaUndangan() {
    setIsOpen(true);
    // Putar musik jika ada URL musik
    if (invitation?.event_details?.music_url && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => console.log("Autoplay blocked by browser policy"));
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  }

  async function handleSubmitRsvp(e: FormEvent) {
    e.preventDefault();
    if (!slug || !namaTamu || !pesanDoa) return;

    setSubmittingRsvp(true);
    setRsvpSuccess("");

    if (isDemoMode) {
      // Simulasi lokal untuk demo mode tanpa perlu panggil backend
      setTimeout(() => {
        const newDemoRsvp: Rsvp = {
          id: Date.now(),
          invitation_id: invitation?.id || 999,
          guest_name: namaTamu,
          attendance: kehadiran,
          pax: kehadiran === "hadir" ? pax : 0,
          message: pesanDoa,
          created_at: new Date().toISOString(),
        };
        setRsvps((prev) => [newDemoRsvp, ...prev]);
        setRsvpSuccess("[DEMO] Terima kasih atas doa restu dan konfirmasi kehadiran Anda!");
        setPesanDoa("");
        setSubmittingRsvp(false);
      }, 400);
      return;
    }

    try {
      const res = await api.kirimRsvp(slug, {
        guest_name: namaTamu,
        attendance: kehadiran,
        pax: kehadiran === "hadir" ? pax : 0,
        message: pesanDoa,
      });

      setRsvps((prev) => [res.rsvp, ...prev]);
      setRsvpSuccess("Terima kasih atas doa restu dan konfirmasi kehadiran Anda!");
      setPesanDoa("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengirim RSVP");
    } finally {
      setSubmittingRsvp(false);
    }
  }

  function handleSalinRekening(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2500);
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="guest-view-wrapper guest-loading-wrapper">
        <div className="guest-loading-box">
          <p className="guest-loading-title">Mempersiapkan Undangan Digital...</p>
          <p className="guest-loading-desc">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found / Expired
  if (error || !invitation) {
    return (
      <div className="guest-view-wrapper guest-error-wrapper">
        <div className="guest-error-box">
          <span className="guest-error-icon flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <h2 className="guest-error-title">
            Undangan Tidak Tersedia
          </h2>
          <p className="guest-error-desc">
            {error || "Tautan undangan tidak ditemukan atau masa aktifnya telah berakhir."}
          </p>
          <Link to="/" className="guest-error-btn">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 3. Status Gatekeeper: Expired / Cleaned (FR-D2)
  const isExpired =
    !isDemoMode &&
    (invitation.is_expired ||
      invitation.status === "expired" ||
      invitation.status === "cleaned" ||
      (invitation.expires_at ? new Date() > new Date(invitation.expires_at) : false));

  if (isExpired) {
    const namaPria = invitation.event_details?.mempelai?.pria?.panggilan || invitation.event_details?.mempelai?.pria?.nama;
    const namaWanita = invitation.event_details?.mempelai?.wanita?.panggilan || invitation.event_details?.mempelai?.wanita?.nama;
    const judulAcara =
      namaPria && namaWanita
        ? `${namaPria} & ${namaWanita}`
        : invitation.event_details?.title || invitation.buyer_name || "Mempelai";

    let tglBerakhir = "";
    if (invitation.expires_at) {
      try {
        tglBerakhir = new Date(invitation.expires_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch {}
    }

    return (
      <div className="guest-view-wrapper expired-invitation-container">
        <div className="expired-invitation-card">
          <div className="expired-icon-bubble flex items-center justify-center">
            <svg className="w-8 h-8 text-[#2D3E2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="expired-tag">Masa Aktif Berakhir</span>
          <h2 className="expired-title">Masa Aktif Undangan Selesai</h2>
          <p className="expired-event-name">{judulAcara}</p>
          <p className="expired-message">
            Masa aktif penayangan undangan digital ini telah selesai. Seluruh data acara, galeri foto, dan amplop digital telah dinonaktifkan demi privasi dan keamanan. Terima kasih atas seluruh doa restu dan perhatian yang telah diberikan.
          </p>

          {tglBerakhir && (
            <div className="expired-date-info">
              Masa aktif berakhir pada: <strong>{tglBerakhir}</strong>
            </div>
          )}

          <div className="expired-actions">
            <Link to="/login" className="expired-btn-owner flex items-center justify-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-[#2D3E2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Pemilik Undangan? Masuk Dashboard</span>
            </Link>
            <Link to="/" className="expired-btn-catalog flex items-center justify-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
              </svg>
              <span>Buat Undangan Digital Baru</span>
            </Link>
          </div>

          <div className="expired-footer">
            Platform Katalog & Generator Undangan Digital &bull; <Link to="/">asm.invitation</Link>
          </div>
        </div>
      </div>
    );
  }

  const details = invitation.event_details || {};
  const pria = details.mempelai?.pria;
  const wanita = details.mempelai?.wanita;

  return (
    <div className={`guest-view-wrapper ${isDemoMode ? "guest-view-wrapper--demo" : ""}`}>
      {/* ========================================================
          LIVE DEMO FLOATING TOP BAR (PRD FR-A2)
      ======================================================== */}
      {isDemoMode && (
        <header className="demo-top-bar">
          <div className="demo-top-bar__info">
            <span className="demo-top-bar__tag inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Live Demo</span>
            </span>
            <span className="demo-top-bar__title">
              {invitation.template_title || invitation.event_details?.title || "Desain Undangan"}
            </span>
            <span className="demo-top-bar__package inline-flex items-center gap-1">
              {invitation.package_type === "premium" ? (
                <>
                  <svg className="w-3 h-3 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Paket Premium</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 text-[#3A5438]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Paket Basic</span>
                </>
              )}
            </span>
          </div>

          <div className="demo-top-bar__actions">
            <Link
              to={`/?checkout=${invitation.slug}`}
              className="demo-top-bar__btn-order inline-flex items-center gap-1.5"
              title="Pilih dan beli desain ini"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Pesan Desain Ini</span>
            </Link>
            <Link to="/" className="demo-top-bar__btn-back" title="Kembali ke Beranda Katalog">
              ← Katalog
            </Link>
          </div>
        </header>
      )}

      <div className="guest-phone-container">
        {/* Audio Element */}
        {details.music_url && (
          <audio ref={audioRef} src={details.music_url} loop preload="auto" />
        )}

        {/* Floating Music Button */}
        {isOpen && details.music_url && (
          <button
            type="button"
            onClick={toggleMusic}
            className="guest-music-btn"
            title={isPlayingMusic ? "Heningkan Musik" : "Putar Musik"}
          >
            {isPlayingMusic ? (
              <svg className="w-4 h-4 text-[#2D3E2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        )}

        {/* ========================================================
            FR-D1: COVER SAMPUL TERKUNCI (100dvh)
        ======================================================== */}
        <div className={`guest-cover ${isOpen ? "guest-cover--opened" : ""}`}>
          <div className="guest-cover__header">
            <span className="guest-cover__subtitle">THE WEDDING OF</span>
            <div className="guest-cover__divider" />
          </div>

          <div className="guest-cover__names">
            <h1 className="guest-cover__title">
              {pria?.panggilan || "Dimas"} <br />
              <span className="guest-cover__ampersand">&amp;</span> <br />
              {wanita?.panggilan || "Dinda"}
            </h1>
            <p className="guest-cover__date">
              {details.akad?.tanggal
                ? new Date(details.akad.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Spesial Hari Bahagia"}
            </p>
          </div>

          <div className="guest-cover__footer">
            <div className="guest-cover__box">
              <p className="guest-cover__to-label">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
              <p className="guest-cover__guest-name">{guestParam || "Tamu Undangan"}</p>
            </div>

            <button
              type="button"
              onClick={handleBukaUndangan}
              className="guest-cover__open-btn inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Buka Undangan</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            KONTEN UTAMA UNDANGAN
        ======================================================== */}
        <main className="guest-main">
          {/* Hero Section */}
          <section className="guest-hero">
            <span className="guest-hero__tag">WALIMATUL ‘URS</span>
            <h2 className="guest-hero__title">
              {pria?.panggilan || "Dimas"} & {wanita?.panggilan || "Dinda"}
            </h2>
            <p className="guest-hero__quote">
              &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu
              dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.&rdquo;
              <br />
              <strong className="guest-quote-source">
                (QS. Ar-Rum: 21)
              </strong>
            </p>
          </section>

          {/* Profil Mempelai */}
          <section className="guest-couple-section">
            {/* Pria */}
            <div className="guest-couple-card">
              {pria?.foto ? (
                <img
                  src={pria.foto}
                  alt={pria?.nama || "Mempelai Pria"}
                  className="guest-couple-avatar"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#FAF8F3] border-2 border-[#DCD7CA] flex items-center justify-center mx-auto text-[#2D3E2F]">
                  <svg className="w-10 h-10 text-[#82622B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <h3 className="guest-couple-name">{pria?.nama || "Dimas Pratama, S.Kom"}</h3>
              <p className="guest-couple-parents">
                Putra tercinta dari: <br />
                <strong>{pria?.ayah || "Bpk. Hendra Gunawan"}</strong> &amp;{" "}
                <strong>{pria?.ibu || "Ibu Siti Rahmawati"}</strong>
              </p>
            </div>

            <div className="guest-mempelai-ampersand">
              &amp;
            </div>

            {/* Wanita */}
            <div className="guest-couple-card">
              {wanita?.foto ? (
                <img
                  src={wanita.foto}
                  alt={wanita?.nama || "Mempelai Wanita"}
                  className="guest-couple-avatar"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#FAF8F3] border-2 border-[#DCD7CA] flex items-center justify-center mx-auto text-[#A2583E]">
                  <svg className="w-10 h-10 text-[#A2583E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <h3 className="guest-couple-name">{wanita?.nama || "Adinda Putri Lestari, S.E"}</h3>
              <p className="guest-couple-parents">
                Putri tercinta dari: <br />
                <strong>{wanita?.ayah || "Bpk. Bambang Sudiro"}</strong> &amp;{" "}
                <strong>{wanita?.ibu || "Ibu Ratna Dewi"}</strong>
              </p>
            </div>
          </section>

          {/* Countdown Timer */}
          <section className="guest-countdown-section">
            <h3 className="guest-countdown-title">Menghitung Hari Menuju Momen Bahagia</h3>
            <div className="guest-countdown-grid">
              <div className="guest-countdown-box">
                <p className="guest-countdown-num">{timeLeft.days}</p>
                <p className="guest-countdown-unit">Hari</p>
              </div>
              <div className="guest-countdown-box">
                <p className="guest-countdown-num">{timeLeft.hours}</p>
                <p className="guest-countdown-unit">Jam</p>
              </div>
              <div className="guest-countdown-box">
                <p className="guest-countdown-num">{timeLeft.minutes}</p>
                <p className="guest-countdown-unit">Menit</p>
              </div>
              <div className="guest-countdown-box">
                <p className="guest-countdown-num">{timeLeft.seconds}</p>
                <p className="guest-countdown-unit">Detik</p>
              </div>
            </div>
          </section>

          {/* Rangkaian Acara (Akad & Resepsi) */}
          <section className="guest-events-section">
            <h3 className="guest-events-title">
              Rangkaian Acara
            </h3>

            {/* Akad */}
            <div className="guest-event-card">
              <span className="guest-event-badge inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#82622B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0a2 2 0 100-4 2 2 0 000 4zm-8 4v-4m0 0a2 2 0 100-4 2 2 0 000 4zm14-12l-1.5 1.5M6 6l1.5 1.5M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                <span>AKAD NIKAH</span>
              </span>
              <h4 className="guest-event-title">
                {details.akad?.tanggal
                  ? new Date(details.akad.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Sabtu, 20 Desember 2026"}
              </h4>
              <p className="guest-event-info">
                {details.akad?.jam || "08:00 - 10:00 WIB"} <br />
                <strong>{details.akad?.lokasi || "Masjid Agung Al-Barkah"}</strong> <br />
                {details.akad?.alamat || "Jl. Veteran No. 46, Kota Bekasi"}
              </p>
              {details.akad?.maps_url && (
                <a
                  href={details.akad.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="guest-maps-btn inline-flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Petunjuk Arah Google Maps</span>
                </a>
              )}
            </div>

            {/* Resepsi */}
            <div className="guest-event-card">
              <span className="guest-event-badge inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#A2583E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>RESEPSI PERNIKAHAN</span>
              </span>
              <h4 className="guest-event-title">
                {details.resepsi?.tanggal
                  ? new Date(details.resepsi.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Sabtu, 20 Desember 2026"}
              </h4>
              <p className="guest-event-info">
                {details.resepsi?.jam || "11:00 - 14:00 WIB"} <br />
                <strong>{details.resepsi?.lokasi || "Grand Ballroom Hotel Horison"}</strong> <br />
                {details.resepsi?.alamat || "Jl. KH. Noer Ali, Pekayon Jaya, Kota Bekasi"}
              </p>
              {details.resepsi?.maps_url && (
                <a
                  href={details.resepsi.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="guest-maps-btn inline-flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Petunjuk Arah Google Maps</span>
                </a>
              )}
            </div>
          </section>

          {/* Galeri Foto */}
          {details.photos && details.photos.length > 0 && (
            <section className="guest-gallery-section">
              <div className="guest-section-header">
                <span className="guest-section-header__tag">MEMORIES</span>
                <h3 className="guest-section-header__title">Galeri Kebahagiaan</h3>
              </div>
              <div className="guest-gallery-grid">
                {details.photos.map((foto, idx) => (
                  <img
                    key={idx}
                    src={foto}
                    alt={`Foto ${idx + 1}`}
                    className="guest-gallery-img"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Amplop Digital (Cashless) */}
          {details.amplop && details.amplop.length > 0 && (
            <section className="guest-amplop-section">
              <div className="guest-section-header">
                <span className="guest-section-header__tag">TANDA KASIH</span>
                <h3 className="guest-section-header__title">Amplop Digital</h3>
              </div>

              {details.amplop.map((rek, idx) => (
                <div key={idx} className="guest-amplop-card">
                  <div>
                    <span className="guest-bank-badge">
                      {rek.bank}
                    </span>
                    <p className="guest-bank-rek">
                      {rek.no_rek}
                    </p>
                    <p className="guest-bank-holder">
                      a.n. {rek.atas_nama}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSalinRekening(rek.no_rek, `${rek.bank}-${idx}`)}
                    className="guest-copy-btn inline-flex items-center gap-1"
                  >
                    {copiedBank === `${rek.bank}-${idx}` ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Disalin!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* Buku Tamu & RSVP Realtime (FR-D3) */}
          <section className="guest-rsvp-section">
            <div className="guest-section-header">
              <span className="guest-section-header__tag">RSVP &amp; WISHES</span>
              <h3 className="guest-section-header__title">Buku Tamu &amp; Doa Restu</h3>
            </div>

            <form onSubmit={handleSubmitRsvp} className="guest-rsvp-card">
              {rsvpSuccess && (
                <div className="guest-rsvp-success">
                  {rsvpSuccess}
                </div>
              )}

              <div className="guest-rsvp-form-group">
                <label className="guest-rsvp-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={namaTamu}
                  onChange={(e) => setNamaTamu(e.target.value)}
                  placeholder="Nama Anda"
                  className="guest-rsvp-input"
                />
              </div>

              <div className="guest-rsvp-form-group">
                <label className="guest-rsvp-label">Konfirmasi Kehadiran</label>
                <select
                  value={kehadiran}
                  onChange={(e) => setKehadiran(e.target.value as Attendance)}
                  className="guest-rsvp-select"
                >
                  <option value="hadir">Hadir</option>
                  <option value="ragu">Masih Ragu</option>
                  <option value="tidak_hadir">Tidak Hadir</option>
                </select>
              </div>

              {kehadiran === "hadir" && (
                <div className="guest-rsvp-form-group">
                  <label className="guest-rsvp-label">Jumlah Orang (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={pax}
                    onChange={(e) => setPax(Math.max(1, Number(e.target.value)))}
                    className="guest-rsvp-input"
                  />
                </div>
              )}

              <div className="guest-rsvp-form-group">
                <label className="guest-rsvp-label">Ucapan &amp; Doa Restu</label>
                <textarea
                  rows={3}
                  required
                  value={pesanDoa}
                  onChange={(e) => setPesanDoa(e.target.value)}
                  placeholder="Tuliskan doa restu untuk kedua mempelai..."
                  className="guest-rsvp-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRsvp}
                className="guest-rsvp-submit-btn inline-flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>{submittingRsvp ? "Mengirimkan Doa..." : "Kirim Ucapan & RSVP"}</span>
              </button>
            </form>

            {/* List Ucapan Doa Realtime */}
            <div className="guest-guestbook-list">
              <h4 className="guest-guestbook-title">
                Doa Restu Tamu ({rsvps.length})
              </h4>
              {rsvps.map((r) => (
                <div key={r.id} className="guest-guestbook-item">
                  <div className="guest-guestbook-header">
                    <strong className="guest-guestbook-name">{r.guest_name}</strong>
                    <span
                      className={`guest-guestbook-status ${
                        r.attendance === "hadir"
                          ? "guest-guestbook-status--hadir"
                          : r.attendance === "ragu"
                          ? "guest-guestbook-status--ragu"
                          : "guest-guestbook-status--tidak-hadir"
                      }`}
                    >
                      {r.attendance === "hadir"
                        ? `Hadir (${r.pax} org)`
                        : r.attendance === "ragu"
                        ? "Ragu"
                        : "Tidak Hadir"}
                    </span>
                  </div>
                  <p className="guest-guestbook-message">&ldquo;{r.message}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>

          {/* FR-D4: Viral Loop Footer */}
          <footer className="guest-footer">
            <p className="guest-footer-text flex items-center justify-center gap-1">
              <span>Created with</span>
              <svg className="w-3.5 h-3.5 text-rose-500 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>by</span>
              <strong className="guest-footer-brand">asm.invitation</strong>
            </p>
            <Link
              to="/"
              className="guest-footer-btn inline-flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Buat Undangan Digital Eksklusif Anda Sendiri</span>
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
