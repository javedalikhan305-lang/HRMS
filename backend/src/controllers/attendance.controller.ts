import { Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const attendanceService = new AttendanceService();

export const punchIn = asyncHandler(async (req: AuthRequest, res: Response) => {
    const attendance = await attendanceService.punchIn(req.user._id, req.user.tenantId, req.body);
    return res.status(200).json(new ApiResponse(200, attendance, "Punched in successfully"));
});

export const punchOut = asyncHandler(async (req: AuthRequest, res: Response) => {
    const attendance = await attendanceService.punchOut(req.user._id, req.user.tenantId, req.body);
    return res.status(200).json(new ApiResponse(200, attendance, "Punched out successfully"));
});

export const getAttendanceHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filter = req.user.role === 'EMPLOYEE' ? { userId: req.user._id } : req.query;
    const history = await attendanceService.getAttendanceHistory(req.user.tenantId, filter);
    return res.status(200).json(new ApiResponse(200, history, "Attendance history fetched"));
});

export const markManualAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const attendance = await attendanceService.markManualAttendance(req.user.tenantId, req.body);
    return res.status(200).json(new ApiResponse(200, attendance, "Manual attendance marked"));
});

export const getTodayAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const attendance = await attendanceService.getTodayAttendance(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, attendance, "Today's attendance fetched"));
});
