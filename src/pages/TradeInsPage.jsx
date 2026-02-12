import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faFilter, faCheckCircle, faTimesCircle, faBoxOpen,
    faMobileAlt, faUser, faTag, faCalendarAlt, faPlus, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TradeInsPage = () => {
    const navigate = useNavigate();
    const [tradeIns, setTradeIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userRole, setUserRole] = useState('');
    const [products, setProducts] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedTradeIn, setSelectedTradeIn] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState('');

    useEffect(() => {
        fetchTradeIns();
        fetchProducts();

        // Get user role from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
            } catch (e) {
                console.error('Error parsing token:', e);
            }
        }
    }, []);

    const fetchTradeIns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/trade-ins`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTradeIns(response.data.data.tradeIns || []);
        } catch (error) {
            console.error('Error fetching trade-ins:', error);
            alert('Failed to load trade-ins');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/stock/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleApprove = async (id, value) => {
        if (!window.confirm('Are you sure you want to approve this trade-in?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/trade-ins/${id}/approve`, {
                approvedValue: value,
                notes: 'Approved via Management Portal'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Trade-in approved successfully!');
            fetchTradeIns();
        } catch (error) {
            console.error('Error approving trade-in:', error);
            alert(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/trade-ins/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Trade-in rejected');
            fetchTradeIns();
        } catch (error) {
            console.error('Error rejecting trade-in:', error);
            alert('Failed to reject');
        }
    };

    const openStockModal = (tradeIn) => {
        setSelectedTradeIn(tradeIn);
        setShowProductModal(true);
        // Try to auto-select matching product
        const match = products.find(p =>
            p.name.toLowerCase().includes(tradeIn.deviceInfo.model.toLowerCase()) &&
            p.brand.toLowerCase() === tradeIn.deviceInfo.brand.toLowerCase()
        );
        if (match) setSelectedProduct(match.id);
        else setSelectedProduct('');
    };

    const handleAddToStock = () => {
        if (!selectedProduct) {
            alert('Please select a product to link this device to.');
            return;
        }

        // Navigate to Add Device page with pre-filled data using URL params
        const params = new URLSearchParams({
            tradeInId: selectedTradeIn.id,
            serial: selectedTradeIn.deviceInfo.serialNumber || '',
            storage: selectedTradeIn.deviceInfo.storage || '',
            color: selectedTradeIn.deviceInfo.color || '',
            cost: selectedTradeIn.approvedValue || 0,
            condition: 'used' // Default for trade-ins
        });

        navigate(`/stock-management/add-device/${selectedProduct}?${params.toString()}`);
    };

    const filteredTradeIns = tradeIns.filter(item => {
        const matchesSearch =
            (item.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.deviceInfo?.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.id || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all' || item.status === filterStatus;

        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'in_stock': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Trade-In Management</h1>
                        <p className="text-gray-500 mt-1">Review, approve, and add trade-ins to inventory</p>
                    </div>
                    {['CEO', 'MANAGER'].includes(userRole) && (
                        <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold text-sm">
                            👑 Admin Access
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {['all', 'pending', 'approved', 'in_stock', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${filterStatus === status
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search customer, device..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Trade-In Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredTradeIns.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
                            >
                                {/* Header Image/Status */}
                                <div className="h-40 bg-gray-100 relative group overflow-hidden">
                                    {item.photos?.front ? (
                                        <img
                                            src={item.photos.front}
                                            alt="Device"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <FontAwesomeIcon icon={faMobileAlt} className="text-6xl" />
                                        </div>
                                    )}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase border glass-effect ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <h3 className="text-white font-bold text-lg truncate">
                                            {item.deviceInfo?.brand} {item.deviceInfo?.model}
                                        </h3>
                                        <p className="text-gray-300 text-xs">
                                            {item.deviceInfo?.storage} • {item.deviceInfo?.color}
                                        </p>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="p-5 flex-1 flex flex-col gap-4">
                                    {/* Valuation */}
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                        <span className="text-gray-500 text-sm font-medium">Valuation</span>
                                        <span className="text-indigo-600 font-black text-lg">
                                            TSh {(item.approvedValue || item.valuation?.recommendedOffer || 0).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                            {item.customerName || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                            <span className="font-bold">Condition:</span>
                                            Screen ({item.condition?.screen}),
                                            Body ({item.condition?.body}),
                                            Batt ({item.condition?.battery}%)
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                                        {item.status === 'pending' && ['CEO', 'MANAGER'].includes(userRole) && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(item.id, item.valuation?.recommendedOffer)}
                                                    className="flex-1 bg-green-50 text-green-600 py-3 rounded-xl font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faTimesCircle} /> Reject
                                                </button>
                                            </>
                                        )}

                                        {item.status === 'approved' && ['CEO', 'MANAGER'].includes(userRole) && (
                                            <button
                                                onClick={() => openStockModal(item)}
                                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                                Add to Stock
                                            </button>
                                        )}

                                        {item.status === 'in_stock' && (
                                            <div className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
                                                <FontAwesomeIcon icon={faCheck} />
                                                In Inventory
                                            </div>
                                        )}

                                        {item.status === 'rejected' && (
                                            <div className="w-full text-center text-gray-400 text-sm py-2">
                                                Rejected by {item.rejectedBy || 'Admin'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredTradeIns.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-6xl mb-4 text-gray-200" />
                        <p className="text-lg">No trade-ins found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Product Selection Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Link to Product</h3>
                        <p className="text-gray-500 mb-6">Select the product model to add this device to.</p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Model</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none bg-white"
                            >
                                <option value="">Select a Product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.brand} {p.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-2">
                                * Can't find it? Check if you need to create a new product first.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToStock}
                                disabled={!selectedProduct}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue <FontAwesomeIcon icon={faPlus} className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeInsPage;
