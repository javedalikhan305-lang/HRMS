import api from '../utils/api';

export const dashboardService = {
    async getPersonalStats() {
        const response = await api.get('/org/personal-stats');
        return response.data.data;
    },

    async getManagerStats() {
        const response = await api.get('/org/manager-stats');
        return response.data.data;
    },

    async getHRStats() {
        const response = await api.get('/org/dashboard-stats');
        return response.data.data;
    },

    async getExecutiveStats() {
        const response = await api.get('/org/executive-stats');
        return response.data.data;
    }
};

