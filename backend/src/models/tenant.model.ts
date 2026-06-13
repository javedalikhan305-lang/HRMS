import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    name: string;
    domain?: string;
    logo?: string;
    industry?: string;
    currency?: string;
    themeColor?: string;
    isActive: boolean;
    subscriptionPlan: 'free' | 'pro' | 'enterprise';
    adminEmail: string;
    securitySettings: {
        mfaEnabled: boolean;
        passwordComplexity: boolean;
        sessionTimeout: number; // in hours
        ipWhitelist: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    domain: { type: String, unique: true, sparse: true },
    logo: { type: String },
    industry: { type: String, default: 'General' },
    currency: { type: String, default: 'USD' },
    themeColor: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    adminEmail: { type: String, required: true, unique: true },
    securitySettings: {
        mfaEnabled: { type: Boolean, default: false },
        passwordComplexity: { type: Boolean, default: true },
        sessionTimeout: { type: Number, default: 24 },
        ipWhitelist: [{ type: String }]
    }
}, { timestamps: true });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
