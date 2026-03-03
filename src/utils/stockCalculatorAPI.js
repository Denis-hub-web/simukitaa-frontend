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

export const stockCalculatorAPI = {
    getOptions: () => api.get('/stock-calculator/options'),
    getSalesOptions: () => api.get('/stock-calculator/sales-options'),
    calculate: (filters) => api.post('/stock-calculator/calculate', filters),
    calculateSales: (filters) => api.post('/stock-calculator/calculate-sales', filters)
};

export default stockCalculatorAPI;
