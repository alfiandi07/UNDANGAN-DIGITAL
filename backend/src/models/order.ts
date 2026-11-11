export type PackageType = "basic" | "standard" | "special";
export type PaymentStatus = "pending" | "paid" | "expired" | "failed";
export type InvitationStatus = "draft" | "active" | "expired" | "cleaned";

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
};

export type EventDetails = {
  title?: string;
  mempelai?: {
    pria?: { nama?: string; panggilan?: string; ayah?: string; ibu?: string };
    wanita?: { nama?: string; panggilan?: string; ayah?: string; ibu?: string };
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
  status: InvitationStatus;
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
