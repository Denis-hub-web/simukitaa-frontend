import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPlus, faBox, faSearch, faFilter, faTruck,
    faExclamationTriangle, faCheckCircle, faBarcode, faEdit,
    faEye, faCubes, faLayerGroup, faPalette, faSdCard, faTags
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StockManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [productsRes, suppliersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/stock/products`, { headers }),
                axios.get(`${API_BASE_URL}/suppliers`, { headers })
            ]);

            // Handle different API response formats
            const productsData = Array.isArray(productsRes.data)
                ? productsRes.data
                : (productsRes.data.data || productsRes.data.products || []);

            const suppliersData = Array.isArray(suppliersRes.data)
                ? suppliersRes.data
                : (suppliersRes.data.data || []);

            setProducts(Array.isArray(productsData) ? productsData : []);
            setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setProducts([]);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const tabs = [
        { id: 'all', label: 'All Products', icon: faCubes },
        { id: 'supplier', label: 'By Supplier', icon: faTruck },
        { id: 'lowStock', label: 'Low Stock', icon: faExclamationTriangle }
    ];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSupplier = selectedSupplier === 'all' || p.supplierId === selectedSupplier;

        const matchesTab = activeTab === 'all' ? true :
            activeTab === 'lowStock' ? (p.stockSummary?.total || 0) < 5 :
                activeTab === 'supplier' ? matchesSupplier : true;

        return matchesSearch && matchesTab;
    });

    const totalStock = products.reduce((sum, p) => sum + (p.stockSummary?.total || 0), 0);
    const lowStockCount = products.filter(p => (p.stockSummary?.total || 0) < 5).length;
    const totalValue = products.reduce((sum, p) => sum + (p.stockSummary?.totalValue || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FontAwesomeIcon icon={faBox} className="text-indigo-600" />
                        Stock Management
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/stock-management/all-devices')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faCubes} />
                            <span className="hidden sm:inline">All Devices</span>
                        </button>
                        <button
                            onClick={() => navigate('/stock-management/add-product')}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span className="hidden sm:inline">Add Product</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-sm">
                        <div className="text-3xl font-black text-blue-600 mb-1">{products.length}</div>
                        <div className="text-sm text-gray-600 font-semibold">Products</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border-2 border-green-100 shadow-sm">
                        <div className="text-3xl font-black text-green-600 mb-1">{totalStock}</div>
                        <div className="text-sm text-gray-600 font-semibold">Total Devices</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border-2 border-orange-100 shadow-sm">
                        <div className="text-3xl font-black text-orange-600 mb-1">{lowStockCount}</div>
                        <div className="text-sm text-gray-600 font-semibold">Low Stock</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border-2 border-purple-100 shadow-sm">
                        <div className="text-3xl font-black text-purple-600 mb-1">
                            TZS {(totalValue / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">Total Value</div>
                    </div>
                </motion.div>

                {/* Top Navigation Tabs */}
                <div className="bg-white rounded-2xl p-3 shadow-sm border-2 border-gray-100 mb-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by product name, model, brand, or serial..."
                                className="w-full !pl-14 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                            />
                        </div>
                        {activeTab === 'supplier' && (
                            <div className="relative">
                                <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    className="!pl-14 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all bg-white"
                                >
                                    <option value="all">All Suppliers</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product List - Stripe Design */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-semibold">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Get started by adding your first product'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate('/stock-management/add-product')}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Add First Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border-2 border-gray-100 hover:border-indigo-200"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Product Icon */}
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faBox} className="text-2xl text-indigo-600" />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-black text-gray-900 break-words">{product.name}</h3>
                                                {(product.stockSummary?.total || 0) < 5 && (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg whitespace-nowrap">
                                                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faLayerGroup} className="text-blue-500" />
                                                    {product.stockSummary?.total || 0} devices
                                                </span>
                                                {product.brand && (
                                                    <span className="flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faCubes} className="text-green-500" />
                                                        {product.brand}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faTags} className="text-purple-500" />
                                                    {product.category || 'Phones'}
                                                </span>
                                            </div>

                                            {/* Condition Breakdown */}
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-black uppercase text-gray-600 border border-gray-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                    N-Active: {product.stockSummary?.byCondition?.nonActive || 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg text-[10px] font-black uppercase text-green-600 border border-green-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                    Active: {product.stockSummary?.byCondition?.active || 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg text-[10px] font-black uppercase text-blue-600 border border-blue-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                    Refurb: {product.stockSummary?.byCondition?.refurbished || 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-lg text-[10px] font-black uppercase text-orange-600 border border-orange-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                                    Used: {product.stockSummary?.byCondition?.used || 0}
                                                </div>
                                            </div>

                                            {/* Storage Variants */}
                                            {product.variants?.storage && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {product.variants.storage.map(s => (
                                                        <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded border border-indigo-100">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/stock-management/add-device/${product.id}`)}
                                                className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                                title="Add Device"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/stock-management/devices/${product.id}`)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                title="View Devices"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/stock-management/edit-product/${product.id}`)}
                                                className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                                                title="Edit Product"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockManagement;
