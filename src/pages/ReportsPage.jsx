import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faCalendarAlt,
    faChartLine,
    faBoxOpen,
    faMoneyBillWave,
    faUsers,
    faFilter,
    faSpinner,
    faShieldAlt,
    faFingerprint,
    faCrown,
    faBolt,
    faHistory
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../utils/api';

const ReportsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';

    const [tab, setTab] = useState('sales');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState(null);

    const canAccess = useMemo(() => ['CEO', 'MANAGER'].includes(user?.role), [user?.role]);

    const loadReport = async () => {
        if (!canAccess) return;
        setLoading(true);
        setError('');
        try {
            const params = { startDate, endDate };
            const res = tab === 'sales'
                ? await reportsAPI.getSales(params)
                : await reportsAPI.getImports(params);
            if (res.data?.success) setReport(res.data.data);
            else setError(res.data?.message || 'Failed to initialize data sequence');
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Operation failure');
        } finally {
            setLoading(false);
        }
    };

    const formatTZS = (amount) => {
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

    if (!canAccess) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="text-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-[#f43f5e] text-6xl mb-8 opacity-20" />
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Access Restricted</h1>
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Insufficient Clearance Level</p>
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
                    <motion.div variants={itemVariants} className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/dashboard')}
                            className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-[#00ffa3] border border-white/5 transition-all"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Dossier Terminal</span>
                                <FontAwesomeIcon icon={faShieldAlt} className="text-[#00ffa3] text-[10px]" />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-1 uppercase">Strategic Reports</h1>
                            <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">Multi-vector Performance Analysis</p>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex bg-[#111] p-1.5 rounded-[1.5rem] border border-white/5 shadow-2xl">
                        <button
                            onClick={() => { setTab('sales'); setReport(null); }}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tab === 'sales' ? 'bg-[#00ffa3] text-black shadow-[0_0_20px_rgba(0,255,163,0.3)]' : 'text-white/40 hover:text-white'}`}
                        >
                            Sales Data
                        </button>
                        <button
                            onClick={() => { setTab('imports'); setReport(null); }}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tab === 'imports' ? 'bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-white/40 hover:text-white'}`}
                        >
                            Import Logs
                        </button>
                    </motion.div>
                </motion.div>

                {/* Tactical Parameters */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-[#111]/80 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1 flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full relative group">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ffa3] transition-colors" />
                                <input
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest focus:border-[#00ffa3]/40 outline-none transition-all"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="text-white/10 font-black uppercase tracking-widest text-[10px]">TO</div>
                            <div className="w-full relative group">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ffa3] transition-colors" />
                                <input
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest focus:border-[#00ffa3]/40 outline-none transition-all"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loadReport}
                            disabled={loading}
                            className={`h-[60px] px-12 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all ${loading ? 'opacity-50' : 'bg-[#00ffa3] text-black shadow-[0_10px_30px_rgba(0,255,163,0.3)]'}`}
                        >
                            <FontAwesomeIcon icon={loading ? faSpinner : faBolt} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Initializing' : 'Run Sequence'}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 text-center">
                                Signal Error: {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {report && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-12"
                    >
                        {tab === 'sales' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Calculated Revenue', value: formatTZS(report.summary?.revenue), icon: faMoneyBillWave, color: '#3b82f6' },
                                        { label: 'Operational Yield', value: formatTZS(report.summary?.profit), icon: faChartLine, color: '#00ffa3' },
                                        { label: 'Signal Count', value: report.summary?.count || 0, icon: faBoxOpen, color: '#a855f7' },
                                        { label: 'Mean Intensity', value: formatTZS(report.summary?.averageSale), icon: faUsers, color: '#f59e0b' }
                                    ].map((s, i) => (
                                        <motion.div key={i} variants={itemVariants} className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors"></div>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/5" style={{ color: s.color }}>
                                                    <FontAwesomeIcon icon={s.icon} />
                                                </div>
                                                <FontAwesomeIcon icon={faFingerprint} className="text-white/5 text-xl" />
                                            </div>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{s.value}</h3>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <motion.div variants={itemVariants} className="bg-[#111]/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                                        <h2 className="text-xl font-black text-white mb-8 tracking-tighter uppercase">Protocol Distribution</h2>
                                        <div className="space-y-4">
                                            {(report.byPaymentMethod || []).slice(0, 8).map((m) => (
                                                <div key={m.method} className="flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all">
                                                    <div>
                                                        <p className="text-xs font-black text-white group-hover:text-[#00ffa3] transition-colors">{m.method}</p>
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{m.count} Signals</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-white tracking-tighter">{formatTZS(m.revenue)}</p>
                                                        <p className="text-[9px] font-black text-[#00ffa3] uppercase tracking-widest mt-1">+{formatTZS(m.profit)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="bg-[#111]/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                                        <h2 className="text-xl font-black text-white mb-8 tracking-tighter uppercase">Personnel Rankings</h2>
                                        <div className="space-y-4">
                                            {(report.byStaff || []).slice(0, 8).map((s) => (
                                                <div key={s.staffName} className="flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-white group-hover:text-[#3b82f6] transition-colors truncate uppercase">{s.staffName}</p>
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{s.count} Managed Nodes</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-white tracking-tighter">{formatTZS(s.revenue)}</p>
                                                        <p className="text-[9px] font-black text-[#00ffa3] uppercase tracking-widest mt-1">+{formatTZS(s.profit)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div variants={itemVariants} className="bg-[#111]/80 backdrop-blur-3xl rounded-[4.5rem] p-12 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="w-14 h-14 bg-[#00ffa3]/10 text-[#00ffa3] rounded-2xl flex items-center justify-center border border-[#00ffa3]/20">
                                            <FontAwesomeIcon icon={faHistory} className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tighter leading-none uppercase">Sequence Ledger</h2>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Comprehensive Signal Validation</p>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto no-scrollbar">
                                        <table className="w-full text-left border-collapse min-w-[1000px]">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal Node</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Asset</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Customer</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Personnel</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Protocol</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Magnitude</th>
                                                    <th className="py-8 px-0 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Yield</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/2">
                                                {(report.items || []).slice(0, 200).map((it) => (
                                                    <tr key={it.id} className="hover:bg-white/2 transition-colors group">
                                                        <td className="py-8 px-4 text-[11px] font-black text-white/40 uppercase whitespace-nowrap">{new Date(it.date).toLocaleDateString()} <span className="text-white/10 ml-2">{new Date(it.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                                                        <td className="py-8 px-4 text-xs font-black text-white tracking-tight uppercase group-hover:text-[#00ffa3] transition-colors">{it.productName}</td>
                                                        <td className="py-8 px-4 text-xs font-black text-white/60 uppercase tracking-widest">{it.customerName}</td>
                                                        <td className="py-8 px-4 text-xs font-black text-blue-500 uppercase tracking-widest">{it.staffName}</td>
                                                        <td className="py-8 px-4">
                                                            <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{it.paymentMethod}</span>
                                                        </td>
                                                        <td className="py-8 px-4 text-right font-black text-white text-sm tracking-tighter">{formatTZS(it.amount)}</td>
                                                        <td className="py-8 px-0 text-right font-black text-[#00ffa3] text-sm tracking-tighter">{formatTZS(it.profit)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Imported Nodes', value: report.summary?.totalUnits || 0, icon: faBoxOpen, color: '#3b82f6' },
                                        { label: 'Capital Outflow', value: formatTZS(report.summary?.totalCost), icon: faMoneyBillWave, color: '#f43f5e' },
                                        { label: 'Projected Value', value: formatTZS(report.summary?.totalSellingValue), icon: faChartLine, color: '#00ffa3' },
                                        { label: 'Est. Yield Margin', value: formatTZS(report.summary?.estimatedMargin), icon: faFilter, color: '#f59e0b' }
                                    ].map((s, i) => (
                                        <motion.div key={i} variants={itemVariants} className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors"></div>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/5" style={{ color: s.color }}>
                                                    <FontAwesomeIcon icon={s.icon} />
                                                </div>
                                                <FontAwesomeIcon icon={faFingerprint} className="text-white/5 text-xl" />
                                            </div>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{s.value}</h3>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div variants={itemVariants} className="bg-[#111]/80 backdrop-blur-3xl rounded-[4.5rem] p-12 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                            <FontAwesomeIcon icon={faBolt} className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tighter leading-none uppercase">Inventory Inflow Logs</h2>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Integrated Supply Chain Verification</p>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto no-scrollbar">
                                        <table className="w-full text-left border-collapse min-w-[1200px]">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal Node</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Asset</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Source</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Identifier</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Condition</th>
                                                    <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Inflow Cost</th>
                                                    <th className="py-8 px-0 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right text-[#00ffa3]">Projected</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/2">
                                                {(report.items || []).slice(0, 200).map((d) => (
                                                    <tr key={d.deviceId} className="hover:bg-white/2 transition-colors group">
                                                        <td className="py-8 px-4 text-[11px] font-black text-white/40 uppercase whitespace-nowrap">{new Date(d.addedAt).toLocaleDateString()}</td>
                                                        <td className="py-8 px-4 text-xs font-black text-white tracking-tight uppercase group-hover:text-[#3b82f6] transition-colors">{d.productName}</td>
                                                        <td className="py-8 px-4 text-xs font-black text-white/60 uppercase tracking-widest">{d.supplierName}</td>
                                                        <td className="py-8 px-4 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">{d.serialNumber}</td>
                                                        <td className="py-8 px-4 text-xs font-black text-white/40 uppercase tracking-widest">{d.condition}</td>
                                                        <td className="py-8 px-4 text-right font-black text-white text-sm tracking-tighter">{formatTZS(d.costPrice)}</td>
                                                        <td className="py-8 px-0 text-right font-black text-[#00ffa3] text-sm tracking-tighter">{formatTZS(d.sellingPrice)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                )}

                {!report && (
                    <motion.div variants={itemVariants} className="bg-[#111]/40 backdrop-blur-3xl rounded-[4rem] p-24 text-center border border-white/5 shadow-2xl">
                        <FontAwesomeIcon icon={faFingerprint} className="text-8xl text-white/5 mb-12" />
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">Awaiting Vector Synthesis</h2>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] max-w-2xl mx-auto leading-relaxed">Select temporal parameters and initiate sequence to generate performance data matrix. Data integrity is verified across all operational nodes.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
