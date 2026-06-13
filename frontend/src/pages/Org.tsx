import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Search, ZoomIn, ZoomOut, 
    Maximize2, Share2, MapPin, Plus, Filter,
    Layers, Users, Star, DollarSign,
    Map as MapIcon, MoreVertical, Edit3,
    Trash2, ChevronRight, Loader2, X, Check,
    Clock, Briefcase
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgService } from '../services/orgService';
import toast from 'react-hot-toast';

const OrgNode = ({ node, isLeader = false }: any) => (
    <div className={`p-6 bg-card border rounded-[2rem] shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group relative min-w-[280px] ${isLeader ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-secondary p-1 border border-secondary shadow-md overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                        src={node.managerId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${node.name}`} 
                        alt={node.name} 
                        className="w-full h-full rounded-xl"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm" />
            </div>
            <div className="flex-1 text-left">
                <h4 className="font-black text-sm leading-tight mb-1 truncate max-w-[150px]">{node.name}</h4>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                    {node.managerId ? `${node.managerId.firstName} ${node.managerId.lastName}` : 'No Manager'}
                </p>
                <div className="flex items-center space-x-2 text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                    <Briefcase size={10} className="text-muted-foreground/50" />
                    <span>{node.children?.length || 0} Sub-units</span>
                </div>
            </div>
        </div>
        
        {isLeader && (
            <div className="absolute top-4 right-4 h-6 px-2 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Building2 size={12} className="mr-1" />
                <span className="text-[8px] font-black uppercase">Root</span>
            </div>
        )}
    </div>
);

const RecursiveNodes = ({ nodes }: { nodes: any[] }) => {
    if (!nodes || nodes.length === 0) return null;

    return (
        <div className="relative flex justify-center space-x-12 pt-16">
            {nodes.map((node, i) => (
                <div key={node._id} className="relative flex flex-col items-center">
                    <div className="absolute top-0 left-1/2 w-px h-16 bg-primary/10 -translate-x-1/2" />
                    {nodes.length > 1 && (
                        <>
                            {i === 0 && <div className="absolute top-0 left-1/2 right-0 h-px bg-primary/10" />}
                            {i === nodes.length - 1 && <div className="absolute top-0 left-0 right-1/2 h-px bg-primary/10" />}
                            {i > 0 && i < nodes.length - 1 && <div className="absolute top-0 left-0 right-0 h-px bg-primary/10" />}
                        </>
                    )}
                    <OrgNode node={node} />
                    <RecursiveNodes nodes={node.children} />
                </div>
            ))}
        </div>
    );
};

