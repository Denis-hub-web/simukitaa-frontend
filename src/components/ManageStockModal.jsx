import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMinus, faPlus, faSave, faArrowUp, faArrowDown, faCalculator } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageStockModal = ({ show, onClose, onSuccess, product, initialCondition = 'nonActive' }) => {
    const [condition, setCondition] = useState(initialCondition);
    const [quantity, setQuantity] = useState(0);
    const [adjustment, setAdjustment] = useState(0); // For +/- units
    const [costPrice, setCostPrice] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product && product.stockByCondition && product.stockByCondition[condition]) {
            const currentStock = product.stockByCondition[condition];
            setQuantity(currentStock.quantity || 0);
            setCostPrice(currentStock.costPrice || 0);
            setSellingPrice(currentStock.sellingPrice || 0);
            setAdjustment(0);
        }
    }, [product, condition, show]);

    const profit = sellingPrice - costPrice;
    const profitMargin = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : 0;
    const finalQuantity = quantity + adjustment;

    const handleSave = async () => {
        if (finalQuantity < 0) {
            alert('❌ Quantity cannot be negative!');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const updateData = {
                condition,
                quantity: finalQuantity,
                costPrice,
                sellingPrice
            };

            await axios.put(`${API_BASE_URL}/condition-stock/${product.id}/update`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update stock:', error);
            alert('❌ Failed to update stock: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!show || !product) return null;

    const conditionNames = {
        nonActive: '🆕 Non-Active',
        active: '📱 Active',
        used: '👤 Used',
        refurbished: '🔧 Refurbished'
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                            📦
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Manage Stock</p>
                            <h2 className="text-2xl font-black truncate max-w-[280px]">{product.name}</h2>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Condition Selector */}
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(conditionNames).map(([key, name]) => (
                            <button
                                key={key}
                                onClick={() => setCondition(key)}
                                className={`py-4 px-4 rounded-2xl text-xs font-black transition-all border-2 ${condition === key
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-105'
                                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust Quantity</label>
                            <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black">
                                CURRENT: {quantity}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={() => setAdjustment(prev => prev - 1)}
                                className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-90"
                            >
                                <FontAwesomeIcon icon={faMinus} className="text-xl" />
                            </button>

                            <div className="text-center">
                                <div className={`text-5xl font-black ${finalQuantity < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                    {finalQuantity}
                                </div>
                                <div className={`text-[10px] font-black uppercase mt-1 ${adjustment >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {adjustment >= 0 ? `+${adjustment}` : adjustment} change
                                </div>
                            </div>

                            <button
                                onClick={() => setAdjustment(prev => prev + 1)}
                                className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-green-500 hover:bg-green-50 hover:border-green-200 transition-all active:scale-90"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost Price</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-4 pr-12 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">TZS</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selling Price</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-4 pr-12 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">TZS</span>
                            </div>
                        </div>
                    </div>

                    {/* Profit Analysis */}
                    <div className={`p-5 rounded-3xl border-2 transition-all ${profit < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalculator} className={profit < 0 ? 'text-red-500' : 'text-green-500'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Profit Analysis</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${profit < 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                {profitMargin}% MARGIN
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Profit Per Unit</p>
                                <p className={`text-xl font-black ${profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {profit < 0 ? '-' : '+'} {new Intl.NumberFormat('sw-TZ').format(Math.abs(profit))}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Potential Total</p>
                                <p className={`text-base font-black ${profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {new Intl.NumberFormat('sw-TZ').format(Math.abs(profit * finalQuantity))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} />
                                <span>Update Stock</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ManageStockModal;
