import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBarcode, faSdCard, faPalette, faCheckCircle,
    faBox, faTruck, faExclamationTriangle, faLayerGroup, faCubes, faCamera, faPlus,
    faBell, faBellSlash
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

import { API_URL as API_BASE_URL } from '../utils/api';

const AddProductPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        category: 'Accessories', // Default to Accessories for non-phones
        trackSerials: true, // Default to true for backward compatibility
        initialQuantity: 0,
        buyingPrice: 0, // NEW: For simple products
        sellingPrice: 0, // NEW: For simple products
        storageOptions: '',
        colorOptions: '',
        basePricing: {
            nonActive: '',
            active: '',
            refurbished: '',
            used: ''
        },
        variantPricing: [],
        notificationsEnabled: true
    });

    // Helper to sync variantPricing matrix when options change
    useEffect(() => {
        if (!formData.trackSerials) return;

        const storages = formData.storageOptions.split(',').map(s => s.trim()).filter(s => s) || ['Standard'];
        const colors = formData.colorOptions.split(',').map(c => c.trim()).filter(c => c) || ['Any'];
        const simTypes = ['DUAL_SIM', 'ESIM', 'PHYSICAL_SIM'];

        const newPricing = [];
        storages.forEach(s => {
            colors.forEach(c => {
                simTypes.forEach(sim => {
                    const existing = formData.variantPricing.find(p => p.storage === s && p.color === c && p.simType === sim);
                    if (existing) {
                        newPricing.push(existing);
                    } else {
                        newPricing.push({
                            storage: s,
                            color: c,
                            simType: sim,
                            prices: {
                                nonActive: formData.basePricing?.nonActive || 0,
                                active: formData.basePricing?.active || 0,
                                refurbished: formData.basePricing?.refurbished || 0,
                                used: formData.basePricing?.used || 0
                            }
                        });
                    }
                });
            });
        });

        if (JSON.stringify(newPricing) !== JSON.stringify(formData.variantPricing)) {
            setFormData(prev => ({ ...prev, variantPricing: newPricing }));
        }
    }, [formData.storageOptions, formData.colorOptions, formData.trackSerials]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || (formData.trackSerials && !formData.brand)) {
            alert(formData.trackSerials ? 'Product name and brand are required' : 'Product name is required');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Parse variant options
            const storageArray = formData.storageOptions
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const colorArray = formData.colorOptions
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0);

            const productData = {
                name: formData.name,
                brand: formData.trackSerials ? formData.brand : (formData.brand || 'Generic'),
                model: formData.model || 'Standard',
                category: formData.trackSerials ? formData.category : 'Accessories',
                trackSerials: formData.trackSerials,
                initialQuantity: parseInt(formData.initialQuantity) || 0,
                buyingPrice: parseFloat(formData.buyingPrice) || 0,
                variants: {
                    storage: (formData.trackSerials && storageArray.length > 0) ? storageArray : ['Standard'],
                    color: (formData.trackSerials && colorArray.length > 0) ? colorArray : ['Standard']
                },
                basePricing: formData.trackSerials ? {
                    nonActive: parseFloat(formData.basePricing.nonActive) || 0,
                    active: parseFloat(formData.basePricing.active) || 0,
                    refurbished: parseFloat(formData.basePricing.refurbished) || 0,
                    used: parseFloat(formData.basePricing.used) || 0
                } : {
                    nonActive: parseFloat(formData.sellingPrice) || 0,
                    active: parseFloat(formData.sellingPrice) || 0,
                    refurbished: parseFloat(formData.sellingPrice) || 0,
                    used: parseFloat(formData.sellingPrice) || 0
                },
                variantPricing: formData.trackSerials ? formData.variantPricing : [],
                notificationsEnabled: formData.notificationsEnabled
            };

            await axios.post(`${API_BASE_URL}/stock/products`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Product created successfully!');
            navigate('/stock-management');
        } catch (error) {
            console.error('Error creating product:', error);
            alert(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faBox} className="text-indigo-600 text-xl" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">Add New Product</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Details */}
                        <div className={`grid grid-cols-1 ${formData.trackSerials ? 'md:grid-cols-2' : ''} gap-4`}>
                            <div className={!formData.trackSerials ? 'md:col-span-1' : ''}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faBox} className="mr-2 text-indigo-500" />
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., iPhone 15 Pro or Fast Charger"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                />
                            </div>

                            {formData.trackSerials && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faCubes} className="mr-2 text-green-500" />
                                        Brand *
                                    </label>
                                    <input
                                        type="text"
                                        required={formData.trackSerials}
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="e.g., Apple"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Model Name / No
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g., A2848 or 20W USB-C"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                />
                            </div>

                            {formData.trackSerials && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all outline-none"
                                    >
                                        <option value="Phones">Phones</option>
                                        <option value="Laptops">Laptops</option>
                                        <option value="Tablets">Tablets</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Speakers">Speakers</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Inventory Mode Selection */}
                        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Stock Mechanism</h3>
                                    <p className="text-sm text-gray-500">How should this product be tracked in inventory?</p>
                                </div>
                                <div className="flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, trackSerials: true })}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.trackSerials ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Tracker (IMEI)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, trackSerials: false })}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!formData.trackSerials ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Quantity Only
                                    </button>
                                </div>
                            </div>

                            {(user.role === 'CEO' || user.role === 'MANAGER') && formData.trackSerials && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 border-t border-gray-100"
                                >
                                    <div className="max-w-xs">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Default Buying Price (TZS)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.buyingPrice}
                                            onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                                            placeholder="e.g., 500000"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:outline-none transition-all bg-orange-50/10"
                                        />
                                        <p className="text-[10px] text-orange-600 mt-1 font-bold">
                                            💡 Automatically used when Managers record stock
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {!formData.trackSerials && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Initial Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.initialQuantity}
                                            onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                                            placeholder="e.g., 50"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none transition-all bg-indigo-50/10"
                                        />
                                    </div>
                                    {(user.role === 'CEO' || user.role === 'MANAGER') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Buying Price (TZS)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.buyingPrice}
                                                    onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                                                    placeholder="e.g., 25000"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none transition-all bg-blue-50/10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Selling Price (TZS)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.sellingPrice}
                                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                                    placeholder="e.g., 40000"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:outline-none transition-all bg-green-50/10"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <p className="text-xs text-indigo-600 mt-2 font-medium md:col-span-3">
                                        💡 Simplified Mode: Just enter the quantity and prices. Variants and categories are hidden for speed.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Variant Options - Only show if tracking is ON */}
                        {formData.trackSerials && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100"
                            >
                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-blue-600" />
                                    Variant Options
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Storage Options (comma-separated)
                                        </label>
                                        <div className="relative">
                                            <FontAwesomeIcon icon={faSdCard} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.storageOptions}
                                                onChange={(e) => setFormData({ ...formData, storageOptions: e.target.value })}
                                                placeholder="e.g., 64GB, 128GB, 256GB"
                                                className="w-full px-12 py-3 rounded-xl border-2 border-white focus:border-blue-500 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Color Options (comma-separated)
                                        </label>
                                        <div className="relative">
                                            <FontAwesomeIcon icon={faPalette} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.colorOptions}
                                                onChange={(e) => setFormData({ ...formData, colorOptions: e.target.value })}
                                                placeholder="e.g., Space Gray, Silver, Gold"
                                                className="w-full px-12 py-3 rounded-xl border-2 border-white focus:border-blue-500 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Variant Pricing Matrix */}
                        {(user.role === 'CEO' || user.role === 'MANAGER') && formData.trackSerials && formData.variantPricing.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-8 border-2 border-indigo-100 shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faLayerGroup} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Variant Pricing Matrix</h3>
                                        <p className="text-sm text-gray-500">Set unique prices for each storage/color combination</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Variant</th>
                                                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Condition Prices (TZS)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {formData.variantPricing.map((variant, idx) => (
                                                <tr key={`${variant.storage}-${variant.simType}-${variant.color}`} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{variant.storage}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                                                    {variant.simType?.replace('_', ' ') || 'DUAL SIM'}
                                                                </span>
                                                                <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                                                    {variant.color}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {['nonActive', 'active', 'refurbished', 'used'].map(condition => (
                                                                <div key={condition} className="space-y-1">
                                                                    <label className="text-[10px] uppercase font-bold text-gray-400 px-1">
                                                                        {condition === 'nonActive' ? 'NEW' : condition}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={variant.prices[condition]}
                                                                        onChange={(e) => {
                                                                            const updated = [...formData.variantPricing];
                                                                            updated[idx].prices[condition] = parseFloat(e.target.value) || 0;
                                                                            setFormData({ ...formData, variantPricing: updated });
                                                                        }}
                                                                        placeholder="Price"
                                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-all"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Customer Notification Toggle */}
                        <div className={`bg-white rounded-3xl p-8 border-2 transition-all duration-500 shadow-sm ${formData.notificationsEnabled
                            ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white'
                            : 'border-gray-100 bg-gray-50/30 grayscale opacity-70'
                            }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${formData.notificationsEnabled
                                        ? 'bg-indigo-600 text-white rotate-0'
                                        : 'bg-gray-200 text-gray-400 rotate-6'
                                        }`}>
                                        <FontAwesomeIcon icon={formData.notificationsEnabled ? faBell : faBellSlash} className="text-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-xl font-black text-gray-900">Customer Gratitude</p>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${formData.notificationsEnabled
                                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {formData.notificationsEnabled ? 'Active' : 'Muted'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 italic">
                                            <FontAwesomeIcon icon={faWhatsapp} className={formData.notificationsEnabled ? 'text-indigo-500' : ''} />
                                            <span>Send automatic WhatsApp thank you after sale</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, notificationsEnabled: !formData.notificationsEnabled })}
                                    className={`relative w-20 h-10 rounded-full transition-all duration-500 p-1.5 ${formData.notificationsEnabled ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-200'
                                        }`}
                                >
                                    <div className={`w-7 h-7 rounded-full bg-white shadow-md transition-all duration-500 transform ${formData.notificationsEnabled ? 'translate-x-10' : 'translate-x-0'
                                        } flex items-center justify-center`}>
                                        {formData.notificationsEnabled && <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />}
                                    </div>
                                </button>
                            </div>
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
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <>Creating...</>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                        Create Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;
