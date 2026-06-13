import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Download, Search, 
    Plus, ShieldCheck, Clock, 
    FileSignature, Award, Tags, LayoutGrid, List,
    Lock, Upload, X, File, AlertCircle, Trash2, CheckCircle, ExternalLink
} from 'lucide-react';
import moment from 'moment';
import { useAuthStore } from '../store/authStore';
import { documentService } from '../services/documentService';
import { useDropzone } from 'react-dropzone';

const categories = [
    'All', 
    'Identity Documents', 
    'Education Documents', 
    'Employment Documents', 
    'Bank Documents', 
    'Company Documents'
];

const Documents = () => {
    const { user } = useAuthStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isHR = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN';

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = isHR 
                ? await documentService.getAllDocuments() 
                : await documentService.getMyDocuments();
            setDocuments(data || []);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [isHR]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await documentService.deleteDocument(id);
            setDocuments(prev => prev.filter(d => d._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleVerify = async (id: string, status: string) => {
        const remarks = window.prompt(`Enter remarks for ${status}:`);
        try {
            const updated = await documentService.verifyDocument(id, status, remarks || undefined);
            setDocuments(prev => prev.map(d => d._id === id ? updated : d));
        } catch (error) {
            console.error("Verification failed", error);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Document Vault</h1>
                    <p className="text-muted-foreground font-medium">Secure storage and verification hub for all professional records.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search documents..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-secondary/50 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium w-full md:w-64 focus:ring-2 ring-primary/50"
                        />
                    </div>
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Upload New</span>
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 group">
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeCategory === cat 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center bg-secondary/50 p-1 rounded-xl">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}>
                        <LayoutGrid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}>
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Workspace */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Syncing Vault...</p>
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="h-[40vh] flex flex-col items-center justify-center space-y-4 bg-secondary/20 rounded-[3rem] border border-dashed">
                        <AlertCircle className="text-muted-foreground" size={48} />
                        <p className="text-sm font-bold text-muted-foreground">No documents found in this category.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocs.map((doc, i) => (
                            <DocumentCard key={doc._id} doc={doc} index={i} isHR={isHR} onDelete={handleDelete} onVerify={handleVerify} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="bg-card border rounded-[3rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/30">
                                <tr>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Document</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Category</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground">User</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredDocs.map((doc) => (
                                    <DocumentRow key={doc._id} doc={doc} isHR={isHR} onDelete={handleDelete} onVerify={handleVerify} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={fetchDocuments} />
        </div>
    );
};

const DocumentCard = ({ doc, index, isHR, onDelete, onVerify }: any) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-emerald-500/10 text-emerald-500';
            case 'Rejected': return 'bg-rose-500/10 text-rose-500';
            default: return 'bg-amber-500/10 text-amber-500';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border rounded-[2.5rem] p-6 hover:shadow-2xl transition-all group relative flex flex-col"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <FileText size={28} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(doc.status)}`}>
                    {doc.status}
                </div>
            </div>
            
            <h3 className="font-black text-sm mb-1 leading-tight">{doc.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{doc.documentType}</p>
            
            {isHR && doc.userId && (
                <p className="text-[10px] font-bold text-primary mb-4 truncate italic">Owner: {doc.userId.firstName} {doc.userId.lastName}</p>
            )}

            {doc.expiryDate && (
                <p className={`text-[9px] font-bold mb-4 flex items-center ${moment(doc.expiryDate).isBefore(moment()) ? 'text-rose-500' : 'text-muted-foreground'}`}>
                    <AlertCircle size={10} className="mr-1" />
                    Expires: {moment(doc.expiryDate).format('MMM DD, YYYY')}
                </p>
            )}
            
            <div className="flex items-center gap-2 mt-auto pt-6 border-t font-black">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all flex-1 flex items-center justify-center">
                    <ExternalLink size={14} className="mr-2" />
                    <span className="text-[10px] uppercase">View</span>
                </a>
                {isHR ? (
                    <div className="flex gap-1">
                        <button onClick={() => onVerify(doc._id, 'Verified')} className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all">
                            <CheckCircle size={14} />
                        </button>
                        <button onClick={() => onVerify(doc._id, 'Rejected')} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all">
                            <X size={14} />
                        </button>
                        <button onClick={() => onDelete(doc._id)} className="p-2.5 bg-secondary text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ) : (
                    <a href={`${doc.url.replace('/upload/', '/upload/fl_attachment/')}`} download className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all">
                         <Download size={14} />
                    </a>
                )}
            </div>
        </motion.div>
    );
};

const DocumentRow = ({ doc, isHR, onDelete, onVerify }: any) => {
    return (
        <tr className="hover:bg-secondary/5 transition-colors">
            <td className="px-8 py-5">
                <div className="flex items-center space-x-3">
                    <FileText size={18} className="text-primary" />
                    <div>
                        <p className="text-sm font-black">{doc.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{doc.documentType}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground">{doc.category}</td>
            <td className="px-8 py-5 text-sm font-bold">{doc.userId ? `${doc.userId.firstName} ${doc.userId.lastName}` : 'System'}</td>
            <td className="px-8 py-5">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    doc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' :
                    doc.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-amber-500/10 text-amber-500'
                }`}>
                    {doc.status}
                </span>
            </td>
            <td className="px-8 py-5">
                <div className="flex gap-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-lg"><ExternalLink size={14}/></a>
                    {isHR && (
                        <>
                            <button onClick={() => onVerify(doc._id, 'Verified')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle size={14}/></button>
                            <button onClick={() => onVerify(doc._id, 'Rejected')} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><X size={14}/></button>
                            <button onClick={() => onDelete(doc._id)} className="p-2 bg-secondary text-rose-500 rounded-lg"><Trash2 size={14}/></button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

const UploadModal = ({ isOpen, onClose, onUploadSuccess }: any) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Identity Documents',
        documentType: '',
        expiryDate: '',
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.png'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        try {
            setUploading(true);
            const data = new FormData();
            data.append('file', file);
            Object.keys(formData).forEach(key => data.append(key, (formData as any)[key]));

            await documentService.uploadDocument(data, (progressEvent) => {
                const p = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(p);
            });

            onUploadSuccess();
            onClose();
            setFile(null);
            setFormData({ name: '', category: 'Identity Documents', documentType: '', expiryDate: '' });
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border">
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter">Secure Upload</h2>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Add document to your private vault</p>
                        </div>
                        <button onClick={onClose} className="p-4 bg-secondary rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all ${
                            isDragActive ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'
                        }`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center">
                                {file ? (
                                    <>
                                        <FileText size={48} className="text-primary mb-4" />
                                        <p className="font-black text-sm">{file.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                                            <Upload size={32} />
                                        </div>
                                        <p className="font-black text-sm">Drop your file here, or browse</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">PDF, JPG, PNG up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Document Name</label>
                                <input required className="w-full bg-secondary/50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/50" placeholder="e.g., Aadhaar Card Front" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Document Type</label>
                                <input required className="w-full bg-secondary/50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/50" placeholder="e.g., Aadhaar, SSN" value={formData.documentType} onChange={e => setFormData({...formData, documentType: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Category</label>
                                <select className="w-full bg-secondary/50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/50" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Expiry Date (Optional)</label>
                                <input type="date" className="w-full bg-secondary/50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/50" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                            </div>
                        </div>

                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>Uploading to Cloud...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        <button disabled={!file || uploading} className="w-full bg-primary text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs disabled:opacity-50">
                            {uploading ? 'Processing Architecture...' : 'Commit to Vault'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Documents;
