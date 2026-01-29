
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Filter, Eye, Edit3, Trash2, Download, 
  FileSpreadsheet, FileText, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, Box, ReceiptText, Layers, Truck, 
  CheckCircle2, ShoppingBag, CreditCard, ArrowRightLeft,
  Calendar, MapPin, Hash, Info, History, ClipboardList,
  ShoppingCart, ArrowUpRight, BarChart3, Wallet, Activity,
  RotateCcw
} from 'lucide-react';
import { FullSaleRecord, Product, Bank, Lead, Expedition, SettlementStatus, MarketplaceAccount, City, PaymentStatusOption, SaleAuditLog } from '../types';
import SalesFormModal from './SalesFormModal';

interface SalesModuleProps {
  sales: FullSaleRecord[];
  saleLogs: SaleAuditLog[];
  products: Product[];
  banks: Bank[];
  leads: Lead[];
  expeditions: Expedition[];
  marketplaces: MarketplaceAccount[];
  cities: City[];
  paymentStatuses: PaymentStatusOption[];
  onAddSale: (newSale: any) => void;
  onUpdateSale: (id: string, updatedData: any) => void;
  onDeleteSale: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

type SaleTab = 'ledger' | 'logs';

const SalesModule: React.FC<SalesModuleProps> = ({ 
  sales, saleLogs, products, banks, leads, expeditions, marketplaces, cities, paymentStatuses, 
  onAddSale, onUpdateSale, onDeleteSale, onNotify 
}) => {
  const [activeTab, setActiveTab] = useState<SaleTab>('ledger');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<FullSaleRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMarketplace, setFilterMarketplace] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterMarketplace, startDate, endDate, activeTab]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const q = searchQuery.toLowerCase();
      // Robust filtering with null check
      const namaBarang = ((s as any).nama_barang || '').toLowerCase();
      const namaPembeli = ((s as any).nama_pembeli || '').toLowerCase();
      const noPesanan = ((s as any).no_pesanan || (s as any).orderNumber || '').toLowerCase();
      
      const matchSearch = namaBarang.includes(q) || namaPembeli.includes(q) || noPesanan.includes(q);
      const matchMP = filterMarketplace === 'ALL' || (s as any).mp_marketplace === filterMarketplace;
      const matchDate = (!startDate || (s as any).tanggal >= startDate) && (!endDate || (s as any).tanggal <= endDate);
      return matchSearch && matchMP && matchDate;
    }).sort((a, b) => (b as any).tanggal.localeCompare((a as any).tanggal));
  }, [sales, searchQuery, filterMarketplace, startDate, endDate]);

  const filteredLogs = useMemo(() => {
    return saleLogs.filter(log => 
      (log.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.detail || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [saleLogs, searchQuery]);

  const stats = useMemo(() => {
    const totalJual = filteredSales.reduce((acc, s) => acc + (s as any).jumlah, 0);
    const totalProfit = filteredSales.reduce((acc, s) => acc + (s as any).laba, 0);
    const totalQty = filteredSales.reduce((acc, s) => acc + (s as any).qty, 0);
    const totalHpp = filteredSales.reduce((acc, s) => acc + (s as any).jml_hpp, 0);
    return { totalJual, totalProfit, totalQty, totalHpp };
  }, [filteredSales]);

  const handleExportCSV = () => {
    if (filteredSales.length === 0) return onNotify('Tidak ada data untuk diekspor', 'error');
    
    const headers = [
      "No", "Tanggal", "Qty", "Nama Barang", "Harga Satuan", "Jumlah", 
      "Status Pembayaran", "Nama Bank", "Asal Leads", "Asal Kota", "HPP Satuan", 
      "Jml HPP", "Ongkir Pembeli", "Laba", "Biaya Admin", "Ongkir Pengiriman", 
      "No Pesanan", "Ekspedisi", "Status", "Tgl Cair", "MP Marketplace", 
      "Nama Pembeli", "Akun Pembeli", "Alamat Pembeli", "No HP Cust", "Resi/Kode Booking"
    ];

    const rows = filteredSales.map((s, idx) => {
      const d = s as any;
      return [
        idx + 1, d.tanggal, d.qty, `"${d.nama_barang}"`, d.harga_satuan, d.jumlah,
        d.status_pembayaran, d.nama_bank, d.asal_leads, d.asal_kota, d.hpp_satuan,
        d.jml_hpp, d.ongkir_pembeli, d.laba, d.biaya_admin, d.ongkir_pengiriman,
        `"${d.no_pesanan}"`, d.ekspedisi, d.status, d.tgl_cair, d.mp_marketplace,
        `"${d.nama_pembeli}"`, `"${d.akun_pembeli}"`, `"${d.alamat_pembeli?.replace(/\n/g, ' ')}"`, 
        `'${d.no_hp_cust}`, 
        `"${d.resi_kode_booking}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Audit_Penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    onNotify('Audit CSV berhasil diunduh');
  };

  const paginatedData = useMemo(() => {
    const data = activeTab === 'ledger' ? filteredSales : filteredLogs;
    return data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [activeTab, filteredSales, filteredLogs, currentPage]);

  const totalPages = Math.ceil((activeTab === 'ledger' ? filteredSales.length : filteredLogs.length) / itemsPerPage);

  const handleOpenModal = (mode: 'add' | 'edit' | 'detail', sale?: any) => {
    setModalMode(mode);
    setSelectedSale(sale || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(confirm('Apakah Anda yakin ingin menghapus record transaksi ini secara permanen?')) {
      onDeleteSale(id);
      onNotify('Data penjualan berhasil dihapus dari buku besar', 'success');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Visual Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-heading tracking-tight uppercase flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <ShoppingCart size={24} />
             </div>
             Buku Besar Audit
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 ml-1">MarketFlow Financial Ledger & Operations Audit</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner mr-2">
            <TabButton active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} icon={ClipboardList} label="Audit Ledger" />
            <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={History} label="Log Aktivitas" />
          </div>
          {activeTab === 'ledger' && (
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-xl text-[10px] font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest active:scale-95">
                <FileSpreadsheet size={16} className="text-emerald-500"/> Export
              </button>
              <button onClick={() => handleOpenModal('add')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest active:scale-95">
                <Plus size={18}/> Transaksi Baru
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'ledger' ? (
        <>
          {/* Audit Stats Board */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            <SummaryCard label="Unit Terjual" value={`${stats.totalQty}`} icon={Box} color="indigo" sub="Volume Penjualan" />
            <SummaryCard label="Omzet Bruto" value={formatIDR(stats.totalJual)} icon={Wallet} color="slate" sub="Revenue Kotor" />
            <SummaryCard label="Beban HPP" value={formatIDR(stats.totalHpp)} icon={ArrowRightLeft} color="rose" sub="Total Modal Barang" />
            <SummaryCard label="Laba Bersih" value={formatIDR(stats.totalProfit)} icon={TrendingUp} color="emerald" sub="Keuntungan Final" isMain />
          </div>

          {/* Smart Filters */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center print:hidden">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari SKU, Nama Pembeli, atau No Pesanan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
            <div className="w-full lg:w-56">
              <select 
                value={filterMarketplace} 
                onChange={(e) => setFilterMarketplace(e.target.value)} 
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="ALL">SEMUA PLATFORM</option>
                {marketplaces.map(m => <option key={m.id} value={m.name}>{m.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-[10px] font-black outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner uppercase" />
              </div>
              <div className="relative flex-1">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-[10px] font-black outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner uppercase" />
              </div>
            </div>
            {(searchQuery || filterMarketplace !== 'ALL' || startDate || endDate) && (
              <button onClick={() => { setSearchQuery(''); setFilterMarketplace('ALL'); setStartDate(''); setEndDate(''); }} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Reset Filter">
                <RotateCcw size={18} />
              </button>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto relative no-scrollbar">
              <table className="w-full text-left table-auto min-w-[3200px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                    <th className="px-6 py-6 sticky left-0 bg-slate-900 z-20 border-r border-slate-800 text-center w-24">Aksi</th>
                    <th className="px-6 py-6 w-32">Tanggal</th>
                    <th className="px-6 py-6 text-center w-20">Qty</th>
                    <th className="px-6 py-6 w-64">Nama Barang</th>
                    <th className="px-6 py-6 text-right w-40">Harga Satuan</th>
                    <th className="px-6 py-6 text-right w-44 bg-indigo-900/50">Jumlah Total</th>
                    <th className="px-6 py-6 w-36">Status Bayar</th>
                    <th className="px-6 py-6 w-32">Bank</th>
                    <th className="px-6 py-6 w-36">Leads</th>
                    <th className="px-6 py-6 w-32">Kota</th>
                    <th className="px-6 py-6 text-right w-40">HPP Satuan</th>
                    <th className="px-6 py-6 text-right w-44 bg-rose-900/50">Jml HPP</th>
                    <th className="px-6 py-6 text-right w-40">Ongkir Pembeli</th>
                    <th className="px-6 py-6 text-right w-48 bg-emerald-900/50 text-emerald-400">Laba Bersih</th>
                    <th className="px-6 py-6 text-right w-40">Biaya Admin</th>
                    <th className="px-6 py-6 text-right w-40">Ongkir Real</th>
                    <th className="px-6 py-6 w-44">No Pesanan</th>
                    <th className="px-6 py-6 w-32">Ekspedisi</th>
                    <th className="px-6 py-6 w-36">Status</th>
                    <th className="px-6 py-6 w-32">Tgl Cair</th>
                    <th className="px-6 py-6 w-44">Marketplace</th>
                    <th className="px-6 py-6 w-56">Nama Pembeli</th>
                    <th className="px-6 py-6 w-44">Akun</th>
                    <th className="px-6 py-6 w-72">Alamat Lengkap</th>
                    <th className="px-6 py-6 w-40">WhatsApp</th>
                    <th className="px-6 py-6 w-56">Resi/Booking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors text-[11px] font-bold text-slate-700 group">
                      <td className="px-6 py-4 sticky left-0 bg-white/95 backdrop-blur z-10 border-r border-slate-100 group-hover:bg-slate-50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleOpenModal('detail', s)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm transition-all"><Eye size={14}/></button>
                          <button onClick={() => handleOpenModal('edit', s)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg shadow-sm transition-all"><Edit3 size={14}/></button>
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg shadow-sm transition-all"><Trash2 size={14}/></button>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[10px]">{s.tanggal}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-900 text-xs">{s.qty}</td>
                      <td className="px-6 py-4 truncate uppercase text-xs">
                        {s.items && s.items.length > 1 ? (
                          <div className="flex items-center gap-2">
                            <span className="truncate">{s.nama_barang}</span> 
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black shrink-0">+{s.items.length - 1} LAINNYA</span>
                          </div>
                        ) : s.nama_barang}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500">{formatIDR(s.harga_satuan)}</td>
                      <td className="px-6 py-4 text-right font-black text-indigo-600 bg-indigo-50/20 font-mono text-xs">{formatIDR(s.jumlah)}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] uppercase font-black text-slate-500">{s.status_pembayaran}</span></td>
                      <td className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase">{s.nama_bank}</td>
                      <td className="px-6 py-4 text-[10px] uppercase text-slate-500">{s.asal_leads}</td>
                      <td className="px-6 py-4 uppercase tracking-tighter text-[9px] font-black text-slate-400">{s.asal_kota}</td>
                      <td className="px-6 py-4 text-right text-rose-300 font-mono">{formatIDR(s.hpp_satuan)}</td>
                      <td className="px-6 py-4 text-right font-black text-rose-600 bg-rose-50/30 font-mono text-xs">{formatIDR(s.jml_hpp)}</td>
                      <td className="px-6 py-4 text-right text-slate-400 font-mono">{formatIDR(s.ongkir_pembeli)}</td>
                      <td className={`px-6 py-4 text-right font-black text-[13px] bg-emerald-50/50 font-mono ${s.laba >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatIDR(s.laba)}</td>
                      <td className="px-6 py-4 text-right text-rose-300 font-mono">{formatIDR(s.biaya_admin)}</td>
                      <td className="px-6 py-4 text-right text-rose-300 font-mono">{formatIDR(s.ongkir_pengiriman)}</td>
                      <td className="px-6 py-4 font-mono uppercase text-indigo-500 font-black text-[10px]">#{s.no_pesanan || s.orderNumber}</td>
                      <td className="px-6 py-4 uppercase text-[10px] font-black text-slate-400">{s.ekspedisi}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          s.status === SettlementStatus.CAIR ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          s.status === SettlementStatus.DIRETUR ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[10px]">{s.tgl_cair || '--'}</td>
                      <td className="px-6 py-4 uppercase font-black text-indigo-400 text-[10px]">{s.mp_marketplace}</td>
                      <td className="px-6 py-4 font-black text-slate-800 text-xs uppercase">{s.nama_pembeli}</td>
                      <td className="px-6 py-4 text-slate-400 italic text-[10px]">@{s.akun_pembeli}</td>
                      <td className="px-6 py-4 truncate text-slate-400 text-[10px] font-bold uppercase">{s.alamat_pembeli}</td>
                      <td className="px-6 py-4 font-mono text-indigo-400 font-black text-[10px]">'{s.no_hp_cust}</td>
                      <td className="px-6 py-4 font-mono uppercase font-black text-slate-800 text-[10px]">{s.resi_kode_booking}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
           {/* Log Filter & Header */}
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="relative group w-full max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari pelaksana atau detail..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Audit</p>
                    <p className="text-sm font-black text-indigo-600 mt-1">{saleLogs.length} Events</p>
                 </div>
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><Activity size={20}/></div>
              </div>
           </div>

           {/* Log Table */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                         <th className="px-10 py-6">Timestamp</th>
                         <th className="px-10 py-6">Executor</th>
                         <th className="px-10 py-6 text-center">Activity Type</th>
                         <th className="px-10 py-6">Data Transformation Details</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {paginatedData.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-10 py-5 whitespace-nowrap font-mono text-xs text-slate-400 font-bold">{log.waktu}</td>
                           <td className="px-10 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-inner">{log.user?.substring(0,2).toUpperCase() || 'SY'}</div>
                                 <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.user}</p>
                              </div>
                           </td>
                           <td className="px-10 py-5 text-center">
                              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                log.aktivitas === 'CREATE' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                log.aktivitas === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                 {log.aktivitas}
                              </span>
                           </td>
                           <td className="px-10 py-5">
                              <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">"{log.detail}"</p>
                           </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-10 py-32 text-center">
                             <History size={64} className="mx-auto text-slate-100 mb-6" />
                             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum ada riwayat aktivitas sistem</p>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* Shared Pagination Footer */}
      <div className="px-8 py-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg"><BarChart3 size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visualizing {activeTab === 'ledger' ? 'Audit Record' : 'Security Log'}</p>
              <p className="text-sm font-black text-slate-800 uppercase">
                {activeTab === 'ledger' ? `${filteredSales.length} Total Transaksi` : `${filteredLogs.length} Total Log`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all"><ChevronLeft size={18}/></button>
            <div className="flex gap-1">
              {Array.from({length: Math.min(5, totalPages)}).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i+1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-300'}`}>{i+1}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all"><ChevronRight size={18}/></button>
          </div>
      </div>

      {isModalOpen && (
        <SalesFormModal 
          mode={modalMode}
          initialData={selectedSale}
          marketplaces={marketplaces}
          products={products}
          banks={banks}
          expeditions={expeditions}
          leads={leads}
          cities={cities}
          paymentStatuses={paymentStatuses}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (modalMode === 'add') {
              onAddSale({ ...data, id: `S-${Date.now()}` });
              onNotify('Transaksi baru berhasil ditambahkan ke Buku Besar', 'success');
            } else {
              onUpdateSale(selectedSale!.id, data);
              onNotify('Record transaksi berhasil diperbarui dan divalidasi', 'success');
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
  >
    <Icon size={14} /> {label}
  </button>
);

const SummaryCard = ({ label, value, icon: Icon, color, sub, isMain }: any) => {
  const colorMap: any = {
    indigo: 'from-indigo-600 to-indigo-700 text-indigo-600',
    emerald: 'from-emerald-600 to-emerald-700 text-emerald-600',
    rose: 'from-rose-600 to-rose-700 text-rose-600',
    slate: 'from-slate-800 to-slate-900 text-slate-800'
  };

  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500 ${isMain ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-50' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-100 ${colorMap[color].split(' ')[2]} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={20} />
        </div>
        <div className="p-1 bg-slate-50 rounded-lg group-hover:rotate-45 transition-transform duration-500">
           <ArrowUpRight size={14} className="text-slate-200" />
        </div>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
        <p className="text-xl font-black text-slate-800 tracking-tight font-heading leading-tight truncate">{value}</p>
        <p className="text-[8px] font-bold text-slate-300 mt-2 uppercase italic leading-none">{sub}</p>
      </div>
      {isMain && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>}
    </div>
  );
};

export default SalesModule;
