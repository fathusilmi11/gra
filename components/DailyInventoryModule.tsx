
import { 
  AlertTriangle, Calendar, ChevronDown, ChevronLeft, Database, 
  Edit2, Package, Plus, Printer, Save, Search, Trash2, 
  Warehouse, X, Eye, Clock
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DailyInventory, Product, InventoryReportStatus, Employee } from '../types';

interface DailyInventoryModuleProps {
  products: Product[];
  dailyInventories: DailyInventory[];
  onAddInventory: (data: DailyInventory) => void;
  onUpdateInventory: (id: string, data: DailyInventory) => void;
  onDeleteInventory: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
  currentUser: Employee;
  isAdmin: boolean;
}

const DailyInventoryModule: React.FC<DailyInventoryModuleProps> = ({ 
  products, dailyInventories, onAddInventory, onUpdateInventory, onDeleteInventory, onNotify, currentUser, isAdmin 
}) => {
  const [view, setView] = useState<'table' | 'form'>('table');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DailyInventory>>({
    tanggal: new Date().toISOString().split('T')[0],
    barang_id: '',
    stok_awal: 0,
    barang_masuk: 0,
    keterangan_masuk: '',
    barang_keluar: 0,
    keterangan_keluar: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const calculatedStokAkhir = useMemo(() => {
    return (formData.stok_awal || 0) + (formData.barang_masuk || 0) - (formData.barang_keluar || 0);
  }, [formData.stok_awal, formData.barang_masuk, formData.barang_keluar]);

  const filteredData = useMemo(() => {
    return dailyInventories.filter(inv => 
      inv.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || inv.barang_id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [dailyInventories, searchQuery]);

  const handleOpenForm = (report?: DailyInventory) => {
    if (report) {
      setFormData(report);
      setEditingId(report.id);
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        barang_id: '',
        stok_awal: 0,
        barang_masuk: 0,
        keterangan_masuk: '',
        barang_keluar: 0,
        keterangan_keluar: '',
      });
      setEditingId(null);
    }
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barang_id) return onNotify('Pilih barang terlebih dahulu', 'error');
    
    const product = products.find(p => p.id === formData.barang_id);
    const now = new Date().toISOString();

    const data: DailyInventory = {
      ...(formData as DailyInventory),
      id: editingId || `INV-${Date.now()}`,
      nama_barang: product?.name || '',
      satuan: product?.satuan || '',
      stok_akhir: calculatedStokAkhir,
      status_laporan: InventoryReportStatus.DISETUJUI,
      input_oleh: currentUser.fullName,
      logs: [],
      created_at: editingId ? (dailyInventories.find(i => i.id === editingId)?.created_at || now) : now,
      updated_at: now
    };

    if (editingId) {
      onUpdateInventory(editingId, data);
      onNotify('Audit harian berhasil diperbarui dan stok disesuaikan');
    } else {
      onAddInventory(data);
      onNotify('Audit harian berhasil dicatat ke sistem');
    }

    setView('table');
  };

  const handleDelete = (id: string) => {
    if (confirm(`Hapus audit ini? Stok barang akan otomatis dikoreksi kembali.`)) {
      onDeleteInventory(id);
      onNotify('Audit berhasil dihapus dan stok dikembalikan');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight font-heading uppercase italic">Audit Buku Besar</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Data Integritas Stok Fisik</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
           <NavTab active={view === 'table'} onClick={() => setView('table')} icon={Database} label="Buku Besar" />
           <NavTab active={view === 'form' && !editingId} onClick={() => handleOpenForm()} icon={Plus} label="Input Mutasi Baru" />
        </div>
      </div>

      {view === 'table' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type="text" placeholder="Cari SKU atau Nama Barang..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" />
            </div>
            <button onClick={() => window.print()} className="p-5 bg-white border border-slate-200 rounded-[1.5rem] text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Printer size={20}/></button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                         <th className="px-10 py-7">TANGGAL</th>
                         <th className="px-10 py-7">SKU PRODUK</th>
                         <th className="px-10 py-7 text-center">AWAL</th>
                         <th className="px-10 py-7 text-center text-emerald-400">MASUK (+)</th>
                         <th className="px-10 py-7 text-center text-rose-400">KELUAR (-)</th>
                         <th className="px-10 py-7 text-center bg-slate-800 italic">SALDO AKHIR</th>
                         <th className="px-10 py-7 text-right">AKSI</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredData.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors text-[11px] font-bold text-slate-700 group">
                           <td className="px-10 py-6 whitespace-nowrap font-mono text-slate-400">{inv.tanggal}</td>
                           <td className="px-10 py-6 uppercase tracking-tight">
                              <p className="text-slate-900 font-black text-sm leading-none mb-1">{inv.nama_barang}</p>
                              <span className="text-[9px] text-indigo-500 font-black tracking-widest uppercase">{inv.barang_id}</span>
                           </td>
                           <td className="px-10 py-6 text-center text-slate-400 font-mono">{inv.stok_awal}</td>
                           <td className="px-10 py-6 text-center text-emerald-600 font-black">+{inv.barang_masuk}</td>
                           <td className="px-10 py-6 text-center text-rose-600 font-black">-{inv.barang_keluar}</td>
                           <td className="px-10 py-6 text-center bg-slate-50/50">
                              <span className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-xs shadow-lg">{inv.stok_akhir}</span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => handleOpenForm(inv)} className="p-3 bg-white border border-slate-200 text-amber-600 hover:bg-amber-50 rounded-xl shadow-sm transition-all active:scale-90" title="Koreksi Audit"><Edit2 size={14}/></button>
                                 <button onClick={() => handleDelete(inv.id)} className="p-3 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-xl shadow-sm transition-all active:scale-90" title="Batalkan Mutasi"><Trash2 size={14}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl space-y-10">
              <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl">
                    <Plus size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingId ? 'Edit' : 'Input'} Audit Mutasi</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Mutasi Sinkron Berbasis Data Barang Utama</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="input-label">TANGGAL MUTASI</label>
                       <input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="input-v5" required />
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">PILIH SKU PRODUK</label>
                       <div className="relative group">
                          <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <select value={formData.barang_id} onChange={e => {
                            const p = products.find(prod => prod.id === e.target.value);
                            setFormData({...formData, barang_id: e.target.value, stok_awal: p?.stock || 0});
                          }} className="input-v5 pl-14 appearance-none" required disabled={!!editingId}>
                             <option value="">-- Dropdown Barang --</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-inner">
                    <div className="space-y-2">
                       <label className="input-label">SALDO STOK BERJALAN</label>
                       <input type="number" value={formData.stok_awal} className="input-v5 text-xl font-black bg-white border-2 border-indigo-100 shadow-sm" readOnly />
                    </div>
                    <div className="space-y-2">
                       <label className="input-label text-emerald-600 font-black">MUTASI MASUK (+)</label>
                       <input type="number" value={formData.barang_masuk || ''} onChange={e => setFormData({...formData, barang_masuk: Number(e.target.value)})} className="input-v5 border-emerald-100 bg-emerald-50/30 text-xl font-black text-emerald-600" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                       <label className="input-label text-rose-600 font-black">MUTASI KELUAR (-)</label>
                       <input type="number" value={formData.barang_keluar || ''} onChange={e => setFormData({...formData, barang_keluar: Number(e.target.value)})} className="input-v5 text-xl font-black border-rose-100 bg-rose-50/30 text-rose-600" placeholder="0" />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-8 border-t border-slate-50">
                    <button type="button" onClick={() => setView('table')} className="flex-1 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-all">Batalkan</button>
                    <button type="submit" className="flex-[3] py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4">
                       <Save size={20}/> Simpan & Mutasi Stok
                    </button>
                 </div>
              </form>
           </div>

           <div className="lg:col-span-4">
              <div className="bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Saldo Prediktif</p>
                 <div className="space-y-1">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Sisa Akhir Baru</p>
                    <h2 className="text-8xl font-black tracking-tighter text-white">{calculatedStokAkhir}</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-6 italic">Otomatis Terverifikasi Sistem</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .input-label { display: block; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-left: 0.5rem; margin-bottom: 0.25rem; }
        .input-v5 { width: 100%; padding: 1.15rem 1.5rem; background: #ffffff; border: 2px solid #f1f5f9; border-radius: 1.5rem; font-size: 0.9rem; font-weight: 700; color: #0f172a; outline: none; transition: all 0.3s; }
        .input-v5:focus { background: #ffffff; border-color: #6366f1; box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.15); }
        .input-v5:disabled { background: #f8fafc; border-color: transparent; color: #cbd5e1; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

const NavTab = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
     <Icon size={14} /> {label}
  </button>
);

export default DailyInventoryModule;
