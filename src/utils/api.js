/**
 * API CLIENT
 * Centralized API calls with authentication
 */

import axios from 'axios';

// Dynamically determine the API base URL
const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        const cleaned = envUrl.replace(/\/+$/, '');
        return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
    }

    const hostname = window.location.hostname;

    // If accessing from network IP, use that IP for backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5000/api`;
    }

    // Default to localhost
    return 'http://localhost:5000/api';
};

const API_URL = getApiBaseUrl();

console.log('API URL:', API_URL); // Debug log

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    loginWithPasscode: (passcode) => api.post('/auth/passcode-login', { passcode }),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (currentPassword, newPassword) =>
        api.post('/auth/change-password', { currentPassword, newPassword })
};

// Dashboard APIs
export const dashboardAPI = {
    getMetrics: () => api.get('/dashboard/metrics'),
    getRecentSales: (limit = 10) => api.get(`/dashboard/recent-sales?limit=${limit}`),
    getSalesChart: () => api.get('/dashboard/sales-chart')
};

// Customer APIs
export const customerAPI = {
    getAll: () => api.get('/customers'),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`)
};

// Product APIs
export const productAPI = {
    getAll: () => api.get('/products'),
    getLowStock: () => api.get('/products/low-stock'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// Sales APIs
export const salesAPI = {
    getAll: () => api.get('/sales'),
    getStats: () => api.get('/sales/stats'),
    getHourlyStats: () => api.get('/sales/hourly-stats'),
    create: (data) => api.post('/sales', data)
};

// Repair APIs
export const repairAPI = {
    getAll: () => api.get('/repairs'),
    getStats: () => api.get('/repairs/stats'),
    create: (data) => api.post('/repairs', data),
    updateStatus: (id, data) => api.put(`/repairs/${id}/status`, data)
};

// Category APIs
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    delete: (id) => api.delete(`/categories/${id}`)
};

// Notification APIs
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/mark-all-read'),
    getWhatsAppStatus: () => api.get('/notifications/whatsapp/status'),
    sendTestWhatsApp: (data) => api.post('/notifications/test-whatsapp', data),
    getTwilioStatus: () => api.get('/notifications/twilio-status'),
    rebootWhatsApp: () => api.post('/notifications/reboot-whatsapp'),
    sendTestEmail: (email, subject, message) => api.post('/notifications/whatsapp/email-test', { email, subject, message }),
    requestPairingCode: (phone) => api.post('/notifications/whatsapp/pairing-code', { phone }),
    getUsers: () => api.get('/notifications/users'),
    updateUserEmail: (id, email) => api.put(`/notifications/users/${id}/email`, { email })
};

// CEO APIs
export const ceoAPI = {
    getAllData: (params) => api.get('/ceo/data', { params }),
    getTemporalActivity: () => api.get('/ceo/data', { params: { type: 'temporalData' } })
};

// User APIs
export const userAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users/register', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    toggleStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
    resetPassword: (id, customPassword) => api.post(`/users/${id}/reset-password`, { customPassword }),
    delete: (id) => api.delete(`/users/${id}`)
};

// Delivery APIs
export const deliveryAPI = {
    getAll: (params) => api.get('/deliveries', { params }),
    getById: (id) => api.get(`/deliveries/${id}`),
    create: (data) => api.post('/deliveries/create', data),
    assign: (id, deliveryPersonId) => api.post(`/deliveries/${id}/assign`, { deliveryPersonId }),
    updateStatus: (id, status, note, verificationCode, signature, rating) => api.post(`/deliveries/${id}/status`, { status, note, verificationCode, signature, rating }),
    getMyDeliveries: () => api.get('/deliveries/my/deliveries'),
    getStats: () => api.get('/deliveries/stats/summary')
};

// Trade-In APIs
export const tradeInAPI = {
    getAll: (params) => api.get('/tradeins', { params }),
    getById: (id) => api.get(`/tradeins/${id}`),
    getCustomerApproved: (customerId) => api.get(`/tradeins/approved-valuation/${customerId}`),
    updateStatus: (id, status) => api.put(`/tradeins/${id}/status`, { status }),
    create: (data) => api.post('/tradeins', data)
};

export const reportsAPI = {
    getSales: (params) => api.get('/reports/sales', { params }),
    getImports: (params) => api.get('/reports/imports', { params })
};

export default api;
