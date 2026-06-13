import { useState, useEffect } from 'react';
import { 
    Wallet, Download, FileText, TrendingUp, 
    PieChart, Info, 
    Calendar, CheckCircle2, Loader2,
    IndianRupee, ChevronDown
} from 'lucide-react';
import moment from 'moment';
import { payrollService } from '../services/payrollService';
import { jsPDF } from 'jspdf';

const Payroll = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [allPayrolls, setAllPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const availableYears = [
        currentYear.toString(),
        (currentYear - 1).toString(),
        (currentYear - 2).toString()
    ];

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const data = await payrollService.getMyPayrolls();
            setAllPayrolls(data || []);
        } catch (error) {
            console.error("Failed to fetch payrolls", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtered payrolls based on selected year
    const filteredPayrolls = allPayrolls.filter(p => p.year.toString() === selectedYear);
    
    // Sort by month (latest first)
    const sortedPayrolls = [...filteredPayrolls].sort((a, b) => b.month - a.month);
    
    const latestPayroll = sortedPayrolls.length > 0 ? sortedPayrolls[0] : null;

    const downloadPayslip = (payroll: any) => {
        const doc = new jsPDF();
        
        // Add styling and content to PDF
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text('HRMS PRO - PAYSLIP', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Transaction ID: ${payroll._id}`, 20, 30);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Month/Year: ${moment().month(payroll.month-1).format('MMMM')} ${payroll.year}`, 20, 45);
        doc.text(`Payment Status: ${payroll.status}`, 20, 52);
        doc.text(`Generated On: ${moment().format('MMM DD, YYYY')}`, 150, 45, { align: 'right' });
        
        doc.setDrawColor(203, 213, 225); // Slate-300
        doc.setLineWidth(0.5);
        doc.line(20, 60, 190, 60);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Earnings Description', 20, 75);
        doc.text('Amount (INR)', 150, 75);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Basic Component', 20, 85);
        doc.text(`Rs. ${(payroll.baseSalary || 0).toLocaleString()}`, 150, 85);
        
        doc.text('Bonus & Incentives', 20, 95);
        doc.text(`Rs. ${(payroll.bonuses || 0).toLocaleString()}`, 150, 95);
        
        doc.setDrawColor(241, 245, 249);
        doc.line(20, 105, 190, 105);
        
        doc.text('Statutory Deductions', 20, 115);
        doc.setTextColor(220, 38, 38); // Rose-600
        doc.text(`- Rs. ${(payroll.totalDeductions || 0).toLocaleString()}`, 150, 115);
        
        doc.setTextColor(0);
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.line(20, 125, 190, 125);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL NET PAYABLE', 20, 140);
        doc.text(`Rs. ${(payroll.netSalary || 0).toLocaleString()}`, 150, 140);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text('This is a digitally signed computer-generated document and and does not require a physical signature.', 105, 200, { align: 'center' });

        doc.save(`Payslip_${payroll.month}_${payroll.year}.pdf`);
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Payroll Center</h1>
                    <p className="text-muted-foreground font-medium">Manage your earnings, taxes, and download official payslips.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none bg-card border-2 border-secondary px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-4 ring-primary/20 transition-all cursor-pointer min-w-[140px]"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year} Registry</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                    </div>
                    <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2">
                        <Download size={18} />
                        <span>Annual Summary</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="relative">
                        <Loader2 className="animate-spin text-primary" size={56} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <IndianRupee size={18} className="text-primary/40" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Synchronizing Ledger...</p>
                </div>
            ) : (
                <>
                    {/* Salary Breakdown Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-black rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 -mr-12 -mt-12 group-hover:scale-110 transition-transform">
                                <IndianRupee size={300} />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary">
                                        Latest Net Disbursement ({latestPayroll ? moment().month(latestPayroll.month - 1).format('MMMM') : 'N/A'})
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <IndianRupee size={48} className="text-white" />
                                        <h2 className="text-6xl font-black tracking-tighter">
                                            {latestPayroll?.netSalary?.toLocaleString() || '0.00'}
                                        </h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-4 border-t border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Gross Earnings</p>
                                        <p className="text-xl font-black flex items-center"><IndianRupee size={14} className="mr-1 opacity-50" /> {latestPayroll?.totalEarnings?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Statutory Deductions</p>
                                        <p className="text-xl font-black text-rose-400 flex items-center">- <IndianRupee size={14} className="mx-1 opacity-50" /> {latestPayroll?.totalDeductions?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="hidden md:block space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Tax Withholding</p>
                                        <p className="text-xl font-black flex items-center"><IndianRupee size={14} className="mr-1 opacity-50" /> 0.00</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {latestPayroll && (
                                        <button 
                                            onClick={() => downloadPayslip(latestPayroll)}
                                            className="bg-primary/20 hover:bg-primary/40 border border-primary/30 px-8 py-4 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <FileText size={18} className="text-primary" />
                                            <span>Generate Digital Payslip</span>
                                        </button>
                                    )}
                                    <button className="bg-white text-black px-8 py-4 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                                        <PieChart size={18} />
                                        <span>Wealth Analysis</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-10 rounded-[3.5rem] border shadow-sm flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black tracking-tight">Yield Velocity</h3>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp size={48} />
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-black tracking-tighter text-emerald-500">+12.5%</p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Growth Forecast Q3</p>
                                </div>
                            </div>
                            <div className="mt-8 p-6 bg-secondary/30 rounded-[2rem] flex items-start space-x-4 border border-secondary/50">
                                <div className="p-3 bg-card rounded-xl text-primary shadow-sm">
                                    <Info size={20} />
                                </div>
                                <p className="text-[10px] font-bold leading-relaxed opacity-70">
                                    System detects an upcoming salary revision scheduled in 45 days. Ensure performance metrics are updated.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-card rounded-[3.5rem] border shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-8 md:p-10 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/5">
                            <h3 className="text-2xl font-black tracking-tight flex items-center">
                                <Calendar className="mr-3 text-primary" size={28} />
                                Payment Ledger
                            </h3>
                            <div className="flex items-center space-x-2 bg-background border rounded-xl px-4 py-2">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Selected Cycle:</span>
                                <span className="text-[10px] font-black text-primary uppercase">{selectedYear}</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary/20 text-left">
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Disbursement Cycle</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Execution Date</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Net Value</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                        <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Tracer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/20 font-medium">
                                    {sortedPayrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-32 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                                                    <Wallet size={48} />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No financial nodes found for {selectedYear}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedPayrolls.map((p, i) => (
                                            <tr key={p._id || i} className="hover:bg-secondary/5 transition-colors group">
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xs shadow-inner">
                                                            {moment().month(p.month-1).format('MMM')}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm">{moment().month(p.month-1).format('MMMM')} {p.year}</p>
                                                            <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest">Base Registry</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 text-xs font-black opacity-40">
                                                    {p.paidAt ? moment(p.paidAt).format('MMM DD, YYYY') : 'WAITING...'}
                                                </td>
                                                <td className="px-10 py-7 font-black text-xl text-right">
                                                    <div className="flex items-center justify-end">
                                                        <IndianRupee size={16} className="mr-1 opacity-20" />
                                                        {(p.netSalary || 0).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className={`flex items-center space-x-2 ${p.status === 'PAID' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'} px-4 py-1.5 rounded-full w-fit border border-current/10`}>
                                                        <CheckCircle2 size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{p.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center space-x-3">
                                                        <button 
                                                            onClick={() => downloadPayslip(p)}
                                                            className="p-3 bg-secondary/50 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"
                                                            title="Secure PDF Export"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                        <button className="p-3 bg-secondary/50 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm" title="Audit View">
                                                            <FileText size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Payroll;
