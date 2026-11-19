import { useState, useEffect, type FormEvent } from "react";
import * as api from "../lib/api";
import type { Pengguna } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function PenggunaPage() {
  const { user } = useAuth();
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State Modal Edit Pengguna
  const [editItem, setEditItem] = useState<Pengguna | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPeran, setEditPeran] = useState<"admin" | "user">("user");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  async function muatPengguna() {
    if (user?.peran !== "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.ambilSemuaPengguna();
      setPenggunaList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatPengguna();
  }, [user]);

  function handleBukaEdit(item: Pengguna) {
    setEditItem(item);
    setEditNama(item.nama);
    setEditEmail(item.email);
    setEditPeran(item.peran);
    setEditPassword("");
    setModalError("");
  }

  async function handleSimpanEdit(e: FormEvent) {
    e.preventDefault();
    if (!editItem) return;

    if (!editNama.trim() || !editEmail.trim()) {
      setModalError("Nama dan email wajib diisi");
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setModalError("Password baru minimal 6 karakter");
      return;
    }

    setSaving(true);
    setModalError("");
    try {
      await api.ubahPengguna(editItem.id, editItem.peran, {
        nama: editNama.trim(),
        email: editEmail.trim(),
        peran: editPeran,
        password: editPassword.trim() || undefined,
      });
      setEditItem(null);
      await muatPengguna();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Gagal memperbarui data pengguna");
    } finally {
      setSaving(false);
    }
  }

  async function handleHapusPengguna(item: Pengguna) {
    if (user?.email.toLowerCase() === item.email.toLowerCase()) {
      alert("Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.");
      return;
    }

    const konfirmasi = confirm(
      `Yakin ingin menghapus akun "${item.nama}" (${item.email})?\n\nTindakan ini permanen dan akan menghapus semua data pesanan/undangan terkait.`
    );
    if (!konfirmasi) return;

    setDeletingId(item.id);
    try {
      await api.hapusPengguna(item.id, item.peran);
      await muatPengguna();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pengguna");
    } finally {
      setDeletingId(null);
    }
  }

  if (user?.peran !== "admin") {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl max-w-md mx-auto my-12 text-center space-y-2">
        <h3 className="font-bold text-base font-serif">Akses Ditolak</h3>
        <p className="text-xs text-rose-600">Halaman ini hanya dapat diakses oleh akun dengan peran Administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#DCD7CA]">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight">
          Daftar Pengguna
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Daftar semua akun pengguna dan administrator yang terdaftar di sistem Undangan Digital.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#DCD7CA] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3E2F] mb-3" />
            <p className="text-xs">Memuat data pengguna...</p>
          </div>
        ) : penggunaList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-700">Belum ada pengguna terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#EAE6DC] text-[11px] font-bold uppercase tracking-wider text-[#556050] border-b border-[#DCD7CA]">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Nama</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Peran &amp; Status</th>
                  <th className="px-6 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD7CA]/60">
                {penggunaList.map((item) => (
                  <tr key={`${item.peran}-${item.id}`} className="hover:bg-[#F7F5EE] transition-colors">
                    <td className="px-6 py-4.5 font-mono text-slate-400 text-xs">#{item.id}</td>
                    <td className="px-6 py-4.5 font-semibold text-slate-900 text-sm">{item.nama}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-mono text-xs">{item.email}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.peran === "admin"
                              ? "bg-[#F5EFE3] text-[#82622B] border border-[#DFD2BA]"
                              : "bg-[#EAF1E9] text-[#3A5438] border border-[#C7D7C5]"
                          }`}
                        >
                          {item.peran}
                        </span>
                        {item.peran !== "admin" && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              item.is_verified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : "bg-amber-50 text-amber-700 border border-amber-200/80"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${item.is_verified ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {item.is_verified ? "Terverifikasi" : "Belum Verif"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBukaEdit(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-[#F7F5EE] border border-[#DCD7CA] rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Ubah data pengguna"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        {user?.email.toLowerCase() === item.email.toLowerCase() ? (
                          <span className="text-[11px] text-slate-400 italic font-medium px-2 py-1">
                            (Akun Anda)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleHapusPengguna(item)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus akun pengguna ini"
                          >
                            <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>{deletingId === item.id ? "Menghapus..." : "Hapus"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Data Pengguna */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#DCD7CA]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Edit Data Pengguna
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ubah informasi akun #{editItem.id} ({editItem.peran}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200 mb-4 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSimpanEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#DCD7CA] rounded-xl focus:ring-2 focus:ring-[#2D3E2F]/15 focus:border-[#2D3E2F] outline-none text-xs text-slate-900 bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#DCD7CA] rounded-xl focus:ring-2 focus:ring-[#2D3E2F]/15 focus:border-[#2D3E2F] outline-none text-xs font-mono text-slate-900 bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Peran Akun</label>
                <select
                  value={editPeran}
                  onChange={(e) => setEditPeran(e.target.value as "admin" | "user")}
                  disabled={user?.email.toLowerCase() === editItem.email.toLowerCase()}
                  className="w-full px-3.5 py-2.5 border border-[#DCD7CA] rounded-xl focus:ring-2 focus:ring-[#2D3E2F]/15 focus:border-[#2D3E2F] outline-none text-xs bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer"
                >
                  <option value="user">Klien Pembeli (User)</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
                {user?.email.toLowerCase() === editItem.email.toLowerCase() && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Anda tidak dapat mengubah peran akun Anda sendiri saat sedang login.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Password Baru (Opsional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full px-3.5 py-2.5 border border-[#DCD7CA] rounded-xl focus:ring-2 focus:ring-[#2D3E2F]/15 focus:border-[#2D3E2F] outline-none text-xs text-slate-900 bg-white transition-all placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Isi hanya jika ingin mereset password akun pengguna ini.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2D3E2F] hover:bg-[#1E2B20] rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
