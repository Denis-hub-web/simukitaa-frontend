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

    const loadDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [metricsRes, notifRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setMetrics(metricsRes.data.data);
            setNotifications(Array.isArray(notifRes.data.data.notifications) ? notifRes.data.data.notifications : []);
        } catch (error) {
            console.error('Data sync failed:', error);
        } finally {
            setLoading(false);
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
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Loading Mobile Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-24">
            {/* Classic Mobile Header */}
            <div className="bg-[#008069] pb-10 pt-8 shadow-xl">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                <FontAwesomeIcon icon={faMobileAlt} />
                            </div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Simukitaa</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-white/60 hover:text-white transition-colors p-2">
                                <FontAwesomeIcon icon={faSignOutAlt} />
                            </button>
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white relative">
                                <FontAwesomeIcon icon={faBell} />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-[#008069]">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Karibu Sena,</p>
                            <h2 className="text-2xl font-black text-white tracking-tight">{user?.name?.split(' ')[0]}</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 shrink-0">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="bg-transparent text-white text-[9px] font-black uppercase outline-none"
                            />
                            <span className="text-white/40 text-[9px]">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="bg-transparent text-white text-[9px] font-black uppercase outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find records, inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-lg focus:ring-2 focus:ring-[#008069] text-sm"
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
                                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue Today</p>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                                                    {formatCurrency((metrics?.sales?.today?.revenue || 0) + (metrics?.repairs?.today?.revenue || 0))}
                                                </h3>
                                            </div>
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
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
                                        <button onClick={() => navigate('/daily-sheet')} className="bg-[#008069] text-white p-6 rounded-[2rem] shadow-lg flex flex-col items-center gap-3">
                                            <FontAwesomeIcon icon={faFileAlt} className="text-2xl" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Daily Sheet</span>
                                        </button>
                                        <button onClick={() => navigate('/analytics')} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-gray-900">
                                            <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Analytics</span>
                                        </button>
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
                                        ].filter(s => !s.restricted || user?.role === 'CEO').map((s, i) => (
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
                                { title: 'Expenses Today', desc: 'Record Costs', icon: faWallet, color: 'text-rose-500', bg: 'bg-rose-50', link: '/expenses' },
                                { title: 'Stock Table', desc: 'Inventory Check', icon: faBoxOpen, color: 'text-blue-500', bg: 'bg-blue-50', link: '/stock-inventory', restricted: true },
                                { title: 'Team Admin', desc: 'Staff Oversight', icon: faUserCog, color: 'text-green-500', bg: 'bg-green-50', link: '/team-management', restricted: true }
                            ].filter(t => !t.restricted || user?.role === 'CEO').map((t, i) => (
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
                <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-2 flex items-center justify-between">
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
                            className={`flex-1 py-4 rounded-[2rem] flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-[#008069] text-white shadow-lg' : 'text-gray-400'}`}
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

