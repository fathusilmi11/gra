
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  UserCheck, Clock, MapPin, Calendar, CheckCircle2, AlertCircle, 
  Info, History, ArrowRight, ShieldCheck, Camera, 
  X, Smartphone, Activity, MapPinned, CameraOff,
  Search, Eye, Save, Map as MapIcon2, Navigation,
  AlertTriangle, Locate, Globe, Warehouse, Monitor, Users, Loader2,
  XCircle, FileText, ArrowUpRight, ArrowDownRight,
  Stethoscope, MessageSquare, ChevronDown, Download, Filter, RotateCcw,
  Ban, ShieldAlert, FileSearch, Trash2, Edit3, Archive, CameraIcon,
  CheckCircle, BanIcon, MapPinnedIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  Employee, Attendance, AttendanceStatus, UserRole, WorkSchedule, 
  LeaveRequest, LeaveStatus, Role, OfficeConfig, AttendanceLog 
} from '../types';

interface AttendanceModuleProps {
  currentEmployee: Employee;
  attendances: Attendance[];
  schedules: WorkSchedule[];
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  roles: Role[];
  isAdmin: boolean;
  onSaveAttendance: (att: Attendance) => void;
  onManualAttendance: (att: Attendance) => void;
  onAddLeave: (req: LeaveRequest) => void;
  onUpdateLeaveStatus: (id: string, status: LeaveStatus, note?: string, updatedLeave?: Partial<LeaveRequest>) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
  officeConfig: OfficeConfig;
}

