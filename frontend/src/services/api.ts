import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface User {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 (Not Authorized) globally or token expiration
        if (error.response && error.response.status === 401) {
            // Could trigger logout or refresh logic here
        }
        return Promise.reject(error);
    }
);

export default api;
