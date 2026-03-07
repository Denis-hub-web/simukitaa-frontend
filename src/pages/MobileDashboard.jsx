import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faChartLine,
    faBoxOpen,
    faUsers,
    faCog,
    faBell,
    faSearch,
    faPlus,
    faTools,
    faExchangeAlt,
    faMoneyBillWave,
    faChevronRight,
    faUserPlus,
    faClock,
    faArrowUp,
    faExclamationTriangle,
    faEllipsisH,
    faArrowRight,
    faCheckCircle,
    faTruck,
    faCompass,
    faBrain,
    faGem,
    faShoppingCart,
    faCubes,
    faEnvelope,
    faBullhorn,
    faUserCog,
    faFileAlt,
    faWallet,
    faSignOutAlt,
    faMobileAlt
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import Modal from '../components/Modal';
import ConversationalSaleForm from '../components/ConversationalSaleForm';
import AddCustomerForm from '../components/AddCustomerForm';
import AddProductForm from '../components/AddProductForm';
import SettingsTab from '../components/SettingsTab';
import BusinessCalculator from '../components/BusinessCalculator';
import AIBusinessIntelligence from '../components/AIBusinessIntelligence';
import { dashboardAPI, expenseAPI, productAPI } from '../utils/api';

const MobileDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [metrics, setMetrics] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [notificationFilter, setNotificationFilter] = useState('all');
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [personalExpenses, setPersonalExpenses] = useState(null);
    const [activityFeed, setActivityFeed] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [topStaff, setTopStaff] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedNotification, setSelectedNotification] = useState(null);

    const API_URL = (() => {
        const envUrl = import.meta.env.VITE_API_URL;
        if (envUrl) {
            const cleaned = envUrl.replace(/\/+$/, '');
            return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
        }

        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

        if (isLocal) return 'http://localhost:5000/api';

        // PRODUCTION: Use the dedicated API subdomain (Cloudflare → Render)
        return 'https://api.simukitaa.com/api';
    })();

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadTimeBoundData();
    }, [dateRange.start, dateRange.end]);

    const loadDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [metricsRes, notifRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setMetrics(metricsRes.data.data);
            setNotifications(Array.isArray(notifRes.data.data.notifications) ? notifRes.data.data.notifications : []);

            if (user?.role === 'CEO') {
                const [lowStockRes, perfRes] = await Promise.all([
                    productAPI.getLowStock(),
                    axios.get(`${API_URL}/manager/team-performance`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setLowStockItems(lowStockRes.data.data || []);
                setTopStaff((perfRes.data.data?.data?.team || []).slice(0, 5));
            }
        } catch (error) {
            console.error('Data sync failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTimeBoundData = async () => {
        try {
            const params = {
                startDate: dateRange.start,
                endDate: dateRange.end
            };

            const [activityRes, expensesRes] = await Promise.all([
                dashboardAPI.getActivityFeed(params),
                expenseAPI.getAll(params)
            ]);

            setActivityFeed(Array.isArray(activityRes.data.data) ? activityRes.data.data : []);
            setPersonalExpenses(Array.isArray(expensesRes.data.data) ? expensesRes.data.data : []);
        } catch (error) {
            console.error('Failed to load time bound data:', error);
            setActivityFeed([]);
            setPersonalExpenses([]);
        }
    };

    const markAsRead = async (notifId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/notifications/${notifId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadDashboardData();
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }

        // Dynamic navigation based on metadata
        if (notif.metadata?.repairId) {
            navigate(`/repairs/${notif.metadata.repairId}`);
        } else if (notif.metadata?.tradeInId) {
            navigate(`/trade-ins/view/${notif.metadata.tradeInId}`);
        } else if (notif.metadata?.saleId) {
            handleSuccess(`Viewing Sale: ${notif.metadata.saleId}`);
        } else if (notif.metadata?.deliveryId) {
            navigate(`/deliveries/${notif.metadata.deliveryId}`);
        }
    };
    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadDashboardData();
            handleSuccess('All signals cleared.');
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const handleSuccess = (msg) => {
        setSuccessMessage(msg);
        setShowSaleModal(false);
        setShowCustomerModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Loading Mobile Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Classic Mobile Header */}
            <div className="sticky top-0 z-40">
                <div className="apple-surface border-b border-white/40">
                    <div className="max-w-6xl mx-auto px-4 pt-7 pb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-apple-sm">
                                    <FontAwesomeIcon icon={faMobileAlt} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold tracking-tight text-gray-900">Simukitaa</h1>
                                    <p className="text-xs text-gray-500">Dashboard</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-gray-500 hover:text-gray-900 transition-colors p-2">
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </button>
                                <div className="w-10 h-10 bg-white rounded-2xl border border-gray-100 shadow-apple-sm flex items-center justify-center text-gray-700 relative">
                                    <FontAwesomeIcon icon={faBell} className="text-gray-600" />
                                    {notifications.filter(n => !n.isRead).length > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-blue-600 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">
                                            {notifications.filter(n => !n.isRead).length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-[11px] font-semibold tracking-tight mb-1">Welcome back</p>
                                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{user?.name?.split(' ')[0]}</h2>
                            </div>

                            <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shrink-0 border border-gray-100 shadow-apple-sm">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="bg-transparent text-gray-700 text-[10px] font-semibold outline-none"
                                />
                                <span className="text-gray-300 text-[10px]">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="bg-transparent text-gray-700 text-[10px] font-semibold outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 mt-6 relative z-10">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find records, inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 shadow-apple-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 text-sm"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* CEO Spotlight - Restricted to CEO */}
                            {user?.role === 'CEO' ? (
                                <>
                                    <div className="apple-card p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue Today</p>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                                                    {formatCurrency((metrics?.sales?.today?.revenue || 0) + (metrics?.repairs?.today?.revenue || 0))}
                                                </h3>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                                <FontAwesomeIcon icon={faChartLine} className="text-xl" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sales</p>
                                                <p className="text-lg font-black text-gray-900">{formatCurrency(metrics?.sales?.today?.revenue || 0)}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Repairs</p>
                                                <p className="text-lg font-black text-gray-900">{formatCurrency(metrics?.repairs?.today?.revenue || 0)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => navigate('/daily-sheet')} className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-apple-md flex flex-col items-center gap-3">
                                            <FontAwesomeIcon icon={faFileAlt} className="text-2xl" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Daily Sheet</span>
                                        </button>
                                        <button onClick={() => navigate('/analytics')} className="apple-card p-6 flex flex-col items-center gap-3 text-gray-900">
                                            <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Analytics</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="apple-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Low Stock Alert</p>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter">
                                                        {lowStockItems.length} Items
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {lowStockItems.slice(0, 4).map((p) => (
                                                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-gray-900 truncate uppercase">{p.name}</p>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Qty: {p.quantity}</p>
                                                        </div>
                                                        <button onClick={() => navigate('/stock-management')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View</button>
                                                    </div>
                                                ))}
                                                {lowStockItems.length === 0 && (
                                                    <div className="text-center py-6 opacity-40">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">All stock healthy</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="apple-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Performing Staff</p>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter">Leaderboard</h3>
                                                </div>
                                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                    <FontAwesomeIcon icon={faTrophy} className="text-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {topStaff.map((m, idx) => (
                                                    <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-amber-50 text-amber-600' : 'bg-white text-gray-600 border border-gray-100'}`}>
                                                                #{idx + 1}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-black text-gray-900 truncate uppercase">{m.name}</p>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{m.salesCount} sales</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{formatCurrency(m.revenue)}</p>
                                                    </div>
                                                ))}
                                                {topStaff.length === 0 && (
                                                    <div className="text-center py-6 opacity-40">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No data</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <AIBusinessIntelligence />
                                </>
                            ) : (
                                <>
                                    {/* Staff View */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Orders', value: metrics?.sales?.today?.count || 0, icon: faBoxOpen, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => navigate('/sales') },
                                            { label: 'Repairs', value: metrics?.repairs?.total || 0, icon: faTools, color: 'text-purple-600', bg: 'bg-purple-50', onClick: () => navigate('/repairs') },
                                            { label: 'Customers', value: metrics?.customers?.count || 0, icon: faUsers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { label: 'Low Stock', value: metrics?.inventory?.lowStock || 0, icon: faExclamationTriangle, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/stock-management'), restricted: true }
                                        ].filter(s => !s.restricted || user?.role === 'CEO' || user?.role === 'MANAGER').map((s, i) => (
                                            <div key={i} onClick={s.onClick} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                                <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-3`}>
                                                    <FontAwesomeIcon icon={s.icon} className={s.color} />
                                                </div>
                                                <p className="text-xl font-black text-gray-900">{s.value}</p>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mt-6">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-6 uppercase">Quick Actions</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => navigate('/sales/new')} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 active:scale-95 transition-all">
                                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                                                    <FontAwesomeIcon icon={faShoppingCart} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-sm text-gray-900 uppercase">New Sale</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Record an order</p>
                                                </div>
                                            </button>
                                            <button onClick={() => navigate('/repair-form')} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 active:scale-95 transition-all">
                                                <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                                                    <FontAwesomeIcon icon={faTools} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-sm text-gray-900 uppercase">New Repair</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Register device</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">My Activity</h3>
                                            <FontAwesomeIcon icon={faHistory} className="text-gray-300" />
                                        </div>
                                        <div className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar">
                                            {activityFeed.length === 0 ? (
                                                <div className="text-center py-12 opacity-25">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No activity</p>
                                                </div>
                                            ) : (
                                                activityFeed.slice(0, 30).map((ev) => (
                                                    <div key={ev.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-start gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ev.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : ev.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'}`}>
                                                            <FontAwesomeIcon icon={ev.type === 'sale' ? faMoneyBillWave : ev.type === 'expense' ? faWallet : faTools} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-black text-gray-900 uppercase truncate">{ev.title}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{ev.subtitle}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[10px] font-black text-gray-900 uppercase">{formatCurrency(ev.amount || 0)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">My Expenses</h3>
                                            <FontAwesomeIcon icon={faWallet} className="text-gray-300" />
                                        </div>
                                        <div className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar">
                                            {personalExpenses.length === 0 ? (
                                                <div className="text-center py-12 opacity-25">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No expenses</p>
                                                </div>
                                            ) : (
                                                personalExpenses.slice(0, 30).map((e) => (
                                                    <div key={e.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-gray-900 uppercase truncate">{e.category}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{e.description}</p>
                                                        </div>
                                                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest shrink-0">{formatCurrency(e.amount || 0)}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'updates' && (
                        <motion.div key="updates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Notifications</h3>
                                    <button onClick={markAllRead} className="text-[10px] font-black text-[#008069] uppercase tracking-widest">Clear All</button>
                                </div>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-20 opacity-20">
                                            <FontAwesomeIcon icon={faBell} className="text-4xl mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif, i) => (
                                            <div key={i} onClick={() => handleNotificationClick(notif)} className={`p-4 rounded-2xl flex items-start gap-4 transition-all ${!notif.isRead ? 'bg-blue-50/50 border border-blue-100' : 'bg-gray-50 border border-transparent'}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'sale' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <FontAwesomeIcon icon={notif.type === 'sale' ? faMoneyBillWave : faBell} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-xs leading-snug ${!notif.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{notif.message}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Today</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tools' && (
                        <motion.div key="tools" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            {[
                                { title: 'New Sale', desc: 'Create Order', icon: faShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/sales/new' },
                                { title: 'Sales History', desc: 'Detailed Ledger', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/sales' },
                                { title: 'Expenses Today', desc: 'Record Costs', icon: faWallet, color: 'text-rose-500', bg: 'bg-rose-50', link: '/expenses' },
                                { title: 'Stock Management', desc: 'Add & Edit Stock', icon: faBoxOpen, color: 'text-blue-600', bg: 'bg-blue-50', link: '/stock-management', restricted: true },
                                { title: 'Stock Table', desc: 'Inventory Check', icon: faCubes, color: 'text-blue-500', bg: 'bg-blue-50', link: '/stock-inventory', restricted: true },
                                { title: 'Wanakitaa Hub', desc: 'Loyalty & Community', icon: faCompass, color: 'text-purple-600', bg: 'bg-purple-50', link: '/wanakitaa', restrictedCEO: true },
                                { title: 'Team Admin', desc: 'Staff Oversight', icon: faUserCog, color: 'text-green-500', bg: 'bg-green-50', link: '/team-management', restricted: true }
                            ].filter(t => (!t.restricted || (user?.role === 'CEO' || user?.role === 'MANAGER')) && (!t.restrictedCEO || user?.role === 'CEO')).map((t, i) => (
                                <button key={i} onClick={() => navigate(t.link)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 w-full text-left active:scale-95 transition-all">
                                    <div className={`w-12 h-12 ${t.bg} rounded-2xl flex items-center justify-center`}>
                                        <FontAwesomeIcon icon={t.icon} className={t.color} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 text-sm uppercase">{t.title}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.desc}</p>
                                    </div>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-300" />
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <SettingsTab user={user} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8">
                <div className="max-w-xl mx-auto apple-surface rounded-[2.5rem] p-2 flex items-center justify-between">
                    {[
                        { id: 'updates', icon: faBell },
                        { id: 'tools', icon: faBoxOpen },
                        { id: 'home', icon: faHome },
                        { id: 'calculator', icon: 'calculator', isLucide: true, hidden: user?.role !== 'CEO' },
                        { id: 'settings', icon: faCog }
                    ].filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => tab.id === 'calculator' ? navigate('/stock-calculator') : setActiveTab(tab.id)}
                            className={`flex-1 py-4 rounded-[2rem] flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-apple-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab.isLucide ? (
                                <Calculator className="w-5 h-5" />
                            ) : (
                                <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-8 right-8 z-[100] bg-gray-900/95 text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#008069] rounded-xl flex items-center justify-center"><FontAwesomeIcon icon={faCheckCircle} /></div>
                        <p className="text-xs font-black uppercase tracking-widest">{successMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showSaleModal && <ConversationalSaleForm onSuccess={() => handleSuccess('Sale recorded')} onCancel={() => setShowSaleModal(false)} />}
            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="New Customer">
                <AddCustomerForm onSuccess={() => handleSuccess('Customer added')} onCancel={() => setShowCustomerModal(false)} />
            </Modal>
            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Add Product">
                <AddProductForm onSuccess={() => handleSuccess('Product added')} onCancel={() => setShowProductModal(false)} />
            </Modal>
        </div>
    );
};

export default MobileDashboard;

