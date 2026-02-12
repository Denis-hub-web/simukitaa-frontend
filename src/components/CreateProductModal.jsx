import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faSave, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateProductModal = ({ show, onClose, onSuccess, initialBrand = '', initialCategory = '' }) => {
    const [formData, setFormData] = useState({
        brand: initialBrand,
        category: initialCategory,
        name: '',
        storage: '',
        color: '',
        customBrand: '',
        condition: 'nonActive',
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0
    });
    const [showCustomBrand, setShowCustomBrand] = useState(false);
    const [loading, setLoading] = useState(false);

    // List of common brands for dropdown
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
        setFormData(prev => ({
            ...prev,
            brand: initialBrand,
            category: initialCategory
        }));
        if (initialBrand && !brands.find(b => b.name === initialBrand)) {
            setShowCustomBrand(true);
            setFormData(prev => ({ ...prev, brand: 'other', customBrand: initialBrand }));
        }
    }, [initialBrand, initialCategory]);

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

            const productData = {
                id: `prod_${Date.now()}`,
                name: formData.name,
                category: formData.category || 'General',
                model: formData.storage,
                storage: formData.storage,
                color: formData.color,
                productType: finalBrand,
                status: 'ACTIVE',
                stockByCondition: {
                    nonActive: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    active: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    used: { quantity: 0, costPrice: 0, sellingPrice: 0 },
                    refurbished: { quantity: 0, costPrice: 0, sellingPrice: 0 }
                },
                totalStock: parseInt(formData.quantity) || 0,
                quantity: parseInt(formData.quantity) || 0,
                costPrice: parseFloat(formData.costPrice) || 0,
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                isAvailable: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Set the selected condition stock
            productData.stockByCondition[formData.condition] = {
                quantity: parseInt(formData.quantity) || 0,
                costPrice: parseFloat(formData.costPrice) || 0,
                sellingPrice: parseFloat(formData.sellingPrice) || 0
            };

            await axios.post(`${API_BASE_URL}/condition-stock/create-product`, productData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setLoading(false);
            onSuccess(productData);
            onClose();
        } catch (error) {
            setLoading(false);
            alert('❌ Failed to create product: ' + (error.response?.data?.error || error.message));
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#008069] to-[#00a884] p-6 sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-white">Add New Product</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Brand / Shelf */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Shelf (Brand)</label>
                        <select
                            value={formData.brand}
                            onChange={handleBrandChange}
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] focus:bg-white transition-all shadow-sm"
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

                    {showCustomBrand && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                        >
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Custom Brand Name</label>
                            <input
                                type="text"
                                value={formData.customBrand}
                                onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] focus:bg-white transition-all shadow-sm"
                                placeholder="e.g. Huawei, LG..."
                                required
                            />
                        </motion.div>
                    )}

                    {/* Category / Model Line */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category (Model Line)</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. iPhone 16, Galaxy S24"
                            required
                        />
                    </div>

                    {/* Product Variant Name */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name (Variant)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. iPhone 16 Pro Max"
                            required
                        />
                    </div>

                    {/* Storage & Color */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Storage</label>
                            <input
                                type="text"
                                value={formData.storage}
                                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] focus:bg-white transition-all shadow-sm"
                                placeholder="e.g. 512GB"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Color</label>
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] focus:bg-white transition-all shadow-sm"
                                placeholder="e.g. Desert Titanium"
                                required
                            />
                        </div>
                    </div>

                    {/* Initial Stock Section */}
                    <div className="bg-gray-50 rounded-3xl p-5 space-y-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">📦</span>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Initial Stock</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Condition</label>
                                <select
                                    value={formData.condition}
                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    className="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] transition-all shadow-sm"
                                >
                                    <option value="nonActive">🆕 Non-Active</option>
                                    <option value="active">📱 Active</option>
                                    <option value="used">👤 Used</option>
                                    <option value="refurbished">🔧 Refurbished</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] transition-all shadow-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cost Price (TZS)</label>
                                    <input
                                        type="number"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        className="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] transition-all shadow-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Selling Price (TZS)</label>
                                <input
                                    type="number"
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    className="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border-2 border-transparent focus:border-[#008069] transition-all shadow-sm"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#008069] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating...' : 'Create Product & Add Stock'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateProductModal;
