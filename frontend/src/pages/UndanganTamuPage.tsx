import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Invitation, Rsvp, Attendance } from "../lib/api";
import "../styles/UndanganTamu.css";

export default function UndanganTamuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const guestParam = searchParams.get("to") || "";

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
      try {
        const invData = await api.ambilDetailUndangan(slug);
        setInvitation(invData);

        const rsvpData = await api.ambilDaftarRsvps(slug);
        setRsvps(rsvpData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat undangan");
      } finally {
        setLoading(false);
      }
    }

    muatData();
  }, [slug]);

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
      <div className="guest-view-wrapper" style={{ alignItems: "center" }}>
        <div style={{ textAlign: "center", color: "#e5e7eb" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>Mempersiapkan Undangan Digital...</p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found / Expired
  if (error || !invitation) {
    return (
      <div className="guest-view-wrapper" style={{ alignItems: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", color: "#ffffff", maxWidth: "24rem" }}>
          <span style={{ fontSize: "3rem" }}>⚠️</span>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", margin: "1rem 0 0.5rem 0" }}>
            Undangan Tidak Tersedia
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
            {error || "Tautan undangan tidak ditemukan atau masa aktifnya telah berakhir."}
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "0.65rem 1.25rem",
              backgroundColor: "#ffffff",
              color: "#1c1917",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 3. Status Gatekeeper: Expired / Draft
  if (invitation.status === "expired" || invitation.status === "cleaned") {
    return (
      <div className="guest-view-wrapper" style={{ alignItems: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", color: "#ffffff", maxWidth: "24rem" }}>
          <span style={{ fontSize: "3rem" }}>⏳</span>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", margin: "1rem 0 0.5rem 0" }}>
            Masa Aktif Undangan Berakhir
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
            Undangan ini telah melampaui masa aktif paket yang dipilih. Terima kasih atas pengertiannya.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "0.65rem 1.25rem",
              backgroundColor: "#ffffff",
              color: "#1c1917",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            Buat Undangan Baru
          </Link>
        </div>
      </div>
    );
  }

  const details = invitation.event_details || {};
  const pria = details.mempelai?.pria;
  const wanita = details.mempelai?.wanita;

  return (
    <div className="guest-view-wrapper">
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
            {isPlayingMusic ? "🎵" : "🔇"}
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
              <span className="guest-cover__ampersand">&</span> <br />
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
              className="guest-cover__open-btn"
            >
              💌 Buka Undangan
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
              <strong style={{ display: "block", marginTop: "0.25rem", fontStyle: "normal" }}>
                (QS. Ar-Rum: 21)
              </strong>
            </p>
          </section>

          {/* Profil Mempelai */}
          <section className="guest-couple-section">
            {/* Pria */}
            <div className="guest-couple-card">
              <span style={{ fontSize: "2rem" }}>🤵</span>
              <h3 className="guest-couple-name">{pria?.nama || "Dimas Pratama, S.Kom"}</h3>
              <p className="guest-couple-parents">
                Putra tercinta dari: <br />
                <strong>{pria?.ayah || "Bpk. Hendra Gunawan"}</strong> &{" "}
                <strong>{pria?.ibu || "Ibu Siti Rahmawati"}</strong>
              </p>
            </div>

            <div style={{ textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.5rem", color: "#8c6d3b" }}>
              &
            </div>

            {/* Wanita */}
            <div className="guest-couple-card">
              <span style={{ fontSize: "2rem" }}>👰</span>
              <h3 className="guest-couple-name">{wanita?.nama || "Adinda Putri Lestari, S.E"}</h3>
              <p className="guest-couple-parents">
                Putri tercinta dari: <br />
                <strong>{wanita?.ayah || "Bpk. Bambang Sudiro"}</strong> &{" "}
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
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 800, textAlign: "center", color: "#381118", margin: 0 }}>
              Rangkaian Acara
            </h3>

            {/* Akad */}
            <div className="guest-event-card">
              <span className="guest-event-badge">💍 AKAD NIKAH</span>
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
                  className="guest-maps-btn"
                >
                  📍 Petunjuk Arah Google Maps
                </a>
              )}
            </div>

            {/* Resepsi */}
            <div className="guest-event-card">
              <span className="guest-event-badge">🎉 RESEPSI PERNIKAHAN</span>
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
                  className="guest-maps-btn"
                >
                  📍 Petunjuk Arah Google Maps
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
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#8c6d3b", textTransform: "uppercase" }}>
                      {rek.bank}
                    </span>
                    <p style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 800, margin: "0.25rem 0", color: "#111827" }}>
                      {rek.no_rek}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                      a.n. {rek.atas_nama}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSalinRekening(rek.no_rek, `${rek.bank}-${idx}`)}
                    className="guest-copy-btn"
                  >
                    {copiedBank === `${rek.bank}-${idx}` ? "✓ Disalin!" : "📋 Salin"}
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* Buku Tamu & RSVP Realtime (FR-D3) */}
          <section className="guest-rsvp-section">
            <div className="guest-section-header">
              <span className="guest-section-header__tag">RSVP & WISHES</span>
              <h3 className="guest-section-header__title">Buku Tamu & Doa Restu</h3>
            </div>

            <form onSubmit={handleSubmitRsvp} className="guest-rsvp-card">
              {rsvpSuccess && (
                <div style={{ backgroundColor: "#ecfdf5", color: "#065f46", padding: "0.65rem", borderRadius: "0.75rem", fontSize: "0.75rem", marginBottom: "0.75rem", fontWeight: 600 }}>
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
                  <option value="hadir">✅ Hadir</option>
                  <option value="ragu">🤔 Masih Ragu</option>
                  <option value="tidak_hadir">❌ Tidak Hadir</option>
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
                <label className="guest-rsvp-label">Ucapan & Doa Restu</label>
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
                className="guest-rsvp-submit-btn"
              >
                {submittingRsvp ? "Mengirimkan Doa..." : "💌 Kirim Ucapan & RSVP"}
              </button>
            </form>

            {/* List Ucapan Doa Realtime */}
            <div className="guest-guestbook-list">
              <h4 style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#4b5563", letterSpacing: "0.05em", margin: "0 0 0.5rem 0" }}>
                Doa Restu Tamu ({rsvps.length})
              </h4>
              {rsvps.map((r) => (
                <div key={r.id} className="guest-guestbook-item">
                  <div className="guest-guestbook-header">
                    <strong className="guest-guestbook-name">{r.guest_name}</strong>
                    <span
                      className="guest-guestbook-status"
                      style={{
                        backgroundColor:
                          r.attendance === "hadir" ? "#d1fae5" : r.attendance === "ragu" ? "#fef3c7" : "#f3f4f6",
                        color:
                          r.attendance === "hadir" ? "#065f46" : r.attendance === "ragu" ? "#92400e" : "#4b5563",
                      }}
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
            <p style={{ margin: "0 0 0.5rem 0" }}>
              Created with 🤍 by <strong style={{ color: "#381118" }}>asm.invitation</strong>
            </p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                padding: "0.45rem 1rem",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                border: "1px solid #d5c9b8",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#4a151e",
                textDecoration: "none",
              }}
            >
              ✨ Buat Undangan Digital Eksklusif Anda Sendiri
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
