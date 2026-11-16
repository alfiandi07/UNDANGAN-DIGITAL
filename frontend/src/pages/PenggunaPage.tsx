import { useState, useEffect } from "react";
import * as api from "../lib/api";
import type { Pengguna } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function PenggunaPage() {
  const { user } = useAuth();
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

