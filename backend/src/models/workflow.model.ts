import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowStep {
    role: string;
    level: number;
    title: string;
}

export interface IWorkflow extends Document {
    name: string;
    tenantId: mongoose.Types.ObjectId;
    trigger: 'LEAVE' | 'EXPENSE' | 'ONBOARDING' | 'ATTENDANCE_CORRECTION';
    steps: IWorkflowStep[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const WorkflowSchema: Schema = new Schema({
    name: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    trigger: { 
        type: String, 
        required: true, 
        enum: ['LEAVE', 'EXPENSE', 'ONBOARDING', 'ATTENDANCE_CORRECTION'] 
    },
    steps: [{
        role: { type: String, required: true }, // e.g. 'MANAGER', 'HR_ADMIN', 'DEPT_HEAD'
        level: { type: Number, required: true },
        title: { type: String, required: true }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure unique trigger per tenant for simplicity in this version
WorkflowSchema.index({ tenantId: 1, trigger: 1 }, { unique: true });

export const Workflow = mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
