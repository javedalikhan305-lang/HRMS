import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Clock, Calendar, ArrowRight, CheckCircle2, 
    AlertCircle, Download, BarChart3, History as HistoryIcon, 
    FileEdit, ChevronLeft, ChevronRight, Search, Globe, Lock,
    Users, MapPin, Zap, Filter, MoreVertical, ShieldCheck,
    Briefcase, Building2, Timer, LogOut, Loader2, X, Plus,
    UserCircle, Verified
} from 'lucide-react';
import api from '../utils/api';
import moment from 'moment';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';

// ─── CSV Export Utility ─────────────────────────────────────────────────────
const exportToCSV = (data: any[], userName: string) => {
    if (!data || data.length === 0) {
        alert('No attendance history to export.');
        return;
    }

    const headers = ['Date', 'Status', 'Punch In', 'Punch Out', 'Work Hours', 'Location'];

    const rows = data.map((row: any) => [
        moment(row.date).format('DD/MM/YYYY'),
        row.status || '-',
        row.punchIn ? moment(row.punchIn).format('hh:mm:ss A') : '-',
        row.punchOut ? moment(row.punchOut).format('hh:mm:ss A') : '-',
        row.workHours ? `${row.workHours.toFixed(2)} hrs` : '0.00 hrs',
        row.location?.address || 'Office'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${userName.replace(/\s+/g, '_')}_${moment().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const Attendance = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'individual' | 'governance'>('individual');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualForm, setManualForm] = useState({
        userId: '',
        date: moment().format('YYYY-MM-DD'),
        status: 'Present',
        punchIn: '09:00',
        punchOut: '17:00'
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isManagement = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'MANAGER';

    const { data: history, isLoading } = useQuery({
        queryKey: ['attendance-history'],
        queryFn: async () => {
            const res = await api.get('/attendance/history');
            return res.data.data;
        }
    });

    const { data: todayStats } = useQuery({
        queryKey: ['attendance-today'],
        queryFn: async () => {
            const res = await api.get('/attendance/today');
            return res.data.data;
        },
        enabled: isManagement
    });

    const { data: orgStats } = useQuery({
        queryKey: ['org-dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/org/dashboard-stats');
            return res.data.data;
        },
        enabled: isManagement
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: employeeService.getAllEmployees,
        enabled: isManagement
    });

    const punchInMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/attendance/punch-in', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
            toast.success("Punch In Successful");
        }
    });

    const punchOutMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/attendance/punch-out', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
            toast.success("Punch Out Successful");
        }
    });

    const markManualMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/attendance/manual', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
            setIsManualModalOpen(false);
            toast.success("Attendance Marked Successfully");
        }
    });

    const todayRecord = history?.find((h: any) => moment(h.date).isSame(moment(), 'day'));
    const presentDays = history?.filter((h: any) => h.status === 'Present' || h.status === 'Late').length || 0;

    const stats = [
        { label: 'Today In', value: todayRecord?.punchIn ? moment(todayRecord.punchIn).format('hh:mm A') : '--:--', icon: Clock, color: 'text-primary' },
        { label: 'Work Hours', value: todayRecord?.workHours ? `${todayRecord.workHours.toFixed(1)} hrs` : '0.0 hrs', icon: Timer, color: 'text-green-500' },
        { label: 'Today Status', value: todayRecord?.status || 'Pending', icon: ShieldCheck, color: 'text-amber-500' },
        { label: 'Total Present', value: `${presentDays} Days`, icon: CheckCircle2, color: 'text-indigo-500' },
    ];

    const governanceStats = [
        { label: 'Live Staff', value: orgStats?.cards?.presentToday || 0, sub: 'Active Real-time', icon: Users, color: 'bg-indigo-500' },
        { label: 'Total Fleet', value: orgStats?.cards?.activeEmployees || 0, sub: 'Workforce', icon: Globe, color: 'bg-emerald-500' },
        { label: 'Late Entries', value: todayStats?.filter((a:any) => a.status === 'Late').length || 0, sub: 'Requires Review', icon: AlertCircle, color: 'bg-amber-500' },
        { label: 'Absent Today', value: orgStats?.cards?.absentToday || 0, sub: 'Unaccounted', icon: LogOut, color: 'bg-rose-500' },
    ];

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        markManualMutation.mutate(manualForm);
    };

    const getEmployeeTodayStatus = (userId: string) => {
        const record = todayStats?.find((a: any) => a.userId === userId);
        if (!record) return { label: 'Absent', color: 'bg-rose-500', icon: X };
        
        switch(record.status) {
            case 'Present': return { label: 'Present', color: 'bg-emerald-500', icon: CheckCircle2 };
            case 'Late': return { label: 'Late Mark', color: 'bg-amber-500', icon: Clock };
            case 'Half Day': return { label: 'Half Day', color: 'bg-indigo-500', icon: Timer };
            default: return { label: 'Unknown', color: 'bg-secondary', icon: AlertCircle };
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Attendance Governance</h1>
                    <p className="text-muted-foreground font-medium">Tracking workforce presence, network transparency, and shift compliance in real-time.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isManagement && (
                        <div className="bg-secondary/50 p-1 rounded-2xl flex mr-3">
                            <button 
                                onClick={() => setViewMode('individual')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                                    viewMode === 'individual' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
                                }`}
                            >
                                Personal
                            </button>
                            <button 
                                onClick={() => setViewMode('governance')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                                    viewMode === 'governance' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
                                }`}
                            >
                                Organization
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => exportToCSV(history || [], `${user?.firstName || 'employee'} ${user?.lastName || ''}`)}
                        disabled={!history || history.length === 0}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={14} />
                        <span>Export History</span>
                    </button>
                </div>
            </header>

            {viewMode === 'individual' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-card p-10 rounded-[4rem] border shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700">
                                <Clock size={300} />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="space-y-6 text-center md:text-left">
                                    <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                        <Globe size={12} className="mr-2" />
                                        Network Verified: Office Node
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tight leading-none mb-2">Time Registry</h2>
                                        <p className="text-muted-foreground font-medium">Capture your daily presence with millisecond precision.</p>
                                    </div>
                                    {todayRecord?.punchIn && (
                                        <div className="flex items-center space-x-6">
                                            <div className="bg-secondary/50 p-4 rounded-3xl border">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Check-In Time</p>
                                                <p className="text-sm font-black">{moment(todayRecord.punchIn).format('hh:mm:ss A')}</p>
                                            </div>
                                            {todayRecord?.punchOut && (
                                                <div className="bg-secondary/50 p-4 rounded-3xl border">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Check-Out Time</p>
                                                    <p className="text-sm font-black">{moment(todayRecord.punchOut).format('hh:mm:ss A')}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-6xl font-black tabular-nums tracking-tighter text-primary">{moment(currentTime).format('hh:mm')}</p>
                                        <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">
                                            {moment(currentTime).format('A')} • {moment(currentTime).format('ddd, MMM DD')}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        {!todayRecord || !todayRecord.punchIn ? (
                                            <button 
                                                disabled={punchInMutation.isPending}
                                                onClick={() => punchInMutation.mutate({ location: 'Office', ip: '127.0.0.1' })}
                                                className="bg-primary text-white h-24 px-12 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-4 group disabled:opacity-50"
                                            >
                                                {punchInMutation.isPending ? <Loader2 className="animate-spin" /> : <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />}
                                                <span>Punch In</span>
                                            </button>
                                        ) : !todayRecord.punchOut ? (
                                            <button 
                                                disabled={punchOutMutation.isPending}
                                                onClick={() => punchOutMutation.mutate({ location: 'Office' })}
                                                className="bg-rose-500 text-white h-24 px-12 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-4 group disabled:opacity-50"
                                            >
                                                {punchOutMutation.isPending ? <Loader2 className="animate-spin" /> : <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />}
                                                <span>Punch Out</span>
                                            </button>
                                        ) : (
                                            <div className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 h-24 px-12 rounded-[2.5rem] font-black text-xl flex items-center space-x-4">
                                                <CheckCircle2 size={32} />
                                                <span>Session Closed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-10 rounded-[4rem] border shadow-sm flex flex-col justify-between group h-full">
                            <h3 className="text-xl font-black tracking-tight mb-8">Personal Performance</h3>
                            <div className="grid grid-cols-2 gap-8 flex-1">
                                {stats.map((s, i) => (
                                    <div key={i} className="space-y-2 border-l-4 border-transparent hover:border-primary/30 pl-4 transition-all">
                                        <div className={`w-10 h-10 ${s.color} bg-current/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <s.icon size={20} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.label}</p>
                                        <p className="text-xl font-black tracking-tighter">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-[4rem] border shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-10 border-b flex items-center justify-between bg-primary/5">
                             <div>
                                 <h3 className="text-2xl font-black tracking-tight">Timeline Log</h3>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Audit trail of all presence sessions</p>
                             </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary/10 text-left">
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Timeline Node</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Compliance</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Start Trace</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">End Trace</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Unit Hours</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Network Node</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/30">
                                    {(history || []).map((log: any) => (
                                        <tr key={log._id} className="hover:bg-secondary/10 transition-colors group">
                                            <td className="px-10 py-7 font-black text-sm">{moment(log.date).format('DD MMM, YYYY')}</td>
                                            <td className="px-10 py-7">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                    log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    log.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-xs font-black opacity-80">{log.punchIn ? moment(log.punchIn).format('hh:mm:ss A') : 'MISSING'}</td>
                                            <td className="px-10 py-7 text-xs font-black opacity-80">{log.punchOut ? moment(log.punchOut).format('hh:mm:ss A') : '--:--'}</td>
                                            <td className="px-10 py-7 font-black text-primary text-xl tracking-tighter">{log.workHours ? log.workHours.toFixed(2) + 'h' : '0.0h'}</td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center space-x-2 text-[10px] font-bold uppercase text-muted-foreground bg-secondary/50 px-4 py-2 rounded-2xl w-fit border">
                                                    <MapPin size={12} className="text-primary" />
                                                    <span>{log.location?.address || 'Verified Node'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {governanceStats.map((s, i) => (
                            <div key={i} className="bg-card p-10 rounded-[3rem] border shadow-sm group hover:border-primary/50 transition-all">
                                <div className={`w-14 h-14 ${s.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6`}>
                                    <s.icon className={s.color.replace('bg-', 'text-')} size={28} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                                <h3 className="text-3xl font-black tracking-tighter mb-1">{s.value}</h3>
                                <p className="text-[10px] font-bold text-primary uppercase">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card p-12 rounded-[4rem] border shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                        <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 -z-0">
                             <ShieldCheck size={200} />
                        </div>
                        <div className="relative z-10 space-y-4 max-w-2xl">
                            <h3 className="text-2xl font-black tracking-tight">Manual Attendance Protocol</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                As an HR Administrator, you can manually override or initialize attendance nodes for any workforce member. 
                                This action will be logged in the system audit rail.
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setManualForm({
                                    userId: '',
                                    date: moment().format('YYYY-MM-DD'),
                                    status: 'Present',
                                    punchIn: '09:00',
                                    punchOut: '17:00'
                                });
                                setIsManualModalOpen(true);
                            }}
                            className="relative z-10 mt-8 md:mt-0 px-12 py-5 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-3"
                        >
                            <Plus size={18} />
                            <span>Log Manual Node</span>
                        </button>
                    </div>

                    <div className="bg-card rounded-[4rem] border shadow-sm overflow-hidden">
                        <div className="p-10 border-b flex items-center justify-between bg-primary/5">
                            <h3 className="text-2xl font-black tracking-tight">Global Workforce Status</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary/10 text-left">
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Employee</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Department</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Today's Presence</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-center">Record Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/30">
                                    {(employees || []).map((emp: any) => {
                                        const status = getEmployeeTodayStatus(emp.userId?._id);
                                        return (
                                            <tr key={emp._id} className="hover:bg-secondary/10 transition-colors">
                                                <td className="px-10 py-7 flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                                                        <img src={emp.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.userId?.firstName}`} alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm">{emp.userId?.firstName} {emp.userId?.lastName}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{emp.userId?.employeeId}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 font-bold text-sm">{emp.department?.name || 'Unassigned'}</td>
                                                <td className="px-10 py-7">
                                                     <div className="flex items-center space-x-3">
                                                         <div className={`w-2.5 h-2.5 rounded-full ${status.color} animate-pulse`} />
                                                         <span className={`text-xs font-black uppercase tracking-widest ${status.color.replace('bg-', 'text-')}`}>{status.label}</span>
                                                     </div>
                                                </td>
                                                <td className="px-10 py-7 text-center">
                                                    <button 
                                                        onClick={() => {
                                                            setManualForm({...manualForm, userId: emp.userId?._id});
                                                            setIsManualModalOpen(true);
                                                        }}
                                                        className="p-3 bg-secondary rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    >
                                                        <FileEdit size={16} />
                                                    </button>
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

            {/* Manual Attendance Modal */}
            <AnimatePresence>
                {isManualModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card w-full max-w-lg rounded-[3.5rem] p-10 border shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center space-x-4">
                                     <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                         <Plus size={24} />
                                     </div>
                                     <div>
                                         <h3 className="text-2xl font-black tracking-tight">Manual Attendance</h3>
                                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Manual Override Protocol</p>
                                     </div>
                                </div>
                                <button onClick={() => setIsManualModalOpen(false)} className="p-4 hover:bg-secondary rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleManualSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Select Workforce Member</label>
                                    <div className="relative">
                                        <select 
                                            required
                                            value={manualForm.userId}
                                            onChange={(e) => setManualForm({...manualForm, userId: e.target.value})}
                                            className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none appearance-none"
                                        >
                                            <option value="">Choose Employee...</option>
                                            {(employees || []).map((emp: any) => (
                                                <option key={emp._id} value={emp.userId?._id}>
                                                    {emp.userId?.firstName} {emp.userId?.lastName} ({emp.userId?.employeeId})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Register Date</label>
                                        <input 
                                            type="date"
                                            value={manualForm.date}
                                            onChange={(e) => setManualForm({...manualForm, date: e.target.value})}
                                            className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Daily Status</label>
                                        <select 
                                            value={manualForm.status}
                                            onChange={(e) => setManualForm({...manualForm, status: e.target.value})}
                                            className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none transition-all outline-none"
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Late">Late</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="Absent">Absent</option>
                                        </select>
                                    </div>
                                </div>

                                {manualForm.status !== 'Absent' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Punch In</label>
                                            <input 
                                                type="time"
                                                value={manualForm.punchIn}
                                                onChange={(e) => setManualForm({...manualForm, punchIn: e.target.value})}
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Punch Out</label>
                                            <input 
                                                type="time"
                                                value={manualForm.punchOut}
                                                onChange={(e) => setManualForm({...manualForm, punchOut: e.target.value})}
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsManualModalOpen(false)}
                                        className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary/70 transition-all"
                                    >
                                        Retract
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={markManualMutation.isPending}
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2"
                                    >
                                        {markManualMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        <span>Confirm Entry</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ChevronDown = ({ className, size }: { className?: string, size?: number }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default Attendance;
