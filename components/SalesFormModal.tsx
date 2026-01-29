
import { 
  AlertTriangle, Calculator, Calendar, CreditCard, DollarSign, 
  Hash, Info, MapPin, Package, Phone, Plus, Save, ShoppingBag, 
  Store, Tag, Truck, User, X, Briefcase, MapPinned, Receipt, 
  ChevronDown, ArrowRightLeft, TrendingUp, Trash2, ShoppingCart,
  ArrowRight
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bank, City, Expedition, FullSaleRecord, Lead, MarketplaceAccount, 
  PaymentStatusOption, Product, SettlementStatus, SaleItem 
} from '../types';

interface SalesFormModalProps {
  products: Product[];
  banks: Bank[];
  expeditions: Expedition[];
  leads: Lead[];
  marketplaces: MarketplaceAccount[];
  cities: City[];
  paymentStatuses: PaymentStatusOption[];
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: FullSaleRecord | null;
  mode?: 'add' | 'edit' | 'detail';
}

const SalesFormModal: React.FC<SalesFormModalProps> = ({ 
  marketplaces, products, banks, expeditions, leads, cities, paymentStatuses, 
  onClose, onSave, initialData, mode = 'add' 
}) => {
  const isReadOnly = mode === 'detail';

  const [items, setItems] = useState<SaleItem[]>(initialData?.items || [
    { productId: '', qty: 1, unitPrice: 0, hppPerUnit: 0 }
  ]);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    status_pembayaran: '',
    nama_bank: '',
    asal_leads: '',
    asal_kota: '',
    ongkir_pembeli: 0,
    biaya_admin: 0,
    ongkir_pengiriman: 0,
    no_pesanan: '',
    ekspedisi: '',
    status: SettlementStatus.DIPROSES,
    tgl_cair: '',
    mp_marketplace: '',
    nama_pembeli: '',
    akun_pembeli: '',
    alamat_pembeli: '',
    no_hp_cust: '',
    resi_kode_booking: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        tanggal: initialData.tanggal || '',
        status_pembayaran: initialData.status_pembayaran || '',
        nama_bank: initialData.nama_bank || '',
        asal_leads: initialData.asal_leads || '',
        asal_kota: initialData.asal_kota || '',
        ongkir_pembeli: initialData.ongkir_pembeli || 0,
        biaya_admin: initialData.biaya_admin || 0,
        ongkir_pengiriman: initialData.ongkir_pengiriman || 0,
        no_pesanan: initialData.no_pesanan || '',
        ekspedisi: initialData.ekspedisi || '',
        status: initialData.status || SettlementStatus.DIPROSES,
        tgl_cair: initialData.tgl_cair || '',
        mp_marketplace: initialData.mp_marketplace || '',
        nama_pembeli: initialData.nama_pembeli || '',
        akun_pembeli: initialData.akun_pembeli || '',
        alamat_pembeli: initialData.alamat_pembeli || '',
        no_hp_cust: initialData.no_hp_cust || '',
        resi_kode_booking: initialData.resi_kode_booking || '',
      });
      if (initialData.items) setItems(initialData.items);
    }
  }, [initialData]);

  // Financial Calculations - Fixed based on User Request
  const calculatedData = useMemo(() => {
    // 1. Total Penjualan (Jumlah Total)
    const totalPenjualan = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    
    // 2. Jml HPP = (qty * harga satuan hpp) + ongkir pembeli
    const totalHppItems = items.reduce((sum, item) => sum + (item.qty * item.hppPerUnit), 0);
    const totalBebanHpp = totalHppItems + formData.ongkir_pembeli;
    
    // 3. Laba = jumlah total - jml_hpp
    const totalLaba = totalPenjualan - totalBebanHpp;
    
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    const firstProduct = products.find(p => p.id === items[0]?.productId);
    
    return {
      totalPenjualan,
      totalBebanHpp,
      totalLaba,
      totalQty,
      firstItemName: firstProduct?.name || ''
    };
  }, [items, formData.ongkir_pembeli, products]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', qty: 1, unitPrice: 0, hppPerUnit: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: string) => {
    const newItems = [...items];
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = { 
        ...newItems[index], 
        productId: value,
        unitPrice: product ? (product.discountPrice || product.price) : 0,
        hppPerUnit: product ? product.hpp : 0 
      };
    } else {
      const numValue = value === '' ? 0 : Number(value);
      newItems[index] = { ...newItems[index], [field]: numValue };
    }
    
    setItems(newItems);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value 
    }));
  };

  const handleFinalSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      items,
      qty: calculatedData.totalQty,
      nama_barang: items.length > 1 ? `${calculatedData.firstItemName} (+${items.length-1})` : calculatedData.firstItemName,
      harga_satuan: items.length > 0 ? items[0].unitPrice : 0,
      jumlah: calculatedData.totalPenjualan,
      hpp_satuan: items.length > 0 ? items[0].hppPerUnit : 0,
      jml_hpp: calculatedData.totalBebanHpp,
      laba: calculatedData.totalLaba,
    };
    
    onSave(finalData);
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-full max-h-[95vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="px-12 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isReadOnly ? 'bg-slate-700' : 'bg-indigo-600'}`}>
              {isReadOnly ? <Receipt size={28} /> : <Plus size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight font-heading uppercase">
                {mode === 'add' ? 'Input Penjualan Multi-Produk' : mode === 'edit' ? 'Update Data Transaksi' : 'Tinjauan Detail Audit'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Professional Financial Compliance System</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all text-slate-300"><X size={24} /></button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleFinalSave} className="flex-1 overflow-y-auto no-scrollbar p-12 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* COLUMN 1: ITEMS SELECTION */}
            <div className="lg:col-span-8 space-y-8">
               <section className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100 shadow-inner space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={20} className="text-indigo-600" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Daftar Belanja Produk</h3>
                    </div>
                    {!isReadOnly && (
                      <button 
                        type="button" 
                        onClick={handleAddItem}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                      >
                        <Plus size={14}/> Tambah Produk
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-right duration-300 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        {/* Produk SKU */}
                        <div className="col-span-12 md:col-span-4 space-y-1.5">
                          <label className="input-label">Produk / SKU</label>
                          <div className="relative group">
                            <select 
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                              disabled={isReadOnly}
                              className="input-v5 appearance-none pr-10"
                              required
                            >
                              <option value="">-- Pilih Produk --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-600 transition-colors" size={16}/>
                          </div>
                        </div>

                        {/* Qty - Fix: Ensure visibility with !px-0 and text-black */}
                        <div className="col-span-4 md:col-span-1 space-y-1.5">
                          <label className="input-label">Qty</label>
                          <input 
                            type="number" 
                            value={item.qty === 0 ? '' : item.qty} 
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="0"
                            className="input-v5 !px-0 text-center font-black text-black bg-indigo-50 border-indigo-100 focus:bg-white text-base shadow-sm no-spinner" 
                            min="1" 
                            required 
                          />
                        </div>

                        {/* Harga Jual */}
                        <div className="col-span-8 md:col-span-3 space-y-1.5">
                          <label className="input-label">Harga Jual</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">Rp</span>
                            <input 
                              type="number" 
                              value={item.unitPrice === 0 ? '' : item.unitPrice} 
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              disabled={isReadOnly}
                              placeholder="0"
                              className="input-v5 pl-10 font-bold text-slate-700" 
                              required 
                            />
                          </div>
                        </div>

                        {/* HPP Satuan */}
                        <div className="col-span-10 md:col-span-3 space-y-1.5">
                          <label className="input-label">HPP Satuan (Modal)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">Rp</span>
                            <input 
                              type="number" 
                              value={item.hppPerUnit === 0 ? '' : item.hppPerUnit} 
                              onChange={(e) => handleItemChange(index, 'hppPerUnit', e.target.value)}
                              disabled={isReadOnly}
                              placeholder="0"
                              className="input-v5 pl-10 font-bold text-rose-500 bg-rose-50/30 border-rose-100" 
                              required 
                            />
                          </div>
                        </div>

                        {/* Hapus */}
                        <div className="col-span-2 md:col-span-1 flex items-center justify-center pb-1">
                          {!isReadOnly && items.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveItem(index)}
                              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm group"
                            >
                              <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Financial Details */}
                  <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                      <CreditCard size={20} className="text-emerald-600" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Rekonsiliasi Keuangan</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="input-label">Status Bayar</label>
                        <select name="status_pembayaran" value={formData.status_pembayaran} onChange={handleChange} disabled={isReadOnly} className="input-v5">
                          <option value="">-- Pilih --</option>
                          {paymentStatuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label">Bank Penerima</label>
                        <select name="nama_bank" value={formData.nama_bank} onChange={handleChange} disabled={isReadOnly} className="input-v5">
                          <option value="">-- Pilih Bank --</option>
                          {banks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label text-slate-400">Admin Platform</label>
                        <input 
                          type="number" 
                          name="biaya_admin" 
                          value={formData.biaya_admin === 0 ? '' : formData.biaya_admin} 
                          onChange={handleChange} 
                          disabled={isReadOnly} 
                          placeholder="0"
                          className="input-v5" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label text-slate-400 font-black text-indigo-600">Ongkir Pembeli (+)</label>
                        <input 
                          type="number" 
                          name="ongkir_pembeli" 
                          value={formData.ongkir_pembeli === 0 ? '' : formData.ongkir_pembeli} 
                          onChange={handleChange} 
                          disabled={isReadOnly} 
                          placeholder="0"
                          className="input-v5 bg-indigo-50/30" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label text-slate-400">Ongkir Riil</label>
                        <input 
                          type="number" 
                          name="ongkir_pengiriman" 
                          value={formData.ongkir_pengiriman === 0 ? '' : formData.ongkir_pengiriman} 
                          onChange={handleChange} 
                          disabled={isReadOnly} 
                          placeholder="0"
                          className="input-v5 text-rose-500" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label">Status Cair</label>
                        <select name="status" value={formData.status} onChange={handleChange} disabled={isReadOnly} className="input-v5 font-black uppercase text-[10px]">
                          {Object.values(SettlementStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Date & Core Info */}
                  <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                      <Calendar size={20} className="text-amber-600" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Waktu & Audit</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="input-label">Tanggal Transaksi</label>
                        <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} disabled={isReadOnly} className="input-v5" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label">Tanggal Dana Masuk</label>
                        <input type="date" name="tgl_cair" value={formData.tgl_cair} onChange={handleChange} disabled={isReadOnly} className="input-v5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="input-label">Asal Leads (Master Data)</label>
                        <div className="relative group">
                          <select 
                            name="asal_leads" 
                            value={formData.asal_leads} 
                            onChange={handleChange} 
                            disabled={isReadOnly} 
                            className="input-v5 appearance-none"
                            required
                          >
                            <option value="">-- Pilih Sumber Leads --</option>
                            {leads.map(l => <option key={l.id} value={l.source}>{l.source} ({l.city})</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-600 transition-colors" size={16}/>
                        </div>
                      </div>
                    </div>
                  </section>
               </div>
            </div>

            {/* COLUMN 2: CUSTOMER */}
            <div className="lg:col-span-4 space-y-8">
               <section className="bg-white p-8 rounded-[4rem] border border-slate-100 shadow-xl h-full space-y-8 flex flex-col">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <User size={20} className="text-indigo-600" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Identitas Pelanggan</h3>
                  </div>
                  <div className="space-y-5 flex-1">
                    <div className="space-y-1.5">
                      <label className="input-label">Nama Lengkap Pembeli</label>
                      <input type="text" name="nama_pembeli" value={formData.nama_pembeli} onChange={handleChange} disabled={isReadOnly} className="input-v5" placeholder="Masukkan nama..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                        <label className="input-label">Username Akun</label>
                        <input type="text" name="akun_pembeli" value={formData.akun_pembeli} onChange={handleChange} disabled={isReadOnly} className="input-v5" placeholder="@username" />
                       </div>
                       <div className="space-y-1.5">
                        <label className="input-label">WhatsApp</label>
                        <input type="text" name="no_hp_cust" value={formData.no_hp_cust} onChange={handleChange} disabled={isReadOnly} className="input-v5 font-mono" placeholder="08..." />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="input-label">Kota Tujuan</label>
                      <select name="asal_kota" value={formData.asal_kota} onChange={handleChange} disabled={isReadOnly} className="input-v5">
                        <option value="">-- Pilih Kota --</option>
                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="input-label">Alamat Lengkap Pengiriman</label>
                      <textarea name="alamat_pembeli" value={formData.alamat_pembeli} onChange={handleChange} disabled={isReadOnly} className="input-v5 h-24 resize-none pt-3" placeholder="Detail jalan, rt/rw, patokan..."></textarea>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 space-y-5">
                       <div className="flex items-center gap-3 mb-2">
                          <Truck size={20} className="text-blue-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ekspedisi & Tracking</h4>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="input-label">ID Pesanan</label>
                            <input type="text" name="no_pesanan" value={formData.no_pesanan} onChange={handleChange} disabled={isReadOnly} className="input-v5 font-mono uppercase bg-slate-50" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="input-label">Resi/Booking</label>
                            <input type="text" name="resi_kode_booking" value={formData.resi_kode_booking} onChange={handleChange} disabled={isReadOnly} className="input-v5 font-mono uppercase bg-slate-900 text-white border-none shadow-lg shadow-slate-200" placeholder="KODE RESI" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="input-label">Ekspedisi</label>
                            <select name="ekspedisi" value={formData.ekspedisi} onChange={handleChange} disabled={isReadOnly} className="input-v5">
                              <option value="">-- Kurir --</option>
                              {expeditions.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="input-label">Platform MP</label>
                            <select name="mp_marketplace" value={formData.mp_marketplace} onChange={handleChange} disabled={isReadOnly} className="input-v5">
                              <option value="">-- Toko --</option>
                              {marketplaces.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                          </div>
                       </div>
                    </div>
                  </div>
               </section>
            </div>
          </div>

          {/* FINANCIAL PROJECTOR */}
          <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl group border-4 border-white/5">
             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500">
                     <ShoppingCart size={18}/>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Penjualan (Jumlah Total)</p>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight">{formatIDR(calculatedData.totalPenjualan)}</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Akumulasi {calculatedData.totalQty} Unit</p>
                </div>
                <div className="space-y-3 border-y lg:border-y-0 lg:border-x border-white/10 py-10 lg:py-0 lg:px-12">
                  <div className="flex items-center gap-3 text-slate-500">
                     <ArrowRightLeft size={18}/>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Jml HPP (Beban Pokok)</p>
                  </div>
                  <h2 className="text-5xl font-black text-rose-400 tracking-tight">{formatIDR(calculatedData.totalBebanHpp)}</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">(Qty * HPP) + Ongkir Pembeli</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-emerald-400">
                     <TrendingUp size={22}/>
                     <p className="text-[11px] font-black uppercase tracking-[0.4em]">Estimasi Laba Bersih</p>
                  </div>
                  <h2 className={`text-6xl font-black tracking-tighter ${calculatedData.totalLaba >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {formatIDR(calculatedData.totalLaba)}
                  </h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Jumlah Total - Jml HPP</p>
                </div>
             </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-12 py-10 border-t border-slate-100 bg-slate-50 flex justify-end gap-6 shrink-0">
          <button onClick={onClose} className="px-10 py-5 rounded-[1.75rem] text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">Batal</button>
          {!isReadOnly && (
            <button 
              onClick={handleFinalSave} 
              className="flex items-center gap-4 px-20 py-5 bg-slate-900 text-white rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200 active:scale-95"
            >
              <Save size={20} /> Simpan Data Audit
            </button>
          )}
        </div>
      </div>
      <style>{`
        .input-label {
          display: block;
          font-size: 8px;
          font-weight: 900;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-left: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .input-v5 {
          width: 100%;
          padding: 1.15rem 1.5rem;
          background: #ffffff;
          border: 2px solid #f1f5f9;
          border-radius: 1.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          transition: all 0.3s;
        }
        .input-v5:focus {
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.15);
        }
        .input-v5:disabled {
          background: #f8fafc;
          border-color: transparent;
          color: #cbd5e1;
          cursor: not-allowed;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinner {
          -moz-appearance: textfield;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default SalesFormModal;
