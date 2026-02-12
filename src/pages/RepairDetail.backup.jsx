import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUser, faPhone, faWrench, faCheckCircle,
    faClock, faMoneyBillWave, faUserTie, faClipboardCheck,
    faTimesCircle, faExclamationTriangle, faTimes, faChevronRight,
    faHistory, faMicrochip, faShieldAlt, faInfoCircle, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const RepairDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [repair, setRepair] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [spareParts, setSpareParts] = useState([]);

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        loadRepair();
        loadTechnicians();
        loadSpareParts();
    }, [id]);

    const loadRepair = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await axios.get(`${API_URL}/repairs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const repairData = response.data.data;

            if (userData.role === 'TECHNICIAN') {
                const techResponse = await axios.get(`${API_URL}/technicians`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myTech = techResponse.data.data.find(t => t.userId === (userData.id || userData.userId));

                if (!myTech || repairData.assignedTechnicianId !== myTech.id) {
                    alert('⛔ Unauthorized access attempt');
                    navigate('/repairs');
                    return;
                }
            }

            setRepair(repairData);
        } catch (error) {
            console.error('Error loading repair:', error);
            navigate('/repairs');
        } finally {
            setLoading(false);
        }
    };

    const loadTechnicians = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/technicians`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTechnicians(response.data.data.filter(t => t.status === 'Active') || []);
        } catch (error) {
            console.error('Technician fetch error:', error);
        }
    };

    const loadSpareParts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/spare-parts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSpareParts(response.data.data || []);
        } catch (error) {
            console.error('Spare parts fetch error:', error);
        }
    };

    const handleAssignTechnician = async (technicianId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/assign`, { technicianId }, { headers: { Authorization: `Bearer ${token}` } });
            setShowAssignModal(false);
            loadRepair();
        } catch (error) {
            alert('Assignment failed');
        }
    };

    const handleConfirmHandover = async () => {
        if (!confirm('Authorize device handover to technician?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/handover`, { deviceCondition: 'Good', accessories: [], notes: '' }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Handover failure');
        }
    };

    const handleApproveEstimate = async (approved) => {
        const notes = approved ? prompt('Approval authorization notes:') : prompt('Rejection rationale:');
        if (notes === null) return;

        let officeFee = 0;
        if (approved) {
            const feeInput = prompt('Enter Office Fee (Optional, leave blank for 0):', '0');
            if (feeInput === null) return; // Cancel approval
            officeFee = parseFloat(feeInput) || 0;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/approve`, { approved, notes, officeFee }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Approval protocol failure');
        }
    };

    const handleCustomerApproval = async (approved) => {
        if (!confirm(`Confirm client ${approved ? 'acceptance' : 'rejection'} of service terms?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/customer-approval`, { approved }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Client confirmation failure');
        }
    };

    const handleStartRepair = async () => {
        if (!confirm('Officially commence technical work? This will notify the client.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            console.error('Start repair error:', error);
            alert('Failed to start repair. Technical protocol error.');
        }
    };

    const handleQuickComplete = async () => {
        if (!confirm('Confirm technical execution is complete? SIMUKITAA standards will be applied.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/complete`, {
                completionNotes: 'Work executed successfully as per diagnosis.',
                warrantyPeriod: 30
            }, { headers: { Authorization: `Bearer ${token}` } });
            loadRepair();
        } catch (error) {
            alert('Execution closure failure');
        }
    };

    const handleComponentStatusUpdate = async (componentId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/repairs/${id}/components/${componentId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadRepair();
        } catch (error) {
            console.error('Component update failed:', error);
            alert('Failed to update part status');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getNextAction = () => {
        if (!repair) return null;

        switch (repair.status) {
            case 'Pending Assignment':
                return { role: 'CEO/MANAGER', text: 'Assign a technician to start technical evaluation.' };
            case 'Assigned':
                return { role: 'OPERATIONS', text: 'Confirm physical device handover to the assigned technician.' };
            case 'Device Handed Over':
                return { role: 'TECHNICIAN', text: 'Evaluate the device and submit a formal diagnosis & estimate.' };
            case 'Awaiting Approval':
                return { role: 'CEO/MANAGER', text: 'Review and authorize or veto the technician\'s estimate.' };
            case 'Approved':
                return { role: 'TECHNICIAN', text: 'Officially start technical execution of authorized services.' };
            case 'Procurement':
                return { role: 'LOGISTICS', text: 'Sourcing external hardware. Finalize procurement before technical ignition.' };
            case 'In Progress':
                return { role: 'TECHNICIAN', text: 'Execute the repair and mark as completed once verified.' };
            case 'Completed':
                return { role: 'STAFF', text: 'Finalize service by processing the customer\'s payment.' };
            case 'Closed':
                return { role: 'SYSTEM', text: 'Registry closed. No further actions required.' };
            default:
                return null;
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Pending Assignment': 'bg-gray-100 text-gray-700 border-gray-200',
            'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
            'Device Handed Over': 'bg-purple-100 text-purple-700 border-purple-200',
            'Awaiting Approval': 'bg-amber-100 text-amber-700 border-amber-200',
            'Approved': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Procurement': 'bg-rose-100 text-rose-700 border-rose-200',
            'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
            'Completed': 'bg-green-100 text-green-700 border-green-200',
            'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
            'Rejected': 'bg-red-100 text-red-700 border-red-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200'
        };
        return styles[status] || styles['Pending Assignment'];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-black tracking-tight uppercase text-xs">Accessing Data Node...</p>
                </div>
            </div>
        );
    }

    if (!repair) return null;

    return (
        <div className="min-h-screen bg-[#efeff4] pb-32">
            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/repairs')} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 hover:text-[#008069] transition-all">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Repair Protocol</h1>
                                <StatusBadge status={repair.status} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Reference: {repair.transitCode}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="px-6 py-2 border-r border-gray-100">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Created</p>
                            <p className="text-xs font-black text-gray-900">{new Date(repair.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="px-6 py-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Quote</p>
                            <p className="text-sm font-black text-[#008069]">{formatCurrency(user?.role === 'TECHNICIAN' ? repair.totalEstimate : (repair.totalAmount || repair.totalEstimate))}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Diagnostics & Technical Detail */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Current Objective Banner */}
                        {getNextAction() && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#008069]"></div>
                                <div className="w-12 h-12 bg-[#008069]/10 text-[#008069] rounded-2xl flex items-center justify-center animate-pulse">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Strategic Objective</p>
                                    <p className="text-sm font-black text-gray-700">{getNextAction().text}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Hardware Assets */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex items-center gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full -mr-24 -mt-24 group-hover:bg-gray-100 transition-colors" />
                            <div className="relative z-10 w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl">
                                <FontAwesomeIcon icon={faMicrochip} />
                            </div>
                            <div className="relative z-10 flex-1 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Equipment</p>
                                    <p className="text-xl font-black text-gray-900">{repair.deviceType}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Model Spec</p>
                                    <p className="text-xl font-black text-gray-900">{repair.deviceModel || 'N/A'}</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
                            {/* Information Hub Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Client Vertical */}
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#008069] shadow-inner">
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Client Identity</h2>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verified Personnel</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Name</span>
                                            <span className="text-xs font-black text-gray-900">
                                                {user?.role === 'TECHNICIAN' ? `${repair.customerName?.charAt(0)}*** ${repair.customerName?.split(' ').pop()?.charAt(0)}***` : repair.customerName}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Channel</span>
                                            <span className="text-xs font-black text-gray-900">
                                                {user?.role === 'TECHNICIAN' ? '********' : repair.customerPhone}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Operational Vertical */}
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                            <FontAwesomeIcon icon={faMicrochip} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Asset Status</h2>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Device Logistics</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment</span>
                                            <span className="text-xs font-black text-gray-900">{repair.deviceType}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Spec</span>
                                            <span className="text-xs font-black text-gray-900">{repair.deviceModel || 'N/A'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Staff Action Banner: Call Customer */}
                            {repair.currentPhase === 'Staff: Call Customer for Approval' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-8 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2.5rem] p-8 shadow-2xl relative"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white text-2xl shadow-inner backdrop-blur-md">
                                                <FontAwesomeIcon icon={faPhone} className="animate-pulse" />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h2 className="text-xl font-black text-white tracking-tight mb-1">📢 ACTION REQUIRED: CALL CUSTOMER</h2>
                                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Manager has approved the estimate. Please call for client final approval.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end gap-2">
                                            <span className="text-2xl font-black text-white tabular-nums">{repair.customerPhone}</span>
                                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{repair.customerName}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Service Diagnostics Section */}
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl">
                                            <FontAwesomeIcon icon={faWrench} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">Operational Diagnostics</h2>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Service Lifecycle Data</p>
                                        </div>
                                    </div>
                                    {repair.assignedTechnicianName && (
                                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <div className="w-8 h-8 bg-[#008069] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                                                {repair.assignedTechnicianName.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{repair.assignedTechnicianName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50/50 rounded-[2rem] p-6 mb-8 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Primary Issue</p>
                                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{repair.issueDescription}"</p>
                                </div>

                                {repair.diagnosisSubmitted ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2">
                                                <p className="text-[10px] font-black text-[#008069] uppercase tracking-widest mb-3">Technical Diagnosis</p>
                                                <p className="text-sm font-black text-gray-900 leading-relaxed">{repair.diagnosis}</p>
                                            </div>
                                            <div className="bg-[#008069]/5 rounded-[2rem] p-6 border border-[#008069]/10">
                                                <p className="text-[10px] font-black text-[#008069] uppercase tracking-widest mb-4">Valuation Profile</p>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                                                        <span>Components</span>
                                                        <span>{formatCurrency(repair.totalEstimate - repair.laborCost)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                                                        <span>Labor</span>
                                                        <span>{formatCurrency(repair.laborCost)}</span>
                                                    </div>
                                                    {user?.role !== 'TECHNICIAN' && repair.officeFee > 0 && (
                                                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                                                            <span>Office Fee</span>
                                                            <span>{formatCurrency(repair.officeFee)}</span>
                                                        </div>
                                                    )}
                                                    {repair.estimatedTime && (
                                                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                                                            <span>Estimated Time</span>
                                                            <span className="text-[#008069]">{repair.estimatedTime}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-4 border-t border-[#008069]/20 flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-[#008069] uppercase tracking-widest">Total Quote</span>
                                                        <span className="text-xl font-black text-[#008069] leading-none">
                                                            {formatCurrency(user?.role === 'TECHNICIAN' ? repair.totalEstimate : (repair.totalAmount || repair.totalEstimate))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {repair.partsRequired.length > 0 && (
                                            <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
                                                {repair.partsRequired?.length > 0 && (
                                                    <div className="bg-white/50 rounded-2xl p-4 border border-gray-100 mb-4">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-3">Inventory Components</p>
                                                        <div className="space-y-2">
                                                            {repair.partsRequired.map((part, idx) => (
                                                                <div key={idx} className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black text-gray-900">{part.name} (x{part.quantity})</span>
                                                                    <span className="text-[10px] font-black text-gray-500">{formatCurrency(part.sellingPrice * part.quantity)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {repair.customComponents?.length > 0 && (
                                                    <div className="bg-white/50 rounded-2xl p-4 border border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-3">External Components</p>
                                                        <div className="space-y-4">
                                                            {repair.customComponents.map((component, idx) => (
                                                                <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-50">
                                                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-900">
                                                                        <span>{component.name}</span>
                                                                        <span className="text-gray-500">{formatCurrency(component.price)}</span>
                                                                    </div>

                                                                    {/* Status & Controls */}
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${component.status === 'received' ? 'bg-green-100 text-green-600' :
                                                                            component.status === 'ordered' ? 'bg-blue-100 text-blue-600' :
                                                                                'bg-amber-100 text-amber-600'
                                                                            }`}>
                                                                            {component.status === 'received' ? '✅ Received' : component.status === 'ordered' ? '📦 Ordered' : '⏳ Pending'}
                                                                        </div>

                                                                        {((user?.role === 'CEO' || user?.role === 'MANAGER') || (user?.role === 'STAFF' && (user?.id === repair.createdBy || user?.userId === repair.createdBy))) && (
                                                                            <div className="flex gap-1">
                                                                                {component.status !== 'ordered' && component.status !== 'received' && (
                                                                                    <button onClick={() => handleComponentStatusUpdate(component.id, 'ordered')} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase hover:bg-blue-100 transition-colors">Mark Ordered</button>
                                                                                )}
                                                                                {component.status !== 'received' && (
                                                                                    <button onClick={() => handleComponentStatusUpdate(component.id, 'received')} className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[8px] font-black uppercase hover:bg-green-100 transition-colors">Mark Received</button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 rounded-[2rem] p-12 text-center border border-amber-100">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-3xl text-amber-500 mb-4" />
                                        <h3 className="text-lg font-black text-amber-900 tracking-tight">Diagnosis Pending</h3>
                                        <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Awaiting technical evaluation from assigned personnel</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Audit & Logistics Path */}
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shadow-inner">
                                        <FontAwesomeIcon icon={faHistory} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Operational Timeline</h2>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Audit Log</p>
                                    </div>
                                </div>

                                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    {repair.timeline.map((event, idx) => (
                                        <div key={idx} className="flex gap-6 relative z-10">
                                            <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md flex-shrink-0 mt-1 ${idx === 0 ? 'bg-[#008069]' : 'bg-gray-300'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-xs font-black text-gray-900 tracking-tight">{event.action}</p>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(event.timestamp).toLocaleDateString()}</p>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mb-1">{event.performedBy}</p>
                                                {event.details && <p className="text-xs font-bold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-inner">{event.details}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Global Command Center (Buttons) */}
                            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 h-28 pointer-events-none">
                                <div className="max-w-4xl mx-auto flex gap-4 pointer-events-auto">
                                    {/* Assign Technician */}
                                    {repair.status === 'Pending Assignment' && (user?.role === 'CEO' || user?.role === 'MANAGER') && (
                                        <button onClick={() => setShowAssignModal(true)} className="flex-1 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                            <FontAwesomeIcon icon={faUserTie} className="mr-3" />
                                            Assign Personnel
                                        </button>
                                    )}

                                    {/* Confirm Handover */}
                                    {repair.status === 'Assigned' && (user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'STAFF') && (
                                        <button onClick={handleConfirmHandover} className="flex-1 bg-purple-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-3" />
                                            Confirm Deployment
                                        </button>
                                    )}

                                    {/* Submit Diagnosis */}
                                    {repair.status === 'Device Handed Over' && user?.role === 'TECHNICIAN' && (
                                        <button onClick={() => setShowDiagnosisModal(true)} className="flex-1 bg-orange-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                            <FontAwesomeIcon icon={faClipboardCheck} className="mr-3" />
                                            Submit Diagnostics
                                        </button>
                                    )}

                                    {/* Approve/Reject Estimate */}
                                    {repair.status === 'Awaiting Approval' && (user?.role === 'CEO' || user?.role === 'MANAGER') && (
                                        <div className="flex gap-4 flex-1">
                                            <button onClick={() => handleApproveEstimate(true)} className="flex-1 bg-green-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Authorize</button>
                                            <button onClick={() => handleApproveEstimate(false)} className="flex-1 bg-red-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Veto</button>
                                        </div>
                                    )}

                                    {/* Customer Approval */}
                                    {repair.status === 'Approved' && (user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'STAFF') && (
                                        <div className="flex gap-4 flex-1">
                                            <button onClick={() => handleCustomerApproval(true)} className="flex-1 bg-[#008069] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                                Confirm: Client Agreed
                                            </button>
                                            <button onClick={() => handleCustomerApproval(false)} className="flex-1 bg-red-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                                                Confirm: Client Declined
                                            </button>
                                        </div>
                                    )}

                                    {/* Start Repair */}
                                    {(repair.status === 'Approved' || repair.status === 'Procurement') && user?.role === 'TECHNICIAN' && (
                                        <button onClick={handleStartRepair} className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                            <FontAwesomeIcon icon={faWrench} className="mr-3" />
                                            Start Technical Work
                                        </button>
                                    )}

                                    {/* Submit Completion (Technician - One Tap) */}
                                    {repair.status === 'In Progress' && user?.role === 'TECHNICIAN' && (
                                        <button onClick={handleQuickComplete} className="flex-1 bg-[#008069] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-3" />
                                            Mark as Executed
                                        </button>
                                    )}

                                    {/* Submit Completion (Staff/Manager - Full Modal if needed) */}
                                    {repair.status === 'In Progress' && (user?.role === 'CEO' || user?.role === 'MANAGER') && (
                                        <button onClick={() => setShowCompletionModal(true)} className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Complete with Details</button>
                                    )}

                                    {/* Process Payment */}
                                    {repair.status === 'Completed' && repair.paymentStatus !== 'Paid' && (user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'STAFF') && (
                                        <button onClick={() => setShowPaymentModal(true)} className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                            <FontAwesomeIcon icon={faMoneyBillWave} className="mr-3" />
                                            Finalize Payment
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Premium Modal Ecosystem */}
                        <AnimatePresence>
                            {showAssignModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                                        <AssignTechnicianModal technicians={technicians} onClose={() => setShowAssignModal(false)} onAssign={handleAssignTechnician} />
                                    </motion.div>
                                </div>
                            )}
                            {showDiagnosisModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDiagnosisModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                                        <DiagnosisModalContent spareParts={spareParts} repairId={id} onClose={() => setShowDiagnosisModal(false)} onSuccess={() => { setShowDiagnosisModal(false); loadRepair(); }} />
                                    </motion.div>
                                </div>
                            )}
                            {showCompletionModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCompletionModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                                        <CompletionModalContent repairId={id} onClose={() => setShowCompletionModal(false)} onSuccess={() => { setShowCompletionModal(false); loadRepair(); }} />
                                    </motion.div>
                                </div>
                            )}
                            {showPaymentModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                                        <PaymentModalContent repairId={id} balance={repair.totalAmount - repair.paidAmount} onClose={() => setShowPaymentModal(false)} onSuccess={() => { setShowPaymentModal(false); loadRepair(); }} />
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                );
};

                const AssignTechnicianModal = ({technicians, onClose, onAssign}) => {
    const [selectedTech, setSelectedTech] = useState('');
                return (
                <div className="p-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-8 text-gray-900">Assign Personnel</h2>
                    <div className="space-y-4 mb-8">
                        {technicians.map(tech => (
                            <button key={tech.id} onClick={() => setSelectedTech(tech.id)} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${selectedTech === tech.id ? 'bg-[#008069] text-white border-[#008069] shadow-xl' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-[#008069]/30'}`}>
                                <div>
                                    <p className="font-black text-sm">{tech.name}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${selectedTech === tech.id ? 'text-white/60' : 'text-gray-400'}`}>Specialist</p>
                                </div>
                                {selectedTech === tech.id && <FontAwesomeIcon icon={faCheckCircle} />}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50">Abort</button>
                        <button onClick={() => onAssign(selectedTech)} disabled={!selectedTech} className="flex-1 py-4 bg-[#008069] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#008069]/20">Authorize</button>
                    </div>
                </div>
                );
};

                const DiagnosisModalContent = ({spareParts, repairId, onClose, onSuccess}) => {
    const [diagnosis, setDiagnosis] = useState('');
                const [laborCost, setLaborCost] = useState('');
                const [officeFee, setOfficeFee] = useState('');
                const [estimatedTime, setEstimatedTime] = useState('');
                const [selectedParts, setSelectedParts] = useState([]);
                const [customParts, setCustomParts] = useState([]); // [{name, price}]
                const [loading, setLoading] = useState(false);
                const [noInventory, setNoInventory] = useState(false);

                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const addPart = (partId) => {
        const part = spareParts.find(p => p.id === partId);
        if (part && !selectedParts.find(p => p.id === partId)) setSelectedParts([...selectedParts, {...part, qty: 1 }]);
    };

    const addCustomPart = () => {
        const name = prompt('Component Identity:');
                const price = prompt('Procurement Value (TZS):');
                if (name && price) {
                    setCustomParts([...customParts, { name, price: parseFloat(price) || 0 }]);
        }
    };

    const handleSubmit = async (e) => {
                    e.preventDefault();
                setLoading(true);
                try {
            const token = localStorage.getItem('token');
            const partsRequired = selectedParts.map(p => ({id: p.id, name: p.name, quantity: p.qty, sellingPrice: p.sellingPrice }));
                await axios.post(`${API_URL}/repairs/${repairId}/diagnosis`, {
                    diagnosis,
                    partsRequired,
                    customComponents: customParts,
                noInventoryNeeded: noInventory,
                estimatedTime,
                laborCost: parseFloat(laborCost) || 0,
                officeFee: parseFloat(officeFee) || 0
            }, {headers: {Authorization: `Bearer ${token}` } });
                onSuccess();
        } catch (error) {alert('Diagnosis submission failure'); } finally {setLoading(false); }
    };

                return (
                <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <h2 className="text-3xl font-black tracking-tighter mb-4 text-gray-900">Technical Diagnostics</h2>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                        <input
                            type="checkbox"
                            id="noInventory"
                            checked={noInventory}
                            onChange={(e) => setNoInventory(e.target.checked)}
                            className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500 border-amber-200"
                        />
                        <label htmlFor="noInventory" className="text-[10px] font-black text-amber-900 uppercase tracking-widest cursor-pointer">
                            No Inventory Components Required
                        </label>
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diagnosis Summary *</p>
                        <textarea required rows={3} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all resize-none" />
                    </div>

                    {!noInventory && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inventory Components</p>
                            <select onChange={e => { addPart(e.target.value); e.target.value = ''; }} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all mb-4">
                                <option value="">Search Inventory Components...</option>
                                {spareParts.filter(p => !selectedParts.find(sp => sp.id === p.id)).map(p => <option key={p.id} value={p.id}>{p.name} - {new Intl.NumberFormat('sw-TZ').format(p.sellingPrice)}</option>)}
                            </select>
                            <div className="space-y-2">
                                {selectedParts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-xs font-black text-gray-900">{p.name}</span>
                                        <div className="flex items-center gap-4">
                                            <input type="number" min="1" value={p.qty} onChange={e => setSelectedParts(selectedParts.map(sp => sp.id === p.id ? { ...sp, qty: parseInt(e.target.value) || 1 } : sp))} className="w-16 px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-black" />
                                            <button type="button" onClick={() => setSelectedParts(selectedParts.filter(sp => sp.id !== p.id))} className="text-red-500 font-black uppercase text-[8px]">Eject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">External Components</p>
                            <button type="button" onClick={addCustomPart} className="text-[10px] font-black text-[#008069] uppercase tracking-widest">+ Add External</button>
                        </div>
                        <div className="space-y-2">
                            {customParts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{p.name}</p>
                                        <p className="text-[10px] font-black text-gray-400">{new Intl.NumberFormat('sw-TZ').format(p.price)}</p>
                                    </div>
                                    <button type="button" onClick={() => setCustomParts(customParts.filter((_, idx) => idx !== i))} className="text-red-500 font-black uppercase text-[8px]">Eject</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Technician Labor (TZS) *</p>
                            <input type="number" required value={laborCost} onChange={e => setLaborCost(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Execution Time</p>
                            <input type="text" placeholder="e.g. 2 Hours" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50">Abort</button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-gray-200">Submit Log</button>
                    </div>
                </form>
                );
};

                const CompletionModalContent = ({repairId, onClose, onSuccess}) => {
    const [notes, setNotes] = useState('');
                const [warranty, setWarranty] = useState('30');
                const [loading, setLoading] = useState(false);
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
                    e.preventDefault();
                setLoading(true);
                try {
            const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/repairs/${repairId}/complete`, {completionNotes: notes, warrantyPeriod: parseInt(warranty) }, {headers: {Authorization: `Bearer ${token}` } });
                onSuccess();
        } catch (error) {alert('Completion protocol failure'); } finally {setLoading(false); }
    };

                return (
                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <h2 className="text-3xl font-black tracking-tighter mb-4 text-gray-900">Service Execution</h2>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Final Execution Notes (Optional)</p>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all resize-none" placeholder="Work executed successfully as per diagnosis..." />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Warranty Security (Days)</p>
                        <input type="number" value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all" placeholder="30" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50">Abort</button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-[#008069] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#008069]/20">Authorize Closure</button>
                    </div>
                </form>
                );
};

                const PaymentModalContent = ({repairId, balance, onClose, onSuccess}) => {
    const [amount, setAmount] = useState(balance.toString());
                const [paymentMethod, setPaymentMethod] = useState('Cash');
                const [loading, setLoading] = useState(false);
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
                    e.preventDefault();
                setLoading(true);
                try {
            const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/repairs/${repairId}/payment`, {amount: parseFloat(amount), paymentMethod }, {headers: {Authorization: `Bearer ${token}` } });
                onSuccess();
        } catch (error) {alert('Payment processing failure'); } finally {setLoading(false); }
    };

                return (
                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <h2 className="text-3xl font-black tracking-tighter mb-4 text-gray-900">Revenue Settlement</h2>
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 text-center mb-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Outstanding Liability</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(balance)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Installment Amount (TZS) *</p>
                            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} max={balance} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Channel</p>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all">
                                <option value="Cash">💵 Cash</option>
                                <option value="M-Pesa">📱 M-Pesa</option>
                                <option value="Tigo-Pesa">📱 Tigo-Pesa</option>
                                <option value="Airtel-Money">📱 Airtel-Money</option>
                                <option value="Bank Transfer">🏦 Bank Transfer</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50">Abort</button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-gray-200">Process Credits</button>
                    </div>
                </form>
                );
};

                export default RepairDetail;
