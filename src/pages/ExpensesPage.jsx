
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faTruck, faBolt, faHome, faMoneyBillWave,
    faBox, faWrench, faBullhorn, faEllipsisH, faEdit, faTrash,
    faFilter, faCalendar, faDownload, faTimes, faCheck, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
    { value: 'Transport', label: 'Transport', icon: faTruck, color: '#3B82F6' },
    { value: 'Utilities', label: 'Utilities', icon: faBolt, color: '#EAB308' },
    { value: 'Rent', label: 'Rent', icon: faHome, color: '#8B5CF6' },
    { value: 'Salaries', label: 'Salaries', icon: faMoneyBillWave, color: '#10B981' },
    { value: 'Supplies', label: 'Supplies', icon: faBox, color: '#F59E0B' },
    { value: 'Maintenance', label: 'Maintenance', icon: faWrench, color: '#EF4444' },
    { value: 'Marketing', label: 'Marketing', icon: faBullhorn, color: '#EC4899' },
    { value: 'Other', label: 'Other', icon: faEllipsisH, color: '#6B7280' }
];

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Card'];

const ExpensesPage = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        startDate: '',
        endDate: ''
    });

    // Get current date in local YYYY-MM-DD format
    const getCurrentDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    // Form state
    const [formData, setFormData] = useState({
        date: getCurrentDate(),
        category: 'Transport',
        description: '',
        amount: '',
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        fetchExpenses();
        fetchSummary();
    }, [filters]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await axios.get(`${API_URL}/expenses?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setExpenses(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await axios.get(`${API_URL}/expenses/summary?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSummary(response.data.data);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingExpense
                ? `${API_URL}/expenses/${editingExpense.id}`
                : `${API_URL}/expenses`;
            const method = editingExpense ? 'put' : 'post';

            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setShowAddModal(false);
            setEditingExpense(null);
            setFormData({
                date: getCurrentDate(),
                category: 'Transport',
                description: '',
                amount: '',
                paymentMethod: 'Cash'
            });
            fetchExpenses();
            fetchSummary();
        } catch (error) {
            console.error('Failed to save expense:', error);
            alert('Failed to save expense');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await axios.delete(`${API_URL}/expenses/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchExpenses();
            fetchSummary();
        } catch (error) {
            console.error('Failed to delete expense:', error);
            alert('Failed to delete expense');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            date: expense.date.split('T')[0],
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            paymentMethod: expense.paymentMethod
        });
        setShowAddModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getCategoryIcon = (category) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat || CATEGORIES[CATEGORIES.length - 1];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 md:mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">💰 Expenses</h1>
                        <p className="text-gray-600 text-sm md:text-base">Track and manage business expenses</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingExpense(null);
                            setFormData({
                                date: getCurrentDate(),
                                category: 'Transport',
                                description: '',
                                amount: '',
                                paymentMethod: 'Cash'
                            });
                            setShowAddModal(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg font-bold flex items-center justify-center gap-3 w-full md:w-auto"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add Expense
                    </motion.button>
                </div>
            </motion.div>

            {/* Summary Cards - CEO ONLY */}
            {user.role === 'CEO' && summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl"
                    >
                        <div className="text-xs md:text-sm font-medium opacity-90 mb-1 md:mb-2">Total Expenses</div>
                        <div className="text-xl md:text-3xl font-black break-words">{formatCurrency(summary.total)}</div>
                        <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">{summary.count} transactions</div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl"
                    >
                        <div className="text-xs md:text-sm font-medium opacity-90 mb-1 md:mb-2">Today</div>
                        <div className="text-xl md:text-3xl font-black break-words">{formatCurrency(summary.todayTotal)}</div>
                        <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">{summary.todayCount} today</div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl"
                    >
                        <div className="text-xs md:text-sm font-medium opacity-90 mb-1 md:mb-2">Top Category</div>
                        <div className="text-lg md:text-2xl font-black break-words">
                            {Object.entries(summary.byCategory).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'N/A'}
                        </div>
                        <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2 break-words">
                            {formatCurrency(Object.entries(summary.byCategory).sort((a, b) => b[1].total - a[1].total)[0]?.[1].total || 0)}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl"
                    >
                        <div className="text-xs md:text-sm font-medium opacity-90 mb-1 md:mb-2">Categories</div>
                        <div className="text-xl md:text-3xl font-black">{Object.keys(summary.byCategory).length}</div>
                        <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">active categories</div>
                    </motion.div>
                </div>
            )}

            {/* Filters & Expense List */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8">
                {user.role !== 'CEO' && (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900 mb-2">My Expense History</h2>
                        <p className="text-gray-500 text-sm">Below are the expenses you have recorded personally.</p>
                    </div>
                )}
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Expense Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-4 font-black text-gray-700">Date</th>
                                <th className="text-left p-4 font-black text-gray-700">Category</th>
                                <th className="text-left p-4 font-black text-gray-700">Description</th>
                                <th className="text-right p-4 font-black text-gray-700">Amount</th>
                                <th className="text-left p-4 font-black text-gray-700">Payment</th>
                                <th className="text-left p-4 font-black text-gray-700">Recorded By</th>
                                <th className="text-left p-4 font-black text-gray-700">Time</th>
                                <th className="text-center p-4 font-black text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-8">
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-gray-400" />
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-8 text-gray-500">
                                        No expenses found. Add your first expense!
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense, index) => {
                                    const catInfo = getCategoryIcon(expense.category);
                                    return (
                                        <motion.tr
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="p-4 text-gray-700">
                                                {new Date(expense.date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow"
                                                        style={{ backgroundColor: catInfo.color }}
                                                    >
                                                        <FontAwesomeIcon icon={catInfo.icon} />
                                                    </div>
                                                    <span className="font-bold text-gray-800">{expense.category}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700">{expense.description}</td>
                                            <td className="p-4 text-right font-black text-gray-900">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
                                                    {expense.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-700 font-medium">
                                                {expense.recordedBy}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {user.role === 'CEO' && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleEdit(expense)}
                                                            className="w-10 h-10 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </motion.button>
                                                    )}
                                                    {user.role === 'CEO' && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(expense.id)}
                                                            className="w-10 h-10 bg-red-500 text-white rounded-xl shadow hover:bg-red-600"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {user.role !== 'CEO' && expenses.length === 0 && (
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-12 text-center mt-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-3xl">
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to add an expense?</h2>
                    <p className="text-gray-500 max-w-md mx-auto">Click the button above to record a business cost. Financial summaries and history are restricted to management.</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-black text-gray-900">
                                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Fuel for delivery truck"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Amount (TZS)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="1"
                                            placeholder="50000"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                                        <select
                                            required
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                        >
                                            {PAYMENT_METHODS.map(method => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg"
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        {editingExpense ? 'Update Expense' : 'Add Expense'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default ExpensesPage;
