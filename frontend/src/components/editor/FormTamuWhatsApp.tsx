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
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-xs font-sans outline-none focus:ring-2 focus:ring-[#4A151E]"
        />
        <button
          type="button"
          onClick={handleGenerateTamu}
          className="px-5 py-2.5 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          ⚡ Buat Tautan Sebar WhatsApp
        </button>
      </div>

      {/* Hasil Generate Tautan Tamu */}
      {guestList.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Daftar Tamu Siap Sebar ({guestList.length} Tamu):
          </h4>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
            {guestList.map((nama, idx) => {
              const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                buatTeksWhatsApp(nama)
              )}`;
              return (
                <div
                  key={idx}
                  className="p-3 sm:p-4 bg-white hover:bg-gray-50/80 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{nama}</p>
                    <p className="text-[11px] font-mono text-indigo-700">
                      undang_an.digital/{slug}?to={encodeURIComponent(nama)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSalinPesan(nama, idx)}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
                    >
                      {copiedIndex === idx ? "✓ Tersalin!" : "📋 Salin Teks"}
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>📲</span> Kirim WA
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
