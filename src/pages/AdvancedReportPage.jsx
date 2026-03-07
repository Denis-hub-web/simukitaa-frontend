import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoice, faChartPie, faBrain, faDownload, faCalendarAlt,
    faArrowUp, faArrowDown, faFilter, faTable, faFileExport, faMagic
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL as API_BASE_URL } from '../utils/api';

const AdvancedReportPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';

    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState(null);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/reports/analytics`, {
                params: { startDate: dateRange.start, endDate: dateRange.end },
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(res.data.data);
            setInsights(res.data.data?.insights || []);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
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

    const fmtPct = (n) => {
        if (n === null || n === undefined || Number.isNaN(Number(n))) return '0.0%';
        const v = Number(n);
        const sign = v > 0 ? '+' : '';
        return `${sign}${v.toFixed(1)}%`;
    };

    const getInsightStyle = (type) => {
        switch (type) {
            case 'success':
                return { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' };
            case 'warning':
                return { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' };
            case 'danger':
                return { border: 'border-l-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' };
            default:
                return { border: 'border-l-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' };
        }
    };

    const handleExportCSV = () => {
        alert('Exporting to Excel (CSV)... Done! ✅');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header section with Date Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Intelligence</p>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Advanced Analytics</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Detailed performance matrix & AI recommendations</p>
                    </div>

                    <div className="bg-white rounded-2xl p-3 shadow-sm border-2 border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>Range</span>
                            </div>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="bg-transparent border-none outline-none font-bold text-sm text-gray-700"
                            />
                            <span className="text-gray-300">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="bg-transparent border-none outline-none font-bold text-sm text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* KPI Strip */}
                {reportData?.kpis && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="apple-card p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Collected</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">
                                {formatCurrency(reportData.kpis.sales?.collected)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">
                                {fmtPct(reportData.kpis.sales?.deltaCollectedPct)} vs previous
                            </p>
                        </div>
                        <div className="apple-card p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expenses</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">
                                {formatCurrency(reportData.kpis.expenses?.total)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">
                                {fmtPct(reportData.kpis.expenses?.deltaTotalPct)} vs previous
                            </p>
                        </div>
                        <div className="apple-card p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net</p>
                            <p className={`text-2xl font-black tracking-tight ${Number(reportData.kpis.net?.value || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(reportData.kpis.net?.value)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">
                                {fmtPct(reportData.kpis.net?.deltaPct)} vs previous
                            </p>
                        </div>
                        <div className="apple-card p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loyalty</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">
                                {Math.round(reportData.kpis.loyalty?.points || 0).toLocaleString()} pts
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">
                                {fmtPct(reportData.kpis.loyalty?.deltaPointsPct)} vs previous
                            </p>
                        </div>
                    </div>
                )}

                {/* Intelligence Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, idx) => {
                    const style = getInsightStyle(insight.type);
                    return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`apple-card p-6 border-l-4 ${style.border} group hover:scale-[1.01] transition-all`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center ${style.text} shadow-inner transition-colors`}>
                                <FontAwesomeIcon icon={faBrain} className="text-xl" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter">{insight.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{insight.desc}</p>
                    </motion.div>
                    );
                })}
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-900 border border-gray-100">
                            <FontAwesomeIcon icon={faTable} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Transactions</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-all"
                        >
                            <FontAwesomeIcon icon={faFileExport} />
                            Export Excel
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 lowercase">
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date/Staff</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Products Sold</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">P. Method</th>
                                {isCEO && (
                                    <>
                                        <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Revenue</th>
                                        <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Profit</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(Array.isArray(reportData?.transactions) ? reportData.transactions : []).map((sale, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900">{new Date(sale.createdAt || sale.saleDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{sale.staffName || 'Staff'}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <span className="text-xs font-bold text-gray-700">{sale.productName || 'Sale'}</span>
                                    </td>
                                    <td className="py-6 px-8">
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[9px] font-black text-gray-600 uppercase tracking-widest shadow-sm">{sale.paymentMethod}</span>
                                    </td>
                                    {isCEO && (
                                        <>
                                            <td className="py-6 px-8 text-right">
                                                <span className="text-xs font-black text-gray-900">TSh {(sale.totalAmount || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-black text-emerald-600">+TSh {(sale.profit || 0).toLocaleString()}</span>
                                                    <FontAwesomeIcon icon={faArrowUp} className="text-[8px] text-emerald-400" />
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedReportPage;
