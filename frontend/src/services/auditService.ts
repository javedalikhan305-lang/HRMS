import api from '../utils/api';

export const auditService = {
    getLogs: async (params: { module?: string; search?: string; page?: number; limit?: number }) => {
        const response = await api.get('/audit', { params });
        return response.data.data;
    }
};
