import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BerandaKatalog from "./pages/BerandaKatalog";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProdukPage from "./pages/ProdukPage";
import PenggunaPage from "./pages/PenggunaPage";
import TransaksiPage from "./pages/TransaksiPage";

function DashboardIndex() {
  const { user } = useAuth();
  if (user?.peran === "admin") {
    return <Navigate to="/dashboard/produk" replace />;
  }
  return <Navigate to="/dashboard/transaksi" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Halaman Utama Publik */}
          <Route path="/" element={<BerandaKatalog />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />

          {/* Protected Area */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardPage />}>
              <Route index element={<DashboardIndex />} />
              <Route path="produk" element={<ProdukPage />} />
              <Route path="katalog" element={<Navigate to="/" replace />} />
              <Route path="pengguna" element={<PenggunaPage />} />
              <Route path="transaksi" element={<TransaksiPage />} />
            </Route>
          </Route>

          {/* Fallback jika URL tidak ditemukan, arahkan ke Beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
