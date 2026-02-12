import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPlus, faEdit, faTrash, faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CreateProductModal from '../components/CreateProductModal';
import ManageStockModal from '../components/ManageStockModal';
import EditProductModal from '../components/EditProductModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CategoryView = () => {
    const navigate = useNavigate();
    const { type, category } = useParams();
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCondition, setSelectedCondition] = useState('nonActive');

    useEffect(() => {
        loadCategory();
    }, [type, category]);

    const loadCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/condition-stock/category/${encodeURIComponent(type)}/${encodeURIComponent(category)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProducts(response.data.data.products || []);
            setStats(response.data.data.stats);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load category:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getConditionBadge = (condition) => {
        const badges = {
            nonActive: { icon: '🆕', label: 'Non-Active', color: 'bg-blue-100 text-blue-800' },
            active: { icon: '📱', label: 'Active', color: 'bg-green-100 text-green-800' },
            used: { icon: '👤', label: 'Used', color: 'bg-orange-100 text-orange-800' },
            refurbished: { icon: '🔧', label: 'Refurbished', color: 'bg-purple-100 text-purple-800' }
        };
        return badges[condition] || badges.nonActive;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Loading Category...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#008069] pb-8 pt-4 shadow-xl">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/condition-stock')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">{type}</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter">{category}</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white text-[#008069] px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-white/90 transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Add Product</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Products</span>
                            <p className="text-white font-black text-xl">{stats?.products || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Total Stock</span>
                            <p className="text-white font-black text-xl">{stats?.stock || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Total Value</span>
                            <p className="text-white font-black text-sm">{formatCurrency(stats?.value || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-4">
                {/* Products */}
                <div className="space-y-4">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 shadow-lg"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500 font-bold">{product.storage} • {product.color}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowEditModal(true);
                                        }}
                                        className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.delete(`${API_BASE_URL}/condition-stock/${product.id}`, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    loadCategory();
                                                } catch (error) {
                                                    alert('❌ Failed to delete product');
                                                }
                                            }
                                        }}
                                        className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Stock by Condition */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(product.stockByCondition || {}).map(([condition, data]) => {
                                    const badge = getConditionBadge(condition);
                                    return (
                                        <motion.div
                                            key={condition}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setSelectedCondition(condition);
                                                setShowManageModal(true);
                                            }}
                                            className={`${badge.color} rounded-2xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md border border-transparent hover:border-white/20`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">{badge.icon}</span>
                                                <span className="text-xs font-black uppercase">{badge.label}</span>
                                            </div>
                                            <p className="text-2xl font-black mb-1">{data.quantity || 0}</p>
                                            {data.quantity > 0 && (
                                                <p className="text-xs font-bold opacity-80">{formatCurrency(data.sellingPrice)}</p>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Total */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-600">Total Stock:</span>
                                <span className="text-lg font-black text-gray-900">{product.totalStock || 0} units</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="bg-white rounded-3xl p-20 text-center">
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Products in This Category</h3>
                        <p className="text-sm text-gray-500 mb-6">Start by adding your first product</p>
                        <button
                            onClick={() => navigate('/condition-stock')}
                            className="bg-[#008069] text-white px-6 py-3 rounded-2xl font-black text-xs"
                        >
                            Add Product
                        </button>
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            <CreateProductModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    loadCategory();
                }}
                initialBrand={type}
                initialCategory={category}
            />

            {/* Manage Stock Modal */}
            <ManageStockModal
                show={showManageModal}
                onClose={() => setShowManageModal(false)}
                onSuccess={() => {
                    loadCategory();
                }}
                product={selectedProduct}
                initialCondition={selectedCondition}
            />

            {/* Edit Details Modal */}
            <EditProductModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    loadCategory();
                }}
                product={selectedProduct}
            />
        </div>
    );
};

export default CategoryView;
