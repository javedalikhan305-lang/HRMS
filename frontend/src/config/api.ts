const getApiBaseUrl = () => {
    // If we are NOT on localhost, use relative path for production
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api/v1';
    }

    // Otherwise use local backend URL
    return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
