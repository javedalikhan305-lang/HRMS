import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { Tenant } from '../models/tenant.model';
import { AuthRequest } from './auth.middleware';

export const verifyTenant = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // If user is authenticated, we use their tenantId
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
        throw new ApiError(403, "Tenant context missing");
    }

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }

    if (!tenant.isActive) {
        throw new ApiError(403, "Tenant account is deactivated");
    }

    // Attach tenant to request for further use
    (req as any).tenant = tenant;
    next();
});
