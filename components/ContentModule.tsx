
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Clapperboard, Plus, Calendar, FileText, BarChart3, 
  History, Search, Edit3, Trash2, Download, Save, X, 
  Smartphone, Globe, Info, LayoutGrid, Monitor, 
  Video, TrendingUp, Settings, ChevronDown, 
  FileSpreadsheet, Activity, Database, Trash, ShieldAlert,
  User as UserIcon, Filter, RotateCcw, ChevronLeft, ChevronRight,
  Eye, CheckCircle2, LayoutDashboard, Heart, MessageSquare, Share2, 
  ShoppingBag, Zap, Award
} from 'lucide-react';
import { 
  Employee, MasterAkun, MasterPlatform, MasterJenisKonten, 
  LaporanBulananKonten, LaporanProduksiHarian, LaporanPerformaHarian, 
  ContentAuditLog, ContentProgressStatus, ContentUploadStatus, ContentFinalStatus, UserRole
} from '../types';

interface ContentModuleProps {
  employees: Employee[];
  currentUser: Employee;
  masterAkun: MasterAkun[];
  masterPlatform: MasterPlatform[];
  masterJenisKonten: MasterJenisKonten[];
  laporanBulanan: LaporanBulananKonten[];
  laporanProduksi: LaporanProduksiHarian[];
  laporanPerforma: LaporanPerformaHarian[];
  logs: ContentAuditLog[];
  onUpdateMasterAkun: (data: MasterAkun[]) => void;
  onUpdateMasterPlatform: (data: MasterPlatform[]) => void;
  onUpdateMasterJenisKonten: (data: MasterJenisKonten[]) => void;
  onUpdateBulanan: (data: LaporanBulananKonten[]) => void;
  onUpdateProduksi: (data: LaporanProduksiHarian[]) => void;
  onUpdatePerforma: (data: LaporanPerformaHarian[]) => void;
  onAddLog: (aksi: 'Tambah' | 'Edit' | 'Hapus' | 'Ekspor', halaman: string, detail: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

type MainTab = 'dashboard' | 'bulanan' | 'produksi' | 'performa' | 'logs' | 'master';

const ContentModule: React.FC<ContentModuleProps> = ({
  employees, currentUser, masterAkun, masterPlatform, masterJenisKonten,
  laporanBulanan, laporanProduksi, laporanPerforma, logs,
  onUpdateMasterAkun, onUpdateMasterPlatform, onUpdateMasterJenisKonten,
  onUpdateBulanan, onUpdateProduksi, onUpdatePerforma, onAddLog, onNotify
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [masterSubTab, setMasterSubTab] = useState<'akun' | 'platform' | 'jenis'>('akun');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [filterPic, setFilterPic] = useState('');
  const [filterLogUser, setFilterLogUser] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const tabsRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.roleId === UserRole.SUPERADMIN;
  const isContentAdmin = currentUser.roleId === UserRole.TIM_KONTEN;

  // Daftar ID Akun yang dikelola oleh user aktif
  const myManagedAccountIds = useMemo(() => {
    return masterAkun.filter(a => a.id_karyawan === currentUser.id).map(a => a.id_akun);
  }, [masterAkun, currentUser.id]);

  // Statistik Dashboard
  const dashboardStats = useMemo(() => {
    const isFiltered = !isAdmin;
    const filterFn = (item: any) => !isFiltered || (item.id_akun && myManagedAccountIds.includes(item.id_akun));

    const totalPublish = laporanBulanan.filter(item => filterFn(item) && item.status_akhir === ContentFinalStatus.TERPUBLISH).length;
    const totalProduksi = laporanProduksi.filter(filterFn).length;
    const inProgress = laporanProduksi.filter(item => filterFn(item) && item.status_upload !== ContentUploadStatus.TERUPLOAD).length;
    
    const performanceData = laporanPerforma.filter(filterFn);
    const totalViews = performanceData.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = performanceData.reduce((acc, curr) => acc + (curr.like || 0), 0);
    const totalOrders = performanceData.reduce((acc, curr) => acc + (curr.order_dari_konten || 0), 0);

    // Summary per Akun
    const accountSummary = masterAkun.filter(a => !isFiltered || a.id_karyawan === currentUser.id).map(acc => {
      const perf = laporanPerforma.filter(p => p.id_akun === acc.id_akun);
      return {
        id: acc.id_akun,
        nama: acc.nama_akun,
        views: perf.reduce((a, c) => a + (c.views || 0), 0),
        orders: perf.reduce((a, c) => a + (c.order_dari_konten || 0), 0),
        count: laporanBulanan.filter(b => b.id_akun === acc.id_akun && b.status_akhir === ContentFinalStatus.TERPUBLISH).length
      };
    }).sort((a, b) => b.views - a.views);

    return { totalPublish, totalProduksi, inProgress, totalViews, totalLikes, totalOrders, accountSummary };
  }, [laporanBulanan, laporanProduksi, laporanPerforma, masterAkun, isAdmin, myManagedAccountIds, currentUser.id]);

  // Filter data master berdasarkan kepemilikan jika bukan superadmin
  const filteredMasterData = useMemo(() => {
    if (masterSubTab === 'akun') {
      return isAdmin ? masterAkun : masterAkun.filter(a => a.id_karyawan === currentUser.id);
    }
    if (masterSubTab === 'platform') return masterPlatform;
    return masterJenisKonten;
  }, [masterSubTab, masterAkun, masterPlatform, masterJenisKonten, isAdmin, currentUser.id]);

  useEffect(() => {
    if (isContentAdmin && (activeTab === 'logs')) {
      setActiveTab('bulanan');
    }
  }, [activeTab, isContentAdmin]);

  const normalizeLogDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(',')[0].split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return '';
    } catch (e) { return ''; }
  };

  const filteredBulanan = useMemo(() => {
    return laporanBulanan.filter(item => {
      const ownership = isAdmin || myManagedAccountIds.includes(item.id_akun);
      const picMatch = !filterPic || item.id_karyawan === filterPic;
      const matchSearch = item.tema_konten.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = (!startDate || item.tanggal >= startDate) && (!endDate || item.tanggal <= endDate);
      return ownership && picMatch && matchSearch && matchDate;
    }).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
  }, [laporanBulanan, searchQuery, startDate, endDate, isAdmin, myManagedAccountIds, filterPic]);

  const filteredProduksi = useMemo(() => {
    return laporanProduksi.filter(item => {
      const ownership = isAdmin || myManagedAccountIds.includes(item.id_akun);
      const picMatch = !filterPic || item.id_karyawan === filterPic;
      const matchSearch = item.ide_konten.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = (!startDate || item.tanggal >= startDate) && (!endDate || item.tanggal <= endDate);
      return ownership && picMatch && matchSearch && matchDate;
    }).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
  }, [laporanProduksi, searchQuery, startDate, endDate, isAdmin, myManagedAccountIds, filterPic]);

  const filteredPerforma = useMemo(() => {
    return laporanPerforma.filter(item => {
      const ownership = isAdmin || myManagedAccountIds.includes(item.id_akun);
      const picMatch = !filterPic || item.id_karyawan === filterPic;
      const matchSearch = item.tema_konten.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = (!startDate || item.tanggal >= startDate) && (!endDate || item.tanggal <= endDate);
      return ownership && picMatch && matchSearch && matchDate;
    }).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
  }, [laporanPerforma, searchQuery, startDate, endDate, isAdmin, myManagedAccountIds, filterPic]);

  const filteredLogs = useMemo(() => {
    if (!isAdmin) return [];
    return logs.filter(log => {
      const logDateComp = normalizeLogDate(log.tanggal_waktu);
      const matchDate = (!startDate || logDateComp >= startDate) && (!endDate || logDateComp <= endDate);
      const matchUser = !filterLogUser || log.nama_user === filterLogUser;
      const matchSearch = !searchQuery || 
                         log.detail_perubahan.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.nama_halaman.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.aksi.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate && matchUser && matchSearch;
    });
  }, [logs, startDate, endDate, isAdmin, filterLogUser, searchQuery]);

  const handleExport = (type: string, data: any[]) => {
    if (data.length === 0) return onNotify('Tidak ada data untuk diekspor', 'error');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MarketFlow_Content_${type}_${new Date().toISOString()}.csv`;
    link.click();
    onAddLog('Ekspor', type, `Mengekspor ${data.length} baris data ke format CSV.`);
    onNotify('Ekspor berhasil');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilterPic('');
    setFilterLogUser('');
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getEmpName = (id?: string) => employees.find(e => e.id === id)?.fullName || id || '-';
  const getAccName = (id: string) => masterAkun.find(a => a.id_akun === id)?.nama_akun || id;
  const getPlatName = (id: string) => masterPlatform.find(p => p.id_platform === id)?.nama_platform || id;
  const getTypeName = (id: string) => masterJenisKonten.find(t => t.id_jenis_konten === id)?.nama_jenis_konten || id;

  const generateDiffDetail = (oldData: any, newData: any, type: string) => {
    const changes: string[] = [];
    const fieldsToTrack = {
      bulanan: ['tanggal', 'id_akun', 'id_platform', 'tema_konten', 'id_jenis_konten', 'status_akhir'],
      produksi: ['tanggal', 'id_akun', 'id_platform', 'ide_konten', 'status_skrip', 'status_shooting', 'status_editing', 'status_upload'],
      performa: ['tanggal', 'id_akun', 'tema_konten', 'views', 'like', 'comment', 'share', 'save', 'order_dari_konten']
    };

    const labels: any = {
      tanggal: 'Tgl', id_akun: 'Akun', id_platform: 'Plat', tema_konten: 'Tema', ide_konten: 'Ide', 
      id_jenis_konten: 'Jenis', status_akhir: 'Status', status_skrip: 'Skrip', status_shooting: 'Shoot',
      status_editing: 'Edit', status_upload: 'Upload', views: 'Views', like: 'Like', comment: 'Comm',
      share: 'Share', save: 'Save', order_dari_konten: 'Order'
    };

    const resolver = (field: string, val: any) => {
      if (field === 'id_akun') return getAccName(val);
      if (field === 'id_platform') return getPlatName(val);
      if (field === 'id_jenis_konten') return getTypeName(val);
      return val;
    };

    const targetFields = fieldsToTrack[type as keyof typeof fieldsToTrack] || [];
    targetFields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push(`${labels[field] || field}: "${resolver(field, oldData[field])}" -> "${resolver(field, newData[field])}"`);
      }
    });

    return changes.length > 0 ? `Perubahan pada: ${changes.join(', ')}` : 'Tidak ada perubahan data field.';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading uppercase italic flex items-center gap-3">
            <Clapperboard className="text-pink-600" size={32} />
            Manajemen Konten
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 ml-1 underline decoration-pink-500/30">
            {isAdmin ? 'System Control Panel' : `Workspace: ${currentUser.fullName}`}
          </p>
        </div>
        
        <div className="relative group flex items-center">
          <button onClick={() => scrollTabs('left')} className="absolute -left-4 z-10 p-2 bg-white border border-slate-200 rounded-full shadow-md text-slate-400 hover:text-pink-600 lg:hidden"><ChevronLeft size={16}/></button>
          
          <div ref={tabsRef} className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-[85vw] sm:max-w-none">
             <TabItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
             <TabItem active={activeTab === 'bulanan'} onClick={() => setActiveTab('bulanan')} icon={Calendar} label="Lap. Bulanan" />
             <TabItem active={activeTab === 'produksi'} onClick={() => setActiveTab('produksi')} icon={Video} label="Produksi Harian" />
             <TabItem active={activeTab === 'performa'} onClick={() => setActiveTab('performa')} icon={TrendingUp} label="Performa Harian" />
             {isAdmin && <TabItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={History} label="Audit Log" />}
             <TabItem active={activeTab === 'master'} onClick={() => setActiveTab('master')} icon={Settings} label="Master" />
          </div>

          <button onClick={() => scrollTabs('right')} className="absolute -right-4 z-10 p-2 bg-white border border-slate-200 rounded-full shadow-md text-slate-400 hover:text-pink-600 lg:hidden"><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* Main Container */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             {/* Stats Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ContentStatCard label="Total Terpublish" value={dashboardStats.totalPublish} sub="Konten Selesai" icon={CheckCircle2} color="emerald" />
                <ContentStatCard label="Pipeline Produksi" value={dashboardStats.inProgress} sub="Sedang Proses" icon={Zap} color="amber" />
                <ContentStatCard label="Total Reach (Views)" value={dashboardStats.totalViews.toLocaleString()} sub="Akumulasi Jangkauan" icon={BarChart3} color="indigo" />
                <ContentStatCard label="Content Orders" value={dashboardStats.totalOrders} sub="Konversi Penjualan" icon={ShoppingBag} color="pink" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Account Summary Table */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl"><Award size={24}/></div>
                      <div>
                         <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Performa Akun Terbaik</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ranking Berdasarkan Total Views</p>
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                               <th className="pb-4">Nama Akun</th>
                               <th className="pb-4 text-center">Post Selesai</th>
                               <th className="pb-4 text-center">Total Views</th>
                               <th className="pb-4 text-right">Orders</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {dashboardStats.accountSummary.map((acc, idx) => (
                              <tr key={acc.id} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="py-5">
                                    <div className="flex items-center gap-3">
                                       <span className="w-6 h-6 flex items-center justify-center bg-slate-900 text-white rounded-full text-[10px] font-black">{idx+1}</span>
                                       <p className="text-sm font-black text-slate-800 uppercase">{acc.nama}</p>
                                    </div>
                                 </td>
                                 <td className="py-5 text-center font-bold text-slate-500">{acc.count}</td>
                                 <td className="py-5 text-center font-black text-indigo-600">{acc.views.toLocaleString()}</td>
                                 <td className="py-5 text-right font-black text-pink-600">+{acc.orders}</td>
                              </tr>
                            ))}
                            {dashboardStats.accountSummary.length === 0 && (
                              <tr>
                                <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-bold uppercase italic">Belum ada data performa tercatat</td>
                              </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Efficiency Info Card */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                      <TrendingUp size={48} className="text-pink-500 mb-8" />
                      <h4 className="text-2xl font-black uppercase tracking-tight">Health Index</h4>
                      <p className="text-slate-400 text-sm font-bold mt-4 uppercase italic leading-relaxed">
                         {dashboardStats.totalProduksi > 0 
                           ? `Efisiensi produksi mencapai ${Math.round((dashboardStats.totalPublish / dashboardStats.totalProduksi) * 100)}% dari total ide yang masuk.`
                           : 'Mulai input data produksi untuk melihat indeks kesehatan konten.'}
                      </p>
                      <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                         <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Post Ratio</p>
                            <p className="text-xl font-black">{dashboardStats.totalPublish}/{dashboardStats.totalProduksi}</p>
                         </div>
                         <div className="w-px h-10 bg-white/10"></div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Order</p>
                            <p className="text-xl font-black">{(dashboardStats.totalOrders / (dashboardStats.totalPublish || 1)).toFixed(1)}</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                         <Activity size={20} className="text-indigo-600" />
                         <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Aktifitas Terakhir</h4>
                      </div>
                      <div className="space-y-4">
                         {logs.slice(0, 3).map(log => (
                           <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                              <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0"></div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 uppercase leading-tight">{log.detail_perubahan}</p>
                                 <p className="text-[8px] font-bold text-slate-400 mt-1">{log.tanggal_waktu}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Control Toolbar (Only for Data Tabs) */}
        {activeTab !== 'master' && activeTab !== 'dashboard' && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-4 mb-8">
             <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={activeTab === 'logs' ? "Cari detail log atau user..." : "Cari Tema / Ide..."} 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className={`w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white transition-all shadow-inner focus:border-${activeTab === 'logs' ? 'indigo' : 'pink'}-500`} 
                  />
                </div>
                <div className="flex gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  <div className="relative shrink-0">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-pink-500 w-36" />
                  </div>
                  <div className="relative shrink-0">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-pink-500 w-36" />
                  </div>
                  <div className="relative shrink-0">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select 
                      value={activeTab === 'logs' ? filterLogUser : filterPic} 
                      onChange={e => activeTab === 'logs' ? setFilterLogUser(e.target.value) : setFilterPic(e.target.value)} 
                      className="pl-10 pr-8 py-3.5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-pink-500 appearance-none min-w-[150px]"
                    >
                      <option value="">{activeTab === 'logs' ? 'SEMUA USER' : 'SEMUA PIC'}</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={activeTab === 'logs' ? emp.fullName : emp.id}>{emp.fullName.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
                  </div>
                </div>
             </div>
             <div className="flex items-center justify-between border-t border-slate-50 pt-4 px-2">
                <div className="flex items-center gap-4">
                   {(searchQuery || startDate || endDate || filterPic || filterLogUser) && (
                      <button onClick={handleResetFilters} className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all">
                         <RotateCcw size={12}/> Reset Filter
                      </button>
                   )}
                   {activeTab === 'logs' && (
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Menampilkan <span className="text-indigo-600">{filteredLogs.length}</span> Entri Audit</p>
                   )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport(activeTab.toUpperCase(), activeTab === 'bulanan' ? filteredBulanan : activeTab === 'produksi' ? filteredProduksi : activeTab === 'performa' ? filteredPerforma : filteredLogs)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-emerald-600 shadow-sm transition-all text-[10px] font-black uppercase tracking-widest">
                    <Download size={14}/> Export CSV
                  </button>
                  {activeTab !== 'logs' && (
                    <button onClick={() => { setModalMode('add'); setSelectedItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl"><Plus size={16}/> Input Baru</button>
                  )}
                </div>
             </div>
          </div>
        )}

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
        {activeTab === 'bulanan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-6 w-32">Aksi</th>
                  <th className="px-8 py-6">Tanggal</th>
                  <th className="px-8 py-6">PIC</th>
                  <th className="px-8 py-6">Akun & Platform</th>
                  <th className="px-8 py-6">Tema</th>
                  <th className="px-8 py-6">Jenis</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBulanan.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex gap-1">
                        <button onClick={() => { setModalMode('detail'); setSelectedItem(item); setIsModalOpen(true); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Detail"><Eye size={14}/></button>
                        <button onClick={() => { setModalMode('edit'); setSelectedItem(item); setIsModalOpen(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Edit"><Edit3 size={14}/></button>
                        <button onClick={() => { if(confirm('Hapus data ini?')) { 
                          onUpdateBulanan(laporanBulanan.filter(i => i.id !== item.id)); 
                          onAddLog('Hapus', 'Lap. Bulanan', `Hapus: "${item.tema_konten}" pada Akun ${getAccName(item.id_akun)}.`);
                          onNotify('Dihapus'); 
                        }}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 size={14}/></button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{item.tanggal}</td>
                    <td className="px-8 py-5 text-[10px] font-black text-indigo-600 uppercase">{getEmpName(item.id_karyawan)}</td>
                    <td className="px-8 py-5">
                       <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1">{getAccName(item.id_akun)}</p>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{getPlatName(item.id_platform)}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600 truncate max-w-xs">{item.tema_konten}</td>
                    <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase">{getTypeName(item.id_jenis_konten)}</td>
                    <td className="px-8 py-5 text-right">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                         item.status_akhir === ContentFinalStatus.TERPUBLISH ? 'bg-emerald-50 text-emerald-600' :
                         item.status_akhir === ContentFinalStatus.BATAL ? 'bg-rose-50 text-rose-600' : 'bg-slate-100'
                       }`}>{item.status_akhir}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'produksi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-6 w-32">Aksi</th>
                  <th className="px-8 py-6">Tgl / PIC</th>
                  <th className="px-8 py-6">Akun & Platform</th>
                  <th className="px-8 py-6">Ide Konten</th>
                  <th className="px-8 py-6 text-center">Skrip</th>
                  <th className="px-8 py-6 text-center">Shoot</th>
                  <th className="px-8 py-6 text-center">Edit</th>
                  <th className="px-8 py-6 text-right">Upload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProduksi.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                       <div className="flex gap-1">
                          <button onClick={() => { setModalMode('detail'); setSelectedItem(item); setIsModalOpen(true); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Detail"><Eye size={14}/></button>
                          <button onClick={() => { setModalMode('edit'); setSelectedItem(item); setIsModalOpen(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Edit"><Edit3 size={14}/></button>
                          <button onClick={() => { if(confirm('Hapus?')) { 
                            onUpdateProduksi(laporanProduksi.filter(i => i.id !== item.id)); 
                            onAddLog('Hapus', 'Lap. Produksi', `Hapus: "${item.ide_konten}" pada Akun ${getAccName(item.id_akun)}.`);
                            onNotify('Dihapus'); 
                          }}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 size={14}/></button>
                       </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1">{getEmpName(item.id_karyawan)}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{item.tanggal}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1">{getAccName(item.id_akun)}</p>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{getPlatName(item.id_platform)}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600 truncate max-w-xs">{item.ide_konten}</td>
                    <td className="px-8 py-5 text-center"><ProgressBadge status={item.status_skrip} /></td>
                    <td className="px-8 py-5 text-center"><ProgressBadge status={item.status_shooting} /></td>
                    <td className="px-8 py-5 text-center"><ProgressBadge status={item.status_editing} /></td>
                    <td className="px-8 py-5 text-right">
                       <span className={`px-3 py-1 rounded text-[8px] font-black uppercase ${item.status_upload === ContentUploadStatus.TERUPLOAD ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{item.status_upload}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'performa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-6 py-6 w-28">Aksi</th>
                  <th className="px-6 py-6 w-28">Tanggal</th>
                  <th className="px-6 py-6">Akun / PIC</th>
                  <th className="px-6 py-6">Tema</th>
                  <th className="px-6 py-6 text-center">Views</th>
                  <th className="px-6 py-6 text-center">Like</th>
                  <th className="px-6 py-6 text-center bg-indigo-900 text-emerald-400">Order</th>
                  <th className="px-6 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPerforma.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-[11px] font-bold text-slate-700">
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => { setModalMode('detail'); setSelectedItem(item); setIsModalOpen(true); }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Detail"><Eye size={13}/></button>
                        <button onClick={() => { setModalMode('edit'); setSelectedItem(item); setIsModalOpen(true); }} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg" title="Edit"><Edit3 size={13}/></button>
                        <button onClick={() => { if(confirm('Hapus?')) { 
                          onUpdatePerforma(laporanPerforma.filter(i => i.id !== item.id)); 
                          onAddLog('Hapus', 'Lap. Performa', `Hapus performa: "${item.tema_konten}" pada Akun ${getAccName(item.id_akun)}.`);
                          onNotify('Dihapus'); 
                        }}} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 size={13}/></button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{item.tanggal}</td>
                    <td className="px-6 py-4">
                       <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1">{getAccName(item.id_akun)}</p>
                       <span className="text-[9px] font-bold text-indigo-400 uppercase">{getEmpName(item.id_karyawan)}</span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{item.tema_konten}</td>
                    <td className="px-6 py-4 text-center font-black">{item.views.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-black text-rose-500">{item.like.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center bg-indigo-50 font-black text-indigo-700">{item.order_dari_konten}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase border border-emerald-100">LOGGED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'logs' && isAdmin && (
          <div className="overflow-x-auto">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-3">
                   <Activity className="text-indigo-600" size={20}/>
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Security Audit Trails</h3>
                </div>
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Waktu</th>
                      <th className="px-8 py-5">User</th>
                      <th className="px-8 py-5">Role</th>
                      <th className="px-8 py-5">Aksi</th>
                      <th className="px-8 py-5">Halaman</th>
                      <th className="px-8 py-5">Detail Investigasi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredLogs.map(log => (
                     <tr key={log.id} className="text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4 font-mono text-slate-400">{log.tanggal_waktu}</td>
                        <td className="px-8 py-4 text-slate-800 uppercase font-black">{log.nama_user}</td>
                        <td className="px-8 py-4">
                           <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase">{log.role_user.replace('tim_', '')}</span>
                        </td>
                        <td className="px-8 py-4">
                           <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${
                             log.aksi === 'Tambah' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             log.aksi === 'Edit' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             log.aksi === 'Hapus' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-400'
                           }`}>{log.aksi}</span>
                        </td>
                        <td className="px-8 py-4 uppercase text-[9px] font-black text-indigo-400">{log.nama_halaman}</td>
                        <td className="px-8 py-4 italic text-slate-400 leading-relaxed max-w-lg">"{log.detail_perubahan}"</td>
                     </tr>
                   ))}
                   {filteredLogs.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                           <History size={40} className="mx-auto mb-4 opacity-20" />
                           Data log tidak ditemukan
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'master' && (
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4">
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                  <TabItem active={masterSubTab === 'akun'} onClick={() => setMasterSubTab('akun')} icon={Smartphone} label="Nama Akun" isSub />
                  {isAdmin && (
                    <>
                      <TabItem active={masterSubTab === 'platform'} onClick={() => setMasterSubTab('platform')} icon={Globe} label="Platform" isSub />
                      <TabItem active={masterSubTab === 'jenis'} onClick={() => setMasterSubTab('jenis')} icon={LayoutGrid} label="Jenis Konten" isSub />
                    </>
                  )}
               </div>
               
               {isContentAdmin && masterSubTab !== 'akun' && setMasterSubTab('akun')}

               <button onClick={() => { setModalMode('add'); setSelectedItem(null); setIsMasterModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                  <Plus size={14}/> Tambah {masterSubTab.toUpperCase()}
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                       <th className="px-10 py-5 w-32 border-r border-slate-100">Aksi</th>
                       <th className="px-10 py-5">ID Data</th>
                       <th className="px-10 py-5">Nama Data {masterSubTab.toUpperCase()}</th>
                       {masterSubTab === 'akun' && <th className="px-10 py-5">PIC / Penanggung Jawab</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMasterData.map((item: any) => (
                      <tr key={item.id_akun || item.id_platform || item.id_jenis_konten} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-10 py-4 border-r border-slate-50">
                           <div className="flex gap-2">
                              <button onClick={() => { setModalMode('edit'); setSelectedItem(item); setIsMasterModalOpen(true); }} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit3 size={16}/></button>
                              <button onClick={() => {
                                const itemName = item.nama_akun || item.nama_platform || item.nama_jenis_konten;
                                if(confirm(`Hapus data ${itemName}?`)) {
                                  if(masterSubTab === 'akun') onUpdateMasterAkun(masterAkun.filter(a => a.id_akun !== item.id_akun));
                                  else if(masterSubTab === 'platform') onUpdateMasterPlatform(masterPlatform.filter(p => p.id_platform !== item.id_platform));
                                  else onUpdateMasterJenisKonten(masterJenisKonten.filter(j => j.id_jenis_konten !== item.id_jenis_konten));
                                  
                                  onAddLog('Hapus', `Master ${masterSubTab}`, `Menghapus entitas master "${itemName}".`);
                                  onNotify('Data master berhasil dihapus');
                                }
                              }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                           </div>
                        </td>
                        <td className="px-10 py-4 font-mono text-[10px] text-slate-400">#{item.id_akun || item.id_platform || item.id_jenis_konten}</td>
                        <td className="px-10 py-4 font-black text-slate-800 uppercase text-xs tracking-tight">{item.nama_akun || item.nama_platform || item.nama_jenis_konten}</td>
                        {masterSubTab === 'akun' && (
                          <td className="px-10 py-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                              {getEmpName(item.id_karyawan)}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Modal Form remains same... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${modalMode === 'detail' ? 'bg-indigo-600' : 'bg-slate-900'} text-white rounded-2xl flex items-center justify-center shadow-xl`}>
                       {modalMode === 'detail' ? <Eye size={28}/> : (activeTab === 'bulanan' ? <Calendar size={28}/> : activeTab === 'produksi' ? <Video size={28}/> : <TrendingUp size={28}/>)}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {modalMode === 'detail' ? 'Tinjauan Detail Data' : `Formulir Laporan ${activeTab.toUpperCase()}`}
                       </h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1 italic">Authorized Context: {currentUser.fullName}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-10 bg-white">
                 <ReportForm 
                  tab={activeTab} 
                  mode={modalMode} 
                  item={selectedItem} 
                  employees={employees} 
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  masterAkun={masterAkun} 
                  masterPlatform={masterPlatform} 
                  masterJenisKonten={masterJenisKonten}
                  onSave={(data: any) => {
                    if (modalMode === 'detail') {
                       setIsModalOpen(false);
                       return;
                    }

                    if (activeTab === 'bulanan') {
                      if (modalMode === 'add') {
                        const d = { ...data, id: `M-${Date.now()}` };
                        onUpdateBulanan([...laporanBulanan, d]);
                        onAddLog('Tambah', 'Lap. Bulanan', `Tambah: "${d.tema_konten}" pada Akun ${getAccName(d.id_akun)} (PIC: ${getEmpName(d.id_karyawan)}).`);
                      } else {
                        onUpdateBulanan(laporanBulanan.map(i => i.id === selectedItem.id ? data : i));
                        onAddLog('Edit', 'Lap. Bulanan', `Update ID ${selectedItem.id}. ${generateDiffDetail(selectedItem, data, 'bulanan')}`);
                      }
                    } else if (activeTab === 'produksi') {
                      if (modalMode === 'add') {
                        const d = { ...data, id: `PRO-${Date.now()}` };
                        onUpdateProduksi([...laporanProduksi, d]);
                        onAddLog('Tambah', 'Lap. Produksi', `Tambah: "${d.ide_konten}" pada Akun ${getAccName(d.id_akun)} (PIC: ${getEmpName(d.id_karyawan)}).`);
                      } else {
                        onUpdateProduksi(laporanProduksi.map(i => i.id === selectedItem.id ? data : i));
                        onAddLog('Edit', 'Lap. Produksi', `Update ID ${selectedItem.id}. ${generateDiffDetail(selectedItem, data, 'produksi')}`);
                      }
                    } else if (activeTab === 'performa') {
                      if (modalMode === 'add') {
                        const d = { ...data, id: `PER-${Date.now()}` };
                        onUpdatePerforma([...laporanPerforma, d]);
                        onAddLog('Tambah', 'Lap. Performa', `Tambah performa pada Akun ${getAccName(d.id_akun)} (PIC: ${getEmpName(d.id_karyawan)}).`);
                      } else {
                        onUpdatePerforma(laporanPerforma.map(i => i.id === selectedItem.id ? data : i));
                        onAddLog('Edit', 'Lap. Performa', `Update ID ${selectedItem.id}. ${generateDiffDetail(selectedItem, data, 'performa')}`);
                      }
                    }
                    setIsModalOpen(false);
                    onNotify('Laporan berhasil disimpan dan divalidasi');
                  }}
                 />
              </div>
           </div>
        </div>
      )}

      {/* Master Modal remains same... */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Database size={18} className="text-indigo-600" />
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Master {masterSubTab.toUpperCase()}</h3>
                 </div>
                 <button onClick={() => setIsMasterModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const nama = form.nama.value;
                // Admin Konten hanya bisa mendaftarkan akun untuk dirinya sendiri
                const idKaryawan = isContentAdmin ? currentUser.id : form.id_karyawan?.value;
                
                if (!nama.trim()) return onNotify('Nama wajib diisi', 'error');

                const id = modalMode === 'add' ? `ID-${Date.now()}` : selectedItem[masterSubTab === 'akun' ? 'id_akun' : masterSubTab === 'platform' ? 'id_platform' : 'id_jenis_konten'];
                const oldName = selectedItem ? (selectedItem.nama_akun || selectedItem.nama_platform || selectedItem.nama_jenis_konten) : '';

                if (masterSubTab === 'akun') {
                  const data = { id_akun: id, nama_akun: nama, id_karyawan: idKaryawan };
                  onUpdateMasterAkun(modalMode === 'add' ? [...masterAkun, data] : masterAkun.map(a => a.id_akun === id ? data : a));
                } else if (masterSubTab === 'platform' && isAdmin) {
                  const data = { id_platform: id, nama_platform: nama };
                  onUpdateMasterPlatform(modalMode === 'add' ? [...masterPlatform, data] : masterPlatform.map(p => p.id_platform === id ? data : p));
                } else if (masterSubTab === 'jenis' && isAdmin) {
                  const data = { id_jenis_konten: id, nama_jenis_konten: nama };
                  onUpdateMasterJenisKonten(modalMode === 'add' ? [...masterJenisKonten, data] : masterJenisKonten.map(j => j.id_jenis_konten === id ? data : j));
                }
                
                onAddLog(
                  modalMode === 'add' ? 'Tambah' : 'Edit', 
                  `Master ${masterSubTab}`, 
                  modalMode === 'add' 
                    ? `Menambahkan Master ${masterSubTab}: "${nama}".` 
                    : `Mengubah Master ${masterSubTab} "${oldName}" menjadi "${nama}".`
                );
                
                setIsMasterModalOpen(false);
                onNotify('Master data diperbarui');
              }} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Input Nama {masterSubTab.toUpperCase()}</label>
                    <input name="nama" defaultValue={selectedItem ? (selectedItem.nama_akun || selectedItem.nama_platform || selectedItem.nama_jenis_konten) : ''} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-black text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner" required autoFocus />
                 </div>

                 {masterSubTab === 'akun' && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">PIC Akun</label>
                      <div className="relative group">
                        {isContentAdmin ? (
                          <div className="w-full p-5 bg-slate-100 border-2 border-transparent rounded-[1.5rem] font-black text-slate-500 cursor-not-allowed">
                             {currentUser.fullName.toUpperCase()} (Terkunci)
                          </div>
                        ) : (
                          <>
                            <select name="id_karyawan" defaultValue={selectedItem?.id_karyawan || ''} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-black text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none" required>
                               <option value="">-- Pilih PIC --</option>
                               {employees.map(emp => (
                                 <option key={emp.id} value={emp.id}>{emp.fullName.toUpperCase()}</option>
                               ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-500" size={16}/>
                          </>
                        )}
                      </div>
                   </div>
                 )}

                 <button type="submit" className="w-full py-5 mt-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                    <Save size={18}/> Konfirmasi Simpan
                 </button>
              </form>
           </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .form-input { width: 100%; padding: 1.15rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-size: 0.9rem; font-weight: 700; color: #1e293b; outline: none; transition: all 0.25s; }
        .form-input:focus { background: #ffffff; border-color: #ec4899; box-shadow: 0 10px 30px -10px rgba(236, 72, 153, 0.2); }
        .form-input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; opacity: 0.8; }
      `}</style>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ContentStatCard = ({ label, value, sub, icon: Icon, color }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/10',
    pink: 'bg-pink-50 text-pink-600 border-pink-100 shadow-pink-500/10'
  };
  return (
    <div className={`p-8 rounded-[3rem] border shadow-xl transition-all hover:-translate-y-2 group ${colors[color]} bg-white`}>
       <div className="flex justify-between items-start mb-6">
          <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
             <Icon size={24} />
          </div>
          <Zap size={14} className="opacity-20" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
       <p className="text-3xl font-black tracking-tighter text-slate-800">{value}</p>
       <p className="text-[8px] font-bold text-slate-400 mt-4 uppercase tracking-tighter italic">{sub}</p>
    </div>
  );
};

const TabItem = ({ active, onClick, icon: Icon, label, isSub }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'} ${isSub ? 'py-2 px-4' : ''}`}>
    <Icon size={14} /> {label}
  </button>
);

const ProgressBadge = ({ status }: any) => {
  const colors: any = {
    [ContentProgressStatus.BELUM]: 'bg-slate-50 text-slate-300 border-slate-100',
    [ContentProgressStatus.PROSES]: 'bg-amber-50 text-amber-600 border-amber-100',
    [ContentProgressStatus.SELESAI]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  return <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border tracking-tighter ${colors[status]}`}>{status}</span>;
};

const ReportForm = ({ tab, item, employees, currentUser, isAdmin, masterAkun, masterPlatform, masterJenisKonten, mode, onSave }: any) => {
  const isReadOnly = mode === 'detail';
  
  const [form, setForm] = useState<any>(item || {
    tanggal: new Date().toISOString().split('T')[0],
    id_karyawan: isAdmin ? '' : currentUser.id,
    id_akun: '',
    id_platform: '',
    tema_konten: '',
    id_jenis_konten: '',
    status_akhir: ContentFinalStatus.DRAFT,
    ide_konten: '',
    status_skrip: ContentProgressStatus.BELUM,
    status_shooting: ContentProgressStatus.BELUM,
    status_editing: ContentProgressStatus.BELUM,
    status_upload: ContentUploadStatus.BELUM,
    link_konten: '',
    views: 0,
    like: 0,
    comment: 0,
    share: 0,
    save: 0,
    order_dari_konten: 0
  });

  // Filter master akun berdasarkan PIC yang dipilih di form
  const filteredAccounts = useMemo(() => {
    if (!form.id_karyawan) return [];
    return masterAkun.filter(a => a.id_karyawan === form.id_karyawan);
  }, [masterAkun, form.id_karyawan]);

  // Effect untuk menangani penyesuaian otomatis Nama Akun saat PIC berubah
  useEffect(() => {
    if (isReadOnly) return;
    if (filteredAccounts.length === 1) {
      setForm((prev: any) => ({ ...prev, id_akun: filteredAccounts[0].id_akun }));
    } else if (filteredAccounts.length > 0) {
      const isStillValid = filteredAccounts.some(a => a.id_akun === form.id_akun);
      if (!isStillValid) {
        setForm((prev: any) => ({ ...prev, id_akun: '' }));
      }
    } else {
      setForm((prev: any) => ({ ...prev, id_akun: '' }));
    }
  }, [form.id_karyawan, filteredAccounts, isReadOnly]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-6">
       <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Tanggal</label>
             <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className="form-input" required disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIC (Penanggung Jawab)</label>
             <div className="relative">
               <select 
                value={form.id_karyawan} 
                onChange={e => setForm({...form, id_karyawan: e.target.value})} 
                className={`form-input appearance-none ${(!isAdmin || isReadOnly) ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}`}
                required 
                disabled={!isAdmin || isReadOnly}
               >
                  <option value="">-- Pilih PIC --</option>
                  {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
               </select>
               {(!isAdmin || isReadOnly) && <ShieldAlert size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Akun (Otomatis sesuai PIC)</label>
             <div className="relative group">
                <select value={form.id_akun} onChange={e => setForm({...form, id_akun: e.target.value})} className="form-input appearance-none" required disabled={isReadOnly}>
                    <option value="">-- Pilih Akun --</option>
                    {filteredAccounts.map((a: any) => <option key={a.id_akun} value={a.id_akun}>{a.nama_akun}</option>)}
                </select>
                {!isReadOnly && <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-500" size={16}/>}
             </div>
             {filteredAccounts.length === 0 && form.id_karyawan && !isReadOnly && (
               <p className="text-[9px] font-bold text-rose-500 mt-1 italic uppercase tracking-tighter">* PIC ini belum memiliki akun terdaftar di Master Data.</p>
             )}
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform</label>
             <select value={form.id_platform} onChange={e => setForm({...form, id_platform: e.target.value})} className="form-input" required disabled={isReadOnly}>
                <option value="">-- Pilih Platform --</option>
                {masterPlatform.map((p: any) => <option key={p.id_platform} value={p.id_platform}>{p.nama_platform}</option>)}
             </select>
          </div>
       </div>

       {tab === 'bulanan' && (
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema Besar Konten</label>
                <textarea value={form.tema_konten} onChange={e => setForm({...form, tema_konten: e.target.value})} className="form-input h-24 pt-4 resize-none" placeholder="Tuliskan pilar konten..." required disabled={isReadOnly} />
             </div>
             <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Konten</label>
                   <select value={form.id_jenis_konten} onChange={e => setForm({...form, id_jenis_konten: e.target.value})} className="form-input" required disabled={isReadOnly}>
                      <option value="">-- Pilih Jenis --</option>
                      {masterJenisKonten.map((j: any) => <option key={j.id_jenis_konten} value={j.id_jenis_konten}>{j.nama_jenis_konten}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Akhir</label>
                   <select value={form.status_akhir} onChange={e => setForm({...form, status_akhir: e.target.value as any})} className="form-input" disabled={isReadOnly}>
                      {Object.values(ContentFinalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
             </div>
          </div>
       )}

       {tab === 'produksi' && (
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ide / Konsep Konten</label>
                <textarea value={form.ide_konten} onChange={e => setForm({...form, ide_konten: e.target.value})} className="form-input h-20 pt-4 resize-none" required disabled={isReadOnly} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Status Skrip</label><select value={form.status_skrip} onChange={e => setForm({...form, status_skrip: e.target.value as any})} className="form-input !py-3" disabled={isReadOnly}>{Object.values(ContentProgressStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Status Shoot</label><select value={form.status_shooting} onChange={e => setForm({...form, status_shooting: e.target.value as any})} className="form-input !py-3" disabled={isReadOnly}>{Object.values(ContentProgressStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Status Edit</label><select value={form.status_editing} onChange={e => setForm({...form, status_editing: e.target.value as any})} className="form-input !py-3" disabled={isReadOnly}>{Object.values(ContentProgressStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Status Upload</label><select value={form.status_upload} onChange={e => setForm({...form, status_upload: e.target.value as any})} className="form-input !py-3" disabled={isReadOnly}>{Object.values(ContentUploadStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Konten</label>
                <input type="url" value={form.link_konten} onChange={e => setForm({...form, link_konten: e.target.value})} className="form-input" placeholder="https://..." disabled={isReadOnly} />
             </div>
          </div>
       )}

       {tab === 'performa' && (
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema Konten</label>
                <input type="text" value={form.tema_konten} onChange={e => setForm({...form, tema_konten: e.target.value})} className="form-input" required disabled={isReadOnly} />
             </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Views</label><input type="number" value={form.views || ''} onChange={e => setForm({...form, views: Number(e.target.value)})} className="form-input !py-3" disabled={isReadOnly} /></div>
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Likes</label><input type="number" value={form.like || ''} onChange={e => setForm({...form, like: Number(e.target.value)})} className="form-input !py-3" disabled={isReadOnly} /></div>
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Comm</label><input type="number" value={form.comment || ''} onChange={e => setForm({...form, comment: Number(e.target.value)})} className="form-input !py-3" disabled={isReadOnly} /></div>
             </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Share</label><input type="number" value={form.share || ''} onChange={e => setForm({...form, share: Number(e.target.value)})} className="form-input !py-3" disabled={isReadOnly} /></div>
                <div className="space-y-1"><label className="text-[8px] font-black uppercase">Save</label><input type="number" value={form.save || ''} onChange={e => setForm({...form, save: Number(e.target.value)})} className="form-input !py-3" disabled={isReadOnly} /></div>
                <div className="space-y-1"><label className="text-[8px] font-black uppercase text-indigo-600">Orders</label><input type="number" value={form.order_dari_konten || ''} onChange={e => setForm({...form, order_dari_konten: Number(e.target.value)})} className="form-input !py-3 bg-indigo-50 border-indigo-100" disabled={isReadOnly} /></div>
             </div>
          </div>
       )}

       <button type="submit" className={`w-full py-5 ${isReadOnly ? 'bg-indigo-600' : 'bg-slate-900 hover:bg-pink-600'} text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95`}>
          {isReadOnly ? <CheckCircle2 size={20}/> : <Save size={20}/>}
          {isReadOnly ? 'Selesai Meninjau' : 'Kirim Laporan Audit'}
       </button>
    </form>
  );
};

export default ContentModule;
