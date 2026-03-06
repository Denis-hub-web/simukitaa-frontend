import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faFilter, faMoneyBillWave, faReceipt, faUser, faPhone,
    faCalendarAlt, faChevronRight, faPrint, faEllipsisV, faChartPie,
    faCashRegister, faExchangeAlt, faBox, faClock, faUserTie, faArrowUp,
    faDollarSign, faPercent, faShoppingCart, faFileInvoiceDollar, faRedo,
    faArrowLeft, faSpinner, faShieldAlt, faFingerprint, faBolt, faCrown
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL as API_BASE_URL } from '../utils/api';

const SalesPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/sales`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSales(response.data.data.sales || []);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!isCEO) return '••••••';
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            month: date.toLocaleString('default', { month: 'short' }),
            day: date.getDate()
        };
    };

    const filteredSales = sales.filter(sale => {
        const matchesSearch =
            (sale.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.staffName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.serialNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMethod = filterMethod === 'all' || sale.paymentMethod === filterMethod;

        let matchesDate = true;
        const saleDateObj = new Date(sale.saleDate);
        saleDateObj.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (saleDateObj < start) matchesDate = false;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);
            if (saleDateObj > end) matchesDate = false;
        }

        return matchesSearch && matchesMethod && matchesDate;
    }).sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));

    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0);

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
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 border-4 border-[#00ffa3] border-t-transparent rounded-2xl mx-auto mb-8 shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                    />
                    <p className="text-[#00ffa3] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Decrypting Sales Matrix...</p>
                </div>
            </div>
        );
    }

    const paymentMethods = Array.from(new Set(sales.map(s => s.paymentMethod).filter(Boolean))).sort();

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 pt-12 selection:bg-[#00ffa3] selection:text-black">
            <div className="max-w-[95%] mx-auto px-6">
                {/* Elite Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16"
                >
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Archive Terminal</span>
                            <FontAwesomeIcon icon={faShieldAlt} className="text-[#00ffa3] text-[10px]" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">Sales History</h1>
                        <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">{filteredSales.length} Transactions Found in Buffer</p>
                    </motion.div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Aggregate Revenue</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="w-px h-12 bg-white/5" />
                        <div className="text-right">
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Operational Yield</p>
                            <p className="text-3xl font-black text-[#00ffa3] tracking-tighter">{formatCurrency(totalProfit)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Filters Toolbar */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap items-center gap-4 bg-[#111]/80 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12"
                >
                    <div className="flex-1 relative group min-w-[300px]">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ffa3] transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH BY PRODUCT, SERIAL, CUSTOMER..."
                            className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest focus:border-[#00ffa3]/40 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">TEMPORAL</span>
                            <input
                                type="date"
                                className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-white/10 mx-2 text-[10px]">→</span>
                            <input
                                type="date"
                                className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                        <FontAwesomeIcon icon={faFilter} className="text-[#00ffa3] text-xs" />
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="bg-transparent text-white text-[11px] font-black uppercase outline-none cursor-pointer"
                        >
                            <option value="all" className="bg-[#111]">PROTOCOL: ALL</option>
                            {paymentMethods.map(method => (
                                <option key={method} value={method} className="bg-[#111]">
                                    {method.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <motion.button
                        whileHover={{ rotate: 180 }}
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setFilterMethod('all');
                            setSearchQuery('');
                            fetchSales();
                        }}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-white/20 hover:text-[#00ffa3] border border-white/5 transition-all"
                    >
                        <FontAwesomeIcon icon={faRedo} className="text-sm" />
                    </motion.button>
                </motion.div>

                {/* Main Data Terminal */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111]/40 backdrop-blur-3xl rounded-[4.5rem] p-12 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ffa3]/20 to-transparent"></div>

                    <div className="overflow-x-auto no-scrollbar relative z-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal Node</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Operational Unit</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Identifier</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Personnel</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Protocol</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Magnitude</th>
                                    <th className="py-8 px-4 text-[11px] font-black text-white/20 uppercase tracking-[0.3em] text-right text-[#00ffa3]">Yield</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/2">
                                {filteredSales.map((sale, index) => {
                                    const { month, day, time } = formatDate(sale.saleDate);
                                    const isTradeIn = !!sale.tradeInId;

                                    return (
                                        <tr
                                            key={sale.id}
                                            className="hover:bg-white/2 transition-all group"
                                        >
                                            <td className="py-10 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center text-center border border-white/5 shadow-2xl">
                                                        <span className="text-[8px] text-[#00ffa3] font-black uppercase tracking-widest">{month}</span>
                                                        <span className="text-lg font-black text-white leading-none">{day}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{time}</div>
                                                </div>
                                            </td>

                                            <td className="py-10 px-4">
                                                <div className="font-black text-sm text-white tracking-tight uppercase group-hover:text-[#00ffa3] transition-colors">{sale.product?.name || 'Unknown Asset'}</div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {sale.storage && (
                                                        <span className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                            {sale.storage}
                                                        </span>
                                                    )}
                                                    {sale.color && (
                                                        <span className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                            {sale.color}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-10 px-4">
                                                <div className="text-[11px] font-mono text-white/40 font-black tracking-widest">
                                                    {sale.serialNumber || 'N/A'}
                                                </div>
                                                {isTradeIn && (
                                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg text-[8px] font-black uppercase border border-[#f59e0b]/20">
                                                        <FontAwesomeIcon icon={faExchangeAlt} />
                                                        Exchanged
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-10 px-4">
                                                <div className="text-xs font-black text-white/60 uppercase tracking-wider">{sale.staff?.name || sale.staffName || 'System'}</div>
                                                <div className="text-[9px] text-white/10 font-bold uppercase mt-1">Operator</div>
                                            </td>

                                            <td className="py-10 px-4 text-center">
                                                <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-white/20 uppercase tracking-[0.2em] shadow-2xl group-hover:text-white transition-colors">
                                                    {sale.paymentMethod?.replace(/_/g, ' ') || 'LEGACY'}
                                                </span>
                                            </td>

                                            <td className="py-10 px-4 text-right">
                                                <div className="font-black text-base text-white tracking-tighter">
                                                    {formatCurrency(sale.totalAmount)}
                                                </div>
                                            </td>

                                            <td className="py-10 px-4 text-right">
                                                <div className="font-black text-sm text-[#00ffa3] tracking-tighter">
                                                    +{formatCurrency(sale.profit || 0)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredSales.length === 0 && (
                            <div className="py-40 text-center opacity-10">
                                <FontAwesomeIcon icon={faFingerprint} className="text-8xl mb-10" />
                                <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-4">Search Sequence Failed</h3>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.5em]">No data records match the current filter criteria</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SalesPage;
