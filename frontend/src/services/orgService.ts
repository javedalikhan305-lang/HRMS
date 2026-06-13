import api from '../utils/api';

export const orgService = {
    // Departments
    async getDepartments() {
        const response = await api.get('/org/departments');
        return response.data.data;
    },
    async createDepartment(data: any) {
        const response = await api.post('/org/departments', data);
        return response.data.data;
    },
    async updateDepartment(id: string, data: any) {
        const response = await api.put(`/org/departments/${id}`, data);
        return response.data.data;
    },
    async deleteDepartment(id: string) {
        const response = await api.delete(`/org/departments/${id}`);
        return response.data.data;
    },

    // Designations
    async getDesignations() {
        const response = await api.get('/org/designations');
        return response.data.data;
    },
    async createDesignation(data: any) {
        const response = await api.post('/org/designations', data);
        return response.data.data;
    },
    async updateDesignation(id: string, data: any) {
        const response = await api.put(`/org/designations/${id}`, data);
        return response.data.data;
    },
    async deleteDesignation(id: string) {
        const response = await api.delete(`/org/designations/${id}`);
        return response.data.data;
    },

    // Shifts
    async getShifts() {
        const response = await api.get('/org/shifts');
        return response.data.data;
    },
    async createShift(data: any) {
        const response = await api.post('/org/shifts', data);
        return response.data.data;
    },
    async updateShift(id: string, data: any) {
        const response = await api.put(`/org/shifts/${id}`, data);
        return response.data.data;
    },
    async deleteShift(id: string) {
        const response = await api.delete(`/org/shifts/${id}`);
        return response.data.data;
    },

    // Org Chart & Metrics
    async getOrgChart() {
        const response = await api.get('/org/chart');
        return response.data.data;
    },
    async getOrgMetrics() {
        const response = await api.get('/org/metrics');
        return response.data.data;
    }
};
