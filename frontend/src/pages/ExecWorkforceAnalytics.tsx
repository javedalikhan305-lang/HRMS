import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, ArrowUpRight, ArrowDownRight, Users,
    Download, Filter, Eye, Brain, Sparkles,
    UserPlus, UserMinus, Clock, Target, Briefcase,
    ChevronRight, Calendar, BarChart3
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ComposedChart, Bar, Line,
    PieChart, Pie, Cell
} from 'recharts';

const ExecWorkforceAnalytics = () => {
    const [activeView, setActiveView] = useState<'headcount' | 'hiring' | 'exits'>('headcount');

    const headcountTrend = [
        { month: 'Jul 23', total: 120, ft: 108, contract: 12 },
        { month: 'Aug 23', total: 125, ft: 113, contract: 12 },
        { month: 'Sep 23', total: 130, ft: 117, contract: 13 },
        { month: 'Oct 23', total: 138, ft: 124, contract: 14 },
        { month: 'Nov 23', total: 135, ft: 121, contract: 14 },
        { month: 'Dec 23', total: 140, ft: 126, contract: 14 },
        { month: 'Jan 24', total: 142, ft: 128, contract: 14 },
        { month: 'Feb 24', total: 151, ft: 136, contract: 15 },
        { month: 'Mar 24', total: 160, ft: 144, contract: 16 },
        { month: 'Apr 24', total: 172, ft: 155, contract: 17 },
        { month: 'May 24', total: 184, ft: 166, contract: 18 },
        { month: 'Jun 24', total: 198, ft: 179, contract: 19 },
    ];

    const hiringPipeline = [
        { stage: 'Applied', count: 342, conversion: '100%' },
        { stage: 'Screened', count: 186, conversion: '54%' },
        { stage: 'Interviewed', count: 94, conversion: '51%' },
        { stage: 'Offered', count: 38, conversion: '40%' },
        { stage: 'Joined', count: 28, conversion: '74%' },
    ];

    const hiringByDept = [
        { dept: 'Engineering', open: 8, filled: 14, pipeline: 45 },
        { dept: 'Sales', open: 4, filled: 8, pipeline: 22 },
        { dept: 'Product', open: 2, filled: 5, pipeline: 12 },
        { dept: 'Marketing', open: 1, filled: 3, pipeline: 8 },
    ];

    const exitReasons = [
        { name: 'Better Opportunity', value: 35, color: '#6366f1' },
        { name: 'Career Growth', value: 25, color: '#ef4444' },
        { name: 'Compensation', value: 20, color: '#f59e0b' },
        { name: 'Work-Life Balance', value: 12, color: '#ec4899' },
        { name: 'Other', value: 8, color: '#94a3b8' },
    ];

    const exitTrend = [
        { month: 'Jan', voluntary: 2, involuntary: 1 },
        { month: 'Feb', voluntary: 3, involuntary: 2 },
        { month: 'Mar', voluntary: 2, involuntary: 2 },
        { month: 'Apr', voluntary: 4, involuntary: 2 },
        { month: 'May', voluntary: 2, involuntary: 2 },
        { month: 'Jun', voluntary: 1, involuntary: 2 },
    ];

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center space-x-1">
                            <Eye size={10} /><span>Read-Only</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Workforce Analytics</h1>
                    <p className="text-muted-foreground font-medium">Headcount evolution, hiring velocity, and exit intelligence.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-secondary/50 p-1 rounded-2xl flex">
                        {[
                            { id: 'headcount', label: 'Headcount', icon: Users },
                            { id: 'hiring', label: 'Hiring', icon: UserPlus },
                            { id: 'exits', label: 'Exit Intel', icon: UserMinus },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveView(t.id as any)}
                                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                                    activeView === t.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
                                }`}
                            >
                                <t.icon size={14} /><span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                    <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center space-x-2">
                        <Download size={14} /><span>Export</span>
                    </button>
                </div>
            </header>

            {activeView === 'headcount' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Current Headcount', value: '198', change: '+39.4%', up: true, icon: Users },
                            { label: 'Full-Time', value: '179', change: '+39.8%', up: true, icon: Briefcase },
                            { label: 'Contractors', value: '19', change: '+35.7%', up: true, icon: Clock },
                            { label: 'YoY Net Growth', value: '+78', change: 'Best Quarter', up: true, icon: TrendingUp },
                        ].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-card p-8 rounded-[3rem] border shadow-sm group hover:border-primary/50 transition-all"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <s.icon size={24} />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                                <h3 className="text-3xl font-black tracking-tighter">{s.value}</h3>
                                <p className="text-[10px] font-black text-emerald-500 mt-1 flex items-center"><ArrowUpRight size={12} />{s.change}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                        <h3 className="text-2xl font-black tracking-tight mb-2">12-Month Headcount Trajectory</h3>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-10">Full-time vs contract workforce evolution</p>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={headcountTrend}>
                                    <defs>
                                        <linearGradient id="ftGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="ctGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="ft" fill="url(#ftGrad)" stroke="#6366f1" strokeWidth={3} name="Full-Time" />
                                    <Area type="monotone" dataKey="contract" fill="url(#ctGrad)" stroke="#10b981" strokeWidth={3} name="Contract" />
                                    <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Total" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeView === 'hiring' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Hiring Funnel */}
                        <div className="xl:col-span-2 bg-card p-10 rounded-[3.5rem] border shadow-sm">
                            <h3 className="text-2xl font-black tracking-tight mb-2">Hiring Funnel</h3>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-10">Candidate conversion pipeline</p>
                            <div className="space-y-4">
                                {hiringPipeline.map((stage, i) => (
                                    <div key={stage.stage} className="flex items-center space-x-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground w-24">{stage.stage}</span>
                                        <div className="flex-1 relative">
                                            <div className="h-12 bg-secondary/30 rounded-2xl overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(stage.count / hiringPipeline[0].count) * 100}%` }}
                                                    transition={{ delay: i * 0.1, duration: 0.8 }}
                                                    className="h-full bg-indigo-500/20 rounded-2xl flex items-center px-4"
                                                >
                                                    <span className="text-sm font-black">{stage.count}</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-primary w-12 text-right">{stage.conversion}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Dept Hiring */}
                        <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm">
                            <h3 className="text-xl font-black tracking-tight mb-8">Open by Department</h3>
                            <div className="space-y-6">
                                {hiringByDept.map(d => (
                                    <div key={d.dept} className="p-5 bg-secondary/20 rounded-2xl space-y-3 border border-secondary">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-sm">{d.dept}</span>
                                            <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{d.open} Open</span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span>Filled: <span className="text-emerald-500">{d.filled}</span></span>
                                            <span>Pipeline: <span className="text-indigo-500">{d.pipeline}</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeView === 'exits' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Exit Reasons */}
                        <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm">
                            <h3 className="text-xl font-black tracking-tight mb-2">Exit Intelligence</h3>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-8">Primary reasons for attrition (%)</p>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={exitReasons} innerRadius={60} outerRadius={95} paddingAngle={6} dataKey="value" stroke="none">
                                            {exitReasons.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={6} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black">25</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Exits</span>
                                </div>
                            </div>
                            <div className="space-y-3 mt-8 pt-6 border-t">
                                {exitReasons.map(r => (
                                    <div key={r.name} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                                            <span className="text-[10px] font-black uppercase text-muted-foreground">{r.name}</span>
                                        </div>
                                        <span className="text-xs font-black">{r.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Exit Trend */}
                        <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                            <h3 className="text-xl font-black tracking-tight mb-2">Exit Trend</h3>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-10">Voluntary vs involuntary separations</p>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={exitTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                        <Bar dataKey="voluntary" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} name="Voluntary" />
                                        <Bar dataKey="involuntary" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} name="Involuntary" />
                                        <Line type="monotone" dataKey="voluntary" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    </ComposedChart>
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

export default ExecWorkforceAnalytics;
