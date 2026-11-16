import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Jika sudah login, langsung arahkan ke dashboard
  useEffect(() => {
    if (user) {
      if (user.peran === "admin") {
        navigate("/dashboard/produk", { replace: true });
      } else {
        navigate("/dashboard/katalog", { replace: true });
      }
    }
  }, [user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const pengguna = await login(email, password);
      if (pengguna.peran === "admin") {
        navigate("/dashboard/produk", { replace: true });
      } else {
        navigate("/dashboard/katalog", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">asm.invitation</h1>
            <p className="auth-subtitle">Masuk ke Dashboard Undangan Anda</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              {error}
              {error.toLowerCase().includes("verifikasi") && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <Link to="/daftar" className="text-xs font-bold text-[#4A151E] underline">
                    Buka halaman aktivasi OTP →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field-group">
              <label className="auth-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="nama@contoh.com"
              />
            </div>

            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Masukkan password Anda"
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
              {loading ? "Memproses Masuk..." : "Masuk ke Dashboard →"}
            </button>
          </form>

          <div className="auth-footer">
            Belum punya akun?
            <Link to="/register" className="auth-link">
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
