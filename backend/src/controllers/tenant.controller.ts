import { Response } from 'express';
import { Tenant } from '../models/tenant.model';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/ApiError';

export const getTenantConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) throw new ApiError(404, "Tenant not found");
    return res.status(200).json(new ApiResponse(200, tenant, "Tenant config fetched"));
});

export const updateTenantConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenant = await Tenant.findByIdAndUpdate(
        req.user.tenantId,
        { $set: req.body },
        { new: true, runValidators: true }
    );
    if (!tenant) throw new ApiError(404, "Tenant not found");
    return res.status(200).json(new ApiResponse(200, tenant, "Tenant config updated successfully"));
});
