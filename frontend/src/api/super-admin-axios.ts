import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create separate axios instance for Super Admin
const superAdminAxios = axios.create({
    baseURL: `${API_BASE_URL}/super-admin`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Attach Super Admin JWT token
superAdminAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('superAdminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
superAdminAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear super admin auth data
            localStorage.removeItem('superAdminToken');
            localStorage.removeItem('superAdmin');

            // Redirect to super admin login
            if (window.location.pathname !== '/super-admin/login') {
                window.location.href = '/super-admin/login';
            }
        }

        return Promise.reject(error);
    }
);

export default superAdminAxios;
