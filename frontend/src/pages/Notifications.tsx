import { Bell, CheckCircle2, AlertCircle, Archive, Trash2, ShieldCheck, Zap, MoreHorizontal, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import moment from 'moment';

const Notifications = () => {
    // We'll fetch notifications or show 'Clear' state
    const { data: notifications, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            try {
                const res = await api.get('/notifications');
                return res.data.data;
            } catch (err) {
                return [];
            }
        }
    });

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            refetch();
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            refetch();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            refetch();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">Activity Stream</h1>
                    <p className="text-muted-foreground font-medium mt-1">Institutional broadcast and personal event audit.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center space-x-2 px-6 py-3 bg-secondary/50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all">
                        <Filter size={14} />
                        <span>Filter</span>
                    </button>
                    <button 
                        onClick={markAllRead}
                        className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                    >
                        Mark All Read
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-4">
                    {isLoading ? (
                        <div className="bg-card border rounded-[3rem] p-32 text-center flex flex-col items-center">
                            <Loader2 size={48} className="animate-spin text-primary mb-6" />
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">Synchronizing stream...</p>
                        </div>
                    ) : (notifications?.length > 0) ? (
                        <div className="bg-card border rounded-[3.5rem] overflow-hidden shadow-sm divide-y divide-secondary/30">
                            {notifications.map((n: any, i: number) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={n._id} 
                                    className={`p-10 hover:bg-secondary/5 transition-all flex items-start space-x-8 group relative ${!n.isRead ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary' : ''}`}
                                >
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner ${
                                        n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                        n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                        n.type === 'error' ? 'bg-rose-500/10 text-rose-500' :
                                        'bg-primary/10 text-primary'
                                    }`}>
                                        {n.type === 'success' ? <CheckCircle2 size={28} /> :
                                         n.type === 'warning' ? <AlertCircle size={28} /> :
                                         <Bell size={28} />}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`text-xl tracking-tight leading-none ${!n.isRead ? 'font-black' : 'font-bold opacity-80'}`}>{n.title}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{moment(n.createdAt).fromNow()}</span>
                                        </div>
                                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-2xl">{n.message}</p>
                                    </div>
                                    <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        {!n.isRead && (
                                            <button 
                                                onClick={() => markAsRead(n._id)}
                                                className="p-3 bg-secondary/50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                                title="Mark as Read"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteNotification(n._id)}
                                            className="p-3 bg-secondary/50 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border rounded-[4rem] p-32 text-center flex flex-col items-center shadow-sm"
                        >
                            <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-8 relative">
                                <Bell size={40} className="text-muted-foreground opacity-30" />
                                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter mb-2">Workspace Synchronized</h2>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm">Your activity stream is currently clear. We'll alert you to system events as they occur.</p>
                            <button className="mt-10 px-8 py-4 bg-secondary text-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary/70 transition-all">
                                Refresh Stream
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-8">
                     <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-20 rotate-12 transition-transform group-hover:scale-110">
                            <ShieldCheck size={200} />
                        </div>
                        <h4 className="text-xl font-black mb-4 relative z-10">Broadcast Policy</h4>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-10 relative z-10 leading-loose">Automated notification dispersal rules active for the production tenant.</p>
                        <div className="space-y-3 relative z-10 text-[10px] font-black uppercase">
                             <button className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all px-6">
                                 <span>Distribution Rules</span>
                                 <Zap size={14} className="text-amber-500" />
                             </button>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Notifications;
