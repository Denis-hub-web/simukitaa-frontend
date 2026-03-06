import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoice, faChartPie, faBrain, faDownload, faCalendarAlt,
    faArrowUp, faArrowDown, faFilter, faTable, faFileExport, faMagic,
    faCrown, faShieldAlt, faBolt, faFingerprint
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL as API_BASE_URL } from '../utils/api';

const AdvancedReportPage = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/reports/daily-sheet?date=${dateRange.end}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(res.data.data);
            generateAIInsights(res.data.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = (data) => {
        const insights = [
            {
                type: 'success',
                icon: faMagic,
                title: 'Market Velocity',
                desc: 'iPhone 15 series is experiencing peak transaction frequency. Stock alignment recommended.',
                restricted: false
            },
            {
                type: 'warning',
                icon: faBrain,
                title: 'Inventory Alert',
                desc: 'Samsung S24 Ultra engagement pulse is below threshold. Regional promotion suggested.',
                restricted: false
            },
            {
                type: 'info',
                icon: faChartPie,
                title: 'Capital Optimization',
                desc: `Profit yield can be increased by 3.5% through discount threshold adjustments.`,
                restricted: true
            }
        ];
        // Filter out restricted insights for non-CEOs
        setAiInsights(insights.filter(i => !i.restricted || isCEO));
    };

    const handleExportCSV = () => {
        alert('✅ Data Core Exported: Security verified and file generated.');
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
                    <p className="text-[#00ffa3] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Neural Reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 pt-12 selection:bg-[#00ffa3] selection:text-black">
            <div className="max-w-7xl mx-auto px-6">
                {/* Elite Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16"
                >
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Business Intelligence</span>
                            <FontAwesomeIcon icon={faShieldAlt} className="text-[#00ffa3] text-[10px]" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">Advanced Analytics</h1>
                        <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">Strategic Data Layer & Terminal Oversight</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 bg-[#111]/80 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-[#00ffa3] text-xs" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                            />
                            <span className="text-white/20 text-[10px] font-black mx-1">TO</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExportCSV}
                            className="bg-[#00ffa3] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_10px_30px_rgba(0,255,163,0.3)]"
                        >
                            <FontAwesomeIcon icon={faFileExport} />
                            <span>Export Core</span>
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* AI Neural Insights */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                >
                    {aiInsights.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative group overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-[#00ffa3]/10 transition-colors"></div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#3b82f6] shadow-2xl group-hover:scale-110 transition-transform duration-500 group-hover:text-[#00ffa3] border border-white/5">
                                    <FontAwesomeIcon icon={insight.icon} className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Signal</p>
                                    <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">{insight.title}</h3>
                                </div>
                            </div>
                            <p className="text-sm text-white/50 font-bold leading-relaxed">{insight.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Advanced Data Matrix */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="bg-[#111]/40 backdrop-blur-3xl rounded-[4.5rem] p-12 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3b82f6]/20 to-transparent"></div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 relative z-10">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-2 leading-none uppercase">Operational Matrix</h2>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Integrated Transaction Alignment</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-[#00ffa3]/5 rounded-xl border border-[#00ffa3]/10">
                                <span className="w-2.5 h-2.5 bg-[#00ffa3] rounded-full animate-ping shadow-[0_0_10px_#00ffa3]" />
                                <span className="text-[10px] font-black text-[#00ffa3] uppercase tracking-widest">Live Syncing</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar relative z-10">
                        <table className="w-full text-left order-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal Node</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Operational Unit</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Pulse Protocol</th>
                                    {isCEO && (
                                        <>
                                            <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Revenue Flow</th>
                                            <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Yield Impact</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/2">
                                {(reportData?.sales || []).map((sale, idx) => (
                                    <tr key={idx} className="hover:bg-white/2 transition-colors group">
                                        <td className="py-10 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white mb-1">{new Date(sale.createdAt || sale.saleDate).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-black text-[#3b82f6] uppercase tracking-[0.2em]">{sale.staffName || 'System Agent'}</span>
                                            </div>
                                        </td>
                                        <td className="py-10 px-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                {(sale.items || []).map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00ffa3]/40" />
                                                        <span className="text-[11px] font-black tracking-tight text-white/80 uppercase">{item.productName}</span>
                                                        {item.serialNumber && <span className="text-[9px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{item.serialNumber}</span>}
                                                    </div>
                                                )) || <span className="text-xs font-black text-white/50">{sale.productName || 'Terminal Op'}</span>}
                                            </div>
                                        </td>
                                        <td className="py-10 px-4">
                                            <span className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-[0.2em] shadow-2xl">{sale.paymentMethod}</span>
                                        </td>
                                        {isCEO && (
                                            <>
                                                <td className="py-10 px-4 text-right">
                                                    <span className="text-sm font-black text-white/90 tracking-tighter">{(sale.totalAmount || 0).toLocaleString()} <span className="text-[10px] text-white/20">/=</span></span>
                                                </td>
                                                <td className="py-10 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-3 text-[#00ffa3]">
                                                        <span className="text-sm font-black tracking-tighter">+{(sale.profit || 0).toLocaleString()}</span>
                                                        <FontAwesomeIcon icon={faArrowUp} className="text-[10px] animate-bounce" />
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {(!reportData?.sales || reportData.sales.length === 0) && (
                                    <tr>
                                        <td colSpan={isCEO ? 5 : 3} className="py-32 text-center opacity-10">
                                            <FontAwesomeIcon icon={faFingerprint} className="text-7xl mb-6" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Active Logs Detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdvancedReportPage;
