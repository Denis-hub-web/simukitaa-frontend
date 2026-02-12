import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faClock, faCheckCircle, faMapMarkerAlt, faPhone, faStickyNote, faArrowRight, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import DeliveryAssignment from '../components/DeliveryAssignment';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState({ pending: 0, today: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'unassigned', 'completed'
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role || 'DELIVERY';
    const isManager = ['CEO', 'MANAGER', 'STAFF'].includes(userRole);

    useEffect(() => {
        loadDeliveries();
    }, [activeTab]);

    const loadDeliveries = async () => {
        try {
            setLoading(true);
            let res;
            if (isManager) {
                res = await deliveryAPI.getAll();
            } else {
                res = await deliveryAPI.getMyDeliveries();
            }

            const allDeliveries = res.data.data.deliveries;

            const pendingCount = allDeliveries.filter(d =>
                ['PENDING_ASSIGNMENT', 'ASSIGNED', 'ACCEPTED', 'IN_PREPARATION', 'OUT_FOR_DELIVERY', 'ARRIVED'].includes(d.status)
            ).length;
            const completedCount = allDeliveries.filter(d => d.status === 'DELIVERED').length;
            const todayCount = allDeliveries.filter(d =>
                new Date(d.createdAt).toDateString() === new Date().toDateString()
            ).length;

            setStats({ pending: pendingCount, today: todayCount, completed: completedCount });

            if (isManager) {
                if (activeTab === 'unassigned') {
                    setDeliveries(allDeliveries.filter(d => d.status === 'PENDING_ASSIGNMENT'));
                } else if (activeTab === 'completed') {
                    setDeliveries(allDeliveries.filter(d => d.status === 'DELIVERED'));
                } else {
                    setDeliveries(allDeliveries.filter(d => d.status !== 'PENDING_ASSIGNMENT' && d.status !== 'DELIVERED'));
                }
            } else {
                if (activeTab === 'completed') {
                    setDeliveries(allDeliveries.filter(d => d.status === 'DELIVERED'));
                } else {
                    setDeliveries(allDeliveries.filter(d => d.status !== 'DELIVERED'));
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load deliveries:', error);
            setLoading(false);
        }
    };

    const handleQuickUpdate = async (e, deliveryId, newStatus, note) => {
        e.stopPropagation();
        try {
            await deliveryAPI.updateStatus(deliveryId, newStatus, note);
            loadDeliveries();
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING_ASSIGNMENT': return 'bg-gray-100 text-gray-600';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-600';
            case 'ACCEPTED': return 'bg-purple-100 text-purple-600';
            case 'IN_PREPARATION': return 'bg-amber-100 text-amber-600';
            case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-600';
            case 'ARRIVED': return 'bg-green-100 text-green-600';
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDeliveryTime = (time) => {
        if (time === 'now') return 'ASAP';
        if (time === 'tomorrow') return 'Tomorrow';
        return new Date(time).toLocaleString();
    };

    const openAssignModal = (e, delivery) => {
        e.stopPropagation();
        setSelectedDelivery(delivery);
        setShowAssignModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900">
                        {isManager ? 'Delivery Dashboard' : 'My Deliveries'}
                    </h1>
                    <p className="text-gray-600">
                        {isManager ? 'Overview of all deliveries' : 'Your active delivery assignments'}
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl self-start md:self-center">
                    {[
                        { id: 'unassigned', label: 'Queued', hidden: !isManager },
                        { id: 'active', label: 'In Transit' },
                        { id: 'completed', label: 'History' }
                    ].filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <FontAwesomeIcon icon={faClock} className="text-amber-500 text-2xl mb-3" />
                    <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Operations</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <FontAwesomeIcon icon={faBox} className="text-blue-500 text-2xl mb-3" />
                    <p className="text-3xl font-black text-slate-900">{stats.today}</p>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Today's Cycle</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-2xl mb-3" />
                    <p className="text-3xl font-black text-slate-900">{stats.completed}</p>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Completed</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">
                        {activeTab === 'unassigned' ? 'Awaiting Assignment' :
                            activeTab === 'completed' ? 'Delivery History' : 'Recent Activity'}
                    </h2>
                    <span className="text-xs font-bold text-gray-400">{deliveries.length} entries</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Loading Deliveries...</p>
                    </div>
                ) : deliveries.length === 0 ? (
                    <div className="bg-white p-16 rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faBox} className="text-3xl text-gray-200" />
                        </div>
                        <p className="text-lg font-black text-slate-900 mb-2 tracking-tight">No records found</p>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">No deliveries found. Check other tabs for more information.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deliveries.map((delivery, index) => (
                            <motion.div
                                key={delivery.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/deliveries/${delivery.id}`)}
                                className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-100/50 transition-colors"></div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Delivery #{delivery.deliveryNumber}</span>
                                            <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg w-fit ${getStatusColor(delivery.status)}`}>
                                                {delivery.status.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">{formatDeliveryTime(delivery.deliveryTime)}</p>
                                            <p className="text-[10px] font-bold text-gray-400">ETA / Schedule</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Delivery Address</p>
                                                <p className="text-xs font-bold text-slate-900 truncate">{delivery.deliveryAddress}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 px-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                                <FontAwesomeIcon icon={faPhone} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Phone Number</p>
                                                <p className="text-xs font-black text-slate-900">{delivery.deliveryPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono">
                                        {new Date(delivery.createdAt).toLocaleDateString()}
                                    </span>

                                    <div className="flex items-center gap-3">
                                        {/* Manager Assignment */}
                                        {activeTab === 'unassigned' && isManager && (
                                            <button
                                                onClick={(e) => openAssignModal(e, delivery)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> Assign
                                            </button>
                                        )}

                                        {/* Driver Actions */}
                                        {!isManager && delivery.status === 'ASSIGNED' && (
                                            <button
                                                onClick={(e) => handleQuickUpdate(e, delivery.id, 'ACCEPTED', 'Delivery accepted via dashboard')}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                            >
                                                Accept Delivery
                                            </button>
                                        )}

                                        {!isManager && delivery.status === 'ACCEPTED' && (
                                            <button
                                                onClick={(e) => handleQuickUpdate(e, delivery.id, 'OUT_FOR_DELIVERY', 'Pick up complete, en route')}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                            >
                                                Start Delivery
                                            </button>
                                        )}

                                        {!isManager && delivery.status === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={(e) => handleQuickUpdate(e, delivery.id, 'ARRIVED', 'Arrived at destination')}
                                                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all"
                                            >
                                                Arrived
                                            </button>
                                        )}

                                        <button className="flex items-center gap-2 text-xs font-black text-blue-600 hover:gap-3 transition-all">
                                            View Details <FontAwesomeIcon icon={faArrowRight} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAssignModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assign Driver</h2>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-slate-900 transition-all"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <DeliveryAssignment
                                    delivery={selectedDelivery}
                                    onClose={() => setShowAssignModal(false)}
                                    onSuccess={() => {
                                        setShowAssignModal(false);
                                        loadDeliveries();
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeliveryDashboard;
