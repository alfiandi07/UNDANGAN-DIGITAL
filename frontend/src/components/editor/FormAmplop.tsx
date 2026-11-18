import type { EventDetails } from "../../lib/api";

interface FormAmplopProps {
  eventDetails: EventDetails;
  newBank: string;
  setNewBank: (val: string) => void;
  newNoRek: string;
  setNewNoRek: (val: string) => void;
  newAtasNama: string;
  setNewAtasNama: (val: string) => void;
  handleTambahAmplop: () => void;
  handleHapusAmplop: (idx: number) => void;
}

export default function FormAmplop({
  eventDetails,
  newBank,
  setNewBank,
  newNoRek,
  setNewNoRek,
  newAtasNama,
  setNewAtasNama,
  handleTambahAmplop,
  handleHapusAmplop,
}: FormAmplopProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
        Amplop Digital Cashless (Kado & Doa)
      </h3>

      {/* Tambah Rekening */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
        <label className="block text-xs font-bold text-gray-700">
          Tambah Rekening Bank / e-Wallet:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={newBank}
            onChange={(e) => setNewBank(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none"
          >
            <option value="BCA">BCA</option>
            <option value="Mandiri">Bank Mandiri</option>
            <option value="BRI">Bank BRI</option>
            <option value="BNI">Bank BNI</option>
            <option value="BSI">Bank Syariah Indonesia (BSI)</option>
            <option value="Dana">DANA</option>
            <option value="GoPay">GoPay</option>
            <option value="OVO">OVO</option>
          </select>
          <input
            type="text"
            value={newNoRek}
            onChange={(e) => setNewNoRek(e.target.value)}
            placeholder="Nomor Rekening / No. HP"
            className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none"
          />
          <input
            type="text"
            value={newAtasNama}
            onChange={(e) => setNewAtasNama(e.target.value)}
            placeholder="Atas Nama Pemilik"
            className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleTambahAmplop}
          className="px-4 py-2 bg-[#4A151E] hover:bg-[#360F15] text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          + Daftarkan Rekening
        </button>
      </div>

      {/* Daftar Rekening */}
      {eventDetails.amplop && eventDetails.amplop.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {eventDetails.amplop.map((rek, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex justify-between items-center"
            >
              <div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                  {rek.bank}
                </span>
                <p className="font-mono font-bold text-gray-900 text-sm mt-1">{rek.no_rek}</p>
                <p className="text-xs text-gray-500">a.n. {rek.atas_nama}</p>
              </div>
              <button
                type="button"
                onClick={() => handleHapusAmplop(idx)}
                className="text-red-500 hover:text-red-700 text-xs font-semibold p-2 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Belum ada nomor rekening yang didaftarkan.</p>
      )}
    </div>
  );
}

