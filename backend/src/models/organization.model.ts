import mongoose, { Schema, Document } from 'mongoose';

// Department Schema
export interface IDepartment extends Document {
    name: string;
    description?: string;
    tenantId: mongoose.Types.ObjectId;
    managerId?: mongoose.Types.ObjectId;
    parentDeptId?: mongoose.Types.ObjectId;
    isActive: boolean;
}

const DepartmentSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
    parentDeptId: { type: Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

DepartmentSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Designation Schema
export interface IDesignation extends Document {
    title: string;
    description?: string;
    tenantId: mongoose.Types.ObjectId;
    grade?: string;
    isActive: boolean;
}

const DesignationSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    grade: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

DesignationSchema.index({ tenantId: 1, title: 1 }, { unique: true });

// Shift Schema
export interface IShift extends Document {
    name: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    tenantId: mongoose.Types.ObjectId;
    gracePeriod: number; // minutes
    isOvernight: boolean;
}

const ShiftSchema: Schema = new Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    gracePeriod: { type: Number, default: 0 },
    isOvernight: { type: Boolean, default: false }
}, { timestamps: true });

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
export const Designation = mongoose.model<IDesignation>('Designation', DesignationSchema);
export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
