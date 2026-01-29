
import { Product, Bank, Expedition, Lead, MarketplaceAccount, City, PaymentStatusOption, FullSaleRecord, SettlementStatus, Employee, UserRole, EmployeeStatus, Role, WorkSchedule, ProductUnit, PackingListRecord } from './types';

export const INITIAL_ROLES: Role[] = [
  { id: UserRole.SUPERADMIN, name: 'Superadmin', description: 'Akses penuh ke seluruh modul sistem dan pengaturan karyawan.', color: '#0f172a' },
  { id: UserRole.TIM_PACKING, name: 'Tim Packing', description: 'Bertanggung jawab atas proses pengemasan barang dan gudang.', color: '#6366f1' },
  { id: UserRole.TIM_KONTEN, name: 'Tim Konten', description: 'Pengelola konten media sosial dan materi promosi.', color: '#ec4899' },
  { id: UserRole.TIM_MARKETPLACE, name: 'Tim Marketplace', description: 'Pengelola akun toko online dan layanan pelanggan marketplace.', color: '#10b981' }
];

export const INITIAL_SCHEDULES: WorkSchedule[] = [
  { id: 'sch1', roleId: UserRole.SUPERADMIN, day: 'Senin', checkInTime: '08:00', checkOutTime: '17:00', gracePeriod: 15, status: 'aktif' },
  { id: 'sch2', roleId: UserRole.TIM_PACKING, day: 'Senin', checkInTime: '09:00', checkOutTime: '18:00', gracePeriod: 10, status: 'aktif' },
  { id: 'sch3', roleId: UserRole.TIM_MARKETPLACE, day: 'Senin', checkInTime: '08:30', checkOutTime: '17:30', gracePeriod: 5, status: 'aktif' },
  { id: 'sch4', roleId: UserRole.TIM_KONTEN, day: 'Senin', checkInTime: '09:00', checkOutTime: '17:00', gracePeriod: 30, status: 'aktif' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: 'emp1', fullName: 'Ahmad Manager', username: 'admin', password: 'password123', phone: '08123456789', 
    joinDate: '2023-01-01', roleId: UserRole.SUPERADMIN, status: EmployeeStatus.AKTIF
  },
  { 
    id: 'emp2', fullName: 'Budi Santoso', username: 'budi_packing', password: 'packing456', phone: '081122334455', 
    joinDate: '2024-05-10', roleId: UserRole.TIM_PACKING, status: EmployeeStatus.AKTIF
  },
  { 
    id: 'emp3', fullName: 'Siska Amelia', username: 'siska_konten', password: 'konten789', phone: '082233445566', 
    joinDate: '2024-02-15', roleId: UserRole.TIM_KONTEN, status: EmployeeStatus.AKTIF
  }
];

export const INITIAL_UNITS: ProductUnit[] = [
  { id: 'u1', name: 'Pack' }, { id: 'u2', name: 'Botol' }, { id: 'u3', name: 'Pcs' }, { id: 'u4', name: 'Karung' }, { id: 'u5', name: 'Kg' }, { id: 'u6', name: 'Gram' }, { id: 'u7', name: 'Box' }
];

export const INITIAL_MARKETPLACES: MarketplaceAccount[] = [
  { id: 'mp-bl-1', name: 'Bl AGEN PERTANIAN' },
  { id: 'mp-sh-12', name: 'Sh Berkahtaniofficial' },
  { id: 'mp-tp-11', name: 'Toped Indonesia Organik Prima' },
  { id: 'mp-tt-1', name: 'Tik Tok Distributor Pupuk' },
  { id: 'mp-wa-1', name: 'WA IM3' }
];

export const INITIAL_CITIES: City[] = [
  { id: 'cty6', name: 'DKI Jakarta' },
  { id: 'cty9', name: 'Jawa Barat' },
  { id: 'cty10', name: 'Jawa Tengah' },
  { id: 'cty11', name: 'Jawa Timur' }
];

