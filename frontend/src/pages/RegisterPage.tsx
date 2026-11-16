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
            <div className="p-3 mb-4 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
              ✓ {successMsg}
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
                    className="auth-password-toggle"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
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
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
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
                  className="w-full text-center tracking-[8px] font-mono font-bold text-2xl py-3 border-2 border-[#4A151E]/40 focus:border-[#4A151E] rounded-xl outline-none bg-white text-gray-900"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="auth-btn-submit"
              >
                {loading ? "Memverifikasi..." : "Aktivasi Akun Saya ✓"}
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
                  className="text-[#4A151E] font-semibold hover:underline disabled:opacity-50 transition cursor-pointer"
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
