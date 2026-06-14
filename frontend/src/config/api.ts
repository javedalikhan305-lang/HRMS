const getApiBaseUrl = () => {
    if (import.meta.env.PROD) {
        return '/api/v1';
    }

    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
