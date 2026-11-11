import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
      isActive
        ? "bg-[#4A151E] text-[#FFF9F2] shadow-xs"
        : "text-[#69584F] hover:bg-[#F8F4ED] hover:text-[#381118]"
    }`;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#EBE3D5] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg tracking-tight text-[#381118]">
                  asm.invitation
                </span>
                <span className="text-[10px] bg-[#F5EFE6] text-[#7A6237] border border-[#E8DEC8] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  STUDIO
                </span>
              </div>
              <nav className="flex gap-1">
                {user?.peran === "admin" ? (
                  <>
                    <NavLink to="/dashboard/produk" className={linkClass}>
                      🎨 Kelola Template
                    </NavLink>
                    <NavLink to="/dashboard/pengguna" className={linkClass}>
                      👥 Pengguna
                    </NavLink>
                    <NavLink to="/dashboard/transaksi" className={linkClass}>
                      📋 Pesanan Undangan
                    </NavLink>
                    <NavLink to="/dashboard/keuangan" className={linkClass}>
                      💰 Laporan Finansial
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/" className={linkClass}>
                      🛍️ Katalog Master
                    </NavLink>
                    <NavLink to="/dashboard/transaksi" className={linkClass}>
                      💌 Undangan Saya
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Halo,{" "}
                <span className="font-semibold text-gray-900">
                  {user?.nama}
                </span>
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                  user?.peran === "admin"
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {user?.peran}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
