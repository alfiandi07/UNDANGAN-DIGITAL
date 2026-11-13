import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `dashboard-nav-link ${isActive ? "dashboard-nav-link--active" : ""}`;

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-header-left">
            <div className="dashboard-brand-box">
              <span className="dashboard-brand-title">asm.invitation</span>
              <span className="dashboard-brand-badge">STUDIO</span>
            </div>
            <nav className="dashboard-nav">
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

          <div className="dashboard-header-right">
            <span className="dashboard-user-greeting">
              Halo, <strong style={{ color: "#111827" }}>{user?.nama}</strong>
            </span>
            <span
              className={`dashboard-role-badge ${
                user?.peran === "admin"
                  ? "dashboard-role-badge--admin"
                  : "dashboard-role-badge--creator"
              }`}
            >
              {user?.peran}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="dashboard-btn-logout"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="dashboard-content-container">
        <Outlet />
      </main>
    </div>
  );
}
