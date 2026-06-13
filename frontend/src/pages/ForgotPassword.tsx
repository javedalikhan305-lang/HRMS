import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../utils/api';

const schema = z.object({
    email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/forgot-password', data);
            setIsSent(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl text-white text-center">
                    {!isSent ? (
                        <>
                            <div className="w-16 h-16 bg-primary rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/40 text-white leading-none">
                                <Mail size={32} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Recover Account</h1>
                            <p className="text-white/60 mt-2 mb-8">Enter your work email to receive reset instructions</p>

                            {error && (
                                <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-4 rounded-xl mb-6 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
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

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span>Send Instructions</span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="py-4">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Check Your Inbox</h1>
                            <p className="text-white/60 mt-2 mb-8">We've sent recovery instructions to your email address.</p>
                            
                            <Link 
                                to="/login" 
                                className="inline-flex items-center space-x-2 text-primary font-bold hover:underline"
                            >
                                <ArrowLeft size={16} />
                                <span>Back to Login</span>
                            </Link>
                        </div>
                    )}

                    {!isSent && (
                        <div className="mt-8">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center space-x-2 text-white/60 font-bold hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                <span>Back to Login</span>
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
