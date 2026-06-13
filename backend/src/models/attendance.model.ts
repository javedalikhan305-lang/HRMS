import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    date: Date;
    punchIn?: Date;
    punchOut?: Date;
    status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'Holiday' | 'Weekly Off';
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    ipAddress?: string;
    workHours: number;
    remarks?: string;
    isRegularized: boolean;
}

const AttendanceSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    date: { type: Date, required: true },
    punchIn: { type: Date },
    punchOut: { type: Date },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Half Day', 'Absent', 'Holiday', 'Weekly Off'],
        default: 'Absent'
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    ipAddress: { type: String },
    workHours: { type: Number, default: 0 },
    remarks: { type: String },
    isRegularized: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure one attendance record per user per day per tenant
AttendanceSchema.index({ userId: 1, date: 1, tenantId: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
