import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, TrendingUp, TrendingDown, 
    Activity, Brain, Eye, BarChart3, PieChart as PieChartIcon,
    Download, Calendar, Clock, Zap,
    AlertTriangle, Sparkles, RefreshCw, Loader2, ChevronRight
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, PieChart, Pie, Cell,
    BarChart, Bar, ComposedChart, Line
} from 'recharts';

import { dashboardService } from '../services/dashboardService';
import moment from 'moment';

const KPICard = ({ icon: Icon, label, value, change, changeType, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-card p-6 rounded-3xl border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all"
    >
        <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4`}>
            <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black">{value}</h3>
            {change && (
                <span className={`text-[10px] font-bold ${changeType === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {change}
                </span>
            )}
        </div>
    </motion.div>
);

const ExecutiveDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const stats = await dashboardService.getExecutiveStats();
            setData(stats);
        } catch (error) {
            console.error("Failed to fetch executive stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fetching Data...</p>
            </div>
        );
    }

    const { kpis, charts, aiInsights, diversity } = data;

    return (
        <div className="space-y-6 pb-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center">
                        Main Dashboard
                        <Sparkles size={20} className="ml-2 text-primary opacity-50" />
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">A quick look at your employees and company health.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchData} className="p-3 bg-secondary rounded-2xl hover:text-primary transition-all shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg hover:opacity-90 transition-all">
                        <Download size={14} />
                        <span>Download Info</span>
                    </button>
                </div>
            </header>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Users} label="Total Employees" value={kpis.totalHeadcount.value} change={kpis.totalHeadcount.change} changeType={kpis.totalHeadcount.type} color="bg-blue-500" delay={0.1} />
                <KPICard icon={TrendingUp} label="New Employees" value={kpis.headcountGrowth.value} change="+2.4%" changeType="up" color="bg-emerald-500" delay={0.2} />
                <KPICard icon={TrendingDown} label="Leaving Rate" value={kpis.attritionRate.value} change="-0.4%" changeType="up" color="bg-rose-500" delay={0.3} />
                <KPICard icon={Activity} label="Productivity" value={kpis.productivityIndex.value} change="+1.2%" changeType="up" color="bg-amber-500" delay={0.4} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-card p-8 rounded-[2rem] border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-lg flex items-center">
                            <TrendingUp className="mr-2 text-primary" size={20} />
                            Employee Growth
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.workforceGrowth}>
                                <defs>
                                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="headcount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHeadcount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dept Pie */}
                <div className="bg-card p-8 rounded-[2rem] border shadow-sm">
                    <h3 className="font-black text-lg flex items-center mb-6">
                        <PieChartIcon className="mr-2 text-primary" size={20} />
                        Employees by Department
                    </h3>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={charts.deptDistribution} 
                                    innerRadius={60} 
                                    outerRadius={85} 
                                    paddingAngle={5} 
                                    dataKey="value" 
                                    stroke="none"
                                >
                                    {charts.deptDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                        {charts.deptDistribution.slice(0, 4).map((dept: any, i: number) => (
                            <div key={dept.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4] }} />
                                    <span className="font-bold text-muted-foreground truncate max-w-[100px]">{dept.name}</span>
                                </div>
                                <span className="font-black">{dept.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights - Simplified */}
                <div className="bg-card p-8 rounded-[2rem] border shadow-sm">
                    <h3 className="font-black text-lg flex items-center mb-6">
                        <Brain className="mr-2 text-primary" size={20} />
                        Important Alerts
                    </h3>
                    <div className="space-y-4">
                        {aiInsights.attrition.map((r: any) => (
                            <div key={r.dept} className="p-4 bg-secondary/30 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.risk > 70 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">{r.dept}</p>
                                        <p className="text-xs font-black">Leaving Risk: {r.risk}%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Alert</p>
                                    <p className="text-xs font-black">{r.people} People</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secondary Stats Group */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-black text-white p-8 rounded-[2rem] relative overflow-hidden">
                        <Zap size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                        <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest mb-1">Team Satisfaction</p>
                        <h4 className="text-3xl font-black">8.4/10</h4>
                        <p className="text-[10px] font-bold text-emerald-400 mt-4 flex items-center">
                            <TrendingUp size={12} className="mr-1" />
                            +0.3 from last month
                        </p>
                    </motion.div>

                    <div className="bg-card p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Leave Rate</p>
                            <h4 className="text-3xl font-black">3.1%</h4>
                        </div>
                        <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px]">
                            <TrendingUp size={12} />
                            <span>Action Needed</span>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-[2rem] border shadow-sm col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest leading-none mb-1">Job Vacancies</p>
                                <h4 className="text-xl font-black">12 Open Roles</h4>
                            </div>
                        </div>
                        <button className="p-3 bg-secondary rounded-xl hover:bg-primary hover:text-white transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center pt-8 opacity-40">
                <div className="flex items-center space-x-2 px-4 py-2 bg-secondary rounded-full">
                    <Eye size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Official HR Data</span>
                </div>
            </div>
        </div>
    );
};


export default ExecutiveDashboard;

