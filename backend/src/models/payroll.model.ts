import mongoose, { Schema, Document } from 'mongoose';

export enum PayrollStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

export interface IPayroll extends Document {
    tenantId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    month: number;
    year: number;
    baseSalary: number;
    bonuses: number;
    deductions: number;
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
    status: PayrollStatus;
    processedAt?: Date;
    paidAt?: Date;
    payslipUrl?: string; // Link to generated PDF
    comment?: string;
}

const PayrollSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true, default: 0 },
    bonuses: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    totalEarnings: { type: Number, required: true, default: 0 },
    totalDeductions: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    status: { 
        type: String, 
        enum: Object.values(PayrollStatus), 
        default: PayrollStatus.PENDING 
    },
    processedAt: { type: Date },
    paidAt: { type: Date },
    payslipUrl: { type: String },
    comment: { type: String }
}, { timestamps: true });

// Ensure one payroll per employee per month per tenant
PayrollSchema.index({ tenantId: 1, userId: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayroll>('Payroll', PayrollSchema);
