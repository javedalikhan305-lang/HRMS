import { Response } from 'express';
import { LeaveService } from '../services/leave.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const leaveService = new LeaveService();

export const applyLeave = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const leave = await leaveService.applyLeave(req.user._id.toString(), req.user.tenantId.toString(), req.body);
    return res.status(201).json(new ApiResponse(201, leave, "Leave applied successfully"));
});

export const getLeaveRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const filter = req.user.role === 'EMPLOYEE' ? { userId: req.user._id } : req.query;
    const leaves = await leaveService.getLeaveRequests(req.user.tenantId.toString(), filter);
    return res.status(200).json(new ApiResponse(200, leaves, "Leave requests fetched"));
});

export const updateLeaveStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const { status, remarks } = req.body;
    const leave = await leaveService.updateLeaveStatus(req.params.id as string, req.user.tenantId.toString(), status as any, req.user._id.toString(), remarks);
    return res.status(200).json(new ApiResponse(200, leave, `Leave ${status} successfully`));
});
