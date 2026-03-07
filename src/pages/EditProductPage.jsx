import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBox, faSave, faTruck, faTag, faCubes, faBell, faBellSlash
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

import { API_URL as API_BASE_URL } from '../utils/api';

const EditProductPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        category: 'Phones',
        trackSerials: true,
        buyingPrice: '',
        storageOptions: '',
        colorOptions: '',
        simTypeOptions: 'DUAL_SIM, ESIM, PHYSICAL_SIM',
        nonActivePrice: '',
        activePrice: '',
        refurbishedPrice: '',
        usedPrice: '',
        variantPricing: [],
        notificationsEnabled: true
    });

    // Sync variantPricing when options change
    useEffect(() => {
        if (!formData.trackSerials) return;

        const storages = formData.storageOptions.split(',').map(s => s.trim()).filter(s => s) || ['Standard'];
        const colors = formData.colorOptions.split(',').map(c => c.trim()).filter(c => c) || ['Any'];
        const simTypes = formData.simTypeOptions.split(',').map(s => s.trim()).filter(s => s) || ['DUAL_SIM', 'ESIM', 'PHYSICAL_SIM'];

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
                            costPrices: {
                                nonActive: parseFloat(formData.buyingPrice) || 0,
                                active: parseFloat(formData.buyingPrice) || 0,
                                refurbished: parseFloat(formData.buyingPrice) || 0,
                                used: parseFloat(formData.buyingPrice) || 0
                            },
                            prices: {
                                nonActive: formData.nonActivePrice || 0,
                                active: formData.activePrice || 0,
                                refurbished: formData.refurbishedPrice || 0,
                                used: formData.usedPrice || 0
                            }
                        });
                    }
                });
            });
        });

        if (JSON.stringify(newPricing) !== JSON.stringify(formData.variantPricing)) {
            setFormData(prev => ({ ...prev, variantPricing: newPricing }));
        }
    }, [formData.storageOptions, formData.colorOptions, formData.simTypeOptions, formData.trackSerials]);
    const [applyPriceToInventory, setApplyPriceToInventory] = useState(false);

    useEffect(() => {
        fetchData();
    }, [productId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const productRes = await axios.get(`${API_BASE_URL}/stock/products/${productId}`, { headers });
            const product = productRes.data.data || productRes.data;

            // Populate form with existing data
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                model: product.model || '',
                category: product.category || 'Phones',
                trackSerials: product.trackSerials !== false,
                buyingPrice: product.buyingPrice || '',
                storageOptions: product.variants?.storage?.join(', ') || '',
                colorOptions: product.variants?.color?.join(', ') || '',
                simTypeOptions: product.variants?.simType?.join(', ') || 'DUAL_SIM, ESIM, PHYSICAL_SIM',
                nonActivePrice: product.basePricing?.nonActive || '',
                activePrice: product.basePricing?.active || '',
                refurbishedPrice: product.basePricing?.refurbished || '',
                usedPrice: product.basePricing?.used || '',
                variantPricing: product.variantPricing || [],
                notificationsEnabled: product.notificationsEnabled !== false
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load product');
            navigate('/stock-management');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.brand) {
            alert('Name and brand are required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const productData = {
                name: formData.name,
                brand: formData.brand,
                model: formData.model,
                category: formData.category,
                trackSerials: formData.trackSerials,
                buyingPrice: parseFloat(formData.buyingPrice) || 0,
                applyPriceToInventory,
                variants: {
                    storage: formData.storageOptions.split(',').map(s => s.trim()).filter(s => s),
                    color: formData.colorOptions.split(',').map(c => c.trim()).filter(c => c),
                    simType: formData.simTypeOptions.split(',').map(s => s.trim()).filter(s => s)
                },
                basePricing: formData.trackSerials ? {
                    nonActive: parseFloat(formData.nonActivePrice) || 0,
                    active: parseFloat(formData.activePrice) || 0,
                    refurbished: parseFloat(formData.refurbishedPrice) || 0,
                    used: parseFloat(formData.usedPrice) || 0
                } : {
                    nonActive: parseFloat(formData.nonActivePrice) || 0,
                    active: parseFloat(formData.nonActivePrice) || 0,
                    refurbished: parseFloat(formData.nonActivePrice) || 0,
                    used: parseFloat(formData.nonActivePrice) || 0
                },
                variantPricing: formData.trackSerials ? formData.variantPricing : [],
                notificationsEnabled: formData.notificationsEnabled
            };

            await axios.put(`${API_BASE_URL}/stock/products/${productId}`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Product updated successfully!');
            navigate('/stock-management');
        } catch (error) {
            console.error('Error updating product:', error);
            alert(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSubmitting(false);
        }
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
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faBox} className="text-orange-600 text-2xl" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Edit Product</h1>
                            <p className="text-gray-600">Update product details, variants, and pricing</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Details */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCubes} className="text-blue-600" />
                                Product Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., iPhone 16"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Brand *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="e.g., Apple"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Model</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        placeholder="e.g., Pro Max"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    >
                                        <option value="Phones">Phones</option>
                                        <option value="Tablets">Tablets</option>
                                        <option value="Laptops">Laptops</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                {(user.role === 'CEO' || user.role === 'MANAGER') && formData.trackSerials && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Default Buying Price (TZS)</label>
                                        <input
                                            type="number"
                                            value={formData.buyingPrice}
                                            onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                                            placeholder="e.g., 500000"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:outline-none transition-all bg-orange-50/10 shadow-sm"
                                        />
                                        <p className="text-[11px] text-orange-600 mt-2 font-bold flex items-center gap-1">
                                            <span>💡 Automatically used for Manager stock entries</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variant Options - Hide for accessories */}
                        {formData.trackSerials && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTag} className="text-purple-600" />
                                    Variant Options
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Storage Options</label>
                                        <input
                                            type="text"
                                            value={formData.storageOptions}
                                            onChange={(e) => setFormData({ ...formData, storageOptions: e.target.value })}
                                            placeholder="e.g., 128GB, 256GB, 512GB"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">Separate with commas</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Color Options</label>
                                        <input
                                            type="text"
                                            value={formData.colorOptions}
                                            onChange={(e) => setFormData({ ...formData, colorOptions: e.target.value })}
                                            placeholder="e.g., Black, White, Gold"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">Separate with commas</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">SIM Type Options</label>
                                        <input
                                            type="text"
                                            value={formData.simTypeOptions}
                                            onChange={(e) => setFormData({ ...formData, simTypeOptions: e.target.value.toUpperCase() })}
                                            placeholder="ESIM, PHYSICAL_SIM, DUAL_SIM"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Use underscores, e.g. PHYSICAL_SIM</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Information - Only for non-tracked products */}
                        {(user.role === 'CEO' || user.role === 'MANAGER') && !formData.trackSerials && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                                <h3 className="text-lg font-black text-gray-900 mb-4">Pricing Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Buying Price (TZS)</label>
                                        <input
                                            type="number"
                                            value={formData.buyingPrice}
                                            onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price (TZS)</label>
                                        <input
                                            type="number"
                                            value={formData.nonActivePrice}
                                            onChange={(e) => setFormData({ ...formData, nonActivePrice: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Base Pricing - DEPRECATED */}
                        {false && formData.trackSerials && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                                {/* ... hidden ... */}
                            </div>
                        )}
                        {/* Variant Pricing Matrix */}
                        {(user.role === 'CEO' || user.role === 'MANAGER') && formData.trackSerials && formData.variantPricing.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 border-2 border-indigo-100 shadow-sm mt-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">Variant Pricing Matrix</h3>
                                            <p className="text-sm text-gray-500">Set unique prices for each storage/SIM combination</p>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer bg-indigo-50 px-4 py-2 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={applyPriceToInventory}
                                                onChange={(e) => setApplyPriceToInventory(e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-bold text-indigo-700">Apply to current UNLOCKED units</span>
                                        </label>
                                    </div>
                                    {applyPriceToInventory && (
                                        <p className="text-xs text-orange-600 mt-3 font-bold flex items-center gap-2">
                                            ⚠️ This will update all available stock that isn't manually locked!
                                        </p>
                                    )}
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
                                                        <div className="space-y-4">
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

                                                            {user.role === 'CEO' && (
                                                                <div className="pt-4 border-t border-gray-100">
                                                                    <div className="text-[10px] uppercase font-bold text-gray-400 px-1 mb-2">
                                                                        Buying (Cost)
                                                                    </div>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                        {['nonActive', 'active', 'refurbished', 'used'].map(condition => (
                                                                            <div key={condition} className="space-y-1">
                                                                                <label className="text-[10px] uppercase font-bold text-gray-400 px-1">
                                                                                    {condition === 'nonActive' ? 'NEW' : condition}
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={(variant.costPrices?.[condition] ?? variant.costPrice) ?? ''}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...formData.variantPricing];
                                                                                        const next = parseFloat(e.target.value) || 0;
                                                                                        updated[idx].costPrices = {
                                                                                            nonActive: 0,
                                                                                            active: 0,
                                                                                            refurbished: 0,
                                                                                            used: 0,
                                                                                            ...(updated[idx].costPrices || {})
                                                                                        };
                                                                                        updated[idx].costPrices[condition] = next;
                                                                                        setFormData({ ...formData, variantPricing: updated });
                                                                                    }}
                                                                                    placeholder="Cost"
                                                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-all"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
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

                        {/* Customer Notification Toggle - Premium Upgrade */}
                        <div className={`bg-white rounded-3xl p-8 border-2 transition-all duration-500 shadow-sm ${formData.notificationsEnabled
                            ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-white'
                            : 'border-gray-100 bg-gray-50/30 grayscale opacity-70'
                            }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${formData.notificationsEnabled
                                        ? 'bg-green-500 text-white rotate-0'
                                        : 'bg-gray-200 text-gray-400 -rotate-6'
                                        }`}>
                                        <FontAwesomeIcon icon={formData.notificationsEnabled ? faBell : faBellSlash} className="text-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-xl font-black text-gray-900">Customer Gratitude</p>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${formData.notificationsEnabled
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {formData.notificationsEnabled ? 'Active' : 'Muted'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 italic">
                                            <FontAwesomeIcon icon={faWhatsapp} className={formData.notificationsEnabled ? 'text-green-500' : ''} />
                                            <span>Send automatic WhatsApp thank you after sale</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, notificationsEnabled: !formData.notificationsEnabled })}
                                    className={`relative w-20 h-10 rounded-full transition-all duration-500 p-1.5 ${formData.notificationsEnabled ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-200'
                                        }`}
                                >
                                    <div className={`w-7 h-7 rounded-full bg-white shadow-md transition-all duration-500 transform ${formData.notificationsEnabled ? 'translate-x-10' : 'translate-x-0'
                                        } flex items-center justify-center`}>
                                        {formData.notificationsEnabled && <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />}
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
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>Updating Product...</>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                                        Update Product
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

export default EditProductPage;
