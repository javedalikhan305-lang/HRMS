import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Users, TrendingUp, Clock, AlertCircle, 
    ArrowUpRight, ArrowDownRight, Search, 
    Filter, MoreVertical, ShieldCheck,
    Zap, Activity, Target, Cpu,
    ChevronRight, ExternalLink, Mail, Phone,
    Calendar, Briefcase
} from 'lucide-react';
import api from '../utils/api';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Team = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'intelligence' | 'nodes'>('intelligence');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['manager-dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/org/manager-stats');
            return res.data.data;
        }
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await api.get('/employees');
            return res.data.data;
        }
    });

    const filteredEmployees = employees?.filter((emp: any) => 
        emp.userId?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.userId?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pulseData = [
        { name: '08:00', value: 30 },
        { name: '10:00', value: 85 },
        { name: '12:00', value: 95 },
        { name: '14:00', value: 92 },
        { name: '16:00', value: 88 },
        { name: '18:00', value: 40 },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Cpu className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                </div>
            </div>
        );
    }

    const intel = stats?.intelligence || {
        attendancePulse: "0",
        trendDirection: "UP",
        engagementIndex: "0",
        riskLevel: "LOW",
        latePercentage: "0",
        complianceScore: 100
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header with Intelligence Toggle */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-primary">
                        <Activity size={20} className="animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Quantum Workforce Matrix</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter">Team Intelligence</h1>
                    <p className="text-muted-foreground font-medium max-w-xl">
                        AI-driven behavioral analytics and real-time workforce synchronization for high-performance managers.
                    </p>
                </div>

                <div className="flex p-1.5 bg-secondary/50 rounded-[2rem] border backdrop-blur-md">
                    <button 
                        onClick={() => setViewMode('intelligence')}
                        className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                            viewMode === 'intelligence' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-muted-foreground'
                        }`}
                    >
                        <Zap size={14} />
                        <span>Intelligence</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('nodes')}
                        className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                            viewMode === 'nodes' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-muted-foreground'
                        }`}
                    >
                        <Users size={14} />
                        <span>Workforce Nodes</span>
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'intelligence' ? (
                    <motion.div 
                        key="intel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Intelligence Core */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                                    <Cpu size={300} />
                                </div>
                                <div className="relative z-10 space-y-12">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                                <Target size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight">Active Pulse Engine</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Health: Stable</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-5xl font-black tracking-tighter">{intel.attendancePulse}%</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Attendance Pulse</p>
                                        </div>
                                    </div>

                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats?.charts?.attendanceTrend || pulseData}>
                                                <defs>
                                                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '16px' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey={stats?.charts?.attendanceTrend ? "count" : "value"} 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={4}
                                                    fillOpacity={1} 
                                                    fill="url(#colorPulse)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Work Tempo</p>
                                            <p className="text-2xl font-black">{stats?.avgTeamWorkHours}h/day</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Engagement</p>
                                            <p className="text-2xl font-black text-emerald-400">{intel.engagementIndex}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Late Markers</p>
                                            <p className="text-2xl font-black text-rose-400">{intel.latePercentage}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Risk Index</p>
                                            <p className={`text-2xl font-black ${intel.riskLevel === 'HIGH' ? 'text-rose-500' : 'text-emerald-500'}`}>{intel.riskLevel}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm group hover:border-primary transition-all">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Secure</span>
                                    </div>
                                    <h4 className="text-lg font-black tracking-tight mb-2">Compliance Shield</h4>
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-6">
                                        Workforce adherence to shift protocols and organizational policies.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span>Score Index</span>
                                            <span>{intel.complianceScore}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${intel.complianceScore}%` }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary p-10 rounded-[3.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                                    <Zap className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700" size={160} />
                                    <h4 className="text-lg font-black tracking-tight mb-4 relative z-10">Smart Allocation</h4>
                                    <p className="text-xs font-bold text-white/70 mb-8 relative z-10">
                                        System predicts <span className="text-white font-black">+{intel.engagementIndex}% productivity</span> if resource allocation remains consistent.
                                    </p>
                                    <button className="bg-white text-primary px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all relative z-10 shadow-xl">
                                        Optimize Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="nodes"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Probe workforce nodes by name, department or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-card border-2 border-secondary pl-16 pr-8 py-5 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <button className="px-10 py-5 bg-card border-2 border-secondary rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center space-x-3 hover:bg-secondary/50 transition-all">
                                <Filter size={18} />
                                <span>Advanced Matrix</span>
                            </button>
                        </div>

                        {/* Workforce Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredEmployees?.map((emp: any) => (
                                <motion.div 
                                    layout
                                    key={emp._id}
                                    className="bg-card p-8 rounded-[3.5rem] border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => navigate(`/dashboard/profile/${emp.userId?._id}`)}
                                            className="p-3 bg-primary text-white rounded-2xl shadow-lg"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-col items-center text-center space-y-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-secondary group-hover:border-primary transition-colors">
                                                <img 
                                                    src={emp.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.userId?.firstName}`} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-card rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                <ShieldCheck size={16} />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black tracking-tight">{emp.userId?.firstName} {emp.userId?.lastName}</h3>
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">{emp.designation?.name || 'Engineer'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 w-full py-6 border-y border-secondary/50">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                                                <p className="text-xs font-black text-emerald-500">OPTIMIZED</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Dept</p>
                                                <p className="text-xs font-black truncate">{emp.department?.shortName || emp.department?.name || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 w-full">
                                            <button className="flex-1 py-3 bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                                <Mail size={14} className="mx-auto" />
                                            </button>
                                            <button className="flex-1 py-3 bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                                <Phone size={14} className="mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Team;
