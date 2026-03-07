import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBarcode, faSdCard, faPalette, faCheckCircle,
    faBox, faTruck, faExclamationTriangle, faLayerGroup, faCubes, faCamera, faPlus
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import SerialScannerModal from '../components/SerialScannerModal';

import { API_URL as API_BASE_URL } from '../utils/api';

const AddDevicePage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        supplierId: '',
        serialNumber: '',
        quantityToAdd: 1, // Default for quantity-only products
        storage: '',
        color: '',
        simType: 'ESIM', // NEW: Default to ESIM
        condition: 'nonActive',
        customPrice: '',
        costPrice: '',
        isPriceLocked: false, // NEW
        notes: ''
    });
    const [showScannerModal, setShowScannerModal] = useState(false);

    const simTypeOptions = Array.isArray(product?.variants?.simType) && product.variants.simType.length > 0
        ? product.variants.simType
        : ['ESIM', 'PHYSICAL_SIM', 'DUAL_SIM'];

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

            const allowedSimTypes = Array.isArray(productData?.variants?.simType) && productData.variants.simType.length > 0
                ? productData.variants.simType
                : ['ESIM', 'PHYSICAL_SIM', 'DUAL_SIM'];

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
                    simType: allowedSimTypes.includes(prev.simType) ? prev.simType : (allowedSimTypes[0] || prev.simType),
                    supplierId: tradeInId ? 'sup_trade_in' : defaultSupplier, // Use special ID or default
                    serialNumber: serial || '',
                    costPrice: cost || productData.buyingPrice || '',
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

    // Auto-suggest price when variant, SIM or condition changes
    useEffect(() => {
        if (!product || !product.variantPricing || product.variantPricing.length === 0 || formData.isPriceLocked) return;

        const vPrice = product.variantPricing.find(vp =>
            vp.storage === formData.storage &&
            (vp.simType === formData.simType || !vp.simType || vp.simType === 'Any') &&
            (vp.color === formData.color || !vp.color || vp.color === 'Any')
        );

        if (vPrice && vPrice.prices && vPrice.prices[formData.condition]) {
            setFormData(prev => ({
                ...prev,
                customPrice: vPrice.prices[formData.condition],
                isPriceLocked: false // Reset lock on auto-suggest unless user manually locked it
            }));
        } else {
            // No variant match found, clear the custom price to force manual entry or show no price
            setFormData(prev => ({
                ...prev,
                customPrice: '',
                isPriceLocked: false
            }));
        }
    }, [formData.storage, formData.color, formData.simType, formData.condition, product, formData.isPriceLocked]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (product?.trackSerials !== false && !formData.serialNumber.trim()) {
            alert('Serial number is required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let submitData;

            if (product?.trackSerials === false) {
                submitData = {
                    supplierId: formData.supplierId,
                    quantityToAdd: parseInt(formData.quantityToAdd) || 1,
                    condition: formData.condition,
                    price: formData.customPrice ? parseFloat(formData.customPrice) : null,
                    costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
                    notes: formData.notes.trim() || '',
                    tradeInId: formData.tradeInId || null
                };
            } else {
                submitData = {
                    supplierId: formData.supplierId,
                    serialNumber: formData.serialNumber.trim().toUpperCase(),
                    variant: {
                        storage: formData.storage,
                        color: formData.color
                    },
                    simType: formData.simType,
                    condition: formData.condition,
                    price: formData.customPrice ? parseFloat(formData.customPrice) : null,
                    costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
                    notes: formData.notes.trim() || '',
                    tradeInId: formData.tradeInId || null
                };
            }

            await axios.post(`${API_BASE_URL}/stock/products/${productId}/devices`, submitData, { headers });

            alert(`✅ Device${product?.trackSerials === false ? '(s)' : ''} added successfully!`);
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
        if (!product) return 0;

        // Try to find variant-specific price first
        if (product.variantPricing) {
            const vPrice = product.variantPricing.find(vp =>
                vp.storage === formData.storage &&
                (vp.simType === formData.simType || !vp.simType || vp.simType === 'Any') &&
                (vp.color === formData.color || !vp.color || vp.color === 'Any')
            );
            if (vPrice && vPrice.prices && vPrice.prices[condition]) {
                return vPrice.prices[condition];
            }
        }

        return null; // Return null if no variant match found
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
                        {/* Serial Number / Quantity to Add */}
                        {product?.trackSerials !== false ? (
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
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-indigo-600 mb-2">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2 text-indigo-500" />
                                    Quantity to Add *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantityToAdd}
                                    onChange={(e) => setFormData({ ...formData, quantityToAdd: e.target.value })}
                                    placeholder="How many units to add?"
                                    className="w-full px-4 py-4 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none transition-all bg-indigo-50/20 text-lg"
                                />
                                <p className="text-sm text-indigo-500 mt-2 font-bold uppercase tracking-wider">
                                    💡 Adding to total quantity (Tracking is disabled for this item)
                                </p>
                            </div>
                        )}

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
                        {user.role === 'CEO' && (
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
                        )}

                        {/* Variant Selection */}
                        {product?.trackSerials !== false && (
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
                                            {simTypeOptions.map((t) => (
                                                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Condition Selection - Hide for accessories */}
                        {product?.trackSerials !== false && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
                                    Condition *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['nonActive', 'active', 'refurbished', 'used'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, condition: c })}
                                            className={`py-3 px-4 rounded-xl border-2 font-bold transition-all capitalize ${formData.condition === c
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold capitalize">
                                                    {c === 'nonActive' ? 'Brand New' : c}
                                                </span>
                                                {user.role === 'CEO' && product.trackSerials !== false && getConditionPrice(c) && (
                                                    <span className="text-[10px] opacity-70 mt-1">
                                                        {getConditionPrice(c).toLocaleString()} TZS
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom Pricing */}
                        {user.role === 'CEO' && (
                            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    💵 {product?.trackSerials === false ? 'Pricing Information' : 'Custom Pricing (Optional)'}
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Selling Price
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.customPrice}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                customPrice: e.target.value,
                                                isPriceLocked: true // Auto-lock when user manually types a price
                                            })}
                                            placeholder="Enter selling price"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-white focus:border-indigo-500 focus:outline-none transition-all"
                                        />
                                        <div className="mt-3">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-10 h-6 rounded-full transition-all relative ${formData.isPriceLocked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPriceLocked ? 'left-5' : 'left-1'}`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.isPriceLocked}
                                                    onChange={(e) => setFormData({ ...formData, isPriceLocked: e.target.checked })}
                                                />
                                                <span className={`text-sm font-bold ${formData.isPriceLocked ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                    Lock this price (Skip bulk updates)
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {product?.trackSerials !== false && (
                                    <p className="text-xs text-gray-500 mt-3 font-medium">
                                        💡 Leave empty to use product's base price for this condition.
                                    </p>
                                )}
                            </div>
                        )}

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
