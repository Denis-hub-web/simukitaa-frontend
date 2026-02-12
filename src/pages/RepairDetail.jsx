import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUser, faPhone, faWrench, faCheckCircle,
    faClock, faMoneyBillWave, faUserTie, faClipboardCheck,
    faTimesCircle, faExclamationTriangle, faChevronRight,
    faHistory, faMicrochip, faInfoCircle, faPlus, faTimes, faIdCard,
    faChevronDown, faChevronUp, faBolt, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnosisInput from '../components/DiagnosisInput';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0
    }).format(amount || 0);
};

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const RepairDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [repair, setRepair] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [expandedSection, setExpandedSection] = useState('action');

    // Form States
    const [diagnosisData, setDiagnosisData] = useState({
        diagnosis: '', // We'll still keep it here for the final POST
        laborCost: '',
        estimatedTime: '',
        selectedParts: [],
        customParts: [],
        noInventory: false
    });

    const [partSearch, setPartSearch] = useState('');
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const [customPartEntry, setCustomPartEntry] = useState({ name: '', price: '' });

    const [paymentData, setPaymentData] = useState({
        amountPaid: '',
        finalSellingPrice: '',
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        loadRepair();
        loadInitialData();
    }, [id]);

    const loadRepair = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/repairs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRepair(response.data.data);

            // Pre-fill diagnosis data if it exists (for Technician/Manager view)
            if (response.data.data.diagnosis) {
                setDiagnosisData(prev => ({
                    ...prev,
                    diagnosis: response.data.data.diagnosis || '',
                    laborCost: response.data.data.laborCost?.toString() || '',
                    estimatedTime: response.data.data.estimatedTime || '',
                    selectedParts: response.data.data.partsRequired || [],
                    customParts: response.data.data.customComponents || [],
                    noInventory: response.data.data.noInventoryNeeded || false
                }));
            }

            if (response.data.data.status === 'Completed') {
                setPaymentData({
                    ...paymentData,
                    finalSellingPrice: response.data.data.totalEstimate,
                    amountPaid: response.data.data.totalEstimate
                });
            }
        } catch (error) {
            console.error('Error loading repair:', error);
            navigate('/repairs');
        } finally {
            setLoading(false);
        }
    };

    const loadInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [techRes, spareRes] = await Promise.all([
                axios.get(`${API_URL}/technicians`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/spare-parts`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTechnicians(techRes.data.data || []);
            setSpareParts(spareRes.data.data || []);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const handleAssignTechnician = async (technicianId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/assign`, { technicianId }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Assignment failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitDiagnosis = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const partsRequired = diagnosisData.selectedParts.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.qty,
                sellingPrice: p.sellingPrice,
                costPrice: p.costPrice
            }));

            await axios.post(`${API_URL}/repairs/${id}/diagnosis`, {
                diagnosis: diagnosisText,
                partsRequired,
                customComponents: diagnosisData.customParts,
                noInventoryNeeded: diagnosisData.noInventory,
                estimatedTime: diagnosisData.estimatedTime,
                laborCost: parseFloat(diagnosisData.laborCost) || 0
            }, { headers: { Authorization: `Bearer ${token}` } });

            loadRepair();
        } catch (error) {
            alert('Diagnosis submission failure');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveEstimate = async (approved) => {
        const notes = prompt(approved ? 'Approval notes (Optional):' : 'Rejection reason:');
        if (!approved && !notes) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/approve`, { approved, notes }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Approval action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartRepair = async () => {
        if (!confirm('Officially start work on this device?')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Failed to start repair');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteRepair = async () => {
        if (!confirm('Mark this repair as complete?')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Failed to complete repair');
        } finally {
            setActionLoading(false);
        }
    };

    const addInventoryPart = (part) => {
        setDiagnosisData(prev => {
            const exists = prev.selectedParts.find(p => p.id === part.id);
            if (exists) {
                return {
                    ...prev,
                    selectedParts: prev.selectedParts.map(p =>
                        p.id === part.id ? { ...p, qty: p.qty + 1 } : p
                    )
                };
            }
            return {
                ...prev,
                selectedParts: [...prev.selectedParts, { ...part, qty: 1 }]
            };
        });
        setPartSearch('');
        setShowPartDropdown(false);
    };

    const removeInventoryPart = (partId) => {
        setDiagnosisData(prev => ({
            ...prev,
            selectedParts: prev.selectedParts.filter(p => p.id !== partId)
        }));
    };

    const addCustomPart = () => {
        if (!customPartEntry.name || !customPartEntry.price) return;
        setDiagnosisData(prev => ({
            ...prev,
            customParts: [...prev.customParts, { ...customPartEntry }]
        }));
        setCustomPartEntry({ name: '', price: '' });
    };

    const removeCustomPart = (index) => {
        setDiagnosisData(prev => ({
            ...prev,
            customParts: prev.customParts.filter((_, i) => i !== index)
        }));
    };

    const calculateLiveTotal = () => {
        const selectedParts = diagnosisData.selectedParts || [];
        const customParts = diagnosisData.customParts || [];
        const invTotal = selectedParts.reduce((sum, p) => sum + (p.sellingPrice * p.qty), 0);
        const cusTotal = customParts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
        const labor = parseFloat(diagnosisData.laborCost) || 0;
        return invTotal + cusTotal + labor;
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/payment`, {
                amountPaid: parseFloat(paymentData.amountPaid),
                finalSellingPrice: parseFloat(paymentData.finalSellingPrice),
                paymentMethod: paymentData.paymentMethod
            }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Payment processing failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading || !repair) {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-lg font-black text-gray-600">Loading Repair...</p>
                </div>
            </div>
        );
    }

    const isTechnician = user?.role === 'TECHNICIAN';
    const isOwner = user?.id === repair.createdBy || user?.userId === repair.createdBy;
    const isManager = ['CEO', 'MANAGER'].includes(user?.role);

    const getStatusColor = () => {
        if (repair.status === 'Closed') return 'from-gray-700 to-gray-900';
        if (repair.status === 'Awaiting Payment') return 'from-emerald-500 to-emerald-700';
        if (repair.status === 'In Progress') return 'from-blue-500 to-blue-700';
        if (repair.status === 'Awaiting Approval') return 'from-amber-500 to-amber-700';
        return 'from-purple-500 to-purple-700';
    };

    const ExpandableSection = ({ title, icon, children, id, badge }) => (
        <motion.div
            className="premium-card overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <button
                onClick={() => setExpandedSection(expandedSection === id ? null : id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <FontAwesomeIcon icon={icon} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-gray-900 text-lg">{title}</h3>
                        {badge && <span className="text-xs font-bold text-blue-600">{badge}</span>}
                    </div>
                </div>
                <FontAwesomeIcon
                    icon={expandedSection === id ? faChevronUp : faChevronDown}
                    className="text-gray-400"
                />
            </button>
            <AnimatePresence>
                {expandedSection === id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
        <div className="premium-bg pb-32">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/repairs')}
                        className="premium-card w-12 h-12 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div>
                        <p className="premium-label mb-0.5">Repair #{repair.customerCode}</p>
                        <h1 className="premium-h1">{repair.deviceType}</h1>
                    </div>
                </div>
                {/* Status & Customer Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <motion.div
                        className="premium-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                        </div>
                        <p className="premium-label mb-2">Customer</p>
                        <h3 className="premium-h2 mb-2">{repair.customerName}</h3>
                        <a href={`tel:${repair.customerPhone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                            <FontAwesomeIcon icon={faPhone} className="text-sm" />
                            <span className="text-sm font-bold">{repair.customerPhone}</span>
                        </a>
                    </motion.div>

                    {/* Status */}
                    <motion.div
                        className="premium-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faClock} className="text-purple-600" />
                        </div>
                        <p className="premium-label mb-2">Status</p>
                        <p className="premium-h2 text-purple-600">{repair.status}</p>
                        <p className="text-sm font-semibold text-gray-500 mt-2">{repair.assignedTechnicianName || 'Unassigned'}</p>
                    </motion.div>

                    {/* Estimate */}
                    <motion.div
                        className="premium-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-600" />
                        </div>
                        <p className="premium-label mb-2">Estimate</p>
                        <p className="premium-h2 text-emerald-600">{formatCurrency(repair.totalEstimate || 0)}</p>
                        {repair.deviceModel && <p className="text-sm font-semibold text-gray-500 mt-2">{repair.deviceModel}</p>}
                    </motion.div>
                </div>

                {/* Issue Description */}
                <motion.div
                    className="premium-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-gray-900 mb-2">Reported Issue</h3>
                            <p className="text-gray-700 font-bold italic leading-relaxed">"{repair.issueDescription}"</p>
                        </div>
                    </div>
                </motion.div>

                {/* ACTION SECTION - Context Aware */}
                {repair.status !== 'Closed' && (
                    <ExpandableSection
                        title="Required Action"
                        icon={faBolt}
                        id="action"
                        badge="Action Needed"
                    >
                        {/* Assign Technician */}
                        {repair.status === 'Pending Assignment' && (isManager || isOwner) && (
                            <div className="space-y-3">
                                <p className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4">Select Specialist</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {technicians.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleAssignTechnician(t.id)}
                                            disabled={actionLoading}
                                            className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-transparent hover:border-blue-500 transition-all flex items-center justify-between group"
                                        >
                                            <div className="text-left">
                                                <p className="font-black text-gray-900 text-lg">{t.name}</p>
                                                <p className="text-xs font-bold text-gray-500">{t.expertise || 'Specialist'}</p>
                                            </div>
                                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {repair.status === 'Awaiting Diagnosis' && (isTechnician || isManager) && (
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-blue-200 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <FontAwesomeIcon icon={faMicrochip} className="text-3xl text-blue-600 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Ready for Diagnosis</h2>
                                <p className="text-gray-500 font-bold mb-8 max-w-sm">
                                    Please proceed to the specialized diagnosis session to record technical findings and parts required.
                                </p>
                                <button
                                    onClick={() => navigate(`/repairs/${id}/diagnosis-action`)}
                                    className="px-10 py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    <FontAwesomeIcon icon={faWrench} />
                                    Start Full Diagnosis
                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                </button>
                            </div>
                        )}

                        {/* Approval */}
                        {repair.status === 'Awaiting Approval' && (isOwner || isManager) && (
                            <div className="space-y-4">
                                <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl text-center border-2 border-amber-200">
                                    <p className="text-sm font-black uppercase tracking-wider text-amber-600 mb-3">Estimate Pending</p>
                                    <p className="text-5xl font-black text-gray-900 mb-2">{formatCurrency(repair.totalEstimate)}</p>
                                    <p className="text-xs font-bold text-gray-500">Requires Authorization</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleApproveEstimate(true)}
                                        className="py-5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-3xl font-black uppercase tracking-wider text-sm hover:shadow-2xl hover:scale-[1.02] transition-all"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleApproveEstimate(false)}
                                        className="py-5 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-3xl font-black uppercase tracking-wider text-sm hover:shadow-2xl hover:scale-[1.02] transition-all"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Start Repair */}
                        {repair.status === 'Approved' && (isTechnician || isManager) && (
                            <button
                                onClick={handleStartRepair}
                                className="premium-btn-primary w-full py-4 flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faWrench} />
                                Start Repair Work
                            </button>
                        )}

                        {/* Complete Repair */}
                        {repair.status === 'In Progress' && (isTechnician || isManager) && (
                            <button
                                onClick={handleCompleteRepair}
                                className="premium-btn-primary w-full py-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Mark as Complete
                            </button>
                        )}

                        {/* Payment */}
                        {repair.status === 'Awaiting Payment' && (isOwner || isManager) && (
                            <form onSubmit={handleProcessPayment} className="space-y-6">
                                <div className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl text-center border-2 border-emerald-200">
                                    <p className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3">Payment Due</p>
                                    <p className="text-5xl font-black text-gray-900">{formatCurrency(repair.totalEstimate)}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Final Price</label>
                                        <input
                                            type="number"
                                            value={paymentData.finalSellingPrice}
                                            onChange={e => setPaymentData({ ...paymentData, finalSellingPrice: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-2xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Payment Method</label>
                                        <select
                                            value={paymentData.paymentMethod}
                                            onChange={e => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold appearance-none"
                                        >
                                            <option value="Cash">💵 Cash</option>
                                            <option value="M-Pesa">📱 M-Pesa</option>
                                            <option value="Tigo-Pesa">📱 Tigo-Pesa</option>
                                            <option value="Airtel-Money">📱 Airtel-Money</option>
                                            <option value="Bank Transfer">🏦 Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="premium-btn-primary w-full py-4 bg-gray-900 hover:bg-black disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Complete & Record Payment'}
                                </button>
                            </form>
                        )}
                    </ExpandableSection>
                )}

                {/* Timeline */}
                <ExpandableSection title="Repair History" icon={faHistory} id="history">
                    <div className="space-y-4">
                        {repair.timeline.slice().reverse().map((event, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <FontAwesomeIcon icon={idx === 0 ? faCheckCircle : faClock} className="text-sm" />
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-gray-900">{event.action}</p>
                                        <p className="text-xs font-bold text-gray-400">{new Date(event.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    {event.details && (
                                        <p className="text-sm text-gray-600 font-bold italic">{event.details}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ExpandableSection>

                {/* Closed Status */}
                {repair.status === 'Closed' && (
                    <motion.div
                        className="premium-card p-12 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Repair Completed</h3>
                        <p className="text-gray-600 font-bold">This repair has been successfully finalized and closed.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default RepairDetail;
