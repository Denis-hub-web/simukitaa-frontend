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
    faUserCog
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
    const [notificationFilter, setNotificationFilter] = useState('all');
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedNotification, setSelectedNotification] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const API_URL = (() => {
        const envUrl = import.meta.env.VITE_API_URL;
        if (envUrl) {
            const cleaned = envUrl.replace(/\/+$/, '');
            return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
        }

        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000/api'
            : `http://${window.location.hostname}:5000/api`;
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
        setShowProductModal(false);
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
        <div className="premium-bg pb-24 md:pb-8">
            {/* Premium Header */}
            <div className="relative overflow-hidden pb-12 pt-8">
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="premium-icon-box bg-white overflow-hidden p-1 transition-transform hover:scale-110">
                                <img
                                    src="/img/IMG_2989.jpeg"
                                    alt="Simukitaa"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            </div>
                            <div>
                                <p className="premium-label mb-0.5">Dashboard</p>
                                <h1 className="premium-h1">
                                    {user?.name?.split(' ')[0] || 'Member'}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-lg border border-white relative hover:scale-105 transition-all">
                                <FontAwesomeIcon icon={faBell} />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </div>
                            {!['TECHNICIAN', 'DELIVERY'].includes(user?.role) && (
                                <button
                                    onClick={() => navigate('/sales/new')}
                                    className="w-12 h-12 premium-btn-primary flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-lg" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
                <div className="mb-8">
                    <div className="relative group">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Find inventory, orders, customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-input !pl-14 shadow-xl border-white relative z-0"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* CEO-Only Simplified Home: AI + Revenue Only */}
                            {user?.role === 'CEO' ? (
                                <>
                                    {/* Revenue Spotlight */}
                                    <div className="premium-card p-6 md:p-8">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                                <div>
                                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue Today</p>
                                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                                                        {formatCurrency((metrics?.sales?.today?.revenue || 0) + (metrics?.repairs?.today?.revenue || 0))}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                                    <FontAwesomeIcon icon={faChartLine} className="text-xl md:text-2xl" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                <div className="bg-white/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/50 shadow-sm">
                                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sales</p>
                                                    <p className="text-base md:text-lg font-black text-gray-800">{formatCurrency(metrics?.sales?.today?.revenue || 0)}</p>
                                                </div>
                                                <div className="bg-white/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/50 shadow-sm">
                                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Repairs Rev</p>
                                                    <p className="text-base md:text-lg font-black text-gray-900">{formatCurrency(metrics?.repairs?.today?.revenue || 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Business Intelligence - Full Focus */}
                                    <div className="mb-6">
                                        <AIBusinessIntelligence />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Non-CEO Users: Keep Original Layout */}
                                    {/* Metrics Grid */}
                                    {user?.role !== 'TECHNICIAN' && user?.role !== 'DELIVERY' && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Orders', value: metrics?.sales?.today?.count || 0, icon: faBoxOpen, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => navigate('/sales'), restricted: true },
                                                { label: 'Repairs', value: metrics?.repairs?.total || 0, icon: faTools, color: 'text-purple-600', bg: 'bg-purple-50', onClick: () => navigate('/repairs') },
                                                { label: 'Customers', value: metrics?.customers?.count || 124, icon: faUsers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                { label: 'Low Stock', value: metrics?.inventory?.lowStock || 0, icon: faExclamationTriangle, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/stock-management'), restricted: true }
                                            ].filter(stat => !stat.restricted || user?.role === 'CEO').map((stat, i) => (
                                                <div key={i} onClick={stat.onClick} className={`premium-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all ${stat.onClick ? 'cursor-pointer' : ''}`}>
                                                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110`}>
                                                        <FontAwesomeIcon icon={stat.icon} className={`${stat.color} text-lg`} />
                                                    </div>
                                                    <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                                    <p className="premium-label tracking-wider mb-0">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quick Actions for Non-CEO */}
                                    <div className="premium-card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="premium-h3 text-gray-900">Quick Actions</h2>
                                            <p className="premium-caption text-gray-500">Fast access</p>
                                        </div>

                                        {/* Role-Based Quick Actions */}
                                        {user?.role === 'TECHNICIAN' ? (
                                            <button
                                                onClick={() => navigate('/technician-dashboard')}
                                                className="w-full premium-card p-5 hover:shadow-lg transition-all group flex items-center gap-4 bg-blue-50/50 border-blue-100"
                                            >
                                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                                    <FontAwesomeIcon icon={faTools} className="text-white text-xl" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-gray-900 mb-1">My Tasks</p>
                                                    <p className="premium-caption text-blue-600">Active Assignments</p>
                                                </div>
                                                <FontAwesomeIcon icon={faChevronRight} className="text-blue-300" />
                                            </button>
                                        ) : user?.role === 'DELIVERY' ? (
                                            <button
                                                onClick={() => navigate('/deliveries')}
                                                className="w-full premium-card p-5 hover:shadow-lg transition-all group flex items-center gap-4 bg-emerald-50/50 border-emerald-100"
                                            >
                                                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                                    <FontAwesomeIcon icon={faTruck} className="text-white text-xl" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-gray-900 mb-1">My Deliveries</p>
                                                    <p className="premium-caption text-emerald-600">Active Routes</p>
                                                </div>
                                                <FontAwesomeIcon icon={faChevronRight} className="text-emerald-300" />
                                            </button>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Primary Actions Grid */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => navigate('/sales/new')}
                                                        className="premium-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group text-center flex flex-col items-center gap-3"
                                                    >
                                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-600 text-2xl" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm mb-1">New Sale</p>
                                                            <p className="premium-caption text-gray-500">Quick Sale</p>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => navigate('/repair-form')}
                                                        className="premium-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group text-center flex flex-col items-center gap-3"
                                                    >
                                                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            <FontAwesomeIcon icon={faTools} className="text-purple-600 text-2xl" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm mb-1">Repair</p>
                                                            <p className="premium-caption text-gray-500">New Job</p>
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Management Features - Manager/Staff */}
                                                {['MANAGER', 'STAFF'].includes(user?.role) && (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {user?.role === 'MANAGER' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => navigate('/ceo-data')}
                                                                        className="premium-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center gap-3 bg-gray-900 border-gray-800"
                                                                    >
                                                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                            <FontAwesomeIcon icon={faBrain} className="text-white text-lg" />
                                                                        </div>
                                                                        <div className="flex-1 text-left">
                                                                            <p className="font-bold text-white text-xs mb-0.5">Activity</p>
                                                                            <p className="text-[10px] text-white/60 font-semibold">Ledger</p>
                                                                        </div>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => navigate('/wanakitaa')}
                                                                        className="premium-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center gap-3 bg-[#008069] border-[#008069]"
                                                                    >
                                                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                            <FontAwesomeIcon icon={faGem} className="text-white text-lg" />
                                                                        </div>
                                                                        <div className="flex-1 text-left">
                                                                            <p className="font-bold text-white text-xs mb-0.5">Wanakitaa</p>
                                                                            <p className="text-[10px] text-white/60 font-semibold">Hub</p>
                                                                        </div>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'updates' && (
                        <motion.div key="updates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="premium-card">
                                <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="premium-label mb-0">Notification Feed</p>
                                        {notifications.some(n => !n.isRead) && (
                                            <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 hover:underline text-left">Clear signals</button>
                                        )}
                                    </div>
                                    <div className="flex bg-gray-100/50 p-1 rounded-xl">
                                        {['all', 'unread'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setNotificationFilter(f)}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${notificationFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto no-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                                <FontAwesomeIcon icon={faBell} className="text-gray-200 text-2xl" />
                                            </div>
                                            <p className="premium-label">All quiet / No new updates</p>
                                        </div>
                                    ) : (
                                        notifications
                                            .filter(n => notificationFilter === 'all' || !n.isRead)
                                            .map((notif, i) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-5 flex items-start gap-4 hover:bg-white/80 transition-all cursor-pointer group relative ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${notif.type === 'sale' ? 'bg-green-100 text-green-600' : notif.type === 'repair' ? 'bg-purple-100 text-purple-600' : (notif.type === 'delivery_assigned' || notif.type === 'delivery_assigned_ceo') ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        <FontAwesomeIcon icon={notif.type === 'sale' ? faMoneyBillWave : notif.type === 'repair' ? faTools : (notif.type === 'delivery_assigned' || notif.type === 'delivery_assigned_ceo') ? faTruck : faBell} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${notif.type === 'sale' ? 'text-green-500' : 'text-blue-500'}`}>{notif.type.replace(/_/g, ' ')}</span>
                                                            <span className="text-[9px] font-bold text-gray-400">
                                                                {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sync...'}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm leading-snug whitespace-pre-line break-words ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>{notif.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tools' && (
                        <motion.div key="tools" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 gap-4">
                            {[
                                // Primary Actions (For All Roles)
                                { title: 'New Sale', desc: 'Record a Product Sale', icon: faShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/sales/new', roles: ['CEO', 'MANAGER', 'STAFF'], category: 'primary' },
                                { title: 'New Repair', desc: 'Create Repair Job', icon: faTools, color: 'text-purple-500', bg: 'bg-purple-50', link: '/repair-form', roles: ['CEO', 'MANAGER', 'STAFF'], category: 'primary' },

                                // Management Tools (CEO/Manager)
                                { title: 'Activity Ledger', desc: 'Real-Time Business Logs', icon: faBrain, color: 'text-gray-900', bg: 'bg-gray-100', link: '/ceo-data', roles: ['CEO'], category: 'management' },
                                { title: 'Reports', desc: 'Sales & Imports', icon: faChartLine, color: 'text-blue-600', bg: 'bg-blue-50', link: '/reports', roles: ['CEO', 'MANAGER'], category: 'management' },
                                { title: 'Trade-In Manager', desc: 'Approve & Add to Stock', icon: faExchangeAlt, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/trade-ins', roles: ['CEO', 'MANAGER'], category: 'management' },
                                { title: 'Stock Table', desc: 'All Product Variants', icon: faCubes, color: 'text-pink-500', bg: 'bg-pink-50', link: '/stock-inventory', roles: ['CEO', 'MANAGER'], category: 'management' },
                                { title: 'Stock Management', desc: 'Add & Organize Inventory', icon: faBoxOpen, color: 'text-blue-500', bg: 'bg-blue-50', link: '/stock-management', roles: ['CEO', 'MANAGER'], category: 'management' },
                                { title: 'Supplier Network', desc: 'Procurement Partners', icon: faTruck, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/suppliers', roles: ['CEO', 'MANAGER'], category: 'management' },

                                // Sales & Operations
                                { title: 'Sales History', desc: 'Transactional Ledger', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/sales', roles: ['CEO'], category: 'operations' },
                                { title: 'Repair Registry', desc: 'Service Lifecycle', icon: faTools, color: 'text-purple-500', bg: 'bg-purple-50', link: '/repairs', roles: ['CEO', 'MANAGER', 'STAFF'], category: 'operations' },
                                { title: 'Wanakitaa Hub', desc: 'Loyalty & Community', icon: faGem, color: 'text-purple-500', bg: 'bg-purple-50', link: '/wanakitaa', roles: ['CEO', 'MANAGER'], category: 'operations' },

                                // Communications (CEO/Manager)
                                { title: 'Campaigns', desc: 'Bulk Customer Messaging', icon: faBullhorn, color: 'text-purple-500', bg: 'bg-purple-50', link: '/campaigns', roles: ['CEO'], category: 'comms' },
                                { title: 'Notification Templates', desc: 'Customize Messages', icon: faEnvelope, color: 'text-blue-500', bg: 'bg-blue-50', link: '/notification-templates', roles: ['CEO'], category: 'comms' },
                                { title: 'Team Management', desc: 'Staff & Permissions', icon: faUserCog, color: 'text-green-500', bg: 'bg-green-50', link: '/team-management', roles: ['CEO'], category: 'comms' }
                            ].filter(tool => !tool.roles || tool.roles.includes(user?.role)).map((tool, i) => (
                                <button key={i} onClick={() => navigate(tool.link)} className="premium-card p-5 md:p-6 flex items-center gap-4 md:gap-5 hover:scale-[1.02] transition-all text-left group">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 ${tool.bg} rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                        <FontAwesomeIcon icon={tool.icon} className={`${tool.color} text-lg md:text-xl`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{tool.title}</h3>
                                        <p className="premium-caption text-blue-600">{tool.desc}</p>
                                    </div>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-blue-300" />
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <SettingsTab user={user} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            {/* Premium Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8">
                <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 p-2 flex items-center justify-between">
                    {[
                        { id: 'updates', icon: faBell, label: 'Notifications' },
                        { id: 'tools', icon: faBoxOpen, label: 'Tools', hidden: user?.role === 'TECHNICIAN' },
                        { id: 'home', icon: faHome, label: 'Home' },
                        { id: 'calculator', icon: 'lucide-calculator', label: 'Calculator', isLucide: true, hidden: !['CEO', 'MANAGER'].includes(user?.role) },
                        { id: 'settings', icon: faCog, label: 'Settings' }
                    ].filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'calculator') {
                                    navigate('/stock-calculator');
                                } else {
                                    setActiveTab(tab.id);
                                }
                            }}
                            className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-[2rem] transition-all duration-300 ${activeTab === tab.id ? 'premium-btn-primary shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.isLucide ? (
                                <Calculator className={activeTab === tab.id ? 'w-5 h-5' : 'w-4 h-4'} />
                            ) : (
                                <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? 'text-xl' : 'text-lg'} />
                            )}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Premium Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-8 right-8 z-[100] bg-white/90 backdrop-blur-xl text-gray-900 px-6 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-4 border border-white/20">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><FontAwesomeIcon icon={faCheckCircle} className="text-xl" /></div>
                        <div>
                            <p className="text-sm font-black tracking-tight">{successMessage}</p>
                            <p className="premium-label mb-0 text-emerald-500">System Verified</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showSaleModal && (
                <ConversationalSaleForm onSuccess={() => handleSuccess('Sale recorded')} onCancel={() => setShowSaleModal(false)} />
            )}
            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="Register Customer">
                <AddCustomerForm onSuccess={() => handleSuccess('Customer added')} onCancel={() => setShowCustomerModal(false)} />
            </Modal>

            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Catalog Update">
                <AddProductForm onSuccess={() => handleSuccess('Product added')} onCancel={() => setShowProductModal(false)} />
            </Modal>
        </div >
    );
};

export default MobileDashboard;
