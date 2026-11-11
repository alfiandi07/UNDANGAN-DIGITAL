// ── Types ──────────────────────────────────────────────
export type Pengguna = {
  id: number;
  nama: string;
  email: string;
  peran: "admin" | "creator";
};

export type Produk = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  kategory: string;
};

export type DataProduk = {
  nama: string;
  harga: number;
  stok: number;
  kategory: string;
};

// ── Fetch wrapper ──────────────────────────────────────
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (body as { error?: string })?.error ?? `Request gagal (${res.status})`
    );
  }
  return body as T;
}

// ── Auth ───────────────────────────────────────────────
export function login(email: string, password: string) {
  return request<Pengguna>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function daftar(nama: string, email: string, password: string) {
  return request<Pengguna>("/api/auth/daftar", {
    method: "POST",
    body: JSON.stringify({ nama, email, password }),
  });
}

// ── Produk CRUD ────────────────────────────────────────
export function ambilSemuaProduk() {
  return request<Produk[]>("/api/produk");
}

export function ambilProduk(id: number) {
  return request<Produk>(`/api/produk/${id}`);
}

export function tambahProduk(data: DataProduk) {
  return request<Produk>("/api/produk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function ubahProduk(id: number, data: DataProduk) {
  return request<Produk>(`/api/produk/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function hapusProduk(id: number) {
  return request<{ pesan: string }>(`/api/produk/${id}`, {
    method: "DELETE",
  });
}

// ── Pengguna ───────────────────────────────────────────
export function ambilSemuaPengguna() {
  return request<Pengguna[]>("/api/pengguna");
}

// ── Transaksi ──────────────────────────────────────────
export type Transaksi = {
  id: number;
  id_pengguna: number;
  total_harga: number;
  status: "pending" | "sukses" | "batal";
  created_at: string;
};

export type ItemPesan = {
  id_produk: number;
  jumlah: number;
};

export function ambilSemuaTransaksi() {
  return request<Transaksi[]>("/api/transaksi");
}

export function buatTransaksi(data: { id_pengguna: number; items: ItemPesan[] }) {
  return request<{ id: number; status: string; total_harga: number }>(
    "/api/transaksi",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ── Master Template (PRD asm.invitation) ─────────────────
export type Template = {
  id: number;
  slug: string;
  title: string;
  category: "wedding" | "khitan" | "birthday" | "aqiqah";
  theme_style: string;
  thumbnail_url: string;
  demo_url: string;
  price_basic: number;
  price_standard: number;
  price_special: number;
  is_active: boolean;
};

export function ambilSemuaTemplates(category?: string) {
  const url =
    category && category !== "Semua" && category !== "all"
      ? `/api/templates?category=${category}`
      : "/api/templates";
  return request<Template[]>(url);
}

export function ambilDetailTemplate(slug: string) {
  return request<Template>(`/api/templates/${slug}`);
}

export function cekKetersediaanSlug(slug: string) {
  return request<{ slug: string; available: boolean; message: string }>(
    "/api/check-slug",
    {
      method: "POST",
      body: JSON.stringify({ slug }),
    }
  );
}

