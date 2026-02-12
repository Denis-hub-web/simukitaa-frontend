import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faSearch, faRobot, faChevronDown, faChevronUp,
    faBoxOpen, faMoneyBillWave, faChartLine, faCog, faPlus
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import ProductTypeManager from '../components/ProductTypeManager';
import CreateProductModal from '../components/CreateProductModal';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const StockLibrary = () => {
    const navigate = useNavigate();
    const [shelves, setShelves] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedShelves, setExpandedShelves] = useState({});
    const [showTypeManager, setShowTypeManager] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalPrefill, setModalPrefill] = useState({ brand: '', category: '' });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';
    const isManager = user?.role === 'MANAGER';

    useEffect(() => {
        if (!isCEO && !isManager) {
            navigate('/dashboard');
            return;
        }
        loadLibrary();
    }, []);

    const loadLibrary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/condition-stock/library`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShelves(response.data.data.shelves || []);
            setStats({
                totalProducts: response.data.data.totalProducts,
                totalStock: response.data.data.totalStock,
                totalValue: response.data.data.totalValue
            });

            // Auto-expand first shelf
            if (response.data.data.shelves.length > 0) {
                setExpandedShelves({ [response.data.data.shelves[0].type]: true });
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load library:', error);
            setLoading(false);
        }
    };

    const toggleShelf = (type) => {
        setExpandedShelves(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const filteredShelves = shelves.filter(shelf =>
        shelf.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shelf.categories.some(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.products.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Loading Stock Library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#00b894] pb-8 pt-6 shadow-2xl relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    {/* Header Content */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📚</span>
                                    <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">Library View</p>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Stock Management</h1>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowTypeManager(true);
                                }}
                                className="bg-white/20 backdrop-blur-md text-white px-4 md:px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-white/10"
                            >
                                <FontAwesomeIcon icon={faCog} />
                                <span className="hidden md:inline">Manage Types</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Navigating to list view');
                                    navigate('/condition-stock/list');
                                }}
                                className="flex-1 md:flex-none bg-white text-[#008069] px-4 md:px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                            >
                                <span className="text-base">📋</span>
                                <span>List View</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Navigating to AI insights');
                                    navigate('/condition-stock/ai-insights');
                                }}
                                className="flex-1 md:flex-none bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 md:px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                            >
                                <FontAwesomeIcon icon={faRobot} />
                                <span>AI Insights</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 hover:bg-white/20 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faBoxOpen} className="text-white/60 text-xs md:text-sm" />
                                <span className="text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-widest hidden md:inline">Products</span>
                            </div>
                            <p className="text-white font-black text-lg md:text-xl">{stats?.totalProducts || 0}</p>
                            <span className="text-[8px] font-bold text-white/60 md:hidden">Products</span>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 hover:bg-white/20 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faChartLine} className="text-white/60 text-xs md:text-sm" />
                                <span className="text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-widest hidden md:inline">Stock</span>
                            </div>
                            <p className="text-white font-black text-lg md:text-xl">{stats?.totalStock || 0}</p>
                            <span className="text-[8px] font-bold text-white/60 md:hidden">Units</span>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 hover:bg-white/20 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-white/60 text-xs md:text-sm" />
                                <span className="text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-widest hidden md:inline">Value</span>
                            </div>
                            <p className="text-white font-black text-xs md:text-sm">{formatCurrency(stats?.totalValue || 0)}</p>
                            <span className="text-[8px] font-bold text-white/60 md:hidden">Total</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-4">
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 bg-white rounded-3xl p-4 shadow-lg border border-gray-100"
                    >
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search brands, model lines, or products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] transition-all"
                            />
                        </div>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                            setModalPrefill({ brand: '', category: '' });
                            setShowCreateModal(true);
                        }}
                        className="bg-[#008069] text-white px-8 py-4 rounded-3xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Add Brand/Shelf</span>
                    </motion.button>
                </div>

                {/* Shelves */}
                <div className="space-y-6">
                    {filteredShelves.map((shelf, index) => (
                        <motion.div
                            key={shelf.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all"
                        >
                            {/* Shelf Header */}
                            <motion.div
                                onClick={() => toggleShelf(shelf.type)}
                                className={`bg-gradient-to-r ${shelf.color} p-5 md:p-6 cursor-pointer hover:opacity-90 transition-all relative overflow-hidden`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full"></div>
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-lg"
                                        >
                                            {shelf.icon}
                                        </motion.div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm">{shelf.type} Shelf</h2>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                                                <span className="text-white/90 text-xs md:text-sm font-bold bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">📦 {shelf.totalProducts}</span>
                                                <span className="text-white/90 text-xs md:text-sm font-bold bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">📊 {shelf.totalStock}</span>
                                                <span className="text-white/90 text-xs md:text-sm font-bold bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm hidden md:inline">💰 {formatCurrency(shelf.totalValue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalPrefill({ brand: shelf.type, category: '' });
                                                setShowCreateModal(true);
                                            }}
                                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-all hover:scale-110 active:scale-95"
                                            title="Add Category to this Shelf"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                        <motion.div
                                            animate={{ rotate: expandedShelves[shelf.type] ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className="text-white text-lg"
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Categories */}
                            <AnimatePresence>
                                {expandedShelves[shelf.type] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                            {shelf.categories.map((category, catIndex) => (
                                                <motion.div
                                                    key={category.name}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: catIndex * 0.05 }}
                                                    whileHover={{ scale: 1.03, y: -5 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => navigate(`/condition-stock/category/${shelf.type}/${category.name}`)}
                                                    className="bg-white rounded-2xl p-4 md:p-5 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-[#008069] relative overflow-hidden group"
                                                >
                                                    {/* Gradient Overlay on Hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#008069]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    <div className="relative z-10">
                                                        <h3 className="font-black text-gray-900 text-base md:text-lg mb-3 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-[#008069] rounded-full"></span>
                                                            {category.name}
                                                        </h3>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                                <span className="text-xs font-bold text-gray-600">Products:</span>
                                                                <span className="text-sm font-black text-gray-900 bg-white px-2 py-1 rounded">{category.stats.products}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                                <span className="text-xs font-bold text-gray-600">Stock:</span>
                                                                <span className="text-sm font-black text-gray-900 bg-white px-2 py-1 rounded">{category.stats.stock} units</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-[#008069]/10 to-transparent rounded-lg">
                                                                <span className="text-xs font-bold text-gray-600">Value:</span>
                                                                <span className="text-sm font-black text-[#008069]">{formatCurrency(category.stats.value)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {filteredShelves.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-12 md:p-20 text-center shadow-lg"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <FontAwesomeIcon icon={faBoxOpen} className="text-5xl md:text-6xl text-gray-200 mb-4" />
                        </motion.div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-sm text-gray-500">Try a different search term or add new products</p>
                    </motion.div>
                )}
            </div>

            {/* Product Type Manager Modal */}
            <ProductTypeManager
                show={showTypeManager}
                onClose={() => setShowTypeManager(false)}
            />

            {/* Create Product Modal */}
            <CreateProductModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    loadLibrary();
                }}
                initialBrand={modalPrefill.brand}
                initialCategory={modalPrefill.category}
            />
        </div>
    );
};

export default StockLibrary;
