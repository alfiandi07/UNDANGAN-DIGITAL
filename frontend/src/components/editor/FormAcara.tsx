import type { Dispatch, SetStateAction } from "react";
import type { EventDetails } from "../../lib/api";

interface FormAcaraProps {
  eventDetails: EventDetails;
  setEventDetails: Dispatch<SetStateAction<EventDetails>>;
}

export default function FormAcara({ eventDetails, setEventDetails }: FormAcaraProps) {
  const akad = eventDetails.akad;
  const resepsi = eventDetails.resepsi;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
        Jadwal & Lokasi Acara
      </h3>

      {/* Akad Nikah */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
          💍 Waktu & Lokasi Akad Nikah / Pemberkatan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Akad</label>
            <input
              type="date"
              value={akad?.tanggal ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  akad: { ...p.akad, tanggal: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Waktu / Jam (WIB)</label>
            <input
              type="text"
              value={akad?.jam ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  akad: { ...p.akad, jam: e.target.value },
                }))
              }
              placeholder="Contoh: 08:00 - 10:00 WIB"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Gedung / Masjid</label>
            <input
              type="text"
              value={akad?.lokasi ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  akad: { ...p.akad, lokasi: e.target.value },
                }))
              }
              placeholder="Masjid Agung Al-Barkah Bekasi"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tautan Google Maps</label>
            <input
              type="url"
              value={akad?.maps_url ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  akad: { ...p.akad, maps_url: e.target.value },
                }))
              }
              placeholder="https://maps.app.goo.gl/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={akad?.alamat ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  akad: { ...p.akad, alamat: e.target.value },
                }))
              }
              placeholder="Jl. Veteran No. 46, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
        </div>
      </div>

      {/* Resepsi Pernikahan */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
          🎉 Waktu & Lokasi Resepsi Pernikahan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Resepsi</label>
            <input
              type="date"
              value={resepsi?.tanggal ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  resepsi: { ...p.resepsi, tanggal: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Waktu / Jam (WIB)</label>
            <input
              type="text"
              value={resepsi?.jam ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  resepsi: { ...p.resepsi, jam: e.target.value },
                }))
              }
              placeholder="Contoh: 11:00 - 14:00 WIB"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Ballroom / Gedung</label>
            <input
              type="text"
              value={resepsi?.lokasi ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  resepsi: { ...p.resepsi, lokasi: e.target.value },
                }))
              }
              placeholder="Grand Ballroom Hotel Horison Bekasi"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tautan Google Maps</label>
            <input
              type="url"
              value={resepsi?.maps_url ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  resepsi: { ...p.resepsi, maps_url: e.target.value },
                }))
              }
              placeholder="https://maps.app.goo.gl/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Lengkap Resepsi</label>
            <textarea
              rows={2}
              value={resepsi?.alamat ?? ""}
              onChange={(e) =>
                setEventDetails((p) => ({
                  ...p,
                  resepsi: { ...p.resepsi, alamat: e.target.value },
                }))
              }
              placeholder="Jl. KH. Noer Ali, Pekayon Jaya, Kota Bekasi"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-[#4A151E]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
