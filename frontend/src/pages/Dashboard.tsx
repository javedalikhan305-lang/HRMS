import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import HRDashboard from './HRDashboard';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { 
    Clock, Calendar, FileText, TrendingUp, 
    Sparkles, Zap, CalendarDays, Briefcase, Plane, UserCheck, LayoutDashboard,
    Loader2, Building2, UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import ManagerDashboard from './ManagerDashboard';
import { dashboardService } from '../services/dashboardService';

const EmployeeDashboard = () => {
    const { user } = useAuthStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchStats();
        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const data = await dashboardService.getPersonalStats();
            setStatsData(data);
        } catch (error) {
            console.error("Failed to fetch personal stats", error);
        } finally {
            setLoading(false);
        }
    };

    const greeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const stats = [
        { 
            label: 'Today Punch', 
            value: (statsData?.recentLogs?.[0]?.date && moment(statsData.recentLogs[0].date).utcOffset('+05:30').isSame(moment().utcOffset('+05:30'), 'day')) 
                ? (statsData.recentLogs[0].punchIn ? moment(statsData.recentLogs[0].punchIn).format('hh:mm A') : 'Not Yet')
                : 'Not Yet', 
            sub: (statsData?.recentLogs?.[0]?.date && moment(statsData.recentLogs[0].date).utcOffset('+05:30').isSame(moment().utcOffset('+05:30'), 'day'))
                ? (statsData.recentLogs[0].status || 'Active')
                : 'Pending', 
            icon: Clock, 
            color: 'text-primary', 
            bg: 'bg-primary/10' 
        },
        { 
            label: 'Monthly Leaves', 
            value: `${statsData?.totalLeavesThisMonth || 0} Days`, 
            sub: 'Approved this month', 
            icon: Calendar, 
            color: 'text-green-500', 
            bg: 'bg-green-500/10' 
        },
        { 
            label: 'Upcoming Holiday', 
            value: 'Jun 15', 
            sub: 'Juneteenth', 
            icon: Sparkles, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10' 
        },
        { 
            label: 'Total Presence', 
            value: (statsData?.attendanceSummary || [])
                .filter((s: any) => ['Present', 'Late', 'Half Day'].includes(s._id))
                .reduce((acc: number, curr: any) => acc + curr.count, 0), 
            sub: 'Total productive days', 
            icon: TrendingUp, 
            color: 'text-indigo-500', 
            bg: 'bg-indigo-500/10' 
        },
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Loading Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Welcome Header */}
            <div className="relative overflow-hidden bg-primary rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-primary/30">
                <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12">
                    <LayoutDashboard size={300} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                        >
                            {moment().format('dddd, MMMM Do')}
                        </motion.span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3">
                            {greeting()}, {user?.firstName}!
                        </h1>
                        <p className="text-white/70 max-w-md text-lg font-medium leading-tight">
                            You have {(statsData?.attendanceSummary || []).filter((s: any) => ['Present', 'Late', 'Half Day'].includes(s._id)).reduce((acc: number, curr: any) => acc + curr.count, 0)} recorded attendance logs this cycle. Have a productive day!
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 text-center min-w-[200px]">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Current Time</p>
                        <h2 className="text-4xl font-black tabular-nums">{moment(currentTime).format('hh:mm:ss')}</h2>
                        <p className="text-sm font-bold text-primary-foreground/80">{moment(currentTime).format('A')}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-card p-6 rounded-[2.5rem] border shadow-sm group hover:border-primary/50 transition-all cursor-pointer"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black tracking-tight mb-1">{stat.value}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities & Holidays */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-[3rem] border shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black tracking-tight flex items-center">
                                <Zap className="mr-3 text-primary" size={24} />
                                Recent Activities
                            </h3>
                            <Link to="/dashboard/attendance" className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-6">
                            {(statsData?.recentLogs || []).length > 0 ? (
                                (statsData?.recentLogs || []).map((act: any, i: number) => (
                                    <div key={i} className="flex items-start space-x-4 p-4 rounded-[2rem] hover:bg-secondary/30 transition-colors">
                                        <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${act?.status === 'Late' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-0.5">
                                                <p className="font-bold text-sm">Attendance Log - {act?.status || 'Active'}</p>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{act?.date ? moment(act.date).fromNow() : 'Today'}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Recorded at {act?.punchIn ? moment(act.punchIn).format('hh:mm A') : '--:--'} from {
                                                    typeof act?.location === 'object' 
                                                        ? act.location.address || 'Unknown Location' 
                                                        : act?.location || 'Remote Node'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-10">No recent activity logs found.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column: Quick Actions & Profile Summary */}
                <div className="space-y-8">
                    <div className="bg-card rounded-[3rem] border shadow-sm p-8 overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl transition-all group-hover:scale-150" />
                        <h3 className="text-lg font-black tracking-tight mb-8">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: 'Apply Leave', icon: Plane, to: '/dashboard/leave', color: 'bg-rose-500/10 text-rose-500' },
                                { label: 'Mark Attendance', icon: UserCheck, to: '/dashboard/attendance', color: 'bg-blue-500/10 text-blue-500' },
                                { label: 'Org Chart', icon: Building2, to: '/dashboard/org', color: 'bg-emerald-500/10 text-emerald-500' },
                                { label: 'My Profile', icon: UserCircle, to: '/dashboard/profile', color: 'bg-purple-500/10 text-purple-500' },
                            ].map((action) => (
                                <Link 
                                    to={action.to} 
                                    key={action.label}
                                    className="flex flex-col items-center justify-center p-6 rounded-3xl bg-secondary/50 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all group/action"
                                >
                                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover/action:scale-110 transition-transform`}>
                                        <action.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-[3rem] border shadow-sm p-8">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 p-1 mx-auto mb-4 border-2 border-primary/20">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-[1.75rem]"
                                />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">{user?.firstName} {user?.lastName}</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-muted-foreground">Status</span>
                                <span className="text-xs font-black text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-muted-foreground">Department</span>
                                <span className="text-xs font-black">{(user as any)?.departmentId?.name || 'Assigned'}</span>
                            </div>
                        </div>
                        <Link to="/dashboard/profile">
                            <button className="w-full mt-8 py-4 bg-secondary text-foreground hover:bg-primary hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                View Full Profile
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};


import ExecutiveDashboard from './ExecutiveDashboard';

const Dashboard = () => {
    const { user } = useAuthStore();
    
    if (!user) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Verifying Identity...</p>
            </div>
        );
    }

    if (user?.role === 'HR_ADMIN') {
        return <ExecutiveDashboard />;
    }

    if (user?.role === 'MANAGER') {
        return <ManagerDashboard />;
    }

    return <EmployeeDashboard />;
};

export default Dashboard;