const AttendanceModule: React.FC<AttendanceModuleProps> = ({ 
  currentEmployee, attendances, schedules, employees, leaveRequests, roles, isAdmin, 
  onSaveAttendance, onManualAttendance, onAddLeave, onUpdateLeaveStatus, onNotify, officeConfig
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'riwayat' | 'izin' | 'admin_dashboard' | 'admin_absensi' | 'admin_izin' | 'admin_logs'>('personal');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState<'MASUK' | 'PULANG'>('MASUK');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number, address: string, distance: number, isWithin: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Monitoring States
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Personal History Filters
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');

  const [isEditLeaveModalOpen, setIsEditLeaveModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [attLogs, setAttLogs] = useState<AttendanceLog[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendances.find(a => a.employeeId === currentEmployee.id && a.tanggal === today);
  const myRole = roles.find(r => r.id === currentEmployee.roleId);
  const mySchedule = schedules.find(s => s.roleId === currentEmployee.roleId);

  const hasApprovedLeaveToday = useMemo(() => {
    return leaveRequests.some(r => 
      r.id_karyawan === currentEmployee.id && 
      r.status === LeaveStatus.APPROVED && 
      today >= r.tanggal_mulai && today <= r.tanggal_selesai
    );
  }, [leaveRequests, currentEmployee.id, today]);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
    }
  }, [isCameraOpen, activeStream]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const amount = 250;
      navRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const addLog = (aksi: string, detail: string, dataLama?: any, dataBaru?: any) => {
    const newLog: AttendanceLog = {
      id: `AL-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      user: currentEmployee.fullName,
      role: currentEmployee.roleId,
      aksi,
      detail,
      data_lama: dataLama ? JSON.stringify(dataLama) : undefined,
      data_baru: dataBaru ? JSON.stringify(dataBaru) : undefined
    };
    setAttLogs(prev => [newLog, ...prev]);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const calculateDuration = (inTime: string, outTime: string) => {
    const [h1, m1] = inTime.split(':').map(Number);
    const [h2, m2] = outTime.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}j ${minutes}m`;
  };

  const startCamera = async () => {
    if (hasApprovedLeaveToday) {
      return onNotify('Akses ditolak: Anda sedang dalam masa izin yang disetujui.', 'error');
    }
    
    setIsLoading(true);
    setLocation(null);
    setCapturedPhoto(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const dist = getDistance(lat, lng, officeConfig.lat, officeConfig.lng);
      const isWithin = dist <= officeConfig.radius;
      
      setLocation({
        lat, lng, distance: Math.round(dist), isWithin,
        address: isWithin ? `${officeConfig.addressName} (WFO)` : `Remote Activity (${Math.round(dist)}m dari kantor)`
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
      setActiveStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      onNotify('Izin Kamera/GPS ditolak. Audit tidak dapat dilanjutkan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (activeStream) activeStream.getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.translate(canvasRef.current.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg', 0.8));
      }
    }
  };

  const handleFinalSubmit = () => {
    if (!capturedPhoto || !location) return;
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    let status = AttendanceStatus.HADIR;
    if (cameraType === 'MASUK' && mySchedule) {
      const [sh, sm] = mySchedule.checkInTime.split(':').map(Number);
      const checkInMin = new Date().getHours() * 60 + new Date().getMinutes();
      const scheduleMin = sh * 60 + sm + mySchedule.gracePeriod;
      if (checkInMin > scheduleMin) status = AttendanceStatus.TELAT;
    }

    const attendanceData: Attendance = {
      id: todayAttendance?.id || `ATT-${Date.now()}`,
      employeeId: currentEmployee.id,
      tanggal: today,
      jam_masuk: cameraType === 'MASUK' ? time : todayAttendance?.jam_masuk,
      jam_pulang: cameraType === 'PULANG' ? time : todayAttendance?.jam_pulang,
      foto_selfie_masuk: cameraType === 'MASUK' ? capturedPhoto : todayAttendance?.foto_selfie_masuk,
      foto_selfie_pulang: cameraType === 'PULANG' ? capturedPhoto : todayAttendance?.foto_selfie_pulang,
      latitude: location.lat,
      longitude: location.lng,
      alamat_lokasi: location.address,
      status_absen: cameraType === 'MASUK' ? status : (todayAttendance?.status_absen || status),
      durasi_kerja: cameraType === 'PULANG' && todayAttendance?.jam_masuk ? calculateDuration(todayAttendance.jam_masuk, time) : undefined,
      created_at: todayAttendance?.created_at || new Date().toISOString()
    };

    onSaveAttendance(attendanceData);
    addLog(cameraType === 'MASUK' ? 'Check-in' : 'Check-out', `Berhasil ${cameraType} pukul ${time}`);
    onNotify(`Absensi ${cameraType} berhasil dicatat`, 'success');
    stopCamera();
  };

  const filteredGlobalAttendances = useMemo(() => {
    return attendances.filter(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      const matchName = emp?.fullName.toLowerCase().includes(filterName.toLowerCase());
      const matchDate = !filterDate || a.tanggal === filterDate;
      const matchRole = !filterRole || emp?.roleId === filterRole;
      return matchName && matchDate && matchRole;
    }).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
  }, [attendances, employees, filterName, filterDate, filterRole]);

  const filteredPersonalAttendances = useMemo(() => {
    return attendances.filter(a => {
      const matchEmp = a.employeeId === currentEmployee.id;
      const matchStart = !historyStartDate || a.tanggal >= historyStartDate;
      const matchEnd = !historyEndDate || a.tanggal <= historyEndDate;
      return matchEmp && matchStart && matchEnd;
    }).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
  }, [attendances, currentEmployee.id, historyStartDate, historyEndDate]);

  const filteredGlobalLeaves = useMemo(() => {
    return leaveRequests.filter(r => {
      const emp = employees.find(e => e.id === r.id_karyawan);
      const matchName = emp?.fullName.toLowerCase().includes(filterName.toLowerCase());
      const matchDate = !filterDate || (r.tanggal_mulai <= filterDate && r.tanggal_selesai >= filterDate);
      const matchRole = !filterRole || emp?.roleId === filterRole;
      return matchName && matchDate && matchRole;
    }).sort((a,b) => b.tanggal_mulai.localeCompare(a.tanggal_mulai));
  }, [leaveRequests, employees, filterName, filterDate, filterRole]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Utama & Navigasi Scroll */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck size={28} />
             </div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight font-heading uppercase italic">Sistem Kehadiran</h2>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 ml-1">MarketFlow Intelligent Human Monitoring</p>
        </div>
        
        {/* Navigasi Scroll Control */}
        <div className="relative flex items-center group max-w-full lg:max-w-4xl">
           <button onClick={() => scrollNav('left')} className="absolute -left-4 z-20 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 hidden md:flex active:scale-90">
              <ChevronLeft size={16} strokeWidth={3} />
           </button>
           
           <div ref={navRef} className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar gap-1 scroll-smooth">
              <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={Monitor} label="Absen Saya" />
              <TabButton active={activeTab === 'riwayat'} onClick={() => setActiveTab('riwayat')} icon={History} label="Riwayat Audit" />
              <TabButton active={activeTab === 'izin'} onClick={() => setActiveTab('izin')} icon={FileText} label="Permohonan Izin" />
              
              {isAdmin && (
                <>
                  <div className="w-px h-8 bg-slate-100 mx-2 self-center shrink-0" />
                  <TabButton active={activeTab === 'admin_dashboard'} onClick={() => setActiveTab('admin_dashboard')} icon={Activity} label="Monitoring" color="indigo" />
                  <TabButton active={activeTab === 'admin_absensi'} onClick={() => setActiveTab('admin_absensi')} icon={Users} label="Data SDM" color="indigo" />
                  <TabButton active={activeTab === 'admin_izin'} onClick={() => setActiveTab('admin_izin')} icon={FileSearch} label="Kelola Izin" color="indigo" />
                  <TabButton active={activeTab === 'admin_logs'} onClick={() => setActiveTab('admin_logs')} icon={ShieldAlert} label="Log Sistem" color="rose" />
                </>
              )}
           </div>

           <button onClick={() => scrollNav('right')} className="absolute -right-4 z-20 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 hidden md:flex active:scale-90">
              <ChevronRight size={16} strokeWidth={3} />
           </button>
        </div>
      </div>

      {/* 1. VIEW PERSONAL: DASHBOARD ABSENSI */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-7 bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl flex flex-col items-center text-center space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl group transition-transform hover:rotate-6">
                {isLoading ? <Loader2 size={40} className="animate-spin" /> : <CameraIcon size={40} />}
              </div>

              <div>
                 <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">AUTHORIZED ACCESS</span>
                 <h3 className="text-4xl font-black text-slate-800 mt-6 tracking-tight">Selamat {new Date().getHours() < 12 ? 'Pagi' : 'Siang'}, {currentEmployee.fullName}!</h3>
                 <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">Sesi Operasional: <span className="text-slate-900">{today}</span></p>
              </div>

              {hasApprovedLeaveToday ? (
                <div className="w-full p-8 bg-amber-50 rounded-[2.5rem] border-2 border-dashed border-amber-200 flex flex-col items-center gap-4">
                   <Ban size={40} className="text-amber-500" />
                   <p className="text-sm font-black text-amber-900 uppercase">Akses Absensi Terkunci: Izin Aktif</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <BigAbsenButton 
                    label="ABSEN MASUK (CHECK-IN)" 
                    time={todayAttendance?.jam_masuk} 
                    icon={ArrowUpRight} 
                    active={!todayAttendance?.jam_masuk && !isLoading} 
                    onClick={() => { setCameraType('MASUK'); startCamera(); }} 
                    color="emerald" 
                  />
                  <BigAbsenButton 
                    label="ABSEN PULANG (CHECK-OUT)" 
                    time={todayAttendance?.jam_pulang} 
                    icon={ArrowDownRight} 
                    active={!!todayAttendance?.jam_masuk && !todayAttendance?.jam_pulang && !isLoading} 
                    onClick={() => { setCameraType('PULANG'); startCamera(); }} 
                    color="rose" 
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 text-slate-300">
                 <ShieldCheck size={14} />
                 <p className="text-[9px] font-black uppercase tracking-widest">End-to-End Encryption Secured</p>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-indigo-400 border-b border-white/5 pb-4">Konfigurasi Jam Kerja</h4>
                 <div className="space-y-6">
                    <ScheduleInfoItem label="Jam Masuk" time={mySchedule?.checkInTime || '--:--'} icon={Clock} />
                    <ScheduleInfoItem label="Jam Pulang" time={mySchedule?.checkOutTime || '--:--'} icon={Clock} />
                    <ScheduleInfoItem label="Toleransi" time={`${mySchedule?.gracePeriod || 0} MENIT`} icon={AlertCircle} />
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                    <MapPinnedIcon size={20} className="text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Verifikasi Radius GPS</h4>
                 </div>
                 <div className="space-y-5">
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gudang Utama</p>
                          <p className="text-[11px] font-bold text-slate-700 uppercase leading-tight">{officeConfig.addressName}</p>
                       </div>
                       <Warehouse size={24} className="text-indigo-200" />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 italic">
                       <Info size={14} className="text-amber-500" />
                       Akurasi audit bergantung pada kekuatan sinyal GPS Anda.
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 2. VIEW PERSONAL: RIWAYAT AUDIT */}
      {activeTab === 'riwayat' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           {/* History Filters */}
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-4 flex-1">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <Filter size={20} />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Filter Riwayat</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pilih Rentang Tanggal Audit</p>
                 </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="date" 
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-black uppercase outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                    />
                 </div>
                 <div className="text-slate-300 hidden sm:block"><ArrowRight size={16}/></div>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="date" 
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-black uppercase outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                    />
                 </div>
                 {(historyStartDate || historyEndDate) && (
                    <button 
                      onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Reset Filter"
                    >
                      <RotateCcw size={18}/>
                    </button>
                 )}
              </div>
           </div>

           {/* History Table */}
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                 <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Audit Kehadiran Pribadi</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ditemukan <span className="text-indigo-600">{filteredPersonalAttendances.length}</span> Entri</p>
                 </div>
                 <button onClick={() => window.print()} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Download size={20}/></button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                          <th className="px-10 py-7">Hari & Tanggal</th>
                          <th className="px-10 py-7 text-center">Masuk</th>
                          <th className="px-10 py-7 text-center">Pulang</th>
                          <th className="px-10 py-7 text-center">Durasi Kerja</th>
                          <th className="px-10 py-7">Status Audit</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredPersonalAttendances.map(att => (
                         <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 text-sm font-black text-slate-800">{att.tanggal}</td>
                            <td className="px-10 py-6 text-center font-mono text-xs text-emerald-600 font-black">{att.jam_masuk || '--:--'}</td>
                            <td className="px-10 py-6 text-center font-mono text-xs text-rose-600 font-black">{att.jam_pulang || '--:--'}</td>
                            <td className="px-10 py-6 text-center font-black text-[10px] text-slate-500 bg-slate-50/30">{att.durasi_kerja || '-'}</td>
                            <td className="px-10 py-6">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 att.status_absen === AttendanceStatus.HADIR ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                 att.status_absen === AttendanceStatus.TELAT ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                 'bg-slate-100 text-slate-500'
                               }`}>{att.status_absen}</span>
                            </td>
                         </tr>
                       ))}
                       {filteredPersonalAttendances.length === 0 && (
                         <tr>
                           <td colSpan={5} className="px-10 py-32 text-center">
                              <FileSearch size={48} className="mx-auto text-slate-100 mb-6" />
                              <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Data audit tidak ditemukan pada rentang ini</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* 3. VIEW PERSONAL: PERMOHONAN IZIN */}
      {activeTab === 'izin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
           <div className="lg:col-span-5">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl space-y-10 sticky top-24">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100"><FileText size={28}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Formulir Izin</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Ketidakhadiran Resmi</p>
                    </div>
                 </div>

                 <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    onAddLeave({
                       id_izin: `REQ-${Date.now()}`,
                       id_karyawan: currentEmployee.id,
                       jenis_izin: form.jenis.value,
                       tanggal_mulai: form.mulai.value,
                       tanggal_selesai: form.selesai.value,
                       alasan: form.alasan.value,
                       status: LeaveStatus.PENDING
                    });
                    addLog('Ajukan Izin', `Mengajukan ${form.jenis.value} dari ${form.mulai.value} s/d ${form.selesai.value}`);
                    onNotify('Permohonan izin berhasil dikirim ke Admin');
                    form.reset();
                 }} className="space-y-8">
                    <div className="space-y-2">
                       <label className="input-label">JENIS PENGAJUAN</label>
                       <select name="jenis" className="input-v5 font-black uppercase text-xs tracking-widest" required>
                          <option value="Izin">Izin (Kepentingan Pribadi)</option>
                          <option value="Sakit">Sakit (Sertakan Bukti)</option>
                          <option value="Cuti">Cuti Tahunan</option>
                          <option value="Dinas Luar">Perjalanan Dinas / Tugas</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="input-label">TANGGAL MULAI</label>
                          <input type="date" name="mulai" className="input-v5" required />
                       </div>
                       <div className="space-y-2">
                          <label className="input-label">TANGGAL SELESAI</label>
                          <input type="date" name="selesai" className="input-v5" required />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">ALASAN DETAIL</label>
                       <textarea name="alasan" className="input-v5 h-32 resize-none pt-4" placeholder="Berikan deskripsi alasan yang jelas..." required></textarea>
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3">
                       <Save size={20} /> Kirim Audit Izin
                    </button>
                 </form>
              </div>
           </div>

           <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between px-4">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Status Pengajuan Anda</h3>
                 <span className="text-[10px] font-black text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 uppercase tracking-widest">Live Audit Status</span>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                 {leaveRequests.filter(r => r.id_karyawan === currentEmployee.id).sort((a,b) => b.id_izin.localeCompare(a.id_izin)).map(req => (
                    <div key={req.id_izin} className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                       <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-inner border border-indigo-100">
                                <Stethoscope size={28} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{req.jenis_izin}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{req.tanggal_mulai} s/d {req.tanggal_selesai}</p>
                             </div>
                          </div>
                          <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                            req.status === LeaveStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            req.status === LeaveStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                          }`}>{req.status}</span>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 relative z-10">
                          <p className="text-xs font-bold text-slate-500 italic leading-relaxed">"{req.alasan}"</p>
                          {req.catatan_admin && (
                            <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] font-bold text-slate-400 italic flex items-center gap-2">
                               <ShieldAlert size={14} className="text-rose-400" /> Catatan Admin: {req.catatan_admin}
                            </div>
                          )}
                       </div>
                       {req.status === LeaveStatus.PENDING && (
                          <button onClick={() => onUpdateLeaveStatus(req.id_izin, LeaveStatus.REJECTED, 'Dibatalkan oleh Pengguna')} className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline text-left flex items-center gap-2 relative z-10">
                             <X size={14}/> Batalkan Pengajuan
                          </button>
                       )}
                    </div>
                 ))}
                 
                 {leaveRequests.filter(r => r.id_karyawan === currentEmployee.id).length === 0 && (
                   <div className="py-32 text-center bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
                      <Archive size={64} className="mx-auto text-slate-100 mb-6" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum ada histori permohonan izin</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* 4. VIEW ADMIN: DASHBOARD MONITORING */}
      {activeTab === 'admin_dashboard' && isAdmin && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard label="Hadir Tepat Waktu" value={attendances.filter(a => a.tanggal === today && a.status_absen === AttendanceStatus.HADIR).length} icon={CheckCircle} color="emerald" sub="Sesuai Jadwal" />
              <AdminStatCard label="Terlambat" value={attendances.filter(a => a.tanggal === today && a.status_absen === AttendanceStatus.TELAT).length} icon={AlertTriangle} color="amber" sub="Audit Jam Masuk" />
              <AdminStatCard label="Sedang Izin/Sakit" value={leaveRequests.filter(r => r.status === LeaveStatus.APPROVED && today >= r.tanggal_mulai && today <= r.tanggal_selesai).length} icon={Stethoscope} color="indigo" sub="Terdata Sistem" />
              <AdminStatCard label="Belum Absen" value={employees.filter(e => e.status === 'Aktif' && !attendances.some(a => a.employeeId === e.id && a.tanggal === today)).length} icon={BanIcon} color="rose" sub="Perlu Follow Up" />
           </div>

           <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <Activity size={24} className="text-indigo-600" />
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Live Presence Feed</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sync Real-time</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 {attendances.filter(a => a.tanggal === today).slice(0, 6).map(att => {
                    const emp = employees.find(e => e.id === att.employeeId);
                    return (
                       <div key={att.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 transition-all hover:shadow-xl hover:bg-white group">
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-md overflow-hidden border border-slate-100 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" onClick={() => att.foto_selfie_masuk && setPreviewImage(att.foto_selfie_masuk)}>
                             {att.foto_selfie_masuk ? <img src={att.foto_selfie_masuk} className="w-full h-full object-cover" /> : <CameraOff className="text-slate-200" />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{emp?.fullName}</p>
                             <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <Clock size={10}/> {att.jam_masuk} • {att.status_absen}
                             </p>
                             <div className="flex items-center gap-1 mt-2 text-[8px] font-bold text-slate-400 uppercase italic truncate">
                                <MapPin size={10} className="text-rose-400" /> {att.alamat_lokasi}
                             </div>
                          </div>
                       </div>
                    );
                 })}
                 {attendances.filter(a => a.tanggal === today).length === 0 && (
                    <div className="col-span-full py-16 text-center">
                       <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Belum ada aktivitas kehadiran hari ini</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* 5. VIEW ADMIN: DATA SDM (GLOBAL ABSENSI) */}
      {activeTab === 'admin_absensi' && isAdmin && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="relative group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                 <input type="text" placeholder="Cari Nama Karyawan..." value={filterName} onChange={e => setFilterName(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
              </div>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer" />
              <div className="relative">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full pl-14 pr-8 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-black uppercase appearance-none outline-none focus:bg-white focus:border-indigo-500 transition-all">
                  <option value="">SEMUA ROLE</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16}/>
              </div>
              <button onClick={() => {setFilterName(''); setFilterDate(''); setFilterRole('');}} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><RotateCcw size={16}/> Reset</button>
           </div>
           
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                          <th className="px-10 py-7">Karyawan & Role</th>
                          <th className="px-10 py-7">Tanggal</th>
                          <th className="px-10 py-7 text-center">In</th>
                          <th className="px-10 py-7 text-center">Out</th>
                          <th className="px-10 py-7">Status</th>
                          <th className="px-10 py-7 text-right">Selfie (Audit)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredGlobalAttendances.map(att => {
                          const emp = employees.find(e => e.id === att.employeeId);
                          return (
                            <tr key={att.id} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="px-10 py-6 font-black text-slate-800 uppercase text-xs">
                                  <p>{emp?.fullName}</p>
                                  <span className="text-[9px] font-bold text-indigo-500 tracking-widest">{roles.find(r => r.id === emp?.roleId)?.name}</span>
                               </td>
                               <td className="px-10 py-6 text-xs font-bold text-slate-500 font-mono tracking-tighter">{att.tanggal}</td>
                               <td className="px-10 py-6 text-center font-black text-emerald-600 font-mono text-sm">{att.jam_masuk || '--:--'}</td>
                               <td className="px-10 py-6 text-center font-black text-rose-600 font-mono text-sm">{att.jam_pulang || '--:--'}</td>
                               <td className="px-10 py-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    att.status_absen === AttendanceStatus.HADIR ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    att.status_absen === AttendanceStatus.TELAT ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-indigo-50 text-indigo-700 border-indigo-100'
                                  }`}>{att.status_absen}</span>
                               </td>
                               <td className="px-10 py-6 text-right">
                                  <div className="flex justify-end gap-2">
                                     {att.foto_selfie_masuk && (
                                       <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shadow-sm border-2 border-white cursor-pointer hover:scale-125 transition-all ring-1 ring-slate-100" onClick={() => setPreviewImage(att.foto_selfie_masuk!)}>
                                          <img src={att.foto_selfie_masuk} className="w-full h-full object-cover" />
                                       </div>
                                     )}
                                  </div>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* 6. VIEW ADMIN: KELOLA IZIN (GLOBAL MONITORING) */}
      {activeTab === 'admin_izin' && isAdmin && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="relative group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                 <input type="text" placeholder="Cari Nama Karyawan..." value={filterName} onChange={e => setFilterName(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
              </div>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer" />
              <div className="relative">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full pl-14 pr-8 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-black uppercase appearance-none outline-none focus:bg-white focus:border-indigo-500 transition-all">
                  <option value="">SEMUA ROLE</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16}/>
              </div>
              <button onClick={() => {setFilterName(''); setFilterDate(''); setFilterRole('');}} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><RotateCcw size={16}/> Reset</button>
           </div>
           
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                          <th className="px-10 py-7">Karyawan & Role</th>
                          <th className="px-10 py-7">Jenis & Periode Izin</th>
                          <th className="px-10 py-7 text-center">Status</th>
                          <th className="px-10 py-7 text-right">Aksi Audit</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredGlobalLeaves.map(req => {
                          const emp = employees.find(e => e.id === req.id_karyawan);
                          return (
                            <tr key={req.id_izin} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="px-10 py-6">
                                  <p className="font-black text-slate-800 uppercase text-xs">{emp?.fullName}</p>
                                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{roles.find(r => r.id === emp?.roleId)?.name}</p>
                               </td>
                               <td className="px-10 py-6">
                                  <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">{req.jenis_izin}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter font-mono">{req.tanggal_mulai} sd {req.tanggal_selesai}</p>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                                    req.status === LeaveStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    req.status === LeaveStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                    'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                  }`}>{req.status}</span>
                               </td>
                               <td className="px-10 py-6 text-right">
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => { setSelectedLeave(req); setIsEditLeaveModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm active:scale-90" title="Edit Detail"><Edit3 size={16}/></button>
                                     {req.status === LeaveStatus.PENDING && (
                                       <>
                                          <button onClick={() => { onUpdateLeaveStatus(req.id_izin, LeaveStatus.APPROVED, 'Disetujui via Kelola Izin'); onNotify(`Izin ${emp?.fullName} disetujui`, 'success'); }} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90" title="Setujui"><CheckCircle2 size={16}/></button>
                                          <button onClick={() => { onUpdateLeaveStatus(req.id_izin, LeaveStatus.REJECTED, 'Ditolak via Kelola Izin'); onNotify(`Izin ${emp?.fullName} ditolak`, 'error'); }} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90" title="Tolak"><X size={16}/></button>
                                       </>
                                     )}
                                  </div>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* 7. VIEW ADMIN: SECURITY LOGS */}
      {activeTab === 'admin_logs' && isAdmin && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-500">
           <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                 <ShieldAlert className="text-indigo-600" size={24}/>
                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Security & Audit Logs</h3>
              </div>
              <button onClick={() => setAttLogs([])} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline px-4 py-2 hover:bg-rose-50 rounded-xl transition-all">Clear history</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-10 py-6">Timestamp</th>
                       <th className="px-10 py-6">Executor</th>
                       <th className="px-10 py-6">Aksi Audit</th>
                       <th className="px-10 py-6">Detail Investigasi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {attLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-10 py-5 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                         <td className="px-10 py-5">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{log.user}</p>
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-0.5 rounded-full">{log.role}</span>
                         </td>
                         <td className="px-10 py-5">
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{log.aksi}</span>
                         </td>
                         <td className="px-10 py-5 text-[11px] font-bold text-slate-500 italic max-w-lg truncate leading-relaxed">"{log.detail}"</td>
                      </tr>
                    ))}
                    {attLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-10 py-24 text-center">
                           <History size={48} className="mx-auto text-slate-100 mb-4" />
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada riwayat aktivitas keamanan sistem</p>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* MODAL: Lightbox Preview Foto Selfie */}
      {previewImage && (
        <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 sm:p-12" onClick={() => setPreviewImage(null)}>
           <div className="relative max-w-2xl w-full aspect-square bg-slate-900 rounded-[3rem] overflow-hidden shadow-3xl animate-in zoom-in duration-300 border border-white/10" onClick={e => e.stopPropagation()}>
              <img src={previewImage} className="w-full h-full object-contain" alt="Verification Audit" />
              <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md">
                <X size={24} strokeWidth={3}/>
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-950 to-transparent">
                 <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" /> Biometric Identity Verification Audit
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: Kamera Verifikasi */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-3xl overflow-hidden relative border border-white/20">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><CameraIcon size={20}/></div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Face Identity Check: {cameraType}</h4>
                 </div>
                 <button onClick={stopCamera} className="p-3 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-900"><X size={24}/></button>
              </div>
              <div className="relative aspect-[4/3] bg-slate-900">
                 {!capturedPhoto ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" /> : <img src={capturedPhoto} className="w-full h-full object-cover" />}
                 
                 {location && !capturedPhoto && (
                   <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 text-white text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${location.isWithin ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{location.isWithin ? 'IN RANGE' : 'OUT OF RANGE'}</p>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 truncate">{location.address}</p>
                   </div>
                 )}
              </div>
              <div className="p-10 flex flex-col gap-4">
                 {!capturedPhoto ? (
                    <button onClick={capturePhoto} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                       <CameraIcon size={20}/> Capture Verification
                    </button>
                 ) : (
                    <div className="flex gap-4">
                       <button onClick={() => setCapturedPhoto(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase text-[10px] hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                          <RotateCcw size={16}/> Re-Take
                       </button>
                       <button onClick={handleFinalSubmit} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                          <CheckCircle2 size={18}/> Send Audit
                       </button>
                    </div>
                 )}
              </div>
           </div>
           <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Modal: Edit Detail Izin (Superadmin) */}
      {isEditLeaveModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-[450] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl"><Edit3 size={28}/></div>
                    <div>
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Koreksi Detail Izin</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Superadmin Security Context</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEditLeaveModalOpen(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><X size={32}/></button>
              </div>
              <div className="p-12 overflow-y-auto no-scrollbar max-h-[70vh]">
                 <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated: Partial<LeaveRequest> = {
                       jenis_izin: form.jenis.value,
                       tanggal_mulai: form.mulai.value,
                       tanggal_selesai: form.selesai.value,
                       alasan: form.alasan.value,
                       status: form.status.value,
                       catatan_admin: form.catatan.value
                    };
                    onUpdateLeaveStatus(selectedLeave.id_izin, updated.status as LeaveStatus, updated.catatan_admin, updated);
                    addLog('Koreksi Izin (Admin)', `Edit izin ID ${selectedLeave.id_izin}`, selectedLeave, updated);
                    setIsEditLeaveModalOpen(false);
                    onNotify('Audit perizinan berhasil diperbarui');
                 }} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="input-label">STATUS AUDIT</label>
                          <select name="status" defaultValue={selectedLeave.status} className="input-v5 font-black uppercase text-xs tracking-widest">
                             <option value={LeaveStatus.PENDING}>Pending</option>
                             <option value={LeaveStatus.APPROVED}>Approved</option>
                             <option value={LeaveStatus.REJECTED}>Rejected</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="input-label">JENIS PENGAJUAN</label>
                          <select name="jenis" defaultValue={selectedLeave.jenis_izin} className="input-v5 font-black uppercase text-xs tracking-widest">
                             <option value="Izin">Izin</option>
                             <option value="Sakit">Sakit</option>
                             <option value="Cuti">Cuti</option>
                             <option value="Dinas Luar">Dinas Luar</option>
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="input-label">TANGGAL MULAI</label>
                          <input type="date" name="mulai" defaultValue={selectedLeave.tanggal_mulai} className="input-v5" required />
                       </div>
                       <div className="space-y-2">
                          <label className="input-label">TANGGAL SELESAI</label>
                          <input type="date" name="selesai" defaultValue={selectedLeave.tanggal_selesai} className="input-v5" required />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">ALASAN PENGGUNA</label>
                       <textarea name="alasan" defaultValue={selectedLeave.alasan} className="input-v5 h-24 resize-none pt-4" required></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="input-label text-indigo-600">CATATAN/NOTA ADMIN</label>
                       <textarea name="catatan" defaultValue={selectedLeave.catatan_admin} className="input-v5 h-24 resize-none pt-4 border-indigo-100 bg-indigo-50/20" placeholder="Berikan catatan perbaikan atau alasan status..."></textarea>
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                       <Save size={18}/> Simpan Perubahan Audit
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .input-label { display: block; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.25rem; margin-left: 0.5rem; }
        .input-v5 { width: 100%; padding: 1.15rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; font-size: 0.85rem; font-weight: 700; color: #0f172a; outline: none; transition: all 0.25s; }
        .input-v5:focus { background: #ffffff; border-color: #6366f1; box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.15); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label, color = 'slate' }: any) => {
  const activeStyles = color === 'rose' ? 'bg-rose-600 text-white shadow-rose-200' : color === 'indigo' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-900 text-white shadow-slate-200';
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${active ? `${activeStyles} shadow-xl` : 'text-slate-400 hover:bg-slate-50 active:bg-slate-100'}`}>
      <Icon size={14} strokeWidth={3} /> {label}
    </button>
  );
};

const BigAbsenButton = ({ label, time, icon: Icon, active, onClick, color }: any) => {
  const colorMap: any = {
    emerald: 'border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300',
    rose: 'border-rose-100 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300'
  };
  
  const finishStyles = time ? `bg-${color}-600 text-white border-${color}-400 shadow-xl shadow-${color}-200` : colorMap[color];

  return (
    <button 
      disabled={!active && !time} 
      onClick={onClick} 
      className={`group flex flex-col items-center gap-5 p-10 rounded-[3rem] border-2 transition-all duration-500 relative overflow-hidden ${active ? 'bg-white border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1' : (time ? finishStyles : 'bg-slate-50 text-slate-200 border-transparent opacity-50 cursor-not-allowed')}`}
    >
       <Icon size={40} className={active ? 'text-slate-400 group-hover:text-indigo-600 transition-colors' : ''} />
       <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">{label}</p>
          {time ? (
               <p className="text-2xl font-black font-mono tracking-tighter">{time}</p>
          ) : (
            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest italic">{active ? 'Ready to Sync' : 'Not Logged'}</p>
          )}
       </div>
    </button>
  );
};

const ScheduleInfoItem = ({ label, time, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
     <div className="flex items-center gap-4">
        <Icon size={18} className="text-indigo-400" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
     </div>
     <p className="text-sm font-black font-mono text-white tracking-widest">{time}</p>
  </div>
);

const AdminStatCard = ({ label, value, icon: Icon, color, sub }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };
  return (
    <div className={`p-8 rounded-[3rem] border shadow-sm ${colors[color]} group bg-white transition-all hover:shadow-xl`}>
       <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 w-fit mb-6 group-hover:scale-110 transition-transform"><Icon size={24} /></div>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 leading-tight">{label}</p>
       <p className="text-4xl font-black tracking-tighter text-slate-800">{value}</p>
       <p className="text-[8px] font-bold text-slate-400 mt-4 uppercase tracking-widest italic">{sub}</p>
    </div>
  );
};

export default AttendanceModule;
