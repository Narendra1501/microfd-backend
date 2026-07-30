import axios from 'axios';

const api = axios.create({
    baseURL: 'https://microfd-backend.onrender.com/api',
    // baseURL: 'http://127.0.0.1:5000/api',

});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Fix: Adding Bearer prefix properly
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., token expired)
            localStorage.removeItem('token');
            // We'll rely on React components to redirect on auth state change
        }
        return Promise.reject(error);
    }
);

export default api;
