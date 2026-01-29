
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Package, Landmark, MapPin, Users, Plus, Edit2, Trash2, X, Save, 
  DollarSign, TrendingUp, Info, Search, ChevronLeft, ChevronRight, 
  Hash, Globe, Smartphone, Store as StoreIcon, Truck, LayoutGrid, 
  CreditCard, Boxes, Tag, Briefcase, FileText, Warehouse, MapPinned,
  Compass, Target, Ruler, ChevronDown, RotateCcw, Loader2, CheckCircle2,
  Eye, MoreVertical, ShieldCheck, Database, AlertTriangle
} from 'lucide-react';
import { Product, Bank, Expedition, Lead, MarketplaceAccount, City, PaymentStatusOption, OfficeConfig, ProductUnit } from '../types';

interface MasterDataProps {
  products: Product[];
  productUnits: ProductUnit[];
  banks: Bank[];
  expeditions: Expedition[];
  leads: Lead[];
  marketplaces: MarketplaceAccount[];
  cities: City[];
  paymentStatuses: PaymentStatusOption[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (id: string, product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddUnit: (unit: ProductUnit) => void;
  onUpdateUnit: (id: string, unit: ProductUnit) => void;
  onDeleteUnit: (id: string) => void;
  onAddBank: (bank: Bank) => void;
  onUpdateBank: (id: string, bank: Bank) => void;
  onDeleteBank: (id: string) => void;
  onAddExpedition: (exp: Expedition) => void;
  onUpdateExpedition: (id: string, exp: Expedition) => void;
  onDeleteExpedition: (id: string) => void;
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (id: string, lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onAddMarketplace: (mp: MarketplaceAccount) => void;
  onUpdateMarketplace: (id: string, mp: MarketplaceAccount) => void;
  onDeleteMarketplace: (id: string) => void;
  onAddCity: (city: City) => void;
  onUpdateCity: (id: string, city: City) => void;
  onDeleteCity: (id: string) => void;
  onAddPaymentStatus: (ps: PaymentStatusOption) => void;
  onUpdatePaymentStatus: (id: string, ps: PaymentStatusOption) => void;
  onDeletePaymentStatus: (id: string) => void;
  officeConfig?: OfficeConfig;
  onUpdateOfficeConfig?: (config: OfficeConfig) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const MasterDataModule: React.FC<MasterDataProps> = ({ 
  products, productUnits, banks, expeditions, leads, marketplaces, cities, paymentStatuses,
  onAddProduct, onUpdateProduct, onDeleteProduct,
  onAddUnit, onUpdateUnit, onDeleteUnit,
  onAddBank, onUpdateBank, onDeleteBank,
  onAddExpedition, onUpdateExpedition, onDeleteExpedition,
  onAddLead, onUpdateLead, onDeleteLead,
  onAddMarketplace, onUpdateMarketplace, onDeleteMarketplace,
  onAddCity, onUpdateCity, onDeleteCity,
  onAddPaymentStatus, onUpdatePaymentStatus, onDeletePaymentStatus,
  officeConfig, onUpdateOfficeConfig, onNotify
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'units' | 'banks' | 'marketplaces' | 'expeditions' | 'leads' | 'cities' | 'paymentStatuses' | 'office'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const itemsPerPage = 10;
  const tabsRef = useRef<HTMLDivElement>(null);

  const [officeForm, setOfficeForm] = useState<OfficeConfig>(officeConfig || { lat: -7.712094242672099, lng: 109.74015939318106, radius: 500, addressName: 'Grha Indonesia Organik' });

  useEffect(() => {
    if (officeConfig) setOfficeForm(officeConfig);
  }, [officeConfig]);

  const subTabs = [
    { id: 'products', label: 'Produk SKU', icon: Package, color: 'indigo' },
    { id: 'units', label: 'Satuan', icon: Ruler, color: 'emerald' },
    { id: 'banks', label: 'Bank', icon: Landmark, color: 'emerald' },
    { id: 'marketplaces', label: 'Marketplace', icon: StoreIcon, color: 'indigo' },
    { id: 'expeditions', label: 'Ekspedisi', icon: Truck, color: 'amber' },
    { id: 'cities', label: 'Asal Kota', icon: MapPin, color: 'rose' },
    { id: 'paymentStatuses', label: 'Status Bayar', icon: CreditCard, color: 'blue' },
    { id: 'leads', label: 'Leads', icon: Users, color: 'rose' },
    { id: 'office', label: 'Geofencing', icon: MapPinned, color: 'indigo' },
  ];

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeSubTab]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    switch(activeSubTab) {
      case 'products': return products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
      case 'units': return productUnits.filter(u => u.name.toLowerCase().includes(q));
      case 'marketplaces': return marketplaces.filter(m => m.name.toLowerCase().includes(q));
      case 'banks': return banks.filter(b => b.name.toLowerCase().includes(q));
      case 'expeditions': return expeditions.filter(e => e.name.toLowerCase().includes(q));
      case 'cities': return cities.filter(c => c.name.toLowerCase().includes(q));
      case 'paymentStatuses': return paymentStatuses.filter(ps => ps.name.toLowerCase().includes(q));
      case 'leads': return leads.filter(l => l.source.toLowerCase().includes(q));
      default: return [];
    }
  }, [activeSubTab, products, productUnits, banks, expeditions, leads, marketplaces, cities, paymentStatuses, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleOpenModal = (mode: 'add' | 'edit' | 'detail', item: any = null) => {
    setModalMode(mode);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    switch(activeSubTab) {
      case 'products': modalMode === 'edit' ? onUpdateProduct(editingItem.id, data) : onAddProduct(data); break;
      case 'units': modalMode === 'edit' ? onUpdateUnit(editingItem.id, data) : onAddUnit(data); break;
      case 'banks': modalMode === 'edit' ? onUpdateBank(editingItem.id, data) : onAddBank(data); break;
      case 'marketplaces': modalMode === 'edit' ? onUpdateMarketplace(editingItem.id, data) : onAddMarketplace(data); break;
      case 'expeditions': modalMode === 'edit' ? onUpdateExpedition(editingItem.id, data) : onAddExpedition(data); break;
      case 'leads': modalMode === 'edit' ? onUpdateLead(editingItem.id, data) : onAddLead(data); break;
      case 'cities': modalMode === 'edit' ? onUpdateCity(editingItem.id, data) : onAddCity(data); break;
      case 'paymentStatuses': modalMode === 'edit' ? onUpdatePaymentStatus(editingItem.id, data) : onAddPaymentStatus(data); break;
    }
    onNotify?.(`Data ${data.id} berhasil ${modalMode === 'add' ? 'ditambahkan' : 'diperbarui'}`, 'success');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if(confirm(`Apakah Anda yakin ingin menghapus data dengan kode ${id}? Tindakan ini permanen.`)) {
      switch(activeSubTab) {
        case 'products': onDeleteProduct(id); break;
        case 'units': onDeleteUnit(id); break;
        case 'banks': onDeleteBank(id); break;
        case 'marketplaces': onDeleteMarketplace(id); break;
        case 'expeditions': onDeleteExpedition(id); break;
        case 'leads': onDeleteLead(id); break;
        case 'cities': onDeleteCity(id); break;
        case 'paymentStatuses': onDeletePaymentStatus(id); break;
      }
      onNotify?.('Data berhasil dihapus dari sistem master', 'success');
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 250;
      tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const getCurrentPosition = () => {
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOfficeForm({ ...officeForm, lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGpsLoading(false);
        onNotify?.('Titik Koordinat Berhasil Terkunci!', 'success');
      },
      () => {
        setIsGpsLoading(false);
        onNotify?.('Gagal mengambil lokasi GPS', 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Sub-Tab Scrollable Navigation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="relative group max-w-full lg:max-w-4xl">
          <button onClick={() => scrollTabs('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"><ChevronLeft size={16}/></button>
          <div ref={tabsRef} className="flex items-center gap-2 bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
            {subTabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveSubTab(tab.id as any); }} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSubTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><tab.icon size={14} />{tab.label}</button>
            ))}
          </div>
          <button onClick={() => scrollTabs('right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"><ChevronRight size={16}/></button>
        </div>

        {activeSubTab !== 'office' && (
          <button onClick={() => handleOpenModal('add')} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-3.5 rounded-[1.25rem] text-[10px] font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95">
            <Plus size={18} /> Tambah Data {subTabs.find(t => t.id === activeSubTab)?.label}
          </button>
        )}
      </div>

      {activeSubTab === 'office' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Compass size={24}/></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Konfigurasi Geofencing</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onUpdateOfficeConfig?.(officeForm); onNotify?.('Lokasi Disimpan', 'success'); }} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Area</label>
                  <input type="text" value={officeForm.addressName} onChange={e => setOfficeForm({...officeForm, addressName: e.target.value})} className="input-v5" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lat</label>
                    <input type="number" step="any" value={officeForm.lat} onChange={e => setOfficeForm({...officeForm, lat: parseFloat(e.target.value)})} className="input-v5" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lng</label>
                    <input type="number" step="any" value={officeForm.lng} onChange={e => setOfficeForm({...officeForm, lng: parseFloat(e.target.value)})} className="input-v5" required />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">Radius Toleransi <span>{officeForm.radius}m</span></label>
                  <input type="range" min="50" max="2000" step="50" value={officeForm.radius} onChange={e => setOfficeForm({...officeForm, radius: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={getCurrentPosition} disabled={isGpsLoading} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3">{isGpsLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16}/>} GPS Sync</button>
                  <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Simpan Koordinat</button>
               </div>
            </form>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <Target size={48} className="text-indigo-400 mb-8" />
             <h4 className="text-3xl font-black uppercase tracking-tight">Master Pusat</h4>
             <p className="text-slate-400 text-sm font-bold mt-4 uppercase italic leading-relaxed">Titik ini digunakan sebagai referensi tunggal perhitungan radius absensi. Pastikan koordinat akurat guna mencegah kesalahan deteksi lokasi karyawan.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input type="text" placeholder={`Cari data ${subTabs.find(t => t.id === activeSubTab)?.label}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner" />
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ditemukan <span className="text-indigo-600">{filteredItems.length}</span> Entri</span>
               <button onClick={() => setSearchQuery('')} className="p-4 text-slate-300 hover:text-rose-500 transition-colors"><RotateCcw size={18}/></button>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                    <th className="px-8 py-6 w-32 border-r border-slate-800 text-center">Aksi Audit</th>
                    <th className="px-8 py-6">ID / Kode</th>
                    <th className="px-8 py-6">Informasi Utama</th>
                    {activeSubTab === 'products' && (
                      <>
                        <th className="px-8 py-6 text-right">Harga Jual</th>
                        <th className="px-8 py-6 text-center">Satuan</th>
                        <th className="px-8 py-6 text-center">Stok</th>
                      </>
                    )}
                    {activeSubTab === 'leads' && <th className="px-8 py-6">Lokasi</th>}
                    <th className="px-8 py-6 text-right">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 border-r border-slate-50">
                        <div className="flex items-center justify-center gap-2">
                           <button onClick={() => handleOpenModal('detail', item)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-90" title="Tinjau Detail"><Eye size={14}/></button>
                           <button onClick={() => handleOpenModal('edit', item)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-90" title="Edit Data"><Edit2 size={14}/></button>
                           <button onClick={() => handleDelete(item.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-90" title="Hapus Data"><Trash2 size={14}/></button>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-[10px] font-black text-indigo-400 uppercase">{item.id}</td>
                      <td className="px-8 py-5">
                         <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{item.name || item.source}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Master Context</p>
                      </td>
                      {activeSubTab === 'products' && (
                        <>
                          <td className="px-8 py-5 text-right font-black text-slate-900 font-mono text-xs">{formatIDR(item.discountPrice || item.price)}</td>
                          <td className="px-8 py-5 text-center"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.satuan}</span></td>
                          <td className="px-8 py-5 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${item.stock < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{item.stock}</span>
                          </td>
                        </>
                      )}
                      {activeSubTab === 'leads' && <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">{item.city}</td>}
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-tighter">
                            <CheckCircle2 size={12}/> Verified
                         </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                       <td colSpan={10} className="px-8 py-20 text-center">
                          <Database size={48} className="mx-auto text-slate-100 mb-4" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Data tidak ditemukan pada repositori master</p>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all disabled:opacity-30"><ChevronLeft size={20} /></button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all disabled:opacity-30"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <ItemModal 
          activeSubTab={activeSubTab} 
          item={editingItem} 
          mode={modalMode}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
          subTabs={subTabs}
          productUnits={productUnits}
        />
      )}

      <style>{`
        .input-v5 { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-size: 0.9rem; font-weight: 700; color: #1e293b; outline: none; transition: all 0.25s; }
        .input-v5:focus { background: #ffffff; border-color: #6366f1; box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.15); }
        .input-v5:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const ItemModal = ({ activeSubTab, item, mode, onClose, onSave, subTabs, productUnits }: any) => {
  const currentTab = subTabs.find((t: any) => t.id === activeSubTab);
  const Icon = currentTab?.icon || Package;
  const isReadOnly = mode === 'detail';

  const [formData, setFormData] = useState({ 
    id: item?.id || '', 
    name: item?.name || item?.source || '', 
    price: item?.price || 0, 
    discountPrice: item?.discountPrice || 0,
    hpp: item?.hpp || 0, 
    satuan: item?.satuan || (productUnits && productUnits.length > 0 ? productUnits[0].name : 'Pcs'),
    stock: item?.stock || 0
  });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (isReadOnly) return onClose();
    if(activeSubTab === 'leads') onSave({ id: formData.id || `l${Date.now()}`, source: formData.name, city: 'Default' });
    else onSave({ ...formData });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        <div className="px-10 py-8 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl shadow-xl ${isReadOnly ? 'bg-slate-700' : 'bg-slate-900'} text-white flex items-center justify-center`}>
              {isReadOnly ? <Eye size={28} /> : <Icon size={28} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight font-heading">
                {mode === 'add' ? 'Entri Data Baru' : mode === 'edit' ? 'Modifikasi Data' : 'Informasi Rinci Data'}
              </h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit {currentTab?.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all text-slate-300"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white overflow-y-auto no-scrollbar flex-1">
          {/* Warning Message for Sensitive Field Update */}
          {!isReadOnly && mode === 'edit' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
              <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
              <div>
                <p className="text-[10px] font-black text-amber-900 uppercase">Perhatian: Perubahan Kode Identitas</p>
                <p className="text-[9px] font-bold text-amber-700 leading-relaxed uppercase">Mengubah kode identitas (ID/SKU) akan mempengaruhi pencatatan riwayat di modul lain. Pastikan perubahan ini diperlukan.</p>
              </div>
            </div>
          )}

          {activeSubTab === 'products' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KODE SKU</label>
                  <input 
                    type="text" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})} 
                    placeholder="SKU-ID" 
                    className={`input-v5 ${mode === 'edit' ? 'border-amber-200 bg-amber-50/20' : ''}`}
                    disabled={isReadOnly} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">SATUAN UTAMA</label>
                  <select value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} className="input-v5" disabled={isReadOnly} required>
                    {productUnits.map((u: any) => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">NAMA LENGKAP PRODUK</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Input nama produk..." className="input-v5" disabled={isReadOnly} required />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">HARGA RETAIL (RP)</label>
                  <input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="input-v5" disabled={isReadOnly} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">HARGA FINAL DISKON (RP)</label>
                  <input type="number" value={formData.discountPrice || ''} onChange={e => setFormData({...formData, discountPrice: Number(e.target.value)})} className="input-v5 border-emerald-100 bg-emerald-50/20" disabled={isReadOnly} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">BEBAN HPP (RP)</label>
                  <input type="number" value={formData.hpp || ''} onChange={e => setFormData({...formData, hpp: Number(e.target.value)})} className="input-v5 border-rose-100 bg-rose-50/20" disabled={isReadOnly} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">SALDO STOK FISIK</label>
                  <input type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="input-v5 border-indigo-100 bg-indigo-50/20 font-black" disabled={isReadOnly} required />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KODE IDENTITAS DATA</label>
                <input 
                  type="text" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})} 
                  className={`input-v5 ${mode === 'edit' ? 'border-amber-200 bg-amber-50/20' : ''}`}
                  disabled={isReadOnly} 
                  required 
                  placeholder="ID_KODE" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">DESKRIPSI / NAMA DATA</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-v5 font-black text-lg" disabled={isReadOnly} required />
              </div>
            </div>
          )}

          {isReadOnly ? (
             <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-4">
                <div className="flex items-center gap-3 mb-2">
                   <ShieldCheck size={20} className="text-emerald-400" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sistem Audit Verified</p>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase italic">Data ini terkunci dalam mode pratinjau. Anda tidak dapat melakukan perubahan tanpa hak akses edit.</p>
             </div>
          ) : (
             <div className="flex gap-4 pt-4">
               <button type="button" onClick={onClose} className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Batalkan</button>
               <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3">
                 <Save size={18} /> Simpan Perubahan Audit
               </button>
             </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MasterDataModule;
