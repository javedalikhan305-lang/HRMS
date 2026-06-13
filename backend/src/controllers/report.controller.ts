import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const reportService = new ReportService();

export const getHeadcountReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');

    const report = await reportService.getHeadcountReport(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, report));
});

export const downloadAttendanceReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json(new ApiResponse(400, null, 'startDate and endDate query parameters are required')); 
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json(new ApiResponse(400, null, 'Invalid date format for startDate or endDate')); 
    }

    const workbook = await reportService.generateAttendanceExcel(req.user.tenantId.toString(), start, end);
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.xlsx"');
    return res.status(200).send(buffer);
});

export const getEmployeeStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');
    const { userId } = req.params;
    const stats = await reportService.getEmployeeStats(req.user.tenantId.toString(), userId as string);
    return res.status(200).json(new ApiResponse(200, stats));
});

export const getGrowthTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');
    const trends = await reportService.getGrowthTrends(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, trends));
});

export const getCapitalAllocation = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');
    const allocation = await reportService.getCapitalAllocation(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, allocation));
});

export const getTalentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');
    const stats = await reportService.getTalentAcquisitionStats(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, stats));
});

export const getOpsMetrics = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error('Unauthorized');
    const metrics = await reportService.getOperationalMetrics(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, metrics));
});

