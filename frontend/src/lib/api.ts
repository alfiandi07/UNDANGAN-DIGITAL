// ── Types ──────────────────────────────────────────────
export type Pengguna = {
  id: number;
  nama: string;
  email: string;
  peran: "admin" | "user";
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
    let rawError = (body as { error?: string })?.error ?? `Request gagal (${res.status})`;
    if (
      rawError.includes("doesn't exist") ||
      rawError.includes("SQL") ||
      rawError.includes("ER_") ||
      rawError.includes("SyntaxError") ||
      rawError.includes("Table '")
    ) {
      rawError = "Terjadi kendala pada server saat memproses data. Silakan coba beberapa saat lagi.";
    }
    throw new Error(rawError);
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
export type PackageTier = "standard" | "premium";

export type Template = {
  id: number;
  slug: string;
  title: string;
  category: "wedding" | "khitan" | "birthday" | "aqiqah";
  package_type?: PackageTier;
  price?: number;
  theme_style: string;
  thumbnail_url: string;
  demo_url: string;
  price_basic: number;
  price_standard: number;
  price_special: number;
  is_active: boolean;
};

export function ambilSemuaTemplates(category?: string, packageType?: string) {
  const params = new URLSearchParams();
  if (category && category !== "Semua" && category !== "all") {
    params.set("category", category);
  }
  if (packageType && packageType !== "Semua" && packageType !== "all") {
    params.set("package_type", packageType);
  }
  const query = params.toString();
  return request<Template[]>(query ? `/api/templates?${query}` : "/api/templates");
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

// ── Admin Template CRUD ──────────────────────────────────
export type DataTemplateInput = {
  slug: string;
  title: string;
  category: "wedding" | "khitan" | "birthday" | "aqiqah";
  package_type?: PackageTier;
  price?: number;
  theme_style: string;
  thumbnail_url: string;
  demo_url?: string;
  price_basic?: number;
  price_standard?: number;
  price_special?: number;
  is_active?: boolean;
};

export function ambilSemuaTemplatesAdmin() {
  return request<Template[]>("/api/templates/admin/semua");
}

export function tambahTemplate(data: DataTemplateInput) {
  return request<Template>("/api/templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function ubahTemplate(id: number, data: Partial<DataTemplateInput>) {
  return request<Template>(`/api/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function hapusTemplate(id: number) {
  return request<{ message: string }>(`/api/templates/${id}`, {
    method: "DELETE",
  });
}

// ── Modul B: Order & Midtrans Checkout ───────────────────
export type PackageType = "standard" | "premium" | "basic" | "special";
export type PaymentStatus = "pending" | "paid" | "expired" | "failed";

export type Order = {
  id: number;
  order_id: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string;
  template_id: number;
  package_type: PackageType;
  gross_amount: number;
  payment_status: PaymentStatus;
  paid_at?: string | null;
  created_at?: string;
  template_title?: string;
  slug?: string;
  invitation_status?: string;
};

export type EventDetails = {
  title?: string;
  mempelai?: {
    pria?: { nama?: string; panggilan?: string; ayah?: string; ibu?: string; foto?: string };
    wanita?: { nama?: string; panggilan?: string; ayah?: string; ibu?: string; foto?: string };
  };
  akad?: { tanggal?: string; jam?: string; lokasi?: string; alamat?: string; maps_url?: string };
  resepsi?: { tanggal?: string; jam?: string; lokasi?: string; alamat?: string; maps_url?: string };
  music_url?: string;
  amplop?: Array<{ bank: string; no_rek: string; atas_nama: string }>;
  photos?: string[];
  love_story?: Array<{ tahun: string; cerita: string }>;
};

export type Invitation = {
  id: number;
  order_id: string;
  slug: string;
  template_id: number;
  package_type: PackageType;
  max_photos: number;
  current_photos: number;
  event_details: EventDetails;
  status: "draft" | "active" | "expired" | "cleaned";
  expires_at: string;
  created_at?: string;
  template_title?: string;
  buyer_name?: string;
};

export type CreateOrderInput = {
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string;
  password: string;
  template_id: number;
  package_type: PackageType;
  slug: string;
};

export type CreateOrderResponse = {
  success: boolean;
  order: Order;
  invitation: Invitation;
  snap_token: string;
  redirect_url: string;
};

export function buatOrder(data: CreateOrderInput) {
  return request<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function simulasiBayarOrder(orderId: string) {
  return request<{ success: boolean; message: string; order: Order; invitation: Invitation }>(
    `/api/orders/${orderId}/simulasi-bayar`,
    { method: "POST" }
  );
}

export function ambilPesananSaya(email: string) {
  return request<{ orders: Order[]; invitations: Invitation[] }>(
    `/api/orders/my-orders?email=${encodeURIComponent(email)}`
  );
}

export function ambilSemuaPesananAdmin() {
  return request<Order[]>("/api/orders/admin/all");
}

export function ambilDetailOrder(orderId: string) {
  return request<{ order: Order; invitation: Invitation }>(`/api/orders/${orderId}`);
}

// ── Modul C: Editor Acara Undangan & Kuota Foto ──────────
export function ambilDetailUndangan(slug: string) {
  return request<Invitation>(`/api/invitations/${slug}`);
}

export function simpanEventDetails(slug: string, eventDetails: EventDetails) {
  return request<{ success: boolean; message: string; invitation: Invitation }>(
    `/api/invitations/${slug}`,
    {
      method: "PUT",
      body: JSON.stringify({ event_details: eventDetails }),
    }
  );
}

export async function uploadFotoCloudinary(slug: string, file: File) {
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(`/api/client/invitations/${slug}/photo`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Gagal mengunggah foto ke Cloudinary");
  }
  return json as {
    success: boolean;
    message: string;
    photo_url: string;
    current_photos: number;
    max_photos: number;
    invitation: Invitation;
  };
}

export function hapusFotoCloudinary(slug: string, photoUrl: string) {
  return request<{
    success: boolean;
    message: string;
    current_photos: number;
    max_photos: number;
    invitation: Invitation;
  }>(`/api/client/invitations/${slug}/photo`, {
    method: "DELETE",
    body: JSON.stringify({ photo_url: photoUrl }),
  });
}

// ── Modul D: RSVP & Buku Tamu Realtime ───────────────────
export type Attendance = "hadir" | "tidak_hadir" | "ragu";

export type Rsvp = {
  id: number;
  invitation_id: number;
  guest_name: string;
  attendance: Attendance;
  pax: number;
  message: string;
  created_at?: string;
};

export function ambilDaftarRsvps(slug: string) {
  return request<Rsvp[]>(`/api/invitations/${slug}/rsvps`);
}

export function kirimRsvp(
  slug: string,
  data: { guest_name: string; attendance: Attendance; pax?: number; message: string }
) {
  return request<{ success: boolean; message: string; rsvp: Rsvp }>(
    `/api/invitations/${slug}/rsvps`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ── Modul E: Laporan Finansial & Bagi Hasil Bertiga ──────
export type OperationalCost = {
  id: number;
  period_month: string;
  expense_name: string;
  amount: number;
  created_at?: string;
};

export type FinanceSummary = {
  total_omset: number;
  total_orders_paid: number;
  total_expenses: number;
  net_profit: number;
  share_per_member: number;
  team_members: Array<{
    name: string;
    role: string;
    share_amount: number;
  }>;
  expenses: OperationalCost[];
};

export function ambilLaporanFinansial() {
  return request<FinanceSummary>("/api/finance/summary");
}

export function tambahBiayaOperasional(data: { expense_name: string; amount: number; period_month?: string }) {
  return request<OperationalCost>("/api/finance/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function hapusBiayaOperasional(id: number) {
  return request<{ message: string }>(`/api/finance/expenses/${id}`, {
    method: "DELETE",
  });
}

export function jalankanCleanupServer() {
  return request<{ success: boolean; message: string; result: { cleaned_count: number; cleaned_slugs: string[] } }>(
    "/api/finance/cleanup-now",
    { method: "POST" }
  );
}

