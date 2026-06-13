import api from '../utils/api';

export const onboardingService = {
    async getOnboardingList() {
        const response = await api.get('/onboarding/list');
        return response.data.data;
    },

    async inviteCandidate(data: any) {
        const response = await api.post('/onboarding/invite', data);
        return response.data.data;
    },

    async updateProgress(id: string, progress: number) {
        const response = await api.patch(`/onboarding/${id}/progress`, { progress });
        return response.data.data;
    },

    async deleteOnboarding(id: string) {
        const response = await api.delete(`/onboarding/${id}`);
        return response.data.data;
    }
};
