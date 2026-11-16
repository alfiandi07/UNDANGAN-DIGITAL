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
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-1">Akses Ditolak</h3>
        <p className="text-sm">Halaman ini hanya dapat diakses oleh akun dengan peran Administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h2>
        <p className="text-sm text-gray-500">
          Daftar semua pengguna yang terdaftar di sistem Undangan Digital
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
            <p>Memuat data pengguna...</p>
          </div>
        ) : penggunaList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>Belum ada pengguna terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Peran & Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {penggunaList.map((item) => (
                  <tr key={`${item.peran}-${item.id}`} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono text-gray-500">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{item.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                            item.peran === "admin"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.peran}
                        </span>
                        {item.peran !== "admin" && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.is_verified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.is_verified ? "✓ Terverifikasi" : "Belum Verif"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBukaEdit(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                          title="Ubah data pengguna"
                        >
                          ✏️ Edit
                        </button>
                        {user?.email.toLowerCase() === item.email.toLowerCase() ? (
                          <span className="text-xs text-gray-400 italic font-medium">
                            (Akun Anda)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleHapusPengguna(item)}
                            disabled={deletingId === item.id}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Hapus akun pengguna ini"
                          >
                            {deletingId === item.id ? "Menghapus..." : "🗑️ Hapus"}
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

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
              Edit Data Pengguna
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Ubah informasi akun pengguna #{editItem.id} ({editItem.peran}).
            </p>

            {modalError && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSimpanEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Peran Akun</label>
                <select
                  value={editPeran}
                  onChange={(e) => setEditPeran(e.target.value as "admin" | "user")}
                  disabled={user?.email.toLowerCase() === editItem.email.toLowerCase()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="user">👤 Klien Pembeli (User)</option>
                  <option value="admin">👑 Administrator</option>
                </select>
                {user?.email.toLowerCase() === editItem.email.toLowerCase() && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Anda tidak dapat mengubah peran akun Anda sendiri saat sedang login.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password Baru (Opsional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A151E] outline-none text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Isi hanya jika ingin mereset password akun pengguna ini.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#4A151E] hover:bg-[#381118] rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
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

