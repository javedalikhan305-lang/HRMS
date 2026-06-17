import api from '../utils/api';

export const workflowService = {
    getAll: async () => {
        const res = await api.get('/workflows');
        return res.data.data;
    },
    create: async (data: any) => {
        const res = await api.post('/workflows', data);
        return res.data.data;
    },
    delete: async (id: string) => {
        const res = await api.delete(`/workflows/${id}`);
        return res.data;
    }
};
