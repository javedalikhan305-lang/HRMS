import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Clock, Calendar, CheckSquare, 
    ChevronRight, Zap, 
    ArrowRight, MessageSquare, BarChart3, Loader2
} from 'lucide-react';
import { 
    XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';

const ManagerDashboard = () => {
    const { user: _user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await dashboardService.getManagerStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch manager stats", error);
        } finally {
            setLoading(false);
        }
    };

    const teamStats = [
        { label: 'Team Size', value: stats?.teamSize || 0, sub: 'Active nodes', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Attendance', value: `${(stats?.attendanceRate || 0).toFixed(0)}%`, sub: 'Daily average', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'On Leave', value: stats?.onLeaveToday || 0, sub: 'Out of office', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Approvals', value: stats?.pendingApprovals || 0, sub: 'Requires action', icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Initializing Command Center...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Manager Welcome Card */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Manager Command Center</h1>
                    <p className="text-muted-foreground font-medium italic">Leading your strategic department units</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => navigate('/dashboard/approvals')}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                    >
                        <Zap size={18} />
                        <span>Approvals Hub</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg ml-2">{stats?.pendingApprovals || 0}</span>
                    </button>
                </div>
            </header>

            {/* Team Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamStats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-card p-8 rounded-[3rem] border shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <div className="flex items-baseline space-x-2">
                             <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-2">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Team Productivity Chart (Placeholder for real data) */}
                <div className="lg:col-span-2 bg-card border rounded-[3.5rem] p-10 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Team Productivity</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Intelligence is being gathered from workforce nodes...</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full flex items-center justify-center bg-secondary/20 rounded-3xl">
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Historical data stream connecting...</p>
                    </div>
                </div>

                {/* Team Mix */}
                <div className="bg-card border rounded-[3.5rem] p-10 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black tracking-tight mb-8">Compliance Mix</h3>
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="w-48 h-48 rounded-full border-[12px] border-primary/20 border-t-primary relative flex items-center justify-center">
                                <span className="text-4xl font-black">{stats?.attendanceRate?.toFixed(0)}%</span>
                                <div className="absolute -bottom-2 px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">Live</div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-secondary text-foreground hover:bg-foreground hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-8">
                        View Fleet Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
