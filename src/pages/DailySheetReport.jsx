import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar, faDownload, faPrint, faArrowUp, faArrowDown,
    faMoneyBillWave, faWallet, faChartLine, faReceipt, faSpinner,
    faChevronLeft, faChevronRight, faCrown, faShieldAlt, faFingerprint,
    faBolt, faHistory
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../utils/api';

const DailySheetReport = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';

    const getLocalDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - (offset * 60 * 1000));
        return local.toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDate());

    useEffect(() => {
        fetchDailySheet();
    }, [selectedDate]);

    const fetchDailySheet = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reports/daily-sheet`, {
                params: { date: selectedDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch daily sheet:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatCurrency = (amount) => {
        if (!isCEO) return '••••••';
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 border-4 border-[#00ffa3] border-t-transparent rounded-2xl mx-auto mb-8 shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                    />
                    <p className="text-[#00ffa3] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Scanning Daily Assets...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const isProfitable = data.summary.netProfit >= 0;

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 pt-12 selection:bg-[#00ffa3] selection:text-black print:bg-white print:text-black">
            <div className="max-w-7xl mx-auto px-6">
                {/* Elite Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16 print:hidden"
                >
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Daily Operations</span>
                            <FontAwesomeIcon icon={faShieldAlt} className="text-[#00ffa3] text-[10px]" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">Daily Sheet Report</h1>
                        <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">Operational Ledger & Financial Transparency</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 bg-[#111]/80 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4 p-2">
                            <button
                                onClick={() => changeDate(-1)}
                                className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:text-[#00ffa3] transition-colors border border-white/5"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                <FontAwesomeIcon icon={faCalendar} className="text-[#00ffa3] text-xs" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                />
                            </div>
                            <button
                                onClick={() => changeDate(1)}
                                className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:text-[#00ffa3] transition-colors border border-white/5"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.print()}
                                className="w-14 h-14 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center hover:text-white transition-all border border-white/5"
                            >
                                <FontAwesomeIcon icon={faPrint} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(getLocalDate())}
                                className="bg-[#00ffa3] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-[#00ffa3]/20"
                            >
                                Today
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Print Header */}
                <div className="hidden print:block text-black mb-12 text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">SimuKitaa Daily Sheet</h1>
                    <p className="text-lg font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="h-1 w-24 bg-black mx-auto mt-4"></div>
                </div>

                {/* Tactical Metrics Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    {[
                        { label: 'Calculated Revenue', value: formatCurrency(data.summary.totalRevenue), sub: `${data.sales.count} Closed Signals`, icon: faMoneyBillWave, color: '#3b82f6' },
                        { label: 'Operational Expenses', value: formatCurrency(data.summary.totalExpenses), sub: `${data.expenses.count} Outflow Nodes`, icon: faWallet, color: '#f43f5e' },
                        { label: 'Net Yield', value: formatCurrency(data.summary.netProfit), sub: isProfitable ? 'Positive Growth' : 'Deficit Detected', icon: isProfitable ? faArrowUp : faArrowDown, color: isProfitable ? '#00ffa3' : '#f59e0b' },
                        { label: 'Efficiency Margin', value: isCEO ? `${data.summary.profitMargin}%` : '••••••', sub: 'Performance Scale', icon: faChartLine, color: '#a855f7' }
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative group overflow-hidden shadow-2xl print:bg-white print:text-black print:border-black print:rounded-2xl"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors print:hidden"></div>
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 print:border-black" style={{ color: s.color }}>
                                    <FontAwesomeIcon icon={s.icon} className="text-2xl" />
                                </div>
                                <FontAwesomeIcon icon={faFingerprint} className="text-white/5 text-xl print:hidden" />
                            </div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1 print:text-gray-500">{s.label}</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2 print:text-black">
                                {s.value}
                            </h3>
                            <p className="text-[9px] font-black text-white/10 uppercase tracking-widest print:text-gray-400">{s.sub}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Categorical Pulse Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#111]/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl print:bg-white print:border-black print:rounded-2xl"
                    >
                        <h2 className="text-xl font-black text-white mb-8 tracking-tighter uppercase print:text-black">Sales Spectrum</h2>
                        <div className="space-y-4">
                            {data.sales.byCategory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all print:border-gray-200">
                                    <span className="font-black text-white/40 uppercase tracking-widest text-[10px] print:text-black">{item.category}</span>
                                    <span className="font-black text-[#00ffa3] text-lg tracking-tighter print:text-black">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                            {data.sales.byCategory.length === 0 && (
                                <p className="text-white/20 text-center py-12 uppercase font-black text-[10px] tracking-[0.3em]">No Pulse Detected</p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#111]/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl print:bg-white print:border-black print:rounded-2xl"
                    >
                        <h2 className="text-xl font-black text-white mb-8 tracking-tighter uppercase print:text-black">Expense Outflow</h2>
                        <div className="space-y-4">
                            {data.expenses.byCategory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all print:border-gray-200">
                                    <span className="font-black text-white/40 uppercase tracking-widest text-[10px] print:text-black">{item.category}</span>
                                    <span className="font-black text-[#f43f5e] text-lg tracking-tighter print:text-black">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                            {data.expenses.byCategory.length === 0 && (
                                <p className="text-white/20 text-center py-12 uppercase font-black text-[10px] tracking-[0.3em]">No Outflow Nodes</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Comprehensive Operational Ledger */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111]/80 backdrop-blur-3xl rounded-[4.5rem] p-12 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden print:bg-white print:border-black print:rounded-2xl"
                >
                    <div className="flex items-center gap-4 mb-12 relative z-10">
                        <div className="w-14 h-14 bg-[#00ffa3]/10 text-[#00ffa3] rounded-2xl flex items-center justify-center border border-[#00ffa3]/20 print:border-black print:text-black">
                            <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter leading-none print:text-black uppercase">Transactional Ledger</h2>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] print:text-gray-400">Integrated Sequence Verification</p>
                        </div>
                        <span className="ml-auto bg-[#00ffa3]/10 text-[#00ffa3] px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#00ffa3]/20 print:hidden">
                            {data.sales.transactions.length} LOGS
                        </span>
                    </div>

                    <div className="overflow-x-auto no-scrollbar relative z-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 print:border-black">
                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] print:text-black">Sequence</th>
                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] print:text-black">Asset Node</th>
                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] print:text-black">Personnel</th>
                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right print:text-black">Magnitude</th>
                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right print:text-black">Net Yield</th>
                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] print:text-black">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/2 print:divide-gray-200">
                                {data.sales.transactions.map((t, index) => (
                                    <tr key={index} className="hover:bg-white/2 transition-colors group print:text-black">
                                        <td className="py-8 px-4 text-white/40 text-[11px] font-black uppercase print:text-black">
                                            {new Date(t.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-8 px-4 font-black text-white tracking-tight uppercase text-xs print:text-black">{t.productName}</td>
                                        <td className="py-8 px-4 text-xs font-black text-[#3b82f6] uppercase tracking-widest print:text-black">{t.staffName}</td>
                                        <td className="py-8 px-4 text-right font-black text-white text-sm tracking-tighter print:text-black">{formatCurrency(t.amount)}</td>
                                        <td className="py-8 px-4 text-right font-black text-[#00ffa3] text-sm tracking-tighter print:text-black">{formatCurrency(t.profit)}</td>
                                        <td className="py-8 px-4">
                                            <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/30 uppercase tracking-[0.2em] print:border-gray-200 print:text-black">
                                                {t.paymentMethod}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.sales.transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-32 text-center opacity-10">
                                            <FontAwesomeIcon icon={faFingerprint} className="text-7xl mb-6" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Logs Restricted</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-12 pt-8 border-t border-gray-200 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                <p>Authentication Sig: {user?.name} | {new Date().toLocaleString()}</p>
                <p className="mt-2 text-gray-200 tracking-[0.5em]">SimuKitaa Elite Business Matrix</p>
            </div>
        </div>
    );
};

export default DailySheetReport;
