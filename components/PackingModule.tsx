
import React, { useState, useMemo } from 'react';
import { 
  Package, Search, CheckCircle2, Printer, Box, 
  Clock, AlertCircle, ShoppingCart, ArrowRight,
  ClipboardList, Filter, ChevronRight, AlertTriangle, Archive
} from 'lucide-react';
import { FullSaleRecord, Product } from '../types';

interface PackingModuleProps {
  sales: FullSaleRecord[];
  products: Product[];
  onUpdateSale: (id: string, updatedData: any) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const PackingModule: React.FC<PackingModuleProps> = ({ sales, products, onUpdateSale, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [packedItems, setPackedItems] = useState<Set<string>>(new Set());

  // Filter: Pesanan yang belum memiliki nomor resi (Siap Pack)
  const pendingPacking = useMemo(() => {
    return sales.filter(sale => !sale.trackingNumber && sale.statusCair !== 'DIRETUR')
      .filter(sale => 
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales, searchQuery]);

  const togglePacked = (id: string) => {
    const newPacked = new Set(packedItems);
    if (newPacked.has(id)) newPacked.delete(id);
    else newPacked.add(id);
    setPackedItems(newPacked);
  };

  const handleFinishPacking = (sale: FullSaleRecord) => {
    onNotify(`Order ${sale.orderNumber} selesai dipacking! Siap masukkan resi.`, 'success');
    // Di dunia nyata, ini bisa membuka modal input resi langsung
  };

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-heading">Antrean Packing</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Gudang & Kontrol Kualitas</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex items-center gap-4">
             <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                <Clock size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</p>
                <p className="text-xl font-black text-amber-900">{pendingPacking.length}</p>
             </div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex items-center gap-4">
             <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Siap Kirim</p>
                <p className="text-xl font-black text-emerald-900">{packedItems.size}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari Nama Pelanggan atau No. Pesanan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all"
          />
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
           <Printer size={18} /> Cetak Masal Packing Slip
        </button>
      </div>

      {/* Packing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pendingPacking.length > 0 ? pendingPacking.map((sale) => (
          <div key={sale.id} className={`bg-white rounded-[2.5rem] border-2 transition-all duration-300 overflow-hidden ${packedItems.has(sale.id) ? 'border-emerald-500 shadow-emerald-500/10' : 'border-slate-100 hover:border-indigo-200'}`}>
            {/* Card Header */}
            <div className={`p-6 border-b flex items-center justify-between ${packedItems.has(sale.id) ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                <p className="font-mono text-sm font-black text-slate-800">{sale.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">{sale.marketplaceAccount.split(' ')[0]}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-800 leading-tight">{sale.customerName}</h4>
                  {/* Fix: Using 'asal_kota' instead of 'leadCity' */}
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">{sale.asal_kota}</p>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-400">
                   <Box size={24} />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ClipboardList size={12} /> Daftar Barang ({sale.items.length})
                </p>
                {sale.items.map((item, idx) => {
                  const p = getProductDetails(item.productId);
                  return (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {item.qty}x
                         </div>
                         <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{p?.name || 'Unknown'}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p?.satuan}</span>
                    </div>
                  );
                })}
              </div>

              {/* Note / Alert */}
              {sale.items.length > 3 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                   <AlertTriangle size={14} />
                   <p className="text-[9px] font-black uppercase tracking-wider">Hati-hati: Pesanan Banyak!</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 pt-2 flex gap-3">
              <button 
                onClick={() => togglePacked(sale.id)}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  packedItems.has(sale.id) 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {packedItems.has(sale.id) ? <CheckCircle2 size={16} /> : <Box size={16} />}
                {packedItems.has(sale.id) ? 'Selesai Pack' : 'Konfirmasi Pack'}
              </button>
              <button className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                <Printer size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
             <div className="p-8 bg-slate-50 rounded-full mb-6">
                <Archive className="w-16 h-16 text-slate-200" />
             </div>
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Semua pesanan telah dipacking!</h3>
             <p className="text-slate-400 text-sm mt-2 font-bold max-w-xs uppercase">Belum ada pesanan baru yang membutuhkan pengemasan saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingModule;
