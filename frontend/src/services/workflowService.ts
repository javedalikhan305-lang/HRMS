import api from '../utils/api';

export const workflowService = {
    getAll: async () => {
        const res = await api.get('/workflow-engine');
        return res.data.data;
    },
    create: async (data: any) => {
        const res = await api.post('/workflow-engine', data);
        return res.data.data;
    },
    delete: async (id: string) => {
        const res = await api.delete(`/workflow-engine/${id}`);
        return res.data;
    }
};
