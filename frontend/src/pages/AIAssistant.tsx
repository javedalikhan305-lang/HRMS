import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, Send, Trash2, Loader2, Sparkles, 
    User, AlertCircle, Quote, MessageSquare 
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AIAssistant = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const data = await aiService.chat(userMessage.content);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to get response from AI. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                            <Bot className="text-white" size={32} />
                        </div>
                        AI HR Assistant
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Ask about employees, attendance, leaves, and analytics in natural language.
                    </p>
                </div>
                {messages.length > 0 && (
                    <button 
                        onClick={clearChat}
                        className="bg-secondary/50 hover:bg-destructive/10 hover:text-destructive text-muted-foreground p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                    >
                        <Trash2 size={16} />
                        <span>Clear History</span>
                    </button>
                )}
            </header>

            <div className="flex-1 bg-card border rounded-[3rem] shadow-xl shadow-primary/5 flex flex-col overflow-hidden relative">
                {/* Chat Area */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
                >
                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                                    <Sparkles className="text-primary" size={48} />
                                </div>
                                <div className="max-w-md">
                                    <h3 className="text-2xl font-black tracking-tight mb-2">How can I help you today?</h3>
                                    <p className="text-muted-foreground font-medium mb-8">
                                        Try asking things like:
                                    </p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            "How many employees are on leave today?",
                                            "Who joined this month?",
                                            "Find employee named Javed",
                                            "How many people are present today?"
                                        ].map((suggest, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setInput(suggest)}
                                                className="p-4 bg-secondary/50 hover:bg-primary/5 hover:border-primary/30 border border-transparent rounded-2xl text-sm font-bold text-left transition-all group"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <MessageSquare size={16} className="text-primary opacity-50 group-hover:opacity-100" />
                                                    {suggest}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                                            msg.role === 'user' ? 'bg-primary text-white' : 'bg-secondary'
                                        }`}>
                                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                        </div>
                                        <div className={`p-5 rounded-[2rem] ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                                            : 'bg-secondary/50 text-foreground rounded-tl-none border border-secondary'
                                        }`}>
                                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                            <span className={`text-[10px] font-bold mt-2 block opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                </div>
                                <div className="p-5 bg-secondary/50 rounded-[2rem] rounded-tl-none border border-secondary">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center"
                        >
                            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-8 bg-card border-t shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    <div className="max-w-4xl mx-auto flex gap-4">
                        <div className="flex-1 relative group">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me something about HRMS..."
                                className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/30 rounded-[1.5rem] py-5 px-6 outline-none transition-all placeholder:text-muted-foreground/50 font-bold pr-16"
                            />
                            <div className="absolute right-3 top-3 bottom-3 flex items-center px-3 text-muted-foreground/30 pointer-events-none group-focus-within:text-primary/50 transition-colors">
                                <Quote size={20} />
                            </div>
                        </div>
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-primary text-white p-5 rounded-[1.5rem] shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
