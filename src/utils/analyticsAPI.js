import axios from 'axios';
import { API_URL as API_BASE_URL } from './api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const analyticsAPI = {
    // Query natural language
    query: (text) => api.post('/analytics/query', { query: text })
};

export default analyticsAPI;
