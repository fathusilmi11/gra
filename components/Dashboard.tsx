
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FullSaleRecord, Product, Lead } from '../types';

interface DashboardProps {
  sales: FullSaleRecord[];
  products: Product[];
  leads: Lead[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, products, leads }) => {
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.totalJual, 0);
  const totalQty = sales.reduce((acc, curr) => acc + curr.qty, 0);
  const totalOrders = sales.length;

  // Revenue per Product (Multi-item aware)
  const salesByProduct = products.map(p => {
    let revenue = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.productId === p.id) {
          revenue += (item.qty * item.unitPrice);
        }
      });
    });
    return { name: p.name, total: revenue };
  }).sort((a, b) => b.total - a.total);

  const leadsDistribution = leads.map(l => ({
    name: l.source,
    // Fix: Using 'asal_leads' instead of 'leadSource' to match the interface
    value: sales.filter(s => s.asal_leads === l.source).length
  })).filter(l => l.value > 0);

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Penjualan" value={formatIDR(totalRevenue)} icon={<DollarSign size={20}/>} color="indigo" trend="+12.5%" trendUp={true} />
        <StatCard title="Produk Terjual" value={totalQty.toLocaleString()} icon={<ShoppingBag size={20}/>} color="emerald" trend="+5.2%" trendUp={true} />
        <StatCard title="Jumlah Pesanan" value={totalOrders.toLocaleString()} icon={<TrendingUp size={20}/>} color="amber" trend="+8.1%" trendUp={true} />
        <StatCard title="Conversion Rate" value="4.2%" icon={<Target size={20}/>} color="rose" trend="-0.4%" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-8">Revenue per SKU</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByProduct}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} tickFormatter={(v) => `Rp ${v/1000}k`} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-1">Sumber Leads</h3>
          <p className="text-xs text-slate-400 font-bold uppercase mb-6">Traffic Channel</p>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadsDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {leadsDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
                <p className="text-2xl font-black text-slate-800">{totalOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendUp, color }: any) => {
  const colorMap: any = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600' };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between mb-6">
        <div className={`p-3.5 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
};

export default Dashboard;
