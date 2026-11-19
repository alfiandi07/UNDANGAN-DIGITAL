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
        <div className="p-6 bg-[#FAF8F3] rounded-2xl border border-[#DCD7CA] text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#EAF1E9] text-[#3A5438] flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h4 className="font-bold text-[#212C22] text-sm">Paket Standar Tanpa Galeri Foto</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Undangan Anda terdaftar pada <strong>Paket Standar</strong> dengan layout elegan tanpa galeri foto. Jika ingin menambahkan galeri hingga 20 foto berkualitas tinggi, silakan upgrade ke <strong>Paket Premium</strong>.
          </p>
        </div>
      ) : (
        <>
          {/* Uploader Langsung ke Cloudinary */}
          <div className="p-5 bg-[#FAF8F3] rounded-2xl border-2 border-dashed border-[#DCD7CA] space-y-3 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept="image/*"
              disabled={isQuotaFull || uploadingPhoto}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white border border-[#DCD7CA] text-[#2D3E2F] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#212C22]">
                  Unggah Foto Galeri ke Cloudinary
                </h4>
                <p className="text-xs text-slate-500">
                  Otomatis dikompresi ke format <strong>.WebP</strong> super ringan &amp; tajam (Maks. 8 MB).
                </p>
              </div>

              {uploadingPhoto ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAF1E9] text-[#3A5438] rounded-xl text-xs font-bold animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-[#3A5438] border-t-transparent rounded-full animate-spin" />
                  <span>{uploadProgressMsg || "Sedang mengunggah ke Cloudinary..."}</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isQuotaFull}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D3E2F] hover:bg-[#1E2B20] text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{isQuotaFull ? "Kuota 20 Foto Penuh" : "Pilih Foto dari Galeri HP / PC"}</span>
                </button>
              )}
            </div>

            {/* Input Alternatif URL Teks Manual */}
            <div className="pt-3 border-t border-[#DCD7CA] flex items-center gap-2 text-left">
              <span className="text-[11px] text-slate-500 whitespace-nowrap">Atau URL luar:</span>
              <input
                type="url"
                disabled={isQuotaFull || uploadingPhoto}
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://... URL foto luar"
                className="flex-1 px-3 py-1.5 border border-[#DCD7CA] rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#2D3E2F]"
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
                        <span className="inline-flex items-center gap-1 bg-[#2D3E2F]/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profil Pria</span>
                        </span>
                      )}
                      {isWanita && (
                        <span className="inline-flex items-center gap-1 bg-[#A2583E]/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profil Wanita</span>
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
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                          isPria
                            ? "bg-[#2D3E2F] text-white"
                            : "bg-white/90 hover:bg-white text-gray-800"
                        }`}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{isPria ? "Lepas" : "Pria"}</span>
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
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                          isWanita
                            ? "bg-[#A2583E] text-white"
                            : "bg-white/90 hover:bg-white text-gray-800"
                        }`}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{isWanita ? "Lepas" : "Wanita"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHapusFoto(idx, foto)}
                      className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                      title="Hapus foto ini dari Cloudinary"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#2D3E2F]"
        />
        <p className="text-[11px] text-gray-400">
          Musik akan diputar otomatis secara lembut begitu tamu membuka sampul undangan.
        </p>
      </div>
    </div>
  );
}

