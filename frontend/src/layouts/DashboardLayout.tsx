import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Clock, Calendar, Building2, FileText,
    Settings, LogOut, Menu, Bell, Moon, Sun, Wallet, X, ChevronRight,
    FolderOpen, UserCircle, Search, Zap, ShieldCheck, 
    Activity, UserPlus, GitBranch, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../services/tenantService';
import api from '../utils/api';
import moment from 'moment';

const SidebarItem = ({ icon: Icon, label, to, active, badge, collapsed }: any) => (
    <Link to={to}>
        <motion.div
            whileHover={{ x: collapsed ? 0 : 4 }}
            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                active 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
        >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span className="font-medium text-[13px] truncate">{label}</span>}
            {!collapsed && badge && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge}
                </span>
            )}
            {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999]">
                    {label}
                </div>
            )}
        </motion.div>
    </Link>
);

const SidebarSection = ({ title, children, collapsed }: any) => (
    <div className="mb-4">
        {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 px-3 mb-2">{title}</p>
        )}
        <div className="space-y-1">{children}</div>
    </div>
);

const DashboardLayout = () => {
    const [isMobileSidebar, setMobileSidebar] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isDarkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const isHR = user?.role === 'HR_ADMIN';

    const hrMenuSections = [
        {
            title: 'Governance',
            items: [
                { icon: LayoutDashboard, label: 'Super Dashboard', to: '/dashboard' },
                { icon: UserPlus, label: 'Register User', to: '/dashboard/register-user' },
                { icon: ShieldCheck, label: 'Access & Roles', to: '/dashboard/roles' },
            ]

        },
        {
            title: 'Talent Lifecycle',
            items: [
                { icon: Users, label: 'Staff Directory', to: '/dashboard/employees' },
                { icon: UserPlus, label: 'Onboarding', to: '/dashboard/onboarding' },
                { icon: Building2, label: 'Org Chart', to: '/dashboard/org' },
            ]
        },
        {
            title: 'Core HR',
            items: [
                { icon: Clock, label: 'Time Tracking', to: '/dashboard/attendance' },
                { icon: Calendar, label: 'Leave Master', to: '/dashboard/leave' },
                { icon: GitBranch, label: 'Workflows', to: '/dashboard/workflows' },
            ]
        },
        {
            title: 'Intelligence',
            items: [
                { icon: FileText, label: 'Report Engine', to: '/dashboard/reports' },
                { icon: Bell, label: 'Notifications', to: '/dashboard/notifications' },
            ]
        },
        {
            title: 'System',
            items: [
                { icon: Settings, label: 'Tenant Config', to: '/dashboard/settings' },
            ]
        },
    ];

    const essMenuSections = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
            ]
        },
        {
            title: 'People',
            items: [
                { icon: Users, label: 'Employee Directory', to: '/dashboard/employees' },
                { icon: Building2, label: 'Org Chart', to: '/dashboard/org' },
            ]
        },
        {
            title: 'My Work',
            items: [
                { icon: Clock, label: 'Attendance', to: '/dashboard/attendance' },
                { icon: Calendar, label: 'Leave', to: '/dashboard/leave' },
            ]
        },
        {
            title: 'Finance & Documents',
            items: [
                { icon: FolderOpen, label: 'Documents', to: '/dashboard/documents' },
            ]
        },
        {
            title: 'Insights',
            items: [
                { icon: FileText, label: 'My Reports', to: '/dashboard/reports' },
            ]
        },
        {
            title: 'Account',
            items: [
                { icon: UserCircle, label: 'My Profile', to: '/dashboard/profile' },
                { icon: Bell, label: 'Notifications', to: '/dashboard/notifications' },
                { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
            ]
        },
    ];

    const mssMenuSections = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
            ]
        },
        {
            title: 'Team Management',
            items: [
                { icon: Users, label: 'My Team', to: '/dashboard/team' },
                { icon: Zap, label: 'Approvals Hub', to: '/dashboard/approvals' },
                { icon: Building2, label: 'Org Chart', to: '/dashboard/org' },
            ]
        },
        {
            title: 'My Work',
            items: [
                { icon: Clock, label: 'Attendance', to: '/dashboard/attendance' },
                { icon: Calendar, label: 'Leave Center', to: '/dashboard/leave' },
            ]
        },
        {
             title: 'Collaboration',
             items: [
                 { icon: FolderOpen, label: 'Documents', to: '/dashboard/documents' },
             ]
        },
        {
            title: 'Insights',
            items: [
                { icon: FileText, label: 'Team Analytics', to: '/dashboard/reports' },
                { icon: Bell, label: 'Notifications', to: '/dashboard/notifications' },
            ]
        },
        {
            title: 'Account',
            items: [
                { icon: UserCircle, label: 'Settings', to: '/dashboard/profile' },
            ]
        },
    ];

    const isManager = user?.role === 'MANAGER';
    const menuSections = isHR ? hrMenuSections : (isManager ? mssMenuSections : essMenuSections);

    const toggleDarkMode = () => {
        setDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileSidebar(false);
    }, [location.pathname]);

    // Apply Tenant Theme Color
    const { data: tenant } = useQuery({
        queryKey: ['tenant-config'],
        queryFn: tenantService.getTenantConfig,
        enabled: !!user
    });

    useEffect(() => {
        if (tenant?.themeColor) {
            document.documentElement.style.setProperty('--primary', tenant.themeColor);
            // Also update ring color if needed
            document.documentElement.style.setProperty('--ring', tenant.themeColor);
        }
    }, [tenant]);

    const sidebarWidth = isSidebarCollapsed ? 'w-[72px]' : 'w-64';

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileSidebar && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
                        onClick={() => setMobileSidebar(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[70] ${sidebarWidth} bg-card border-r transition-all duration-300 
                ${isMobileSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b shrink-0`}>
                        <Link to="/dashboard" className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-primary-foreground font-black text-sm">H</span>
                            </div>
                            {!isSidebarCollapsed && (
                                <div>
                                    <h1 className="text-base font-black tracking-tight leading-none">HRMS PRO</h1>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Enterprise</p>
                                </div>
                            )}
                        </Link>
                        <button 
                            onClick={() => setMobileSidebar(false)} 
                            className="lg:hidden text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        {menuSections.map((section) => (
                            <SidebarSection key={section.title} title={section.title} collapsed={isSidebarCollapsed}>
                                {section.items.map((item: any) => (
                                    <SidebarItem 
                                        key={item.to} 
                                        {...item}
                                        active={location.pathname === item.to}
                                        collapsed={isSidebarCollapsed}
                                    />
                                ))}
                            </SidebarSection>
                        ))}
                    </nav>

                    {/* User Card */}
                    <div className="border-t p-3 shrink-0">
                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer`}
                            onClick={() => navigate(isHR ? '/dashboard/settings' : '/dashboard/profile')}
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden border shrink-0">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} 
                                    alt="Avatar" 
                                    className="w-full h-full"
                                />
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{user?.role?.replace('_', ' ')}</p>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 mt-1 w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors`}
                        >
                            <LogOut size={18} />
                            {!isSidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-card/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setMobileSidebar(true)} className="lg:hidden text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-lg">
                            <Menu size={22} />
                        </button>
                        <button 
                            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} 
                            className="hidden lg:flex text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
                            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <ChevronRight size={18} className={`transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-secondary/50 rounded-xl px-3 py-2 w-64">
                            <Search size={16} className="text-muted-foreground mr-2" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60"
                            />
                            <kbd className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded text-muted-foreground border">⌘K</kbd>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <NotificationPopover />
                        <div 
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                            onClick={() => navigate(isHR ? '/dashboard/settings' : '/dashboard/profile')}
                        >
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} alt="Avatar" className="w-full h-full" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

const NotificationPopover = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { data: notifications, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/notifications');
            return res.data.data;
        },
        refetchInterval: 30000 // Poll every 30 seconds
    });

    const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

    const markAsRead = async (id: string, e: any) => {
        e.stopPropagation();
        await api.patch(`/notifications/${id}/read`);
        refetch();
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-secondary transition-all relative text-muted-foreground hover:text-foreground"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-card border rounded-[2rem] shadow-2xl z-[101] overflow-hidden"
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h4 className="font-black text-sm uppercase tracking-widest">Activity</h4>
                                {unreadCount > 0 && (
                                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </div>
                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications?.length > 0 ? (
                                    notifications.slice(0, 5).map((n: any) => (
                                        <div 
                                            key={n._id}
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate(n.link || '/dashboard/notifications');
                                            }}
                                            className={`p-4 border-b hover:bg-secondary/50 cursor-pointer transition-colors relative ${!n.isRead ? 'bg-primary/5' : ''}`}
                                        >
                                            {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                            <p className={`text-xs ${!n.isRead ? 'font-black' : 'font-medium'} line-clamp-1`}>{n.title}</p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{n.message}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{moment(n.createdAt).fromNow()}</span>
                                                {!n.isRead && (
                                                    <button 
                                                        onClick={(e) => markAsRead(n._id, e)}
                                                        className="text-[9px] font-black text-primary uppercase hover:underline"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <Bell size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">No activity found</p>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/dashboard/notifications');
                                }}
                                className="w-full p-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-secondary transition-all border-t"
                            >
                                View All Observations
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;

