import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PayrollService } from '../services/payroll.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { PayrollStatus } from '../models/payroll.model';

export const getMyPayrolls = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, "User not authenticated");
    const payrolls = await PayrollService.getEmployeePayrolls(req.user._id.toString(), req.user.tenantId.toString());
    return res.status(200).json(
        new ApiResponse(200, payrolls, "Payroll history fetched successfully")
    );
});

export const generateTenantPayroll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { month, year } = req.body;

    if (!month || !year) {
        throw new ApiError(400, "Month and Year are required");
    }
    if (!req.user) throw new ApiError(401, "User not authenticated");
    const payrolls = await PayrollService.generateMonthlyPayroll(req.user.tenantId.toString(), month, year);
    return res.status(201).json(
        new ApiResponse(201, payrolls, "Payroll generated successfully")
    );
});

export const updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(PayrollStatus).includes(status)) {
        throw new ApiError(400, "Invalid payroll status");
    }
    if (!req.user) throw new ApiError(401, "User not authenticated");
    const payroll = await PayrollService.updatePayrollStatus(id as string, req.user.tenantId.toString(), status as PayrollStatus);
    return res.status(200).json(
        new ApiResponse(200, payroll, "Payroll status updated successfully")
    );
});

export const getPayrollDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!req.user) throw new ApiError(401, "User not authenticated");
    const payroll = await PayrollService.getPayrollById(id as string, req.user.tenantId.toString());
    
    // Security check: Only owner or HR/Admin can view
    if (payroll.userId.toString() !== req.user._id.toString() && req.user.role === 'EMPLOYEE') {
        throw new ApiError(403, "You are not authorized to view this payroll");
    }

    return res.status(200).json(
        new ApiResponse(200, payroll, "Payroll details fetched successfully")
    );
});
