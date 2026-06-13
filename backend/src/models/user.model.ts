import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    HR_ADMIN = 'HR_ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE'
}

export interface IUser extends Document {
    tenantId: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: UserRole;
    avatar?: string;
    refreshToken?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    employeeId?: string; // Auto-generated internal ID
    createdAt?: Date;
    updatedAt?: Date;
    
    // Auth Methods
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const UserSchema: Schema = new Schema({
    tenantId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true,
        index: true 
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true, 
        trim: true, 
        lowercase: true 
    },
    password: { type: String, select: false },
    role: { 
        type: String, 
        enum: Object.values(UserRole), 
        default: UserRole.EMPLOYEE 
    },
    avatar: { type: String },
    refreshToken: { type: String, select: false },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    employeeId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Compound index for uniqueness of email within a tenant (if needed, but usually email is globally unique across tenants for HRMS SaaS)
// Actually, in many multi-tenant systems, same email could exist in different tenants, but for simplicity we assume global uniqueness or tenant-scoped uniqueness.
// For enterprise grade, we'll go with tenantId + email unique index.
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    if (this.password) {
        this.password = await bcrypt.hash(this.password as string, 10);
    }
});

UserSchema.methods.comparePassword = async function(password: string) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            tenantId: this.tenantId
        },
        env.accessTokenSecret,
        { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || '15m') as any }
    );
};

UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { _id: this._id },
        env.refreshTokenSecret,
        { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as any }
    );
};

export const User = mongoose.model<IUser>('User', UserSchema);
