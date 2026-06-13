import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Mail, CheckCircle2, 
    FileText, ShieldCheck, ChevronRight, 
    Search, Filter, 
    Send, Trash2, Edit3, Download,
    Calendar, Loader2, X, Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '../services/onboardingService';
import { orgService } from '../services/orgService';
import moment from 'moment';

const Onboarding = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'candidates' | 'checklists' | 'probation'>('candidates');
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    
    // Form State for Invite
    const [formData, setFormData] = useState({
        candidateName: '',
        candidateEmail: '',
        designation: '',
        department: '',
        joinDate: ''
    });

    // Sub-data for dropdowns
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    useEffect(() => {
        if (isInviteModalOpen) {
            fetchOrgData();
        }
    }, [isInviteModalOpen]);

    const fetchOrgData = async () => {
        try {
            const [depts, desigs] = await Promise.all([
                orgService.getDepartments(),
                orgService.getDesignations()
            ]);
            setDepartments(depts || []);
            setDesignations(desigs || []);
        } catch (err) {
            console.error('Failed to fetch org data', err);
        }
    };

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['onboarding-list'],
        queryFn: onboardingService.getOnboardingList
    });

    const inviteMutation = useMutation({
        mutationFn: onboardingService.inviteCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-list'] });
            setIsInviteModalOpen(false);
            setFormData({ candidateName: '', candidateEmail: '', designation: '', department: '', joinDate: '' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: onboardingService.deleteOnboarding,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding-list'] })
    });

    const filteredCandidates = (candidates || []).filter((c: any) => 
        c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Onboarding Hub</h1>
                    <p className="text-muted-foreground font-medium">Manage employee lifecycles from invitation to full integration.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                    >
                        <UserPlus size={18} />
                        <span>Invite Candidate</span>
                    </button>
                </div>
            </header>

            {/* Segmented Control */}
            <div className="flex bg-secondary/50 p-1.5 rounded-[2rem] w-fit">
                {[
                    { id: 'candidates', label: 'Candidates', icon: UserPlus },
                    { id: 'checklists', label: 'Checklists', icon: FileText },
                    { id: 'probation', label: 'Probation', icon: ShieldCheck },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-8 py-3.5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-background shadow-xl text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-card border rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-3 text-muted-foreground" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name, role or email..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/30 border-none rounded-xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 ring-primary/50"
                            />
                        </div>
                        <div className="flex items-center space-x-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-secondary/50 rounded-xl text-xs font-black uppercase hover:bg-secondary transition-all">
                                <Filter size={16} />
                                <span>Filter</span>
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-secondary/50 rounded-xl text-xs font-black uppercase hover:bg-secondary transition-all">
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Rows */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Analyzing Pipelines...</p>
                                </div>
                            ) : filteredCandidates.map((c: any) => (
                                <div 
                                    key={c._id} 
                                    className="bg-card border rounded-[3rem] p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8 group hover:border-primary/30 transition-all"
                                >
                                    <div className="w-16 h-16 rounded-[1.75rem] bg-secondary flex items-center justify-center text-primary shrink-0 relative">
                                        <UserPlus size={28} />
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-card ${
                                            c.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                                        }`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 text-center lg:text-left">
                                        <h3 className="text-xl font-black">{c.candidateName}</h3>
                                        <p className="text-sm font-bold text-primary uppercase tracking-widest">
                                            {c.designation?.title} • {c.department?.name}
                                        </p>
                                        <div className="flex items-center justify-center lg:justify-start space-x-4 mt-3 text-muted-foreground">
                                            <div className="flex items-center space-x-1.5">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase">{moment(c.joinDate).format('MMM DD, YYYY')}</span>
                                            </div>
                                            <div className="flex items-center space-x-1.5">
                                                <Mail size={14} />
                                                <span className="text-[10px] font-black uppercase text-ellipsis overflow-hidden max-w-[150px]">{c.candidateEmail}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-48 text-center lg:text-left">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Onboarding Progress</p>
                                        <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${c.progress}%` }}
                                                className={`h-full ${c.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`} 
                                            />
                                        </div>
                                        <span className="text-sm font-black tracking-tight">{c.progress}% Finished</span>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button className="p-4 bg-secondary/50 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                                            <Send size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteMutation.mutate(c._id)}
                                            className="p-4 bg-secondary/50 rounded-2xl hover:bg-destructive hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredCandidates.length === 0 && !isLoading && (
                                <div className="py-20 text-center bg-secondary/20 rounded-[3rem] border border-dashed">
                                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No candidates found in this sector</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/30 text-center relative overflow-hidden group">
                         <div className="absolute -top-10 -right-10 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                            <CheckCircle2 size={200} />
                         </div>
                         <h3 className="text-2xl font-black tracking-tighter mb-4 relative z-10">Quick Invite</h3>
                         <p className="text-white/80 text-sm font-medium mb-8 relative z-10 leading-relaxed">Send a digital portal invitation to your new hire instantly.</p>
                         <form onSubmit={(e) => {
                             e.preventDefault();
                             // Simple quick invite logic could be added here
                         }} className="relative z-10 space-y-4">
                             <input type="email" placeholder="Hire's Email..." className="w-full bg-white/20 border-2 border-white/10 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 ring-white/50 placeholder:text-white/50 text-white text-sm" />
                             <button className="w-full py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Send Magic Link</button>
                         </form>
                    </div>

                    <div className="bg-card border rounded-[3rem] p-8 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-widest mb-8">Active Checklists</h4>
                        <div className="space-y-6">
                            {[
                                { name: 'IT Provisioning', type: 'System', items: '5/8', color: 'bg-blue-500' },
                                { name: 'Finance Setup', type: 'Payroll', items: '3/4', color: 'bg-emerald-500' },
                                { name: 'Company Values', type: 'Training', items: '1/6', color: 'bg-amber-500' },
                            ].map((check, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                         <div className={`w-2 h-2 rounded-full ${check.color}`} />
                                         <div>
                                            <p className="text-sm font-black">{check.name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{check.type}</p>
                                         </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-[10px] font-black text-muted-foreground mr-2">{check.items}</span>
                                        <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 border-2 border-dashed border-secondary rounded-2xl text-[10px] font-black uppercase text-muted-foreground hover:bg-secondary/30 transition-all">
                             Manage All Lists
                        </button>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {isInviteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card w-full max-w-2xl rounded-[3rem] p-10 border shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center space-x-4">
                                    <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Invite Candidate</h3>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Digital Onboarding Lifecycle</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsInviteModalOpen(false)} className="p-3 hover:bg-secondary rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(formData); }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.candidateName}
                                            onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                                            placeholder="John Doe"
                                            className="w-full bg-secondary/40 rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                        <input 
                                            required
                                            type="email" 
                                            value={formData.candidateEmail}
                                            onChange={(e) => setFormData({...formData, candidateEmail: e.target.value})}
                                            placeholder="john@example.com"
                                            className="w-full bg-secondary/40 rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</label>
                                        <select 
                                            required
                                            value={formData.department}
                                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                                            className="w-full bg-secondary/40 rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 appearance-none"
                                        >
                                            <option value="">Select Dept</option>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Designation</label>
                                        <select 
                                            required
                                            value={formData.designation}
                                            onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                            className="w-full bg-secondary/40 rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 appearance-none"
                                        >
                                            <option value="">Select Role</option>
                                            {designations.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Planned Joining Date</label>
                                    <input 
                                        required
                                        type="date" 
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                                        className="w-full bg-secondary/40 rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40"
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setIsInviteModalOpen(false)}
                                        className="flex-1 py-5 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/70 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={inviteMutation.isPending}
                                        className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                                    >
                                        {inviteMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                        <span>Transmit Invitation</span>
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

export default Onboarding;
