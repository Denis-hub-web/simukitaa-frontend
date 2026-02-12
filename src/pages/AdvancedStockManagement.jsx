import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faSearch,
    faPlus,
    faCircle,
    faBoxOpen,
    faMoneyBillWave,
    faChartLine,
    faMobileAlt,
    faCog,
    faTools,
    faEdit,
    faTrash,
    faEye,
    faEyeSlash,
    faTimes,
    faSave,
    faList,
    faChevronRight,
    faFilter,
    faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import StepByStepProductForm from '../components/StepByStepProductForm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdvancedStockManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showBuyingPrice, setShowBuyingPrice] = useState(false);
    const [stats, setStats] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: '', group: 'phones' });

    // Categories - fetched from backend
    const [categories, setCategories] = useState([
        { id: 'ALL', name: 'All Products', icon: faBoxOpen, group: 'all', permanent: true }
    ]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';
    const isManager = user?.role === 'MANAGER';

    useEffect(() => {
        if (user?.role === 'STAFF') {
            navigate('/dashboard');
            return;
        }
        loadStockData();
        loadCategories();
    }, []);

    const loadStockData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [productsRes, statsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/stock-advanced`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/stock-advanced/statistics`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const productsData = productsRes.data.data.products || [];
            setProducts(productsData);
            setStats(statsRes.data.data || {
                total: productsData.length,
                active: productsData.filter(p => p.status === 'ACTIVE').length,
                totalValue: 0,
                potentialRevenue: 0
            });
            setShowBuyingPrice(productsRes.data.data.canSeeBuyingPrice !== false);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load stock:', error);
            setProducts([]);
            setStats({ total: 0, active: 0, totalValue: 0, potentialRevenue: 0 });
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const apiCategories = response.data.data.categories || [];
            const mappedCategories = apiCategories.map(cat => ({
                id: cat.name,
                name: cat.name,
                icon: faMobileAlt,
                group: 'phones'
            }));

            setCategories([
                { id: 'ALL', name: 'All Products', icon: faBoxOpen, group: 'all', permanent: true },
                ...mappedCategories
            ]);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleAddProduct = async (productData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/stock-advanced`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            await loadStockData();
        } catch (error) {
            alert('Failed to add product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditProduct = async (productData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/stock-advanced/${selectedProduct.id}`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowEditModal(false);
            setSelectedProduct(null);
            await loadStockData();
        } catch (error) {
            alert('Failed to update product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/stock-advanced/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadStockData();
        } catch (error) {
            alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.name.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/categories`, {
                name: newCategory.name,
                icon: '📱',
                color: '#3b82f6'
            }, { headers: { Authorization: `Bearer ${token}` } });
            setNewCategory({ name: '', group: 'phones' });
            setShowCategoryModal(false);
            await loadCategories();
        } catch (error) {
            alert('Failed to add category: ' + (error.response?.data?.message || error.message));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'NON_ACTIVE': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'REFURBISHED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'USED': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStockLevelColor = (quantity) => {
        if (quantity === 0) return 'text-red-600';
        if (quantity <= 2) return 'text-orange-600';
        if (quantity <= 5) return 'text-yellow-600';
        return 'text-green-600';
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'ALL' || product.category === activeCategory;
        const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryCount = (categoryId) => {
        if (categoryId === 'ALL') return products.length;
        return products.filter(p => p.category === categoryId).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-black tracking-tight uppercase text-xs">Calibrating stock levels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Premium Global Style Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#008069] relative overflow-hidden pb-12 pt-4 shadow-xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">Enterprise Inventory</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Advanced Management</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate('/stock')}
                                className="flex-1 md:flex-none bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 font-black text-[10px] text-white hover:bg-white/20 transition-all shadow-lg uppercase tracking-widest"
                            >
                                <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
                                Matrix
                            </button>
                            {isCEO && (
                                <button
                                    onClick={() => setShowCategoryModal(true)}
                                    className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
                                >
                                    <FontAwesomeIcon icon={faList} />
                                </button>
                            )}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex-1 md:flex-none bg-white text-[#008069] px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Add Asset</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Dashboard Spotlight */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Network Total', value: stats.total, icon: faBoxOpen, color: 'blue' },
                            { label: 'Operational', value: stats.active, icon: faCircle, color: 'green' },
                            { label: 'Asset Value', value: formatCurrency(stats.totalValue), icon: faMoneyBillWave, color: 'purple', isLong: true },
                            { label: 'Revenue Pool', value: formatCurrency(stats.potentialRevenue), icon: faChartLine, color: 'amber', isLong: true }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                                <div className="flex items-center gap-3 mb-1">
                                    <FontAwesomeIcon icon={s.icon} className="text-white/60 text-xs" />
                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <p className={`text-white font-black leading-none ${s.isLong ? 'text-xs md:text-sm' : 'text-xl'}`}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Advanced Toolkit */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#008069] transition-colors" />
                            <input
                                type="text"
                                placeholder="Universal search by name, model, serial..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-6 py-4 bg-gray-50/50 rounded-[2rem] text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all placeholder-gray-400"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex bg-gray-50 rounded-[2rem] p-1 items-center border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
                                {categories.slice(0, 3).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-5 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'
                                            }`}
                                    >
                                        {cat.name.split(' ')[0]}
                                    </button>
                                ))}
                                <select
                                    value={activeCategory}
                                    onChange={(e) => setActiveCategory(e.target.value)}
                                    className="bg-transparent border-0 text-[10px] font-black uppercase tracking-widest focus:ring-0 mr-2"
                                >
                                    <option value="ALL">More...</option>
                                    {categories.slice(3).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gray-50 rounded-[2rem] p-1 flex items-center border border-gray-100">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent border-0 text-[10px] font-black uppercase tracking-widest focus:ring-0 px-6 py-3"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="NON_ACTIVE">Inactive</option>
                                    <option value="REFURBISHED">Refurbished</option>
                                    <option value="USED">Used</option>
                                </select>
                            </div>
                            {isCEO && (
                                <button
                                    onClick={() => setShowBuyingPrice(!showBuyingPrice)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showBuyingPrice ? 'bg-[#008069] text-white' : 'bg-gray-50 text-gray-400'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={showBuyingPrice ? faEye : faEyeSlash} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop View Table */}
                <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Detail</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Status</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Stock</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Rate</th>
                                {showBuyingPrice && (
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation</th>
                                )}
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((product, index) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#008069] group-hover:bg-[#008069] group-hover:text-white transition-all">
                                                <FontAwesomeIcon icon={faMobileAlt} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 tracking-tight leading-none mb-1">{product.name}</p>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{product.category} • {product.model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <p className={`text-lg font-black tracking-tight ${getStockLevelColor(product.quantity)}`}>
                                            {product.quantity}
                                        </p>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <p className="font-black text-gray-900 tracking-tight">{formatCurrency(product.sellingPrice)}</p>
                                    </td>
                                    {showBuyingPrice && (
                                        <td className="px-6 py-6 text-right">
                                            <p className="text-[10px] font-black text-[#008069] uppercase tracking-tighter">
                                                Margin: +{formatCurrency(product.sellingPrice - product.costPrice)}
                                            </p>
                                        </td>
                                    )}
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedProduct(product); setShowEditModal(true); }}
                                                className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="text-sm" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="lg:hidden space-y-4">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#008069]/10 rounded-2xl flex items-center justify-center text-[#008069]">
                                        <FontAwesomeIcon icon={faMobileAlt} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 tracking-tight">{product.name}</h3>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{product.category}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusColor(product.status)}`}>
                                    {product.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock</p>
                                    <p className={`text-xl font-black tracking-tight ${getStockLevelColor(product.quantity)}`}>{product.quantity}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Retail</p>
                                    <p className="text-sm font-black text-gray-900 tracking-tight">{formatCurrency(product.sellingPrice)}</p>
                                </div>
                            </div>

                            {showBuyingPrice && (
                                <div className="bg-[#008069]/5 rounded-2xl p-4 border border-[#008069]/10 mb-4 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-[#00a884] uppercase tracking-widest">Potential Unit Profit</span>
                                    <span className="font-black text-[#008069]">{formatCurrency(product.sellingPrice - product.costPrice)}</span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setSelectedProduct(product); setShowEditModal(true); }}
                                    className="flex-1 bg-gray-900 text-white rounded-xl py-4 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-gray-200"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="w-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-900 mb-2">Registry Empty</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">No assets match the current filter parameters</p>
                    </div>
                )}
            </div>

            {/* Premium Modals */}
            <AnimatePresence>
                {(showAddModal || showEditModal) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-[#008069] to-[#00a884] p-10 relative overflow-hidden sticky top-0 z-10">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">
                                            {showAddModal ? 'New Inventory Asset' : 'Modify Asset Profile'}
                                        </h2>
                                        <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Registry Integration Hub</p>
                                    </div>
                                    <button
                                        onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                                        className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-10">
                                <StepByStepProductForm
                                    isOpen={true}
                                    onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedProduct(null); }}
                                    product={selectedProduct}
                                    isEdit={showEditModal}
                                    showBuyingPrice={showBuyingPrice}
                                    onSave={showAddModal ? handleAddProduct : handleEditProduct}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}

                {showCategoryModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCategoryModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-gray-900 p-8 text-white">
                                <h2 className="text-2xl font-black tracking-tight mb-1">Global Categories</h2>
                                <p className="text-white font-black uppercase tracking-widest opacity-80 text-[10px]">Management System</p>
                            </div>
                            <div className="p-8">
                                <div className="mb-8">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Integrate New Sector</p>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            placeholder="Enter sector name..."
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all"
                                        />
                                        <button
                                            onClick={handleAddCategory}
                                            className="w-full bg-[#008069] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#008069]/20"
                                        >
                                            Confirm Integration
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Existing Sectors</p>
                                    {categories.slice(1).map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <FontAwesomeIcon icon={faMobileAlt} className="text-[#008069]" />
                                                <span className="font-black text-gray-900 text-xs tracking-tight">{cat.name}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase">{getCategoryCount(cat.id)} Assets</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedStockManagement;
