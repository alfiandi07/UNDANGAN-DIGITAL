import type { Dispatch, SetStateAction, RefObject, ChangeEvent } from "react";
import type { EventDetails, Invitation } from "../../lib/api";

interface FormGaleriProps {
  eventDetails: EventDetails;
  setEventDetails: Dispatch<SetStateAction<EventDetails>>;
  invitation: Invitation | null;
  maxPhotosCount: number;
  currentPhotosCount: number;
  isQuotaFull: boolean;
  uploadingPhoto: boolean;
  uploadProgressMsg: string;
  newPhotoUrl: string;
  setNewPhotoUrl: (val: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileSelected: (e: ChangeEvent<HTMLInputElement>) => void;
  handleTambahFoto: () => void;
  handleHapusFoto: (idx: number, photoUrl: string) => void;
}

export default function FormGaleri({
  eventDetails,
  setEventDetails,
  invitation,
  maxPhotosCount,
  currentPhotosCount,
  isQuotaFull,
  uploadingPhoto,
  uploadProgressMsg,
  newPhotoUrl,
  setNewPhotoUrl,
  fileInputRef,
  handleFileSelected,
  handleTambahFoto,
  handleHapusFoto,
}: FormGaleriProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">Galeri Foto & Musik Latar</h3>
          <p className="text-xs text-gray-500">
            Paket <strong>{invitation?.package_type.toUpperCase()}</strong>: Kuota maksimal{" "}
            <strong>{maxPhotosCount} foto</strong>.
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isQuotaFull ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {currentPhotosCount} / {maxPhotosCount} Foto Terpakai
          </span>
        </div>
      </div>

      {/* Input Tambah Foto atau Pemberitahuan Paket Standar */}
      {maxPhotosCount === 0 ? (
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
          <span className="text-3xl">📷</span>
          <h4 className="font-bold text-amber-900 text-sm">Paket Standar Tanpa Galeri Foto</h4>
          <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
            Undangan Anda terdaftar pada <strong>Paket Standar</strong> dengan layout elegan tanpa galeri foto. Jika ingin menambahkan galeri hingga 20 foto berkualitas tinggi, silakan upgrade ke <strong>Paket Premium</strong>.
          </p>
        </div>
      ) : (
        <>
          {/* Uploader Langsung ke Cloudinary */}
          <div className="p-5 bg-sky-50/60 rounded-2xl border-2 border-dashed border-sky-300 space-y-3 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept="image/*"
              disabled={isQuotaFull || uploadingPhoto}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">☁️</span>
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                  Unggah Foto Galeri ke Cloudinary
                </h4>
                <p className="text-xs text-gray-500">
                  Otomatis dikompresi ke format <strong>.WebP</strong> super ringan & tajam (Maks. 8 MB).
                </p>
              </div>

              {uploadingPhoto ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 rounded-xl text-xs font-bold animate-pulse">
                  <span>⏳</span> {uploadProgressMsg || "Sedang mengunggah ke Cloudinary..."}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isQuotaFull}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  <span>📁</span>
                  {isQuotaFull ? "Kuota 20 Foto Penuh" : "Pilih Foto dari Galeri HP / PC"}
                </button>
              )}
            </div>

            {/* Input Alternatif URL Teks Manual */}
            <div className="pt-3 border-t border-sky-200/60 flex items-center gap-2 text-left">
              <span className="text-[11px] text-gray-500 whitespace-nowrap">Atau URL luar:</span>
              <input
                type="url"
                disabled={isQuotaFull || uploadingPhoto}
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://... URL foto luar"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#4A151E]"
              />
              <button
                type="button"
                disabled={isQuotaFull || !newPhotoUrl.trim() || uploadingPhoto}
                onClick={handleTambahFoto}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Grid Pratinjau Foto */}
          {eventDetails.photos && eventDetails.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {eventDetails.photos.map((foto, idx) => {
                const isPria = eventDetails.mempelai?.pria?.foto === foto;
                const isWanita = eventDetails.mempelai?.wanita?.foto === foto;
                return (
                  <div
                    key={idx}
                    className={`relative group aspect-square rounded-xl overflow-hidden border bg-gray-100 shadow-xs transition ${
                      isPria
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : isWanita
                        ? "border-pink-500 ring-2 ring-pink-300"
                        : "border-gray-200"
                    }`}
                  >
                    <img src={foto} alt="" className="w-full h-full object-cover" />

                    {/* Badge Status Foto Profil */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
                      {isPria && (
                        <span className="bg-blue-600/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          🤵 Profil Pria
                        </span>
                      )}
                      {isWanita && (
                        <span className="bg-pink-600/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          👰 Profil Wanita
                        </span>
                      )}
                    </div>

                    {/* Tombol Aksi Foto Profil (Hover / Aktif) */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        title={isPria ? "Lepas dari foto profil pria" : "Jadikan foto profil pria"}
                        onClick={() =>
                          setEventDetails((p) => ({
                            ...p,
                            mempelai: {
                              ...p.mempelai,
                              pria: { ...p.mempelai?.pria, foto: isPria ? "" : foto },
                            },
                          }))
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                          isPria
                            ? "bg-blue-500 text-white"
                            : "bg-white/90 hover:bg-white text-gray-800"
                        }`}
                      >
                        🤵 {isPria ? "Lepas" : "Pria"}
                      </button>

                      <button
                        type="button"
                        title={isWanita ? "Lepas dari foto profil wanita" : "Jadikan foto profil wanita"}
                        onClick={() =>
                          setEventDetails((p) => ({
                            ...p,
                            mempelai: {
                              ...p.mempelai,
                              wanita: { ...p.mempelai?.wanita, foto: isWanita ? "" : foto },
                            },
                          }))
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                          isWanita
                            ? "bg-pink-500 text-white"
                            : "bg-white/90 hover:bg-white text-gray-800"
                        }`}
                      >
                        👰 {isWanita ? "Lepas" : "Wanita"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHapusFoto(idx, foto)}
                      className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                      title="Hapus foto ini dari Cloudinary"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono group-hover:opacity-0 transition">
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 border border-dashed rounded-2xl">
              <p className="text-sm">Belum ada foto yang ditambahkan ke galeri.</p>
            </div>
          )}
        </>
      )}

      {/* Musik Latar */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <label className="block text-xs font-bold text-gray-700">
          Tautan Musik Latar / Background Audio (MP3 / Audio URL)
        </label>
        <input
          type="url"
          value={eventDetails.music_url ?? ""}
          onChange={(e) => setEventDetails((p) => ({ ...p, music_url: e.target.value }))}
          placeholder="https://... lagu-pernikahan.mp3"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
        />
        <p className="text-[11px] text-gray-400">
          Musik akan diputar otomatis secara lembut begitu tamu membuka sampul undangan.
        </p>
      </div>
    </div>
  );
}
