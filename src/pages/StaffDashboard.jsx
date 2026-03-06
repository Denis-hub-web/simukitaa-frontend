import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMoneyBillWave, faTools, faBoxOpen, faUsers,
    faCheckCircle, faClock, faMobileAlt, faUserPlus,
    faSearch, faCog, faSignOutAlt, faReceipt,
    faArrowRight, faShieldAlt, faMicrochip, faHistory, faChartLine, faCalendar
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Staff Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-24">
            {/* Classic Global Header */}
            <div className="bg-[#008069] relative overflow-hidden pb-12 pt-4 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                <FontAwesomeIcon icon={faMobileAlt} className="text-xl" />
                            </div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Staff Portal</h1>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="bg-transparent text-white text-[10px] font-black uppercase outline-none"
                                />
                                <span className="text-white/40 text-[10px]">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="bg-transparent text-white text-[10px] font-black uppercase outline-none"
                                />
                            </div>
                            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-white opacity-60 hover:opacity-100 transition-opacity">
                                <FontAwesomeIcon icon={faSignOutAlt} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0">
                            <span className="text-3xl font-black text-[#008069]">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Karibu, {user?.name}!</h2>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">System synchronized • Online & Ready</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'My Sales', value: stats?.sales?.today?.count || 0, icon: faMoneyBillWave, color: 'emerald' },
                            { label: 'My Expenses', value: personalExpenses?.total?.toLocaleString() + ' /=' || '0', icon: faReceipt, color: 'blue' },
                            { label: 'Repairs in Hand', value: stats?.repairs?.inProgress || 0, icon: faTools, color: 'purple' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <FontAwesomeIcon icon={s.icon} className="text-white/80 text-[10px]" />
                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <p className="text-xl text-white font-black leading-none">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Action Center */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'New Sale', desc: 'Create a new sale record', icon: faMoneyBillWave, color: 'green', action: () => setShowSaleModal(true) },
                        { label: 'New Repair', desc: 'Start a new repair record', icon: faTools, color: 'purple', action: () => setShowRepairModal(true) },
                        { label: 'New Customer', desc: 'Add a new customer profile', icon: faUserPlus, color: 'blue', action: () => setShowCustomerModal(true) }
                    ].map((item, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={item.action}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-2xl shadow-inner transform group-hover:rotate-12 transition-transform ${item.color === 'green' ? 'bg-green-50 text-green-600' :
                                item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                <FontAwesomeIcon icon={item.icon} />
                            </div>
                            <h4 className="text-lg font-black text-gray-900 tracking-tight mb-1">{item.label}</h4>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.desc}</p>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-[#008069] transition-colors">
                                <span>Continue</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 uppercase">Activity Feed</h2>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Recent updates and actions</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                            <FontAwesomeIcon icon={faHistory} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 group transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#008069] shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faMicrochip} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-gray-900 group-hover:text-[#008069] transition-colors uppercase">System Online</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">All systems are running correctly</p>
                            </div>
                            <p className="text-[10px] font-black text-gray-300 uppercase">Now</p>
                        </div>

                        <div className="text-center py-10 opacity-20">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No recent activity</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-gray-900/95 text-white px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50"
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

            {/* Modals */}
            {showSaleModal && <ConversationalSaleForm onSuccess={() => handleSuccess('Sale recorded')} onCancel={() => setShowSaleModal(false)} />}
            <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="New Customer">
                <AddCustomerForm onSuccess={() => handleSuccess('Customer added')} onCancel={() => setShowCustomerModal(false)} />
            </Modal>
            <Modal isOpen={showRepairModal} onClose={() => setShowRepairModal(false)} title="New Repair">
                <CreateRepairForm onSuccess={() => handleSuccess('Repair record created')} onCancel={() => setShowRepairModal(false)} />
            </Modal>
        </div>
    );
};

export default StaffDashboard;

