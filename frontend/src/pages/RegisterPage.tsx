import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import "../styles/Auth.css";

export default function RegisterPage() {
  const { simpanUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"register" | "otp">("register");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await api.daftar(nama, email, password);
      if (res.needs_verification) {
        setStep("otp");
        setSuccessMsg(res.message || "Kode OTP 6 digit telah dikirim ke email Anda!");
      } else {
        simpanUser(res);
        navigate("/dashboard/katalog", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!otp || otp.trim().length !== 6) {
      setError("Masukkan 6 digit kode OTP yang terkirim ke email Anda");
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifikasiOtp(email, otp.trim());
      if (res.user) {
        simpanUser(res.user);
      }
      navigate("/dashboard/katalog", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verifikasi kode OTP gagal");
    } finally {
      setLoading(false);
    }
  }

  async function handleKirimUlang() {
    setError("");
    setSuccessMsg("");
    setResending(true);
    try {
      const res = await api.kirimUlangOtp(email);
      setSuccessMsg(res.message || "Kode OTP baru telah dikirim!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulang OTP");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">asm.invitation</h1>
            <p className="auth-subtitle">
              {step === "register" ? "Buat Akun Klien Undangan Digital" : "Verifikasi Email Akun Anda"}
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {successMsg && (
            <div className="p-3 mb-4 text-xs bg-[#EAF1E9] text-[#3A5438] border border-[#C7D7C5] rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-[#3A5438]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {step === "register" ? (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="auth-input"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Alamat Email Asli</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="nama@gmail.com"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  * Wajib email aktif untuk verifikasi akun (email sementara/palsu otomatis ditolak).
                </p>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Password</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn-submit"
              >
                {loading ? "Memvalidasi Email..." : "Daftar Akun Baru →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form space-y-4">
              <div className="p-3 bg-[#FAF8F3] border border-[#DCD7CA] rounded-xl text-xs text-[#556050] leading-relaxed">
                Kami telah mengirimkan 6 digit kode OTP ke email:
                <div className="font-bold font-mono text-sm mt-0.5 text-gray-900">{email}</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Silakan periksa folder <strong>Kotak Masuk</strong> atau <strong>Spam</strong> email Anda.
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label text-center">Masukkan 6 Digit Kode OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[8px] font-mono font-bold text-2xl py-3 border-2 border-[#2D3E2F]/40 focus:border-[#2D3E2F] rounded-xl outline-none bg-white text-gray-900"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="auth-btn-submit"
              >
                {loading ? "Memverifikasi..." : "Aktivasi Akun Saya"}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
                >
                  ← Ganti Email
                </button>
                <button
                  type="button"
                  onClick={handleKirimUlang}
                  disabled={resending}
                  className="text-[#2D3E2F] font-semibold hover:underline disabled:opacity-50 transition cursor-pointer"
                >
                  {resending ? "Mengirim..." : "Kirim Ulang Kode"}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            Sudah punya akun?
            <Link to="/login" className="auth-link">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
