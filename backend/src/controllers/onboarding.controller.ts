import { Response } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const onboardingService = new OnboardingService();

export const inviteCandidate = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const result = await onboardingService.inviteCandidate(req.user.tenantId.toString(), req.user._id.toString(), req.body);
    return res.status(201).json(new ApiResponse(201, result, "Candidate invited successfully"));
});

export const getOnboardingList = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    const list = await onboardingService.getOnboardingList(req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, list, "Onboarding list fetched"));
});

export const updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { progress } = req.body;
    if (!req.user) throw new Error("Unauthorized");
    const result = await onboardingService.updateProgress(req.params.id as string, req.user.tenantId.toString(), progress);
    return res.status(200).json(new ApiResponse(200, result, "Progress updated successfully"));
});

export const deleteOnboarding = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new Error("Unauthorized");
    await onboardingService.deleteOnboarding(req.params.id as string, req.user.tenantId.toString());
    return res.status(200).json(new ApiResponse(200, null, "Onboarding session deleted"));
});
