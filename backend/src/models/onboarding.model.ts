import mongoose, { Schema, Document } from 'mongoose';

export enum OnboardingStatus {
    SENT = 'Sent',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed'
}

export interface IOnboarding extends Document {
    tenantId: mongoose.Types.ObjectId;
    candidateName: string;
    candidateEmail: string;
    designation: mongoose.Types.ObjectId;
    department: mongoose.Types.ObjectId;
    status: OnboardingStatus;
    progress: number;
    joinDate: Date;
    createdBy: mongoose.Types.ObjectId;
}

const OnboardingSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    candidateName: { type: String, required: true, trim: true },
    candidateEmail: { type: String, required: true, trim: true, lowercase: true },
    designation: { type: Schema.Types.ObjectId, ref: 'Designation', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    status: {
        type: String,
        enum: Object.values(OnboardingStatus),
        default: OnboardingStatus.SENT
    },
    progress: { type: Number, default: 0 },
    joinDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Onboarding = mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);
