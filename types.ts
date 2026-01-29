
export enum SettlementStatus {
  CAIR = 'CAIR',
  DIPROSES = 'DIPROSES',
  DIRETUR = 'DIRETUR'
}

export enum InventoryReportStatus {
  DRAFT = 'Draft',
  DICEK = 'Dicek',
  DISETUJUI = 'Disetujui'
}

export enum EmployeeStatus {
  AKTIF = 'Aktif',
  NONAKTIF = 'Nonaktif'
}

export enum ContentProgressStatus {
  BELUM = 'Belum',
  PROSES = 'Proses',
  SELESAI = 'Selesai'
}

export enum ContentUploadStatus {
  BELUM = 'Belum',
  TERUPLOAD = 'Terupload'
}

export enum ContentFinalStatus {
  DRAFT = 'Draft',
  TERJADWAL = 'Terjadwal',
  TERPUBLISH = 'Terpublish',
  BATAL = 'Batal'
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum AttendanceStatus {
  HADIR = 'Hadir',
  TELAT = 'Telat',
  ALPHA = 'Alpha',
  IZIN = 'Izin',
  SAKIT = 'Sakit',
  CUTI = 'Cuti',
  DINAS_LUAR = 'Dinas Luar'
}

export interface Attendance { 
  id: string; 
  employeeId: string; 
  tanggal: string; 
  jam_masuk?: string; 
  jam_pulang?: string; 
  foto_selfie_masuk?: string; 
  foto_selfie_pulang?: string; 
  latitude?: number; 
  longitude?: number; 
  alamat_lokasi?: string; 
  status_absen: string; 
  keterangan?: string; 
  durasi_kerja?: string;
  created_at: string; 
}

export interface LeaveRequest { 
  id_izin: string; 
  id_karyawan: string; 
  tanggal_mulai: string; 
  tanggal_selesai: string; 
  jenis_izin: 'Izin' | 'Sakit' | 'Cuti' | 'Dinas Luar'; 
  alasan: string; 
  status: LeaveStatus; 
  catatan_admin?: string; 
  lampiran?: string;
}

export interface AttendanceLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  aksi: string;
  detail: string;
  data_lama?: string;
  data_baru?: string;
}

export interface SaleItem {
  productId: string;
  qty: number;
  unitPrice: number;
  hppPerUnit: number;
}

export interface Sale {
  id: string;
  tanggal: string;
  qty: number;
  nama_barang: string;
  harga_satuan: number;
  jumlah: number;
  status_pembayaran: string;
  nama_bank: string;
  asal_leads: string;
  asal_kota: string;
  hpp_satuan: number;
  jml_hpp: number;
  ongkir_pembeli: number;
  laba: number;
  biaya_admin: number;
  ongkir_pengiriman: number;
  no_pesanan: string;
  ekspedisi: string;
  status: SettlementStatus;
  tgl_cair: string;
  mp_marketplace: string;
  nama_pembeli: string;
  akun_pembeli: string;
  alamat_pembeli: string;
  no_hp_cust: string;
  resi_kode_booking: string;
}

export interface FullSaleRecord extends Partial<Sale> {
  id: string;
  date: string;
  orderNumber: string;
  items: SaleItem[];
  totalJual: number;
  profit: number;
  bankId: string;
  customerName: string;
  customerPhone: string;
  statusCair: SettlementStatus;
  expeditionId: string;
  trackingNumber: string;
  marketplaceAccount: string;
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  TIM_PACKING = 'tim_packing',
  TIM_KONTEN = 'tim_konten',
  TIM_MARKETPLACE = 'tim_marketplace'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  hpp: number;
  satuan: string;
  stock: number; 
}

export interface Bank { id: string; name: string; }
export interface Expedition { id: string; name: string; }
export interface Lead { id: string; source: string; city: string; }
export interface MarketplaceAccount { id: string; name: string; }
export interface City { id: string; name: string; }
export interface PaymentStatusOption { id: string; name: string; }

export interface Employee {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  phone: string;
  joinDate: string;
  roleId: string;
  status: EmployeeStatus;
}

export interface Role { id: string; name: string; description: string; color?: string; }
export interface WorkSchedule { id: string; roleId: string; day: string; checkInTime: string; checkOutTime: string; gracePeriod: number; status: 'aktif' | 'nonaktif'; }
export interface OfficeConfig { lat: number; lng: number; radius: number; addressName: string; }
export interface ProductUnit { id: string; name: string; }

// --- Content Management Interfaces ---
export interface MasterAkun { id_akun: string; nama_akun: string; id_karyawan?: string; }
export interface MasterPlatform { id_platform: string; nama_platform: string; }
export interface MasterJenisKonten { id_jenis_konten: string; nama_jenis_konten: string; }
export interface LaporanBulananKonten { id: string; tanggal: string; id_karyawan: string; id_akun: string; id_platform: string; tema_konten: string; id_jenis_konten: string; status_akhir: ContentFinalStatus; }
export interface LaporanProduksiHarian { id: string; tanggal: string; id_karyawan: string; id_akun: string; id_platform: string; ide_konten: string; status_skrip: ContentProgressStatus; status_shooting: ContentProgressStatus; status_editing: ContentProgressStatus; status_upload: ContentUploadStatus; link_konten: string; }
export interface LaporanPerformaHarian { id: string; tanggal: string; id_karyawan: string; id_akun: string; id_platform: string; tema_konten: string; views: number; like: number; comment: number; share: number; save: number; order_dari_konten: number; }
export interface ContentAuditLog { id: string; tanggal_waktu: string; nama_user: string; role_user: string; aksi: 'Tambah' | 'Edit' | 'Hapus' | 'Ekspor'; nama_halaman: string; detail_perubahan: string; }
export interface DailyInventory { id: string; tanggal: string; barang_id: string; nama_barang: string; satuan: string; stok_awal: number; barang_masuk: number; keterangan_masuk: string; barang_keluar: number; keterangan_keluar: string; stok_akhir: number; status_laporan: InventoryReportStatus; input_oleh: string; dicek_oleh?: string; logs: any[]; created_at: string; updated_at: string; }
export interface InventoryAuditLog { id: string; waktu: string; user: string; aktivitas: 'CREATE' | 'UPDATE' | 'DELETE'; barang: string; detail: string; }
export interface SaleAuditLog { id: string; waktu: string; user: string; aktivitas: 'CREATE' | 'UPDATE' | 'DELETE'; detail: string; }
export interface PackingDetail { id: string; packingId: string; namaBarang: string; jumlah: number; satuan: string; catatan?: string; }
export interface PackingListRecord { id: string; tanggal: string; namaCustomer: string; noHp: string; orderVia: string; kurir: string; keterangan?: string; totalNota: number; details: PackingDetail[]; orderIds?: string[]; }
