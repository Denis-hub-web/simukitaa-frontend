import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faSearch, faFilter, faBarcode, faBox, faTruck,
    faCheckCircle, faExclamationTriangle, faSdCard, faPalette,
    faDownload, faRefresh
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const AllDevicesPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        condition: 'all',
        status: 'all',
        storage: 'all',
        color: 'all',
        supplier: 'all',
        simType: 'all' // NEW: SIM type filter
    });
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priceHigh, priceLow, name
    const [showFilters, setShowFilters] = useState(false);

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

            const products = productsRes.data.data || productsRes.data;
            const suppliersData = suppliersRes.data.data || suppliersRes.data;

            // Flatten all devices from all products
            const allDevices = products.flatMap(product =>
                (product.devices || []).map(device => ({
                    ...device,
                    productId: product.id,
                    productName: product.name,
                    productBrand: product.brand,
                    productModel: product.model,
                    productCategory: product.category
                }))
            );

            setDevices(allDevices);
            setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    const getConditionBadge = (condition) => {
        const badges = {
            nonActive: { label: 'Non-Active', color: 'bg-gray-100 text-gray-700' },
            active: { label: 'Active', color: 'bg-green-100 text-green-700' },
            refurbished: { label: 'Refurbished', color: 'bg-blue-100 text-blue-700' },
            used: { label: 'Used', color: 'bg-orange-100 text-orange-700' }
        };
        return badges[condition] || badges.nonActive;
    };

    const getStatusBadge = (status) => {
        const badges = {
            available: { label: 'Available', color: 'bg-emerald-100 text-emerald-700', icon: faCheckCircle },
            sold: { label: 'Sold', color: 'bg-red-100 text-red-700', icon: faCheckCircle },
            reserved: { label: 'Reserved', color: 'bg-yellow-100 text-yellow-700', icon: faExclamationTriangle }
        };
        return badges[status] || badges.available;
    };

    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : 'Unknown';
    };

    // Get unique values for filters
    const uniqueStorages = [...new Set(devices.map(d => d.variant?.storage).filter(Boolean))];
    const uniqueColors = [...new Set(devices.map(d => d.variant?.color).filter(Boolean))];
    const uniqueSimTypes = [...new Set(devices.map(d => d.simType).filter(Boolean))];

    // Apply filters and sorting
    const filteredAndSortedDevices = devices
        .filter(device => {
            // Search filter
            const matchesSearch =
                device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                device.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                device.productBrand.toLowerCase().includes(searchQuery.toLowerCase());

            // Condition filter
            const matchesCondition = filters.condition === 'all' || device.condition === filters.condition;

            // Status filter
            const matchesStatus = filters.status === 'all' || device.status === filters.status;

            // Storage filter
            const matchesStorage = filters.storage === 'all' || device.variant?.storage === filters.storage;

            // Color filter
            const matchesColor = filters.color === 'all' || device.variant?.color === filters.color;

            // Supplier filter
            const matchesSupplier = filters.supplier === 'all' || device.supplierId === filters.supplier;

            // SIM Type filter
            const matchesSimType = filters.simType === 'all' || device.simType === filters.simType;

            return matchesSearch && matchesCondition && matchesStatus && matchesStorage && matchesColor && matchesSupplier && matchesSimType;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.addedAt) - new Date(a.addedAt);
            if (sortBy === 'oldest') return new Date(a.addedAt) - new Date(b.addedAt);
            if (sortBy === 'priceHigh') return (b.price || 0) - (a.price || 0);
            if (sortBy === 'priceLow') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'name') return a.productName.localeCompare(b.productName);
            return 0;
        });

    // Statistics
    const stats = {
        total: devices.length,
        available: devices.filter(d => d.status === 'available').length,
        sold: devices.filter(d => d.status === 'sold').length,
        reserved: devices.filter(d => d.status === 'reserved').length,
        totalValue: devices.reduce((sum, d) => sum + (d.price || 0), 0)
    };

    const handleExport = () => {
        // Implementation for CSV export could go here
        alert('Exporting to CSV... (Coming Soon)');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Loading devices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/stock-management')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Stock</span>
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faRefresh} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Title & Stats */}
                <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                    <h1 className="text-3xl font-black text-gray-900 mb-4">All Devices Inventory</h1>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                            <div className="text-2xl font-black text-indigo-600">{stats.total}</div>
                            <div className="text-sm text-gray-600 font-semibold">Total Devices</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                            <div className="text-2xl font-black text-green-600">{stats.available}</div>
                            <div className="text-sm text-gray-600 font-semibold">Available</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                            <div className="text-2xl font-black text-red-600">{stats.sold}</div>
                            <div className="text-sm text-gray-600 font-semibold">Sold</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                            <div className="text-2xl font-black text-yellow-600">{stats.reserved}</div>
                            <div className="text-sm text-gray-600 font-semibold">Reserved</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <div className="text-xl font-black text-blue-600">{stats.totalValue.toLocaleString()}</div>
                            <div className="text-sm text-gray-600 font-semibold">Total Value (TZS)</div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100 mb-6">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by serial number, product name, or brand..."
                                className="w-full !pl-14 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${showFilters
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <FontAwesomeIcon icon={faFilter} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t-2 border-gray-100">
                                    {/* Condition Filter */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                                        <select
                                            value={filters.condition}
                                            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Conditions</option>
                                            <option value="nonActive">Non-Active</option>
                                            <option value="active">Active</option>
                                            <option value="refurbished">Refurbished</option>
                                            <option value="used">Used</option>
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="available">Available</option>
                                            <option value="sold">Sold</option>
                                            <option value="reserved">Reserved</option>
                                        </select>
                                    </div>

                                    {/* SIM Type Filter */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">📶 SIM Type</label>
                                        <select
                                            value={filters.simType}
                                            onChange={(e) => setFilters({ ...filters, simType: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All SIM Types</option>
                                            <option value="ESIM">📶 eSIM</option>
                                            <option value="PHYSICAL_SIM">📱 Physical SIM</option>
                                            <option value="DUAL_SIM">📱📶 Dual SIM</option>
                                        </select>
                                    </div>

                                    {/* Storage Filter */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Storage</label>
                                        <select
                                            value={filters.storage}
                                            onChange={(e) => setFilters({ ...filters, storage: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Storage</option>
                                            {uniqueStorages.map(storage => (
                                                <option key={storage} value={storage}>{storage}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Color Filter */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                                        <select
                                            value={filters.color}
                                            onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Colors</option>
                                            {uniqueColors.map(color => (
                                                <option key={color} value={color}>{color}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Supplier Filter */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Supplier</label>
                                        <select
                                            value={filters.supplier}
                                            onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Suppliers</option>
                                            {suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="text-sm text-gray-600 font-semibold">
                        Showing {filteredAndSortedDevices.length} of {devices.length} devices
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-700">Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-sm font-semibold text-gray-700"
                        >
                            <option value="newest">Newest Added</option>
                            <option value="oldest">Oldest Added</option>
                            <option value="priceHigh">Price: High to Low</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="name">Product Name</option>
                        </select>
                    </div>
                </div>

                {/* Devices List */}
                <div className="space-y-3">
                    {filteredAndSortedDevices.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                            <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Devices Found</h3>
                            <p className="text-gray-600">
                                {searchQuery || Object.values(filters).some(f => f !== 'all')
                                    ? 'Try adjusting your search or filters'
                                    : 'No devices in inventory yet'}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredAndSortedDevices.map((device, index) => {
                                const conditionBadge = getConditionBadge(device.condition);
                                const statusBadge = getStatusBadge(device.status);

                                return (
                                    <motion.div
                                        key={device.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border-2 border-gray-100 hover:border-indigo-200"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Serial Number & Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FontAwesomeIcon icon={faBarcode} className="text-indigo-500" />
                                                    <span className="text-lg font-black text-gray-900 font-mono">{device.serialNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <FontAwesomeIcon icon={faBox} className="text-gray-400" />
                                                    <strong>{device.productBrand}</strong> {device.productName}
                                                    {device.productModel && <span>• {device.productModel}</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* SIM Type Badge */}
                                                    {device.simType && (
                                                        <span className={`px-3 py-1 rounded-lg font-bold text-xs ${
                                                            device.simType === 'ESIM' ? 'bg-blue-100 text-blue-700' :
                                                            device.simType === 'DUAL_SIM' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {device.simType === 'ESIM' ? '📶 eSIM' :
                                                             device.simType === 'DUAL_SIM' ? '📱📶 Dual SIM' :
                                                             '📱 Physical SIM'}
                                                        </span>
                                                    )}
                                                    
                                                    <span className={`px-3 py-1 rounded-lg font-bold text-xs ${conditionBadge.color}`}>
                                                        {conditionBadge.label}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${statusBadge.color}`}>
                                                        <FontAwesomeIcon icon={statusBadge.icon} />
                                                        {statusBadge.label}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faSdCard} />
                                                        {device.variant?.storage}
                                                    </span>
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-bold text-xs flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faPalette} />
                                                        {device.variant?.color}
                                                    </span>
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-bold text-xs flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faTruck} />
                                                        {getSupplierName(device.supplierId)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price & Date */}
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-gray-900">
                                                    {device.price.toLocaleString()} TZS
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Added {new Date(device.addedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllDevicesPage;
