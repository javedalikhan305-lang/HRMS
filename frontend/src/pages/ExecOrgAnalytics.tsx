import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    Building2, Globe,
    Download, Filter,
    Eye
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';

const ExecOrgAnalytics = () => {
    const [activeView, setActiveView] = useState<'department' | 'location' | 'diversity'>('department');

    const deptPerformance = [
        { dept: 'Engineering', headcount: 68, growth: '+12%', productivity: 96, budget: '$2.4M', utilization: 92 },
        { dept: 'Product & Design', headcount: 32, growth: '+8%', productivity: 91, budget: '$1.1M', utilization: 88 },
        { dept: 'Sales & Revenue', headcount: 38, growth: '+15%', productivity: 94, budget: '$1.8M', utilization: 95 },
        { dept: 'Marketing', headcount: 22, growth: '+5%', productivity: 87, budget: '$800K', utilization: 82 },
        { dept: 'HR & Operations', headcount: 18, growth: '+3%', productivity: 93, budget: '$600K', utilization: 90 },
        { dept: 'Finance & Legal', headcount: 14, growth: '+2%', productivity: 95, budget: '$450K', utilization: 91 },
    ];

    const locationData = [
        { location: 'Bangalore, India', staff: 72, percentage: 36.4, growth: '+18%', type: 'HQ' },
        { location: 'San Francisco, US', staff: 45, percentage: 22.7, growth: '+10%', type: 'Engineering Hub' },
        { location: 'London, UK', staff: 32, percentage: 16.2, growth: '+8%', type: 'EMEA Office' },
        { location: 'Berlin, Germany', staff: 22, percentage: 11.1, growth: '+12%', type: 'Design Studio' },
        { location: 'Singapore', staff: 15, percentage: 7.6, growth: '+20%', type: 'APAC Hub' },
        { location: 'Remote Global', staff: 12, percentage: 6.1, growth: '+30%', type: 'Distributed' },
    ];

    const genderData = [
        { name: 'Male', value: 107, color: '#6366f1' },
        { name: 'Female', value: 82, color: '#ec4899' },
        { name: 'Non-Binary', value: 9, color: '#10b981' },
    ];

    const ageDistribution = [
        { range: '22-25', count: 28 },
        { range: '26-30', count: 52 },
        { range: '31-35', count: 48 },
        { range: '36-40', count: 35 },
        { range: '41-45', count: 20 },
        { range: '46+', count: 15 },
    ];

    const diversityTrend = [
        { quarter: 'Q1 23', female: 38, male: 58, nonbinary: 4 },
        { quarter: 'Q2 23', female: 39, male: 57, nonbinary: 4 },
        { quarter: 'Q3 23', female: 40, male: 56, nonbinary: 4 },
        { quarter: 'Q4 23', female: 41, male: 55, nonbinary: 4 },
        { quarter: 'Q1 24', female: 42, male: 53, nonbinary: 5 },
        { quarter: 'Q2 24', female: 41, male: 54, nonbinary: 5 },
    ];



    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center space-x-1">
                            <Eye size={10} />
                            <span>Read-Only</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Organization Analytics</h1>
                    <p className="text-muted-foreground font-medium">Deep visibility into departmental performance, global distribution, and diversity metrics.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-secondary/50 p-1 rounded-2xl flex">
                        {[
                            { id: 'department', label: 'Departments' },
                            { id: 'location', label: 'Locations' },
                            { id: 'diversity', label: 'Diversity' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveView(t.id as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                                    activeView === t.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center space-x-2">
                        <Download size={14} />
                        <span>Export</span>
                    </button>
                </div>
            </header>

            {activeView === 'department' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="bg-card rounded-[3.5rem] border shadow-sm overflow-hidden">
                        <div className="p-10 border-b flex items-center justify-between">
                            <h3 className="text-2xl font-black tracking-tight flex items-center">
                                <Building2 className="mr-3 text-primary" size={24} />
                                Department Performance Matrix
                            </h3>
                            <button className="p-3 bg-secondary/50 rounded-xl hover:text-primary transition-all"><Filter size={16} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary/30 text-left">
                                        {['Department', 'Headcount', 'Growth', 'Productivity', 'Budget', 'Utilization'].map(h => (
                                            <th key={h} className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/30">
                                    {deptPerformance.map((dept) => (
                                        <tr key={dept.dept} className="hover:bg-secondary/10 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <span className="font-black text-sm">{dept.dept}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xl font-black">{dept.headcount}</td>
                                            <td className="px-8 py-6">
                                                <span className="text-emerald-500 text-xs font-black flex items-center"><ArrowUpRight size={12} />{dept.growth}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${dept.productivity >= 93 ? 'bg-emerald-500' : dept.productivity >= 88 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${dept.productivity}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black">{dept.productivity}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black">{dept.budget}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    dept.utilization >= 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {dept.utilization}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeView === 'location' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {locationData.map((loc, i) => (
                            <motion.div
                                key={loc.location}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-card border rounded-[3rem] p-10 shadow-sm group hover:border-primary/30 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Globe className="text-primary" size={24} />
                                    </div>
                                    <span className="px-3 py-1 bg-secondary rounded-full text-[8px] font-black uppercase tracking-widest text-muted-foreground">{loc.type}</span>
                                </div>
                                <h4 className="text-xl font-black tracking-tight mb-1">{loc.location}</h4>
                                <div className="flex items-baseline space-x-3 mb-6">
                                    <span className="text-3xl font-black tracking-tighter">{loc.staff}</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase">{loc.percentage}% of Global</span>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">YoY Growth</span>
                                    <span className="text-emerald-500 font-black text-sm flex items-center"><ArrowUpRight size={14} />{loc.growth}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {activeView === 'diversity' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Gender Distribution */}
                        <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm">
                            <h3 className="text-xl font-black tracking-tight mb-2">Gender Distribution</h3>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-8">Current workforce composition</p>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black">198</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Staff</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
                                {genderData.map(g => (
                                    <div key={g.name} className="text-center">
                                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: g.color }} />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{g.name}</p>
                                        <p className="text-lg font-black">{g.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Age Distribution */}
                        <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm">
                            <h3 className="text-xl font-black tracking-tight mb-2">Age Demographics</h3>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-10">Workforce age band analysis</p>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ageDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Diversity Trend */}
                        <div className="lg:col-span-2 bg-card p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-pink-500" />
                            <h3 className="text-xl font-black tracking-tight mb-2">Gender Parity Evolution</h3>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-10">Quarterly breakdown (%)</p>
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={diversityTrend}>
                                        <defs>
                                            <linearGradient id="diverseFemale" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} /><stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="diverseMale" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                        <Area type="monotone" dataKey="female" stroke="#ec4899" fill="url(#diverseFemale)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="male" stroke="#6366f1" fill="url(#diverseMale)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="nonbinary" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="6 3" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="flex items-center justify-center py-4 opacity-40">
                <div className="flex items-center space-x-3 px-6 py-3 bg-secondary/50 rounded-full">
                    <Eye size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Executive Read-Only Access</span>
                </div>
            </div>
        </div>
    );
};

export default ExecOrgAnalytics;
