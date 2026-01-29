
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardList, Search, Printer, Calendar, 
  Edit3, Trash2, ChevronLeft, ChevronRight, Save, X, Info,
  Download, FileText, Filter, RotateCcw
} from 'lucide-react';
import { PackingListRecord } from '../types';

interface PackingListModuleProps {
  packingRecords: PackingListRecord[];
  onAdd: (record: any) => void;
  onEdit: (id: string, record: any) => void;
  onDelete: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const PackingListModule: React.FC<PackingListModuleProps> = ({ 
  packingRecords, onEdit, onDelete, onNotify 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingKeterangan, setEditingKeterangan] = useState<{id: string, value: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return packingRecords.filter(record => {
      const query = searchQuery.toLowerCase();
      const nama = (record.namaCustomer || '').toLowerCase();
      const phone = (record.noHp || '').toLowerCase();
      const platform = (record.orderVia || '').toLowerCase();
      const courier = (record.kurir || '').toLowerCase();
      const ket = (record.keterangan || '').toLowerCase();
      
      const matchesSearch = nama.includes(query) || phone.includes(query) || platform.includes(query) || courier.includes(query) || ket.includes(query);
      const recordDate = new Date(record.tanggal);
      const matchesStart = !startDate || recordDate >= new Date(startDate);
      const matchesEnd = !endDate || recordDate <= new Date(endDate);
      return matchesSearch && matchesStart && matchesEnd;
    }).sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  }, [packingRecords, searchQuery, startDate, endDate]);

  const totalNotaSum = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.totalNota || 0), 0);
  }, [filteredData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return onNotify('Tidak ada data untuk diekspor', 'error');
    const headers = ["NO", "TANGGAL", "NAMA CUSTOMER", "NO HP", "ORDER VIA", "KURIR", "KETERANGAN", "TOTAL NOTA"];
    const csvRows = filteredData.map((record, index) => [
      index + 1, record.tanggal, `"${(record.namaCustomer || '').replace(/"/g, '""')}"`, `'${record.noHp}`, `"${record.orderVia}"`, `"${record.kurir}"`, `"${(record.keterangan || '').replace(/"/g, '""')}"`, record.totalNota
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Packing_List_${startDate || 'All'}_to_${endDate || 'All'}.csv`;
    link.click();
    onNotify('Laporan CSV Audit berhasil diunduh');
  };

  const handleSaveKeterangan = (id: string) => {
    if (!editingKeterangan) return;
    onEdit(id, { keterangan: editingKeterangan.value });
    setEditingKeterangan(null);
    onNotify('Keterangan diperbarui');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-heading">Packing List</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Audit Logistik & Pengiriman</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm"><Download size={16} /> Export CSV</button>
          <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"><Printer size={16} /> Print PDF</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group lg:col-span-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input type="text" placeholder="Cari Nama, No HP, atau Kurir..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
          </div>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-5 py-5 text-center w-12 border-r border-slate-800">No</th>
                <th className="px-5 py-5">Tanggal</th>
                <th className="px-5 py-5">Nama Customer</th>
                <th className="px-5 py-5">No HP</th>
                <th className="px-5 py-5">Order Via</th>
                <th className="px-5 py-5">Kurir</th>
                <th className="px-5 py-5">Keterangan</th>
                <th className="px-5 py-5 text-center">Nota</th>
                <th className="px-5 py-5 text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((record, index) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-center text-[10px] font-bold text-slate-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-[11px] font-black text-slate-900">{record.tanggal}</td>
                  <td className="px-5 py-4 text-xs font-black text-slate-800 uppercase tracking-tight">{record.namaCustomer}</td>
                  <td className="px-5 py-4 text-[11px] font-bold text-slate-600 font-mono">{record.noHp || '-'}</td>
                  <td className="px-5 py-4 text-[10px] font-black text-rose-700 uppercase">{record.orderVia}</td>
                  <td className="px-5 py-4 text-[10px] font-black text-blue-700 uppercase">{record.kurir}</td>
                  <td className="px-5 py-4 min-w-[150px]">
                    {editingKeterangan?.id === record.id ? (
                      <div className="flex items-center gap-2 print:hidden">
                        <input autoFocus value={editingKeterangan.value} onChange={(e) => setEditingKeterangan({...editingKeterangan, value: e.target.value})} className="flex-1 bg-white border border-indigo-300 rounded px-2 py-1 text-[10px] font-bold outline-none" />
                        <button onClick={() => handleSaveKeterangan(record.id)} className="text-emerald-600"><Save size={14}/></button>
                      </div>
                    ) : (
                      <div onClick={() => setEditingKeterangan({id: record.id, value: record.keterangan || ''})} className="flex justify-between items-center cursor-pointer group">
                        <p className={`text-[10px] font-bold ${record.keterangan ? 'text-slate-700' : 'text-slate-300 italic'}`}>{record.keterangan || 'N/A'}</p>
                        <Edit3 size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"/>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center"><span className="w-8 h-8 inline-flex items-center justify-center bg-indigo-600 text-white rounded-full text-[11px] font-black">{record.totalNota}</span></td>
                  <td className="px-5 py-4 text-center print:hidden"><button onClick={() => { if(confirm('Hapus?')) onDelete(record.id); }} className="p-2 text-rose-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackingListModule;
