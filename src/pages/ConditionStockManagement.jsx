import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPlus, faSearch, faRobot, faChartLine,
    faBoxOpen, faMoneyBillWave, faExclamationTriangle,
    faMobileAlt, faEdit, faTrash, faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ConditionStockManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';
    const isManager = user?.role === 'MANAGER';

    useEffect(() => {
        if (!isCEO && !isManager) {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [productsRes, statsRes, insightsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/condition-stock`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/condition-stock/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/condition-stock/ai/insights`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setProducts(productsRes.data.data.products || []);
            setStats(statsRes.data.data || {});
            setAiInsights(insightsRes.data.data.insights || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load data:', error);
            setLoading(false);
        }
    };

    const handleAddStock = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/condition-stock/add`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            await loadData();
        } catch (error) {
            alert('Failed to add stock: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/condition-stock/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadData();
        } catch (error) {
            alert('Failed to delete product: ' + (error.response?.data?.error || error.message));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getConditionColor = (condition) => {
        const colors = {
            nonActive: 'bg-blue-100 text-blue-700 border-blue-200',
            active: 'bg-green-100 text-green-700 border-green-200',
            used: 'bg-orange-100 text-orange-700 border-orange-200',
            refurbished: 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return colors[condition] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getConditionIcon = (condition) => {
        const icons = {
            nonActive: '🆕',
            active: '📱',
            used: '👤',
            refurbished: '🔧'
        };
        return icons[condition] || '📦';
    };

    const getConditionName = (condition) => {
        const names = {
            nonActive: 'Non-Active',
            active: 'Active',
            used: 'Used',
            refurbished: 'Refurbished'
        };
        return names[condition] || condition;
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Loading AI Stock System...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen premium-bg pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-2xl sticky top-0 z-[50] border-b border-white/40 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/dashboard')}
                                className="premium-btn-outline w-12 h-12 flex items-center justify-center rounded-2xl"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </motion.button>
                            <div className="flex flex-col">
                                <span className="premium-label text-blue-600 mb-1">Stock System</span>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Condition Stock Hub</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-[#0a0a0b]/5 rounded-2xl border border-black/5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#0a0a0b]/60">Live Inventory Sync Active</p>
                            </div>

                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/condition-stock')}
                                className="premium-btn-outline px-6 py-3 flex items-center gap-2"
                            >
                                <span className="text-lg">📚</span>
                                <span className="text-[10px] uppercase font-black tracking-widest">Library View</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card p-6 border-white/80 group hover:border-blue-500/20"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                </div>
                                <span className="premium-label text-[10px] opacity-60">Catalogue</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats?.totalProducts || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">Unique SKUs</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="premium-card p-6 border-white/80 group hover:border-emerald-500/20"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faChartLine} />
                                </div>
                                <span className="premium-label text-[10px] opacity-60">Volume</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats?.totalStock || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">Net Units</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="premium-card p-6 border-white/80 group hover:border-indigo-500/20"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faMoneyBillWave} />
                                </div>
                                <span className="premium-label text-[10px] opacity-60">Equity</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(stats?.totalValue || 0).split(',')[0]}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-2">Valuation</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="premium-card p-6 border-white/80 group hover:border-rose-500/20"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                </div>
                                <span className="premium-label text-[10px] opacity-60">Critical</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats?.lowStockCount || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mt-1">Refill Alerts</p>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 mt-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* AI Insights - Neural Stock Intelligence */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#0a0a0b] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                            <div className="relative z-10 flex items-center gap-5 mb-10">
                                <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-3xl flex items-center justify-center text-3xl border border-white/10 group-hover:rotate-6 transition-transform">
                                    <FontAwesomeIcon icon={faRobot} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter">Neural Stock</h3>
                                    <p className="premium-label text-blue-400 text-[10px] tracking-[0.2em]">Inventory Intelligence</p>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {aiInsights.length === 0 ? (
                                    <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/5">
                                        <p className="premium-label text-xs opacity-40 italic font-medium leading-relaxed">System syncing... Data harvesting in progress for predictive analytics.</p>
                                    </div>
                                ) : (
                                    aiInsights.map((insight, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white/[0.03] backdrop-blur-3xl rounded-[2rem] p-6 border border-white/5 hover:bg-white/[0.05] transition-all group/insight"
                                        >
                                            <div className="flex items-start gap-5">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover/insight:scale-110 transition-transform">
                                                    {insight.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-black tracking-tight mb-1 text-white/90">{insight.title}</p>
                                                    <p className="text-[11px] font-medium text-white/50 leading-relaxed mb-4">{insight.description}</p>
                                                    {insight.action && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all"
                                                        >
                                                            {insight.action}
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products & Controls */}
                    <div className="lg:col-span-8">
                        {/* Search & Actions System */}
                        <div className="premium-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center bg-white/60">
                            <div className="flex-1 relative w-full">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Scan SKU or Search Registry..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="premium-input pl-16 w-full text-base font-bold"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowAddModal(true)}
                                className="premium-btn-primary px-8 py-4 flex items-center gap-3 whitespace-nowrap shadow-xl shadow-blue-600/20 w-full md:w-auto"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Inject Stock</span>
                            </motion.button>
                        </div>

                        {/* Product Catalogue Grid */}
                        <div className="space-y-6">
                            {filteredProducts.map((product, idx) => (
                                <ProductCard
                                    key={product.id}
                                    index={idx}
                                    product={product}
                                    onDelete={handleDeleteProduct}
                                    formatCurrency={formatCurrency}
                                    getConditionColor={getConditionColor}
                                    getConditionIcon={getConditionIcon}
                                    getConditionName={getConditionName}
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="premium-card p-24 text-center bg-white/40"
                            >
                                <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-300">
                                    <FontAwesomeIcon icon={faBoxOpen} className="text-4xl" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">No Assets Detected</h3>
                                <p className="premium-label text-xs opacity-50 uppercase tracking-widest">Adjust search filters or add new stock to the registry</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Stock Modal */}
            <AddStockModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddStock}
                products={products}
            />
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product, index, onDelete, formatCurrency, getConditionColor, getConditionIcon, getConditionName }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="premium-card p-10 bg-white/80 hover:shadow-2xl transition-all border-white/60 group overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform" />

            <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="flex gap-6">
                    <div className="w-16 h-16 bg-[#0a0a0b] rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl group-hover:rotate-3 transition-transform">
                        <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{product.name}</h3>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100">
                                {product.category}
                            </span>
                        </div>
                        <p className="premium-label text-xs opacity-50 font-bold uppercase tracking-widest">{product.model} • {product.color || 'STNDRD'}</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(product.id)}
                    className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                </motion.button>
            </div>

            {/* Condition Breakdown Ledger */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.stockByCondition && Object.entries(product.stockByCondition).map(([condition, data]) => {
                    if (data.quantity === 0) return null;
                    const cColor = getConditionColor(condition);
                    return (
                        <div
                            key={condition}
                            className={`flex justify-between items-center p-5 rounded-[1.5rem] border-2 transition-all hover:shadow-lg ${cColor.replace('bg-', 'bg-white/50 border-')}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl filter drop-shadow-sm">{getConditionIcon(condition)}</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{getConditionName(condition)}</span>
                                    <span className="text-lg font-black text-gray-900 leading-none">{data.quantity} <span className="text-[10px] text-gray-400">UNITS</span></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-blue-600 tracking-widest block mb-1">UNIT VALUE</span>
                                <span className="text-sm font-black text-gray-900">{formatCurrency(data.sellingPrice)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="relative z-10 border-t border-gray-100/50 mt-8 pt-8 flex justify-between items-end">
                <div>
                    <p className="premium-label text-[10px] opacity-40 mb-1">INVENTORY STATUS</p>
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${product.totalStock > 5 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <span className="text-sm font-black text-gray-900 tracking-tighter uppercase">
                            {product.totalStock > 5 ? 'Operational' : 'Critical Refill Required'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="premium-label text-[10px] opacity-40 mb-1">AGGREGATE VOLUME</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
                        {product.totalStock} <span className="text-sm text-blue-600">UNITS</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

// Add Stock Modal Component
const AddStockModal = ({ show, onClose, onSave, products }) => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [condition, setCondition] = useState('new');
    const [quantity, setQuantity] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [showCreateProduct, setShowCreateProduct] = useState(false);

    if (!show) return null;

    if (showCreateProduct) {
        return <CreateProductModal show={true} onClose={onClose} onBack={() => setShowCreateProduct(false)} />;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#0a0a0b]/60 backdrop-blur-xl"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 relative z-10 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh] custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <span className="premium-label text-blue-600 mb-1">Entry Method</span>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Inventory Injection</h3>
                    </div>
                    <motion.button
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </motion.button>
                </div>

                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Asset</label>
                            <button
                                onClick={() => setShowCreateProduct(true)}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-600/20 hover:border-blue-600"
                            >
                                + New SKU
                            </button>
                        </div>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="premium-input w-full"
                        >
                            <option value="">Select Asset from Registry...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Condition Grade</label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="premium-input w-full"
                            >
                                <option value="new">Brand New</option>
                                <option value="a">Grade A (Mint)</option>
                                <option value="b">Grade B (Used)</option>
                                <option value="c">Grade C (Fixed)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Batch Quantity</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="00"
                                className="premium-input w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Acquisition Cost</label>
                            <input
                                type="number"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                placeholder="KES 0.00"
                                className="premium-input w-full"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Target Selling Price</label>
                            <input
                                type="number"
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value)}
                                placeholder="KES 0.00"
                                className="premium-input w-full"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSave({ selectedProduct, condition, quantity, costPrice, sellingPrice })}
                            className="premium-btn-primary w-full py-5 text-sm shadow-xl shadow-blue-600/20"
                        >
                            Sync to Inventory Registry
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Create Product Modal Component
const CreateProductModal = ({ show, onClose, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Smartphones',
        model: '',
        color: ''
    });

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const productData = {
                id: `prod_${Date.now()}`,
                name: formData.name,
                category: formData.category,
                model: formData.model,
                color: formData.color,
                status: 'ACTIVE',
                totalStock: 0,
                stockByCondition: {
                    new: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    a: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    b: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    c: { quantity: 0, costPrice: 0, sellingPrice: 0 }
                }
            };

            await axios.post(`${API_BASE_URL}/condition-stock/create-product`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Asset SKU Registered Successfully');
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Registry Error:', error);
            alert('❌ Failed to register asset. Check authorization.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#0a0a0b]/60 backdrop-blur-xl"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 relative z-10 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh] custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ x: -2 }}
                            onClick={onBack}
                            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </motion.button>
                        <div>
                            <span className="premium-label text-blue-600 mb-1">Registry Forge</span>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">New Asset SKU</h3>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Asset Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. iPhone 15 Pro Max"
                            className="premium-input w-full"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Classification</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="premium-input w-full"
                            >
                                <option>Smartphones</option>
                                <option>Tablets</option>
                                <option>Laptops</option>
                                <option>Accessories</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Model Identifier</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="A3106"
                                className="premium-input w-full"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Color Specification</label>
                        <input
                            type="text"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            placeholder="Natural Titanium"
                            className="premium-input w-full"
                            required
                        />
                    </div>

                    <div className="pt-6">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="premium-btn-primary w-full py-5 text-sm shadow-xl shadow-blue-600/20"
                        >
                            Authorize Registry Creation
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ConditionStockManagement;
