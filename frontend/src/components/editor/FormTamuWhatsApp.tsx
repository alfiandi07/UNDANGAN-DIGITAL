interface FormTamuWhatsAppProps {
  slug: string;
  guestInput: string;
  setGuestInput: (val: string) => void;
  guestList: string[];
  copiedIndex: number | null;
  handleGenerateTamu: () => void;
  handleSalinPesan: (nama: string, idx: number) => void;
  buatTeksWhatsApp: (nama: string) => string;
}

export default function FormTamuWhatsApp({
  slug,
  guestInput,
  setGuestInput,
  guestList,
  copiedIndex,
  handleGenerateTamu,
  handleSalinPesan,
  buatTeksWhatsApp,
}: FormTamuWhatsAppProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-gray-800">
          WhatsApp Guest Link Generator (FR-C3)
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Ketik nama-nama tamu undangan (1 nama per baris), lalu klik tombol generate. Anda bisa langsung kirim tautan personalisasi ke WhatsApp mereka!
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-gray-700">
          Daftar Nama Tamu (Ketik 1 baris untuk setiap nama):
        </label>
        <textarea
          rows={5}
          value={guestInput}
          onChange={(e) => setGuestInput(e.target.value)}
          placeholder="Contoh:&#10;Bpk. Hendra & Keluarga&#10;Dr. Sarah Amelia&#10;Sahabat Andi Pratama&#10;Rian & Pasangan"
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-xs font-sans outline-none focus:ring-2 focus:ring-[#2D3E2F]"
        />
        <button
          type="button"
          onClick={handleGenerateTamu}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2D3E2F] hover:bg-[#1E2B20] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Buat Tautan Sebar WhatsApp</span>
        </button>
      </div>

      {/* Hasil Generate Tautan Tamu */}
      {guestList.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#DCD7CA]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#212C22]">
            Daftar Tamu Siap Sebar ({guestList.length} Tamu):
          </h4>
          <div className="divide-y divide-[#DCD7CA] border border-[#DCD7CA] rounded-2xl overflow-hidden bg-[#FAF8F3]">
            {guestList.map((nama, idx) => {
              const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                buatTeksWhatsApp(nama)
              )}`;
              return (
                <div
                  key={idx}
                  className="p-3 sm:p-4 bg-white hover:bg-[#F7F5EE] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{nama}</p>
                    <p className="text-[11px] font-mono text-[#2D3E2F] font-semibold">
                      asminvitation.my.id/{slug}?to={encodeURIComponent(nama)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSalinPesan(nama, idx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.768c0 5.518-4.482 10-10 10-1.745 0-3.415-.45-4.886-1.291l-7.114 1.863 1.894-6.924c-.958-1.523-1.464-3.287-1.464-5.097 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z"/>
                      </svg>
                      <span>Kirim WA</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

