import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const employeeService = new EmployeeService();

export const addEmployee = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userData, employeeData } = req.body;
    if (!req.user) throw new Error("Unauthorized");
    const result = await employeeService.addEmployee(userData, employeeData, req.user.tenantId.toString());
    return res.status(201).json(new ApiResponse(201, result, "Employee added successfully"));
});

export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const profile = await employeeService.getEmployeeProfile(req.user._id.toString(), req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, profile));
});

export const getAllEmployees = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const employees = await employeeService.getAllEmployees(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, employees));
});

export const updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const profile = await employeeService.updateEmployeeProfile(req.user._id.toString(), req.body, req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
});

export const updateEmployee = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const profile = await employeeService.updateEmployeeProfile(req.params.id as string, req.body, req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, profile, "Employee updated successfully"));
});

export const getEmployeeById = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const profile = await employeeService.getEmployeeProfile(req.params.id as string, req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, profile));
});
