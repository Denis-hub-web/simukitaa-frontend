import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBrain, faSearch, faArrowUp, faArrowDown, faMinus,
    faTrophy, faMoneyBill, faChartLine, faSpinner,
    faCheckCircle, faBolt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SalesMaster = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const getBaseUrl = () => {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
        const hostname = window.location.hostname;
        return (hostname === 'localhost' || hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : `http://${hostname}:5000/api`;
    };

    const handleQuery = async (queryText) => {
        if (!queryText.trim()) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${getBaseUrl()}/sales-master/query`,
                { query: queryText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setResult(response.data.data);
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

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'TSh 0';
        return `TSh ${new Intl.NumberFormat('en-TZ').format(amount)}`;
    };

    const renderHeroMetric = () => {
        if (!result || !result.result) return null;

        const { label, formatted } = result.result;

        return (
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 mb-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faBrain} className="text-xl text-white" />
                        </div>
                        <p className="text-white/80 text-xs font-black tracking-widest uppercase">AI Answer</p>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                        {label}
                    </h1>

                    {formatted && label !== formatted && (
                        <div className="inline-block px-4 py-2 bg-white/10 rounded-lg">
                            <span className="text-white font-bold">{formatted}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderBreakdown = () => {
        if (!result || !result.result) return null;
        // If specific resultData like 'LEADERBOARD' is present, render it
        if (result.result.type === 'LEADERBOARD' && result.result.data) {
            return (
                <div className="premium-card p-6">
                    <h3 className="premium-h3 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faTrophy} className="text-orange-500" />
                        {result.result.title}
                    </h3>
                    <div className="space-y-3">
                        {result.result.data.map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-all">
                                <span className="font-bold text-gray-900">{i + 1}. {item.name}</span>
                                <span className="text-xl font-black text-blue-600">{item.value} sales</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="premium-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="premium-icon-box bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <FontAwesomeIcon icon={faBolt} className="text-xl" />
                </div>
                <div>
                    <h3 className="premium-h3 mb-0">Sales Master AI 🧠</h3>
                    <p className="premium-label mb-0">ChatGPT-level intelligence for sales queries</p>
                </div>
            </div>

            <div className="relative mb-6">
                <FontAwesomeIcon
                    icon={loading ? faSpinner : faSearch}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${loading ? 'animate-spin' : ''}`}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery(query)}
                    placeholder='Ask AI: "Is iPhone 15 in stock?" or "Total profit"'
                    className="premium-input !pl-12 py-4"
                    disabled={loading}
                />
                {query && (
                    <button
                        onClick={() => handleQuery(query)}
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        Ask AI
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-600 font-bold text-sm">{error}</p>
                </div>
            )}

            {!result && (
                <div className="mb-6">
                    <p className="premium-label mb-3">TRY THESE:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                            "Is iPhone 15 in stock?",
                            "Total profit",
                            "Best selling product",
                            "How many users?",
                            "Profit for iPhone 14",
                            "Sales today"
                        ].map((example, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuery(example)}
                                disabled={loading}
                                className="px-4 py-3 bg-gradient-to-br from-gray-50 to-white rounded-xl text-sm font-bold text-gray-700 hover:shadow-lg hover:scale-105 transition-all border border-gray-200 disabled:opacity-50"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-6">
                    {renderHeroMetric()}
                    {renderBreakdown()}
                </div>
            )}
        </div>
    );
};

export default SalesMaster;
