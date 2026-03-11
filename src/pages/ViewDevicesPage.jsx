import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBox, faBarcode, faPlus, faEdit, faTrash,
    faCubes, faTruck, faCheckCircle, faExclamationTriangle, faTags
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { API_URL as API_BASE_URL } from '../utils/api';

const ViewDevicesPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDeviceId, setEditingDeviceId] = useState(null);
    const [editSerialNumber, setEditSerialNumber] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editCostPrice, setEditCostPrice] = useState('');
    const [editCondition, setEditCondition] = useState('nonActive');
    const [editSimType, setEditSimType] = useState('PHYSICAL_SIM');
    const [editStorage, setEditStorage] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editIsLocked, setEditIsLocked] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [adjustQty, setAdjustQty] = useState('');
    const [adjusting, setAdjusting] = useState(false);

    const [editPriceModal, setEditPriceModal] = useState(false);
    const [editBatchId, setEditBatchId] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [newCostPrice, setNewCostPrice] = useState('');
    const [newRunningCostMode, setNewRunningCostMode] = useState('TOTAL');
    const [newRunningCostValue, setNewRunningCostValue] = useState('');
    const [updatingPrice, setUpdatingPrice] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [productId]);
    useEffect(() => {
        fetchSuppliers();
    }, [productId]);

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/suppliers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

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

    const handleQuickAdjust = async (isDeduction = false) => {
        const qty = parseInt(adjustQty);
        if (isNaN(qty) || qty <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        try {
            setAdjusting(true);
            const token = localStorage.getItem('token');
            const finalQty = isDeduction ? -qty : qty;

            const response = await axios.post(`${API_BASE_URL}/stock/products/${productId}/devices`, {
                quantityToAdd: finalQty,
                notes: isDeduction ? 'Manual Stock Deduction' : 'Quick Restock'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAdjustQty('');
                fetchProduct(); // Refresh data
            }
        } catch (error) {
            console.error('Adjustment error:', error);
            alert(error.response?.data?.message || 'Failed to adjust stock');
        } finally {
            setAdjusting(false);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_BASE_URL}/stock/products/${productId}/devices/${deviceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                fetchProduct();
            }
        } catch (error) {
            console.error('Delete device error:', error);
            alert(error.response?.data?.message || 'Failed to delete device');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateDevice = async (deviceId) => {
        try {
            setUpdating(true);
            const token = localStorage.getItem('token');
            const payload = {
                serialNumber: editSerialNumber,
                price: parseFloat(editPrice),
                isPriceLocked: editIsLocked,
                condition: editCondition,
                simType: editSimType,
                variant: { storage: editStorage, color: editColor }
            };
            if (user.role === 'CEO' && editCostPrice !== '') {
                payload.costPrice = parseFloat(editCostPrice);
            }
            const response = await axios.put(`${API_BASE_URL}/stock/products/${productId}/devices/${deviceId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setEditingDeviceId(null);
                fetchProduct();
            }
        } catch (error) {
            console.error('Update device error:', error);
            alert('Failed to update device');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateBatchCosts = async () => {
        if (!editBatchId) return;
        try {
            setUpdatingPrice(true);
            const token = localStorage.getItem('token');
            const payload = {
                price: parseFloat(newPrice) || undefined
            };
            if (newCostPrice !== '') payload.costPrice = parseFloat(newCostPrice);
            if (newRunningCostValue !== '') {
                payload.runningCostMode = newRunningCostMode;
                payload.runningCostValue = parseFloat(newRunningCostValue);
            }
            await axios.put(`${API_BASE_URL}/stock/products/${productId}/devices/${editBatchId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditPriceModal(false);
            setEditBatchId(null);
            fetchProduct();
        } catch (error) {
            console.error('Batch cost update error:', error);
            alert(error.response?.data?.message || 'Failed to update costs');
        } finally {
            setUpdatingPrice(false);
        }
    };

    const startEditing = (device) => {
        setEditingDeviceId(device.id);
        setEditSerialNumber(device.serialNumber || '');
        setEditPrice(device.price);
        setEditCostPrice(device.costPrice !== undefined ? String(device.costPrice) : '');
        setEditIsLocked(device.isPriceLocked);
        setEditCondition(device.condition || 'nonActive');
        setEditSimType(device.simType || 'PHYSICAL_SIM');
        setEditStorage(device.variant?.storage || '');
        setEditColor(device.variant?.color || '');
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

    const simTypeOptions = Array.isArray(product?.variants?.simType) && product.variants.simType.length > 0
        ? product.variants.simType
        : ['PHYSICAL_SIM', 'ESIM', 'DUAL_SIM'];

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
                    {product.trackSerials !== false && (
                        <button
                            onClick={() => navigate(`/stock-management/add-device/${productId}`)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span className="hidden sm:inline">Add Device</span>
                        </button>
                    )}
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
                        <div className="flex gap-4">
                            <div className="text-right px-4 border-r-2 border-gray-100 last:border-0">
                                <div className="text-3xl font-black text-blue-600">
                                    {product.stockSummary?.total || 0}
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Available</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-green-600">
                                    {product.trackSerials !== false
                                        ? (product.devices || []).filter(d => d.status === 'sold').length
                                        : (product.totalSold || 0)}
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sold</div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Summary - Hide for accessories */}
                    {product.trackSerials !== false && (
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
                    )}
                </div>

                {/* Simple Product Summary View */}
                {product.trackSerials === false && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Stats Card */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                            <FontAwesomeIcon icon={faCubes} className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Available Stock</h3>
                                            <p className="text-white/70 text-sm">Real-time inventory level</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-8">
                                        <div className="flex items-baseline gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-6xl font-black">{product.stockSummary?.total || 0}</span>
                                                <span className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">Available</span>
                                            </div>
                                            <div className="w-px h-12 bg-white/20 self-center" />
                                            <div className="flex flex-col">
                                                <span className="text-4xl font-black opacity-80">{product.totalSold || 0}</span>
                                                <span className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">Sold</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                        {user.role === 'CEO' && (
                                                <>
                                                    <div className="flex items-center justify-end gap-2 text-sm font-bold opacity-70 uppercase tracking-wider mb-1">
                                                        <span>Selling Price</span>
                                                        <button
                                                            onClick={() => {
                                                                // Open modal for the latest (most recent) batch
                                                                const batches = (product.devices || []).filter(d => d.isBatch && !d.isAdjustment);
                                                                const latestBatch = batches.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))[0];
                                                                setNewPrice(product.basePricing?.nonActive || 0);
                                                                setNewCostPrice(latestBatch?.baseUnitCost !== undefined ? String(latestBatch.baseUnitCost) : '');
                                                                setNewRunningCostMode(latestBatch?.runningCostMode || 'TOTAL');
                                                                setNewRunningCostValue(latestBatch?.runningCostValue ? String(latestBatch.runningCostValue) : '');
                                                                setEditBatchId(latestBatch?.id || null);
                                                                setEditPriceModal(true);
                                                            }}
                                                            className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
                                                            title="Edit Price & Costs"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                                                        </button>
                                                    </div>
                                                    <div className="text-3xl font-black">
                                                        {(product.basePricing?.nonActive || 0).toLocaleString()} <span className="text-sm font-bold opacity-70">TZS</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Ready to Sell</span>
                                        </div>
                                        <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                                            New condition
                                        </span>
                                    </div>
                                </div>
                                {/* Decorative background shapes */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl" />
                            </div>

                            {/* Stock Adjustment Mechanism */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlus} className="text-green-600" />
                                    Quick Stock Adjust
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity to Change</label>
                                        <input
                                            type="number"
                                            value={adjustQty}
                                            onChange={(e) => setAdjustQty(e.target.value)}
                                            placeholder="Enter amount..."
                                            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:outline-none transition-all font-black text-2xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleQuickAdjust(true)}
                                            disabled={adjusting || !adjustQty}
                                            className="py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 border-2 border-red-100"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Deduct
                                        </button>
                                        <button
                                            onClick={() => handleQuickAdjust(false)}
                                            disabled={adjusting || !adjustQty}
                                            className="py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                            {adjusting ? 'Wait...' : 'Restock'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center">
                                        ✨ No price prompts. Uses default buying price.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Restocking History Table */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTruck} className="text-orange-600" />
                                    Restocking History
                                </h3>
                                <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                                    Tracked Batches
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                                            {user.role === 'CEO' && (
                                                <>
                                                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Unit Cost</th>
                                                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Running Cost</th>
                                                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                                                    <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Action</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(() => {
                                            const allBatches = devices.filter(d => d.isBatch || d.serialNumber?.startsWith('BATCH-')).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                                            const latestBatchId = allBatches[0]?.id;
                                            return allBatches.map((batch) => (
                                                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">
                                                                    {new Date(batch.addedAt).toLocaleDateString()}
                                                                </div>
                                                                <div className="text-[10px] text-gray-400">
                                                                    {new Date(batch.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                            {batch.id === latestBatchId && (
                                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-200 whitespace-nowrap">
                                                                    ✦ Latest
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {suppliers.find(s => s.id === batch.supplierId)?.name || 'Direct Stock'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className="text-sm font-black text-gray-900">{batch.quantity || 0}</span>
                                                    </td>
                                                    {user.role === 'CEO' && (
                                                        <>
                                                            <td className="py-4 px-4 text-right">
                                                                <div className="text-sm font-bold text-gray-600">{(batch.baseUnitCost || batch.price || 0).toLocaleString()}</div>
                                                                <div className="text-[10px] text-gray-400">buying price</div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                {batch.runningCostPerItem > 0 ? (
                                                                    <div>
                                                                        <div className="text-sm font-bold text-orange-600">{(batch.runningCostPerItem || 0).toLocaleString()}/item</div>
                                                                        <div className="text-[10px] text-gray-400">{batch.runningCostMode === 'TOTAL' ? `${(batch.runningCostValue || 0).toLocaleString()} total` : 'per item'}</div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-300">—</span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                <span className="text-sm font-black text-indigo-600">
                                                                    {((batch.quantity || 0) * (batch.effectiveUnitCost || batch.price || 0)).toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditBatchId(batch.id);
                                                                        setNewPrice(product.basePricing?.nonActive || 0);
                                                                        setNewCostPrice(batch.baseUnitCost !== undefined ? String(batch.baseUnitCost) : '');
                                                                        setNewRunningCostMode(batch.runningCostMode || 'TOTAL');
                                                                        setNewRunningCostValue(batch.runningCostValue ? String(batch.runningCostValue) : '');
                                                                        setEditPriceModal(true);
                                                                    }}
                                                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-transparent hover:border-indigo-100 mx-auto"
                                                                    title="Edit Batch Costs"
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ));
                                        })()}
                                        {devices.filter(d => d.isBatch || d.serialNumber?.startsWith('BATCH-')).length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="py-12 text-center text-gray-400 font-medium italic">
                                                    No restocking activity recorded yet. Existing stock might not have batch details.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Batch Cost Edit Modal */}
                <AnimatePresence>
                    {editPriceModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setEditPriceModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-black text-gray-900 mb-1">Edit Batch Costs</h3>
                                <p className="text-sm text-gray-500 mb-6">Update selling price, buying price and running costs for this batch.</p>

                                <div className="space-y-4">
                                    {/* Selling Price */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Selling Price (TZS)</label>
                                        <input
                                            type="number"
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold"
                                            placeholder="e.g. 50000"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Cost / Buying Price */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">💰 Buying Price / Unit Cost (TZS)</label>
                                        <input
                                            type="number"
                                            value={newCostPrice}
                                            onChange={(e) => setNewCostPrice(e.target.value)}
                                            className="w-full px-4 py-3 bg-amber-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white transition-all outline-none font-bold"
                                            placeholder="Price paid per unit to supplier"
                                        />
                                    </div>

                                    {/* Running Cost */}
                                    <div className="bg-sky-50 rounded-2xl p-4 border-2 border-sky-100 space-y-3">
                                        <label className="text-xs font-black text-sky-700 uppercase tracking-widest">🚚 Running Cost (Transport, etc.)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Mode</label>
                                                <select
                                                    value={newRunningCostMode}
                                                    onChange={(e) => setNewRunningCostMode(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none bg-white text-sm font-bold"
                                                >
                                                    <option value="TOTAL">Total for batch</option>
                                                    <option value="PER_ITEM">Per item</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Amount (TZS)</label>
                                                <input
                                                    type="number"
                                                    value={newRunningCostValue}
                                                    onChange={(e) => setNewRunningCostValue(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none bg-white font-bold"
                                                    placeholder={newRunningCostMode === 'PER_ITEM' ? 'e.g. 2000' : 'e.g. 50000'}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-sky-600 font-semibold">
                                            {newRunningCostMode === 'TOTAL'
                                                ? '💡 Will be divided by batch quantity to get per-unit cost'
                                                : '💡 Added directly as per-unit running cost'}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => { setEditPriceModal(false); setEditBatchId(null); }}
                                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateBatchCosts}
                                            disabled={updatingPrice}
                                            className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {updatingPrice ? 'Saving...' : 'Save Costs'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Bar - Only show for tracked products */}
                {product.trackSerials !== false && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100 mb-6">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by serial number..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                        />
                    </div>
                )}

                {/* Devices List - Only show for tracked products */}
                {product.trackSerials !== false && (
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
                                                            {device.variant?.storage || 'Std'} • {device.variant?.color || 'Std'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        {user.role === 'CEO' && (
                                                            <div className="text-xl font-black text-gray-900">
                                                                {device.price.toLocaleString()} TZS
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(device.addedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    {(user.role === 'CEO' || user.role === 'MANAGER') && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => startEditing(device)}
                                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-transparent hover:border-indigo-100"
                                                                title="Edit Device"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            {device.status === 'available' && (
                                                                <button
                                                                    onClick={() => handleDeleteDevice(device.id)}
                                                                    className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center border border-transparent hover:border-red-100"
                                                                    title="Delete Device"
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Inline Price Editor */}
                                            <AnimatePresence>
                                                {editingDeviceId === device.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 overflow-hidden"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Serial Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={editSerialNumber}
                                                                    onChange={(e) => setEditSerialNumber(e.target.value.toUpperCase())}
                                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-black text-sm font-mono"
                                                                    placeholder="IMEI / Serial"
                                                                    disabled={device.status !== 'available'}
                                                                />
                                                                {device.status !== 'available' && (
                                                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Serial editable only when available</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Selling Price (TZS)</label>
                                                                <input
                                                                    type="number"
                                                                    value={editPrice}
                                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm"
                                                                />
                                                            </div>
                                                            {user.role === 'CEO' && (
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">💰 Buying Price (TZS)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={editCostPrice}
                                                                        onChange={(e) => setEditCostPrice(e.target.value)}
                                                                        className="w-full px-4 py-2 rounded-xl border-2 border-amber-100 bg-amber-50 focus:border-amber-400 focus:outline-none transition-all font-bold text-sm"
                                                                        placeholder="Cost price"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Condition</label>
                                                                <select
                                                                    value={editCondition}
                                                                    onChange={(e) => setEditCondition(e.target.value)}
                                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm"
                                                                >
                                                                    <option value="nonActive">Non-Active</option>
                                                                    <option value="active">Active</option>
                                                                    <option value="refurbished">Refurbished</option>
                                                                    <option value="used">Used</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SIM Type</label>
                                                                <select
                                                                    value={editSimType}
                                                                    onChange={(e) => setEditSimType(e.target.value)}
                                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm"
                                                                >
                                                                    {simTypeOptions.map((t) => (
                                                                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Storage</label>
                                                                <input
                                                                    type="text"
                                                                    value={editStorage}
                                                                    onChange={(e) => setEditStorage(e.target.value)}
                                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm"
                                                                    placeholder="e.g. 256GB"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color</label>
                                                                <input
                                                                    type="text"
                                                                    value={editColor}
                                                                    onChange={(e) => setEditColor(e.target.value)}
                                                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm"
                                                                    placeholder="e.g. Titanium"
                                                                />
                                                            </div>
                                                            <div className="flex items-end">
                                                                <label className="flex items-center gap-3 cursor-pointer group mb-2">
                                                                    <div className={`w-10 h-6 rounded-full transition-all relative ${editIsLocked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editIsLocked ? 'left-5' : 'left-1'}`} />
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only"
                                                                        checked={editIsLocked}
                                                                        onChange={(e) => setEditIsLocked(e.target.checked)}
                                                                    />
                                                                    <span className={`text-[10px] font-bold uppercase ${editIsLocked ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                                        Lock Price
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditingDeviceId(null)}
                                                                className="px-4 py-2 border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs uppercase"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateDevice(device.id)}
                                                                disabled={updating}
                                                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-xs uppercase shadow-lg shadow-indigo-200 disabled:opacity-50"
                                                            >
                                                                {updating ? 'Saving...' : 'Save Changes'}
                                                            </button>
                                                        </div>
                                                        {editIsLocked && (
                                                            <p className="text-[10px] text-indigo-500 font-bold mt-2">
                                                                🔒 Locked: This price will be protected from bulk updates.
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewDevicesPage;
