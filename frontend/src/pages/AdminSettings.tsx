import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Globe, Mail, 
    ShieldCheck, Palette,
    Save, ChevronRight,
    Share2, Eye, Lock, Loader2,
    Briefcase, DollarSign, CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../services/tenantService';

const AdminSettings = () => {
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState('company');
    
    // Fetch Data
    const { data: tenant, isLoading } = useQuery({
        queryKey: ['tenant-config'],
        queryFn: tenantService.getTenantConfig
    });

    // Mutation
    const updateMutation = useMutation({
        mutationFn: tenantService.updateTenantConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-config'] });
        }
    });

    const [formState, setFormState] = useState<any>(null);

    useEffect(() => {
        if (tenant) {
            setFormState(tenant);
        }
    }, [tenant]);

    const handleSave = () => {
        updateMutation.mutate(formState);
    };

    const sections = [
        { id: 'company', label: 'Tenant Profile', icon: Building2, desc: 'Branding, company details and legal workspace info.' },
        { id: 'security', label: 'Auth & Security', icon: ShieldCheck, desc: 'MFA, SSO, JWT rotation and password policies.' },
        { id: 'notifications', label: 'Communication', icon: Mail, desc: 'SMTP configuration, email templates and triggers.' },
        { id: 'integrations', label: 'Connected Apps', icon: Share2, desc: 'Google, Microsoft, Slack and HRIS sync settings.' },
    ];

    if (isLoading || !formState) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Reading System Policies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">System Configuration</h1>
                    <p className="text-muted-foreground font-medium">Fine-tune tenant global policies and administrative parameters.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center space-x-3 disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>{updateMutation.isPending ? 'Synchronizing...' : 'Save Changes'}</span>
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Navigation Sidebar */}
                <div className="space-y-3">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full p-6 rounded-[2.5rem] border text-left transition-all group flex items-start space-x-4 ${
                                activeSection === section.id 
                                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' 
                                : 'bg-card border-secondary hover:border-primary/30'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                activeSection === section.id ? 'bg-white/20' : 'bg-secondary text-primary'
                            }`}>
                                <section.icon size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-black text-lg leading-tight">{section.label}</h3>
                                <p className={`text-[10px] font-medium leading-relaxed mt-1 line-clamp-2 ${
                                    activeSection === section.id ? 'text-white/70' : 'text-muted-foreground'
                                }`}>
                                    {section.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Settings Form Area */}
                <div className="xl:col-span-3 space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-card border rounded-[3.5rem] p-10 lg:p-16 shadow-sm"
                        >
                            {activeSection === 'company' && (
                                <div className="space-y-12">
                                    <div className="flex flex-col md:flex-row items-center gap-10 border-b pb-12">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-secondary border-4 border-dashed border-primary/20 flex flex-col items-center justify-center text-muted-foreground hover:bg-primary/5 transition-all cursor-pointer relative group">
                                             <Palette size={24} className="mb-2" />
                                             <span className="text-[9px] font-black uppercase">Change Logo</span>
                                             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 rounded-[2.5rem] flex items-center justify-center transition-opacity">
                                                 <Eye size={24} className="text-primary" />
                                             </div>
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">Tenant Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={formState.name}
                                                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                                                        className="w-full bg-secondary/30 rounded-2xl py-4 px-6 font-bold text-sm focus:ring-2 ring-primary/50 outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">Industry Type</label>
                                                    <input 
                                                        type="text" 
                                                        value={formState.industry}
                                                        onChange={(e) => setFormState({...formState, industry: e.target.value})}
                                                        className="w-full bg-secondary/30 rounded-2xl py-4 px-6 font-bold text-sm focus:ring-2 ring-primary/50 outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">Primary Domain</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={formState.domain || ''}
                                                    onChange={(e) => setFormState({...formState, domain: e.target.value})}
                                                    className="w-full bg-secondary/30 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 ring-primary/50 outline-none" 
                                                />
                                                <Globe className="absolute left-4 top-4 text-primary" size={18} />
                                            </div>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">System Currency</label>
                                            <div className="flex items-center space-x-3 bg-secondary/30 rounded-2xl p-4">
                                                <input 
                                                    type="text"
                                                    value={formState.currency}
                                                    onChange={(e) => setFormState({...formState, currency: e.target.value})}
                                                    className="w-16 bg-primary text-white rounded-lg flex items-center justify-center font-black text-center outline-none"
                                                />
                                                <span className="font-bold text-sm">Workspace Default Currency</span>
                                            </div>
                                         </div>
                                    </div>

                                    <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
                                         <div className="flex items-center space-x-4 mb-4">
                                             <Palette size={20} className="text-primary" />
                                             <h4 className="text-sm font-black uppercase tracking-widest">Brand Accent Color</h4>
                                         </div>
                                         <div className="flex items-center space-x-4">
                                             {['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4'].map(color => (
                                                 <button 
                                                    key={color} 
                                                    type="button"
                                                    onClick={() => setFormState({...formState, themeColor: color})}
                                                    style={{ backgroundColor: color }} 
                                                    className={`w-10 h-10 rounded-xl shadow-lg hover:scale-110 transition-transform ${formState.themeColor === color ? 'ring-4 ring-offset-2 ring-primary' : ''}`} 
                                                 />
                                             ))}
                                             <div className="flex-1 bg-secondary/50 rounded-xl h-10 flex items-center px-4 font-bold text-xs uppercase tracking-widest">{formState.themeColor}</div>
                                         </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <div className="space-y-10">
                                    <h3 className="text-2xl font-black mb-8">Access Policies</h3>
                                    <div className="space-y-6">
                                        {[
                                            { id: 'mfaEnabled', label: 'Multi-Factor Authentication (MFA)', desc: 'Force all users to verify via App or SMS.' },
                                            { id: 'passwordComplexity', label: 'Strict Password Rules', desc: 'Enable complexity and historical requirements.' },
                                        ].map((pol) => (
                                            <div key={pol.id} className="flex items-center justify-between p-6 bg-secondary/20 rounded-3xl border border-secondary group hover:border-primary/20 transition-all">
                                                <div className="max-w-md">
                                                    <p className="font-black text-base">{pol.label}</p>
                                                    <p className="text-xs font-medium text-muted-foreground mt-1">{pol.desc}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setFormState({
                                                        ...formState, 
                                                        securitySettings: {
                                                            ...formState.securitySettings,
                                                            [pol.id]: !formState.securitySettings[pol.id]
                                                        }
                                                    })}
                                                    className={`w-14 h-8 rounded-full p-1 transition-all ${(formState.securitySettings[pol.id as keyof typeof formState.securitySettings]) ? 'bg-primary' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${(formState.securitySettings[pol.id as keyof typeof formState.securitySettings]) ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-8 bg-rose-500 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-rose-500/20">
                                         <div className="flex items-center space-x-6">
                                              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                                  <Lock size={28} />
                                              </div>
                                              <div>
                                                  <p className="text-xl font-black">Audit Protection</p>
                                                  <p className="text-white/70 text-xs font-medium">Export encryption keys for local regulatory compliance.</p>
                                              </div>
                                         </div>
                                         <button className="px-6 py-3 bg-white text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Download Key</button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'notifications' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                                     <Mail size={80} className="text-muted-foreground mb-6" />
                                     <h3 className="text-2xl font-black">Communication Engine</h3>
                                     <p className="text-sm font-medium text-muted-foreground max-w-sm mt-2">Configure custom SMTP servers and design dynamic notification triggers.</p>
                                     <button className="mt-10 px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">Connect Server</button>
                                </div>
                            )}
                            
                            {(activeSection === 'integrations') && (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black mb-8">Ecosystem Sync</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { name: 'Google Workspace', status: 'Connected', icon: 'G' },
                                            { name: 'Microsoft Azure', status: 'Pending', icon: 'M' },
                                            { name: 'Slack Connect', status: 'Inactive', icon: 'S' },
                                            { name: 'Quickbooks ERP', status: 'Connected', icon: 'Q' },
                                        ].map((app) => (
                                            <div key={app.name} className="p-6 bg-secondary/30 rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all flex items-center justify-between group">
                                                 <div className="flex items-center space-x-4">
                                                     <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl font-black text-primary">{app.icon}</div>
                                                     <div>
                                                         <p className="font-black text-sm leading-none mb-1">{app.name}</p>
                                                         <p className={`text-[10px] font-black uppercase tracking-widest ${app.status === 'Connected' ? 'text-green-500' : 'text-amber-500'}`}>{app.status}</p>
                                                     </div>
                                                 </div>
                                                 <button className="p-3.5 bg-background rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
