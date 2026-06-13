import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, ArrowRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../utils/api';

const registerSchema = z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    adminEmail: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/register-tenant', data);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-6">
            {/* Abstract Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
            >
                {/* Visual Side */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/20 to-transparent border-r border-white/5">
                    <div>
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                            <Building2 className="text-white" size={24} />
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight mb-4">
                            Start your enterprise <br />
                            <span className="text-primary italic">journey</span> today.
                        </h2>
                        <p className="text-white/40 font-medium leading-relaxed">
                            Join thousands of organizations scaling their people operations with our isolated multi-tenant architecture.
                        </p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                <Zap size={20} />
                            </div>
                            <p className="text-sm font-bold text-white/80">99.9% Infrastructure Uptime</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                <Building2 size={20} />
                            </div>
                            <p className="text-sm font-bold text-white/80">SOC2 Type II Compliant</p>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-12">
                    <div className="mb-10">
                        <h1 className="text-2xl font-black text-white mb-2">Create Workspace</h1>
                        <p className="text-white/40 text-sm font-medium">Set up your administrative environment</p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-2xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Organization</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-3.5 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    {...register('name')}
                                    placeholder="Company Name" 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                />
                            </div>
                            {errors.name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">First Name</label>
                                <input 
                                    {...register('firstName')}
                                    placeholder="John" 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-white placeholder:text-white/10 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                />
                                {errors.firstName && <p className="text-[10px] text-destructive font-bold ml-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Last Name</label>
                                <input 
                                    {...register('lastName')}
                                    placeholder="Doe" 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-white placeholder:text-white/10 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                />
                                {errors.lastName && <p className="text-[10px] text-destructive font-bold ml-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    {...register('adminEmail')}
                                    type="email"
                                    placeholder="admin@enterprise.com" 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                />
                            </div>
                            {errors.adminEmail && <p className="text-[10px] text-destructive font-bold ml-1">{errors.adminEmail.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    {...register('password')}
                                    type="password"
                                    placeholder="••••••••" 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                />
                            </div>
                            {errors.password && <p className="text-[10px] text-destructive font-bold ml-1">{errors.password.message}</p>}
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-center space-x-3 transition-all transform active:scale-95 text-xs uppercase tracking-widest mt-6"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Deploy Workspace</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-xs font-bold text-white/20 uppercase tracking-widest">
                        Scale better? <Link to="/login" className="text-primary hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