export const INITIAL_PAYMENT_STATUS_OPTIONS: PaymentStatusOption[] = [
  { id: 'ps-p4', name: 'COD' },
  { id: 'ps-p10', name: 'TRANSFER' }
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: "ASN", name: "ASAM AMINO NAVA TOP", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "AH-MAT", name: "Asam Humat AH-MAT Label 1KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "AHMAT- K", name: "Asam Humat Non-Label 1 KARUNG", price: 0, discountPrice: 0, hpp: 0, satuan: "Karung", stock: 0 },
  { id: "AHMAT-01", name: "Asam Humat Non-Label 1KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "BVZ-C", name: "Beve Z Cair", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BVZ-P", name: "Beve Z Padat 100gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BIO-K250", name: "Bio Killer 250 ml", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BIO-L", name: "Bio Lada", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BA-1L", name: "Bio-Aquatic 1 Liter", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BIO-A", name: "Bioaktivator", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BTK", name: "Biotek", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BTK-TRA", name: "Biotek Trichoderma 1 KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "BTK-TRA100", name: "Biotek Trichoderma 100gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "BTK-DC", name: "Biotek Decomposer 1 KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "BO-AH", name: "Booster Anggrek Hitam", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BO-AP", name: "Booster Anggrek Hitam", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "DK", name: "DEKA", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "F-ON", name: "Flora One Sawit", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "F-ON-C", name: "Flora One Sawit Cair", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "TRI-A50", name: "FO Pupuk Hayati 50gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "TRI-A250", name: "FO Pupuk Hayati 250gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "KLT", name: "Kilat 25gram", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "PGPR-1L", name: "PGPR 1 Liter", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PH-1", name: "Pupuk Hayati Cair 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PSC-5", name: "Pupuk Sawit Cair 5 Liter", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PSP-1", name: "Pupuk Sawit Padat 1kg", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "PSP-25", name: "Pupuk Sawit Padat 25kg", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "SYK", name: "Pupuk Soyaku", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "RJ-A", name: "Raja Mina Aquatic", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "RJ-S", name: "Raja Mina Stimulant", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "RBH", name: "Reliq Booster Hayati 250gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "RZB", name: "Rhizobium 40gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "TRI-A", name: "Trichoderma Alumunium", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "TRI-C", name: "Trichoderma Cair", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "TRI-Z", name: "Trico-Z 1 Kg", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "TRI-Z-02", name: "Trico-Z 100 Gram", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "TRA-5", name: "TRICODERMA 500 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "TRI-T", name: "Tricotech", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BN-SBR", name: "BEN SUBUR 1 L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "GMN-BV1", name: "GMN- BEUVERIA 100 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GMN-BV", name: "GMN- BEUVERIA 500 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GMN-GLC1", name: "GMN- GLIOCLADIUM 100 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GMN-MT", name: "GMN- METARIZIUM 500 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GMN-RHZ", name: "GMN- RHIZOBIUM 50 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GMN-TRA1", name: "GMN- TRICODERMA 1 KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "GMN-TRA1NL", name: "GMN- TRICODERMA 1 KG Non Label", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "GMN-TRA100", name: "GMN- TRICODERMA 100 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GMN-TRA5", name: "GMN- TRICODERMA 500 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "GPN", name: "GREEN POWER NUTRALINDO", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "GPN-1", name: "GREEN POWER NUTRALINDO 1 KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "BIO-H", name: "BIO HOSS 1 L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "HMC-ACD", name: "HUMIC ACID 1 KG", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "HMC-ACD5", name: "HUMIC ACID 500 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "HMC-ACD25", name: "HUMIC ACID 250 GRAM", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "BLT", name: "Bala Tani Zeo", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BIO-NZ", name: "BIOCHAR NZ", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "B-NL", name: "Booster Non Label", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "B-NLN", name: "Booster Non Label NEW", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "FIX-P", name: "Fix Pro (Non Label)", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "HGB", name: "Hormon Generatif  250ml", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "HGV 1 L", name: "Hormon Generatif 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "RHGK", name: "Hormon Generatif Kecil", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "HVB 1 L", name: "Hormon Vegetatif 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "HVB 250ml", name: "Hormon Vegetatif 250ml", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "RHSK", name: "Hormon VEGETATIF Non Label", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "MM-C", name: "Monster Max Cair", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "MM-C1", name: "Monster Max Cair 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "MM-P", name: "Monster Max Padat", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "PBN", name: "PBN (Pupuk BerNutrisi)", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "PBD-C", name: "Pupuk Booster Durian Cair 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PBD-C1", name: "Pupuk Booster Durian Cair 500 ml", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PNG-01", name: "Pupuk Nava Grow", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PNG-02", name: "Pupuk Nema Grow", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "VN", name: "VENUS", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BS-F", name: "Booster Fortune", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "DR-25", name: "DARA 250 ML", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "DR-1L", name: "DARA 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "FRT", name: "FORTUNE", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "GMX", name: "GLUMAX", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "MTH-1", name: "Metahara 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "MTH-AC", name: "Metahara Padat", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "PT-N", name: "PAKET NUTRISI TANAMAN", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "RB", name: "RATU BUMI", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "VRT-N", name: "VERTI NPK", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "VRT-O", name: "Verti Orchid 250 ML", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "VRT-SP", name: "Verti Spray", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "VTR-C", name: "VERTI-CALS", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "VRT-K", name: "VERTI-K", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "ZEO-G", name: "ZEO GREEN 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BCS", name: "BIO CAKRA SPRAY 500 ML", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BL-C", name: "BLACK MAGIC", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "MKZ", name: "Mikoriza", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "MOL", name: "Molase", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "SNN", name: "Pupuk SNN", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "RPL", name: "Rootplant", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "X-PDR", name: "X-Pander", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "CAL-AM", name: "CALSIMAX AYAM (HIJAU)", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "CAL-BR", name: "CALSIMAX BURUNG (MURAI MERAH)", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "CAL-KR", name: "CALSIMAX KERANG", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "CAL-PB", name: "CALSIMAX PEMAKAN BIJI (BIRU)", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "CAL-R", name: "CALSIMAX REPTIL", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "CAL-MR", name: "CALSIMAX RUMINANSIA", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "CAL-ST", name: "CALSIMAX SOTONG", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "GRN-CAL", name: "GREEN CALCIUM", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "FRT-G", name: "Fruttagro Nutrisi Tanaman Buah 20Gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "HRTN-D1", name: "HortinD ZPT 100cc", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "HRTN-D5", name: "HortinD ZPT 500cc", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "KLS-G", name: "Pupuk Kalsium Kalsi Gro 98 1Kg", price: 0, discountPrice: 0, hpp: 0, satuan: "Kg", stock: 0 },
  { id: "SAN-01", name: "Pupuk SAN Starkit Kesuburan 1000Gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "SAN-02", name: "Pupuk SAN Starkit Kesuburan 250Gr", price: 0, discountPrice: 0, hpp: 0, satuan: "Gram", stock: 0 },
  { id: "SNN-G", name: "SNN GOLD Kitatanam Pupuk Organik Cair 1L", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PHC-PCM", name: "PHC Pucamadu", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "POC-DC", name: "POC-Decka", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "TBR-M", name: "TABUR MAS", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "FRT-N1", name: "Fortune Non Label 1 Liter", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "FRT-N2", name: "Fortune Non Label 500 ml", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "BP-1", name: "Benih Pakcoy", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BP-M", name: "Benih pakcoy Masbro", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "BP-P", name: "Benih pakcoy Panah Merah", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "JWR-B", name: "Jawara Breeding", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "JWR-M", name: "Jawara Medica", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "JWR-P", name: "Jawara Probiotic", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "JWR-S", name: "Jawara Stamina", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "KVC", name: "Keikivick", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PBS-25", name: "Paket Benih Sayuran 25", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "PBS-40", name: "Paket Benih Sayuran 40", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 },
  { id: "H-PGB", name: "Plant Growth Bost ", price: 0, discountPrice: 0, hpp: 0, satuan: "Botol", stock: 0 },
  { id: "PB-20", name: "Planter Bag 20LT", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "PB-35", name: "Planter Bag 35LT", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "PB-75", name: "Planter Bag 75LT", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "PB-100", name: "Planter Bag 100LT", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "PA-K", name: "Pot Anggrek Kerucut", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "PA-L", name: "Pot Anggrek Lingkaran", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "PA-SL", name: "Pot Anggrek Setengah Lingkaran ", price: 0, discountPrice: 0, hpp: 0, satuan: "Pcs", stock: 0 },
  { id: "SBP-1", name: "Simbios Booster Plus (hayuta)", price: 0, discountPrice: 0, hpp: 0, satuan: "Pack", stock: 0 }
];

export const INITIAL_BANKS: Bank[] = [
  { id: 'b1', name: 'BCA' }, { id: 'b2', name: 'MANDIRI' }, { id: 'b3', name: 'CASH' }
];

export const INITIAL_EXPEDITIONS: Expedition[] = [
  { id: 'e11', name: 'JNE' },
  { id: 'e13', name: 'JNT' },
  { id: 'e26', name: 'SPXpress' }
];

export const INITIAL_LEADS: Lead[] = [
  { id: 'lead-fb', source: 'Facebook Ads', city: 'Pusat' },
  { id: 'lead-mp', source: 'Marketplace', city: 'Default' },
  { id: 'lead-wa', source: 'WhatsApp CS 1', city: 'Default' },
  { id: 'lead-tt', source: 'TikTok Shop', city: 'Pusat' }
];

export const INITIAL_SALES: FullSaleRecord[] = [
  {
    id: 'S-1001',
    tanggal: '2024-06-01',
    qty: 3,
    nama_barang: 'ASN & AH-MAT (Mixed Bundle)',
    harga_satuan: 51333,
    jumlah: 154000,
    status_pembayaran: 'TRANSFER',
    nama_bank: 'BCA',
    asal_leads: 'Facebook Ads',
    asal_kota: 'Surabaya',
    hpp_satuan: 24666,
    jml_hpp: 74000,
    ongkir_pembeli: 0,
    laba: 80000,
    biaya_admin: 5000,
    ongkir_pengiriman: 12000,
    no_pesanan: 'ORD-MULTI-001',
    ekspedisi: 'JNE',
    status: SettlementStatus.DIPROSES,
    tgl_cair: '',
    mp_marketplace: 'WA IM3',
    nama_pembeli: 'Andi Pratama',
    akun_pembeli: 'andi_prat',
    alamat_pembeli: 'Jl. Gubeng No. 12, Surabaya',
    no_hp_cust: '081299887766',
    resi_kode_booking: 'RESI-MULTI-1122',
    date: '2024-06-01',
    orderNumber: 'ORD-MULTI-001',
    customerName: 'Andi Pratama',
    customerPhone: '081299887766',
    statusCair: SettlementStatus.DIPROSES,
    expeditionId: 'e11',
    trackingNumber: 'RESI-MULTI-1122',
    marketplaceAccount: 'WA IM3',
    totalJual: 154000,
    profit: 80000,
    bankId: 'b1',
    items: [
      { productId: 'ASN', qty: 2, unitPrice: 48000, hppPerUnit: 22000 },
      { productId: 'AH-MAT', qty: 1, unitPrice: 58000, hppPerUnit: 30000 }
    ]
  }
];

export const INITIAL_PACKING_LISTS: PackingListRecord[] = [];
