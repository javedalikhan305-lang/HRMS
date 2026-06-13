import axios from 'axios';

const testRegister = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/register-tenant', {
            name: 'Test Corp',
            adminEmail: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });
        console.log('Registration Status:', response.status);
        console.log('Registration Data:', response.data);

        const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Login Status:', loginResponse.status);
        console.log('Login Data:', loginResponse.data);
    } catch (error: any) {
        console.error('Error:', error.response?.status, error.response?.data);
    }
};

testRegister();
