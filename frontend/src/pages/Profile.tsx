import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
    ShieldAlert, Landmark, FileUp, Camera, CheckCircle2, 
    Plus, Trash2, Edit3, Save, Globe, ExternalLink, Loader2,
    Calendar, UserCircle, Globe2, Building2, Layers, Verified,
    ShieldCheck, Eye
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useParams } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { documentService } from '../services/documentService';
import toast from 'react-hot-toast';

const TabButton = ({ active, icon: Icon, label, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all relative overflow-hidden ${
            active 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
    >
        <Icon size={20} className={active ? "animate-pulse" : ""} />
        <span className="font-bold text-sm whitespace-nowrap">{label}</span>
        {active && (
            <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/10 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
    </button>
);

const SectionHeader = ({ title, subtitle }: any) => (
    <div className="mb-8">
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
    </div>
);

const InputField = ({ label, icon: Icon, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-3.5 text-muted-foreground/50" size={18} />}
            <input 
                className={`w-full bg-secondary/30 border border-secondary rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-4'} pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm disabled:cursor-not-allowed`}
                {...props}
            />
        </div>
    </div>
);

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuthStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [vaultDocuments, setVaultDocuments] = useState<any[]>([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [profileForm, setProfileForm] = useState<any>({
        phone: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        bankDetails: {
            accountNumber: '',
            ifsc: '',
            bankName: ''
        }
    });

    const isOwnProfile = !id || id === currentUser?._id;

    useEffect(() => {
        fetchProfile();
        if (isOwnProfile) {
            fetchVaultDocuments();
        }
    }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            let profileData;
            if (id && id !== currentUser?._id) {
                profileData = await employeeService.getEmployeeById(id);
            } else {
                profileData = await employeeService.getEmployeeProfile();
            }
            
            if (profileData.userId) {
                const combined = {
                    ...profileData.userId,
                    ...profileData,
                    _id: profileData.userId._id
                };
                setUser(combined);
                setProfileForm({
                    phone: profileData.phone || '',
                    dob: profileData.dob ? profileData.dob.split('T')[0] : '',
                    gender: profileData.gender || 'Other',
                    maritalStatus: profileData.maritalStatus || 'Single',
                    address: {
                        street: profileData.address?.street || '',
                        city: profileData.address?.city || '',
                        state: profileData.address?.state || '',
                        zipCode: profileData.address?.zipCode || '',
                        country: profileData.address?.country || ''
                    },
                    bankDetails: {
                        accountNumber: profileData.bankDetails?.accountNumber || '',
                        ifsc: profileData.bankDetails?.ifsc || '',
                        bankName: profileData.bankDetails?.bankName || ''
                    }
                });
            } else {
                setUser(profileData);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVaultDocuments = async () => {
        try {
            const docs = await documentService.getMyDocuments();
            setVaultDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch vault docs", error);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await employeeService.updateMyProfile(profileForm);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
            fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingDoc(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            formData.append('category', 'Personal');
            formData.append('documentType', 'Other');

            await documentService.uploadDocument(formData);
            toast.success("Document uploaded successfully!");
            fetchVaultDocuments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploadingDoc(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await documentService.deleteDocument(docId);
            toast.success("Document deleted");
            fetchVaultDocuments();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Retrieving Digital Identity...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'professional', label: 'Work & Education', icon: Briefcase },
        { id: 'financial', label: 'Bank & Financial', icon: Landmark },
        { id: 'documents', label: 'Documents', icon: FileUp },
    ];

    return (
        <div className="space-y-8 pb-20">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
            />

            {/* Profile Header Card */}
            <div className="bg-card border rounded-[3rem] p-8 md:p-12 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-secondary p-1 border-4 border-background shadow-xl overflow-hidden group-hover:ring-4 ring-primary/20 transition-all">
                            <img 
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} 
                                alt="Avatar" 
                                className="w-full h-full rounded-[2.25rem]"
                            />
                        </div>
                        <button className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
                            <Camera size={20} />
                        </button>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter">{user?.firstName} {user?.lastName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                                <span className="flex items-center space-x-2 text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                    <Verified size={12} />
                                    <span>{user?.designation?.title || 'Team Member'}</span>
                                </span>
                                <span className="flex items-center space-x-2 text-[10px] font-black uppercase text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                                    <Building2 size={12} />
                                    <span>{user?.department?.name || 'Operations'}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-2 rounded-xl">
                                <Mail size={16} className="text-primary" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-2 rounded-xl">
                                <Landmark size={16} className="text-primary" />
                                <span>{user?.employeeId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        {isOwnProfile && (
                            <button 
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                disabled={saving}
                                className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                    isEditing ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20'
                                } shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50`}
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                                <span>{saving ? 'Saving...' : isEditing ? 'Push Changes' : 'Edit Profile'}</span>
                            </button>
                        )}
                        {isEditing && (
                            <button 
                                onClick={() => { setIsEditing(false); fetchProfile(); }}
                                className="flex items-center justify-center space-x-2 px-8 py-4 bg-secondary text-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-secondary/70 transition-all"
                            >
                                 <span>Discard</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs Sidebar */}
                <aside className="lg:w-64 space-y-2 flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {tabs.map((tab) => (
                        <TabButton 
                            key={tab.id}
                            active={activeTab === tab.id}
                            icon={tab.icon}
                            label={tab.label}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </aside>

                {/* Content Panel */}
                <main className="flex-1 bg-card border rounded-[3rem] p-8 md:p-12 shadow-sm min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'personal' && (
                            <motion.div 
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <SectionHeader title="Personal Information" subtitle="Update your basic identity and contact details." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="First Name" value={user?.firstName} disabled />
                                        <InputField label="Last Name" value={user?.lastName} disabled />
                                        <InputField label="Email Address" icon={Mail} value={user?.email} disabled />
                                        <InputField 
                                            label="Phone Number" 
                                            icon={Phone} 
                                            value={profileForm.phone} 
                                            onChange={(e:any) => setProfileForm({...profileForm, phone: e.target.value})}
                                            disabled={!isEditing} 
                                        />
                                        <InputField 
                                            label="Date of Birth" 
                                            type="date"
                                            value={profileForm.dob} 
                                            onChange={(e:any) => setProfileForm({...profileForm, dob: e.target.value})}
                                            disabled={!isEditing} 
                                        />
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</label>
                                            <select 
                                                value={profileForm.gender}
                                                onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                                                disabled={!isEditing}
                                                className="w-full bg-secondary/30 border border-secondary rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm disabled:cursor-not-allowed appearance-none"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t">
                                    <SectionHeader title="Address Details" subtitle="Your current and permanent residential information." />
                                    <div className="grid grid-cols-1 gap-6">
                                        <InputField 
                                            label="Street Address" 
                                            icon={MapPin} 
                                            value={profileForm.address.street}
                                            onChange={(e:any) => setProfileForm({...profileForm, address: { ...profileForm.address, street: e.target.value }})}
                                            disabled={!isEditing} 
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <InputField 
                                                label="City" 
                                                value={profileForm.address.city}
                                                onChange={(e:any) => setProfileForm({...profileForm, address: { ...profileForm.address, city: e.target.value }})}
                                                disabled={!isEditing} 
                                            />
                                            <InputField 
                                                label="State" 
                                                value={profileForm.address.state}
                                                onChange={(e:any) => setProfileForm({...profileForm, address: { ...profileForm.address, state: e.target.value }})}
                                                disabled={!isEditing} 
                                            />
                                            <InputField 
                                                label="Zip Code" 
                                                value={profileForm.address.zipCode}
                                                onChange={(e:any) => setProfileForm({...profileForm, address: { ...profileForm.address, zipCode: e.target.value }})}
                                                disabled={!isEditing} 
                                            />
                                            <InputField 
                                                label="Country" 
                                                value={profileForm.address.country}
                                                onChange={(e:any) => setProfileForm({...profileForm, address: { ...profileForm.address, country: e.target.value }})}
                                                disabled={!isEditing} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'professional' && (
                            <motion.div 
                                key="professional"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <SectionHeader title="Employment Node" subtitle="Official organizational placement and reporting lines." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-secondary/20 p-8 rounded-[2.5rem] border flex items-center space-x-6">
                                             <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                                 <Building2 size={32} />
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Department</p>
                                                 <p className="text-xl font-black">{user?.department?.name || 'Unassigned'}</p>
                                             </div>
                                        </div>
                                        <div className="bg-secondary/20 p-8 rounded-[2.5rem] border flex items-center space-x-6">
                                             <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                                                 <Layers size={32} />
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Designation</p>
                                                 <p className="text-xl font-black">{user?.designation?.title || 'Global Member'}</p>
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t">
                                    <SectionHeader title="Verification Status" subtitle="Compliance and authentication tracers." />
                                    <div className="flex flex-wrap gap-4">
                                         <div className="flex items-center space-x-3 px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                                             <CheckCircle2 size={18} />
                                             <span className="text-xs font-black uppercase">Active Registry</span>
                                         </div>
                                         <div className="flex items-center space-x-3 px-6 py-3 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20">
                                             <ShieldCheck size={18} />
                                             <span className="text-xs font-black uppercase">Identity Verified</span>
                                         </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'financial' && (
                            <motion.div 
                                key="financial"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <SectionHeader title="Bank Details" subtitle="Primary account for salary disbursement." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField 
                                            label="Bank Name" 
                                            icon={Landmark} 
                                            value={profileForm.bankDetails.bankName}
                                            onChange={(e:any) => setProfileForm({...profileForm, bankDetails: { ...profileForm.bankDetails, bankName: e.target.value }})}
                                            placeholder="Standard Chartered" 
                                            disabled={!isEditing} 
                                        />
                                        <InputField 
                                            label="Account Number" 
                                            value={profileForm.bankDetails.accountNumber}
                                            onChange={(e:any) => setProfileForm({...profileForm, bankDetails: { ...profileForm.bankDetails, accountNumber: e.target.value }})}
                                            placeholder="0000 1234 5678" 
                                            disabled={!isEditing} 
                                        />
                                        <InputField 
                                            label="IFSC / Swift Code" 
                                            value={profileForm.bankDetails.ifsc}
                                            onChange={(e:any) => setProfileForm({...profileForm, bankDetails: { ...profileForm.bankDetails, ifsc: e.target.value }})}
                                            placeholder="STRA000123" 
                                            disabled={!isEditing} 
                                        />
                                    </div>
                                </div>
                                
                                <div className="bg-amber-500/5 p-8 rounded-[2.5rem] border border-amber-500/10 flex items-start space-x-5">
                                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black mb-1 text-amber-600 uppercase tracking-tight">Security Protocol</p>
                                        <p className="text-xs font-medium text-amber-700/70 leading-relaxed">
                                            Banking changes require multi-factor authentication and will take 24-48 hours to be reflected in the system registry. 
                                            Ensure all details are accurate to avoid disbursement delays.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'documents' && (
                            <motion.div 
                                key="documents"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <SectionHeader title="Digital Vault" subtitle="Upload and manage your essential documents." />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(vaultDocuments || []).length > 0 ? (
                                        vaultDocuments.map((doc: any, i: number) => (
                                            <div key={i} className="bg-secondary/20 p-6 rounded-[2rem] border border-secondary group">
                                                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                                    <FileUp size={24} />
                                                </div>
                                                <h4 className="font-black text-sm mb-1 truncate">{doc.name}</h4>
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{doc.fileType || 'Document'}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground opacity-50">• {doc.fileSize}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex space-x-2">
                                                        <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 bg-primary text-white rounded-lg hover:scale-110 transition-transform">
                                                            <Eye size={14} />
                                                        </a>
                                                        <button 
                                                            onClick={() => handleDeleteDoc(doc._id)}
                                                            className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${
                                                        doc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="lg:col-span-3 py-20 flex flex-col items-center justify-center bg-secondary/10 border-2 border-dashed border-secondary/50 rounded-[3rem]">
                                             <FileUp size={48} className="text-muted-foreground/30 mb-4" />
                                             <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">No documents in vault</p>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingDoc}
                                        className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center p-10 hover:bg-primary/10 transition-all group disabled:opacity-50"
                                    >
                                        <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 shadow-lg transition-transform">
                                            {uploadingDoc ? <Loader2 className="animate-spin" size={28} /> : <Plus size={28} />}
                                        </div>
                                        <span className="text-xs font-black uppercase text-primary tracking-widest">
                                            {uploadingDoc ? 'Uploading...' : 'Add New Document'}
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Profile;
