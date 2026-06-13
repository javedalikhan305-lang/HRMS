import mongoose, { Schema, Document } from 'mongoose';

export enum DocumentCategory {
    IDENTITY = 'Identity Documents',
    EDUCATION = 'Education Documents',
    EMPLOYMENT = 'Employment Documents',
    BANK = 'Bank Documents',
    COMPANY = 'Company Documents'
}

export enum DocumentStatus {
    PENDING = 'Pending',
    VERIFIED = 'Verified',
    REJECTED = 'Rejected'
}

export interface IDocument extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    category: DocumentCategory;
    documentType: string;
    url: string;
    cloudinaryId: string;
    status: DocumentStatus;
    verifiedBy?: mongoose.Types.ObjectId;
    verificationRemarks?: string;
    expiryDate?: Date;
    fileSize?: string;
    fileType?: string;
}

const DocumentSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { 
        type: String, 
        enum: Object.values(DocumentCategory), 
        required: true 
    },
    documentType: { type: String, required: true }, // e.g., Aadhaar, PAN
    url: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    status: { 
        type: String, 
        enum: Object.values(DocumentStatus), 
        default: DocumentStatus.PENDING 
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationRemarks: { type: String },
    expiryDate: { type: Date },
    fileSize: { type: String },
    fileType: { type: String }
}, { timestamps: true });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
