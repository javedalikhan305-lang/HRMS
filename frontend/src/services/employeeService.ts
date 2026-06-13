import api from '../utils/api';

export const employeeService = {
    async getAllEmployees() {
        const response = await api.get('/employees');
        return response.data.data;
    },

    // Alias for backwards compatibility
    async getEmployees() {
        const response = await api.get('/employees');
        return response.data.data;
    },

    async addEmployee(userData: any, employeeData: any) {
        const response = await api.post('/employees', {
            userData,
            employeeData
        });
        return response.data.data;
    },

    async updateEmployee(id: string, employeeData: any) {
        const response = await api.put(`/employees/${id}`, employeeData);
        return response.data.data;
    },

    async getEmployeeProfile() {
        const response = await api.get('/employees/me');
        return response.data.data;
    },

    async updateMyProfile(data: any) {
        const response = await api.put('/employees/me', data);
        return response.data.data;
    },

    async getEmployeeById(id: string) {
        const response = await api.get(`/employees/${id}`);
        return response.data.data;
    }
};
