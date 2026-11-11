import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import type { Invitation, Rsvp, Attendance } from "../lib/api";

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

  function handleSalinRekening(noRek: string, id: string) {
    navigator.clipboard.writeText(noRek);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2500);
  }

  async function handleSubmitRsvp(e: FormEvent) {
    e.preventDefault();
    if (!slug || !namaTamu.trim() || !pesanDoa.trim()) return;

    setSubmittingRsvp(true);
    setRsvpSuccess("");
    try {
      const res = await api.kirimRsvp(slug, {
        guest_name: namaTamu,
        attendance: kehadiran,
        pax,
        message: pesanDoa,
      });

      setRsvps((prev) => [res.rsvp, ...prev]);
      setRsvpSuccess(res.message);
      setPesanDoa("");
      setTimeout(() => setRsvpSuccess(""), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengirimkan ucapan");
    } finally {
      setSubmittingRsvp(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A151E]" />
          <p className="text-sm font-serif text-[#381118]">Mempersiapkan Undangan Eksklusif...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
          <span className="text-4xl">💌</span>
          <h2 className="text-xl font-serif font-bold text-gray-900">Undangan Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500">
            Tautan undangan ini mungkin belum aktif atau ada kesalahan penulisan alamat.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-[#4A151E] text-white rounded-xl text-xs font-bold"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // FR-D2: Expiration Gatekeeper
  const isExpired = new Date().getTime() > new Date(invitation.expires_at).getTime();
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 text-center space-y-4 shadow-sm">
          <span className="text-4xl">⏳</span>
          <h2 className="text-xl font-serif font-bold text-gray-900">
            Masa Aktif Undangan Telah Berakhir
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Acara pernikahan ini telah selesai diselenggarakan. Terima kasih yang tak terhingga atas
            kehadiran dan doa restu yang telah diberikan kepada kedua mempelai.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-[#4A151E] text-white rounded-xl text-xs font-bold"
            >
              Buat Undangan Digital Anda Sendiri
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const details = invitation.event_details || {};
  const pria = details.mempelai?.pria;
  const wanita = details.mempelai?.wanita;

  return (
    <div className="min-h-screen bg-stone-900 flex justify-center selection:bg-[#4A151E] selection:text-white">
      {/* Container Layar HP Mobile-First (max-w-md, 100dvh safe) */}
      <div className="w-full max-w-md bg-[#FAF7F2] min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col font-sans">
        {/* Audio Element */}
        {details.music_url && (
          <audio ref={audioRef} src={details.music_url} loop preload="auto" />
        )}

        {/* Floating Music Button */}
        {isOpen && details.music_url && (
          <button
            onClick={toggleMusic}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-base text-[#4A151E] hover:scale-105 transition cursor-pointer"
            title={isPlayingMusic ? "Heningkan Musik" : "Putar Musik"}
          >
            {isPlayingMusic ? "🎵" : "🔇"}
          </button>
        )}

        {/* ========================================================
            FR-D1: COVER SAMPUL TERKUNCI (100dvh)
        ======================================================== */}
        <div
          className={`fixed inset-0 z-50 max-w-md mx-auto bg-[#360F15] text-[#FFF9F2] flex flex-col justify-between items-center p-8 transition-transform duration-700 ease-in-out ${
            isOpen ? "-translate-y-full pointer-events-none" : "translate-y-0"
          }`}
        >
          {/* Ornamen Atas */}
          <div className="text-center space-y-2 pt-6">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-200/80 font-semibold">
              THE WEDDING OF
            </span>
            <div className="w-8 h-0.5 bg-amber-200/40 mx-auto" />
          </div>

          {/* Nama Mempelai di Sampul */}
          <div className="text-center space-y-4 my-auto">
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#FFF3E3]">
              {pria?.panggilan || "Dimas"} <br />
              <span className="font-serif italic font-light text-2xl text-amber-200">&</span> <br />
              {wanita?.panggilan || "Dinda"}
            </h1>
            <p className="text-xs text-amber-100/70 tracking-widest uppercase">
              {details.akad?.tanggal
                ? new Date(details.akad.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Spesial Hari Bahagia"}
            </p>
          </div>

          {/* Sapaan Tamu & Tombol Buka */}
          <div className="w-full space-y-4 pb-4 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
              <p className="text-[11px] text-amber-100/70">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
              <p className="text-base font-bold text-white tracking-wide">
                {guestParam || "Tamu Undangan"}
              </p>
              <p className="text-[9px] text-amber-200/60 italic">
                *Mohon maaf bila ada kesalahan penulisan nama/gelar
              </p>
            </div>

            <button
              onClick={handleBukaUndangan}
              className="w-full py-3.5 bg-gradient-to-r from-[#8C2738] to-[#5C1622] hover:from-[#A83246] hover:to-[#741B2B] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-amber-200/20"
            >
              <span>💌</span> Buka Undangan
            </button>
          </div>
        </div>

        {/* ========================================================
            KONTEN UTAMA UNDANGAN
        ======================================================== */}
        <main className="flex-1 space-y-12 pb-16">
          {/* Hero Section */}
          <section className="pt-16 pb-10 px-6 text-center space-y-4 bg-gradient-to-b from-[#F2E8DA] to-[#FAF7F2]">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6D3B] font-bold">
              WALIMATUL ‘URS
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-[#381118]">
              {pria?.panggilan || "Dimas"} & {wanita?.panggilan || "Dinda"}
            </h2>
            <p className="text-xs text-[#6E5D53] max-w-xs mx-auto leading-relaxed italic">
              &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu
              dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.&rdquo;
              <br />
              <span className="font-semibold not-italic block mt-1">(QS. Ar-Rum: 21)</span>
            </p>
          </section>

          {/* Profil Mempelai */}
          <section className="px-6 space-y-6 text-center">
            {/* Pria */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE3D5] shadow-xs space-y-2">
              <span className="text-3xl">🤵</span>
              <h3 className="font-serif text-xl font-bold text-[#3B171D]">
                {pria?.nama || "Dimas Pratama, S.Kom"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Putra tercinta dari: <br />
                <strong className="text-gray-700">{pria?.ayah || "Bpk. Hendra Gunawan"}</strong> &{" "}
                <strong className="text-gray-700">{pria?.ibu || "Ibu Siti Rahmawati"}</strong>
              </p>
            </div>

            <div className="font-serif italic text-2xl text-[#8C6D3B] font-light">&</div>

            {/* Wanita */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE3D5] shadow-xs space-y-2">
              <span className="text-3xl">👰</span>
              <h3 className="font-serif text-xl font-bold text-[#3B171D]">
                {wanita?.nama || "Adinda Putri Lestari, S.E"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Putri tercinta dari: <br />
                <strong className="text-gray-700">{wanita?.ayah || "Bpk. Bambang Sudiro"}</strong> &{" "}
                <strong className="text-gray-700">{wanita?.ibu || "Ibu Ratna Dewi"}</strong>
              </p>
            </div>
          </section>

          {/* Countdown Timer */}
          <section className="px-6">
            <div className="bg-[#4A151E] text-white p-6 rounded-3xl text-center space-y-4 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-200">
                Menghitung Hari Menuju Momen Bahagia
              </p>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-2xl font-bold font-serif">{timeLeft.days}</span>
                  <p className="text-[10px] text-amber-200/80">Hari</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-2xl font-bold font-serif">{timeLeft.hours}</span>
                  <p className="text-[10px] text-amber-200/80">Jam</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-2xl font-bold font-serif">{timeLeft.minutes}</span>
                  <p className="text-[10px] text-amber-200/80">Menit</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-2xl font-bold font-serif">{timeLeft.seconds}</span>
                  <p className="text-[10px] text-amber-200/80">Detik</p>
                </div>
              </div>
            </div>
          </section>

          {/* Rangkaian Acara (Akad & Resepsi) */}
          <section className="px-6 space-y-5">
            <h3 className="font-serif text-2xl font-bold text-center text-[#3B171D]">
              Rangkaian Acara
            </h3>

            {/* Akad */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE3D5] shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8C6D3B]">
                💍 AKAD NIKAH
              </span>
              <p className="font-serif text-lg font-bold text-gray-900">
                {details.akad?.tanggal
                  ? new Date(details.akad.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Sabtu, 20 Desember 2026"}
              </p>
              <p className="text-xs text-gray-600 font-semibold">{details.akad?.jam || "08:00 - 10:00 WIB"}</p>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p className="font-bold text-gray-800">{details.akad?.lokasi || "Masjid Agung Al-Barkah"}</p>
                <p>{details.akad?.alamat || "Jl. Veteran No. 46, Kota Bekasi"}</p>
              </div>
              {details.akad?.maps_url && (
                <a
                  href={details.akad.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block w-full py-2.5 text-center text-xs font-bold border border-[#D5C9B8] text-[#4A151E] rounded-xl hover:bg-[#FAF7F2] transition"
                >
                  📍 Petunjuk Arah Google Maps
                </a>
              )}
            </div>

            {/* Resepsi */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE3D5] shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8C6D3B]">
                🎉 RESEPSI PERNIKAHAN
              </span>
              <p className="font-serif text-lg font-bold text-gray-900">
                {details.resepsi?.tanggal
                  ? new Date(details.resepsi.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Sabtu, 20 Desember 2026"}
              </p>
              <p className="text-xs text-gray-600 font-semibold">
                {details.resepsi?.jam || "11:00 - 14:00 WIB"}
              </p>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p className="font-bold text-gray-800">
                  {details.resepsi?.lokasi || "Grand Ballroom Hotel Horison"}
                </p>
                <p>{details.resepsi?.alamat || "Jl. KH. Noer Ali, Pekayon Jaya, Kota Bekasi"}</p>
              </div>
              {details.resepsi?.maps_url && (
                <a
                  href={details.resepsi.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block w-full py-2.5 text-center text-xs font-bold border border-[#D5C9B8] text-[#4A151E] rounded-xl hover:bg-[#FAF7F2] transition"
                >
                  📍 Petunjuk Arah Google Maps
                </a>
              )}
            </div>
          </section>

          {/* Galeri Foto */}
          {details.photos && details.photos.length > 0 && (
            <section className="px-6 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D3B]">
                  MEMORIES
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B171D]">Galeri Kebahagiaan</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {details.photos.map((foto, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-xs"
                  >
                    <img src={foto} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Amplop Digital (Cashless) */}
          {details.amplop && details.amplop.length > 0 && (
            <section className="px-6 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D3B]">
                  TANDA KASIH
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B171D]">Amplop Digital</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Doa restu Anda merupakan kado terindah bagi kami. Namun jika berkenan memberikan tanda
                  kasih secara cashless, dapat melalui:
                </p>
              </div>

              <div className="space-y-3">
                {details.amplop.map((rek, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-3xl border border-[#EBE3D5] shadow-xs text-center space-y-2"
                  >
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-[#8C6D3B] border border-amber-200">
                      {rek.bank}
                    </span>
                    <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                      {rek.no_rek}
                    </p>
                    <p className="text-xs text-gray-500">a.n. {rek.atas_nama}</p>
                    <button
                      onClick={() => handleSalinRekening(rek.no_rek, `${rek.bank}-${idx}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2E8DA] border border-[#D5C9B8] rounded-xl text-xs font-bold text-[#4A151E] transition cursor-pointer"
                    >
                      {copiedBank === `${rek.bank}-${idx}` ? "✓ Berhasil Disalin!" : "📋 Salin No. Rekening"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Buku Tamu & RSVP Realtime (FR-D3) */}
          <section className="px-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D3B]">
                RSVP & WISHES
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3B171D]">Buku Tamu & Doa Restu</h3>
              <p className="text-xs text-gray-500">
                Konfirmasi kehadiran Anda dan berikan ucapan doa untuk kedua mempelai.
              </p>
            </div>

            {/* Form RSVP */}
            <form
              onSubmit={handleSubmitRsvp}
              className="bg-white p-6 rounded-3xl border border-[#EBE3D5] shadow-xs space-y-4 text-xs"
            >
              {rsvpSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-medium border border-emerald-200">
                  {rsvpSuccess}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={namaTamu}
                  onChange={(e) => setNamaTamu(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#4A151E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Konfirmasi Kehadiran</label>
                <select
                  value={kehadiran}
                  onChange={(e) => setKehadiran(e.target.value as Attendance)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#4A151E] bg-white"
                >
                  <option value="hadir">✅ Hadir</option>
                  <option value="ragu">🤔 Masih Ragu</option>
                  <option value="tidak_hadir">❌ Tidak Hadir</option>
                </select>
              </div>

              {kehadiran === "hadir" && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jumlah Orang (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={pax}
                    onChange={(e) => setPax(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#4A151E]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ucapan & Doa Restu</label>
                <textarea
                  rows={3}
                  required
                  value={pesanDoa}
                  onChange={(e) => setPesanDoa(e.target.value)}
                  placeholder="Tuliskan doa restu untuk kedua mempelai..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#4A151E]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRsvp}
                className="w-full py-3 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingRsvp ? "Mengirimkan Doa..." : "💌 Kirim Ucapan & RSVP"}
              </button>
            </form>

            {/* List Ucapan Doa Realtime */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Doa Restu Tamu ({rsvps.length})
              </h4>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {rsvps.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-gray-900">{r.guest_name}</strong>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          r.attendance === "hadir"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.attendance === "ragu"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.attendance === "hadir"
                          ? `Hadir (${r.pax} org)`
                          : r.attendance === "ragu"
                          ? "Ragu"
                          : "Tidak Hadir"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">&ldquo;{r.message}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================================
              FR-D4: VIRAL LOOP FOOTER
          ======================================================== */}
          <footer className="pt-8 px-6 text-center space-y-3 border-t border-[#EBE3D5]">
            <p className="text-[11px] text-gray-500">
              Created with 🤍 by <strong className="text-[#381118]">asm.invitation</strong>
            </p>
            <Link
              to="/"
              className="inline-block py-2 px-4 rounded-full bg-white border border-[#D5C9B8] text-[11px] font-bold text-[#4A151E] hover:bg-[#FAF7F2] transition shadow-xs"
            >
              ✨ Buat Undangan Digital Eksklusif Anda Sendiri
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
