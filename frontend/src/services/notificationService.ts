import api from '../utils/api';

export const notificationService = {
    async getAll() {
        const response = await api.get('/notifications');
        return response.data.data;
    },

    async markRead(id: string) {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    async markAllRead() {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    }
};
