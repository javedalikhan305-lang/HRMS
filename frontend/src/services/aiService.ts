import api from '../utils/api';

export const aiService = {
    chat: async (message: string) => {
        const response = await api.post('/ai/chat', { message });
        return response.data.data;
    }
};
