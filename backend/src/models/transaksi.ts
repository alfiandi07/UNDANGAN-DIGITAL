export type StatusTransaksi = "pending" | "sukses" | "batal";

export type ItemTransaksi = {
  id_produk: number;
  jumlah: number;
};

export type BuatTransaksiDTO = {
  id_pengguna: number;
  items: ItemTransaksi[];
};
