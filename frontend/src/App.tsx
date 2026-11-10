import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProdukPage from "./pages/ProdukPage";
import PenggunaPage from "./pages/PenggunaPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />

          {/* Protected Area */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardPage />}>
              <Route index element={<Navigate to="produk" replace />} />
              <Route path="produk" element={<ProdukPage />} />
              <Route path="pengguna" element={<PenggunaPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard/produk" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
