export type Peran = "admin" | "user";
// Data yang boleh dikirim ke browser (tanpa password)
export type Pengguna = {
  id: number;
  nama: string;
  email: string;
  peran: Peran;
};
// Data dari form daftar
export type DataDaftar = { nama: string; email: string; password: string; peran?: Peran };
