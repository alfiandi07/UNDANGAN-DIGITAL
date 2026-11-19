import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../components/profile/ProfileModal";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    setIsMobileMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `dashboard-nav-link ${isActive ? "dashboard-nav-link--active" : ""}`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `dashboard-mobile-nav-link ${isActive ? "dashboard-mobile-nav-link--active" : ""}`;

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
            {/* Navigasi Desktop */}
            <nav className="dashboard-nav dashboard-nav--desktop">
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

          {/* Tombol Aksi Desktop */}
          <div className="dashboard-header-right dashboard-header-right--desktop">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="dashboard-btn-profile"
              title="Edit Profil Saya"
            >
              👤 Profil Saya
            </button>

            <span className="dashboard-user-greeting">
              Halo, <strong>{user?.nama}</strong>
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

          {/* Tombol Hamburger Mobile */}
          <button
            type="button"
            className="dashboard-mobile-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Menu Drawer Mobile */}
        {isMobileMenuOpen && (
          <div className="dashboard-mobile-drawer">
            {/* Profil Pengguna di Layar HP */}
            <div className="dashboard-mobile-user-card">
              <div className="dashboard-mobile-user-info">
                <span className="dashboard-mobile-user-name">
                  {user?.nama || "Pengguna"}
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
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="dashboard-btn-profile"
              >
                👤 Edit Profil
              </button>
            </div>

            {/* Navigasi Link Mobile */}
            <nav className="dashboard-mobile-nav">
              {user?.peran === "admin" ? (
                <>
                  <NavLink
                    to="/dashboard/produk"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🎨 Kelola Template
                  </NavLink>
                  <NavLink
                    to="/dashboard/pengguna"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    👥 Pengguna
                  </NavLink>
                  <NavLink
                    to="/dashboard/transaksi"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📋 Pesanan Undangan
                  </NavLink>
                  <NavLink
                    to="/dashboard/keuangan"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    💰 Laporan Finansial
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🛍️ Katalog Master
                  </NavLink>
                  <NavLink
                    to="/dashboard/transaksi"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    💌 Undangan Saya
                  </NavLink>
                </>
              )}
            </nav>

            {/* Tombol Logout Mobile */}
            <div className="dashboard-mobile-footer">
              <button
                type="button"
                onClick={handleLogout}
                className="dashboard-mobile-btn-logout"
              >
                🚪 Keluar dari Akun
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="dashboard-content-container">
        <Outlet />
      </main>

      {/* Modal Pengaturan Profil Saya */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
