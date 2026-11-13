import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function RegisterPage() {
  const { daftar } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      await daftar(nama, email, password);
      navigate("/dashboard/katalog", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal");
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
            <p className="auth-subtitle">Buat Akun Klien Undangan Digital</p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
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
              {loading ? "Mendaftarkan Akun..." : "Daftar Akun Baru →"}
            </button>
          </form>

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
