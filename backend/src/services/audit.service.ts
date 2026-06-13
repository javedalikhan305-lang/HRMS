import { AuditLog } from '../models/auditLog.model';

export class AuditService {
    static async log(data: {
        userId: string;
        tenantId: string;
        action: string;
        module: string;
        details: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            await AuditLog.create(data);
        } catch (error) {
            console.error("Failed to save audit log:", error);
        }
    }

    static async getLogs(tenantId: string, filters: {
        module?: string;
        action?: string;
        userId?: string;
        search?: string;
        limit?: number;
        page?: number;
    }) {
        const query: any = { tenantId };

        if (filters.module && filters.module !== 'All') {
            query.module = filters.module;
        }

        if (filters.search) {
            query.$or = [
                { action: { $regex: filters.search, $options: 'i' } },
                { details: { $regex: filters.search, $options: 'i' } },
                { ipAddress: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const limit = filters.limit || 50;
        const page = filters.page || 1;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AuditLog.countDocuments(query)
        ]);

        return { logs, total, page, pages: Math.ceil(total / limit) };
    }
}
