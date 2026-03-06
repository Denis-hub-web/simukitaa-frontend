import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calculator,
    PackageOpen,
    Bot,
    Filter,
    Search
} from 'lucide-react';
import { stockCalculatorAPI } from '../utils/stockCalculatorAPI';

const TypingText = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <span>{displayedText}</span>;
};

const StockCalculatorPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('stock'); // 'stock' or 'sales'
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'allTime',
        startDate: '',
        endDate: '',
        name: '',
        storage: '',
        color: '',
        simType: '',
        condition: '',
        staffName: '',
        paymentMethod: '',
        paymentStatus: ''
    });
    const [results, setResults] = useState(null);

    useEffect(() => {
        fetchOptions();
    }, [mode]);

    useEffect(() => {
        if (options) {
            handleCalculate();
        }
    }, [filters, options]);

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const response = mode === 'stock'
                ? await stockCalculatorAPI.getOptions()
                : await stockCalculatorAPI.getSalesOptions();
            setOptions(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch options:', error);
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        setResults(null);
        try {
            const response = mode === 'stock'
                ? await stockCalculatorAPI.calculate(filters)
                : await stockCalculatorAPI.calculateSales(filters);

            setTimeout(() => {
                setResults(response.data.data);
                setCalculating(false);
            }, 800);
        } catch (error) {
            console.error('Calculation failed:', error);
            setCalculating(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            dateRange: 'allTime',
            startDate: '',
            endDate: '',
            name: '',
            storage: '',
            color: '',
            simType: '',
            condition: '',
            staffName: '',
            paymentMethod: '',
            paymentStatus: ''
        });
        setResults(null);
    };

    const handleModeSwitch = (newMode) => {
        if (newMode === mode) return;
        setMode(newMode);
        setOptions(null); // Clear options to force fresh load and prevent state mismatch
        setResults(null);
        resetFilters();
    };

    if (loading && !options) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Initializing {mode === 'stock' ? 'Stock' : 'Sales'} Calculator...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20">
            {/* Header - Non-sticky Part with enhanced gradient */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 pb-10 pt-8 shadow-2xl relative overflow-hidden">
                {/* Animated background orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-300/10 rounded-full -ml-36 -mt-36 blur-2xl"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/dashboard')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </motion.button>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-indigo-100 font-black uppercase tracking-[0.25em] text-[9px] mb-1.5 flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                                    Intelligence Hub
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-lg"
                                >
                                    <Calculator className="w-7 h-7 text-cyan-300 drop-shadow-glow" />
                                    Analytics Center
                                </motion.h1>
                            </div>
                        </div>

                        {/* Enhanced Mode Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-black/30 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 flex gap-2 shadow-2xl"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModeSwitch('stock')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${mode === 'stock'
                                    ? 'bg-gradient-to-r from-white to-gray-50 text-indigo-700 shadow-xl'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                📦 Stock
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModeSwitch('sales')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${mode === 'sales'
                                    ? 'bg-gradient-to-r from-white to-gray-50 text-purple-700 shadow-xl'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                💰 Sales
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Calculator Display Section - Enhanced */}
            <div className="sticky top-0 z-50 pt-3 pb-5 bg-gradient-to-b from-slate-50/95 via-blue-50/90 to-transparent backdrop-blur-2xl border-b border-indigo-100/50">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        layout
                        className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 border-2 border-indigo-400/30 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                        <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-6 font-mono relative z-10 border border-indigo-500/20 shadow-inner">
                            <AnimatePresence mode="wait">
                                {calculating ? (
                                    <motion.div
                                        key="calculating"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-3 text-emerald-400 text-sm">
                                            <div className="relative">
                                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
                                                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                            </div>
                                            <TypingText text={`Calculating ${mode} performance...`} speed={40} />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce shadow-lg shadow-indigo-500/50" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full animate-bounce shadow-lg shadow-pink-500/50" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </motion.div>
                                ) : results ? (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-baseline gap-3 flex-wrap">
                                            {mode === 'stock' ? (
                                                <>
                                                    <span className="text-gray-500 text-[10px] uppercase font-black tracking-wider">Units</span>
                                                    <span className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent leading-none drop-shadow-glow">{results.quantity}</span>
                                                    <span className="text-gray-500 text-[10px] uppercase font-black ml-6 tracking-wider">Cost</span>
                                                    <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent leading-none">Tsh {results.totalCost.toLocaleString()}</span>
                                                    <span className="text-gray-500 text-[10px] uppercase font-black ml-6 tracking-wider">Value</span>
                                                    <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-none">Tsh {results.totalValue.toLocaleString()}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-gray-500 text-[10px] uppercase font-black tracking-wider">Revenue</span>
                                                    <span className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent leading-none drop-shadow-glow">Tsh {results.revenue.toLocaleString()}</span>
                                                    <span className="text-gray-500 text-[10px] uppercase font-black ml-6 tracking-wider">Profit</span>
                                                    <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent leading-none">Tsh {results.profit.toLocaleString()}</span>
                                                    <span className="text-gray-500 text-[10px] uppercase font-black ml-6 tracking-wider">Units</span>
                                                    <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-none">{results.quantity}</span>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-gray-600 text-center py-6 flex items-center justify-center gap-4"
                                    >
                                        <Calculator className="w-8 h-8 opacity-20" />
                                        <p className="text-sm font-black uppercase tracking-widest">Ready to calculate {mode}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-7">
                {/* Filter Section - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-indigo-100/50 relative overflow-hidden"
                >
                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full -ml-24 -mb-24"></div>

                    <div className="flex items-center gap-3 mb-8 pb-5 border-b-2 border-gradient-to-r from-transparent via-indigo-200 to-transparent relative z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Filter className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {mode === 'stock' ? '📦 Stock' : '💰 Sales'} Parameters
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {/* Time Period Filter - ALWAYS FIRST */}
                        <div className="space-y-4 lg:col-span-1">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                                    <Search className="w-3 h-3" />
                                    Time Period
                                </label>
                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                    className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 text-sm font-black text-indigo-900 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
                                >
                                    <option value="allTime">All Time Data</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="last7days">Last 7 Days</option>
                                    <option value="last30days">Last 30 Days</option>
                                    <option value="custom">📅 Custom Range (Calendar)</option>
                                </select>
                            </div>

                            {filters.dateRange === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border-2 border-indigo-100"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-1">
                                            <span className="text-indigo-500">●</span> Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                            className="w-full bg-white border-2 border-indigo-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-1">
                                            <span className="text-purple-500">●</span> End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                            className="w-full bg-white border-2 border-indigo-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 transition-all shadow-sm"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Phone Model</label>
                            <select
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Models</option>
                                {options?.names.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {mode === 'stock' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Storage</label>
                                    <select
                                        value={filters.storage}
                                        onChange={(e) => setFilters({ ...filters, storage: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Storage</option>
                                        {options?.storages.map(storage => (
                                            <option key={storage} value={storage}>{storage}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Color</label>
                                    <select
                                        value={filters.color}
                                        onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Colors</option>
                                        {options?.colors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Sold By (Staff)</label>
                                    <select
                                        value={filters.staffName}
                                        onChange={(e) => setFilters({ ...filters, staffName: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Staff</option>
                                        {options?.staffNames?.map(staff => (
                                            <option key={staff} value={staff}>{staff}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Payment Method</label>
                                    <select
                                        value={filters.paymentMethod}
                                        onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Methods</option>
                                        {options?.paymentMethods?.map(method => (
                                            <option key={method} value={method}>{method.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Payment Status</label>
                                    <select
                                        value={filters.paymentStatus}
                                        onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Statuses</option>
                                        {options?.paymentStatuses?.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">SIM Type</label>
                            <select
                                value={filters.simType}
                                onChange={(e) => setFilters({ ...filters, simType: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All SIM Types</option>
                                {options?.simTypes.map(simType => (
                                    <option key={simType} value={simType}>{simType.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Condition</label>
                            <select
                                value={filters.condition}
                                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Conditions</option>
                                {options?.conditions.map(condition => (
                                    <option key={condition} value={condition}>{condition}</option>
                                ))}
                            </select>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-end gap-3 lg:col-span-1">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={resetFilters}
                                className="w-full h-12 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-2xl flex items-center justify-center gap-2 hover:from-gray-200 hover:to-gray-300 transition-all font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg"
                            >
                                <PackageOpen className="w-4 h-4" />
                                <span>Reset All</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* AI Insight Card - Single Card */}
                <AnimatePresence mode="wait">
                    {results && !calculating && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg">AI {mode === 'stock' ? 'Stock' : 'Sales'} Analysis</h4>
                                    <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-widest">SimuKitaa Intelligence</p>
                                </div>
                            </div>

                            <div className="text-gray-300 font-medium leading-relaxed italic text-lg border-l-4 border-indigo-500 pl-6 relative z-10">
                                <TypingText text={results.insight} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StockCalculatorPage;
