import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Shield, Key, Lock, 
    CheckCircle2, AlertCircle, Search, 
    Plus, Edit3, MoreVertical,
    UserCheck, UserMinus, ShieldAlert, Filter, Loader2, X, XCircle
} from 'lucide-react';
import { employeeService } from '../services/employeeService';
import AddEmployeeModal from '../components/AddEmployeeModal';

// ── RBAC Permission Matrix ──────────────────────────────────────────
// Each rule maps to the roles that are granted access
const RBAC_MATRIX: { rule: string; allowedRoles: string[]; description: string }[] = [
    { 
        rule: 'Organization Core Structure', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN'], 
        description: 'Create, edit and delete departments, positions and org hierarchy' 
    },
    { 
        rule: 'Employee Financial Data', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN'], 
        description: 'View and modify salary, bank details and compensation records' 
    },
    { 
        rule: 'Attendance Modification', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'], 
        description: 'Override, correct or approve attendance entries for team members' 
    },
    { 
        rule: 'Payroll Generation', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN'], 
        description: 'Run payroll cycles, generate payslips and manage deductions' 
    },
    { 
        rule: 'Leave Approval', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'], 
        description: 'Approve or reject employee leave requests and manage balances' 
    },
    { 
        rule: 'Employee Onboarding', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN'], 
        description: 'Manage onboarding checklists, document collection and induction' 
    },
    { 
        rule: 'Report Generation', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'], 
        description: 'Generate and export analytical reports on workforce data' 
    },
    { 
        rule: 'System Global Settings', 
        allowedRoles: ['SUPER_ADMIN'], 
        description: 'Configure tenant settings, security policies and system preferences' 
    },
    { 
        rule: 'Self Service Portal', 
        allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'], 
        description: 'Access personal profile, payslips, leave balance and attendance log' 
    },
];

// Role metadata for display
const ROLE_META: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-rose-500' },
    HR_ADMIN:    { label: 'HR Manager',  color: 'bg-indigo-500' },
    MANAGER:     { label: 'Dept Head',   color: 'bg-emerald-500' },
    EMPLOYEE:    { label: 'Employee',    color: 'bg-slate-500' },
};

