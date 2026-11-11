export type KategoriTemplate = "wedding" | "khitan" | "birthday" | "aqiqah";

export type Template = {
  id: number;
  slug: string;
  title: string;
  category: KategoriTemplate;
  theme_style: string;
  thumbnail_url: string;
  demo_url: string;
  price_basic: number;
  price_standard: number;
  price_special: number;
  is_active: boolean;
  created_at?: string;
};

export type DataTemplate = {
  slug: string;
  title: string;
  category: KategoriTemplate;
  theme_style: string;
  thumbnail_url: string;
  demo_url: string;
  price_basic: number;
  price_standard: number;
  price_special: number;
  is_active?: boolean;
};

