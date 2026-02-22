import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faFilter, faCheckCircle, faTimesCircle, faBoxOpen,
    faMobileAlt, faUser, faTag, faCalendarAlt, faPlus, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { faThLarge, faList, faImage, faSync, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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
    const [viewMode, setViewMode] = useState('grid');
    const [imageErrors, setImageErrors] = useState({});

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
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <FontAwesomeIcon icon={faThLarge} /> Grid
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <FontAwesomeIcon icon={faList} /> Table
                            </button>
                        </div>
                        {['CEO', 'MANAGER'].includes(userRole) && (
                            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold text-sm">
                                👑 Admin Access
                            </div>
                        )}
                    </div>
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

                {/* Trade-In Content */}
                {viewMode === 'grid' ? (
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
                                    <div className="h-48 bg-gray-100 relative group overflow-hidden">
                                        {(item.photos?.front || item.photos?.serial || item.photos?.screen || item.photos?.back || item.serialNumberPhoto) && !imageErrors[item.id] ? (
                                            <img
                                                src={item.photos?.front || item.photos?.serial || item.photos?.screen || item.photos?.back || item.serialNumberPhoto}
                                                alt={`${item.deviceInfo?.brand} ${item.deviceInfo?.model}`}
                                                onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50 border-b border-gray-100">
                                                <FontAwesomeIcon icon={imageErrors[item.id] ? faExclamationTriangle : faMobileAlt} className="text-5xl mb-2 opacity-20" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {imageErrors[item.id] ? 'Image Load Failed' : 'No Image Available'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border backdrop-blur-md shadow-sm ${getStatusColor(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                        </div>

                                        {/* Brand/Model Overlay */}
                                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                            <div className="flex flex-col">
                                                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
                                                    {item.deviceInfo?.brand || 'Generic'}
                                                </span>
                                                <h3 className="text-white font-black text-xl leading-tight">
                                                    {item.deviceInfo?.model || 'Device'}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Content */}
                                    <div className="p-6 flex-1 flex flex-col gap-5">
                                        {/* Valuation Card */}
                                        <div className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl">
                                            <div className="flex flex-col">
                                                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Recommended Offer</span>
                                                <span className="text-indigo-600 font-black text-xl">
                                                    TSh {(item.approvedValue || item.valuation?.recommendedOffer || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                            </div>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                                    <FontAwesomeIcon icon={faUser} className="text-indigo-300 w-3" />
                                                    <span>Customer</span>
                                                </div>
                                                <span className="text-gray-900 font-black">{item.customerName || 'Walk-in Customer'}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-300 w-3" />
                                                    <span>Date Submitted</span>
                                                </div>
                                                <span className="text-gray-900 font-black">{new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                    <span>Detailed Condition</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600">
                                                        📱 Screen: {item.condition?.screen}
                                                    </span>
                                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600">
                                                        ✨ Body: {item.condition?.body}
                                                    </span>
                                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600">
                                                        🔋 Battery: {item.condition?.battery}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto pt-4 flex gap-2">
                                            {item.status === 'pending' && ['CEO', 'MANAGER'].includes(userRole) && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(item.id, item.valuation?.recommendedOffer)}
                                                        className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id)}
                                                        className="flex-1 bg-white text-red-600 border-2 border-red-50 py-3.5 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FontAwesomeIcon icon={faTimesCircle} /> Reject
                                                    </button>
                                                </>
                                            )}

                                            {item.status === 'approved' && ['CEO', 'MANAGER'].includes(userRole) && (
                                                <button
                                                    onClick={() => openStockModal(item)}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <FontAwesomeIcon icon={faBoxOpen} className="text-lg" />
                                                    ADD TO INVENTORY
                                                </button>
                                            )}

                                            {item.status === 'in_stock' && (
                                                <div className="w-full bg-blue-50/50 border border-blue-100 text-blue-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
                                                    <FontAwesomeIcon icon={faCheck} />
                                                    In Inventory
                                                </div>
                                            )}

                                            {item.status === 'rejected' && (
                                                <div className="w-full bg-red-50/50 border border-red-100 text-red-400 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 cursor-default italic text-xs">
                                                    <span>Trade-in Rejected</span>
                                                    <span className="text-[10px] uppercase font-black not-italic opacity-60">By {item.rejectedBy || 'Admin'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Device</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Valuation</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTradeIns.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100 flex-shrink-0">
                                                        {(item.photos?.front || item.photos?.serial || item.photos?.screen || item.photos?.back || item.serialNumberPhoto) && !imageErrors[item.id] ? (
                                                            <img
                                                                src={item.photos?.front || item.photos?.serial || item.photos?.screen || item.photos?.back || item.serialNumberPhoto}
                                                                alt=""
                                                                onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                                <FontAwesomeIcon icon={imageErrors[item.id] ? faExclamationTriangle : faMobileAlt} className="text-xl" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-gray-900 font-bold truncate">{item.deviceInfo?.brand} {item.deviceInfo?.model}</span>
                                                        <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest truncate">{item.deviceInfo?.storage || 'N/A'} • {item.deviceInfo?.color || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(item.status)}`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-indigo-600 font-black text-sm">TSh {(item.approvedValue || item.valuation?.recommendedOffer || 0).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Recommended</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-700 font-bold text-sm">{item.customerName || 'Walk-in'}</span>
                                                    <span className="text-gray-400 text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {item.status === 'pending' && ['CEO', 'MANAGER'].includes(userRole) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(item.id, item.valuation?.recommendedOffer)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(item.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <FontAwesomeIcon icon={faTimesCircle} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {item.status === 'approved' && ['CEO', 'MANAGER'].includes(userRole) && (
                                                        <button
                                                            onClick={() => openStockModal(item)}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-indigo-100 hover:scale-[1.05] transition-all"
                                                        >
                                                            Add Stock
                                                        </button>
                                                    )}
                                                    {item.status === 'in_stock' && (
                                                        <span className="text-blue-500 font-bold text-xs"><FontAwesomeIcon icon={faCheck} /> IN STOCK</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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
