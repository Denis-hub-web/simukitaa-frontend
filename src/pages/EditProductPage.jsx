import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBox, faSave, faTruck, faTag, faCubes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EditProductPage = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        category: 'Phones',
        storageOptions: '',
        colorOptions: '',
        nonActivePrice: '',
        activePrice: '',
        refurbishedPrice: '',
        usedPrice: ''
    });

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
                storageOptions: product.variants?.storage?.join(', ') || '',
                colorOptions: product.variants?.color?.join(', ') || '',
                nonActivePrice: product.basePricing?.nonActive || '',
                activePrice: product.basePricing?.active || '',
                refurbishedPrice: product.basePricing?.refurbished || '',
                usedPrice: product.basePricing?.used || ''
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
                variants: {
                    storage: formData.storageOptions.split(',').map(s => s.trim()).filter(s => s),
                    color: formData.colorOptions.split(',').map(c => c.trim()).filter(c => c)
                },
                basePricing: {
                    nonActive: parseFloat(formData.nonActivePrice) || 0,
                    active: parseFloat(formData.activePrice) || 0,
                    refurbished: parseFloat(formData.refurbishedPrice) || 0,
                    used: parseFloat(formData.usedPrice) || 0
                }
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
                            </div>
                        </div>

                        {/* Variant Options */}
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
                            </div>
                        </div>

                        {/* Base Pricing */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Base Pricing (TZS)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Non-Active</label>
                                    <input
                                        type="number"
                                        value={formData.nonActivePrice}
                                        onChange={(e) => setFormData({ ...formData, nonActivePrice: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Active</label>
                                    <input
                                        type="number"
                                        value={formData.activePrice}
                                        onChange={(e) => setFormData({ ...formData, activePrice: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Refurbished</label>
                                    <input
                                        type="number"
                                        value={formData.refurbishedPrice}
                                        onChange={(e) => setFormData({ ...formData, refurbishedPrice: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Used</label>
                                    <input
                                        type="number"
                                        value={formData.usedPrice}
                                        onChange={(e) => setFormData({ ...formData, usedPrice: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                    />
                                </div>
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
