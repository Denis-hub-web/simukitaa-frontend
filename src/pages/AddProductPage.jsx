import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faBox, faTruck, faCubes, faLayerGroup,
    faSdCard, faPalette, faCheckCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const AddProductPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        category: 'Phones',
        storageOptions: '',
        colorOptions: '',
        basePricing: {
            nonActive: '',
            active: '',
            refurbished: '',
            used: ''
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.brand) {
            alert('Product name and brand are required');
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
                brand: formData.brand,
                model: formData.model || '',
                category: formData.category,
                variants: {
                    storage: storageArray.length > 0 ? storageArray : ['Standard'],
                    color: colorArray.length > 0 ? colorArray : ['Standard']
                },
                basePricing: {
                    nonActive: parseFloat(formData.basePricing.nonActive) || 0,
                    active: parseFloat(formData.basePricing.active) || 0,
                    refurbished: parseFloat(formData.basePricing.refurbished) || 0,
                    used: parseFloat(formData.basePricing.used) || 0
                }
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faBox} className="mr-2 text-indigo-500" />
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., iPhone 15 Pro"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faCubes} className="mr-2 text-green-500" />
                                    Brand *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="e.g., Apple"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g., A2848"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                >
                                    <option value="Phones">Phones</option>
                                    <option value="Laptops">Laptops</option>
                                    <option value="Tablets">Tablets</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                        </div>

                        {/* Variant Options */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faLayerGroup} className="text-blue-600" />
                                Variant Options
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faSdCard} className="mr-2 text-blue-500" />
                                        Storage Options (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.storageOptions}
                                        onChange={(e) => setFormData({ ...formData, storageOptions: e.target.value })}
                                        placeholder="e.g., 128GB, 256GB, 512GB, 1TB"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faPalette} className="mr-2 text-purple-500" />
                                        Color Options (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.colorOptions}
                                        onChange={(e) => setFormData({ ...formData, colorOptions: e.target.value })}
                                        placeholder="e.g., Black, White, Blue, Gold"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Base Pricing */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Base Pricing (Per Condition)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Non-Active (Default)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.basePricing.nonActive}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            basePricing: { ...formData.basePricing, nonActive: e.target.value }
                                        })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Active
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.basePricing.active}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            basePricing: { ...formData.basePricing, active: e.target.value }
                                        })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Refurbished
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.basePricing.refurbished}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            basePricing: { ...formData.basePricing, refurbished: e.target.value }
                                        })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Used (Trade-In)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.basePricing.used}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            basePricing: { ...formData.basePricing, used: e.target.value }
                                        })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all bg-white"
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-3">
                                💡 These are base prices. You can customize pricing for individual devices later.
                            </p>
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
                </div >
            </div >
        </div >
    );
};

export default AddProductPage;
