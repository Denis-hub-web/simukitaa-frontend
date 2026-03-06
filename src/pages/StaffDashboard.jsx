import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMoneyBillWave, faTools, faBoxOpen, faUsers,
    faCheckCircle, faClock, faMobileAlt, faUserPlus,
    faSearch, faCog, faSignOutAlt, faReceipt,
    faArrowRight, faShieldAlt, faMicrochip, faHistory, faChartLine, faCalendar,
    faCrown, faFingerprint, faBolt, faStar
} from '@fortawesome/free-solid-svg-icons';
import { salesAPI, repairAPI, expenseAPI } from '../utils/api';
import Modal from '../components/Modal';
import ConversationalSaleForm from '../components/ConversationalSaleForm';
import AddCustomerForm from '../components/AddCustomerForm';
import CreateRepairForm from '../components/CreateRepairForm';

const StaffDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showRepairModal, setShowRepairModal] = useState(false);
    const [personalExpenses, setPersonalExpenses] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [salesRes, repairsRes, expensesRes] = await Promise.all([
                salesAPI.getStats(),
                repairAPI.getStats(),
                expenseAPI.getSummary()
            ]);
            setStats({ sales: salesRes.data.data, repairs: repairsRes.data.data });
            setPersonalExpenses(expensesRes.data.data);
            setLoading(false);
        } catch (error) {
            setStats({
                sales: { today: { count: 0 }, total: { count: 0 } },
                repairs: { total: 0, pending: 0, inProgress: 0, completed: 0 }
            });
            setLoading(false);
        }
    };

    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setShowSaleModal(false);
        setShowCustomerModal(false);
        setShowRepairModal(false);
        loadStats();
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 border-4 border-[#00ffa3] border-t-transparent rounded-2xl mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                    ></motion.div>
                    <p className="text-[10px] font-black text-[#00ffa3] uppercase tracking-[0.3em] animate-pulse">Initializing Elite Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 selection:bg-[#00ffa3] selection:text-black">
            {/* Ultra-Premium Header */}
            <div className="relative pt-12 pb-24 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00ffa3]/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16"
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffa3] to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative w-24 h-24 bg-[#111] rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl overflow-hidden">
                                    <span className="text-4xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">{user?.name?.charAt(0)}</span>
                                    <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-[#00ffa3] to-blue-500"></div>
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-[#00ffa3] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.5)] border-4 border-[#050505]"
                                >
                                    <FontAwesomeIcon icon={faCrown} className="text-[10px] text-black" />
                                </motion.div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Active Session</span>
                                    <span className="w-2 h-2 bg-[#00ffa3] rounded-full animate-ping"></span>
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Karibu, {user?.name}!</h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFingerprint} className="text-[#00ffa3]" />
                                    System Authenticated • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center gap-4">
                            <div className="bg-[#111]/80 backdrop-blur-3xl p-2 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-2">
                                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl">
                                    <FontAwesomeIcon icon={faCalendar} className="text-[#00ffa3] text-xs" />
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                    />
                                    <span className="text-white/20 text-[10px] font-black">TO</span>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                    />
                                </div>
                                <button className="w-14 h-14 bg-[#00ffa3] text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,255,163,0.2)]">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                                <button
                                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                    className="w-14 h-14 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/5"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Elite Stats Matrix */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            {
                                label: 'Range Sales',
                                value: stats?.sales?.today?.count || 0,
                                sub: 'Completed Transactions',
                                icon: faBolt,
                                color: '#00ffa3',
                                trend: '+12%'
                            },
                            {
                                label: 'Personal Expenses',
                                value: user?.role === 'CEO' ? (personalExpenses?.total?.toLocaleString() + ' /=' || '0') : 'RESTRICTED',
                                sub: 'Managed Outflow',
                                icon: faReceipt,
                                color: '#3b82f6',
                                trend: 'Optimal',
                                restricted: user?.role === 'MANAGER'
                            },
                            {
                                label: 'Active Repairs',
                                value: stats?.repairs?.inProgress || 0,
                                sub: 'In Progress Terminal',
                                icon: faTools,
                                color: '#a855f7',
                                trend: 'Fast'
                            }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="relative group overflow-hidden"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative z-10 shadow-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 bg-[#151515] group-hover:scale-110 transition-transform duration-500" style={{ color: s.color }}>
                                            <FontAwesomeIcon icon={s.icon} className="text-xl" />
                                        </div>
                                        <span className="text-[10px] font-black text-[#00ffa3] bg-[#00ffa3]/10 px-3 py-1 rounded-full border border-[#00ffa3]/20">{s.trend}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">
                                        {s.restricted && user?.role === 'MANAGER' ? (
                                            <span className="text-white/10 blur-[4px] select-none">••••••</span>
                                        ) : s.value}
                                    </h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{s.sub}</p>

                                    {/* Visual Accent */}
                                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                                        <FontAwesomeIcon icon={s.icon} className="text-9xl -mr-8 -mb-8 rotate-12" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
                {/* Advanced Command Center */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'New Sale', desc: 'Execute Transaction', icon: faMoneyBillWave, color: '#00ffa3', action: () => setShowSaleModal(true) },
                        { label: 'Intelligence', desc: 'Advanced Analytics', icon: faChartLine, color: '#3b82f6', action: () => window.location.href = '/analytics' },
                        { label: 'New Repair', desc: 'Service Recording', icon: faTools, color: '#a855f7', action: () => setShowRepairModal(true) },
                        { label: 'Register', desc: 'Client Enlistment', icon: faUserPlus, color: '#ec4899', action: () => setShowCustomerModal(true) }
                    ].map((item, i) => (
                        <motion.button
                            key={i}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={item.action}
                            className="bg-[#111]/80 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl group flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: item.color }}></div>
                            <div className="absolute -right-8 -top-8 w-24 h-24 opacity-[0.02] group-hover:opacity-[0.05] transition-all group-hover:scale-150 duration-700" style={{ color: item.color }}>
                                <FontAwesomeIcon icon={item.icon} className="text-8xl" />
                            </div>

                            <div className="w-20 h-20 rounded-[2rem] mb-6 flex items-center justify-center text-4xl shadow-2xl transform group-hover:rotate-12 transition-all duration-500 bg-white/5 border border-white/5" style={{ color: item.color }}>
                                <FontAwesomeIcon icon={item.icon} />
                            </div>
                            <h4 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-white transition-colors">{item.label}</h4>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{item.desc}</p>

                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-[#00ffa3] transition-colors">
                                <span>Access Terminal</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Elite Performance Terminal */}
                        <div className="bg-[#111]/40 backdrop-blur-3xl rounded-[4rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ffa3]/5 rounded-full blur-[100px] -mr-48 -mt-48 opacity-30" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter mb-1">Performance Matrix</h3>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Real-time operational verification</p>
                                    </div>
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                        <FontAwesomeIcon icon={faShieldAlt} className="text-[#00ffa3]" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-colors group">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Stock Health</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-4xl font-black text-white leading-none">OPTIMAL</p>
                                            <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="w-[85%] h-full bg-[#00ffa3]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-colors group">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Service Queue</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-4xl font-black text-white leading-none">SYNCED</p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1.5 h-6 rounded-full ${i < 4 ? 'bg-blue-500' : 'bg-white/10'}`}></div>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Feed */}
                    <div className="bg-[#111]/80 backdrop-blur-3xl rounded-[4rem] p-12 border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter mb-1">Signal Hub</h2>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Recent system pulses</p>
                            </div>
                            <div className="w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-white/20 hover:text-[#00ffa3] transition-colors border border-white/5 cursor-pointer">
                                <FontAwesomeIcon icon={faHistory} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center gap-6 p-6 bg-white/2 rounded-[2.5rem] border border-white/5 group transition-all cursor-pointer"
                            >
                                <div className="w-14 h-14 bg-[#111] rounded-2xl flex items-center justify-center text-[#00ffa3] shadow-2xl border border-white/5 group-hover:border-[#00ffa3]/30 transition-all">
                                    <FontAwesomeIcon icon={faMicrochip} className="animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-white group-hover:text-[#00ffa3] transition-colors">Core Active</p>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Heartbeat Stable</p>
                                </div>
                                <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">Now</p>
                            </motion.div>

                            <div className="text-center py-20 opacity-20 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBolt} className="text-9xl text-white/5 rotate-12" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] relative z-10">End of Pulse Stream</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Toast notification */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-12 left-6 right-6 md:left-auto md:right-12 md:w-[450px] bg-[#111]/90 backdrop-blur-2xl border border-[#00ffa3]/20 p-8 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex items-center gap-6 z-[100]"
                    >
                        <div className="w-16 h-16 bg-[#00ffa3] text-black rounded-[1.5rem] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,163,0.3)] shrink-0">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[#00ffa3] uppercase tracking-[0.2em] mb-1">Operation Success</p>
                            <p className="text-lg font-black text-white leading-tight tracking-tight">{successMessage}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Transaction Verified & Logged</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showSaleModal && (
                <ConversationalSaleForm
                    onSuccess={() => handleSuccess('Sale recorded')}
                    onCancel={() => setShowSaleModal(false)}
                />
            )}

            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="Register Customer">
                <AddCustomerForm
                    onSuccess={() => handleSuccess('Customer added')}
                    onCancel={() => setShowCustomerModal(false)}
                />
            </Modal>

            <Modal isOpen={showRepairModal} onClose={() => setShowRepairModal(false)} title="New Repair Job">
                <CreateRepairForm
                    onSuccess={() => handleSuccess('Repair job created')}
                    onCancel={() => setShowRepairModal(false)}
                />
            </Modal>
        </div>
    );
};

export default StaffDashboard;