const Org = () => {
    const queryClient = useQueryClient();
    const [activeView, setActiveView] = useState<'hierarchy' | 'structure'>('structure');
    const [activeHub, setActiveHub] = useState<'depts' | 'teams' | 'shifts'>('depts');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [entityType, setEntityType] = useState<'depts' | 'teams' | 'shifts'>('depts');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        title: '',
        parentDeptId: '',
        grade: '',
        startTime: '09:00',
        endTime: '18:00'
    });

    // Queries
    const { data: departments, isLoading: deptsLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: orgService.getDepartments
    });

    const { data: designations, isLoading: desigLoading } = useQuery({
        queryKey: ['designations'],
        queryFn: orgService.getDesignations
    });

    const { data: shifts, isLoading: shiftsLoading } = useQuery({
        queryKey: ['shifts'],
        queryFn: orgService.getShifts
    });

    const { data: orgChart, isLoading: chartLoading } = useQuery({
        queryKey: ['orgChart'],
        queryFn: orgService.getOrgChart,
        enabled: activeView === 'hierarchy'
    });

    // Mutations
    const mutationOptions = {
        onSuccess: (data: any, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            queryClient.invalidateQueries({ queryKey: ['designations'] });
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            queryClient.invalidateQueries({ queryKey: ['orgChart'] });
            setIsAddModalOpen(false);
            setEditMode(false);
            setEditingId(null);
            setFormData({ name: '', description: '', title: '', parentDeptId: '', grade: '', startTime: '09:00', endTime: '18:00' });
            toast.success("Succesfully updated organization structure");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    const createDeptMutation = useMutation({ mutationFn: orgService.createDepartment, ...mutationOptions });
    const updateDeptMutation = useMutation({ mutationFn: (data: any) => orgService.updateDepartment(editingId!, data), ...mutationOptions });
    const deleteDeptMutation = useMutation({ mutationFn: orgService.deleteDepartment, ...mutationOptions });

    const createDesigMutation = useMutation({ mutationFn: orgService.createDesignation, ...mutationOptions });
    const updateDesigMutation = useMutation({ mutationFn: (data: any) => orgService.updateDesignation(editingId!, data), ...mutationOptions });
    const deleteDesigMutation = useMutation({ mutationFn: orgService.deleteDesignation, ...mutationOptions });

    const createShiftMutation = useMutation({ mutationFn: orgService.createShift, ...mutationOptions });
    const updateShiftMutation = useMutation({ mutationFn: (data: any) => orgService.updateShift(editingId!, data), ...mutationOptions });
    const deleteShiftMutation = useMutation({ mutationFn: orgService.deleteShift, ...mutationOptions });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (entityType === 'depts') {
            const data = { name: formData.name, description: formData.description, parentDeptId: formData.parentDeptId || null };
            editMode ? updateDeptMutation.mutate(data) : createDeptMutation.mutate(data);
        } else if (entityType === 'teams') {
            const data = { title: formData.title, grade: formData.grade || undefined };
            editMode ? updateDesigMutation.mutate(data) : createDesigMutation.mutate(data);
        } else if (entityType === 'shifts') {
            const data = { name: formData.name, startTime: formData.startTime, endTime: formData.endTime };
            editMode ? updateShiftMutation.mutate(data) : createShiftMutation.mutate(data);
        }
    };

    const openEditModal = (entity: any, type: 'depts' | 'teams' | 'shifts') => {
        setEntityType(type);
        setEditMode(true);
        setEditingId(entity._id);
        if (type === 'depts') {
            setFormData({ ...formData, name: entity.name, description: entity.description || '', parentDeptId: entity.parentDeptId || '' });
        } else if (type === 'teams') {
            setFormData({ ...formData, title: entity.title, grade: entity.grade || '' });
        } else if (type === 'shifts') {
            setFormData({ ...formData, name: entity.name, startTime: entity.startTime, endTime: entity.endTime });
        }
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Organization Engine</h1>
                    <p className="text-muted-foreground font-medium">Architecting the global corporate structure and reporting lines.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-secondary/50 p-1 rounded-2xl flex">
                        <button 
                            onClick={() => setActiveView('hierarchy')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                                activeView === 'hierarchy' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Hierarchy
                        </button>
                        <button 
                            onClick={() => setActiveView('structure')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                                activeView === 'structure' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Management Hub
                        </button>
                    </div>
                   
                    <button 
                        onClick={() => {
                            setEditMode(false);
                            setEditingId(null);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Add Entity</span>
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeView === 'hierarchy' ? (
                    <motion.div 
                        key="hierarchy"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-end space-x-3">
                             <div className="flex bg-secondary/50 p-1 rounded-2xl">
                                <button className="p-2.5 text-muted-foreground hover:text-primary transition-all"><ZoomIn size={18} /></button>
                                <button className="p-2.5 text-muted-foreground hover:text-primary transition-all"><ZoomOut size={18} /></button>
                                <button className="p-2.5 text-muted-foreground hover:text-primary transition-all"><Maximize2 size={18} /></button>
                            </div>
                            <button className="flex items-center space-x-2 px-6 py-3 bg-card border rounded-2xl text-[10px] font-black uppercase hover:border-primary/50 transition-all">
                                 <Share2 size={14} className="text-primary" />
                                 <span>Export Canvas</span>
                            </button>
                        </div>
                        
                        <div className="bg-secondary/10 border-2 border-dashed border-secondary/50 rounded-[4rem] min-h-[650px] overflow-auto p-16 custom-scrollbar text-center">
                            {chartLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Building Hierarchy...</p>
                                </div>
                            ) : (
                                <div className="inline-block min-w-full">
                                   {orgChart && orgChart.length > 0 ? (
                                       orgChart.map((root: any) => (
                                           <div key={root._id} className="flex flex-col items-center mb-24">
                                               <OrgNode node={root} isLeader />
                                               <RecursiveNodes nodes={root.children} />
                                           </div>
                                       ))
                                   ) : (
                                       <div className="py-20">
                                           <Building2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                                           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No departments defined.</p>
                                       </div>
                                   )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="structure"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 xl:grid-cols-4 gap-8"
                    >
                        {/* Hub Navigation Sidebar */}
                        <div className="space-y-3">
                            {[
                                { id: 'depts', label: 'Departments', icon: Building2, count: departments?.length || 0 },
                                { id: 'teams', label: 'Positions & Roles', icon: Layers, count: designations?.length || 0 },
                                { id: 'shifts', label: 'Working Shifts', icon: Clock, count: shifts?.length || 0 },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveHub(item.id as any)}
                                    className={`w-full p-6 rounded-[2rem] border flex items-center justify-between transition-all ${
                                        activeHub === item.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-card hover:border-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeHub === item.id ? 'bg-white/20' : 'bg-secondary'}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-sm font-black tracking-tight">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase ${activeHub === item.id ? 'text-white/60' : 'text-muted-foreground'}`}>{item.count}</span>
                                </button>
                            ))}

                            <div className="mt-8 bg-black rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 p-10 opacity-20 rotate-12 group-hover:scale-110 transition-transform">
                                      <Star size={100} />
                                 </div>
                                 <h4 className="text-xl font-black mb-4 relative z-10">Grade Matrix</h4>
                                 <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-6 relative z-10">Manage salary bands & job levels</p>
                                 <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10">Configure Matrix</button>
                            </div>
                        </div>

                        {/* Hub Content Area */}
                        <div className="xl:col-span-3 space-y-6">
                            <div className="bg-card border rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-3 text-muted-foreground" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder={`Search ${activeHub}...`} 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-secondary/30 border-none rounded-xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 ring-primary/50 text-foreground shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {activeHub === 'depts' ? (
                                    (departments || []).filter((d:any) => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((dept: any) => (
                                        <div key={dept._id} className="bg-card border rounded-[3rem] p-8 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6 z-10">
                                                <div className={`w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center rounded-2xl`}>
                                                    <Building2 className="text-indigo-500" size={28} />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                     <button 
                                                        onClick={() => openEditModal(dept, 'depts')}
                                                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                                                     >
                                                        <Edit3 size={16} />
                                                     </button>
                                                     <button 
                                                        onClick={() => {
                                                            if(window.confirm('Delete this department?')) deleteDeptMutation.mutate(dept._id);
                                                        }}
                                                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm"
                                                     >
                                                        <Trash2 size={16} />
                                                     </button>
                                                </div>
                                            </div>
                                            <div className="z-10">
                                                <h4 className="text-2xl font-black tracking-tight leading-none mb-2">{dept.name}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed line-clamp-1">
                                                    {dept.description || 'Enterprise Operational Unit'}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-8 pt-6 border-t z-10">
                                                 <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                                                     <Users size={14} className="text-primary" />
                                                     <span>{dept.managerId ? `${dept.managerId.firstName}` : 'No Lead'}</span>
                                                 </div>
                                                 <div className="text-[9px] font-black uppercase text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                                     ID: {dept._id.slice(-6)}
                                                 </div>
                                            </div>
                                        </div>
                                    ))
                                ) : activeHub === 'teams' ? (
                                    (designations || []).filter((d:any) => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((desig: any) => (
                                        <div key={desig._id} className="bg-card border rounded-[3rem] p-8 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between min-h-[220px]">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-2xl`}>
                                                    <Layers className="text-emerald-500" size={28} />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                     <button 
                                                        onClick={() => openEditModal(desig, 'teams')}
                                                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:bg-primary hover:text-white transition-all"
                                                     >
                                                        <Edit3 size={16} />
                                                     </button>
                                                     <button 
                                                        onClick={() => {
                                                            if(window.confirm('Delete this position?')) deleteDesigMutation.mutate(desig._id);
                                                        }}
                                                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:bg-destructive hover:text-white transition-all"
                                                     >
                                                        <Trash2 size={16} />
                                                     </button>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black tracking-tight leading-none mb-1">{desig.title}</h4>
                                                <span className="text-[9px] font-black uppercase bg-secondary px-2 py-0.5 rounded-md text-primary">{desig.grade || 'Standard'}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-8 pt-6 border-t text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                 <div className="flex items-center space-x-2">
                                                     <Star size={14} className="text-primary" />
                                                     <span>Active Role</span>
                                                 </div>
                                                 <div className="flex items-center space-x-1 text-emerald-500">
                                                     <Check size={12} />
                                                     <span>Authenticated</span>
                                                 </div>
                                            </div>
                                        </div>
                                    ))
                                ) : activeHub === 'shifts' ? (
                                    (shifts || []).filter((s:any) => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((shift: any) => (
                                        <div key={shift._id} className="bg-card border rounded-[3rem] p-8 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between min-h-[220px]">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-14 h-14 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center rounded-2xl`}>
                                                    <Clock className="text-amber-500" size={28} />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                     <button 
                                                        onClick={() => openEditModal(shift, 'shifts')}
                                                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                                                     >
                                                        <Edit3 size={16} />
                                                     </button>
                                                     <button 
                                                        onClick={() => {
                                                            if(window.confirm('Delete this shift?')) deleteShiftMutation.mutate(shift._id);
                                                        }}
                                                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm"
                                                     >
                                                        <Trash2 size={16} />
                                                     </button>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black tracking-tight mb-2">{shift.name}</h4>
                                                <div className="flex items-center space-x-3 text-xs font-black text-muted-foreground">
                                                    <span>{shift.startTime}</span>
                                                    <ChevronRight size={14} />
                                                    <span>{shift.endTime}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-8 pt-6 border-t">
                                                 <span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-2 py-1 rounded-lg">Operational Hub</span>
                                                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    ))
                                ) : null}
                                
                                <button 
                                    onClick={() => {
                                        setEditMode(false);
                                        setEntityType(activeHub as any);
                                        setIsAddModalOpen(true);
                                    }}
                                    className="border-4 border-dashed border-secondary rounded-[3rem] flex flex-col items-center justify-center p-8 text-muted-foreground hover:bg-secondary/30 hover:border-primary/30 transition-all group min-h-[220px]"
                                >
                                     <div className="w-16 h-16 bg-background rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                         <Plus size={32} className="text-primary" />
                                     </div>
                                     <span className="font-black text-xs uppercase tracking-widest">Deploy New {activeHub === 'depts' ? 'Department' : activeHub === 'teams' ? 'Position' : 'Shift'}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entity Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card w-full max-w-lg rounded-[3.5rem] p-12 border shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center space-x-5">
                                    <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                        {editMode ? <Edit3 size={24} /> : <Plus size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{editMode ? 'Modify' : 'Initialize'} Entity</h3>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Expanding Org Capabilities</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-4 hover:bg-secondary rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-secondary/30 p-1.5 rounded-[1.75rem] flex mb-8">
                                {['depts', 'teams', 'shifts'].map((type: any) => (
                                    <button 
                                        key={type}
                                        type="button"
                                        onClick={() => setEntityType(type)}
                                        className={`flex-1 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${entityType === type ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                    >
                                        {type === 'depts' ? 'Dept' : type === 'teams' ? 'Position' : 'Shift'}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {entityType === 'depts' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center">
                                                <Building2 size={12} className="mr-2" /> Department Name
                                            </label>
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g. Engineering, Marketing, HR"
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center">
                                                <Layers size={12} className="mr-2" /> Parent Department
                                            </label>
                                            <select 
                                                value={formData.parentDeptId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, parentDeptId: e.target.value }))}
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Top Level (No Parent)</option>
                                                {(departments || []).filter((d:any) => d._id !== editingId).map((d: any) => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brief Description</label>
                                            <textarea 
                                                rows={2}
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Context for this unit..."
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none resize-none"
                                            />
                                        </div>
                                    </>
                                ) : entityType === 'teams' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center">
                                                <Star size={12} className="mr-2" /> Role Title
                                            </label>
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g. Senior Backend Engineer"
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center">
                                                <Layers size={12} className="mr-2" /> Job Grade / Level
                                            </label>
                                            <input 
                                                type="text" 
                                                value={formData.grade}
                                                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                                                placeholder="e.g. L4, E5, Senior Manager"
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Shift Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g. Night Shift, Standard UK"
                                                className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none focus:ring-2 ring-primary/40 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</label>
                                                <input 
                                                    type="time" 
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                                    className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</label>
                                                <input 
                                                    type="time" 
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                                    className="w-full bg-secondary/40 rounded-[1.25rem] py-4 px-6 text-sm font-bold border-none transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary/70 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={createDeptMutation.isPending || updateDeptMutation.isPending}
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                                    >
                                        {(createDeptMutation.isPending || updateDeptMutation.isPending) ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <Check size={18} />
                                        )}
                                        <span>{editMode ? 'Confirm Changes' : 'Initialize Entity'}</span>
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

export default Org;
