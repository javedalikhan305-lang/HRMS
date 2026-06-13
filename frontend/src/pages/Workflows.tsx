import { useState } from 'react';
import { 
    GitBranch, Plus, Settings2, Trash2, 
    ArrowRight, CheckCircle2,
    Clock, User, ShieldCheck,
    Loader2, X, AlertCircle, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowService } from '../services/workflowService';
import toast from 'react-hot-toast';

const Workflows = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        trigger: 'LEAVE',
        steps: [
            { level: 1, role: 'MANAGER', title: 'Manager Review' }
        ]
    });

    const { data: workflows, isLoading } = useQuery({
        queryKey: ['workflows'],
        queryFn: workflowService.getAll
    });

    const createMutation = useMutation({
        mutationFn: workflowService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            setIsModalOpen(false);
            setFormData({ name: '', trigger: 'LEAVE', steps: [{ level: 1, role: 'MANAGER', title: 'Manager Review' }] });
            toast.success('Workflow activated');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create workflow');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: workflowService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            toast.success('Workflow removed');
        }
    });

    const addStep = () => {
        const nextLevel = formData.steps.length + 1;
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { level: nextLevel, role: 'HR_ADMIN', title: `Level ${nextLevel} Approval` }]
        }));
    };

    const removeStep = (level: number) => {
        if (formData.steps.length > 1) {
            setFormData(prev => ({
                ...prev,
                steps: prev.steps.filter(s => s.level !== level).map((s, i) => ({ ...s, level: i + 1 }))
            }));
        }
    };

    const updateStep = (index: number, field: string, value: string) => {
        const newSteps = [...formData.steps];
        (newSteps[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const triggers = [
        { value: 'LEAVE', label: 'Leave Applications' },
        { value: 'EXPENSE', label: 'Expense Claims' },
        { value: 'ATTENDANCE_CORRECTION', label: 'Time Regularization' },
        { value: 'ONBOARDING', label: 'New Hire Onboarding' }
    ];

    const roles = [
        { value: 'MANAGER', label: 'Direct Manager' },
        { value: 'HR_ADMIN', label: 'HR Administrator' },
        { value: 'SUPER_ADMIN', label: 'Super Admin' }
    ];

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Workflow Engine</h1>
                    <p className="text-muted-foreground font-medium">Design automated approval sequences and multi-level decision logic.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                >
                    <Plus size={18} />
                    <span>Initialize Workflow</span>
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-card border rounded-[3rem]">
                            <Loader2 className="animate-spin text-primary mb-4" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Flows...</p>
                        </div>
                    ) : workflows?.length > 0 ? (
                        workflows.map((wf: any) => (
                            <div key={wf._id} className="bg-card border rounded-[3rem] p-8 lg:p-10 shadow-sm group hover:border-primary/30 transition-all">
                                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center">
                                            <GitBranch size={32} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight">{wf.name}</h3>
                                            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-1">{wf.trigger}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Live on System
                                        </div>
                                        <button 
                                            onClick={() => deleteMutation.mutate(wf._id)}
                                            className="p-3 bg-secondary/50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 relative">
                                    {wf.steps.map((step: any, idx: number) => (
                                        <div key={idx} className="flex items-center space-x-4">
                                            <div className="flex flex-col">
                                                <div className="w-14 h-14 rounded-2xl bg-secondary border border-secondary flex flex-col items-center justify-center relative group/node">
                                                    <User size={20} className="text-muted-foreground/60" />
                                                    <span className="text-[8px] font-black absolute bottom-1 uppercase opacity-40">{step.role.split('_')[0]}</span>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-lg shadow-primary/20">{step.level}</div>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter mt-2 text-center opacity-70">{step.title}</span>
                                            </div>
                                            {idx < wf.steps.length - 1 && <ArrowRight size={18} className="text-muted-foreground/20" />}
                                        </div>
                                    ))}
                                    <div className="ml-4 flex items-center space-x-2 px-5 py-2.5 bg-primary/5 rounded-full border border-dashed border-primary/30">
                                        <CheckCircle2 size={14} className="text-primary" />
                                        <span className="text-[9px] font-black uppercase text-primary tracking-widest">End Action</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-secondary/20 border-4 border-dashed border-secondary/50 rounded-[4rem] p-24 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer group"
                        >
                            <div className="w-20 h-20 bg-background rounded-[2rem] shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Plus size={40} className="text-primary" />
                            </div>
                            <h4 className="text-xl font-black">Design First Workflow</h4>
                            <p className="text-sm font-medium text-muted-foreground max-w-sm mt-3">Start dragging custom conditions and approval nodes to automate your business logic.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="bg-black rounded-[3.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                         <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                              <ShieldCheck size={200} />
                         </div>
                         <h4 className="text-xl font-black mb-4 relative z-10">Global Governance</h4>
                         <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-12 relative z-10 leading-loose">Automated escalation rules and SLA policies active for the production environment.</p>
                         <div className="space-y-4 relative z-10">
                             <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Auto-Escalation</p>
                                 <p className="text-xs font-medium opacity-60">48-hour idle threshold globally enabled.</p>
                             </div>
                             <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Backup Routing</p>
                                 <p className="text-xs font-medium opacity-60">Manager delegation enabled for O.O.O mode.</p>
                             </div>
                         </div>
                    </div>

                    <div className="bg-card border rounded-[3rem] p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Active Triggers</h4>
                             <AlertCircle size={16} className="text-muted-foreground/30" />
                        </div>
                        <div className="space-y-4">
                             {triggers.map((t, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-default">
                                     <span className="text-[11px] font-black">{t.label}</span>
                                     <div className={`h-2 w-2 rounded-full ${workflows?.some((w:any) => w.trigger === t.value) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card w-full max-w-2xl rounded-[3.5rem] shadow-3xl border z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b flex items-center justify-between bg-secondary/10">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Construct Logic</h2>
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Automation Protocol</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-card rounded-full hover:bg-secondary transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Workflow Name</label>
                                        <input 
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-secondary/40 border-none rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 ring-primary/40 outline-none" 
                                            placeholder="Standard Approval"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Trigger Event</label>
                                        <select 
                                            value={formData.trigger}
                                            onChange={e => setFormData({ ...formData, trigger: e.target.value as any })}
                                            className="w-full bg-secondary/40 border-none rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 ring-primary/40 outline-none appearance-none"
                                        >
                                            {triggers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Approval Hierarchy</label>
                                        <button 
                                            type="button" 
                                            onClick={addStep}
                                            className="text-[9px] font-black text-primary uppercase hover:underline"
                                        >
                                            + Add Stage
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {formData.steps.map((step, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-secondary/20 p-4 rounded-3xl border border-secondary group">
                                                <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center text-xs font-black shrink-0">{step.level}</div>
                                                <input 
                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none"
                                                    value={step.title}
                                                    onChange={e => updateStep(idx, 'title', e.target.value)}
                                                    placeholder="Step Title"
                                                />
                                                <select 
                                                    className="bg-card px-3 py-2 rounded-xl text-[10px] font-black uppercase border-none focus:ring-2 ring-primary/20 outline-none"
                                                    value={step.role}
                                                    onChange={e => updateStep(idx, 'role', e.target.value)}
                                                >
                                                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                                {formData.steps.length > 1 && (
                                                    <button type="button" onClick={() => removeStep(step.level)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        disabled={createMutation.isPending}
                                        type="submit" 
                                        className="flex-[2] py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                                        <span>Activate Flow</span>
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

export default Workflows;

