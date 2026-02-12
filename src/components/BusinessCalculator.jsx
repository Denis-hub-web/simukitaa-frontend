import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalculator, faSearch, faChartLine, faBox, faMoneyBill,
    faUsers, faTrophy, faArrowRight, faSpinner, faClock
} from '@fortawesome/free-solid-svg-icons';
import analyticsAPI from '../utils/analyticsAPI';

const BusinessCalculator = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    const quickActions = [
        { label: 'Sales Today', query: 'sales today', icon: faChartLine, color: 'blue' },
        { label: 'Sales Yesterday', query: 'sales yesterday', icon: faChartLine, color: 'green' },
        { label: 'Sales This Week', query: 'sales this week', icon: faChartLine, color: 'purple' },
        { label: 'Sales This Month', query: 'sales this month', icon: faChartLine, color: 'orange' },
        { label: 'Cash Sales', query: 'cash sales today', icon: faMoneyBill, color: 'indigo' },
        { label: 'M-Pesa Sales', query: 'mpesa sales today', icon: faMoneyBill, color: 'pink' }
    ];

    const handleQuery = async (queryText) => {
        if (!queryText.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await analyticsAPI.query(queryText);

            if (response.data.success) {
                const newResult = {
                    query: queryText,
                    ...response.data.data,
                    timestamp: new Date().toISOString()
                };

                setResult(newResult);
                setHistory([newResult, ...history.slice(0, 4)]); // Keep last 5
                setQuery('');
            } else {
                setError(response.data.message || 'Could not understand query');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process query');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-TZ').format(num);
    };

    const formatCurrency = (amt) => {
        if (!amt && amt !== 0) return 'TSh 0';
        return `TSh ${formatNumber(amt)}`;
    };

    const renderResult = (data) => {
        if (!data) return null;

        const { parsed, result } = data;

        return (
            <div className="premium-card p-6 mb-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Query Echo */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faCalculator} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="premium-label mb-0 text-[10px]">QUERY</p>
                            <h4 className="font-bold text-gray-900">{data.query}</h4>
                        </div>
                    </div>
                    <span className="premium-label text-[9px]">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        {new Date(data.timestamp).toLocaleTimeString()}
                    </span>
                </div>

                {/* Results based on Intent */}
                {parsed.intent === 'sales' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <p className="premium-label text-[9px] mb-1">TOTAL SALES</p>
                                <h2 className="text-3xl font-black text-blue-600">{formatNumber(result.count)}</h2>
                                <p className="premium-label text-[9px] mt-1">phones sold</p>
                            </div>
                            <div className="bg-green-50 rounded-2xl p-4">
                                <p className="premium-label text-[9px] mb-1">REVENUE</p>
                                <h2 className="text-2xl font-black text-green-600">{formatCurrency(result.revenue)}</h2>
                            </div>
                            <div className="bg-purple-50 rounded-2xl p-4">
                                <p className="premium-label text-[9px] mb-1">AVERAGE</p>
                                <h2 className="text-2xl font-black text-purple-600">{formatCurrency(result.average)}</h2>
                            </div>
                        </div>

                        {result.topProducts && result.topProducts.length > 0 && (
                            <div>
                                <p className="premium-label mb-2">TOP PRODUCTS</p>
                                <div className="space-y-2">
                                    {result.topProducts.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                            <span className="font-bold text-sm">{p.name}</span>
                                            <span className="premium-badge bg-blue-100 text-blue-600">{p.count} sold</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {parsed.intent === 'stock' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-2xl p-4">
                                <p className="premium-label text-[9px] mb-1">TOTAL UNITS</p>
                                <h2 className="text-4xl font-black text-green-600">{formatNumber(result.count)}</h2>
                            </div>
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <p className="premium-label text-[9px] mb-1">PRODUCTS</p>
                                <h2 className="text-4xl font-black text-blue-600">{formatNumber(result.products)}</h2>
                            </div>
                        </div>

                        {result.conditions && (
                            <div>
                                <p className="premium-label mb-2">BY CONDITION</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(result.conditions).map(([condition, count]) => (
                                        <div key={condition} className="flex justify-between bg-gray-50 p-3 rounded-xl">
                                            <span className="font-bold text-sm">{condition}</span>
                                            <span className="premium-badge">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {parsed.intent === 'revenue' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                            <p className="text-white/80 text-[10px] font-black tracking-widest mb-2">TOTAL REVENUE</p>
                            <h1 className="text-5xl font-black mb-2">{formatCurrency(result.revenue)}</h1>
                            <p className="text-white/80 text-sm">{formatNumber(result.transactionCount)} transactions · Avg {formatCurrency(result.average)}</p>
                        </div>

                        {result.paymentBreakdown && (
                            <div>
                                <p className="premium-label mb-2">PAYMENT METHODS</p>
                                <div className="space-y-2">
                                    {Object.entries(result.paymentBreakdown).map(([method, amt]) => (
                                        <div key={method} className="flex justify-between bg-gray-50 p-3 rounded-xl">
                                            <span className="font-bold text-sm">{method}</span>
                                            <span className="premium-badge bg-green-100 text-green-600">{formatCurrency(amt)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {parsed.intent === 'staff' && result.topSeller && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 text-white">
                            <p className="text-white/80 text-[10px] font-black tracking-widest mb-2">🏆 TOP SELLER</p>
                            <h2 className="text-3xl font-black mb-1">{result.topSeller.name}</h2>
                            <p className="text-white/90">{formatCurrency(result.topSeller.revenue)} · {result.topSeller.count} sales</p>
                        </div>

                        {result.leaderboard && result.leaderboard.length > 1 && (
                            <div>
                                <p className="premium-label mb-2">LEADERBOARD</p>
                                <div className="space-y-2">
                                    {result.leaderboard.slice(0, 5).map((staff, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                                                <span className="font-bold text-sm">{staff.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm">{formatCurrency(staff.revenue)}</p>
                                                <p className="premium-label text-[8px] mb-0">{staff.count} sales</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {parsed.intent === 'profit' && (
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
                        <p className="text-white/80 text-[10px] font-black tracking-widest mb-2">💰 TOTAL PROFIT</p>
                        <h1 className="text-5xl font-black mb-2">{formatCurrency(result.profit)}</h1>
                        <p className="text-white/80 text-sm">{formatNumber(result.salesCount)} sales · Avg profit {formatCurrency(result.averageProfit)}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="premium-card p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="premium-icon-box bg-blue-50 text-blue-500">
                    <FontAwesomeIcon icon={faCalculator} className="text-xl" />
                </div>
                <div>
                    <h3 className="premium-h3 mb-0">Sales Calculator</h3>
                    <p className="premium-label mb-0">Ask me anything about your sales</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <FontAwesomeIcon
                    icon={loading ? faSpinner : faSearch}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${loading ? 'animate-spin' : ''}`}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery(query)}
                    placeholder='Try: "sales today" or "cash sales this week"'
                    className="premium-input !pl-12 py-4"
                    disabled={loading}
                />
                {query && (
                    <button
                        onClick={() => handleQuery(query)}
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-600 font-bold text-sm">{error}</p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mb-6">
                <p className="premium-label mb-3">QUICK ACTIONS</p>
                <div className="grid grid-cols-3 gap-2">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuery(action.query)}
                            disabled={loading}
                            className={`p-3 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-xl transition-all text-left group disabled:opacity-50`}
                        >
                            <FontAwesomeIcon icon={action.icon} className={`text-${action.color}-500 mb-2`} />
                            <p className="font-bold text-xs text-gray-900">{action.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Result */}
            {renderResult(result)}

            {/* History */}
            {history.length > 1 && (
                <div>
                    <p className="premium-label mb-3">RECENT QUERIES</p>
                    <div className="space-y-2">
                        {history.slice(1).map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setResult(item)}
                                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-all text-left"
                            >
                                <span className="font-bold text-sm text-gray-700">{item.query}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessCalculator;
