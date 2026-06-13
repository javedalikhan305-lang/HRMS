import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Mail, Phone, MapPin, 
    MessageSquare, LayoutGrid, List,
    MailQuestion, Building2, UserPlus, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/authStore';
import { employeeService } from '../services/employeeService';
import AddEmployeeModal from '../components/AddEmployeeModal';

const Employees = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const isHR = user?.role === UserRole.HR_ADMIN;

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getAllEmployees();
            setEmployees(data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const departments = ['All', ...new Set(employees.map(emp => emp.department?.name).filter(Boolean))];

    const mappedColleagues = employees.map(emp => ({
        id: emp._id,
        name: emp.userId ? `${emp.userId.firstName} ${emp.userId.lastName}` : 'System User',
        role: emp.designation?.title || 'Employee',
        dept: emp.department?.name || 'General',
        email: emp.userId?.email || 'N/A',
        phone: emp.phone || 'N/A',
        location: emp.address?.city || 'Remote',
        status: emp.userId?.isActive ? 'In Office' : 'Offline'
    }));

    const filteredColleagues = mappedColleagues.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'All' || c.dept === selectedDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Employee Directory</h1>
                    <p className="text-muted-foreground font-medium">Discover and connect with your colleagues across the organization.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, role, email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-secondary/50 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium w-full md:w-80 focus:ring-2 ring-primary/50"
                        />
                    </div>
                    {isHR && (
                        <button 
                            onClick={() => navigate('/dashboard/register-user')}
                            className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                        >
                            <UserPlus size={18} />
                            <span>Add Employee</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Department Filters & View Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 group">
                <div className="flex flex-wrap gap-2">
                    {departments.map((dept: any) => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                selectedDept === dept 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>
                <div className="flex items-center bg-secondary/50 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Colleagues Grid/List */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Directory...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredColleagues.map((c, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={c.id} 
                                className="bg-card border rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all group flex flex-col relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
                                
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <div className="w-20 h-20 rounded-[2rem] bg-secondary p-1 border-2 border-background shadow-md overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} 
                                                alt={c.name} 
                                                className="w-full h-full rounded-[1.75rem]"
                                            />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background shadow-sm ${
                                            c.status === 'In Office' ? 'bg-green-500' : 'bg-muted'
                                        }`} />
                                    </div>
                                    
                                    <h3 className="font-black text-base line-clamp-1">{c.name}</h3>
                                    <p className="text-xs font-bold text-primary mb-4">{c.role}</p>
                                    
                                    <div className="w-full space-y-2.5 mb-6">
                                        <div className="flex items-center space-x-2 text-[11px] font-medium text-muted-foreground bg-secondary/30 p-2 rounded-xl">
                                            <Building2 size={12} className="text-primary" />
                                            <span>{c.dept}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-[11px] font-medium text-muted-foreground bg-secondary/30 p-2 rounded-xl">
                                            <MapPin size={12} className="text-primary" />
                                            <span>{c.location}</span>
                                        </div>
                                    </div>

                                    <div className="w-full grid grid-cols-3 gap-2">
                                        <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/50 hover:bg-primary hover:text-white transition-all group/btn">
                                            <Mail size={16} />
                                            <span className="text-[8px] font-black uppercase mt-1">Mail</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/50 hover:bg-primary hover:text-white transition-all group/btn">
                                            <MessageSquare size={16} />
                                            <span className="text-[8px] font-black uppercase mt-1">Chat</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/50 hover:bg-primary hover:text-white transition-all group/btn">
                                            <Phone size={16} />
                                            <span className="text-[8px] font-black uppercase mt-1">Call</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-card border rounded-[3rem] overflow-hidden shadow-sm"
                    >
                        <table className="w-full">
                            <thead>
                                <tr className="bg-secondary/30 text-left border-b">
                                    <th className="px-10 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground">Colleague</th>
                                    <th className="px-10 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground">Department</th>
                                    <th className="px-10 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground">Location</th>
                                    <th className="px-10 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-10 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/30 font-medium">
                                {filteredColleagues.map((c) => (
                                    <tr key={c.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="px-10 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-secondary p-0.5 border border-secondary shadow-sm overflow-hidden">
                                                    <img 
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} 
                                                        alt={c.name} 
                                                        className="w-full h-full rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm">{c.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">{c.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5">
                                            <span className="px-4 py-1.5 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-full">{c.dept}</span>
                                        </td>
                                        <td className="px-10 py-5 text-sm font-bold text-muted-foreground">{c.location}</td>
                                        <td className="px-10 py-5">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    c.status === 'In Office' ? 'bg-green-500' : 'bg-muted'
                                                }`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{c.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5">
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm">
                                                    <Mail size={16} />
                                                </button>
                                                <button className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm">
                                                    <MessageSquare size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {!loading && filteredColleagues.length === 0 && (
                <div className="py-20 text-center bg-secondary/10 rounded-[3rem] border border-dashed border-secondary">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <MailQuestion size={40} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2">No colleagues found</h3>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto">We couldn't find anyone matching your search criteria. Try a different name or department.</p>
                </div>
            )}

            <AddEmployeeModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={fetchEmployees}
            />
        </div>
    );
};

export default Employees;
