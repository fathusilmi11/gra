
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Truck, Settings, Menu, Bell, Search, ChevronRight, ClipboardList, Boxes, Warehouse, UserCheck, LogOut, Wallet, Clapperboard, Users, X } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, userName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  const safeUserName = userName || 'Guest';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.SUPERADMIN] },
    { id: 'sales', label: 'Penjualan', icon: ShoppingCart, roles: [UserRole.SUPERADMIN, UserRole.TIM_MARKETPLACE] },
    { id: 'payments', label: 'Pembayaran', icon: Wallet, roles: [UserRole.SUPERADMIN] },
    { id: 'stock', label: 'Persediaan', icon: Warehouse, roles: [UserRole.SUPERADMIN] },
    { id: 'content', label: 'Manajemen Konten', icon: Clapperboard, roles: [UserRole.SUPERADMIN, UserRole.TIM_KONTEN] },
    { id: 'packing-queue', label: 'Antrean Packing', icon: Boxes, roles: [UserRole.SUPERADMIN, UserRole.TIM_PACKING] },
    { id: 'packing-list', label: 'Packing List', icon: ClipboardList, roles: [UserRole.SUPERADMIN] },
    { id: 'shipping', label: 'Pengiriman', icon: Truck, roles: [UserRole.SUPERADMIN, UserRole.TIM_PACKING] },
    { id: 'employees', label: 'Karyawan', icon: Users, roles: [UserRole.SUPERADMIN] },
    { id: 'attendance', label: 'Absensi', icon: UserCheck, roles: [UserRole.SUPERADMIN, UserRole.TIM_PACKING, UserRole.TIM_KONTEN, UserRole.TIM_MARKETPLACE] },
    { id: 'master', label: 'Master Data', icon: Settings, roles: [UserRole.SUPERADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Mobile Overlay - High Z-Index but below FAB */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[80] md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-[#0F172A] text-white transform transition-all duration-300 ease-in-out z-[90] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} border-r border-slate-800 flex flex-col shadow-2xl md:shadow-none`}>
        <div className="p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">MarketFlow</h1>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-6 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4 italic">Modul Operasional</p>
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { 
                  setActiveTab(item.id); 
                  setIsSidebarOpen(false); 
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white'} />
                  <span className="font-semibold text-[15px]">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-indigo-200" />}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-8 shrink-0">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-[2rem] p-5 border border-slate-700/50 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center font-bold text-lg shadow-inner uppercase">
              {safeUserName.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{safeUserName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRole?.replace('_', ' ')}</p>
            </div>
            <LogOut size={16} className="text-slate-500 hover:text-rose-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              type="button"
              className="md:hidden p-3 -ml-2 hover:bg-slate-100 rounded-xl transition-colors active:scale-90 touch-none pointer-events-auto" 
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(true);
              }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Open Menu"
            >
              <Menu size={26} className="text-slate-800" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <span className="font-bold text-slate-900 font-heading text-lg">
                {menuItems.find(i => i.id === activeTab)?.label || 'MarketFlow'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
             <div className="relative group hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="Cari data..." className="pl-12 pr-6 py-2.5 bg-slate-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all outline-none" />
             </div>
             <button className="relative p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 active:scale-95 transition-all">
                <Bell size={22} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full no-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
