import mongoose, { Schema, Document } from 'mongoose';

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    CANCELLED = 'Cancelled'
}

export interface ILeave extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveStatus;
    appliedDate: Date;
    approvedBy?: mongoose.Types.ObjectId;
    remarks?: string;
    totalDays: number;
    workflowStep: number;
    workflowId?: mongoose.Types.ObjectId;
}

const LeaveSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    leaveType: {
        type: String,
        enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Comp Off', 'LOP'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(LeaveStatus),
        default: LeaveStatus.PENDING
    },
    appliedDate: { type: Date, default: Date.now },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    totalDays: { type: Number, required: true },
    workflowStep: { type: Number, default: 0 },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow' }
}, { timestamps: true });

export const Leave = mongoose.model<ILeave>('Leave', LeaveSchema);

// Leave Balance Schema
export interface ILeaveBalance extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    year: number;
    balances: Array<{
        leaveType: string;
        allotted: number;
        used: number;
    }>;
}

const LeaveBalanceSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    year: { type: Number, required: true },
    balances: [{
        leaveType: { type: String, required: true },
        allotted: { type: Number, default: 0 },
        used: { type: Number, default: 0 }
    }]
});

LeaveBalanceSchema.index({ userId: 1, year: 1, tenantId: 1 }, { unique: true });

export const LeaveBalance = mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);
