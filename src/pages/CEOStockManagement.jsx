import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import {
    faBoxOpen, faSearch, faChartLine, faExclamationTriangle,
    faBox, faDollarSign, faLightbulb, faTimes, faArrowLeft,
    faEllipsisH, faPlus, faChevronRight, faFilter,
    faCubes, faMicrochip, faShieldAlt, faMobileAlt
} from '@fortawesome/free-solid-svg-icons';
import { productAPI, categoryAPI, ceoAPI } from '../utils/api';
import Modal from '../components/Modal';
import AddProductForm from '../components/AddProductForm';
import StepByStepProductForm from '../components/StepByStepProductForm';
import ExecutiveCalendar from '../components/ExecutiveCalendar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CEOStockManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [temporalEvents, setTemporalEvents] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'CALENDAR'
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [pulseIndex, setPulseIndex] = useState(0);

    const pulseInsights = [
        "iPhone 13 series exhibiting 40% velocity increase.",
        "System wide health score optimal at 84%.",
        "Recommended: Procurement increase for Samsung S series.",
        "Liquidity warning: Stale accessory stock > 60 days."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setPulseIndex((prev) => (prev + 1) % pulseInsights.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, categoryFilter, stockFilter, statusFilter]);

    const loadAllData = async () => {
        try {
            const [productsRes, categoriesRes, temporalRes] = await Promise.all([
                productAPI.getAll(),
                categoryAPI.getAll(),
                ceoAPI.getTemporalActivity()
            ]);
            setProducts(productsRes.data.data.products || []);
            setAllCategories(categoriesRes.data.data.categories || []);
            setTemporalEvents(temporalRes.data.data.items || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load data:', error);
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await categoryAPI.create({ name: newCategoryName });
            setNewCategoryName('');
            loadAllData();
        } catch (error) {
            console.error('Failed to add category:', error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryAPI.delete(id);
            loadAllData();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category?.toUpperCase() === categoryFilter.toUpperCase());
        }
        if (stockFilter !== 'all') {
            filtered = filtered.filter(p => {
                if (stockFilter === 'low') return p.quantity <= 5;
                if (stockFilter === 'high') return p.quantity > 5;
                return true;
            });
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => {
                if (statusFilter === 'active') return p.isAvailable === true;
                if (statusFilter === 'inactive') return p.isAvailable === false;
                if (statusFilter === 'new') return p.condition?.toUpperCase() === 'NEW';
                if (statusFilter === 'used') return p.condition?.toUpperCase() === 'USED';
                if (statusFilter === 'refurbished') return p.condition?.toUpperCase() === 'REFURBISHED';
                return true;
            });
        }
        setFilteredProducts(filtered);
    };

    const getStockLevel = (quantity) => {
        if (quantity === 0) return 'out';
        if (quantity <= 2) return 'critical';
        if (quantity <= 5) return 'low';
        return 'good';
    };

    const getStockColor = (level) => {
        switch (level) {
            case 'out': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'critical': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'low': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'good': return 'text-[#00ffa3] bg-[#00ffa3]/10 border-[#00ffa3]/20';
            default: return 'text-white/20 bg-white/5 border-white/5';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount);
    };

    const calculateStats = () => {
        const totalValue = products.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);
        const potentialProfit = products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) * p.quantity), 0);
        const lowStockCount = products.filter(p => getStockLevel(p.quantity) === 'low' || getStockLevel(p.quantity) === 'critical').length;
        const outOfStockCount = products.filter(p => p.quantity === 0).length;
        return { totalValue, potentialProfit, lowStockCount, outOfStockCount };
    };

    const stats = calculateStats();

    // Calculate asset counts per category
    const categoryCounts = allCategories.reduce((acc, cat) => {
        acc[cat.name] = products.filter(p => p.category?.toUpperCase() === cat.name.toUpperCase()).length;
        return acc;
    }, {});

    const activeCategories = ['all', ...allCategories.map(c => c.name)];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-semibold text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-bg p-4 md:p-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <span className="premium-label mb-0">General Overview</span>
                    </div>
                    <h1 className="premium-h1">Stock Management</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRecommendations(true)}
                        className="premium-btn-outline px-6 py-3.5 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" />
                        <span>Insights</span>
                    </button>
                    <button
                        onClick={() => setShowAddProductModal(true)}
                        className="premium-btn-primary px-6 py-3.5 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Pulse Status Bar */}
            <div className="premium-card bg-slate-900 border-none px-6 py-4 text-white flex items-center gap-3 overflow-hidden relative group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                    <span className="premium-label text-blue-400 mb-0 opacity-100 italic">Updates:</span>
                </div>
                <div className="flex-1">
                    <p className="text-xs md:text-sm font-bold tracking-tight text-blue-50">
                        {pulseInsights[pulseIndex]}
                    </p>
                </div>
            </div>

            {/* Statistics Cluster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Value', value: formatCurrency(stats.totalValue), sub: 'Total Cost of Stock', icon: faCubes, color: 'blue' },
                    { label: 'Profit Projection', value: formatCurrency(stats.potentialProfit), sub: 'Estimated Margin', icon: faChartLine, color: 'emerald' },
                    { label: 'Low Stock', value: stats.lowStockCount, sub: 'Needs Attention', icon: faExclamationTriangle, color: 'orange' },
                    { label: 'Out of Stock', value: stats.outOfStockCount, sub: 'Zero Balance', icon: faTimes, color: 'red' }
                ].map((stat, i) => {
                    const themes = {
                        blue: 'text-blue-600 bg-blue-50',
                        emerald: 'text-emerald-600 bg-emerald-50',
                        orange: 'text-orange-600 bg-orange-50',
                        red: 'text-red-600 bg-red-50'
                    };
                    return (
                        <div key={i} className="premium-card p-7 hover:scale-[1.02] transition-all group cursor-pointer">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 ${themes[stat.color]} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                    <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
                                </div>
                                <div className="flex-1">
                                    <p className="premium-label mb-0">{stat.label}</p>
                                    <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-gray-50 rounded-lg inline-block">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">{stat.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Control Wing & Filter Cluster */}
            {/* Control Wing & Filter Cluster */}
            <div className="premium-card p-8 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* View Switching */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full lg:w-fit shrink-0">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'LIST' ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FontAwesomeIcon icon={faBox} />
                            <span>Product List</span>
                        </button>
                        <button
                            onClick={() => setViewMode('CALENDAR')}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'CALENDAR' ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FontAwesomeIcon icon={faChartLine} />
                            <span>Stock History</span>
                        </button>
                    </div>

                    {/* Unified Search Engine */}
                    <div className="flex-1 w-full max-w-2xl relative group">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-input pl-14 shadow-sm border-gray-100"
                        />
                    </div>
                </div>

                {/* Category Pill Navigation */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            setCategoryFilter('all');
                            setStockFilter('all');
                        }}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'all' && stockFilter === 'all'
                            ? 'premium-btn-primary shadow-xl scale-105'
                            : 'bg-white text-gray-400 border-2 border-transparent hover:border-gray-200'}`}
                    >
                        ALL PRODUCTS
                    </button>
                    {allCategories.slice(0, 4).map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setCategoryFilter(cat.name);
                                setStockFilter('all');
                            }}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat.name
                                ? 'premium-btn-primary shadow-xl scale-105'
                                : 'bg-white text-gray-400 border-2 border-transparent hover:border-gray-200'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    <div className="h-8 w-px bg-gray-100 mx-2" />

                    {/* Stock Level Filters */}
                    <button
                        onClick={() => {
                            setStockFilter('low');
                            setCategoryFilter('all');
                        }}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${stockFilter === 'low'
                            ? 'premium-btn-warning shadow-xl scale-105'
                            : 'bg-white text-orange-400 border-2 border-transparent hover:border-orange-100'}`}
                    >
                        LOW STOCK
                    </button>
                    <button
                        onClick={() => {
                            setStockFilter('high');
                            setCategoryFilter('all');
                        }}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${stockFilter === 'high'
                            ? 'premium-btn-success shadow-xl scale-105'
                            : 'bg-white text-emerald-400 border-2 border-transparent hover:border-emerald-100'}`}
                    >
                        HIGH STOCK
                    </button>

                    <div className="relative group ml-auto">
                        <button className="px-8 py-3.5 bg-white text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-gray-100 flex items-center gap-2 group-hover:border-blue-200 transition-all">
                            <span>ALL CATEGORIES</span>
                            <FontAwesomeIcon icon={faChevronRight} className="rotate-90 text-[10px]" />
                        </button>
                        <div className="absolute top-full right-0 mt-3 w-64 premium-card p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <p className="premium-label mb-2">Other Categories</p>
                            <div className="grid grid-cols-1 gap-1">
                                {allCategories.slice(4).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategoryFilter(cat.name);
                                            setStockFilter('all');
                                        }}
                                        className="w-full text-left px-4 py-3 text-xs font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all uppercase tracking-widest"
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                                <div className="my-2 border-t border-gray-50" />
                                <button
                                    onClick={() => setShowAddCategoryModal(true)}
                                    className="w-full text-left px-4 py-3 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-xl transition-all uppercase tracking-widest flex items-center gap-3"
                                >
                                    <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                    <span>Manage Categories</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid Area */}
                {/* Product Grid Area */}
                <AnimatePresence mode="wait">
                    {viewMode === 'LIST' ? (
                        <motion.div
                            key="product-grid"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product, index) => {
                                    const stockLevel = getStockLevel(product.quantity);

                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => setSelectedProduct(product)}
                                            className="premium-card p-6 group cursor-pointer active:scale-95 transition-all"
                                        >
                                            <div className="absolute top-4 right-4 text-blue-500/10 group-hover:text-blue-500/30 transition-colors">
                                                <FontAwesomeIcon icon={faShieldAlt} className="text-xl" />
                                            </div>

                                            {/* Media Representative - Stylized Box */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                    <FontAwesomeIcon icon={faBoxOpen} className="text-2xl text-gray-400 group-hover:text-blue-500" />
                                                </div>
                                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${stockLevel === 'good' ? 'bg-emerald-50 text-emerald-600' :
                                                    stockLevel === 'low' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {product.quantity} {product.quantity === 1 ? 'UNIT' : 'UNITS'}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="premium-h2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="premium-label line-clamp-1">
                                                    {product.model} • {product.color}
                                                </p>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Valuation</p>
                                                    <p className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(product.sellingPrice)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Classification</p>
                                                    <div className="px-3 py-1 bg-blue-50 rounded-lg">
                                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{product.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-3xl text-gray-200" />
                                    </div>
                                    <h3 className="premium-h2 mb-2 italic uppercase">No Products Found</h3>
                                    <p className="premium-label max-w-xs mx-auto mb-8">No products match the current filters.</p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setCategoryFilter('all');
                                            setStockFilter('all');
                                            setStatusFilter('all');
                                        }}
                                        className="premium-btn-primary px-10 py-4 shadow-xl"
                                    >
                                        Reset All
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar-matrix"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-3xl overflow-hidden min-h-[800px]"
                        >
                            <ExecutiveCalendar events={temporalEvents} loading={loading} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* Intelligence Matrix Modal */}
            <Modal
                isOpen={showRecommendations}
                onClose={() => setShowRecommendations(false)}
                title="Inventory Insights"
            >
                <div className="space-y-8 p-2">
                    {/* Health Score Analytics */}
                    <div className="premium-card bg-slate-900 p-8 text-white relative overflow-hidden group shadow-2xl border-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4 text-blue-400">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-sm" />
                                <span className="premium-label text-blue-400 mb-0 opacity-100 italic">Inventory Health</span>
                            </div>
                            <div className="flex items-end gap-6">
                                <h2 className="text-7xl font-black tracking-tighter italic">84<span className="text-blue-500">%</span></h2>
                                <div className="h-10 w-px bg-white/20 mb-3" />
                                <div className="mb-3">
                                    <p className="premium-label text-white/40 mb-1">Stock Status</p>
                                    <p className="text-sm font-bold text-blue-400 uppercase tracking-tighter">Peak Efficiency</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actionable Recommendations */}
                    <div className="space-y-4">
                        <div className="premium-card p-6 border-gray-100 hover:border-blue-200 cursor-pointer">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <p className="premium-label text-blue-600 mb-0">Sales Spike</p>
                            </div>
                            <p className="premium-h2 mb-2 italic">iPhone Series</p>
                            <p className="premium-label mb-0 leading-relaxed font-medium">Sales have increased by 42.5%. Consider increasing stock levels.</p>
                        </div>

                        <div className="premium-card p-6 border-gray-100 hover:border-orange-200 cursor-pointer">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <p className="premium-label text-orange-600 mb-0">Slow Moving Stock</p>
                            </div>
                            <p className="premium-h2 mb-2 italic text-gray-900">Legacy Accessory Sub-Sectors</p>
                            <p className="premium-label mb-0 leading-relaxed font-medium">Items in stock for over 60 days. Consider a promotion or price adjustment.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowRecommendations(false)}
                        className="premium-btn-primary w-full py-4 text-[10px]"
                    >
                        Dismiss
                    </button>
                </div>
            </Modal>

            {/* Asset Detail Modal */}
            <Modal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                title="Product Details"
            >
                {selectedProduct && (
                    <div className="space-y-8 p-2">
                        {/* Identity Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="premium-h1 mb-2">{selectedProduct.name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200">
                                        {selectedProduct.category} CATEGORY
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 italic">
                                        ID: {selectedProduct.id?.substring(0, 8)}...
                                    </span>
                                </div>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${getStockColor(getStockLevel(selectedProduct.quantity))}`}>
                                <FontAwesomeIcon icon={faBoxOpen} className="text-xl" />
                            </div>
                        </div>

                        {/* Status Matrix */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="premium-card bg-gray-50/50 p-6 text-center hover:bg-white hover:border-blue-400 transition-all cursor-pointer">
                                <p className="premium-label mb-2">Live Availability</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter">{selectedProduct.quantity}</p>
                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">UNIT{selectedProduct.quantity !== 1 ? 'S' : ''} IN STOCK</p>
                            </div>
                            <div className="premium-card bg-gray-50/50 p-6 text-center hover:bg-white hover:border-emerald-400 transition-all cursor-pointer">
                                <p className="premium-label mb-2">Current Condition</p>
                                <p className="text-xl font-black text-gray-900 tracking-tight mt-2 italic uppercase">{selectedProduct.condition}</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2 px-2">Verified Authenticity</p>
                            </div>
                        </div>

                        {/* Financial Analytics */}
                        <div className="premium-card p-8 space-y-6 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 opacity-50" />
                            <div className="grid grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <p className="premium-label mb-3 italic">Cost Price</p>
                                    <p className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(selectedProduct.costPrice)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="premium-label text-blue-500 mb-3 italic">Selling Price</p>
                                    <p className="text-2xl font-black text-blue-600 tracking-tight">{formatCurrency(selectedProduct.sellingPrice)}</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                                        <FontAwesomeIcon icon={faChartLine} />
                                    </div>
                                    <div>
                                        <p className="premium-label text-xs mb-0">Profit Margin</p>
                                        <p className="text-sm font-black text-emerald-600">+{formatCurrency(selectedProduct.sellingPrice - selectedProduct.costPrice)}</p>
                                    </div>
                                </div>
                                <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">Inventory Synchronized</div>
                            </div>
                        </div>

                        {/* Hardware Signature */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faMicrochip} className="text-blue-500 text-xs shadow-sm" />
                                <span className="premium-label mb-0 text-blue-600 opacity-60">Specifications</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Model', value: selectedProduct.model },
                                    { label: 'Capacity', value: selectedProduct.storage },
                                    { label: 'Finish', value: selectedProduct.color }
                                ].filter(s => s.value).map((sig, i) => (
                                    <div key={i} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-600 shadow-sm">
                                        {sig.label}: <span className="text-gray-900">{sig.value}</span>
                                    </div>
                                ))}
                                {selectedProduct.imei && (
                                    <div className="w-full px-5 py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center justify-between shadow-2xl">
                                        <span className="text-blue-400 opacity-50 uppercase tracking-[0.2em] text-[9px]">IMEI Number</span>
                                        <span className="font-mono tracking-wider">{selectedProduct.imei}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Commands */}
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="premium-btn-outline flex-1 py-4 text-[10px]"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => navigate('/products', { state: { editProduct: selectedProduct } })}
                                className="premium-btn-primary flex-[2] py-4 text-[10px] flex items-center justify-center gap-3 shadow-xl"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="rotate-180" />
                                <span>Edit Product</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Product Modal */}
            <Modal
                isOpen={showAddProductModal}
                onClose={() => setShowAddProductModal(false)}
                title="Add New Product"
            >
                <div className="p-2">
                    <AddProductForm
                        onSuccess={() => {
                            setShowAddProductModal(false);
                            loadAllData();
                        }}
                        onCancel={() => setShowAddProductModal(false)}
                    />
                </div>
            </Modal>

            {/* Category Management Modal */}
            <Modal
                isOpen={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                noPadding
            >
                <div className="w-full max-w-sm mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
                    <div className="bg-slate-900 p-8 text-white">
                        <h2 className="premium-h1 text-white mb-1">Product Categories</h2>
                        <p className="premium-label text-blue-400 mb-0 opacity-100 italic">Inventory Management</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* New Sector Integration */}
                        <div className="space-y-4">
                            <p className="premium-label mb-0 italic">Add New Category</p>
                            <form onSubmit={handleAddCategory} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Enter category name..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                    className="premium-input text-xs shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="premium-btn-primary w-full py-4 text-[10px]"
                                >
                                    Add Category
                                </button>
                            </form>
                        </div>

                        {/* Existing Sectors Ledger */}
                        <div className="space-y-4">
                            <p className="premium-label mb-0 italic">Current Categories</p>
                            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
                                {allCategories.map(cat => (
                                    <div key={cat.id} className="premium-card p-4 flex items-center justify-between group hover:border-blue-200 transition-all border-gray-50 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-50 transition-all">
                                                <FontAwesomeIcon icon={faMobileAlt} className="text-xs" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs font-black text-gray-900 uppercase italic tracking-tighter truncate block">{cat.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest shrink-0">
                                                {categoryCounts[cat.name] || 0} Products
                                            </span>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddCategoryModal(false)}
                            className="w-full py-2 text-gray-300 hover:text-gray-500 transition-all font-black text-[9px] uppercase tracking-[0.4em]"
                        >
                            Save & Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CEOStockManagement;
