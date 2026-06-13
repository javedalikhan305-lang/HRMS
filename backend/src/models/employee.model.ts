import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    
    // Personal Info
    dob: Date;
    gender: 'Male' | 'Female' | 'Other';
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    nationality: string;
    
    // Contact
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    
    // Employment info
    joiningDate: Date;
    department: mongoose.Types.ObjectId;
    designation: mongoose.Types.ObjectId;
    grade: string;
    shift: mongoose.Types.ObjectId;
    manager: mongoose.Types.ObjectId;
    
    // Bank Details
    bankDetails: {
        accountNumber: string;
        ifsc: string;
        bankName: string;
    };
    
    // Professional
    skills: string[];
    experience: Array<{
        company: string;
        position: string;
        duration: string;
        description: string;
    }>;
    education: Array<{
        institution: string;
        degree: string;
        field: string;
        year: number;
    }>;
    certifications: Array<{
        name: string;
        issuedBy: string;
        year: number;
    }>;
    
    // Documents
    documents: Array<{
        name: string;
        url: string;
        type: string; // Aadhaar, PAN, Resume, etc.
    }>;
    
    // Salary Info
    salary: {
        base: number;
        allowances: Array<{ name: string; amount: number }>;
        deductions: Array<{ name: string; amount: number }>;
    };
    currency: string;
}

const EmployeeSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    nationality: { type: String },
    
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    
    joiningDate: { type: Date },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: Schema.Types.ObjectId, ref: 'Designation' },
    grade: { type: String },
    shift: { type: Schema.Types.ObjectId, ref: 'Shift' },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    
    bankDetails: {
        accountNumber: { type: String },
        ifsc: { type: String },
        bankName: { type: String }
    },
    
    skills: [{ type: String }],
    experience: [{
        company: { type: String },
        position: { type: String },
        duration: { type: String },
        description: { type: String }
    }],
    education: [{
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        year: { type: Number }
    }],
    certifications: [{
        name: { type: String },
        issuedBy: { type: String },
        year: { type: Number }
    }],
    
    documents: [{
        name: { type: String },
        url: { type: String },
        documentType: { type: String }
    }],

    salary: {
        base: { type: Number, default: 0 },
        allowances: [{
            name: { type: String },
            amount: { type: Number, default: 0 }
        }],
        deductions: [{
            name: { type: String },
            amount: { type: Number, default: 0 }
        }]
    },
    currency: { type: String, default: 'USD' }
}, { timestamps: true });

EmployeeSchema.index({ tenantId: 1, userId: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
