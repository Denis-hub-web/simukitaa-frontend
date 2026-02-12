import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBarcode, faSdCard, faPalette, faCheckCircle,
    faBox, faTruck, faExclamationTriangle, faLayerGroup, faCubes, faCamera
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import SerialScannerModal from '../components/SerialScannerModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddDevicePage = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        supplierId: '',
        serialNumber: '',
        storage: '',
        color: '',
        simType: 'ESIM', // NEW: Default to ESIM
        condition: 'nonActive',
        customPrice: '',
        costPrice: '',
        notes: ''
    });
    const [showScannerModal, setShowScannerModal] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [productRes, suppliersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/stock/products/${productId}`, { headers }),
                axios.get(`${API_BASE_URL}/suppliers`, { headers })
            ]);

            const productData = productRes.data.data || productRes.data;
            const suppliersData = suppliersRes.data.data || suppliersRes.data;

            setProduct(productData);
            setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

            // Set default variant values and first supplier
            if (productData.variants) {
                // Check query params for auto-fill (e.g. from Trade-In)
                const params = new URLSearchParams(window.location.search);
                const tradeInId = params.get('tradeInId');
                const serial = params.get('serial');
                const storage = params.get('storage');
                const color = params.get('color');
                const cost = params.get('cost');
                const condition = params.get('condition');

                const defaultSupplier = Array.isArray(suppliersData) && suppliersData.length > 0 ? suppliersData[0].id : '';

                setFormData(prev => ({
                    ...prev,
                    storage: storage || productData.variants.storage?.[0] || '',
                    color: color || productData.variants.color?.[0] || '',
                    supplierId: tradeInId ? 'sup_trade_in' : defaultSupplier, // Use special ID or default
                    serialNumber: serial || '',
                    costPrice: cost || '',
                    condition: condition || 'nonActive',
                    notes: tradeInId ? `Trade-In ID: ${tradeInId}` : '',
                    tradeInId: tradeInId // Store tradeInId to send to backend
                }));
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
            navigate('/stock-management');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.serialNumber.trim()) {
            alert('Serial number is required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const deviceData = {
                supplierId: formData.supplierId,
                serialNumber: formData.serialNumber.trim().toUpperCase(),
                variant: {
                    storage: formData.storage,
                    color: formData.color
                },
                simType: formData.simType, // NEW: Include SIM type
                condition: formData.condition,
                price: formData.customPrice ? parseFloat(formData.customPrice) : null,
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
                notes: formData.notes.trim() || '',
                tradeInId: formData.tradeInId || null // Pass trade-in ID if present
            };

            await axios.post(`${API_BASE_URL}/stock/products/${productId}/devices`, deviceData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Device added successfully!');
            navigate('/stock-management');
        } catch (error) {
            console.error('Error adding device:', error);
            alert(error.response?.data?.message || 'Failed to add device');
        } finally {
            setSubmitting(false);
        }
    };

    const getConditionLabel = (condition) => {
        const labels = {
            nonActive: 'Non-Active (Default)',
            active: 'Active',
            refurbished: 'Refurbished',
            used: 'Used (Trade-In)'
        };
        return labels[condition] || condition;
    };

    const getConditionPrice = (condition) => {
        if (!product?.basePricing) return 0;
        return product.basePricing[condition] || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/stock-management')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Stock</span>
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    {/* Product Info Header */}
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faBox} className="text-indigo-600 text-2xl" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Add Device</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-2 text-gray-700">
                                    <FontAwesomeIcon icon={faCubes} className="text-indigo-500" />
                                    <strong>{product.brand}</strong> {product.name}
                                </span>
                                {product.model && (
                                    <span className="text-gray-500">• Model: {product.model}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Serial Number */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faBarcode} className="mr-2 text-indigo-500" />
                                Serial Number / IMEI *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        serialNumber: e.target.value.toUpperCase()
                                    })}
                                    placeholder="Enter unique serial number or IMEI"
                                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-mono text-lg pr-28"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScannerModal(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faCamera} />
                                    <span className="hidden sm:inline">Scan</span>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                💡 Serial number will be automatically capitalized. Click "Scan" to read from product box.
                            </p>
                        </div>

                        {/* Supplier Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faTruck} className="mr-2 text-purple-500" />
                                Supplier *
                            </label>
                            <select
                                required
                                value={formData.supplierId}
                                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all bg-white"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 mt-2">
                                💡 Which supplier provided this device?
                            </p>
                        </div>

                        {/* Cost Price - Buying Price */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200">
                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                💰 Cost Price (Buying Price) *
                            </h3>
                            <input
                                type="number"
                                required
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                placeholder="Enter the price you BOUGHT this device for"
                                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-all bg-white text-lg"
                            />
                            <div className="mt-3 space-y-2">
                                <p className="text-sm text-gray-700 font-semibold">
                                    💡 <strong>This is the supplier's price</strong> (how much you paid to buy it)
                                </p>
                                <p className="text-xs text-gray-600">
                                    ⚡ Profit will be calculated automatically: <strong>Selling Price - Cost Price</strong>
                                </p>
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faLayerGroup} className="text-blue-600" />
                                Variant Selection
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faSdCard} className="mr-2 text-blue-500" />
                                        Storage *
                                    </label>
                                    <select
                                        required
                                        value={formData.storage}
                                        onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white"
                                    >
                                        {product.variants.storage.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faPalette} className="mr-2 text-purple-500" />
                                        Color *
                                    </label>
                                    <select
                                        required
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all bg-white"
                                    >
                                        {product.variants.color.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        📶 SIM Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.simType}
                                        onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all bg-white"
                                    >
                                        <option value="ESIM">📶 eSIM</option>
                                        <option value="PHYSICAL_SIM">📱 Physical SIM</option>
                                        <option value="DUAL_SIM">📱📶 Dual SIM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Condition Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                Condition *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['nonActive', 'active', 'refurbished', 'used'].map(condition => (
                                    <button
                                        key={condition}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, condition, customPrice: '' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${formData.condition === condition
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-gray-900">{getConditionLabel(condition)}</span>
                                            {formData.condition === condition && (
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-600" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Base Price: <strong>TZS {getConditionPrice(condition).toLocaleString()}</strong>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Price Override */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Custom Price (Optional)</h3>
                            <input
                                type="number"
                                value={formData.customPrice}
                                onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
                                placeholder={`Leave empty to use base price (${getConditionPrice(formData.condition).toLocaleString()} TZS)`}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all bg-white"
                            />
                            <p className="text-sm text-gray-600 mt-3">
                                💡 Override the base price for this specific device
                            </p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes about this device..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/stock-management')}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>Adding Device...</>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                        Add Device to Stock
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Serial Scanner Modal */}
                <SerialScannerModal
                    isOpen={showScannerModal}
                    onClose={() => setShowScannerModal(false)}
                    onSerialDetected={(serial) => {
                        setFormData({ ...formData, serialNumber: serial });
                        setShowScannerModal(false);
                    }}
                />
            </div>
        </div>
    );
};

export default AddDevicePage;
