import api from '../utils/api';

export const documentService = {
    async getMyDocuments(filters: any = {}) {
        const response = await api.get('/documents/me', { params: filters });
        return response.data.data;
    },

    async getAllDocuments(filters: any = {}) {
        const response = await api.get('/documents/all', { params: filters });
        return response.data.data;
    },

    async uploadDocument(formData: FormData, onUploadProgress?: (progressEvent: any) => void) {
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        return response.data.data;
    },

    async verifyDocument(id: string, status: string, remarks?: string) {
        const response = await api.patch(`/documents/${id}/verify`, { status, remarks });
        return response.data.data;
    },

    async deleteDocument(id: string) {
        const response = await api.delete(`/documents/${id}`);
        return response.data.data;
    }
};
