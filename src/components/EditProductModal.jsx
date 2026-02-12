import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const EditProductModal = ({ show, onClose, onSuccess, product }) => {
    const [formData, setFormData] = useState({
        brand: '',
        category: '',
        name: '',
        storage: '',
        color: '',
        customBrand: '',
        stockByCondition: {
            nonActive: { quantity: 0, costPrice: 0, sellingPrice: 0 },
            active: { quantity: 0, costPrice: 0, sellingPrice: 0 },
            used: { quantity: 0, costPrice: 0, sellingPrice: 0 },
            refurbished: { quantity: 0, costPrice: 0, sellingPrice: 0 }
        }
    });
    const [showCustomBrand, setShowCustomBrand] = useState(false);
    const [loading, setLoading] = useState(false);

    const brands = [
        { id: 'iphone', name: 'iPhone', icon: '🍎' },
        { id: 'samsung', name: 'Samsung', icon: '📱' },
        { id: 'google', name: 'Google', icon: '🟦' },
        { id: 'apple mac', name: 'Apple Mac', icon: '💻' },
        { id: 'sony', name: 'Sony', icon: '🎧' },
        { id: 'xiaomi', name: 'Xiaomi', icon: '📲' },
        { id: 'oppo', name: 'Oppo', icon: '📱' },
        { id: 'accessories', name: 'Accessories', icon: '🔌' },
        { id: 'repair parts', name: 'Repair Parts', icon: '🔧' },
        { id: 'other', name: 'Other (Custom Brand)', icon: '➕' }
    ];

    useEffect(() => {
        if (product) {
            const isStandardBrand = brands.find(b => b.name === product.productType);
            setFormData({
                brand: isStandardBrand ? product.productType : 'other',
                category: product.category || '',
                name: product.name || '',
                storage: product.storage || '',
                color: product.color || '',
                customBrand: isStandardBrand ? '' : product.productType,
                stockByCondition: product.stockByCondition || {
                    nonActive: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    active: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    used: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    refurbished: { quantity: 0, costPrice: 0, sellingPrice: 0 }
                }
            });
            setShowCustomBrand(!isStandardBrand);
        }
    }, [product, show]);

    const handleStockChange = (condition, field, value) => {
        setFormData(prev => ({
            ...prev,
            stockByCondition: {
                ...prev.stockByCondition,
                [condition]: {
                    ...prev.stockByCondition[condition],
                    [field]: parseFloat(value) || 0
                }
            }
        }));
    };

    const handleBrandChange = (e) => {
        const value = e.target.value;
        if (value === 'other') {
            setShowCustomBrand(true);
            setFormData({ ...formData, brand: 'other', customBrand: '' });
        } else {
            setShowCustomBrand(false);
            setFormData({ ...formData, brand: value, customBrand: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const finalBrand = showCustomBrand ? formData.customBrand : formData.brand;

            const updateData = {
                name: formData.name,
                productType: finalBrand,
                category: formData.category,
                storage: formData.storage,
                color: formData.color,
                stockByCondition: formData.stockByCondition
            };

            await axios.put(`${API_BASE_URL}/condition-stock/${product.id}/details`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setLoading(false);
            onSuccess();
            onClose();
        } catch (error) {
            setLoading(false);
            alert('❌ Failed to update product: ' + (error.response?.data?.error || error.message));
        }
    };

    if (!show || !product) return null;

    const conditionData = [
        { key: 'nonActive', label: '🆕 Non-Active', color: 'bg-blue-50 border-blue-100' },
        { key: 'active', label: '📱 Active', color: 'bg-green-50 border-green-100' },
        { key: 'used', label: '👤 Used', color: 'bg-orange-50 border-orange-100' },
        { key: 'refurbished', label: '🔧 Refurbished', color: 'bg-purple-50 border-purple-100' }
    ];

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Edit Product</p>
                    <h2 className="text-3xl font-black tracking-tighter">{product.name}</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Meta Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Shelf (Brand)</label>
                                <select
                                    value={formData.brand}
                                    onChange={handleBrandChange}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                    required
                                >
                                    <option value="" disabled>Select Brand</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.name}>
                                            {brand.icon} {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Category (Model Line)</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. iPhone 16"
                                    required
                                />
                            </div>
                        </div>

                        {showCustomBrand && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Custom Brand Name</label>
                                <input
                                    type="text"
                                    value={formData.customBrand}
                                    onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. Huawei"
                                    required
                                />
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Product Name (Variant)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                placeholder="iPhone 16 Pro Max 512GB"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Storage</label>
                                <input
                                    type="text"
                                    value={formData.storage}
                                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                    placeholder="512GB"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Color</label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                    placeholder="Desert Titanium"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-green-600 rounded-full"></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Stock & Inventory</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {conditionData.map(cond => (
                                <div key={cond.key} className={`${cond.color} p-6 rounded-[2rem] border-2 space-y-4`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">{cond.label}</span>
                                        <div className="bg-white/50 px-3 py-1 rounded-full text-[10px] font-black text-slate-500">
                                            Inventory
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={formData.stockByCondition[cond.key].quantity}
                                                onChange={(e) => handleStockChange(cond.key, 'quantity', e.target.value)}
                                                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold border border-transparent focus:border-slate-900 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Cost (TSH)</label>
                                            <input
                                                type="number"
                                                value={formData.stockByCondition[cond.key].costPrice}
                                                onChange={(e) => handleStockChange(cond.key, 'costPrice', e.target.value)}
                                                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold border border-transparent focus:border-slate-900 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Sell (TSH)</label>
                                            <input
                                                type="number"
                                                value={formData.stockByCondition[cond.key].sellingPrice}
                                                onChange={(e) => handleStockChange(cond.key, 'sellingPrice', e.target.value)}
                                                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold border border-transparent focus:border-slate-900 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 sticky bottom-0 bg-white pb-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Propagating Changes...' : 'Save Product & Stock Updates'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditProductModal;
