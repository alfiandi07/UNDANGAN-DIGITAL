import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as api from "../lib/api";
import type { Pengguna } from "../lib/api";

type AuthContextType = {
  user: Pengguna | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Pengguna>;
  daftar: (nama: string, email: string, password: string) => Promise<Pengguna>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "undangan_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Pengguna | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const pengguna = await api.login(email, password);
    setUser(pengguna);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pengguna));
    return pengguna;
  }

  async function daftar(nama: string, email: string, password: string) {
    const pengguna = await api.daftar(nama, email, password);
    setUser(pengguna);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pengguna));
    return pengguna;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, daftar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

