const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    if (import.meta.env.VITE_API_HOST) {
        return `https://${import.meta.env.VITE_API_HOST}/api/v1`;
    }

    return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
