import api from '../utils/api';

export const leaveService = {
    async getMyLeaves() {
        const response = await api.get('/leaves');
        return response.data.data;
    },

    async applyLeave(data: any) {
        const response = await api.post('/leaves', data);
        return response.data;
    },

    async getLeaveApprovals() {
        // Backend filters by role server-side: employees see their own, HR/managers see all
        const response = await api.get('/leaves');
        return response.data.data;
    },

    async updateLeaveStatus(leaveId: string, status: string, remarks?: string) {
        const response = await api.patch(`/leaves/${leaveId}/status`, { status, remarks });
        return response.data;
    }
};
