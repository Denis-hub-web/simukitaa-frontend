import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faChartLine, faBoxOpen, faUsers, faCog, faBell, faSearch, faPlus,
    faTools, faExchangeAlt, faMoneyBillWave, faChevronRight, faUserPlus,
    faClock, faArrowUp, faExclamationTriangle, faEllipsisH, faArrowRight,
    faCheckCircle, faTruck, faCompass, faBrain, faGem, faShoppingCart,
    faCubes, faEnvelope, faBullhorn, faUserCog, faFileAlt, faWallet,
    faSignOutAlt, faMobileAlt, faBolt, faFingerprint, faCrown, faShieldAlt
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

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [notificationFilter, setNotificationFilter] = useState('all');
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const API_URL = (() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:5000/api';
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

    const formatCurrency = (amount) => {
        if (user?.role === 'MANAGER') return '••••••';
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
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
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 border-4 border-[#00ffa3] border-t-transparent rounded-[1.5rem] mx-auto mb-8 shadow-[0_0_20px_rgba(0,255,163,0.2)]"
                    />
                    <p className="text-[#00ffa3] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Elite Assets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32">
            {/* Elite Mobile Header */}
            <div className="relative pt-8 pb-12 overflow-hidden px-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ffa3]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffa3] to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative w-14 h-14 bg-[#111] rounded-2xl border border-white/5 flex items-center justify-center shadow-2xl overflow-hidden">
                                <img src="/img/IMG_2989.jpeg" className="w-full h-full object-cover" alt="Elite" />
                                <div className="absolute bottom-0 w-full h-1 bg-[#00ffa3]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="w-1.5 h-1.5 bg-[#00ffa3] rounded-full animate-ping"></span>
                                <p className="text-white/30 font-black uppercase tracking-[0.2em] text-[9px]">Elite Terminal</p>
                            </div>
                            <h1 className="text-2xl font-black tracking-tighter">{user?.name?.split(' ')[0]}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('updates')}
                            className="relative w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-white/10 transition-all"
                        >
                            <FontAwesomeIcon icon={faBell} className="text-white/40" />
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00ffa3] text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-white/20" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="relative group">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 z-10" />
                        <input
                            type="text"
                            placeholder="Find Asset or Record..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-[2rem] py-5 px-14 text-white placeholder:text-white/10 text-sm font-bold focus:border-[#00ffa3]/30 outline-none transition-all shadow-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* Main Luxury Content */}
            <div className="px-6 relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Management View */}
                            {(user?.role === 'CEO' || user?.role === 'MANAGER') ? (
                                <>
                                    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffa3]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Tactical Revenue</p>
                                        <div className="flex justify-between items-end mb-8">
                                            <h3 className="text-4xl font-black tracking-tighter">
                                                {formatCurrency((metrics?.sales?.today?.revenue || 0) + (metrics?.repairs?.today?.revenue || 0))}
                                            </h3>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black text-[#00ffa3] bg-[#00ffa3]/10 px-3 py-1 rounded-full border border-[#00ffa3]/20">+18%</span>
                                                <p className="text-[9px] text-white/20 mt-1 uppercase font-black">24h Pulse</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Signals</p>
                                                <p className="text-lg font-black text-[#00ffa3]">{metrics?.sales?.today?.count || 0}</p>
                                            </div>
                                            <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Repairs In</p>
                                                <p className="text-lg font-black text-blue-500">{metrics?.repairs?.pending || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => navigate('/daily-sheet')}
                                            className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group active:scale-95 transition-all shadow-xl"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-[#00ffa3] transition-colors border border-white/5">
                                                    <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-lg font-black tracking-tight">Daily Sheet</h4>
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Financial Oversight</p>
                                                </div>
                                            </div>
                                            <FontAwesomeIcon icon={faArrowRight} className="text-white/10" />
                                        </button>

                                        <button
                                            onClick={() => navigate('/analytics')}
                                            className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group active:scale-95 transition-all shadow-xl"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-blue-500 transition-colors border border-white/5">
                                                    <FontAwesomeIcon icon={faChartLine} className="text-xl" />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-lg font-black tracking-tight">Intelligence</h4>
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Advanced Analytics</p>
                                                </div>
                                            </div>
                                            <FontAwesomeIcon icon={faArrowRight} className="text-white/10" />
                                        </button>
                                    </div>

                                    <AIBusinessIntelligence />
                                </>
                            ) : (
                                <>
                                    {/* Staff Quick Pulse */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'My Sales', value: metrics?.sales?.today?.count || 0, icon: faBolt, color: '#00ffa3' },
                                            { label: 'Pending Repairs', value: metrics?.repairs?.pending || 0, icon: faTools, color: '#a855f7' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5 border border-white/5" style={{ color: stat.color }}>
                                                    <FontAwesomeIcon icon={stat.icon} />
                                                </div>
                                                <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#111] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black tracking-tight">Command Center</h3>
                                            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Active Ops</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Sale', icon: faShoppingCart, action: () => navigate('/sales/new'), color: '#00ffa3' },
                                                { label: 'Repair', icon: faTools, action: () => navigate('/repair-form'), color: '#a855f7' },
                                                { label: 'Customer', icon: faUserPlus, action: () => setShowCustomerModal(true), color: '#3b82f6' },
                                                { label: 'Analytics', icon: faChartLine, action: () => navigate('/analytics'), color: '#ec4899' }
                                            ].map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={action.action}
                                                    className="bg-white/2 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group"
                                                >
                                                    <div className="text-2xl transition-transform group-hover:scale-110" style={{ color: action.color }}>
                                                        <FontAwesomeIcon icon={action.icon} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'updates' && (
                        <motion.div key="updates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl min-h-[60vh]">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight mb-0.5">Signal Log</h3>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Operational Pulse</p>
                                    </div>
                                    <div className="flex bg-[#050505] p-1.5 rounded-2xl border border-white/5">
                                        {['all', 'unread'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setNotificationFilter(f)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${notificationFilter === f ? 'bg-[#00ffa3] text-black shadow-lg shadow-[#00ffa3]/20' : 'text-white/20'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="divide-y divide-white/2 max-h-[60vh] overflow-y-auto no-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="py-32 text-center opacity-20">
                                            <FontAwesomeIcon icon={faBell} className="text-5xl mb-6" />
                                            <p className="text-[10px] uppercase font-black tracking-[0.3em]">No Pulse Detected</p>
                                        </div>
                                    ) : (
                                        notifications
                                            .filter(n => notificationFilter === 'all' || !n.isRead)
                                            .map((notif, i) => (
                                                <div key={notif.id} className="p-8 flex items-start gap-6 hover:bg-white/2 active:bg-white/5 transition-all">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#151515] border border-white/5 ${!notif.isRead ? 'border-[#00ffa3]/30 text-[#00ffa3]' : 'text-white/20'}`}>
                                                        <FontAwesomeIcon icon={notif.type === 'sale' ? faMoneyBillWave : notif.type === 'repair' ? faTools : faBolt} className="text-xl" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{notif.type.replace(/_/g, ' ')}</span>
                                                            <span className="text-[9px] font-bold text-white/10">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-white/80 leading-snug">{notif.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tools' && (
                        <motion.div key="tools" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                            {[
                                { title: 'New Sale', desc: 'Secure Ledger Entry', icon: faShoppingCart, color: '#00ffa3', link: '/sales/new', roles: ['CEO', 'MANAGER', 'STAFF'] },
                                { title: 'Expenses', desc: 'Capital Outflow', icon: faWallet, color: '#f43f5e', link: '/expenses', roles: ['CEO', 'MANAGER', 'STAFF'] },
                                { title: 'Intelligence', desc: 'Neural Data Processing', icon: faBrain, color: '#3b82f6', link: '/analytics', roles: ['CEO', 'MANAGER'] },
                                { title: 'Stock Matrix', desc: 'Inventory Alignment', icon: faBoxOpen, color: '#a855f7', link: '/stock-management', roles: ['CEO', 'MANAGER'] },
                                { title: 'Network', desc: 'Supply Chain Operations', icon: faCompass, color: '#00ffa3', link: '/suppliers', roles: ['CEO', 'MANAGER'] },
                                { title: 'Team Elite', desc: 'Staff Hierarchy Control', icon: faUserCog, color: '#00ffa3', link: '/team-management', roles: ['CEO'] }
                            ].filter(tool => tool.roles.includes(user?.role)).map((tool, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(tool.link)}
                                    className="w-full bg-[#111] p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-[#151515] rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 border border-white/5" style={{ color: tool.color }}>
                                            <FontAwesomeIcon icon={tool.icon} className="text-xl" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-lg font-black tracking-tight">{tool.title}</h4>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{tool.desc}</p>
                                        </div>
                                    </div>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-white/10" />
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

            {/* Glassmorphic Global Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-10">
                <div className="max-w-xl mx-auto bg-[#111]/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-2.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {[
                        { id: 'updates', icon: faBolt, label: 'Pulse' },
                        { id: 'tools', icon: faCubes, label: 'Tactical' },
                        { id: 'home', icon: faHome, label: 'Elite' },
                        { id: 'calculator', icon: 'lucide-calculator', label: 'Quantum', isLucide: true, hidden: user?.role !== 'CEO' },
                        { id: 'settings', icon: faCog, label: 'Cipher' }
                    ].filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => tab.id === 'calculator' ? navigate('/stock-calculator') : setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[2.2rem] transition-all duration-500 ${activeTab === tab.id ? 'bg-[#00ffa3] text-black shadow-[0_10px_20px_rgba(0,255,163,0.3)]' : 'text-white/20'}`}
                        >
                            {tab.isLucide ? (
                                <Calculator className={activeTab === tab.id ? 'w-5 h-5' : 'w-4 h-4'} strokeWidth={3} />
                            ) : (
                                <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? 'text-xl' : 'text-lg'} />
                            )}
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'opacity-100 block' : 'opacity-0 h-0 hidden'}`}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Elite Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-36 left-8 right-8 z-[200] bg-[#111]/90 backdrop-blur-2xl border border-[#00ffa3]/20 p-8 rounded-[3rem] shadow-2xl flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#00ffa3] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#00ffa3]/20"><FontAwesomeIcon icon={faCheckCircle} className="text-2xl" /></div>
                        <div>
                            <p className="text-lg font-black tracking-tighter">{successMessage}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ffa3]">Signal Verified</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals triggered from components */}
            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="Elite Customer Entry">
                <AddCustomerForm onSuccess={() => handleSuccess('Client Registered')} onCancel={() => setShowCustomerModal(false)} />
            </Modal>
        </div>
    );
};

export default MobileDashboard;
