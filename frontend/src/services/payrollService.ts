import api from '../utils/api';

export const payrollService = {
    async getMyPayrolls() {
        const response = await api.get('/payroll/my');
        return response.data.data;
    },

    async getPayrollDetails(id: string) {
        const response = await api.get(`/payroll/${id}`);
        return response.data.data;
    },

    async generatePayroll(month: number, year: number) {
        const response = await api.post('/payroll/generate', { month, year });
        return response.data.data;
    },

    async updateStatus(id: string, status: string) {
        const response = await api.patch(`/payroll/${id}/status`, { status });
        return response.data.data;
    }
};
