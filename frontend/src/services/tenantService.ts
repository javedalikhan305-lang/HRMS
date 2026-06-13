import api from '../utils/api';

export const tenantService = {
    async getTenantConfig() {
        const response = await api.get('/tenants/config');
        return response.data.data;
    },

    async updateTenantConfig(data: any) {
        const response = await api.patch('/tenants/config', data);
        return response.data.data;
    }
};
