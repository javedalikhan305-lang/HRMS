import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Phone, Building2, Briefcase, Calendar, Shield, Save, Loader2, Eye, EyeOff, CheckCircle2, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { orgService } from '../services/orgService';
import { UserRole } from '../store/authStore';
import api from '../utils/api';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [showQuickAdd, setShowQuickAdd] = useState<'none' | 'dept' | 'desig'>('none');
    const [quickAddValue, setQuickAddValue] = useState('');
    const [quickAddLoading, setQuickAddLoading] = useState(false);

    const [formData, setFormData] = useState({
        userData: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'EMPLOYEE' as UserRole,
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

    useEffect(() => {
        if (isOpen) {
            fetchOrgData();
            setSuccess(false);
            setError(null);
            setShowQuickAdd('none');
            setQuickAddValue('');
        }
    }, [isOpen]);

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

    const handleQuickAdd = async () => {
        if (!quickAddValue.trim()) return;
        setQuickAddLoading(true);
        try {
            if (showQuickAdd === 'dept') {
                const res = await api.post('/org/departments', { name: quickAddValue });
                const newDept = res.data.data;
                
                // Use functional updates to ensure we have latest state
                setDepartments(prev => [...prev, newDept]);
                setFormData(prev => ({
                    ...prev,
                    employeeData: {
                        ...prev.employeeData,
                        department: newDept._id
                    }
                }));
            } else if (showQuickAdd === 'desig') {
                const res = await api.post('/org/designations', { title: quickAddValue });
                const newDesig = res.data.data;
                
                setDesignations(prev => [...prev, newDesig]);
                setFormData(prev => ({
                    ...prev,
                    employeeData: {
                        ...prev.employeeData,
                        designation: newDesig._id
                    }
                }));
            }
            setShowQuickAdd('none');
            setQuickAddValue('');
        } catch (err) {
            setError("Failed to add new entry. Ensure you have admin rights.");
        } finally {
            setQuickAddLoading(false);
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
            return;
        }

        // Sanitize data: ensure we send clean strings for IDs
        const sanitizedUserData = { ...formData.userData };
        const sanitizedEmployeeData = { 
            ...formData.employeeData,
            department: formData.employeeData.department || undefined,
            designation: formData.employeeData.designation || undefined
        };

        try {
            setLoading(true);
            await employeeService.addEmployee(sanitizedUserData, sanitizedEmployeeData);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-card border rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
                >
                    {/* Success Overlay */}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
                        >
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter mb-2">Employee Added!</h2>
                            <p className="text-muted-foreground font-medium max-w-xs">The record has been synchronized with the HRMS database successfully.</p>
                        </motion.div>
                    )}

                    {/* Header */}
                    <div className="p-8 border-b bg-secondary/30 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Add New Employee</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">System Registry Entry</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 hover:bg-secondary rounded-2xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[75vh]">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl border border-destructive/20 flex items-center"
                            >
                                <X size={14} className="mr-2" />
                                {error}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Information Section */}
                            <div className="space-y-4 md:col-span-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center mb-4 pb-2 border-b border-dashed">
                                    <Shield size={14} className="mr-2" />
                                    Identity & Access
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.userData.firstName}
                                            onChange={(e) => setFormData({...formData, userData: {...formData.userData, firstName: e.target.value}})}
                                            className="w-full bg-secondary/40 border-none rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 ring-primary/40 transition-all placeholder:font-medium"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.userData.lastName}
                                            onChange={(e) => setFormData({...formData, userData: {...formData.userData, lastName: e.target.value}})}
                                            className="w-full bg-secondary/40 border-none rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 ring-primary/40 transition-all placeholder:font-medium"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                            <input 
                                                required
                                                type="email" 
                                                value={formData.userData.email}
                                                onChange={(e) => setFormData({...formData, userData: {...formData.userData, email: e.target.value}})}
                                                className="w-full bg-secondary/40 border-none rounded-2xl py-4 pl-12 pr-5 text-sm font-bold focus:ring-2 ring-primary/40 transition-all"
                                                placeholder="john.doe@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Role</label>
                                        <select 
                                            value={formData.userData.role}
                                            onChange={(e) => setFormData({...formData, userData: {...formData.userData, role: e.target.value as UserRole}})}
                                            className="w-full bg-secondary/40 border-none rounded-2xl py-4 px-5 text-sm font-black uppercase tracking-widest focus:ring-2 ring-primary/40 appearance-none cursor-pointer"
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="HR_ADMIN">HR Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Password</label>
                                    <div className="relative group">
                                        <input 
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.userData.password}
                                            onChange={(e) => setFormData({...formData, userData: {...formData.userData, password: e.target.value}})}
                                            className="w-full bg-secondary/40 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 ring-primary/40 transition-all font-mono"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-4 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-wider ml-1 mt-1 italic">Note: User can reset this upon first login.</p>
                                </div>
                            </div>

                            {/* Employment Information Section */}
                            <div className="space-y-4 md:col-span-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center mb-4 pb-2 border-b border-dashed">
                                    <Briefcase size={14} className="mr-2" />
                                    Workforce Node Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Connectivity</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                            <input 
                                                type="tel" 
                                                value={formData.employeeData.phone}
                                                onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, phone: e.target.value}})}
                                                className="w-full bg-secondary/40 border-none rounded-2xl py-4 pl-12 pr-5 text-sm font-bold focus:ring-2 ring-primary/40"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Joining Timeline</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-4 text-muted-foreground" size={16} />
                                            <input 
                                                type="date" 
                                                value={formData.employeeData.joiningDate}
                                                onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, joiningDate: e.target.value}})}
                                                className="w-full bg-secondary/40 border-none rounded-2xl py-4 pl-12 pr-5 text-sm font-bold focus:ring-2 ring-primary/40 appearance-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Department Dropdown */}
                                    <div className="space-y-2 relative">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workforce Unit (Dept)</label>
                                            <button 
                                                type="button"
                                                onClick={() => setShowQuickAdd(showQuickAdd === 'dept' ? 'none' : 'dept')}
                                                className="text-[9px] font-black text-primary uppercase flex items-center hover:underline"
                                            >
                                                <Plus size={10} className="mr-1" /> Quick Add
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                            <select 
                                                required
                                                value={formData.employeeData.department}
                                                onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, department: e.target.value}})}
                                                className="w-full bg-secondary/40 border-none rounded-2xl py-4 pl-12 pr-10 text-sm font-bold focus:ring-2 ring-primary/40 appearance-none cursor-pointer"
                                            >
                                                <option value="" className="text-muted-foreground">
                                                    {fetchingData ? 'Loading Departments...' : 'Select Department'}
                                                </option>
                                                {departments.map(dept => (
                                                    <option key={dept._id} value={dept._id} className="text-foreground">{dept.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-4 pointer-events-none text-muted-foreground">
                                                <ChevronRight className="rotate-90" size={16} />
                                            </div>
                                        </div>
                                        {departments.length === 0 && !fetchingData && (
                                            <p className="text-[8px] font-bold text-amber-500 mt-1 flex items-center">
                                                <AlertCircle size={10} className="mr-1" /> No departments found. Add one first!
                                            </p>
                                        )}
                                    </div>

                                    {/* Designation Dropdown */}
                                    <div className="space-y-2 relative">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank / Designation</label>
                                            <button 
                                                type="button"
                                                onClick={() => setShowQuickAdd(showQuickAdd === 'desig' ? 'none' : 'desig')}
                                                className="text-[9px] font-black text-primary uppercase flex items-center hover:underline"
                                            >
                                                <Plus size={10} className="mr-1" /> Quick Add
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                            <select 
                                                required
                                                value={formData.employeeData.designation}
                                                onChange={(e) => setFormData({...formData, employeeData: {...formData.employeeData, designation: e.target.value}})}
                                                className="w-full bg-secondary/40 border-none rounded-2xl py-4 pl-12 pr-10 text-sm font-bold focus:ring-2 ring-primary/40 appearance-none cursor-pointer"
                                            >
                                                <option value="" className="text-muted-foreground">
                                                    {fetchingData ? 'Loading Designations...' : 'Select Designation'}
                                                </option>
                                                {designations.map(desig => (
                                                    <option key={desig._id} value={desig._id} className="text-foreground">{desig.title}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-4 pointer-events-none text-muted-foreground">
                                                <ChevronRight className="rotate-90" size={16} />
                                            </div>
                                        </div>
                                        {designations.length === 0 && !fetchingData && (
                                            <p className="text-[8px] font-bold text-amber-500 mt-1 flex items-center">
                                                <AlertCircle size={10} className="mr-1" /> No designations found. Add one first!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Add Overlay */}
                        <AnimatePresence>
                            {showQuickAdd !== 'none' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                                            Quick Add {showQuickAdd === 'dept' ? 'Department' : 'Designation'}
                                        </h4>
                                        <button onClick={() => setShowQuickAdd('none')}><X size={14}/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={quickAddValue}
                                            onChange={(e) => setQuickAddValue(e.target.value)}
                                            placeholder={`Enter ${showQuickAdd === 'dept' ? 'name' : 'title'}...`}
                                            className="flex-1 bg-background border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 ring-primary/40"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleQuickAdd}
                                            disabled={quickAddLoading || !quickAddValue.trim()}
                                            className="bg-primary text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {quickAddLoading ? <Loader2 className="animate-spin" size={14}/> : 'Add'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer / Action Buttons */}
                        <div className="mt-12 flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-5 bg-secondary text-foreground rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary/70 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={loading || fetchingData}
                                className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Save className="group-hover:rotate-12 transition-transform" size={18} />
                                )}
                                <span>Register Employee</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddEmployeeModal;
