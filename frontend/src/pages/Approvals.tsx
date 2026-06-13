import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Calendar, User, Search,
    Check, X, MessageSquare, ShieldCheck,
    AlertCircle, Loader2, CheckCircle2, XCircle, Inbox
} from 'lucide-react';
import moment from 'moment';
import { leaveService } from '../services/leaveService';

// ─── Remarks Modal ────────────────────────────────────────────────────────────
const RemarksModal = ({
    isOpen, onClose, onConfirm, action
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (remarks: string) => void;
    action: 'Approved' | 'Rejected';
}) => {
    const [remarks, setRemarks] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(remarks);
        setRemarks('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card w-full max-w-md rounded-[3rem] shadow-2xl border relative z-10 p-8"
            >
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                    action === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                    {action === 'Approved' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-center mb-2">
                    {action === 'Approved' ? 'Approve Request' : 'Reject Request'}
                </h2>
                <p className="text-sm text-muted-foreground text-center font-medium mb-8">
                    {action === 'Rejected' ? 'A reason is required for rejection.' : 'Add optional remarks for the employee.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        rows={3}
                        required={action === 'Rejected'}
                        placeholder={action === 'Rejected' ? 'Enter reason for rejection...' : 'Optional: note for employee...'}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-secondary/50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 ring-primary/50 resize-none"
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl ${
                                action === 'Approved'
                                    ? 'bg-emerald-500 shadow-emerald-500/20'
                                    : 'bg-rose-500 shadow-rose-500/20'
                            }`}
                        >
                            Confirm {action}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Approvals = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [modal, setModal] = useState<{ open: boolean; id: string; action: 'Approved' | 'Rejected' }>({
        open: false, id: '', action: 'Approved'
    });

    const leaveTypes = ['All', 'Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Comp Off', 'LOP'];

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const data = await leaveService.getLeaveApprovals();
            setLeaves(data || []);
        } catch (err) {
            console.error('Failed to fetch leave approvals', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
        setModal({ open: true, id, action });
    };

    const confirmAction = async (remarks: string) => {
        setProcessing(modal.id);
        try {
            await leaveService.updateLeaveStatus(modal.id, modal.action, remarks || undefined);
            await fetchLeaves();
        } catch (err) {
            console.error('Action failed', err);
        } finally {
            setProcessing(null);
        }
    };

    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
    const historyLeaves = leaves.filter(l => l.status !== 'Pending');

    const filterLeaves = (list: any[]) =>
        list.filter(l => {
            const userName = l.userId
                ? `${l.userId.firstName} ${l.userId.lastName}`.toLowerCase()
                : '';
            const matchSearch = userName.includes(searchQuery.toLowerCase()) ||
                l.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = filterCategory === 'All' || l.leaveType === filterCategory;
            return matchSearch && matchCat;
        });

    const displayList = filterLeaves(activeTab === 'pending' ? pendingLeaves : historyLeaves);

    const getPriorityColor = (days: number) => {
        if (days >= 5) return 'bg-red-500';
        if (days >= 3) return 'bg-amber-500';
        return 'bg-blue-500';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'Rejected': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
            case 'Cancelled': return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
            default: return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">Manager Action</span>
                        <span className="text-muted-foreground font-medium text-xs">• Verification Required</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Approvals Hub</h1>
                    <p className="text-muted-foreground font-medium">Review and process leave requests from your team.</p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-secondary/50 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                            activeTab === 'pending' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Pending
                        {pendingLeaves.length > 0 && (
                            <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                {pendingLeaves.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                            activeTab === 'history' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        History
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {leaveTypes.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                filterCategory === cat
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-card text-muted-foreground border-secondary hover:bg-secondary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full xl:w-72 shrink-0">
                    <Search className="absolute left-4 top-3.5 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or leave type..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-card border border-secondary rounded-2xl py-3.5 pl-11 pr-5 text-sm font-medium focus:ring-2 ring-primary/50 outline-none"
                    />
                </div>
            </div>

            {/* Main Area */}
            <main className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Approvals...</p>
                        </div>
                    ) : displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] space-y-4 bg-secondary/10 rounded-[3rem] border border-dashed">
                            <Inbox className="text-muted-foreground/40" size={64} />
                            <p className="text-xl font-black tracking-tight text-muted-foreground/60">
                                {activeTab === 'pending' ? 'No Pending Requests' : 'No History Found'}
                            </p>
                            <p className="text-sm font-medium text-muted-foreground">
                                {activeTab === 'pending' ? 'Your team has no pending leave requests.' : 'No historical records match your filter.'}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {displayList.map((req, i) => (
                                <motion.div
                                    key={req._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -40, scale: 0.95 }}
                                    transition={{ delay: i * 0.06 }}
                                    layout
                                    className="bg-card border rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all"
                                >
                                    {/* Priority stripe */}
                                    <div className={`absolute top-0 left-0 w-[5px] h-full ${getPriorityColor(req.totalDays)}`} />

                                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                                        {/* Left: Employee Info */}
                                        <div className="lg:w-56 lg:border-r lg:pr-10 flex flex-col gap-6 shrink-0">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-secondary overflow-hidden border-2 border-background shadow-md shrink-0">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.userId?.firstName}`}
                                                        alt="Avatar"
                                                        className="w-full h-full rounded-[1.25rem]"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-base leading-tight">
                                                        {req.userId ? `${req.userId.firstName} ${req.userId.lastName}` : 'Employee'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Leave Request</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black uppercase tracking-widest text-[9px] text-muted-foreground">Duration</span>
                                                    <span className={`font-black px-2 py-0.5 rounded-full text-[9px] ${
                                                        req.totalDays >= 5 ? 'bg-red-500/10 text-red-500' :
                                                        req.totalDays >= 3 ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>{req.totalDays} Day{req.totalDays !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black uppercase tracking-widest text-[9px] text-muted-foreground">Applied</span>
                                                    <span className="font-bold text-[10px]">{moment(req.createdAt).fromNow()}</span>
                                                </div>
                                                {activeTab === 'history' && (
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="font-black uppercase tracking-widest text-[9px] text-muted-foreground">Status</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusBadge(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Request Details */}
                                        <div className="flex-1 space-y-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg leading-tight">{req.leaveType}</h4>
                                                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Leave Category</p>
                                                </div>
                                            </div>

                                            <div className="bg-secondary/30 rounded-[2rem] p-5 border border-secondary space-y-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                                        <Calendar size={10} /> Duration
                                                    </p>
                                                    <p className="text-sm font-black">
                                                        {moment(req.startDate).format('DD MMM YYYY')} → {moment(req.endDate).format('DD MMM YYYY')}
                                                    </p>
                                                </div>
                                                <div className="pt-3 border-t border-secondary">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                                        <MessageSquare size={10} /> Reason
                                                    </p>
                                                    <p className="text-sm font-medium italic opacity-80">"{req.reason}"</p>
                                                </div>
                                                {req.remarks && (
                                                    <div className="pt-3 border-t border-secondary">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Manager Remarks</p>
                                                        <p className="text-sm font-medium text-primary">"{req.remarks}"</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions — only for pending */}
                                            {activeTab === 'pending' && req.status === 'Pending' && (
                                                <div className="flex flex-wrap gap-3 pt-2">
                                                    <button
                                                        disabled={processing === req._id}
                                                        onClick={() => handleAction(req._id, 'Approved')}
                                                        className="flex-1 min-w-[130px] px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {processing === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                        Approve
                                                    </button>
                                                    <button
                                                        disabled={processing === req._id}
                                                        onClick={() => handleAction(req._id, 'Rejected')}
                                                        className="flex-1 min-w-[130px] px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {processing === req._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-primary rounded-[3rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                        <div className="absolute -bottom-8 -right-8 opacity-10"><ShieldCheck size={160} /></div>
                        <div className="relative z-10">
                            <h3 className="text-base font-black tracking-tight mb-6">Queue Overview</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Pending', count: pendingLeaves.length, color: 'bg-amber-400' },
                                    { label: 'Approved', count: leaves.filter(l => l.status === 'Approved').length, color: 'bg-emerald-400' },
                                    { label: 'Rejected', count: leaves.filter(l => l.status === 'Rejected').length, color: 'bg-rose-400' },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                            <span className="text-xs font-bold opacity-80">{s.label}</span>
                                        </div>
                                        <span className="text-lg font-black">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Policy Card */}
                    <div className="bg-card border rounded-[3rem] p-8 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
                            <AlertCircle size={14} className="text-primary" />
                            Approval Policy
                        </h4>
                        <div className="space-y-4">
                            {[
                                'Process within 48 hours to prevent auto-escalation.',
                                'Rejection requires a mandatory reason comment.',
                                'Check team calendar before approving long leaves.',
                                'Approved leaves auto-deduct from employee balance.'
                            ].map((rule, i) => (
                                <div key={i} className="flex items-start gap-3 text-[11px] font-medium text-muted-foreground leading-relaxed">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                                    <p>{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* On Leave Today */}
                    <div className="bg-card border rounded-[3rem] p-8 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
                            <Clock size={14} className="text-primary" />
                            On Leave Today
                        </h4>
                        {leaves.filter(l => l.status === 'Approved' && moment().isBetween(moment(l.startDate), moment(l.endDate), 'day', '[]')).length === 0 ? (
                            <p className="text-xs font-medium text-muted-foreground text-center py-4">Everyone is in office today.</p>
                        ) : (
                            <div className="space-y-3">
                                {leaves
                                    .filter(l => l.status === 'Approved' && moment().isBetween(moment(l.startDate), moment(l.endDate), 'day', '[]'))
                                    .map((l, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-secondary overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${l.userId?.firstName}`} alt="" className="w-full h-full" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black">{l.userId?.firstName}</p>
                                                    <p className="text-[9px] font-medium text-muted-foreground">{l.leaveType}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-rose-500 uppercase">Out</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Remarks Modal */}
            <RemarksModal
                isOpen={modal.open}
                onClose={() => setModal(prev => ({ ...prev, open: false }))}
                onConfirm={confirmAction}
                action={modal.action}
            />
        </div>
    );
};

export default Approvals;
