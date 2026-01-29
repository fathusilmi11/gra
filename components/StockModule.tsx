
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Warehouse, Search, Package, Plus, 
  Boxes, Edit2, Trash2, Eye, 
  Save, X, Calendar, User, Info, 
  RotateCcw, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Activity, Filter, ClipboardList, 
  ChevronLeft, ChevronRight, ChevronDown,
  FileSpreadsheet, Layers, Database, Tag, History, 
  Clock, FileSearch, MoreVertical, AlertCircle, UserCheck,
  TrendingUp, TrendingDown, Layers3, Ruler, Printer, Download,
  MessageSquare
} from 'lucide-react';
import { Product, DailyInventory, InventoryReportStatus, Employee, InventoryAuditLog } from '../types';

interface StockModuleProps {
  products: Product[];
  dailyInventories: DailyInventory[];
  inventoryLogs: InventoryAuditLog[];
  employees: Employee[];
  onAddInventory: (data: DailyInventory) => void;
  onUpdateInventory: (id: string, data: DailyInventory) => void;
  onDeleteInventory: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

type MainTab = 'persediaan' | 'data_barang' | 'log_aktivitas';

const StockModule: React.FC<StockModuleProps> = ({ 
  products, dailyInventories, inventoryLogs, employees, onAddInventory, onUpdateInventory, onDeleteInventory, onNotify 
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('persediaan');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [selectedRecord, setSelectedRecord] = useState<DailyInventory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    barang_id: '',
    stok_awal: 0,
    barang_masuk: 0,
    barang_keluar: 0,
    dicek_oleh: '',
    keterangan: '',
    satuan: ''
  });

  const selectedProductInfo = useMemo(() => 
    products.find(p => p.id === formData.barang_id), 
  [formData.barang_id, products]);

  const calculatedStokAkhir = useMemo(() => {
    return (formData.stok_awal || 0) + (formData.barang_masuk || 0) - (formData.barang_keluar || 0);
  }, [formData.stok_awal, formData.barang_masuk, formData.barang_keluar]);

