import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mintaResetPassword, resetPassword } from "../lib/api";
import "../styles/Auth.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard Step: 1 = Input Email, 2 = Input OTP & Password Baru, 3 = Berhasil
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // Step 1: Kirim Kode OTP ke Email
  async function handleMintaOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await mintaResetPassword(email);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal meminta reset password");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verifikasi OTP & Update Password
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Kode OTP harus terdiri dari 6 digit angka");
      return;
    }

    if (passwordBaru.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setError("Konfirmasi password tidak cocok dengan password baru");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp.trim(), passwordBaru);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengatur ulang password");
    } finally {
      setLoading(false);
    }
  }

  // Kirim Ulang OTP jika belum menerima email
  async function handleKirimUlangOtp() {
    setError("");
    setResendStatus("");
    setResendLoading(true);

    try {
      await mintaResetPassword(email);
      setResendStatus("Kode OTP baru telah berhasil dikirim ke email Anda.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulang kode OTP");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">asm.invitation</h1>
            <p className="auth-subtitle">
              {step === 1 && "Lupa Kata Sandi Akun Anda?"}
              {step === 2 && "Verifikasi Kode OTP & Password Baru"}
              {step === 3 && "Kata Sandi Berhasil Diperbarui"}
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {resendStatus && <div className="auth-success-banner">{resendStatus}</div>}

          {/* STEP 1: Masukkan Email */}
          {step === 1 && (
            <form onSubmit={handleMintaOtp} className="auth-form">
              <p className="text-xs text-gray-500 leading-relaxed mb-1">
                Masukkan alamat email yang terdaftar pada akun Anda. Kami akan mengirimkan 6 digit kode OTP verifikasi untuk mengatur ulang kata sandi.
              </p>

              <div className="auth-field-group">
                <label className="auth-label">Alamat Email Terdaftar</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="nama@email.com"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn-submit"
              >
                {loading ? "Mengirim Kode OTP..." : "Kirim Kode Verifikasi →"}
              </button>
            </form>
          )}

          {/* STEP 2: Masukkan Kode OTP & Password Baru */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                Kode 6-digit OTP telah dikirim ke: <br />
                <strong className="text-amber-950 font-semibold">{email}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setResendStatus("");
                  }}
                  className="block mt-1.5 text-xs text-[#4A151E] font-bold underline cursor-pointer"
                >
                  Ganti alamat email
                </button>
              </div>

              <div className="auth-field-group">
                <div className="auth-label-row">
                  <label className="auth-label">Kode Verifikasi OTP (6 Digit)</label>
                  <button
                    type="button"
                    onClick={handleKirimUlangOtp}
                    disabled={resendLoading}
                    className="text-xs text-[#4A151E] font-semibold hover:underline cursor-pointer"
                  >
                    {resendLoading ? "Mengirim..." : "Kirim ulang OTP"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="auth-input auth-otp-input"
                  placeholder="••••••"
                  autoFocus
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Password Baru (min. 6 karakter)</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordBaru}
                    onChange={(e) => setPasswordBaru(e.target.value)}
                    className="auth-input"
                    placeholder="Masukkan password baru Anda"
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

              <div className="auth-field-group">
                <label className="auth-label">Konfirmasi Password Baru</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    className="auth-input"
                    placeholder="Ulangi password baru Anda"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn-submit"
              >
                {loading ? "Menyimpan Password Baru..." : "Perbarui Kata Sandi →"}
              </button>
            </form>
          )}

          {/* STEP 3: Sukses */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Kata Sandi Berhasil Diubah!
              </h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Kata sandi baru akun Anda telah aktif. Silakan masuk kembali ke dashboard menggunakan kredensial baru.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="auth-btn-submit"
              >
                Masuk ke Akun Sekarang →
              </button>
            </div>
          )}

          {/* Footer Back to Login */}
          {step !== 3 && (
            <div className="auth-footer">
              Sudah ingat kata sandi Anda?
              <Link to="/login" className="auth-link">
                Kembali ke Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

