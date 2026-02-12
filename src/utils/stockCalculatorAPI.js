import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    const hostname = window.location.hostname;
    return (hostname === 'localhost' || hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : `http://${hostname}:5000/api`;
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
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

export const stockCalculatorAPI = {
    getOptions: () => api.get('/stock-calculator/options'),
    getSalesOptions: () => api.get('/stock-calculator/sales-options'),
    calculate: (filters) => api.post('/stock-calculator/calculate', filters),
    calculateSales: (filters) => api.post('/stock-calculator/calculate-sales', filters)
};

export default stockCalculatorAPI;
