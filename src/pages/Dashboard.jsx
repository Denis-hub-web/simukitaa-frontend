import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine, faMoneyBillWave, faTools, faExclamationTriangle,
    faBoxOpen, faBox, faUsers, faBell, faCheckCircle, faClock,
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

    // Get user from local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            setNotifications(realNotifications.slice(0, 5).map(n => ({
                id: n.id,
                type: n.type,
                message: n.message,
                createdAt: n.createdAt,
                metadata: n.metadata,
                time: getTimeAgo(n.createdAt),
                unread: !n.isRead
            })));

            // Load hourly sales data
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

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            if (notification.unread) {
                await notificationAPI.markAsRead(notification.id);
                loadDashboardData(); // Refresh to update unread count
            }

            // Navigate based on type
            if (notification.metadata?.repairId) {
                navigate(`/repairs/${notification.metadata.repairId}`);
            } else if (notification.metadata?.tradeInId) {
                navigate(`/trade-ins/view/${notification.metadata.tradeInId}`);
            } else if (notification.metadata?.deliveryId) {
                navigate(`/deliveries/${notification.metadata.deliveryId}`);
            } else if (notification.type === 'sale' && notification.metadata?.saleId) {
                navigate(`/sales`);
            } else if (notification.type === 'delivery_assigned' || notification.type === 'delivery_assigned_ceo') {
                navigate(`/deliveries`);
            }
        } catch (error) {
            console.error('Failed to handle notification:', error);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const loadHourlySalesData = async () => {
        try {
            const response = await salesAPI.getHourlyStats();
            setHourlySales(response.data.data || []);
        } catch (error) {
            console.error('Failed to load hourly sales:', error);
            setHourlySales([]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#efeff4]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Elite Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Sales Today', value: formatCurrency(metrics?.sales?.today?.revenue), sub: `${metrics?.sales?.today?.count || 0} SALES`, icon: faMoneyBillWave, delta: metrics?.sales?.change, color: 'emerald', restricted: true },
                    { label: 'Total Repairs', value: metrics?.repairs?.total || 0, sub: `${metrics?.repairs?.inProgress || 0} IN PROGRESS`, icon: faTools, color: 'purple', text: 'REPAIRS' },
                    { label: 'Overdue Payments', value: formatCurrency(metrics?.payments?.overdue?.amount), sub: `${metrics?.payments?.overdue?.count || 0} OVERDUE BILLS`, icon: faExclamationTriangle, color: 'rose', restricted: true }
                ].filter(m => !m.restricted || user?.role === 'CEO').map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl text-gray-400 group-hover:bg-[#008069]/10 group-hover:text-[#008069] transition-all`}>
                                <FontAwesomeIcon icon={m.icon} />
                            </div>
                            {m.delta !== undefined && (
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100">
                                    +{m.delta}%
                                </span>
                            )}
                        </div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{m.label}</h3>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter mb-2 truncate">{m.value}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{m.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Hourly Sales Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center text-2xl text-green-600">
                        <FontAwesomeIcon icon={faChartBar} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Sales Today</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hourly breakdown - Last 24 hours</p>
                    </div>
                </div>

                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="hour"
                                stroke="#888"
                                fontSize={11}
                                fontWeight="bold"
                                tick={{ fill: '#888' }}
                            />
                            <YAxis
                                stroke="#888"
                                fontSize={11}
                                fontWeight="bold"
                                tick={{ fill: '#888' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '16px',
                                    padding: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }}
                                labelStyle={{ fontWeight: 'bold', color: '#111', marginBottom: '4px' }}
                                formatter={(value, name) => {
                                    if (name === 'sales') return [value + ' sales', 'Sales Count'];
                                    if (name === 'revenue') return ['TZS ' + value.toLocaleString(), 'Revenue'];
                                    return [value, name];
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart Summary */}
                <div className="mt-6 pt-6 border-t-2 border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Total Sales Today</p>
                        <p className="text-2xl font-black text-green-600">
                            {hourlySales.reduce((sum, h) => sum + h.sales, 0)} Sales
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-2xl font-black text-gray-900">
                            TZS {hourlySales.reduce((sum, h) => sum + h.revenue, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* AI Business Intelligence - CEO Only */}
            {user?.role === 'CEO' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <AIBusinessIntelligence />
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Notification Center */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 uppercase">Activity Feed</h2>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent activity and updates</p>
                                </div>
                                {notifications.filter(n => n.unread).length > 0 && (
                                    <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black">
                                        {notifications.filter(n => n.unread).length}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleClearAllNotifications}
                                disabled={notifications.length === 0}
                                className="text-[10px] font-black text-[#008069] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity disabled:opacity-30"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {notifications.length > 0 ? notifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id || index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 group hover:shadow-xl cursor-pointer ${notif.unread ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-50'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 transition-transform group-hover:rotate-12 ${notif.type === 'sale' ? 'bg-green-50 text-green-600' :
                                        notif.type === 'repair' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        <FontAwesomeIcon icon={notif.type === 'sale' ? faMoneyBillWave : notif.type === 'repair' ? faTools : faBell} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-gray-900 leading-snug mb-1 group-hover:text-[#008069] transition-colors uppercase tracking-tight whitespace-pre-line break-words">{notif.message}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{notif.time}</span>
                                            {notif.unread && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />}
                                        </div>
                                    </div>
                                    <FontAwesomeIcon icon={faSignature} className="text-gray-100 group-hover:text-gray-200 transition-colors" />
                                </motion.div>
                            )) : (
                                <div className="text-center py-20 opacity-20">
                                    <h3 className="text-lg font-black text-gray-500 uppercase tracking-widest">No notifications</h3>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="premium-h3 text-gray-900">Quick Actions</h3>
                            <p className="premium-caption text-gray-500">Fast access to common tasks</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {[
                                { label: 'New Sale', icon: faMoneyBillWave, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', hoverBg: 'hover:bg-emerald-100', action: () => setShowSaleModal(true) },
                                { label: 'Stock Table', icon: faBox, color: 'pink', bgColor: 'bg-pink-50', textColor: 'text-pink-600', hoverBg: 'hover:bg-pink-100', action: () => navigate('/stock-inventory') },
                                { label: 'Repairs', icon: faTools, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600', hoverBg: 'hover:bg-purple-100', action: () => setShowRepairModal(true) },
                                { label: 'Customers', icon: faUserPlus, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600', hoverBg: 'hover:bg-blue-100', action: () => setShowCustomerModal(true) },
                                { label: 'Inventory', icon: faBoxOpen, color: 'orange', bgColor: 'bg-amber-50', textColor: 'text-amber-600', hoverBg: 'hover:bg-amber-100', action: () => setShowProductModal(true) },
                                { label: 'Team', icon: faUserCog, color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', hoverBg: 'hover:bg-indigo-100', action: () => navigate('/team-management') }
                            ].map((action, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={action.action}
                                    className="premium-card p-6 hover:shadow-lg transition-all group flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden"
                                >
                                    {/* Icon with color */}
                                    <div className={`w-14 h-14 ${action.bgColor} rounded-2xl flex items-center justify-center text-2xl ${action.textColor} transition-all group-hover:scale-110 shadow-sm`}>
                                        <FontAwesomeIcon icon={action.icon} />
                                    </div>
                                    {/* Label */}
                                    <span className="premium-label text-gray-700 group-hover:text-gray-900 mb-0">{action.label}</span>

                                    {/* Subtle hover effect */}
                                    <div className={`absolute inset-0 ${action.bgColor} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Logistics Oversight Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
                    >
                        <h2 className="text-lg font-black text-gray-900 tracking-tighter mb-8 uppercase">Vital Stats</h2>
                        <div className="space-y-6">
                            {[
                                { label: 'Pending Capital', value: formatCurrency(metrics?.payments?.pending?.amount), icon: faCreditCard, color: 'amber' },
                                { label: 'Low Stock Items', value: metrics?.inventory?.lowStock || 0, icon: faBoxOpen, color: 'orange' },
                                { label: 'Active Repairs', value: metrics?.repairs?.inProgress || 0, icon: faTools, color: 'purple' }
                            ].map((spec, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                                        <FontAwesomeIcon icon={spec.icon} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{spec.label}</p>
                                        <p className="text-sm font-black text-gray-900 tracking-tight">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0a0a0b] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#008069] rounded-full -mr-16 -mt-16 blur-3xl opacity-20" />
                        <h2 className="text-lg font-black tracking-tighter mb-6 uppercase">System Health</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Server Synchronized</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-[#00a884]" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Security Level: High</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Success Authorization Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-gray-900/95 backdrop-blur-xl text-white px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50 border border-white/5"
                    >
                        <div className="w-12 h-12 bg-[#008069] rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Success</p>
                            <p className="text-xs font-bold text-white/60 leading-tight uppercase">{successMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Standardized System Modals */}
            {showSaleModal && (
                <ConversationalSaleForm onSuccess={() => handleSuccess('Sale recorded and committed to database.')} onCancel={() => setShowSaleModal(false)} />
            )}
            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="New Customer">
                <AddCustomerForm onSuccess={() => handleSuccess('Customer added successfully.')} onCancel={() => setShowCustomerModal(false)} />
            </Modal>
            <Modal isOpen={showRepairModal} onClose={() => setShowRepairModal(false)} title="New Repair">
                <CreateRepairForm onSuccess={() => handleSuccess('Repair record created.')} onCancel={() => setShowRepairModal(false)} />
            </Modal>
            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Add Product">
                <AddProductForm onSuccess={() => handleSuccess('Product added to inventory.')} onCancel={() => setShowProductModal(false)} />
            </Modal>
        </div>
    );
};

export default Dashboard;
