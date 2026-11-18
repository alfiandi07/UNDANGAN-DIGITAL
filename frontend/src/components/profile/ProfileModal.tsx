import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../lib/api";
import "../../styles/ProfileModal.css";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, simpanUser } = useAuth();

  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sinkronkan nama setiap kali modal dibuka
  useEffect(() => {
    if (isOpen && user) {
      setNama(user.nama);
      setPassword("");
      setError("");
      setSuccessMsg("");
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  async function handleSimpan(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccessMsg("");

    if (!nama.trim()) {
      setError("Nama lengkap wajib diisi");
      return;
    }

    if (password && password.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await api.ubahPengguna(user.id, user.peran, {
        nama: nama.trim(),
        email: user.email,
        peran: user.peran,
        password: password.trim() || undefined,
      });

      // Perbarui sesi login secara instan
      simpanUser({
        ...user,
        nama: res.data.nama,
      });

      setSuccessMsg("Profil berhasil diperbarui!");
      setPassword("");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-container">
        <h3 className="profile-modal-title">👤 Pengaturan Profil Akun</h3>
        <p className="profile-modal-subtitle">
          Kelola informasi nama dan kata sandi akun Anda.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 mb-4">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 mb-4">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSimpan} className="space-y-4 text-xs">
          <div className="profile-field-group">
            <label className="profile-field-label">Nama Lengkap</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="profile-field-input"
              placeholder="Nama lengkap Anda"
            />
          </div>

          <div className="profile-field-group">
            <label className="profile-field-label">Alamat Email</label>
            <input
              type="email"
              readOnly
              value={user.email}
              className="profile-field-input-readonly"
            />
            <p className="profile-field-hint">
              * Alamat email tidak dapat diubah karena terhubung dengan data pesanan Anda.
            </p>
          </div>

          <div className="profile-field-group">
            <label className="profile-field-label">Password Baru (Opsional)</label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="profile-field-input"
            />
            <p className="profile-field-hint">
              Isi minimal 6 karakter hanya jika Anda ingin mengganti password akun ini.
            </p>
          </div>

          <div className="profile-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="profile-btn-cancel"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="profile-btn-submit"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
