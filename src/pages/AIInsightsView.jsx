import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faRefresh, faExclamationTriangle, faArrowDown,
    faArrowUp, faChartLine, faMoneyBillWave, faBoxOpen, faFire,
    faSimCard
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIInsightsView = () => {
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/condition-stock/ai/insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInsights(response.data.data.insights);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Failed to load insights:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadInsights();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Analyzing Stock...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 pb-8 pt-4 shadow-xl">
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
                                <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">🤖 AI Powered</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter">Stock Insights</h1>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-black text-xs flex items-center gap-2 hover:bg-white/30 transition-all disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faRefresh} className={refreshing ? 'animate-spin' : ''} />
                            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <p className="text-white/80 text-xs font-bold">Last Updated: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-4 space-y-6">
                {/* Low Stock Alerts */}
                {insights?.lowStock && insights.lowStock.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-lg overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Low Stock Alerts</h2>
                                    <p className="text-white/80 text-sm font-bold">{insights.lowStock.length} products need attention</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {insights.lowStock.map((item, index) => (
                                <div key={index} className="bg-red-50 rounded-2xl p-4 border-2 border-red-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-black text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-600 font-bold">Only {item.currentStock} units left</p>
                                        </div>
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">URGENT</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 mb-3">{item.recommendation}</p>
                                    <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600">
                                        Order Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Slow Moving Items */}
                {insights?.slowMoving && insights.slowMoving.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-lg overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faArrowDown} className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Slow-Moving Items</h2>
                                    <p className="text-white/80 text-sm font-bold">{insights.slowMoving.length} products not selling well</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {insights.slowMoving.map((item, index) => (
                                <div key={index} className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-black text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-600 font-bold">{item.daysWithoutSale} days without sale</p>
                                        </div>
                                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-black">SLOW</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 mb-3">{item.suggestion}</p>
                                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-yellow-600">
                                        Apply Discount
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Trending Products */}
                {insights?.trending && insights.trending.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-lg overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faArrowUp} className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Trending Products</h2>
                                    <p className="text-white/80 text-sm font-bold">{insights.trending.length} hot sellers</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {insights.trending.map((item, index) => (
                                <div key={index} className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-black text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-600 font-bold">{item.salesCount} sales this month</p>
                                        </div>
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">🔥 HOT</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">{item.insight}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* SIM Type Performance */}
                {insights?.simPerformance && insights.simPerformance.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-lg overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faSimCard} className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">SIM Type Analytics</h2>
                                    <p className="text-white/80 text-sm font-bold">New Marketplace Trends</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {insights.simPerformance.map((item, index) => (
                                <div key={index} className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-black text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-600 font-bold">Based on last 30 days</p>
                                        </div>
                                        <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-black">MARKET TREND</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 mb-3">{item.description}</p>
                                    <button
                                        onClick={() => navigate('/all-devices')}
                                        className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-600"
                                    >
                                        {item.action || 'Check Stock'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {(!insights || (insights.lowStock?.length === 0 && insights.slowMoving?.length === 0 && insights.trending?.length === 0 && insights.simPerformance?.length === 0)) && (
                    <div className="bg-white rounded-3xl p-20 text-center">
                        <FontAwesomeIcon icon={faChartLine} className="text-4xl text-gray-200 mb-4" />
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Insights Available</h3>
                        <p className="text-sm text-gray-500">AI insights will appear here as you manage your stock</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsightsView;
