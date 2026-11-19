import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../components/profile/ProfileModal";
import "../styles/Dashboard.css";

interface DashboardPageProps {
  children?: ReactNode;
}

export default function DashboardPage({ children }: DashboardPageProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/masuk");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `dashboard-nav-link ${isActive ? "dashboard-nav-link--active" : ""}`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `dashboard-mobile-nav-link ${isActive ? "dashboard-mobile-nav-link--active" : ""}`;

  return (
    <div className="dashboard-layout">
      {/* Header Utama Dashboard */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          {/* Logo & Navigasi Desktop */}
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
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Kelola Template</span>
                  </NavLink>
                  <NavLink to="/dashboard/pengguna" className={linkClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Pengguna</span>
                  </NavLink>
                  <NavLink to="/dashboard/transaksi" className={linkClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>Pesanan Undangan</span>
                  </NavLink>
                  <NavLink to="/dashboard/keuangan" className={linkClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Laporan Finansial</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/" className={linkClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Katalog Master</span>
                  </NavLink>
                  <NavLink to="/dashboard/transaksi" className={linkClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Undangan Saya</span>
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
              <svg className="w-3.5 h-3.5 shrink-0 text-[#6d5225]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profil Saya</span>
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
            {isMobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
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
                <svg className="w-3.5 h-3.5 shrink-0 text-[#6d5225]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Edit Profil</span>
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
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Kelola Template</span>
                  </NavLink>
                  <NavLink
                    to="/dashboard/pengguna"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Pengguna</span>
                  </NavLink>
                  <NavLink
                    to="/dashboard/transaksi"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>Pesanan Undangan</span>
                  </NavLink>
                  <NavLink
                    to="/dashboard/keuangan"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Laporan Finansial</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Katalog Master</span>
                  </NavLink>
                  <NavLink
                    to="/dashboard/transaksi"
                    className={mobileLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Undangan Saya</span>
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
                Keluar dari Akun
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Konten Halaman Aktif */}
      <main className="dashboard-content-container">
        {children}
      </main>

      {/* Modal Profile Popup */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
