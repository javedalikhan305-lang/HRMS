import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plane, History as HistoryIcon, 
    AlertCircle, X, Download, 
    ChevronLeft, ChevronRight, Filter,
    CheckCircle2, Clock, Calendar, Search, 
    Users, MoreVertical, ShieldCheck, Zap,
    Loader2, Check, Send
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import moment from 'moment';

const Leave = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'individual' | 'governance'>('individual');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);

    const isHR = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN';
    const isManager = user?.role === 'MANAGER';

    // Form State
    const [formData, setFormData] = useState({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaves'],
        queryFn: async () => {
            const res = await api.get('/leaves');
            return res.data.data;
        }
    });

    const applyLeaveMutation = useMutation({
        mutationFn: async (data: any) => {
            const start = moment(data.startDate);
            const end = moment(data.endDate);
            const totalDays = end.diff(start, 'days') + 1;
            return await api.post('/leaves', { ...data, totalDays });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            setShowApplyModal(false);
            setFormData({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
        },
        onError: (err: any) => {
            setApplyError(err.response?.data?.message || "Failed to apply leave");
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, remarks }: { id: string, status: string, remarks?: string }) => {
            return await api.patch(`/leaves/${id}/status`, { status, remarks });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] })
    });

    // Local Logic for Balances (Can be expanded with balance API later)
    const leaveBalances = [
        { type: 'Earned Leave', total: 15, used: (leaves || []).filter((l:any) => l.status === 'Approved' && l.leaveType === 'Earned Leave').length || 0, available: 15, color: 'bg-primary', light: 'bg-primary/10' },
        { type: 'Sick Leave', total: 10, used: (leaves || []).filter((l:any) => l.status === 'Approved' && l.leaveType === 'Sick Leave').length || 0, available: 10, color: 'bg-emerald-500', light: 'bg-emerald-500/10' },
        { type: 'Casual Leave', total: 5, used: (leaves || []).filter((l:any) => l.status === 'Approved' && l.leaveType === 'Casual Leave').length || 0, available: 5, color: 'bg-amber-500', light: 'bg-amber-500/10' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApplyError(null);
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            setApplyError("Please fill all required fields");
            return;
        }
        applyLeaveMutation.mutate(formData);
    };

    const govLeaves = leaves?.filter((l: any) => l.status === 'Pending') || [];

    return (
        <div className="space-y-8 pb-10 px-4 sm:px-8">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Time-Off Center</h1>
                    <p className="text-muted-foreground font-medium">Policy-driven leave orchestration and global availability monitoring.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {(isHR || isManager) && (
                        <div className="bg-secondary/50 p-1 rounded-2xl flex">
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
                                Management Hub
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => setShowApplyModal(true)}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2"
                    >
                        <Plane size={16} />
                        <span>Request Time Off</span>
                    </button>
                </div>
            </header>

            {viewMode === 'individual' ? (
                <>
                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {leaveBalances.map((b, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={b.type} 
                                className="bg-card p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${b.light} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{b.type}</h3>
                                <div className="flex items-end justify-between relative z-10">
                                    <div>
                                        <p className="text-4xl font-black tracking-tighter leading-none">{b.available - b.used}</p>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Days Remaining</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">{b.used} / {b.total}</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Accrued</p>
                                    </div>
                                </div>
                                <div className="mt-8 w-full h-1.5 bg-secondary rounded-full overflow-hidden relative z-10">
                                    <div className={`h-full ${b.color} transition-all duration-1000`} style={{ width: `${(b.used / b.total) * 100}%` }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Personal History */}
                    <div className="bg-card rounded-[3.5rem] border shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-10 border-b flex items-center justify-between">
                            <h3 className="text-2xl font-black tracking-tight flex items-center">
                                <HistoryIcon className="mr-3 text-primary" size={24} />
                                Timeline Feed
                            </h3>
                            <button className="p-3 bg-secondary rounded-xl hover:text-primary transition-colors"><Filter size={18} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary/30 text-left">
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Nature of absence</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Quantum</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Duration</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Approval Status</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trace ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/30">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin inline text-primary" /></td>
                                        </tr>
                                    ) : (leaves || []).map((l: any) => (
                                        <tr key={l._id} className="hover:bg-secondary/5 transition-colors group">
                                            <td className="px-10 py-7 font-black text-sm">{l.leaveType}</td>
                                            <td className="px-10 py-7 font-black text-primary text-xl tracking-tighter">{l.totalDays || 0} Days</td>
                                            <td className="px-10 py-7 text-xs font-bold text-muted-foreground">
                                                <span>{moment(l.startDate).format('MMM DD')}</span>
                                                <span className="mx-3 text-primary">→</span>
                                                <span>{moment(l.endDate).format('MMM DD, YYYY')}</span>
                                            </td>
                                            <td className="px-10 py-7">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    l.status === 'Approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                    l.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-destructive/10 text-destructive border border-destructive/20'
                                                }`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-[10px] font-mono opacity-50 uppercase">{l._id?.slice(-8)}</td>
                                        </tr>
                                    ))}
                                    {leaves?.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-muted-foreground italic">No leave history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-8">
                    {/* Management Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Out Today', value: leaves?.filter((l: any) => l.status === 'Approved' && moment().isBetween(l.startDate, l.endDate, 'day', '[]')).length || 0, sub: 'Critical Availability', icon: Plane, color: 'bg-rose-500' },
                            { label: 'Pending Review', value: leaves?.filter((l: any) => l.status === 'Pending').length || 0, sub: 'SLA Alert', icon: Clock, color: 'bg-amber-500' },
                            { label: 'Total Requests', value: leaves?.length || 0, sub: 'Current Cycle', icon: Calendar, color: 'bg-indigo-500' },
                            { label: 'Approved Rate', value: leaves?.length > 0 ? ((leaves.filter((l:any)=>l.status==='Approved').length / leaves.length) * 100).toFixed(0) + '%' : '0%', sub: 'vs Last Year', icon: Zap, color: 'bg-emerald-500' },
                        ].map((s, i) => (
                            <div key={i} className="bg-card p-10 rounded-[3rem] border shadow-sm flex flex-col group hover:border-primary/50 transition-all">
                                <div className={`w-14 h-14 ${s.color} bg-opacity-10 rounded-[1.5rem] flex items-center justify-center mb-6`}>
                                    <s.icon className={s.color.replace('bg-', 'text-')} size={28} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                                <h3 className="text-3xl font-black tracking-tighter mb-1">{s.value}</h3>
                                <p className="text-[10px] font-bold text-primary uppercase">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-card border rounded-[3.5rem] p-10 shadow-sm min-h-[600px]">
                             <header className="flex items-center justify-between mb-10 pb-6 border-b">
                                 <div>
                                    <h3 className="text-2xl font-black tracking-tight">Governance Queue</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Pending absence requests requiring action</p>
                                 </div>
                                 <div className="flex space-x-2">
                                     <button className="p-3 bg-secondary rounded-xl hover:text-primary transition-all"><Search size={18} /></button>
                                </div>
                             </header>
                             
                             <div className="space-y-6">
                                    <AnimatePresence>
                                        {govLeaves.map((req: any) => (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={req._id} 
                                                className="bg-secondary/10 p-8 rounded-[3rem] border border-transparent hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden"
                                            >
                                                <div className="flex items-center space-x-6 relative z-10">
                                                    <div className="w-16 h-16 rounded-2xl bg-background p-0.5 border shadow-inner flex items-center justify-center shrink-0">
                                                        {req.userId?.avatar ? (
                                                            <img src={req.userId.avatar} alt="User" className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded-xl">
                                                                <Users size={24} className="text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg tracking-tight leading-none mb-1">
                                                            {req.userId?.firstName} {req.userId?.lastName}
                                                        </h4>
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                                                {req.leaveType}
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-lg">
                                                                {req.totalDays} Days
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-[11px] font-bold text-muted-foreground/80 bg-background/50 px-3 py-1.5 rounded-xl w-fit border border-dashed">
                                                            <Calendar size={12} className="mr-2 text-primary" />
                                                            {moment(req.startDate).format('MMM DD')} — {moment(req.endDate).format('MMM DD, YYYY')}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <button 
                                                        onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'Approved' })}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="h-14 px-8 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2 group/btn disabled:opacity-50"
                                                    >
                                                        {updateStatusMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} className="group-hover/btn:rotate-12" />}
                                                        Authorize
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'Rejected' })}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="h-14 px-8 bg-background border border-secondary text-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-transparent transition-all flex items-center gap-2 group/btn disabled:opacity-50"
                                                    >
                                                        {updateStatusMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <X size={16} className="group-hover/btn:rotate-12" />}
                                                        Decline
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    
                                    {govLeaves.length === 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }}
                                            className="py-32 text-center space-y-6"
                                        >
                                            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/5">
                                                <ShieldCheck size={40} />
                                            </div>
                                            <div className="max-w-xs mx-auto">
                                                <p className="text-lg font-black tracking-tight mb-1">Queue Synchronized</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">No pending leave units require authorization at this cycle.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                 {/* Rules Card */}
                                 <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                                    <div className="absolute top-0 right-0 p-10 opacity-20 rotate-12 transition-transform group-hover:scale-110">
                                        <ShieldCheck size={200} />
                                    </div>
                                    <h4 className="text-xl font-black mb-4 relative z-10 flex items-center">
                                        <ShieldCheck size={20} className="mr-2 text-primary" />
                                        Security Policy
                                    </h4>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10 relative z-10 leading-loose">
                                        Autonomous workflow active. Status updates are immutable once authorized.
                                    </p>
                                    <div className="space-y-3 relative z-10 text-[10px] font-black uppercase">
                                         <button className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all font-mono px-6">
                                             <span>Accrual Rules</span>
                                             <Zap size={14} className="text-amber-500" />
                                         </button>
                                    </div>
                                </div>

                                <div className="bg-card border rounded-[3rem] p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-lg font-black tracking-tight">Public Log</h4>
                                        <Calendar className="text-primary" size={20} />
                                    </div>
                                    <div className="space-y-3">
                                         {[
                                             { name: 'National Holiday', date: 'Jun 19', color: 'bg-indigo-500' },
                                             { name: 'Festival Break', date: 'Jul 4', color: 'bg-amber-500' },
                                         ].map(h => (
                                             <div key={h.name} className="flex items-center justify-between p-5 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-all">
                                                 <div className="flex items-center space-x-3">
                                                     <div className={`w-2 h-2 rounded-full ${h.color}`} />
                                                     <span className="text-xs font-black">{h.name}</span>
                                                 </div>
                                                 <span className="text-[10px] font-black text-muted-foreground uppercase">{h.date}</span>
                                             </div>
                                         ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <AnimatePresence>
                {showApplyModal && (
                    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto py-10">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 40 }} 
                            className="bg-card w-full max-w-xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border shadow-2xl relative z-10 overflow-hidden my-auto"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 -mr-10 -mt-10 pointer-events-none">
                                <Plane size={240} />
                            </div>
                            
                            <header className="mb-10 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                                        <Plane size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Submit Application</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Leave Registry v1.0</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowApplyModal(false)} className="p-3 hover:bg-secondary rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </header>

                            {applyError && (
                                <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-[10px] font-black text-destructive uppercase tracking-widest flex items-center">
                                    <AlertCircle size={14} className="mr-3" />
                                    {applyError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                                <div className="space-y-4">
                                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Absence Class</label>
                                     <div className="grid grid-cols-2 gap-4">
                                         {['Earned Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave'].map(t => (
                                             <button 
                                                 key={t} 
                                                 type="button" 
                                                 onClick={() => setFormData({...formData, leaveType: t})}
                                                 className={`py-5 rounded-2xl text-xs font-black uppercase tracking-tight border-2 transition-all relative group overflow-hidden ${
                                                     formData.leaveType === t ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-secondary/40 border-transparent hover:border-primary/40'
                                                 }`}
                                             >
                                                 <span className="relative z-10">{t}</span>
                                                 {formData.leaveType === t && (
                                                     <motion.div layoutId="activeTag" className="absolute inset-0 bg-primary" />
                                                 )}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Timeline Start</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                            <input 
                                                required
                                                type="date" 
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                                className="w-full bg-secondary/40 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold border-none focus:ring-2 ring-primary/40 appearance-none" 
                                            />
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Timeline End</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                            <input 
                                                required
                                                type="date" 
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                                className="w-full bg-secondary/40 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold border-none focus:ring-2 ring-primary/40 appearance-none" 
                                            />
                                        </div>
                                     </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Absence Context</label>
                                    <div className="relative group">
                                        <AlertCircle className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                        <textarea 
                                            required
                                            placeholder="Specify the reason for infrastructure downtime..."
                                            value={formData.reason}
                                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                            className="w-full bg-secondary/40 rounded-3xl py-4 pl-12 pr-5 h-32 text-sm font-bold border-none focus:ring-2 ring-primary/40 resize-none placeholder:font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="flex-1 py-5 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/70 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={applyLeaveMutation.isPending}
                                        className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                                    >
                                        {applyLeaveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        <span>Transmit Application</span>
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

export default Leave;
