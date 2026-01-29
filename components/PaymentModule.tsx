
import React, { useMemo, useState } from 'react';
import { 
  CreditCard, Landmark, Calendar, Search, Filter, ArrowRight, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, 
  Download, Wallet, ArrowUpRight, Clock, ShieldCheck,
  FileSpreadsheet, Receipt, LandmarkIcon, TrendingUp, History
} from 'lucide-react';
import { FullSaleRecord, Bank, SettlementStatus } from '../types';

interface PaymentModuleProps {
  sales: FullSaleRecord[];
  banks: Bank[];
  onUpdateSale: (id: string, updatedData: any) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const PaymentModule: React.FC<PaymentModuleProps> = ({ sales, banks, onUpdateSale, onNotify }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bankFilter, setBankFilter] = useState<string>('ALL');
  const itemsPerPage = 10;

  const getBankName = (id: string) => banks.find(b => b.id === id)?.name || '-';

  const filteredSales = useMemo(() => {
    return sales
      .filter(s => {
        const query = searchQuery.toLowerCase();
        const custName = (s.nama_pembeli || s.customerName || '').toLowerCase();
        const orderNo = (s.no_pesanan || s.orderNumber || '').toLowerCase();
        const resi = (s.resi_kode_booking || s.trackingNumber || '').toLowerCase();

        const matchesSearch = custName.includes(query) || orderNo.includes(query) || resi.includes(query);
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter || s.statusCair === statusFilter;
        const matchesBank = bankFilter === 'ALL' || s.bankId === bankFilter || s.nama_bank === bankFilter;
        return matchesSearch && matchesStatus && matchesBank;
      })
      .sort((a, b) => new Date(b.tanggal || b.date).getTime() - new Date(a.tanggal || a.date).getTime());
  }, [sales, searchQuery, statusFilter, bankFilter]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage]);

  const stats = useMemo(() => {
    return {
      pending: sales.filter(s => (s.status === SettlementStatus.DIPROSES || s.statusCair === SettlementStatus.DIPROSES)).reduce((acc, curr) => acc + (curr.jumlah || curr.totalJual || 0), 0),
      settled: sales.filter(s => (s.status === SettlementStatus.CAIR || s.statusCair === SettlementStatus.CAIR)).reduce((acc, curr) => acc + (curr.jumlah || curr.totalJual || 0), 0),
      returned: sales.filter(s => (s.status === SettlementStatus.DIRETUR || s.statusCair === SettlementStatus.DIRETUR)).reduce((acc, curr) => acc + (curr.jumlah || curr.totalJual || 0), 0),
      count: filteredSales.length
    };
  }, [sales, filteredSales]);

  const handleMarkAsSettled = (sale: FullSaleRecord) => {
    const today = new Date().toISOString().split('T')[0];
    onUpdateSale(sale.id, { 
      status: SettlementStatus.CAIR,
      statusCair: SettlementStatus.CAIR, 
      tgl_cair: today 
    });
    onNotify(`Dana pesanan ${sale.no_pesanan || sale.orderNumber} telah diverifikasi cair`);
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-heading"> Settlement & Cashflow</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">Sistem Rekonsiliasi Dana Marketplace</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
          <Download size={18} /> Download Laporan Keuangan
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Dana Terverifikasi" 
          value={formatIDR(stats.settled)} 
          icon={Wallet} 
          color="emerald" 
          sub="Dana sudah masuk ke saldo Bank"
        />
        <StatCard 
          label="Dalam Proses Cair" 
          value={formatIDR(stats.pending)} 
          icon={Clock} 
          color="amber" 
          sub="Menunggu settlement marketplace"
        />
        <StatCard 
          label="Total Dana Retur" 
          value={formatIDR(stats.returned)} 
          icon={AlertCircle} 
          color="rose" 
          sub="Pesanan dikembalikan / bermasalah"
        />
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari Pesanan, Nama, atau Resi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative group min-w-[200px] flex-1 lg:flex-none">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none shadow-sm"
              >
                <option value="ALL">SEMUA STATUS</option>
                <option value={SettlementStatus.CAIR}>SUDAH CAIR</option>
                <option value={SettlementStatus.DIPROSES}>DALAM PROSES</option>
                <option value={SettlementStatus.DIRETUR}>RETUR / GAGAL</option>
              </select>
            </div>
            <div className="relative group min-w-[180px] flex-1 lg:flex-none">
              <LandmarkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none shadow-sm"
              >
                <option value="ALL">SEMUA BANK</option>
                {banks.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <History size={16} className="text-slate-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ditemukan <span className="text-indigo-600">{stats.count}</span> Transaksi pada filter ini</p>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setBankFilter('ALL'); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Reset Filter</button>
           </div>
        </div>
      </div>

      {/* Main Payment Ledger Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><ShieldCheck size={24}/></div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight font-heading uppercase">Payment Audit Ledger</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Transaksi & Sinkronisasi Perbankan</p>
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-7">ID PESANAN</th>
                <th className="px-10 py-7">CUSTOMER & REKENING</th>
                <th className="px-10 py-7 text-right">TOTAL JUAL</th>
                <th className="px-10 py-7">STATUS CAIR</th>
                <th className="px-10 py-7">TGL CAIR</th>
                <th className="px-10 py-7 text-right">AKSI VERIFIKASI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length > 0 ? paginatedSales.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <p className="font-mono text-xs font-black text-indigo-600 uppercase">#{(s.no_pesanan || s.orderNumber || '').slice(-8)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar size={10} /> {s.tanggal || s.date}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">{s.nama_pembeli || s.customerName}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                         <LandmarkIcon size={12} className="text-indigo-400" /> {getBankName(s.bankId || s.nama_bank || '')}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className="text-sm font-black text-slate-900 font-heading">{formatIDR(s.jumlah || s.totalJual || 0)}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      (s.status === SettlementStatus.CAIR || s.statusCair === SettlementStatus.CAIR) ? 'bg-emerald-100 text-emerald-700' :
                      (s.status === SettlementStatus.DIRETUR || s.statusCair === SettlementStatus.DIRETUR) ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700 animate-pulse'
                    }`}>
                      {(s.status === SettlementStatus.CAIR || s.statusCair === SettlementStatus.CAIR) ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                      {s.status || s.statusCair}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className={`text-[10px] font-black uppercase ${s.tgl_cair ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                      {s.tgl_cair || 'Waiting...'}
                    </p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {(s.status === SettlementStatus.DIPROSES || s.statusCair === SettlementStatus.DIPROSES) ? (
                      <button 
                        onClick={() => handleMarkAsSettled(s)}
                        className="flex items-center gap-2 ml-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                      >
                        <CheckCircle2 size={14}/> Verifikasi Cair
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl w-fit ml-auto border border-emerald-100">
                        <ShieldCheck size={16}/> Selesai Cair
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <Receipt size={64} className="mx-auto text-slate-100 mb-6" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Data pembayaran tidak ditemukan</h4>
                    <p className="text-xs font-bold text-slate-300 mt-2">Coba ubah kata kunci pencarian atau filter status.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredSales.length > 0 && (
          <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan {paginatedSales.length} dari {filteredSales.length} Total Data
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1.5">
                 {Array.from({ length: totalPages }).map((_, i) => (
                   <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300'}`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Financial Security Note */}
      <div className="p-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3.5rem] border border-slate-800 flex items-start gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="p-6 bg-white/5 rounded-[2rem] text-indigo-300 border border-white/10 backdrop-blur-md">
           <ShieldCheck size={32} />
        </div>
        <div className="relative z-10">
          <h4 className="text-lg font-black text-white uppercase tracking-widest mb-3">Integrasi Keamanan Pembayaran</h4>
          <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-3xl uppercase italic">
            Seluruh transaksi yang ditandai <span className="text-emerald-400">"Verified Cair"</span> akan secara otomatis masuk ke laporan laba-rugi final. Pastikan Anda melakukan pengecekan saldo bank secara berkala sebelum melakukan verifikasi pada sistem MarketFlow untuk menjaga akurasi pembukuan.
          </p>
          <div className="flex gap-6 mt-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SSL Encrypted</p>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit Log Active</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, sub }: any) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };
  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl group`}>
      <div className="flex justify-between items-start mb-8">
        <div className={`p-5 rounded-[1.75rem] ${colorMap[color] || 'bg-slate-50'} border shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <div className="p-2 bg-slate-50 rounded-full">
           <TrendingUp size={16} className="text-slate-300" />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-2xl font-black text-slate-900 font-heading tracking-tight`}>{value}</p>
      <div className="w-10 h-1 bg-slate-100 my-4 rounded-full group-hover:w-20 transition-all duration-500"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic leading-relaxed">{sub}</p>
    </div>
  );
};

export default PaymentModule;
