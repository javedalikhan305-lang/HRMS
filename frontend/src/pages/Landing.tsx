import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground font-black text-xl">H</span>
                </div>
                <span className="text-2xl font-black tracking-tight uppercase">HRMS PRO</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
                <Link to="/login" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
            </div>
            <div className="flex items-center space-x-4">
                <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                    Get Started
                </Link>
            </div>
        </div>
    </nav>
);


const Landing = () => {
    return (
        <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
            <Navbar />

            {/* Hero Section - Exactly 100vh including Navbar */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
                {/* Visual Orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.span 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-primary/10 text-primary px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-10 inline-block border border-primary/20 backdrop-blur-sm"
                        >
                            The Future of Enterprise HR
                        </motion.span>
                        
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-foreground">
                            Scale Your <span className="text-primary italic">People</span><br />
                            Management <span className="text-primary underline decoration-primary/30 underline-offset-8">Better</span>.
                        </h1>
                        
                        <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-14 font-medium leading-relaxed opacity-80 mt-4">
                            The definitive enterprise resource for high-performance teams. 
                            Secure, scalable, and isolated multi-tenant architecture for modern HR operations.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/register" className="w-full sm:w-auto bg-primary text-white px-14 py-7 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all group">
                                <span>Create Workspace</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-14 py-7 rounded-[2.5rem] bg-card/50 backdrop-blur-md text-foreground text-sm font-black uppercase tracking-[0.2em] border border-border hover:bg-secondary/80 transition-all text-center">
                                Access Portal
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Subtle Floating Elements or Grid Background can be added here for 'WOW' factor */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-8 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                    <span>© 2024 HRMS PRO</span>
                    <span className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                    <span>Secure Infrastructure</span>
                    <span className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                    <span>Multi-Tenant Architecture</span>
                </div>
            </main>
        </div>
    );
};

export default Landing;
