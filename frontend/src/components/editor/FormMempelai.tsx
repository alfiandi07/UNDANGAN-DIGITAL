import type { Dispatch, SetStateAction } from "react";
import type { EventDetails } from "../../lib/api";

interface FormMempelaiProps {
  eventDetails: EventDetails;
  setEventDetails: Dispatch<SetStateAction<EventDetails>>;
}

export default function FormMempelai({ eventDetails, setEventDetails }: FormMempelaiProps) {
  const pria = eventDetails.mempelai?.pria;
  const wanita = eventDetails.mempelai?.wanita;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
        Data Mempelai Pria & Wanita
      </h3>

      {/* Mempelai Pria */}
      <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5] space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A151E]">
          🤵 Mempelai Pria
        </h4>

        {/* Foto Profil Pria */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-[#D4A373] flex items-center justify-center shrink-0">
            {pria?.foto ? (
              <img src={pria.foto} alt="Pria" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🤵</span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-gray-800">Foto Profil Mempelai Pria</p>
            <p className="text-[11px] text-gray-500">
              {pria?.foto
                ? "Foto profil aktif. Anda bisa mengganti foto dari tab Galeri atau masukkan URL baru."
                : "Belum ada foto profil. Anda bisa memilih dari tab Galeri atau masukkan tautan foto di bawah."}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={pria?.foto ?? ""}
                onChange={(e) =>
                  setEventDetails((p) => ({
                    ...p,
                    mempelai: {
                      ...p.mempelai,
                      pria: { ...p.mempelai?.pria, foto: e.target.value },
                    },
                  }))
                }
                placeholder="https://... URL foto profil atau atur di tab Galeri"
                className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#4A151E]"
              />
              {pria?.foto && (
                <button
                  type="button"
                  onClick={() =>
                    setEventDetails((p) => ({
                      ...p,
                      mempelai: {
                        ...p.mempelai,
                        pria: { ...p.mempelai?.pria, foto: "" },
                      },
                    }))
                  }
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                  title="Hapus foto profil"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Lengkap Mempelai Pria
            </label>
            <input
              type="text"
              value={pria?.nama ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    pria: { ...p.mempelai?.pria, nama: e.target.value },
                  },
                }))
              }
              placeholder="Contoh: Dimas Pratama, S.Kom"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Panggilan
            </label>
            <input
              type="text"
              value={pria?.panggilan ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    pria: { ...p.mempelai?.pria, panggilan: e.target.value },
                  },
                }))
              }
              placeholder="Dimas"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Ayah Kandung
            </label>
            <input
              type="text"
              value={pria?.ayah ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    pria: { ...p.mempelai?.pria, ayah: e.target.value },
                  },
                }))
              }
              placeholder="Bpk. Hendra Gunawan"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Ibu Kandung
            </label>
            <input
              type="text"
              value={pria?.ibu ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    pria: { ...p.mempelai?.pria, ibu: e.target.value },
                  },
                }))
              }
              placeholder="Ibu Siti Rahmawati"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
        </div>
      </div>

      {/* Mempelai Wanita */}
      <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5] space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A151E]">
          👰 Mempelai Wanita
        </h4>

        {/* Foto Profil Wanita */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-[#D4A373] flex items-center justify-center shrink-0">
            {wanita?.foto ? (
              <img src={wanita.foto} alt="Wanita" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👰</span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-gray-800">Foto Profil Mempelai Wanita</p>
            <p className="text-[11px] text-gray-500">
              {wanita?.foto
                ? "Foto profil aktif. Anda bisa mengganti foto dari tab Galeri atau masukkan URL baru."
                : "Belum ada foto profil. Anda bisa memilih dari tab Galeri atau masukkan tautan foto di bawah."}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={wanita?.foto ?? ""}
                onChange={(e) =>
                  setEventDetails((p) => ({
                    ...p,
                    mempelai: {
                      ...p.mempelai,
                      wanita: { ...p.mempelai?.wanita, foto: e.target.value },
                    },
                  }))
                }
                placeholder="https://... URL foto profil atau atur di tab Galeri"
                className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#4A151E]"
              />
              {wanita?.foto && (
                <button
                  type="button"
                  onClick={() =>
                    setEventDetails((p) => ({
                      ...p,
                      mempelai: {
                        ...p.mempelai,
                        wanita: { ...p.mempelai?.wanita, foto: "" },
                      },
                    }))
                  }
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                  title="Hapus foto profil"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Lengkap Mempelai Wanita
            </label>
            <input
              type="text"
              value={wanita?.nama ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    wanita: { ...p.mempelai?.wanita, nama: e.target.value },
                  },
                }))
              }
              placeholder="Contoh: Adinda Putri Lestari, S.E"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Panggilan
            </label>
            <input
              type="text"
              value={wanita?.panggilan ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    wanita: { ...p.mempelai?.wanita, panggilan: e.target.value },
                  },
                }))
              }
              placeholder="Dinda"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Ayah Kandung
            </label>
            <input
              type="text"
              value={wanita?.ayah ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    wanita: { ...p.mempelai?.wanita, ayah: e.target.value },
                  },
                }))
              }
              placeholder="Bpk. Bambang Sudiro"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Ibu Kandung
            </label>
            <input
              type="text"
              value={wanita?.ibu ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  mempelai: {
                    ...p.mempelai,
                    wanita: { ...p.mempelai?.wanita, ibu: e.target.value },
                  },
                }))
              }
              placeholder="Ibu Ratna Dewi"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