const UsersRoles = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getAllEmployees();
            setRealUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    // ── Derived counts ──────────────────────────────────────────────
    const roleCounts: Record<string, number> = {
        SUPER_ADMIN: realUsers.filter(u => u.userId?.role === 'SUPER_ADMIN').length,
        HR_ADMIN:    realUsers.filter(u => u.userId?.role === 'HR_ADMIN').length,
        MANAGER:     realUsers.filter(u => u.userId?.role === 'MANAGER').length,
        EMPLOYEE:    realUsers.filter(u => u.userId?.role === 'EMPLOYEE').length,
    };

    // Active user counts per role (for role cards)
    const activeRoleCounts: Record<string, number> = {
        SUPER_ADMIN: realUsers.filter(u => u.userId?.role === 'SUPER_ADMIN' && u.userId?.isActive).length,
        HR_ADMIN:    realUsers.filter(u => u.userId?.role === 'HR_ADMIN' && u.userId?.isActive).length,
        MANAGER:     realUsers.filter(u => u.userId?.role === 'MANAGER' && u.userId?.isActive).length,
        EMPLOYEE:    realUsers.filter(u => u.userId?.role === 'EMPLOYEE' && u.userId?.isActive).length,
    };

    const activeUserCount = realUsers.filter(u => u.userId?.isActive).length;
    const totalUsers = realUsers.length;
    const securityScore = totalUsers > 0 ? Math.round((activeUserCount / totalUsers) * 100) : 0;

    const roles = [
        { id: 1, name: 'Super Admin', users: activeRoleCounts.SUPER_ADMIN, totalUsers: roleCounts.SUPER_ADMIN, access: 'Full System', color: 'bg-rose-500', roleKey: 'SUPER_ADMIN' },
        { id: 2, name: 'HR Manager', users: activeRoleCounts.HR_ADMIN, totalUsers: roleCounts.HR_ADMIN, access: 'Org Management', color: 'bg-indigo-500', roleKey: 'HR_ADMIN' },
        { id: 3, name: 'Department Head', users: activeRoleCounts.MANAGER, totalUsers: roleCounts.MANAGER, access: 'Team Data Only', color: 'bg-emerald-500', roleKey: 'MANAGER' },
        { id: 4, name: 'Employee', users: activeRoleCounts.EMPLOYEE, totalUsers: roleCounts.EMPLOYEE, access: 'Self Service Only', color: 'bg-slate-500', roleKey: 'EMPLOYEE' },
    ];

    // ── Filtered RBAC rules for search ──────────────────────────────
    const filteredRules = RBAC_MATRIX.filter(r =>
        r.rule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.allowedRoles.some(role => ROLE_META[role]?.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Identity & Access</h1>
                    <p className="text-muted-foreground font-medium">Manage user identities, system roles and granular security permissions.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Create {activeTab === 'users' ? 'User' : 'Role'}</span>
                    </button>
                    <button className="p-4 bg-secondary/50 rounded-2xl hover:bg-foreground hover:text-white transition-all shadow-sm">
                        <ShieldAlert size={18} />
                    </button>
                </div>
            </header>

            {/* Hub Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: 'users', label: 'User Directory', count: `${realUsers.length} Registered`, icon: Users },
                    { id: 'roles', label: 'Security Roles', count: `${Object.keys(ROLE_META).length} Standard`, icon: Shield },
                    { id: 'permissions', label: 'Global Rules', count: `${RBAC_MATRIX.length} Active Rules`, icon: Key },
                ].map((hub) => (
                    <button
                        key={hub.id}
                        onClick={() => setActiveTab(hub.id as any)}
                        className={`p-8 rounded-[3rem] border shadow-sm flex items-center space-x-6 transition-all text-left ${
                            activeTab === hub.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-card hover:border-primary/50'
                        }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === hub.id ? 'bg-white/20' : 'bg-secondary'}`}>
                            <hub.icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">{hub.label}</h3>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === hub.id ? 'text-white/60' : 'text-muted-foreground'}`}>{hub.count}</p>
                        </div>
                    </button>
                ))}
            </div>

            <main className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Dynamic Content Area */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-card border rounded-[3rem] p-6 flex items-center justify-between shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3 text-muted-foreground" size={18} />
                            <input 
                                type="text" 
                                placeholder={`Search ${activeTab}...`} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/30 border-none rounded-xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 ring-primary/50"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fetching Identity Data...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'users' ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    {realUsers.filter(u => 
                                        (u.userId?.firstName + ' ' + u.userId?.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.userId?.role?.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((u) => (
                                        <div key={u._id} className="bg-card border rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-14 h-14 rounded-2xl bg-secondary p-0.5 border overflow-hidden">
                                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userId?.firstName}`} alt={u.userId?.firstName} className="w-full h-full rounded-xl" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg">{u.userId?.firstName} {u.userId?.lastName}</h4>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{u.userId?.email}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-lg uppercase">{u.userId?.role}</span>
                                                        <span className="text-[9px] font-bold text-muted-foreground">• {u.userId?.isActive ? 'Active System Node' : 'Inactive'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                 <div className={`px-4 py-1.5 rounded-full flex items-center space-x-2 ${
                                                     u.userId?.isActive ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'
                                                 }`}>
                                                     {u.userId?.isActive ? <UserCheck size={14} /> : <UserMinus size={14} />}
                                                     <span className="text-[10px] font-black uppercase tracking-widest">{u.userId?.isActive ? 'Active' : 'Locked'}</span>
                                                 </div>
                                                 <button className="p-3 bg-secondary text-muted-foreground rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                                                     <Edit3 size={16} />
                                                 </button>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                        ) : activeTab === 'roles' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {roles.map((role) => (
                                    <div key={role.id} className="bg-card border rounded-[3rem] p-8 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 ${role.color} bg-opacity-20 flex items-center justify-center rounded-2xl`}>
                                                <Shield className={role.color.replace('bg-', 'text-')} size={24} />
                                            </div>
                                            <button className="text-muted-foreground hover:text-primary"><Edit3 size={18} /></button>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black tracking-tight">{role.name}</h4>
                                            <p className="text-muted-foreground text-sm font-medium mt-1">Scope: {role.access}</p>
                                            <p className="text-muted-foreground text-xs mt-2">
                                                {RBAC_MATRIX.filter(r => r.allowedRoles.includes(role.roleKey)).length} permissions granted
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-8 pt-6 border-t font-black uppercase tracking-widest text-[10px]">
                                             <span className="text-muted-foreground">{role.users} Active Users</span>
                                             <span className="text-primary hover:underline cursor-pointer">View Rights</span>
                                        </div>
                                    </div>
                                ))}
                                <button className="border-4 border-dashed border-secondary rounded-[3rem] flex flex-col items-center justify-center p-8 text-muted-foreground hover:bg-secondary/30 hover:border-primary/30 transition-all group">
                                     <Plus size={40} className="mb-4 group-hover:scale-110 transition-transform" />
                                     <span className="font-black text-xs uppercase tracking-widest">Create Custom Role</span>
                                </button>
                            </motion.div>
                        ) : (
                                /* ── Global Rules / RBAC Matrix (Data-Driven) ────────── */
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border rounded-[3rem] p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                         <h3 className="text-2xl font-black">RBAC Matrix</h3>
                                         <span className="text-xs font-black text-primary uppercase tracking-widest border-b-2 border-primary">{filteredRules.length} Rules</span>
                                    </div>

                                    {/* Role Legend */}
                                    <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-secondary/20 rounded-2xl border border-secondary">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Legend:</span>
                                        {Object.entries(ROLE_META).map(([key, meta]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full ${meta.color}`} />
                                                <span className="text-[10px] font-bold">{meta.label}</span>
                                                <span className="text-[9px] text-muted-foreground">({roleCounts[key] || 0})</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        {filteredRules.map((perm, i) => {
                                            const deniedRoles = Object.keys(ROLE_META).filter(r => !perm.allowedRoles.includes(r));
                                            return (
                                                <div key={i} className="flex items-center justify-between p-6 bg-secondary/20 rounded-2xl border border-secondary hover:border-primary/20 transition-all cursor-pointer group">
                                                     <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                         <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white shrink-0">
                                                             <CheckCircle2 size={16} />
                                                         </div>
                                                         <div className="min-w-0">
                                                             <span className="text-sm font-bold group-hover:text-primary transition-colors block">{perm.rule}</span>
                                                             <span className="text-[10px] text-muted-foreground block truncate">{perm.description}</span>
                                                         </div>
                                                     </div>
                                                     <div className="flex items-center ml-4 shrink-0">
                                                          {/* Show allowed role dots */}
                                                          <div className="flex items-center -space-x-2">
                                                              {perm.allowedRoles.map(role => (
                                                                  <div 
                                                                      key={role} 
                                                                      className={`w-8 h-8 rounded-full border-2 border-card ${ROLE_META[role]?.color || 'bg-gray-400'} flex items-center justify-center`}
                                                                      title={`${ROLE_META[role]?.label} (${roleCounts[role] || 0} users)`}
                                                                  >
                                                                      <CheckCircle2 size={12} className="text-white" />
                                                                  </div>
                                                              ))}
                                                          </div>
                                                          {/* Show denied role dots */}
                                                          {deniedRoles.length > 0 && (
                                                              <div className="flex items-center -space-x-2 ml-2">
                                                                  {deniedRoles.map(role => (
                                                                      <div 
                                                                          key={role} 
                                                                          className={`w-8 h-8 rounded-full border-2 border-card bg-secondary flex items-center justify-center opacity-40`}
                                                                          title={`${ROLE_META[role]?.label} — No Access`}
                                                                      >
                                                                          <XCircle size={12} className="text-muted-foreground" />
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                          )}
                                                          <span className="ml-4 text-[10px] font-black text-muted-foreground uppercase whitespace-nowrap">
                                                              {perm.allowedRoles.length} / {Object.keys(ROLE_META).length} Roles
                                                          </span>
                                                     </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                        )}
                    </AnimatePresence>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                     <div className="bg-card border rounded-[3rem] p-10 shadow-sm shadow-indigo-500/5">
                         <h4 className="text-sm font-black uppercase tracking-widest mb-8">Security Health</h4>
                         <div className="space-y-8">
                             <div className="flex flex-col items-center">
                                 <div className={`w-40 h-40 rounded-full border-[12px] ${securityScore >= 80 ? 'border-emerald-500/10 border-t-emerald-500' : securityScore >= 50 ? 'border-amber-500/10 border-t-amber-500' : 'border-rose-500/10 border-t-rose-500'} flex items-center justify-center relative`}>
                                      <span className="text-4xl font-black">{securityScore}%</span>
                                      <div className={`absolute -bottom-2 px-3 py-1 ${securityScore >= 80 ? 'bg-emerald-500' : securityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'} text-white text-[9px] font-black rounded-full uppercase`}>
                                          {securityScore >= 80 ? 'Optimal' : securityScore >= 50 ? 'Fair' : 'Critical'}
                                      </div>
                                 </div>
                                 <p className="mt-6 text-center text-xs font-medium text-muted-foreground max-w-[180px]">
                                     {activeUserCount} of {totalUsers} system users are currently active.
                                 </p>
                             </div>
                             <div className="space-y-3 text-xs">
                                 {Object.entries(ROLE_META).map(([key, meta]) => (
                                     <div key={key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                                         <div className="flex items-center space-x-2">
                                             <div className={`w-3 h-3 rounded-full ${meta.color}`} />
                                             <span className="font-bold">{meta.label}</span>
                                         </div>
                                         <span className="font-black text-muted-foreground">{roleCounts[key] || 0}</span>
                                     </div>
                                 ))}
                             </div>
                             <div className="space-y-4">
                                 <button className="w-full py-4 bg-secondary/50 rounded-2xl flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-white transition-all">
                                      <ShieldAlert size={16} />
                                      <span>Security Audit</span>
                                 </button>
                                 <button className="w-full py-4 bg-primary text-white rounded-2xl flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                                      <Key size={16} />
                                      <span>Rotate System Keys</span>
                                 </button>
                             </div>
                         </div>
                     </div>

                     <div className="bg-card border rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                         <div className="absolute -top-10 -right-10 opacity-5 rotate-12 transition-transform group-hover:scale-110">
                              <AlertCircle size={200} />
                         </div>
                         <h4 className="text-sm font-black uppercase tracking-widest mb-6 relative z-10">Critical Alerts</h4>
                         <div className="space-y-6 relative z-10">
                             {realUsers.filter(u => !u.userId?.isActive).length > 0 ? (
                                 realUsers.filter(u => !u.userId?.isActive).slice(0, 3).map((u, i) => (
                                     <div key={i} className="flex items-start space-x-4">
                                          <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 grow-0 shrink-0" />
                                          <div>
                                             <p className="text-sm font-black leading-tight mb-1">Inactive User Detected</p>
                                             <p className="text-[10px] font-bold text-muted-foreground uppercase">{u.userId?.firstName} {u.userId?.lastName}</p>
                                             <p className="text-[9px] font-medium text-primary mt-1">{u.userId?.email}</p>
                                          </div>
                                     </div>
                                 ))
                             ) : (
                                 <div className="flex items-start space-x-4">
                                      <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 grow-0 shrink-0" />
                                      <div>
                                         <p className="text-sm font-black leading-tight mb-1">All Clear</p>
                                         <p className="text-[10px] font-bold text-muted-foreground uppercase">No critical security alerts</p>
                                      </div>
                                 </div>
                             )}
                         </div>
                     </div>
                </div>
            </main>

            <AddEmployeeModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => {
                    loadUsers();
                    setIsAddModalOpen(false);
                }} 
            />
        </div>
    );
};

export default UsersRoles;
