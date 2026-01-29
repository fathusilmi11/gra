
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, Search, ExternalLink, Box, Navigation, Calendar, 
  MapPin, Filter, ChevronLeft, ChevronRight, Hash, 
  PackageCheck, TruckIcon, AlertTriangle, Save, X
} from 'lucide-react';
import { FullSaleRecord, Expedition, SettlementStatus } from '../types';

interface ShippingModuleProps {
  sales: FullSaleRecord[];
  expeditions: Expedition[];
  onUpdateSale: (id: string, updatedData: any) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const ShippingModule: React.FC<ShippingModuleProps> = ({ sales, expeditions, onUpdateSale, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expeditionFilter, setExpeditionFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingResi, setEditingResi] = useState<{id: string, value: string} | null>(null);
  const itemsPerPage = 10;

  const getExpeditionName = (id?: string) => expeditions.find(e => e.id === id)?.name || '-';

  const filteredSales = useMemo(() => {
    return sales
      .filter(sale => {
        const query = searchQuery.toLowerCase();
        const custName = (sale.nama_pembeli || sale.customerName || '').toLowerCase();
        const resi = (sale.resi_kode_booking || sale.trackingNumber || '').toLowerCase();
        
        const matchesSearch = custName.includes(query) || resi.includes(query);
        const matchesExp = expeditionFilter === 'ALL' || sale.expeditionId === expeditionFilter || sale.ekspedisi === expeditionFilter;
        return matchesSearch && matchesExp;
      })
      .sort((a, b) => new Date(b.tanggal || b.date).getTime() - new Date(a.tanggal || a.date).getTime());
  }, [sales, searchQuery, expeditionFilter]);

  const stats = useMemo(() => ({
    total: filteredSales.length,
    pendingResi: filteredSales.filter(s => !s.trackingNumber && !s.resi_kode_booking).length,
    inTransit: filteredSales.filter(s => (!!s.trackingNumber || !!s.resi_kode_booking) && s.status !== SettlementStatus.CAIR).length,
    delivered: filteredSales.filter(s => s.status === SettlementStatus.CAIR || s.statusCair === SettlementStatus.CAIR).length
  }), [filteredSales]);

  const handleUpdateResi = (id: string) => {
    if (!editingResi) return;
    onUpdateSale(id, { trackingNumber: editingResi.value, resi_kode_booking: editingResi.value });
    onNotify('Nomor resi berhasil diperbarui');
    setEditingResi(null);
  };

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Logistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MiniStat label="Total Pengiriman" value={stats.total} icon={Truck} color="indigo" />
        <MiniStat label="Perlu Resi" value={stats.pendingResi} icon={AlertTriangle} color="rose" isUrgent={stats.pendingResi > 0} />
        <MiniStat label="Sedang Dikirim" value={stats.inTransit} icon={Navigation} color="amber" />
        <MiniStat label="Sampai Tujuan" value={stats.delivered} icon={PackageCheck} color="emerald" />
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari Resi atau Nama Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
        <div className="relative group min-w-[200px] w-full lg:w-auto">
          <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={expeditionFilter}
            onChange={(e) => setExpeditionFilter(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none"
          >
            <option value="ALL">SEMUA KURIR</option>
            {expeditions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Logistics Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-6">CUSTOMER & KOTA</th>
                <th className="px-8 py-6">EKSPEDISI</th>
                <th className="px-8 py-6">NOMOR RESI</th>
                <th className="px-8 py-6 text-center">STATUS</th>
                <th className="px-8 py-6 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSales.length > 0 ? paginatedSales.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400">
                        {s.id.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.nama_pembeli || s.customerName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                          <MapPin size={10} className="text-rose-400" /> {s.asal_kota || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">{getExpeditionName(s.expeditionId || s.ekspedisi)}</span>
                  </td>
                  <td className="px-8 py-5">
                    {editingResi?.id === s.id ? (
                      <div className="flex items-center gap-2">
                         <input 
                          autoFocus
                          value={editingResi.value}
                          onChange={(e) => setEditingResi({...editingResi, value: e.target.value.toUpperCase()})}
                          className="bg-white border-2 border-indigo-500 rounded-lg px-3 py-1.5 text-xs font-black text-indigo-600 outline-none w-40"
                         />
                         <button onClick={() => handleUpdateResi(s.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Save size={14}/></button>
                         <button onClick={() => setEditingResi(null)} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg"><X size={14}/></button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingResi({id: s.id, value: (s.resi_kode_booking || s.trackingNumber || '')})}
                        className="flex items-center gap-2 cursor-pointer group/resi"
                      >
                        {(s.resi_kode_booking || s.trackingNumber) ? (
                          <p className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 group-hover/resi:border-indigo-500 transition-all">{s.resi_kode_booking || s.trackingNumber}</p>
                        ) : (
                          <p className="text-[10px] font-black text-rose-500 uppercase italic animate-pulse">Input Resi</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      (s.status === SettlementStatus.CAIR || s.statusCair === SettlementStatus.CAIR) ? 'bg-emerald-100 text-emerald-700' :
                      (s.status === SettlementStatus.DIRETUR || s.statusCair === SettlementStatus.DIRETUR) ? 'bg-rose-100 text-rose-700' :
                      (s.trackingNumber || s.resi_kode_booking) ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {(s.status === SettlementStatus.CAIR || s.statusCair === SettlementStatus.CAIR) ? 'DELIVERED' : 
                       (s.status === SettlementStatus.DIRETUR || s.statusCair === SettlementStatus.DIRETUR) ? 'DIRETUR' :
                       (s.trackingNumber || s.resi_kode_booking) ? 'IN TRANSIT' : 'QUEUED'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Lacak Paket">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center">
                      <Box size={40} className="mx-auto text-slate-100 mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada pengiriman terdaftar</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredSales.length > 0 && (
          <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total {filteredSales.length} Paket Keluar
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon: Icon, color, isUrgent }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-lg ${isUrgent ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}>
      <div className={`p-4 rounded-2xl ${colors[color] || 'bg-slate-50'}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

export default ShippingModule;
