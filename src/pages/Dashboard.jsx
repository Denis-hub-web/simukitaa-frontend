import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine, faMoneyBillWave, faTools, faExclamationTriangle,
    faBoxOpen, faBox, faUsers, faBell, faCheckCircle,
    faMobileAlt, faLaptop, faCreditCard, faFileInvoiceDollar,
    faUserPlus, faSearch, faCog, faSignOutAlt, faCircle,
    faMicrochip, faShieldAlt, faSignature, faChartBar, faUserCog
} from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI, salesAPI, repairAPI, notificationAPI } from '../utils/api';
import Modal from '../components/Modal';
import ConversationalSaleForm from '../components/ConversationalSaleForm';
import AddCustomerForm from '../components/AddCustomerForm';
import CreateRepairForm from '../components/CreateRepairForm';
import AddProductForm from '../components/AddProductForm';
import AIBusinessIntelligence from '../components/AIBusinessIntelligence';

const Dashboard = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [hourlySales, setHourlySales] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showRepairModal, setShowRepairModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user.role === 'CEO';

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(() => loadDashboardData(), 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const [metricsRes, salesRes, repairsRes, notificationsRes] = await Promise.all([
                dashboardAPI.getMetrics(),
                salesAPI.getStats(),
                repairAPI.getStats(),
                notificationAPI.getAll()
            ]);

            setMetrics({
                sales: salesRes.data.data || { today: { revenue: 0, count: 0 }, change: 0 },
                repairs: repairsRes.data.data || { total: 0, inProgress: 0, completed: 0 },
                payments: metricsRes.data.data?.payments || { pending: { amount: 0, count: 0 }, overdue: { amount: 0, count: 0 } },
                inventory: metricsRes.data.data?.inventory || { lowStock: 0 }
            });

            const realNotifications = notificationsRes.data.data.notifications || [];
            setNotifications(realNotifications.slice(0, 8).map(n => ({
                id: n.id,
                type: n.type,
                message: n.message,
                createdAt: n.createdAt,
                metadata: n.metadata,
                time: getTimeAgo(n.createdAt),
                unread: !n.isRead
            })));

            loadHourlySalesData();
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const getTimeAgo = (dateString) => {
        const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (diffMins < 1) return 'JUST NOW';
        if (diffMins < 60) return `${diffMins}M AGO`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}H AGO`;
        return `${Math.floor(diffHours / 24)}D AGO`;
    };

    const formatCurrency = (amount) => {
        if (!isCEO) return '••••••';
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const loadHourlySalesData = async () => {
        try {
            const response = await salesAPI.getHourlyStats();
            setHourlySales(response.data.data || []);
        } catch (error) {
            setHourlySales([]);
        }
    };

    const handleClearAllNotifications = async () => {
        try {
            await notificationAPI.markAllAsRead();
            loadDashboardData();
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Initializing Terminal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-24">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            COMMAND <span className="text-gray-400">CENTER</span>
                        </h1>
                    </motion.div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm">
                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        System Active
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Sales Today', value: formatCurrency(metrics?.sales?.today?.revenue), sub: `${metrics?.sales?.today?.count || 0} COMPLETED SALES`, icon: faMoneyBillWave, delta: metrics?.sales?.change, color: 'emerald' },
                    { label: 'Active Repairs', value: metrics?.repairs?.inProgress || 0, sub: `${metrics?.repairs?.total || 0} TOTAL TICKETS`, icon: faTools, color: 'purple' },
                    { label: 'Pending Capital', value: formatCurrency(metrics?.payments?.pending?.amount), sub: `${metrics?.payments?.pending?.count || 0} OPEN INVOICES`, icon: faFileInvoiceDollar, color: 'amber' }
                ].map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group "
                    >
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-lg hover:shadow-2xl transition-all duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl text-gray-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    <FontAwesomeIcon icon={m.icon} />
                                </div>
                                {m.delta !== undefined && isCEO && (
                                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                                        +{m.delta}% GROWTH
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{m.label}</h3>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter mb-4">{m.value}</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full bg-emerald-500`} />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.sub}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl text-emerald-400 border border-white/10">
                                    <FontAwesomeIcon icon={faChartLine} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase">Operations Flow</h2>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Performance Matrix</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-80 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={hourlySales}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#ffffff30" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                                        formatter={(v, n) => {
                                            if (n === 'sales') return [v + ' Sales', 'Volume'];
                                            if (n === 'revenue') return [isCEO ? 'TZS ' + v.toLocaleString() : '••••••', 'Revenue'];
                                            return [v, n];
                                        }}
                                    />
                                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} dot={false} />
                                    {isCEO && <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={false} strokeDasharray="5 5" />}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Sales</p>
                                <p className="text-2xl font-black text-white">{hourlySales.reduce((sum, h) => sum + h.sales, 0)}</p>
                            </div>
                            {isCEO && (
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Revenue</p>
                                    <p className="text-2xl font-black text-white">{formatCurrency(hourlySales.reduce((sum, h) => sum + h.revenue, 0))}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'New Sale', icon: faMoneyBillWave, action: () => setShowSaleModal(true), color: 'emerald' },
                            { label: 'Repairs', icon: faTools, action: () => setShowRepairModal(true), color: 'purple' },
                            { label: 'Stock', icon: faBox, action: () => navigate('/stock-inventory'), color: 'blue' },
                            { label: 'Customers', icon: faUsers, action: () => setShowCustomerModal(true), color: 'amber' }
                        ].map((btn, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ y: -5 }}
                                onClick={btn.action}
                                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-4"
                            >
                                <div className={`w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-xl text-gray-400 transition-all`}>
                                    <FontAwesomeIcon icon={btn.icon} />
                                </div>
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{btn.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <motion.div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 uppercase">Activity</h3>
                            <button onClick={handleClearAllNotifications} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><FontAwesomeIcon icon={faSignature} /></button>
                        </div>
                        <div className="flex-1 space-y-4">
                            {notifications.map((notif, idx) => (
                                <div key={idx} className="p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all">
                                    <p className="text-xs font-bold text-gray-900 uppercase opacity-80">{notif.message}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase mt-1">{notif.time}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
                        <h4 className="text-[10px] font-black uppercase text-white/30 mb-6 tracking-widest">System Health</h4>
                        <div className="space-y-4 text-[9px] font-black uppercase tracking-widest text-white/60">
                            <div className="flex justify-between items-center">
                                <span>Security</span>
                                <span className="text-emerald-500">Encrypted</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Status</span>
                                <span className="text-blue-500">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            {isCEO && <AIBusinessIntelligence />}

            {/* Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-12 right-12 z-50">
                        <div className="bg-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-5">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span className="text-xs font-black uppercase">{successMessage}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showSaleModal && <ConversationalSaleForm onSuccess={(m) => setSuccessMessage(m)} onCancel={() => setShowSaleModal(false)} />}
            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="New Customer">
                <AddCustomerForm onSuccess={() => setSuccessMessage('Customer Registered')} onCancel={() => setShowCustomerModal(false)} />
            </Modal>
            <Modal isOpen={showRepairModal} onClose={() => setShowRepairModal(false)} title="New Repair">
                <CreateRepairForm onSuccess={() => setSuccessMessage('Repair Registered')} onCancel={() => setShowRepairModal(false)} />
            </Modal>
            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="New Product">
                <AddProductForm onSuccess={() => setSuccessMessage('Product Registered')} onCancel={() => setShowProductModal(false)} />
            </Modal>
        </div>
    );
};

export default Dashboard;
