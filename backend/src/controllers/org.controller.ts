import { Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const orgService = new OrganizationService();
const dashboardService = new DashboardService();

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await dashboardService.getHRDashboardStats(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched"));
});

export const getPersonalStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await dashboardService.getEmployeeDashboardStats(req.user._id, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, stats, "Personal stats fetched"));
});

export const getManagerStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await dashboardService.getManagerDashboardStats(req.user._id, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, stats, "Manager stats fetched"));
});

export const getExecutiveStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await dashboardService.getExecutiveDashboardStats(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, stats, "Executive stats fetched"));
});


// Department Controllers
export const createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const dept = await orgService.createDepartment(req.body, req.user.tenantId);
    return res.status(201).json(new ApiResponse(201, dept, "Department created"));
});

export const updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const dept = await orgService.updateDepartment(req.params.id, req.body, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, dept, "Department updated"));
});

export const deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    await orgService.deleteDepartment(req.params.id, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, null, "Department deleted"));
});

export const getDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const depts = await orgService.getDepartments(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, depts));
});

// Designation Controllers
export const createDesignation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const designation = await orgService.createDesignation(req.body, req.user.tenantId);
    return res.status(201).json(new ApiResponse(201, designation, "Designation created"));
});

export const updateDesignation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const designation = await orgService.updateDesignation(req.params.id, req.body, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, designation, "Designation updated"));
});

export const deleteDesignation = asyncHandler(async (req: AuthRequest, res: Response) => {
    await orgService.deleteDesignation(req.params.id, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, null, "Designation deleted"));
});

export const getDesignations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const designations = await orgService.getDesignations(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, designations));
});

// Shift Controllers
export const createShift = asyncHandler(async (req: AuthRequest, res: Response) => {
    const shift = await orgService.createShift(req.body, req.user.tenantId);
    return res.status(201).json(new ApiResponse(201, shift, "Shift created"));
});

export const updateShift = asyncHandler(async (req: AuthRequest, res: Response) => {
    const shift = await orgService.updateShift(req.params.id, req.body, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, shift, "Shift updated"));
});

export const deleteShift = asyncHandler(async (req: AuthRequest, res: Response) => {
    await orgService.deleteShift(req.params.id, req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, null, "Shift deleted"));
});

export const getShifts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const shifts = await orgService.getShifts(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, shifts));
});

// Org Chart Controller
export const getOrgChart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const chartData = await orgService.getOrgChartData(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, chartData, "Org chart data fetched"));
});

export const getOrgMetrics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const metrics = await orgService.getOrgMetrics(req.user.tenantId);
    return res.status(200).json(new ApiResponse(200, metrics, "Metrics fetched"));
});
