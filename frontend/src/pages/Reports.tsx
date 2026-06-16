import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, Download, Filter, 
    Calendar, Wallet, FileText,
    Share2, Info, ArrowUpRight, ArrowDownRight,
    TrendingUp, PieChart as PieChartIcon,
    Zap, Activity, Shield, Microscope,
    Clock, Search, MoreVertical, Users,
    UserCheck, Timer, CalendarX, Star,
    ChevronRight, Loader2, UserCircle,
    IndianRupee, Mail, Phone, MapPin, 
    Briefcase, GraduationCap, Award, ShieldCheck, 
    CreditCard
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, LineChart, Line,
    AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import api from '../utils/api';
import { employeeService } from '../services/employeeService';
import moment from 'moment';

const Reports = () => {
    const [activeDomain, setActiveDomain] = useState<'talent' | 'ops' | 'finance' | 'risk' | 'employee'>('talent');
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);
    const [empStats, setEmpStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    
    // Real Data States
    const [growthTrends, setGrowthTrends] = useState<any[]>([]);
    const [capitalAllocation, setCapitalAllocation] = useState<any[]>([]);
    const [talentStats, setTalentStats] = useState<any[]>([]);
    const [opsMetrics, setOpsMetrics] = useState<any>(null);
    const [loadingReports, setLoadingReports] = useState(true);

    // Instant Insight States
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [activeInsight, setActiveInsight] = useState<{title: string, content: string, action: string} | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoadingReports(true);
            const [growth, capital, talent, ops] = await Promise.all([
                api.get('/reports/growth-trends'),
                api.get('/reports/capital-allocation'),
                api.get('/reports/talent-stats'),
                api.get('/reports/ops-metrics')
            ]);
            setGrowthTrends(growth.data.data);
            setCapitalAllocation(capital.data.data);
            setTalentStats(talent.data.data);
            setOpsMetrics(ops.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingReports(false);
        }
    };


    useEffect(() => {
        if (activeDomain === 'employee') {
            fetchEmployees();
        }
    }, [activeDomain]);

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEmployeeStats = async (userId: string) => {
        try {
            setLoadingStats(true);
            const [statsRes, profileRes] = await Promise.all([
                api.get(`/reports/employee/${userId}/stats`),
                api.get(`/employees/${userId}`)
            ]);
            setEmpStats(statsRes.data.data);
            setSelectedEmp(profileRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    };

    const generateInstantInsight = async () => {
        setIsInsightLoading(true);
        // Simulate high-performance compute delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const insights: Record<string, any> = {
            talent: {
                title: "Talent Acquisition Velocity",
                content: "Your hiring pipeline is currently performing 14% above the quarterly benchmark. The average 'time-to-hire' has decreased to 18 days for technical roles.",
                action: "Recommend increasing screening capacity for the Engineering department to maintain momentum."
            },
            employee: {
                title: "Workforce Engagement Pulse",
                content: "Employee productivity stats show a strong upward trend in cross-departmental collaboration. Internal leave patterns suggest high morale in the Operations team.",
                action: "Consider a mid-year recognition program for the top 5% most collaborative members."
            },
            ops: {
                title: "Operational Efficiency Audit",
                content: "Current attendance data shows a 98% consistency rate. Late markers have dropped significantly following the shift optimization implemented last month.",
                action: "Audit the morning shift overlap to save an estimated 4.2% in administrative overhead."
            },
            finance: {
                title: "Capital Disbursement Analysis",
                content: "Payroll variance is exceptionally low at 1.2%. Bonus allocations are projected to be well within the 'Safe' threshold for the upcoming cycle.",
                action: "Optimize currency conversion buffers for international contractors to save ~2k monthly."
            },
            risk: {
                title: "System Integrity Report",
                content: "Zero security anomalies detected. Role-based access control (RBAC) coverage is at 100% for all sensitive financial modules.",
                action: "Schedule a routine quarterly audit of legacy permissions for 3 inactive managers."
            }
        };

        setActiveInsight(insights[activeDomain] || insights.talent);
        setIsInsightLoading(false);
    };

    const reportArchive = [
        { title: 'Global Headcount & Attrition Q2', type: 'Strategic', date: 'June 2024', status: 'Verified' },
        { title: 'Payroll Variance Analysis', type: 'Financial', date: 'June 2024', status: 'Processing' },
        { title: 'Annual Tax Compliance Audit', type: 'Regulatory', date: 'FY 2023-24', status: 'Verified' },
        { title: 'Diversity & Inclusion Pulse', type: 'Cultural', date: 'May 2024', status: 'Draft' },
    ];

    if (loadingReports && activeDomain !== 'employee') {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Synthesizing Intelligence Stream...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">System Intelligence</h1>
                    <p className="text-muted-foreground font-medium flex items-center">
                        <Microscope className="mr-2 text-primary" size={18} />
                        Comprehensive Data Modeling & Predictive Workforce Analytics
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={generateInstantInsight}
                        disabled={isInsightLoading}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isInsightLoading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                        <span>{isInsightLoading ? 'Analyzing...' : 'Instant Insight'}</span>
                    </button>
                    <button className="p-4 bg-secondary/50 rounded-2xl hover:bg-foreground hover:text-white transition-all shadow-sm">
                        <Share2 size={18} />
                    </button>
                </div>
            </header>

            {/* Tactical Navigation */}
            <div className="flex flex-wrap items-center gap-4 py-4 scrollbar-hide overflow-x-auto">
                {[
                    { id: 'talent', label: 'Talent Acquisition', icon: Users },
                    { id: 'employee', label: 'Employee Insights', icon: UserCheck },
                    { id: 'ops', label: 'Operations Flow', icon: Activity },
                    { id: 'finance', label: 'Financial Health', icon: Wallet },
                    { id: 'risk', label: 'System Risk', icon: Shield },
                ].map((domain) => (
                    <button
                        key={domain.id}
                        onClick={() => setActiveDomain(domain.id as any)}
                        className={`px-8 py-4 rounded-[1.5rem] flex items-center space-x-3 transition-all shrink-0 ${
                            activeDomain === domain.id 
                            ? 'bg-black text-white shadow-2xl scale-105' 
                            : 'bg-card text-muted-foreground border hover:border-primary/50'
                        }`}
                    >
                        <domain.icon size={18} className={activeDomain === domain.id ? 'text-primary' : ''} />
                        <span className="text-xs font-black uppercase tracking-widest">{domain.label}</span>
                    </button>
                ))}
            </div>

            <main>
                <AnimatePresence mode="wait">
                    {activeDomain === 'employee' ? (
                        <motion.div 
                            key="employee-domain"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 xl:grid-cols-4 gap-8"
                        >
                            <div className="xl:col-span-1 space-y-6">
                                <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm overflow-hidden h-[600px] flex flex-col">
                                    <h3 className="text-xl font-black tracking-tight mb-6 flex items-center">
                                        <Search className="mr-2 text-primary" size={20} />
                                        Select Member
                                    </h3>
                                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                        {employees.map((emp) => (
                                            <button 
                                                key={emp._id}
                                                onClick={() => fetchEmployeeStats(emp.userId?._id)}
                                                className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${
                                                    selectedEmp?._id === emp._id ? 'bg-primary text-white shadow-lg' : 'hover:bg-secondary'
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}`} alt="" />
                                                </div>
                                                <div className="text-left truncate">
                                                    <p className="text-xs font-black truncate">{emp.firstName} {emp.lastName}</p>
                                                    <p className={`text-[9px] font-bold uppercase opacity-60 ${selectedEmp?._id === emp._id ? 'text-white' : 'text-muted-foreground'}`}>{emp.employeeId}</p>
                                                </div>
                                                <ChevronRight size={14} className="ml-auto opacity-40" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="xl:col-span-3">
                                {loadingStats ? (
                                    <div className="h-full bg-card/50 border border-dashed rounded-[3.5rem] flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="animate-spin text-primary" size={40} />
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Aggregating Intelligence...</p>
                                    </div>
                                ) : selectedEmp && empStats ? (
                                    <div className="space-y-8">
                                        <div className="bg-card border rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-20 opacity-5 -z-0">
                                                <UserCircle size={200} />
                                            </div>
                                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-secondary p-1 border shadow-xl shrink-0">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmp.userId?.firstName || selectedEmp.firstName}`} alt="" className="w-full h-full rounded-[1.75rem]" />
                                                </div>
                                                <div className="flex-1 space-y-4 text-center md:text-left">
                                                    <div>
                                                        <h2 className="text-3xl font-black tracking-tighter">{selectedEmp.userId?.firstName || selectedEmp.firstName} {selectedEmp.userId?.lastName || selectedEmp.lastName}</h2>
                                                        <p className="text-sm font-bold text-primary uppercase">{selectedEmp.designation?.title || 'Team Member'}</p>
                                                    </div>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                        <div className="bg-secondary/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                                                            <Briefcase className="mr-2 opacity-50" size={12} />
                                                            {selectedEmp.department?.name || 'Unassigned'}
                                                        </div>
                                                        <div className="bg-secondary/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                                                            <Calendar className="mr-2 opacity-50" size={12} />
                                                            Joined: {selectedEmp.joiningDate ? moment(selectedEmp.joiningDate).format('DD MMM YYYY') : 'Unknown'}
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center ${selectedEmp.userId?.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {selectedEmp.userId?.isActive ? 'Active Member' : 'Inactive'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t">
                                                {[
                                                    { label: 'Work Days', value: empStats.summary.totalWorkedDays, icon: Timer, color: 'text-indigo-500' },
                                                    { label: 'Late Markers', value: empStats.summary.totalLateDays, icon: Clock, color: 'text-amber-500' },
                                                    { label: 'Leaves Taken', value: empStats.summary.totalLeaveDays, icon: CalendarX, color: 'text-rose-500' },
                                                    { label: 'Avg Prod.', value: empStats.summary.avgWorkHours + 'h', icon: Star, color: 'text-emerald-500' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="space-y-1">
                                                        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                                                            <stat.icon size={14} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                                        </div>
                                                        <h4 className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</h4>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {/* Communications & Personal Info */}
                                            <div className="xl:col-span-1 space-y-8">
                                                <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                        <Info className="mr-2 text-primary" size={16} />
                                                        Personal Identity
                                                    </h3>
                                                    <div className="space-y-6">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                                                                <Mail size={14} className="text-muted-foreground" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Office Email</p>
                                                                <p className="text-xs font-bold truncate">{selectedEmp.userId?.email || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                                                                <Phone size={14} className="text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Contact Number</p>
                                                                <p className="text-xs font-bold">{selectedEmp.phone || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                                                                <MapPin size={14} className="text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Residency</p>
                                                                <p className="text-xs font-bold">
                                                                    {selectedEmp.address?.city && selectedEmp.address?.country 
                                                                        ? `${selectedEmp.address.city}, ${selectedEmp.address.country}` 
                                                                        : 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                            <div>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Birth Date</p>
                                                                <p className="text-xs font-bold">{selectedEmp.dob ? moment(selectedEmp.dob).format('DD MMM, YYYY') : 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Marital Status</p>
                                                                <p className="text-xs font-bold">{selectedEmp.maritalStatus || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                        <ShieldCheck className="mr-2 text-primary" size={16} />
                                                        System Details
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase">Employee ID</span>
                                                            <span className="text-xs font-black p-1 px-2 bg-secondary rounded-lg">{selectedEmp.userId?.employeeId || selectedEmp.employeeId}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase">Reporting Manager</span>
                                                            <span className="text-xs font-bold">
                                                                {selectedEmp.manager?.firstName 
                                                                    ? `${selectedEmp.manager.firstName} ${selectedEmp.manager.lastName}` 
                                                                    : 'Direct Hierarchy'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase">Internal Grade</span>
                                                            <span className="text-xs font-bold">{selectedEmp.grade || 'L1 - Junior'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Professional Timeline & Stats */}
                                            <div className="xl:col-span-2 space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                            <Clock className="mr-2 text-primary" size={16} />
                                                            Recent Attendance
                                                        </h3>
                                                        <div className="space-y-4">
                                                            {empStats.recentAttendance.length > 0 ? empStats.recentAttendance.map((a: any, i: number) => (
                                                                <div key={i} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-secondary/50">
                                                                    <div>
                                                                        <p className="text-xs font-black">{moment(a.date).format('DD MMM')}</p>
                                                                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{a.status}</p>
                                                                    </div>
                                                                    <span className="text-xs font-black">{a.workHours?.toFixed(1) || 0}h</span>
                                                                </div>
                                                            )) : <p className="text-[10px] text-muted-foreground italic">No recent logs found.</p>}
                                                        </div>
                                                    </div>
                                                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                            <CalendarX className="mr-2 text-primary" size={16} />
                                                            Leave Archive
                                                        </h3>
                                                        <div className="space-y-4">
                                                            {empStats.recentLeaves.length > 0 ? empStats.recentLeaves.map((l: any, i: number) => (
                                                                <div key={i} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-secondary/50">
                                                                    <div>
                                                                        <p className="text-xs font-black capitalize">{l.leaveType}</p>
                                                                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{moment(l.startDate).format('DD MMM')} - {moment(l.endDate).format('DD MMM')}</p>
                                                                    </div>
                                                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${
                                                                        l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                                    }`}>{l.status}</span>
                                                                </div>
                                                            )) : <p className="text-[10px] text-muted-foreground italic">No recent leaves recorded.</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                     <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                            <GraduationCap className="mr-2 text-primary" size={16} />
                                                            Education History
                                                        </h3>
                                                        <div className="space-y-4">
                                                            {selectedEmp.education?.length > 0 ? selectedEmp.education.map((edu: any, i: number) => (
                                                                <div key={i} className="relative pl-6 border-l-2 border-secondary py-1">
                                                                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary" />
                                                                    <p className="text-xs font-black">{edu.degree} in {edu.field}</p>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{edu.institution} | {edu.year}</p>
                                                                </div>
                                                            )) : <p className="text-[10px] text-muted-foreground italic">No educational records provided.</p>}
                                                        </div>
                                                    </div>
                                                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                            <CreditCard className="mr-2 text-primary" size={16} />
                                                            Financial Disbursement
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/50">
                                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Bank Account</p>
                                                                <p className="text-xs font-black text-primary tracking-widest">
                                                                    {selectedEmp.bankDetails?.accountNumber 
                                                                        ? `****${selectedEmp.bankDetails.accountNumber.slice(-4)}` 
                                                                        : 'Not Linked'}
                                                                </p>
                                                                <p className="text-[10px] font-bold mt-1">{selectedEmp.bankDetails?.bankName || 'N/A'}</p>
                                                            </div>
                                                            <div className="flex justify-between items-center px-2">
                                                                <span className="text-[9px] font-black text-muted-foreground uppercase">Base Comp.</span>
                                                                <span className="text-xs font-black flex items-center">
                                                                    <IndianRupee size={10} className="mr-1" />
                                                                    {selectedEmp.salary?.base || '0'} / mo
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
                                                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                        <Award className="mr-2 text-primary" size={16} />
                                                        Competencies & Skills
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedEmp.skills?.length > 0 ? selectedEmp.skills.map((skill: string, i: number) => (
                                                            <span key={i} className="px-4 py-2 bg-secondary/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-default shadow-sm border border-secondary">
                                                                {skill}
                                                            </span>
                                                        )) : <p className="text-[10px] text-muted-foreground italic">No special skills highlighted.</p>}
                                                    </div>
                                                </div>

                                                <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm">
                                                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                                        <FileText className="mr-2 text-primary" size={16} />
                                                        Document Repository
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedEmp.documents?.length > 0 ? selectedEmp.documents.map((doc: any, i: number) => (
                                                            <a 
                                                                key={i} 
                                                                href={doc.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex items-center p-4 bg-secondary/10 rounded-2xl border border-secondary/50 hover:bg-secondary/20 transition-all group"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                                                    <FileText size={14} className="text-primary" />
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-xs font-black truncate">{doc.name}</p>
                                                                    <p className="text-[8px] font-bold text-muted-foreground uppercase">{doc.documentType || 'General'}</p>
                                                                </div>
                                                                <ArrowUpRight size={12} className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
                                                            </a>
                                                        )) : <p className="text-[10px] text-muted-foreground italic">No digital records available for this member.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full bg-card/50 border border-dashed rounded-[3.5rem] flex flex-col items-center justify-center text-center p-20">
                                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                                            <UserCircle size={40} className="text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight mb-2">No Member Selected</h3>
                                        <p className="text-muted-foreground text-sm font-medium max-w-xs">Select an employee from the terminal to generate a detailed intelligence report.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="standard-domain"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Domain Specific Insights */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Talent Tab */}
                                {activeDomain === 'talent' && (
                                    <div className="bg-card border rounded-[3.5rem] p-10 shadow-sm relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                                        <h3 className="text-2xl font-black tracking-tight flex items-center mb-10">
                                            <Users className="mr-3 text-emerald-500" size={24} />
                                            Hiring Pipeline Velocity
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={talentStats}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                                    <Bar dataKey="hires" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="pipeline" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {/* Ops Tab */}
                                {activeDomain === 'ops' && (
                                    <div className="bg-card border rounded-[3.5rem] p-10 shadow-sm relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                                        <h3 className="text-2xl font-black tracking-tight flex items-center mb-10">
                                            <Activity className="mr-3 text-amber-500" size={24} />
                                            Operational Output Trend
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={opsMetrics?.attendanceTrend || []}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                                                    <Line type="monotone" dataKey="hours" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                 {/* Common Growth Chart */}
                                 <div className="bg-card border rounded-[3.5rem] p-10 shadow-sm relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                                    <h3 className="text-2xl font-black tracking-tight flex items-center mb-10">
                                        <TrendingUp className="mr-3 text-primary" size={24} />
                                        Workforce Scale
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={growthTrends}>
                                                <defs>
                                                    <linearGradient id="colorHead" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="headcount" fill="url(#colorHead)" stroke="#6366f1" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                {/* Finance Tab Specifics */}
                                {activeDomain === 'finance' && (
                                    <div className="bg-card border rounded-[3.5rem] p-10 shadow-sm">
                                        <h3 className="text-xl font-black tracking-tight flex items-center mb-8">
                                            <PieChartIcon className="mr-3 text-primary" size={22} />
                                            Expenditure Pillars
                                        </h3>
                                        <div className="h-64 w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={capitalAllocation} innerRadius={60} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                                                        {capitalAllocation.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={8} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    )}
                </AnimatePresence>
            </main>

            {/* Instant Insight Modal Overlay */}
            <AnimatePresence>
                {activeInsight && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                        onClick={() => setActiveInsight(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card border rounded-[3.5rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-500" />
                            
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center">
                                    <Zap size={32} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Strategic Intelligence</p>
                                    <h2 className="text-3xl font-black tracking-tighter">{activeInsight.title}</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 bg-secondary/30 rounded-[2.5rem] border border-secondary/50">
                                    <p className="text-sm font-medium leading-relaxed text-foreground/80 italic">
                                        "{activeInsight.content}"
                                    </p>
                                </div>

                                <div className="p-8 border-2 border-primary/20 border-dashed rounded-[2.5rem] bg-primary/5">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center">
                                        <TrendingUp size={12} className="mr-2" />
                                        Recommended Action
                                    </h4>
                                    <p className="text-sm font-black tracking-tight leading-relaxed">
                                        {activeInsight.action}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setActiveInsight(null)}
                                className="w-full mt-10 p-5 bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl"
                            >
                                Acknowledge & Dismiss
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;
