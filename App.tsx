
import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SalesModule from './components/SalesModule';
import PaymentModule from './components/PaymentModule';
import ShippingModule from './components/ShippingModule';
import PackingQueueModule from './components/PackingQueueModule';
import PackingListModule from './components/PackingListModule';
import MasterDataModule from './components/MasterDataModule';
import StockModule from './components/StockModule';
import EmployeeModule from './components/EmployeeModule';
import AttendanceModule from './components/AttendanceModule';
import ContentModule from './components/ContentModule';
import { RefreshCcw, X, ShieldCheck, ShoppingCart, Boxes, Clapperboard } from 'lucide-react';
import { 
  INITIAL_SALES, INITIAL_PRODUCTS, INITIAL_BANKS, INITIAL_EXPEDITIONS, 
  INITIAL_LEADS, INITIAL_MARKETPLACES, INITIAL_CITIES, INITIAL_PAYMENT_STATUS_OPTIONS,
  INITIAL_EMPLOYEES, INITIAL_ROLES, INITIAL_SCHEDULES, INITIAL_UNITS, INITIAL_PACKING_LISTS
} from './db';
import { 
  FullSaleRecord, Product, Bank, Expedition, Lead, MarketplaceAccount, 
  City, PaymentStatusOption, PackingListRecord, DailyInventory, 
  Employee, UserRole, Role, WorkSchedule, Attendance, 
  LeaveRequest, OfficeConfig, ProductUnit, InventoryAuditLog, SaleAuditLog, SettlementStatus,
  MasterAkun, MasterPlatform, MasterJenisKonten, LaporanBulananKonten,
  LaporanProduksiHarian, LaporanPerformaHarian, ContentAuditLog, LeaveStatus, AttendanceStatus
} from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(INITIAL_EMPLOYEES[0] || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const [sales, setSales] = useState<FullSaleRecord[]>(INITIAL_SALES);
  const [saleLogs, setSaleLogs] = useState<SaleAuditLog[]>([]);
  const [packingRecords, setPackingRecords] = useState<PackingListRecord[]>(INITIAL_PACKING_LISTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productUnits, setProductUnits] = useState<ProductUnit[]>(INITIAL_UNITS);
  const [dailyInventories, setDailyInventories] = useState<DailyInventory[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryAuditLog[]>([]);
  
  // --- CONTENT MODULE STATES ---
  const [masterAkun, setMasterAkun] = useState<MasterAkun[]>([
    { id_akun: 'ACC-01', nama_akun: '@indonesiaorganik', id_karyawan: 'emp3' },
    { id_akun: 'ACC-02', nama_akun: '@pupuk_distributor', id_karyawan: 'emp3' }
  ]);
  const [masterPlatform, setMasterPlatform] = useState<MasterPlatform[]>([
    { id_platform: 'PLAT-01', nama_platform: 'Instagram' },
    { id_platform: 'PLAT-02', nama_platform: 'TikTok' },
    { id_platform: 'PLAT-03', nama_platform: 'Facebook' }
  ]);
  const [masterJenisKonten, setMasterJenisKonten] = useState<MasterJenisKonten[]>([
    { id_jenis_konten: 'TYPE-01', nama_jenis_konten: 'Edu-Content' },
    { id_jenis_konten: 'TYPE-02', nama_jenis_konten: 'Hard Selling' },
    { id_jenis_konten: 'TYPE-03', nama_jenis_konten: 'Behind The Scenes' }
  ]);
  const [laporanBulanan, setLaporanBulanan] = useState<LaporanBulananKonten[]>([]);
  const [laporanProduksi, setLaporanProduksi] = useState<LaporanProduksiHarian[]>([]);
  const [laporanPerforma, setLaporanPerforma] = useState<LaporanPerformaHarian[]>([]);
  const [contentLogs, setContentLogs] = useState<ContentAuditLog[]>([]);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [schedules, setSchedules] = useState<WorkSchedule[]>(INITIAL_SCHEDULES);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const [banks, setBanks] = useState<Bank[]>(INITIAL_BANKS);
  const [expeditions, setExpeditions] = useState<Expedition[]>(INITIAL_EXPEDITIONS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [marketplaces, setMarketplaces] = useState<MarketplaceAccount[]>(INITIAL_MARKETPLACES);
  const [cities, setCities] = useState<City[]>(INITIAL_CITIES);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatusOption[]>(INITIAL_PAYMENT_STATUS_OPTIONS);
  
  const [officeConfig, setOfficeConfig] = useState<OfficeConfig>({
    lat: -7.712094242672099, lng: 109.74015939318106, radius: 500, addressName: 'Grha Indonesia Organik'
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addContentLog = useCallback((aksi: 'Tambah' | 'Edit' | 'Hapus' | 'Ekspor', halaman: string, detail: string) => {
    const log: ContentAuditLog = {
      id: `CLOG-${Date.now()}`,
      tanggal_waktu: new Date().toLocaleString('id-ID'),
      nama_user: currentUser?.fullName || 'System',
      role_user: currentUser?.roleId || 'unknown',
      aksi,
      nama_halaman: halaman,
      detail_perubahan: detail
    };
    setContentLogs(prev => [log, ...prev]);
  }, [currentUser]);

  const handleUpdateLeaveStatus = (id: string, status: LeaveStatus, note?: string, updatedFull?: Partial<LeaveRequest>) => {
    const leave = leaveRequests.find(r => r.id_izin === id);
    if (!leave) return;

    // 1. Update Leave Request
    setLeaveRequests(prev => prev.map(r => r.id_izin === id ? { ...r, ...updatedFull, status, catatan_admin: note } : r));

    // 2. Jika Disetujui, Buat Record Absensi Otomatis untuk range tanggal tersebut
    if (status === LeaveStatus.APPROVED) {
      const dates: string[] = [];
      let start = new Date(updatedFull?.tanggal_mulai || leave.tanggal_mulai);
      let end = new Date(updatedFull?.tanggal_selesai || leave.tanggal_selesai);
      
      while(start <= end) {
        dates.push(start.toISOString().split('T')[0]);
        start.setDate(start.getDate() + 1);
      }

      const statusAbsen = (updatedFull?.jenis_izin || leave.jenis_izin).toUpperCase() as any;

      const newAtts = dates.map(d => ({
        id: `ATT-AUTO-${id}-${d}`,
        employeeId: leave.id_karyawan,
        tanggal: d,
        status_absen: statusAbsen,
        alamat_lokasi: 'OFF-CAMPUS (AUTHORIZED LEAVE)',
        created_at: new Date().toISOString()
      }));

      // Filter yang sudah ada (tindih jika ada)
      setAttendances(prev => {
        const filtered = prev.filter(a => !newAtts.some(na => na.tanggal === a.tanggal && na.employeeId === a.employeeId));
        return [...filtered, ...newAtts];
      });
    }

    // 3. Jika Dibatalkan/Ditolak, Hapus record absensi otomatis terkait
    if (status === LeaveStatus.REJECTED) {
      setAttendances(prev => prev.filter(a => !a.id.startsWith(`ATT-AUTO-${id}`)));
    }
  };

  const handleAddSale = (newSale: any) => {
    setSales(prev => [newSale, ...prev]);
    if (newSale.status === SettlementStatus.DIPROSES) {
      const autoPackingRecord: PackingListRecord = {
        id: `PL-AUTO-${Date.now()}`,
        tanggal: newSale.tanggal || new Date().toISOString().split('T')[0],
        namaCustomer: newSale.nama_pembeli || 'Customer Umum',
        noHp: newSale.no_hp_cust || '',
        orderVia: newSale.mp_marketplace || 'Direct',
        kurir: newSale.ekspedisi || 'Kurir Toko',
        totalNota: 1,
        details: newSale.items?.map((item: any) => ({
          id: `PD-${Math.random()}`,
          packingId: '',
          namaBarang: products.find(p => p.id === item.productId)?.name || 'Item Tidak Terdaftar',
          jumlah: item.qty,
          satuan: products.find(p => p.id === item.productId)?.satuan || 'Pcs'
        })) || [],
        orderIds: [newSale.no_pesanan],
        keterangan: 'Otomatis via Penjualan'
      };
      setPackingRecords(prev => [autoPackingRecord, ...prev]);
      showNotification(`Transaksi ${newSale.no_pesanan} otomatis masuk antrean packing!`, 'success');
    }
  };

  const handleUpdateSale = (id: string, updatedData: any) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const handleDeleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const handleAddInventory = (inv: DailyInventory) => {
    setDailyInventories(prev => [inv, ...prev]);
    setProducts(prev => prev.map(p => 
      p.id === inv.barang_id 
        ? { ...p, stock: p.stock + inv.barang_masuk - inv.barang_keluar } 
        : p
    ));
  };

  const handleUpdateInventory = (id: string, newInv: DailyInventory) => {
    const oldInv = dailyInventories.find(i => i.id === id);
    if (!oldInv) return;
    setDailyInventories(prev => prev.map(i => i.id === id ? newInv : i));
    setProducts(prev => prev.map(p => {
      if (p.id === newInv.barang_id) {
        const restoredStock = p.stock - (oldInv.barang_masuk - oldInv.barang_keluar);
        return { ...p, stock: restoredStock + (newInv.barang_masuk - newInv.barang_keluar) };
      }
      return p;
    }));
  };

  const handleDeleteInventory = (id: string) => {
    const inv = dailyInventories.find(i => i.id === id);
    if (!inv) return;
    setDailyInventories(prev => prev.filter(i => i.id !== id));
    setProducts(prev => prev.map(p => p.id === inv.barang_id ? { ...p, stock: p.stock - (inv.barang_masuk - inv.barang_keluar) } : p));
  };

  const handleProcessPacking = (sale: FullSaleRecord) => {
    const orderNum = sale.no_pesanan || sale.orderNumber || '';
    if (packingRecords.some(r => r.orderIds?.includes(orderNum))) {
      showNotification('Pesanan sudah terdaftar di Packing List', 'error');
      return;
    }
    const newRecord: PackingListRecord = {
      id: `PL-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      namaCustomer: sale.nama_pembeli || sale.customerName || '',
      noHp: sale.no_hp_cust || sale.customerPhone || '',
      orderVia: sale.mp_marketplace || sale.marketplaceAccount || '',
      kurir: expeditions.find(e => e.id === sale.expeditionId)?.name || sale.ekspedisi || 'Kurir',
      totalNota: 1,
      details: sale.items?.map(item => ({
        id: `PD-${Math.random()}`,
        packingId: '',
        namaBarang: products.find(p => p.id === item.productId)?.name || 'Produk',
        jumlah: item.qty,
        satuan: products.find(p => p.id === item.productId)?.satuan || 'Pcs'
      })) || [],
      orderIds: [orderNum],
      keterangan: 'Manual via Antrean'
    };
    setPackingRecords(prev => [newRecord, ...prev]);
    showNotification(`Pesanan ${sale.nama_pembeli || sale.customerName} berhasil masuk antrean cetak!`, 'success');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white flex-col gap-6">
        <RefreshCcw className="animate-spin text-indigo-500" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing MarketFlow Security Context...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard sales={sales} products={products} leads={leads} />;
      case 'sales': return <SalesModule sales={sales} saleLogs={saleLogs} products={products} banks={banks} leads={leads} expeditions={expeditions} marketplaces={marketplaces} cities={cities} paymentStatuses={paymentStatuses} onAddSale={handleAddSale} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onNotify={showNotification} />;
      case 'payments': return <PaymentModule sales={sales} banks={banks} onUpdateSale={handleUpdateSale} onNotify={showNotification} />;
      case 'stock': return <StockModule products={products} dailyInventories={dailyInventories} inventoryLogs={inventoryLogs} onAddInventory={handleAddInventory} onUpdateInventory={handleUpdateInventory} onDeleteInventory={handleDeleteInventory} onNotify={showNotification} employees={employees} />;
      case 'content': return <ContentModule 
          employees={employees}
          currentUser={currentUser}
          masterAkun={masterAkun}
          masterPlatform={masterPlatform}
          masterJenisKonten={masterJenisKonten}
          laporanBulanan={laporanBulanan}
          laporanProduksi={laporanProduksi}
          laporanPerforma={laporanPerforma}
          logs={contentLogs}
          onUpdateMasterAkun={setMasterAkun}
          onUpdateMasterPlatform={setMasterPlatform}
          onUpdateMasterJenisKonten={setMasterJenisKonten}
          onUpdateBulanan={setLaporanBulanan}
          onUpdateProduksi={setLaporanProduksi}
          onUpdatePerforma={setLaporanPerforma}
          onAddLog={addContentLog}
          onNotify={showNotification} 
        />;
      case 'packing-queue': return <PackingQueueModule sales={sales} products={products} expeditions={expeditions} packingRecords={packingRecords} onNotify={showNotification} onProcessPacking={handleProcessPacking} />;
      case 'packing-list': return <PackingListModule packingRecords={packingRecords} onAdd={() => {}} onEdit={(id, d) => setPackingRecords(prev => prev.map(r => r.id === id ? {...r, ...d} : r))} onDelete={(id) => setPackingRecords(prev => prev.filter(r => r.id !== id))} onNotify={showNotification} />;
      case 'shipping': return <ShippingModule sales={sales} expeditions={expeditions} onUpdateSale={handleUpdateSale} onNotify={showNotification} />;
      case 'employees': return <EmployeeModule employees={employees} roles={roles} schedules={schedules} onAddEmployee={(e) => setEmployees(prev => [...prev, e])} onUpdateEmployee={(id, e) => setEmployees(prev => prev.map(x => x.id === id ? e : x))} onDeleteEmployee={(id) => setEmployees(prev => prev.filter(x => x.id !== id))} onAddRole={(r) => setRoles(prev => [...prev, r])} onUpdateRole={(id, r) => setRoles(prev => prev.map(x => x.id === id ? r : x))} onDeleteRole={(id) => setRoles(prev => prev.filter(x => x.id !== id))} onAddSchedule={(s) => setSchedules(prev => [...prev, s])} onUpdateSchedule={(id, s) => setSchedules(prev => prev.map(x => x.id === id ? s : x))} onNotify={showNotification} />;
      case 'attendance': return <AttendanceModule currentEmployee={currentUser} attendances={attendances} schedules={schedules} employees={employees} leaveRequests={leaveRequests} roles={roles} isAdmin={currentUser.roleId === UserRole.SUPERADMIN} onSaveAttendance={(a) => setAttendances(prev => { const other = prev.filter(x => x.employeeId !== a.employeeId || x.tanggal !== a.tanggal); return [...other, a]; })} onManualAttendance={(a) => setAttendances(prev => [...prev, a])} onAddLeave={(l) => setLeaveRequests(prev => [...prev, l])} onUpdateLeaveStatus={handleUpdateLeaveStatus} onNotify={showNotification} officeConfig={officeConfig} />;
      case 'master': return <MasterDataModule products={products} productUnits={productUnits} banks={banks} expeditions={expeditions} leads={leads} marketplaces={marketplaces} cities={cities} paymentStatuses={paymentStatuses} onAddProduct={(p) => setProducts(prev => [...prev, p])} onUpdateProduct={(id, p) => setProducts(prev => prev.map(x => x.id === id ? p : x))} onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))} onAddUnit={(u) => setProductUnits(prev => [...prev, u])} onUpdateUnit={(id, u) => setProductUnits(prev => prev.map(x => x.id === id ? u : x))} onDeleteUnit={(id) => setProductUnits(prev => prev.filter(x => x.id !== id))} onAddBank={(b) => setBanks(prev => [...prev, b])} onUpdateBank={(id, b) => setBanks(prev => prev.map(x => x.id === id ? b : x))} onDeleteBank={(id) => setBanks(prev => prev.filter(x => x.id !== id))} onAddExpedition={(e) => setExpeditions(prev => [...prev, e])} onUpdateExpedition={(id, e) => setExpeditions(prev => prev.map(x => x.id === id ? e : x))} onDeleteExpedition={(id) => setExpeditions(prev => prev.filter(x => x.id !== id))} onAddLead={(l) => setLeads(prev => [...prev, l])} onUpdateLead={(id, l) => setLeads(prev => prev.map(x => x.id === id ? l : x))} onDeleteLead={(id) => setLeads(prev => prev.filter(x => x.id !== id))} onAddMarketplace={(m) => setMarketplaces(prev => [...prev, m])} onUpdateMarketplace={(id, m) => setMarketplaces(prev => prev.map(x => x.id === id ? m : x))} onDeleteMarketplace={(id) => setMarketplaces(prev => prev.filter(x => x.id !== id))} onAddCity={(c) => setCities(prev => [...prev, c])} onUpdateCity={(id, c) => setCities(prev => prev.map(x => x.id === id ? c : x))} onDeleteCity={(id) => setCities(prev => prev.filter(x => x.id !== id))} onAddPaymentStatus={(ps) => setPaymentStatuses(prev => [...prev, ps])} onUpdatePaymentStatus={(id, ps) => setPaymentStatuses(prev => prev.map(x => x.id === id ? ps : x))} onDeletePaymentStatus={(id) => setPaymentStatuses(prev => prev.filter(x => x.id !== id))} officeConfig={officeConfig} onUpdateOfficeConfig={setOfficeConfig} onNotify={showNotification} />;
      default: return <Dashboard sales={sales} products={products} leads={leads} />;
    }
  };

  const handleSwitchUser = (role: UserRole) => {
    const user = INITIAL_EMPLOYEES.find(e => e.roleId === role) || INITIAL_EMPLOYEES[0];
    setCurrentUser(user);
    if (role === UserRole.TIM_KONTEN) setActiveTab('content');
    else if (role === UserRole.TIM_MARKETPLACE) setActiveTab('sales');
    else if (role === UserRole.TIM_PACKING) setActiveTab('packing-queue');
    else setActiveTab('dashboard');
    showNotification(`Simulasi Akun: ${user?.fullName || 'Guest'}`, 'success');
    setIsDemoMenuOpen(false);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.roleId as any} userName={currentUser.fullName}>
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[999] flex flex-col items-end pointer-events-none">
         <div className={`mb-4 flex flex-col gap-3 transition-all duration-500 origin-bottom-right ${isDemoMenuOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'}`}>
            <div className="bg-slate-900/95 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col gap-2.5 min-w-[240px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 border-b border-white/5 pb-2 mb-2">Pilih Role Simulasi</p>
                <DemoRoleButton label="Superadmin" icon={ShieldCheck} active={currentUser.roleId === UserRole.SUPERADMIN} onClick={() => handleSwitchUser(UserRole.SUPERADMIN)} gradient="from-indigo-600 to-indigo-800" />
                <DemoRoleButton label="Marketplace" icon={ShoppingCart} active={currentUser.roleId === UserRole.TIM_MARKETPLACE} onClick={() => handleSwitchUser(UserRole.TIM_MARKETPLACE)} gradient="from-emerald-500 to-emerald-700" />
                <DemoRoleButton label="Packing" icon={Boxes} active={currentUser.roleId === UserRole.TIM_PACKING} onClick={() => handleSwitchUser(UserRole.TIM_PACKING)} gradient="from-blue-500 to-indigo-600" />
                <DemoRoleButton label="Konten" icon={Clapperboard} active={currentUser.roleId === UserRole.TIM_KONTEN} onClick={() => handleSwitchUser(UserRole.TIM_KONTEN)} gradient="from-pink-500 to-rose-600" />
            </div>
         </div>
         <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDemoMenuOpen(!isDemoMenuOpen);
            }} 
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-700 border-4 border-white pointer-events-auto active:scale-90 touch-none ${isDemoMenuOpen ? 'bg-rose-500 rotate-[360deg]' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Toggle Simulation Menu"
         >
            {isDemoMenuOpen ? <X size={28} className="text-white" /> : <RefreshCcw size={28} className="text-white" />}
         </button>
      </div>

      {notification && (
        <div className={`fixed top-24 right-10 z-[100] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 flex items-center gap-3 font-black text-xs uppercase tracking-widest ${notification.type === 'success' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
          {notification.message}
        </div>
      )}

      <div key={activeTab} className="w-full">
        {renderContent()}
      </div>
    </Layout>
  );
};

const DemoRoleButton = ({ label, icon: Icon, onClick, active, gradient }: any) => (
  <button 
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }} 
    className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all border border-white/5 text-left w-full pointer-events-auto active:scale-95 ${active ? 'bg-white/10 ring-2 ring-indigo-500' : 'hover:bg-white/5'}`}
  >
     <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}><Icon size={14} /></div>
     <p className={`text-[10px] font-black uppercase tracking-widest flex-1 ${active ? 'text-white' : 'text-slate-400'}`}>{label}</p>
  </button>
);

export default App;
