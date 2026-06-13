import { Onboarding, OnboardingStatus } from '../models/onboarding.model';
import { ApiError } from '../utils/ApiError';

export class OnboardingService {
    async inviteCandidate(tenantId: string, createdBy: string, data: any) {
        const { candidateName, candidateEmail, designation, department, joinDate } = data;

        // Check if already exists
        const existing = await Onboarding.findOne({ candidateEmail, tenantId });
        if (existing) {
            throw new ApiError(400, "Candidate with this email already has an active onboarding session");
        }

        const onboarding = await Onboarding.create({
            tenantId,
            candidateName,
            candidateEmail,
            designation,
            department,
            joinDate,
            createdBy,
            status: OnboardingStatus.SENT,
            progress: 0
        });

        return onboarding;
    }

    async getOnboardingList(tenantId: string) {
        return await Onboarding.find({ tenantId })
            .populate('designation', 'title')
            .populate('department', 'name')
            .sort({ createdAt: -1 });
    }

    async updateProgress(onboardingId: string, tenantId: string, progress: number) {
        const onboarding = await Onboarding.findOneAndUpdate(
            { _id: onboardingId, tenantId },
            { 
                progress,
                status: progress === 100 ? OnboardingStatus.COMPLETED : OnboardingStatus.IN_PROGRESS 
            },
            { new: true }
        );

        if (!onboarding) throw new ApiError(404, "Onboarding session not found");
        return onboarding;
    }

    async deleteOnboarding(onboardingId: string, tenantId: string) {
        const result = await Onboarding.deleteOne({ _id: onboardingId, tenantId });
        if (result.deletedCount === 0) throw new ApiError(404, "Onboarding session not found");
        return true;
    }
}
