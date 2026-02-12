import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const supplierAPI = {
    // Get all suppliers
    getAll: () => axios.get(`${API_BASE_URL}/suppliers`, getAuthHeaders()),

    // Get single supplier
    getById: (id) => axios.get(`${API_BASE_URL}/suppliers/${id}`, getAuthHeaders()),

    // Create supplier
    create: (data) => axios.post(`${API_BASE_URL}/suppliers`, data, getAuthHeaders()),

    // Update supplier
    update: (id, data) => axios.put(`${API_BASE_URL}/suppliers/${id}`, data, getAuthHeaders()),

    // Delete supplier
    delete: (id) => axios.delete(`${API_BASE_URL}/suppliers/${id}`, getAuthHeaders())
};
