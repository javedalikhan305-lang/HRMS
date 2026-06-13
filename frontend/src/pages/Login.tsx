import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Globe, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const [showMfa, setShowMfa] = useState(false);
    const [mfaToken, setMfaToken] = useState<string | null>(null);
    const [mfaCode, setMfaCode] = useState('');

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            
            if (response.data.data.mfaRequired) {
                setShowMfa(true);
                setMfaToken(response.data.data.mfaToken);
                setIsLoading(false);
                return;
            }

            const { user, accessToken } = response.data.data;
            setAuth(user, accessToken);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setIsLoading(false);
        }
    };

    const handleMfaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/verify-mfa', {
                mfaToken,
                code: mfaCode
            });
            const { user, accessToken } = response.data.data;
            setAuth(user, accessToken);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl text-white">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/40">
                            <span className="text-white font-black text-3xl">H</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">HRMS PRO</h1>
                        <p className="text-white/60 mt-2">
                            {showMfa ? 'Verify your identity' : 'Sign in to your organization portal'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-4 rounded-xl mb-6 text-sm font-medium animate-shake text-center">
                            {error}
                        </div>
                    )}

                    {!showMfa ? (
                        <>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-white/40" size={20} />
                                        <input 
                                            {...register('email')}
                                            type="email" 
                                            placeholder="name@company.com" 
                                            className={`w-full bg-white/5 border ${errors.email ? 'border-destructive' : 'border-white/10'} rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/30 text-white`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive-foreground ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-medium">Password</label>
                                        <Link to="/forgot-password" className="text-xs text-primary font-bold hover:underline">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 text-white/40" size={20} />
                                        <input 
                                            {...register('password')}
                                            type="password" 
                                            placeholder="••••••••" 
                                            className={`w-full bg-white/5 border ${errors.password ? 'border-destructive' : 'border-white/10'} rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/30 text-white`}
                                        />
                                    </div>
                                    {errors.password && <p className="text-xs text-destructive-foreground ml-1">{errors.password.message}</p>}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <LogIn size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="text-center mt-8 text-sm text-white/60">
                                Need a workspace? <Link to="/register" className="text-primary font-bold hover:underline">Create Organization</Link>
                            </p>
                        </>
                    ) : (
                        <form onSubmit={handleMfaSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">MFA Verification Code</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-3.5 text-white/40" size={20} />
                                    <input 
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        type="text" 
                                        maxLength={6}
                                        placeholder="000000" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/30 text-white text-center text-2xl tracking-[0.5em] font-black"
                                    />
                                </div>
                                <p className="text-xs text-white/40 text-center">Open your authenticator app to view the code.</p>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || mfaCode.length < 6}
                                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span>Verify & Sign In</span>
                                )}
                            </button>

                            <button 
                                type="button"
                                onClick={() => setShowMfa(false)}
                                className="w-full text-white/60 text-sm font-bold hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
