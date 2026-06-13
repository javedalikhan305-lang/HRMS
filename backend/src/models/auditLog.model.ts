import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    action: string;
    module: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { 
    timestamps: { createdAt: true, updatedAt: false }, // Immutable: no updatedAt
    capped: false // Capped could be used for performance, but we need history
});

// To make it truly "immutable" via Mongoose, we prevent updates in middleware
AuditLogSchema.pre('save', function(next: any) {
    if (!this.isNew) {
        return next(new Error('Audit logs are immutable and cannot be updated.'));
    }
    next();
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
