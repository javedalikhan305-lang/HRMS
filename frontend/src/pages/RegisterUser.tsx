import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    UserPlus, Mail, Lock, Shield, 
    User, Building2, Briefcase, Calendar, 
    ChevronRight, Save, Loader2, AlertCircle,
    CheckCircle2, ArrowLeft, Phone, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/authStore';
import { employeeService } from '../services/employeeService';
import { orgService } from '../services/orgService';
import api from '../utils/api';
import toast from 'react-hot-toast';

const RegisterUser = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        userData: {
            firstName: '',
            lastName: '',
            email: '',
            role: UserRole.EMPLOYEE,
            password: 'Welcome@123'
        },
        employeeData: {
            phone: '',
            joiningDate: new Date().toISOString().split('T')[0],
            department: '',
            designation: '',
            gender: 'Male',
        }
    });

    // Role Protection: Only HR_ADMIN or SUPER_ADMIN (if exists) can access
    useEffect(() => {
        const isAuthorized = user?.role === UserRole.HR_ADMIN;
        if (!isAuthorized) {
            toast.error("Unauthorized access. Only HR Admins can register users.");
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchOrgData();
    }, []);

    const fetchOrgData = async () => {
        try {
            setFetchingData(true);
            const [depts, desigs] = await Promise.all([
                orgService.getDepartments(),
                orgService.getDesignations()
            ]);
            setDepartments(depts || []);
            setDesignations(desigs || []);
        } catch (err) {
            console.error('Failed to fetch org data', err);
        } finally {
            setFetchingData(false);
        }
    };

    const validateForm = () => {
        const { userData, employeeData } = formData;
        if (!userData.firstName || !userData.lastName || !userData.email) return "Please fill in all required user fields.";
        if (!userData.email.includes('@')) return "Please enter a valid email address.";
        if (!employeeData.department) return "Please select a department.";
        if (!employeeData.designation) return "Please select a designation.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await employeeService.addEmployee(formData.userData, formData.employeeData);
            setSuccess(true);
            toast.success("Employee registered successfully!");
            setTimeout(() => {
                navigate('/dashboard/employees');
            }, 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to register employee';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8">
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8"
                >
                    <CheckCircle2 size={60} />
                </motion.div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">Registration Successful!</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8 font-medium">
                    The employee has been added to the system registry and can now log in with their credentials.
                </p>
                <button 
                    onClick={() => navigate('/dashboard/employees')}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center space-x-2 hover:scale-105 transition-all"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Directory</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Personnel Registry</h1>
                    <p className="text-muted-foreground font-medium">Enroll a new employee into the organization's workforce ecosystem.</p>
                </div>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest"
                >
                    <ArrowLeft size={16} />
                    <span>Go Back</span>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Identity Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border rounded-[2.5rem] p-8 md:p-12 shadow-sm"
                >
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Identity & Access</h2>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Core Authenticity Data</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    required
                                    type="text" 
                                    value={formData.userData.firstName}
                                    onChange={(e) => setFormData({...formData, userData: {...formData.userData, firstName: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                    placeholder="Jane"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    required
                                    type="text" 
                                    value={formData.userData.lastName}
                                    onChange={(e) => setFormData({...formData, userData: {...formData.userData, lastName: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                    placeholder="Smith"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    required
                                    type="email" 
                                    value={formData.userData.email}
                                    onChange={(e) => setFormData({...formData, userData: {...formData.userData, email: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                    placeholder="jane.smith@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Role</label>
                            <div className="relative">
                                <select 
                                    value={formData.userData.role}
                                    onChange={(e) => setFormData({...formData, userData: {...formData.userData, role: e.target.value as UserRole}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 px-6 text-sm font-black uppercase tracking-widest appearance-none cursor-pointer focus:ring-2 ring-primary/40"
                                >
                                    <option value={UserRole.EMPLOYEE}>Employee</option>
                                    <option value={UserRole.MANAGER}>Manager</option>
                                    <option value={UserRole.HR_ADMIN}>HR Admin</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-4 rotate-90 text-muted-foreground pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.userData.password}
                                    onChange={(e) => setFormData({...formData, userData: {...formData.userData, password: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-14 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-muted-foreground hover:text-primary transition-all"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-[10px] font-medium text-muted-foreground italic ml-1">The user will be prompted to change this upon first login.</p>
                        </div>
                    </div>
                </motion.section>

                {/* Professional Details Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border rounded-[2.5rem] p-8 md:p-12 shadow-sm"
                >
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Workforce Placement</h2>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Node Positioning & Connectivity</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-4 text-muted-foreground" size={18} />
                                <select 
                                    required
                                    value={formData.employeeData.department}
                                    onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, department: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-10 text-sm font-bold appearance-none cursor-pointer focus:ring-2 ring-primary/40 transition-all"
                                >
                                    <option value="">Select Domain</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-4 rotate-90 text-muted-foreground pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Designation</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-4 text-muted-foreground" size={18} />
                                <select 
                                    required
                                    value={formData.employeeData.designation}
                                    onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, designation: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-10 text-sm font-bold appearance-none cursor-pointer focus:ring-2 ring-primary/40 transition-all"
                                >
                                    <option value="">Select Rank</option>
                                    {designations.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-4 rotate-90 text-muted-foreground pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Joining Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    required
                                    type="date" 
                                    value={formData.employeeData.joiningDate}
                                    onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, joiningDate: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Contact</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="tel" 
                                    value={formData.employeeData.phone}
                                    onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, phone: e.target.value}})}
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="flex flex-col md:flex-row items-center gap-4 py-8">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full md:w-auto px-10 py-5 rounded-3xl bg-secondary text-foreground font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary/70 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading || fetchingData}
                        className="flex-1 w-full px-10 py-5 rounded-3xl bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Execute Enrollment</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <footer className="py-10 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-[10px] font-black uppercase tracking-widest border border-destructive/20">
                    <AlertCircle size={14} />
                    <span>Authorized Entry Only — Actions are Audit-Logged</span>
                </div>
            </footer>
        </div>
    );
};

export default RegisterUser;
