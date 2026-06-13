import { useState } from 'react';
import { 
    User, Lock, Bell, Eye, Shield, 
    Moon, Smartphone, LogOut, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminSettings from './AdminSettings';
import { useAuthStore } from '../store/authStore';

const EmployeeSettings = () => {
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [marketingOn, setMarketingOn] = useState(false);

    const sections = [
        { id: 'account', label: 'Account Settings', icon: User },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'display', label: 'Display & UI', icon: Moon },
    ];

    const [activeSection, setActiveSection] = useState('account');

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-4xl font-black tracking-tighter">Account Settings</h1>
                <p className="text-muted-foreground font-medium">Manage your personal account preferences and security settings.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-72 space-y-2">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all ${
                                activeSection === s.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                : 'text-muted-foreground hover:bg-secondary'
                            }`}
                        >
                            <s.icon size={20} />
                            <span className="font-black text-sm">{s.label}</span>
                        </button>
                    ))}
                    <div className="pt-4 mt-4 border-t">
                        <button className="w-full flex items-center space-x-3 px-6 py-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-all">
                            <LogOut size={20} />
                            <span className="font-black text-sm">Sign Out Everywhere</span>
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 bg-card border rounded-[3rem] p-10 md:p-12 shadow-sm min-h-[600px]">
                    {activeSection === 'account' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-6">Profile Settings</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-secondary/20 rounded-3xl border border-secondary">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={32} />
                                            </div>
                                            <div>
                                                <p className="font-black">Profile Visibility</p>
                                                <p className="text-xs text-muted-foreground font-medium">Your profile is currently <span className="text-primary font-bold">Public</span> to other employees.</p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-2.5 bg-background border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all">Change</button>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-secondary/20 rounded-3xl border border-secondary">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Smartphone size={32} />
                                            </div>
                                            <div>
                                                <p className="font-black">Connected Devices</p>
                                                <p className="text-xs text-muted-foreground font-medium">You are logged in on <span className="text-foreground font-bold">3 devices</span>.</p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-2.5 bg-background border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all">Manage</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-6">Security Baseline</h3>
                                <div className="space-y-4">
                                    <button className="w-full flex items-center justify-between p-6 hover:bg-secondary/20 rounded-[2.5rem] transition-all group">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                                                <Lock size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black">Change Password</p>
                                                <p className="text-xs text-muted-foreground">Update your account password regularly.</p>
                                            </div>
                                        </div>
                                        <Eye size={20} className="text-muted-foreground" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-6 hover:bg-secondary/20 rounded-[2.5rem] transition-all group">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl group-hover:scale-110 transition-transform">
                                                <Shield size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black">Multi-Factor Authentication</p>
                                                <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Enabled • Highly Secure</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 size={20} className="text-green-500" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'notifications' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <h3 className="text-2xl font-black tracking-tight mb-2">Push Notifications</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-secondary/10 rounded-3xl border border-secondary/50">
                                    <div>
                                        <p className="font-black">Email Notifications</p>
                                        <p className="text-xs text-muted-foreground font-medium">Receive weekly summaries and important HR updates.</p>
                                    </div>
                                    <button 
                                        onClick={() => setNotificationsOn(!notificationsOn)}
                                        className={`w-14 h-8 rounded-full transition-all relative ${notificationsOn ? 'bg-primary' : 'bg-secondary'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${notificationsOn ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-secondary/10 rounded-3xl border border-secondary/50">
                                    <div>
                                        <p className="font-black">Marketing & Promotions</p>
                                        <p className="text-xs text-muted-foreground font-medium">Updates on new features and partner offers.</p>
                                    </div>
                                    <button 
                                        onClick={() => setMarketingOn(!marketingOn)}
                                        className={`w-14 h-8 rounded-full transition-all relative ${marketingOn ? 'bg-primary' : 'bg-secondary'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${marketingOn ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
};

const Settings = () => {
    const { user } = useAuthStore();
    const isHR = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN';

    if (isHR) return <AdminSettings />;
    return <EmployeeSettings />;
};

export default Settings;
