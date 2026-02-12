import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBox, faBarcode, faPlus, faEdit, faTrash,
    faCubes, faTruck, faCheckCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ViewDevicesPage = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/stock/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const productData = response.data.data || response.data;
            setProduct(productData);
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
            navigate('/stock-management');
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

    if (!product) {
        return null;
    }

    const devices = product.devices || [];
    const filteredDevices = devices.filter(d =>
        d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <button
                        onClick={() => navigate(`/stock-management/add-device/${productId}`)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span className="hidden sm:inline">Add Device</span>
                    </button>
                </div>

                {/* Product Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faBox} className="text-indigo-600 text-2xl" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">{product.brand} {product.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                {product.model && (
                                    <span className="text-gray-600">Model: {product.model}</span>
                                )}
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">{product.category}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-indigo-600">{devices.length}</div>
                            <div className="text-sm text-gray-600 font-semibold">Total Devices</div>
                        </div>
                    </div>

                    {/* Stock Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t-2 border-gray-100">
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-700">{product.stockSummary.byCondition.nonActive}</div>
                            <div className="text-xs text-gray-500 font-semibold">Non-Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-green-600">{product.stockSummary.byCondition.active}</div>
                            <div className="text-xs text-gray-500 font-semibold">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-blue-600">{product.stockSummary.byCondition.refurbished}</div>
                            <div className="text-xs text-gray-500 font-semibold">Refurbished</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-orange-600">{product.stockSummary.byCondition.used}</div>
                            <div className="text-xs text-gray-500 font-semibold">Used</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100 mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by serial number..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                    />
                </div>

                {/* Devices List */}
                <div className="space-y-3">
                    {filteredDevices.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                            <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Devices Found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery ? 'Try a different search term' : 'Add your first device to this product'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => navigate(`/stock-management/add-device/${productId}`)}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add First Device
                                </button>
                            )}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredDevices.map((device, index) => {
                                const conditionBadge = getConditionBadge(device.condition);
                                const statusBadge = getStatusBadge(device.status);

                                return (
                                    <motion.div
                                        key={device.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border-2 border-gray-100 hover:border-indigo-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Serial Number */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FontAwesomeIcon icon={faBarcode} className="text-indigo-500" />
                                                    <span className="text-lg font-black text-gray-900 font-mono">{device.serialNumber}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                    {/* SIM Type Badge */}
                                                    {device.simType && (
                                                        <span className={`px-3 py-1 rounded-lg font-bold ${device.simType === 'ESIM' ? 'bg-blue-100 text-blue-700' :
                                                                device.simType === 'DUAL_SIM' ? 'bg-indigo-100 text-indigo-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {device.simType === 'ESIM' ? '📶 eSIM' :
                                                                device.simType === 'DUAL_SIM' ? '📱📶 Dual' :
                                                                    '📱 Physical'}
                                                        </span>
                                                    )}

                                                    <span className={`px-3 py-1 rounded-lg font-bold ${conditionBadge.color}`}>
                                                        {conditionBadge.label}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${statusBadge.color}`}>
                                                        <FontAwesomeIcon icon={statusBadge.icon} className="text-xs" />
                                                        {statusBadge.label}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {device.variant.storage} • {device.variant.color}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <div className="text-xl font-black text-gray-900">
                                                    {device.price.toLocaleString()} TZS
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(device.addedAt).toLocaleDateString()}
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

export default ViewDevicesPage;
