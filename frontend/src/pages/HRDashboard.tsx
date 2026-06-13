import React, { useState, useEffect } from 'react';
import { 
    Users, UserCheck, CalendarClock, Clock, 
    Wallet, TrendingUp, PieChart as PieChartIcon,
    Zap, ArrowUpRight, ArrowDownRight,
    Search, Filter, Download, MoreVertical,
    Activity, Shield, Building2, MapPin, Loader2
} from 'lucide-react';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { motion } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import moment from 'moment';

const StatCard = ({ icon: Icon, label, value, subValue, trend, color, delay }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5 }}
        className="bg-card p-8 rounded-[3rem] border shadow-sm group hover:border-primary/50 transition-all relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
        <div className="relative z-10">
            <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6`}>
                <Icon className={color.replace('bg-', 'text-')} size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
                    <p className="text-xs font-bold text-muted-foreground mt-1">{subValue}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const HRDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await dashboardService.getHRStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch HR stats", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Synthesizing Org Analytics...</p>
            </div>
        );
    }

    const { cards, charts } = stats || {};

    const handleExport = () => {
        if (!stats) return;
        
        // Prepare CSV Content
        const rows = [
            ["HR Dashboard Analytics Report", moment().format('YYYY-MM-DD HH:mm')],
            [],
            ["Workforce Metrics"],
            ["Total Employees", cards?.totalEmployees || 0],
            ["Active Users", cards?.activeUsers || 0],
            ["Pending Leaves", cards?.pendingLeaves || 0],
            ["Avg Performance", `${cards?.avgPerformance || 0}%`],
            [],
            ["Departmental Distribution"],
            ["Metric", "Value"]
        ];

        // Add chart data if available
        if (charts?.deptDistribution) {
            charts.deptDistribution.forEach((d:any) => rows.push([d.name, d.value]));
        }

        const csvContent = "data:text/csv;charset=utf-8," 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `HRMS_Analytics_${moment().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-10 font-inter">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">HR Command Center</h1>
                    <p className="text-muted-foreground font-medium flex items-center">
                        <Activity className="mr-2 text-primary" size={18} />
                        Global Workforce Strategy & Operations Management
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2"
                    >
                        <Download size={14} />
                        <span>Export Analytics</span>
                    </button>
                    <button className="p-4 bg-secondary/50 rounded-2xl hover:bg-foreground hover:text-white transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Users} 
                    label="Total Workforce" 
                    value={cards?.totalEmployees || 0} 
                    subValue="Active Employees"
                    color="bg-primary"
                    delay={0.1}
                />
                <StatCard 
                    icon={UserCheck} 
                    label="Present Today" 
                    value={cards?.presentToday || 0} 
                    subValue={`${cards?.activeEmployees > 0 ? ((cards?.presentToday / cards?.activeEmployees) * 100).toFixed(1) : '0.0'}% Attendance`}
                    color="bg-green-500"
                    delay={0.2}
                />
                <StatCard 
                    icon={Clock} 
                    label="Absent Today" 
                    value={cards?.absentToday || 0} 
                    subValue="Authorized & Unplanned"
                    color="bg-rose-500"
                    delay={0.3}
                />
                <StatCard 
                    icon={CalendarClock} 
                    label="Pending Leaves" 
                    value={cards?.pendingLeaves || 0} 
                    subValue="Requires Approval"
                    color="bg-amber-500"
                    delay={0.4}
                />
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Workforce Productivity Area Chart */}
                <div className="xl:col-span-2 bg-card p-10 rounded-[3.5rem] border shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight flex items-center">
                                <TrendingUp className="mr-3 text-primary" size={24} />
                                Attendance Momentum
                            </h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time daily presence trend (Last 30 Days)</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts?.attendanceTrend || []}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} 
                                    dy={10}
                                    tickFormatter={(val) => moment(val).format('DD MMM')}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="present" 
                                    stroke="#6366f1" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorActive)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department Distribution Donut */}
                <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm flex flex-col justify-between group">
                    <div className="flex flex-col mb-10">
                        <h3 className="text-xl font-black tracking-tight flex items-center">
                            <PieChartIcon className="mr-3 text-primary" size={22} />
                            Org Allocation
                        </h3>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Departmental headcount weight</p>
                    </div>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts?.departmentWiseEmployees || []}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(charts?.departmentWiseEmployees || []).map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                            <span className="text-3xl font-black tracking-tighter">{cards?.totalEmployees || 0}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Staff</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t">
                        {(charts?.departmentWiseEmployees || []).slice(0, 4).map((dept: any, i: number) => (
                            <div key={dept.name} className="flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-tight text-muted-foreground truncate">{dept.name}</p>
                                    <p className="text-sm font-black">{dept.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Activity (Placeholder for real logs) */}
                <div className="lg:col-span-3 bg-card p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden group">
                     <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black tracking-tight flex items-center">
                            <Zap className="mr-3 text-primary" size={24} />
                            Critical Pulse
                        </h3>
                    </div>
                    <p className="text-center text-sm text-muted-foreground py-10">Live global activity stream is being synchronized...</p>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
