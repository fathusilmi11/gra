
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, CalendarClock, Search, Edit3, Trash2, 
  Key, ShieldAlert, CheckCircle2, XCircle, Plus, Save, X, Phone, 
  User, Calendar, Tag, Info, Smartphone, Briefcase, Clock, 
  AlertTriangle, RotateCcw, ChevronDown, Eye, EyeOff, Layers, Palette
} from 'lucide-react';
import { Employee, EmployeeStatus, UserRole, Role, WorkSchedule } from '../types';

interface EmployeeModuleProps {
  employees: Employee[];
  roles: Role[];
  schedules: WorkSchedule[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (id: string, emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onAddRole: (role: Role) => void;
  onUpdateRole: (id: string, role: Role) => void;
  onDeleteRole: (id: string) => void;
  onAddSchedule: (sch: WorkSchedule) => void;
  onUpdateSchedule: (id: string, sch: WorkSchedule) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const EmployeeModule: React.FC<EmployeeModuleProps> = ({ 
  employees, roles, schedules, 
  onAddEmployee, onUpdateEmployee, onDeleteEmployee, 
  onAddRole, onUpdateRole, onDeleteRole,
  onAddSchedule, onUpdateSchedule, onNotify 
}) => {
  const [activeTab, setActiveTab] = useState<'data' | 'role' | 'schedule'>('data');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'employee' | 'role' | 'schedule'>('employee');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // State for toggling password visibility in the list
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           emp.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || emp.roleId === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  const handleOpenModal = (type: 'employee' | 'role' | 'schedule', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (data: any) => {
    if (editingItem) {
      const updatedEmployee = { ...editingItem, ...data };
      onUpdateEmployee(editingItem.id, updatedEmployee);
      onNotify(`Data ${data.fullName} berhasil diperbarui`, 'success');
    } else {
      const newId = `EMP-${Date.now()}`;
      onAddEmployee({ ...data, id: newId });
      onNotify(`Karyawan ${data.fullName} berhasil didaftarkan`, 'success');
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveRole = (data: any) => {
    if (editingItem) {
      onUpdateRole(editingItem.id, data);
      onNotify(`Role ${data.name} diperbarui`, 'success');
    } else {
      onAddRole({ ...data, id: `role-${Date.now()}` });
      onNotify(`Role ${data.name} berhasil ditambahkan`, 'success');
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus = emp.status === EmployeeStatus.AKTIF ? EmployeeStatus.NONAKTIF : EmployeeStatus.AKTIF;
    if (confirm(`Apakah Anda yakin ingin ${newStatus === EmployeeStatus.AKTIF ? 'mengaktifkan' : 'menonaktifkan'} akun ${emp.fullName}?`)) {
      onUpdateEmployee(emp.id, { ...emp, status: newStatus });
      onNotify(`Akun ${emp.fullName} kini ${newStatus}`, 'success');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={Users} label="Data Karyawan" />
          <TabButton active={activeTab === 'role'} onClick={() => setActiveTab('role')} icon={Shield} label="Manajemen Role" />
          <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={CalendarClock} label="Jadwal Kerja" />
        </div>
        
        <div className="flex gap-4">
          {activeTab === 'data' && (
            <button 
              onClick={() => handleOpenModal('employee')}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-1.25rem text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
            >
              <UserPlus size={18} /> Tambah Karyawan
            </button>
          )}
          {activeTab === 'role' && (
            <button 
              onClick={() => handleOpenModal('role')}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-1.25rem text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
            >
              <Shield size={18} /> Buat Role Baru
            </button>
          )}
          {activeTab === 'schedule' && (
            <button 
              onClick={() => handleOpenModal('schedule')}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-1.25rem text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
            >
              <Plus size={18} /> Konfigurasi Jam
            </button>
          )}
        </div>
      </div>

      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Cari Nama atau Username..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none min-w-[160px]"
              >
                <option value="ALL">SEMUA ROLE</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none min-w-[160px]"
              >
                <option value="ALL">SEMUA STATUS</option>
                <option value={EmployeeStatus.AKTIF}>AKTIF</option>
                <option value={EmployeeStatus.NONAKTIF}>NONAKTIF</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-6 sticky left-0 bg-slate-900 z-10 w-32 border-r border-slate-800">Aksi</th>
                    <th className="px-8 py-6">Profil Karyawan</th>
                    <th className="px-8 py-6">Username</th>
                    <th className="px-8 py-6">Kata Sandi</th>
                    <th className="px-8 py-6">Kontak</th>
                    <th className="px-8 py-6">Role Sistem</th>
                    <th className="px-8 py-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 sticky left-0 bg-white/95 backdrop-blur z-10 border-r border-slate-100 group-hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenModal('employee', emp)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl shadow-sm transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => { if(confirm('Hapus permanen data karyawan?')) onDeleteEmployee(emp.id); }} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-white shadow-sm ${emp.status === EmployeeStatus.AKTIF ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                            {emp.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{emp.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mulai: {emp.joinDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <code className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">@{emp.username}</code>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <span className="font-mono text-xs font-bold text-slate-500">
                              {visiblePasswords[emp.id] ? emp.password : '••••••••'}
                           </span>
                           <button 
                            onClick={() => togglePasswordVisibility(emp.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                           >
                              {visiblePasswords[emp.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                           </button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <Smartphone size={12} className="text-slate-300" /> {emp.phone}
                        </p>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {roles.find(r => r.id === emp.roleId)?.name || emp.roleId?.replace('_', ' ') || ''}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleToggleStatus(emp)}
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                            emp.status === EmployeeStatus.AKTIF ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {emp.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                         <Users size={48} className="mx-auto text-slate-100 mb-4" />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data karyawan tidak ditemukan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'role' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {roles.map(role => (
             <div key={role.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm group hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 bg-slate-900 group-hover:opacity-10 transition-opacity`} />
                
                <div className="flex justify-between items-start mb-8">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <Shield size={32} />
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total SDM</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{employees.filter(e => e.roleId === role.id).length}</p>
                   </div>
                </div>

                <div className="flex-1">
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight font-heading">{role.name}</h3>
                   <div className="w-10 h-1 bg-indigo-500 my-4 rounded-full" />
                   <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase italic">"{role.description}"</p>
                </div>
                
                <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role Aktif</span>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal('role', role)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        title="Edit Role"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(confirm(`Hapus role ${role.name}?`)) onDeleteRole(role.id); }}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                        title="Hapus Role"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-indigo-900 p-8 rounded-[3rem] text-white flex items-center gap-6 relative overflow-hidden shadow-2xl">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-md">
                <Info size={32} className="text-indigo-300" />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Kebijakan Operasional</h3>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest leading-relaxed">
                   Hari Kerja: <span className="text-white">Senin s/d Sabtu</span> • Hari Libur: <span className="text-white">Minggu & Libur Nasional/Islam</span>
                </p>
                <p className="text-[10px] font-medium text-indigo-400 mt-2 italic leading-none">
                  *Libur Islam mencakup Hari Raya Idul Fitri, Idul Adha, Tahun Baru Hijriah, Maulid Nabi, Isra Mi'raj.
                </p>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Master Konfigurasi Jadwal Kerja</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sinkronisasi Absensi Real-time</p>
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-10 py-6">Role Terkait</th>
                    <th className="px-10 py-6 text-center">Jam Masuk</th>
                    <th className="px-10 py-6 text-center">Jam Pulang</th>
                    <th className="px-10 py-6 text-center">Toleransi</th>
                    <th className="px-10 py-6 text-center">Status</th>
                    <th className="px-10 py-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schedules.map(sch => (
                    <tr key={sch.id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-10 py-6 whitespace-nowrap">
                          <span className="text-xs font-black text-slate-800 uppercase">{roles.find(r => r.id === sch.roleId)?.name || sch.roleId}</span>
                       </td>
                       <td className="px-10 py-6 text-center">
                          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-mono text-xs font-black border border-emerald-100">{sch.checkInTime}</span>
                       </td>
                       <td className="px-10 py-6 text-center">
                          <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-mono text-xs font-black border border-rose-100">{sch.checkOutTime}</span>
                       </td>
                       <td className="px-10 py-6 text-center">
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">{sch.gracePeriod}m</span>
                       </td>
                       <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sch.status === 'aktif' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                            {sch.status}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleOpenModal('schedule', sch)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all"><Edit3 size={16}/></button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {schedules.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-10 py-20 text-center">
                        <CalendarClock size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada konfigurasi jadwal</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  {modalType === 'employee' ? <UserPlus size={28} /> : modalType === 'role' ? <Shield size={28} /> : <CalendarClock size={28} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight font-heading">
                    {editingItem ? 'Perbarui' : 'Tambah'} {modalType === 'employee' ? 'Data Karyawan' : modalType === 'role' ? 'Konfigurasi Role' : 'Jadwal Kerja'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">MarketFlow System Integrated</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all text-slate-400">
                <X size={28} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1">
              {modalType === 'employee' && (
                <EmployeeForm item={editingItem} roles={roles} onSave={handleSaveEmployee} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} />
              )}
              {modalType === 'role' && (
                <RoleForm item={editingItem} onSave={handleSaveRole} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} />
              )}
              {modalType === 'schedule' && (
                <ScheduleForm item={editingItem} roles={roles} onSave={(data: any) => { editingItem ? onUpdateSchedule(editingItem.id, data) : onAddSchedule({...data, id: `SCH-${Date.now()}`}); setIsModalOpen(false); onNotify('Jadwal disimpan', 'success'); }} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-v5 {
          width: 100%;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 1.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e293b;
          outline: none;
          transition: all 0.25s;
        }
        .input-v5:focus {
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
};

// --- SUB COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
  >
    <Icon size={14} /> {label}
  </button>
);

const FormField = ({ label, icon: Icon, children, required }: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      <Icon size={12} className="text-indigo-500" /> {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const EmployeeForm = ({ item, roles, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    roleId: roles[0]?.id || '',
    status: EmployeeStatus.AKTIF,
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        fullName: item.fullName || '',
        username: item.username || '',
        phone: item.phone || '',
        joinDate: item.joinDate || new Date().toISOString().split('T')[0],
        roleId: item.roleId || roles[0]?.id || '',
        status: item.status || EmployeeStatus.AKTIF,
        password: item.password || ''
      });
    }
  }, [item, roles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password.length < 4) {
      alert('Password minimal 4 karakter');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-12 grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <FormField label="Nama Lengkap" icon={User} required>
          <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="input-v5" placeholder="Nama sesuai identitas" required />
        </FormField>
        <FormField label="Username Login" icon={Tag} required>
          <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(' ', '')})} className="input-v5" placeholder="username_unik" required />
        </FormField>
        
        <FormField label="Password" icon={Key} required={!item}>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="input-v5 pr-14" 
              placeholder={item ? "Kata sandi saat ini" : "Minimal 4 karakter"} 
              required={!item} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </FormField>

        <FormField label="Status Akun" icon={CheckCircle2}>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as EmployeeStatus})} className="input-v5">
             <option value={EmployeeStatus.AKTIF}>AKTIF</option>
             <option value={EmployeeStatus.NONAKTIF}>NONAKTIF</option>
          </select>
        </FormField>
      </div>
      <div className="space-y-6">
        <FormField label="No WhatsApp" icon={Smartphone} required>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-v5" placeholder="08xxxxxxxx" required />
        </FormField>
        <FormField label="Tanggal Masuk" icon={Calendar} required>
          <input 
            type="date" 
            value={formData.joinDate} 
            onChange={e => setFormData({...formData, joinDate: e.target.value})} 
            className="input-v5 cursor-pointer" 
            required 
          />
        </FormField>
        <FormField label="Role Sistem" icon={ShieldAlert} required>
          <select value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} className="input-v5">
            {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
          </select>
        </FormField>
        
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mt-4">
           <div className="flex gap-3 text-indigo-600 mb-2">
              <Info size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">Catatan SDM</p>
           </div>
           <p className="text-[10px] font-bold text-indigo-400 uppercase italic leading-relaxed">Admin dapat melihat dan memperbarui password karyawan melalui form ini untuk keperluan dukungan login.</p>
        </div>
      </div>

      <div className="col-span-2 pt-6 flex justify-end gap-4">
         <button type="button" onClick={onClose} className="px-10 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-all">Batal</button>
         <button type="submit" className="px-16 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95">
           <Save size={18} /> Simpan Data Karyawan
         </button>
      </div>
    </form>
  );
};

const RoleForm = ({ item, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });
  
  useEffect(() => {
    if (item) setFormData({ 
        name: item.name || '', 
        description: item.description || '',
        color: item.color || '#6366f1'
    });
  }, [item]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-12 space-y-8">
      <div className="grid grid-cols-1 gap-8">
        <FormField label="Nama Role" icon={Layers} required>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="input-v5" 
            placeholder="e.g. Tim Packing" 
            required 
          />
        </FormField>
      </div>
      <FormField label="Deskripsi Wewenang" icon={Info} required>
         <textarea 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          className="input-v5 resize-none h-40" 
          placeholder="Tuliskan deskripsi tugas dan wewenang role ini secara detail..."
          required
         />
      </FormField>
      <div className="flex justify-end gap-4 pt-4">
         <button type="button" onClick={onClose} className="px-10 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">Batal</button>
         <button type="submit" className="px-16 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3">
            <Save size={18} /> Simpan Role
         </button>
      </div>
    </form>
  );
};

const ScheduleForm = ({ item, roles, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({
    roleId: roles[0]?.id || '',
    day: 'Senin',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    gracePeriod: 15,
    status: 'aktif'
  });

  useEffect(() => {
    if (item) {
      setFormData({
        roleId: item.roleId || roles[0]?.id || '',
        day: item.day || 'Senin',
        checkInTime: item.checkInTime || '08:00',
        checkOutTime: item.checkOutTime || '17:00',
        gracePeriod: item.gracePeriod || 15,
        status: item.status || 'aktif'
      });
    }
  }, [item, roles]);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-12 grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <FormField label="Role Karyawan" icon={Briefcase} required>
          <select value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} className="input-v5">
            {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
          </select>
        </FormField>
        <FormField label="Toleransi Telat (Menit)" icon={Clock} required>
          <input type="number" value={formData.gracePeriod} onChange={e => setFormData({...formData, gracePeriod: Number(e.target.value)})} className="input-v5" placeholder="Contoh: 15" required />
        </FormField>
      </div>
      <div className="space-y-6">
        <FormField label="Jam Masuk" icon={Clock} required>
          <input type="time" value={formData.checkInTime} onChange={e => setFormData({...formData, checkInTime: e.target.value})} className="input-v5" required />
        </FormField>
        <FormField label="Jam Pulang" icon={Clock} required>
          <input type="time" value={formData.checkOutTime} onChange={e => setFormData({...formData, checkOutTime: e.target.value})} className="input-v5" required />
        </FormField>
        <FormField label="Status Penjadwalan" icon={CheckCircle2}>
           <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="input-v5">
            <option value="aktif">AKTIF (Hadir)</option>
            <option value="nonaktif">NONAKTIF (Libur)</option>
          </select>
        </FormField>
      </div>

      <div className="col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 mt-4">
        <div className="flex gap-3 text-indigo-600 mb-2">
            <Calendar size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest">Aturan Libur Nasional</p>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase italic leading-relaxed">
           Hari Minggu otomatis diliburkan oleh sistem. Konfigurasi di atas hanya untuk hari kerja efektif (Senin-Sabtu). Untuk libur Idul Fitri/Idul Adha, admin dapat menonaktifkan status jadwal sementara.
        </p>
      </div>

      <div className="col-span-2 pt-6 flex justify-end gap-4">
         <button type="button" onClick={onClose} className="px-10 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">Batal</button>
         <button type="submit" className="px-16 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3">
            <Save size={18} /> Simpan Jadwal
         </button>
      </div>
    </form>
  );
};

export default EmployeeModule;