  // Efek untuk mengisi satuan & stok awal otomatis saat pilih barang
  useEffect(() => {
    if (selectedProductInfo && modalMode === 'add') {
      setFormData(prev => ({ 
        ...prev, 
        stok_awal: selectedProductInfo.stock || 0,
        satuan: selectedProductInfo.satuan || 'Pcs'
      }));
    }
  }, [formData.barang_id, selectedProductInfo, modalMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    return dailyInventories.filter(inv => {
      const query = searchQuery.toLowerCase();
      const nama = (inv.nama_barang || '').toLowerCase();
      const sku = (inv.barang_id || '').toLowerCase();
      const ket = (inv.keterangan_masuk || inv.keterangan_keluar || '').toLowerCase();
      const verifikator = (inv.dicek_oleh || '').toLowerCase();
      
      const matchesSearch = nama.includes(query) || sku.includes(query) || ket.includes(query) || verifikator.includes(query);
      const matchesStart = !startDate || inv.tanggal >= startDate;
      const matchesEnd = !endDate || inv.tanggal <= endDate;
      return matchesSearch && matchesStart && matchesEnd;
    }).sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '') || (b.created_at || '').localeCompare(a.created_at || ''));
  }, [dailyInventories, searchQuery, startDate, endDate]);

  const filteredMaster = useMemo(() => {
    return products.filter(p => {
      const query = searchQuery.toLowerCase();
      return (p.name || '').toLowerCase().includes(query) || 
             (p.id || '').toLowerCase().includes(query) ||
             (p.satuan || '').toLowerCase().includes(query);
    });
  }, [products, searchQuery]);

  const filteredLogs = useMemo(() => {
    return inventoryLogs.filter(l => {
      const query = searchQuery.toLowerCase();
      return (l.barang || '').toLowerCase().includes(query) ||
             (l.user || '').toLowerCase().includes(query) ||
             (l.detail || '').toLowerCase().includes(query);
    });
  }, [inventoryLogs, searchQuery]);

  const stockStats = useMemo(() => {
    const activeSkus = new Set(filteredTransactions.map(t => t.barang_id));
    const totalSku = activeSkus.size || products.length;
    const totalStockQty = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalIn = filteredTransactions.reduce((acc, inv) => acc + (inv.barang_masuk || 0), 0);
    const totalOut = filteredTransactions.reduce((acc, inv) => acc + (inv.barang_keluar || 0), 0);
    return { totalSku, totalStockQty, totalIn, totalOut };
  }, [products, filteredTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return onNotify('Tidak ada data mutasi untuk rentang filter ini', 'error');
    const headers = ["No", "Tanggal Audit", "ID Barang", "Nama Barang", "Satuan", "Stok Awal", "Masuk", "Keluar", "Stok Akhir", "Dicek Oleh", "Keterangan"];
    const rows = filteredTransactions.map((item, idx) => [
      idx + 1, item.tanggal, item.barang_id, `"${item.nama_barang}"`, item.satuan, item.stok_awal, item.barang_masuk, item.barang_keluar, item.stok_akhir, `"${item.dicek_oleh}"`, `"${(item.keterangan_masuk || '-').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Audit_Persediaan_${startDate || 'Semua'}_sd_${endDate || 'Semua'}.csv`;
    link.click();
    onNotify('Laporan CSV Audit Berhasil Diunduh');
  };

  const currentDataInfo = useMemo(() => {
    if (activeTab === 'persediaan') return { data: filteredTransactions, total: filteredTransactions.length };
    if (activeTab === 'data_barang') return { data: filteredMaster, total: filteredMaster.length };
    return { data: filteredLogs, total: filteredLogs.length };
  }, [activeTab, filteredTransactions, filteredMaster, filteredLogs]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentDataInfo.data.slice(start, start + itemsPerPage);
  }, [currentDataInfo, currentPage]);

  const totalPages = Math.ceil(currentDataInfo.total / itemsPerPage);

  const handleOpenModal = (mode: 'add' | 'edit' | 'detail', record?: DailyInventory) => {
    setModalMode(mode);
    if (record) {
      setSelectedRecord(record);
      setFormData({
        tanggal: record.tanggal || '',
        barang_id: record.barang_id || '',
        stok_awal: record.stok_awal || 0,
        barang_masuk: record.barang_masuk || 0,
        barang_keluar: record.barang_keluar || 0,
        dicek_oleh: record.dicek_oleh || (employees[0]?.fullName || ''),
        keterangan: record.keterangan_masuk || '',
        satuan: record.satuan || ''
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        barang_id: '',
        stok_awal: 0,
        barang_masuk: 0,
        barang_keluar: 0,
        dicek_oleh: employees[0]?.fullName || '',
        keterangan: '',
        satuan: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barang_id) return onNotify('Pilih barang terlebih dahulu!', 'error');
    const entry: any = {
      id: selectedRecord?.id || `INV-${Date.now()}`,
      tanggal: formData.tanggal,
      barang_id: formData.barang_id,
      nama_barang: selectedProductInfo?.name || selectedRecord?.nama_barang || '',
      satuan: formData.satuan || selectedProductInfo?.satuan || 'Pcs',
      stok_awal: formData.stok_awal,
      barang_masuk: formData.barang_masuk,
      keterangan_masuk: formData.keterangan,
      barang_keluar: formData.barang_keluar,
      keterangan_keluar: formData.keterangan,
      stok_akhir: calculatedStokAkhir,
      status_laporan: InventoryReportStatus.DISETUJUI,
      input_oleh: 'Superadmin',
      dicek_oleh: formData.dicek_oleh,
      logs: [],
      created_at: selectedRecord?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (modalMode === 'edit' && selectedRecord) {
      onUpdateInventory(selectedRecord.id, entry);
      onNotify('Update Stok Berhasil');
    } else {
      onAddInventory(entry);
      onNotify('Mutasi harian disimpan');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 print:p-0 print:space-y-4">
      {/* Header Stat & Print View */}
      <div className="hidden print:block border-b-4 border-slate-900 pb-6 mb-8 text-center relative">
         <div className="flex justify-between items-end mb-4">
            <div className="text-left">
               <h1 className="text-3xl font-black text-slate-900 tracking-tighter">MARKETFLOW</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Management System</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dicetak Pada</p>
               <p className="text-xs font-bold text-slate-700">{new Date().toLocaleString('id-ID')}</p>
            </div>
         </div>
         <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Laporan Audit & Mutasi Persediaan</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <MiniStatCard label="Total SKU" value={stockStats.totalSku} icon={Layers3} color="slate" sub="Unit Terpantau" />
        <MiniStatCard label="Total Stok" value={stockStats.totalStockQty} icon={Package} color="indigo" sub="Saldo Akhir Periode" />
        <MiniStatCard label="Barang Masuk" value={stockStats.totalIn} icon={TrendingUp} color="emerald" sub="Volume Inbound" isPos />
        <MiniStatCard label="Barang Keluar" value={stockStats.totalOut} icon={TrendingDown} color="rose" sub="Volume Outbound" isNeg />
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight flex items-center gap-3">
            <Warehouse className="text-indigo-600" size={24} /> AUDIT PERSEDIAAN
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"><FileSpreadsheet size={14} className="text-emerald-500" /> Export CSV</button>
           <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"><Printer size={14} className="text-indigo-500" /> Cetak PDF</button>
           <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all active:scale-95"><Plus size={14}/> Input Mutasi</button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
            <TabButton active={activeTab === 'persediaan'} onClick={() => setActiveTab('persediaan')} icon={ClipboardList} label="Mutasi" />
            <TabButton active={activeTab === 'data_barang'} onClick={() => setActiveTab('data_barang')} icon={Database} label="Master" />
            <TabButton active={activeTab === 'log_aktivitas'} onClick={() => setActiveTab('log_aktivitas')} icon={History} label="Audit Logs" />
          </div>
          <div className="relative group w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input type="text" placeholder="Cari SKU, Nama, atau Dicek Oleh..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-50">
          <Calendar size={14} className="text-slate-400" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-600 outline-none w-full sm:w-36" />
          <span className="text-slate-300">/</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-600 outline-none w-full sm:w-36" />
          {(startDate || endDate) && <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline px-2">Reset</button>}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px] print:border-none print:shadow-none">
        <div className="overflow-x-auto no-scrollbar flex-1 relative">
          {activeTab === 'persediaan' ? (
            <table className="w-full text-left print:text-[9px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 print:bg-slate-100 print:text-slate-900">
                  <th className="px-5 py-4 sticky left-0 bg-slate-50 z-20 w-24 border-r border-slate-100 print:hidden">Aksi</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">SKU & Produk</th>
                  <th className="px-5 py-4">Satuan</th>
                  <th className="px-5 py-4">Dicek Oleh</th>
                  <th className="px-5 py-4">Keterangan</th>
                  <th className="px-5 py-4 text-center">Awal</th>
                  <th className="px-5 py-4 text-center text-emerald-500 print:text-emerald-700">Masuk</th>
                  <th className="px-5 py-4 text-center text-rose-500 print:text-rose-700">Keluar</th>
                  <th className="px-5 py-4 text-center bg-slate-100/50 print:bg-slate-200">Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 print:divide-slate-200">
                {paginatedData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4 sticky left-0 bg-white group-hover:bg-slate-50/90 backdrop-blur z-10 border-r border-slate-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] print:hidden">
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenModal('detail', item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm"><Eye size={13}/></button>
                        <button onClick={() => handleOpenModal('edit', item)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all shadow-sm"><Edit2 size={13}/></button>
                        <button onClick={() => { if(confirm('Hapus mutasi ini?')) onDeleteInventory(item.id); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 size={13}/></button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[10px] font-bold text-slate-400 font-mono whitespace-nowrap print:text-slate-900">{item.tanggal}</td>
                    <td className="px-5 py-4 min-w-[160px]">
                      <p className="text-[11px] font-black text-slate-800 uppercase leading-tight print:text-[9px]">{item.nama_barang}</p>
                      <p className="text-[9px] font-bold text-indigo-400 font-mono mt-0.5">{item.barang_id}</p>
                    </td>
                    <td className="px-5 py-4">
                       <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest border border-slate-200">{item.satuan}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight print:text-[8px]">{item.dicek_oleh || '-'}</p>
                    </td>
                    <td className="px-5 py-4"><p className="text-[9px] font-bold text-slate-400 italic max-w-[120px] truncate" title={item.keterangan_masuk}>{item.keterangan_masuk || '-'}</p></td>
                    <td className="px-5 py-4 text-center text-[10px] font-bold text-slate-400">{item.stok_awal}</td>
                    <td className="px-5 py-4 text-center text-[10px] font-black text-emerald-600">+{item.barang_masuk}</td>
                    <td className="px-5 py-4 text-center text-[10px] font-black text-rose-600">-{item.barang_keluar}</td>
                    <td className="px-5 py-4 text-center bg-slate-50/50">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black shadow-sm ${item.stok_akhir > item.stok_awal ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : item.stok_akhir < item.stok_awal ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-900 text-white'}`}>{item.stok_akhir}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'data_barang' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Kode SKU</th>
                  <th className="px-8 py-5">Nama Barang</th>
                  <th className="px-8 py-5">Satuan</th>
                  <th className="px-8 py-5 text-right">Stok Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs font-black text-indigo-600">{p.id}</td>
                    <td className="px-8 py-4 text-xs font-black text-slate-800 uppercase tracking-tight">{p.name}</td>
                    <td className="px-8 py-4"><span className="text-[10px] font-bold text-slate-400 uppercase">{p.satuan || 'Pcs'}</span></td>
                    <td className="px-8 py-4 text-right"><span className={`px-3 py-1 rounded-xl font-black text-xs border ${p.stock < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-900 border-slate-200'}`}>{p.stock || 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Waktu Log</th>
                    <th className="px-8 py-5">User</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                    <th className="px-8 py-5">Barang</th>
                    <th className="px-8 py-5">Rincian Audit</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {paginatedData.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                       <td className="px-8 py-5 text-[10px] font-bold text-slate-400 font-mono">{log.waktu}</td>
                       <td className="px-8 py-5 text-xs font-black text-slate-800 uppercase">{log.user}</td>
                       <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                            log.aktivitas === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            log.aktivitas === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {log.aktivitas === 'CREATE' ? 'INPUT' : log.aktivitas}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-xs font-black text-slate-700 uppercase leading-tight">
                         {log.barang}
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">"{log.detail}"</p>
                       </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                         <History size={48} className="mx-auto text-slate-100 mb-4" />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada riwayat aktivitas</p>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menampilkan {paginatedData.length} data</span>
             <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm"><ChevronLeft size={16} /></button>
                <div className="flex gap-1">
                   {Array.from({length: Math.min(5, totalPages)}).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i+1 ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>{i+1}</button>
                   ))}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm"><ChevronRight size={16} /></button>
             </div>
          </div>
        )}
      </div>

      {/* Modal Form Mutasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{modalMode === 'add' ? 'Input Mutasi' : modalMode === 'edit' ? 'Koreksi Mutasi' : 'Detail Mutasi'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-300 transition-all"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="input-label-v2">Tanggal Mutasi</label>
                    <input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="input-v6" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="input-label-v2">Barang (SKU)</label>
                    <select value={formData.barang_id} onChange={e => setFormData({...formData, barang_id: e.target.value})} className="input-v6" required disabled={modalMode === 'edit'}>
                      <option value="">-- Pilih Produk --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="input-label-v2 flex items-center gap-2"><Ruler size={12}/> Satuan Barang</label>
                    <input 
                      type="text" 
                      value={formData.satuan} 
                      onChange={e => setFormData({...formData, satuan: e.target.value})} 
                      className="input-v6 bg-indigo-50/50 border-indigo-100" 
                      placeholder="Pcs, Pack, Box, dll" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="input-label-v2 flex items-center gap-2"><User size={12}/> Dicek Oleh</label>
                    <select value={formData.dicek_oleh} onChange={e => setFormData({...formData, dicek_oleh: e.target.value})} className="input-v6" required>
                      <option value="">-- Pilih Petugas --</option>
                      {employees.map(e => <option key={e.id} value={e.fullName}>{e.fullName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                  <div className="text-center">
                    <label className="input-label-v2">Stok Awal</label>
                    <input type="number" value={formData.stok_awal} className="input-v6 !text-center bg-white border-none shadow-sm" readOnly />
                  </div>
                  <div className="text-center">
                    <label className="input-label-v2 text-emerald-600">Masuk (+)</label>
                    <input type="number" value={formData.barang_masuk || ''} onChange={e => setFormData({...formData, barang_masuk: Number(e.target.value)})} className="input-v6 !text-center text-emerald-600 font-black" placeholder="0" />
                  </div>
                  <div className="text-center">
                    <label className="input-label-v2 text-rose-600">Keluar (-)</label>
                    <input type="number" value={formData.barang_keluar || ''} onChange={e => setFormData({...formData, barang_keluar: Number(e.target.value)})} className="input-v6 !text-center text-rose-600 font-black" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-1.5">
                   <label className="input-label-v2 flex items-center gap-2"><MessageSquare size={12}/> Keterangan / Alasan Mutasi</label>
                   <textarea 
                    value={formData.keterangan} 
                    onChange={e => setFormData({...formData, keterangan: e.target.value})} 
                    className="input-v6 h-24 resize-none pt-3" 
                    placeholder="Tuliskan alasan mutasi stok... (Contoh: Restock Supplier, Barang Rusak, Penjualan Offline)"
                   />
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-xl relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all"></div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Saldo Akhir Baru</p>
                    <p className="text-4xl font-black font-heading tracking-tight">{calculatedStokAkhir} <span className="text-xs text-indigo-400 ml-1">{formData.satuan}</span></p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl">
                     <Boxes size={24} className="text-indigo-300" />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Save size={18}/> {modalMode === 'edit' ? 'Perbarui Audit' : 'Simpan Audit & Mutasi'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .input-label-v2 { display: block; font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
        .input-v6 { width: 100%; padding: 0.85rem 1.25rem; background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 1.25rem; font-size: 0.85rem; font-weight: 700; color: #0f172a; outline: none; transition: all 0.2s; }
        .input-v6:focus { background: #ffffff; border-color: #6366f1; box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

const MiniStatCard = ({ label, value, icon: Icon, color, sub, isPos, isNeg }: any) => {
  const colorMap: any = {
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100'
  };
  return (
    <div className={`p-5 rounded-[2rem] border shadow-sm transition-all group ${colorMap[color]} print:bg-white`}>
       <div className="flex justify-between items-start mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</p>
          <Icon size={16} className="opacity-40" />
       </div>
       <p className="text-2xl font-black text-slate-800 leading-none">{value.toLocaleString()}</p>
       <p className="text-[8px] font-bold text-slate-400 mt-3 uppercase tracking-tighter italic print:hidden">{sub}</p>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
    <Icon size={14} /> {label}
  </button>
);

export default StockModule;
