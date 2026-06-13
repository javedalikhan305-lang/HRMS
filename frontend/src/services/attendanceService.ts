import api from '../utils/api';

export const attendanceService = {
    async getHistory() {
        const response = await api.get('/attendance/history');
        return response.data.data;
    },

    async punchIn(data: { location: string; ip: string }) {
        const response = await api.post('/attendance/punch-in', data);
        return response.data;
    },

    async punchOut(data: { location: string }) {
        const response = await api.post('/attendance/punch-out', data);
        return response.data;
    }
};
