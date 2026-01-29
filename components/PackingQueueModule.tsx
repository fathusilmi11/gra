
import React, { useState, useMemo } from 'react';
import { 
  Boxes, Search, Clock, Box, MapPin, 
  CheckCircle2, 
  Package, Tag, X, Eye, Archive, Printer,
  ClipboardList, AlertTriangle,
  Truck, ExternalLink, ArrowRight
} from 'lucide-react';
import { FullSaleRecord, SettlementStatus, Product, Expedition, PackingListRecord } from '../types';

interface PackingQueueModuleProps {
  sales: FullSaleRecord[];
  products: Product[];
  expeditions: Expedition[];
  packingRecords: PackingListRecord[];
  onNotify: (message: string, type?: 'success' | 'error') => void;
  onProcessPacking: (sale: FullSaleRecord) => void;
}

const PackingQueueModule: React.FC<PackingQueueModuleProps> = ({ 
  sales, products, expeditions, packingRecords, onNotify, onProcessPacking 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<FullSaleRecord | null>(null);

  const isAlreadyPacked = (orderNumber: string) => {
    return packingRecords.some(pr => pr.orderIds?.includes(orderNumber));
  };

  const queueData = useMemo(() => {
    return sales
      .filter(s => !s.trackingNumber && s.statusCair !== SettlementStatus.DIRETUR)
      .filter(s => {
        const query = searchQuery.toLowerCase();
        const orderNum = (s.orderNumber || s.no_pesanan || '').toLowerCase();
        const custName = (s.customerName || s.nama_pembeli || '').toLowerCase();
        const city = (s.asal_kota || '').toLowerCase();
        
        return (
          orderNum.includes(query) ||
          custName.includes(query) ||
          city.includes(query)
        );
      })
      .sort((a, b) => new Date(a.date || a.tanggal || '').getTime() - new Date(b.date || b.tanggal || '').getTime());
  }, [sales, searchQuery]);

  const stats = useMemo(() => ({
    total: queueData.length,
    waiting: queueData.filter(s => !isAlreadyPacked(s.orderNumber || s.no_pesanan || '')).length,
    processed: queueData.filter(s => isAlreadyPacked(s.orderNumber || s.no_pesanan || '')).length
  }), [queueData, packingRecords]);

  const getExpeditionName = (id: string) => expeditions.find(e => e.id === id)?.name || 'Unknown';
  const getProductInfo = (id: string) => products.find(p => p.id === id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight font-heading uppercase italic">Logistik Fulfillment</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Antrean Kerja Tim Gudang & Packing</p>
        </div>
        <div className="flex gap-4">
          <StatMiniCard label="Menunggu" value={stats.waiting} color="amber" icon={Clock} />
          <StatMiniCard label="Tuntas" value={stats.processed} color="emerald" icon={CheckCircle2} />
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari SKU, Nama Pelanggan, atau Kota Tujuan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
        <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3">
           <Printer size={18} /> Cetak Label Masal
        </button>
      </div>

      {/* Optimized Table View */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left table-fixed min-w-[1000px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6 w-16 text-center">No</th>
                <th className="px-8 py-6 w-48">ID Pesanan</th>
                <th className="px-8 py-6 w-56">Pelanggan</th>
                <th className="px-8 py-6 w-40 text-center">Platform</th>
                <th className="px-8 py-6 w-auto">Manifest Barang</th>
                <th className="px-8 py-6 w-40">Kurir</th>
                <th className="px-8 py-6 w-48 text-right">Aksi Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueData.length > 0 ? queueData.map((sale, idx) => {
                const packed = isAlreadyPacked(sale.orderNumber || sale.no_pesanan || '');
                return (
                  <tr key={sale.id} className={`group hover:bg-slate-50/50 transition-colors duration-300 ${packed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                    <td className="px-8 py-6 text-center text-[10px] font-black text-slate-300 italic">
                      {idx + 1}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono text-xs font-black text-indigo-600">#{ (sale.orderNumber || sale.no_pesanan || '').slice(-10).toUpperCase() }</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{sale.date || sale.tanggal}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{sale.customerName || sale.nama_pembeli}</p>
                      <p className="text-[10px] font-bold text-rose-400 mt-0.5 flex items-center gap-1 uppercase">
                        <MapPin size={10} /> {sale.asal_kota}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                         {(sale.marketplaceAccount || sale.mp_marketplace || 'N/A').split(' ')[0]}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1.5">
                          {sale.items?.map((item, i) => {
                            const p = getProductInfo(item.productId);
                            return (
                              <div key={i} className="flex items-center gap-2">
                                 <span className="w-5 h-5 flex items-center justify-center bg-slate-900 text-white rounded text-[9px] font-black shrink-0">{item.qty}</span>
                                 <p className="text-[11px] font-bold text-slate-600 truncate max-w-[180px] uppercase">{p?.name || 'Item Master'}</p>
                              </div>
                            );
                          })}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase">
                          <Truck size={14} className="text-indigo-400" />
                          {getExpeditionName(sale.expeditionId || sale.ekspedisi || '')}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedDetail(sale)}
                            className="p-2.5 bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                            title="Tinjau Detail"
                          >
                             <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => onProcessPacking(sale)}
                            disabled={packed}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              packed 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg active:scale-95'
                            }`}
                          >
                            {packed ? <CheckCircle2 size={14} /> : <Box size={14} />}
                            {packed ? 'Selesai' : 'Packing'}
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                   <td colSpan={7} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                            <Archive size={40} className="text-slate-200" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Antrean Terpenuhi</h3>
                            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest italic">Belum ada pesanan baru yang memerlukan verifikasi packing.</p>
                         </div>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating View Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl"><Boxes size={28}/></div>
                 <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Review Pesanan Audit</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Order #...{(selectedDetail.orderNumber || selectedDetail.no_pesanan || '').slice(-8)}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all text-slate-300"><X size={28}/></button>
            </div>
            <div className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nama Penerima</p>
                  <p className="text-lg font-black text-slate-800">{selectedDetail.customerName || selectedDetail.nama_pembeli}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Kontak WhatsApp</p>
                  <p className="text-lg font-black text-slate-800">{selectedDetail.customerPhone || selectedDetail.no_hp_cust}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Tag size={14} className="text-indigo-500" /> Item Manifest
                </p>
                <div className="space-y-3">
                  {selectedDetail.items?.map((item, i) => {
                    const p = getProductInfo(item.productId);
                    return (
                      <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="min-w-0">
                           <p className="text-xs font-black text-slate-800 truncate">{p?.name || 'Unknown'}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">{p?.id}</p>
                        </div>
                        <span className="text-[11px] font-black text-indigo-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">{item.qty} {p?.satuan || 'Pcs'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">
                    <span className="text-slate-500">Expedisi / Kurir</span>
                    <span className="text-indigo-400">{getExpeditionName(selectedDetail.expeditionId || selectedDetail.ekspedisi || '')}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Lokasi Tujuan</span>
                    <span className="text-slate-200 uppercase">{selectedDetail.asal_kota}</span>
                 </div>
              </div>
            </div>
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setSelectedDetail(null)} className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Tutup Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatMiniCard = ({ label, value, color, icon: Icon }: any) => {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50'
  };
  return (
    <div className={`flex items-center gap-4 px-6 py-4 rounded-3xl border shadow-lg ${colors[color]}`}>
       <div className={`p-2.5 rounded-xl bg-white shadow-sm`}><Icon size={18} /></div>
       <div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</p>
          <p className="text-2xl font-black mt-0.5 leading-none">{value}</p>
       </div>
    </div>
  );
};

export default PackingQueueModule;
