import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle, faTimesCircle, faEye, faMoneyBillWave,
    faMobileAlt, faSpinner, faChartLine, faExclamationTriangle,
    faInfoCircle, faTimes, faUser, faArrowLeft, faBoxOpen,
    faCamera, faMicrochip, faShieldAlt, faHistory, faFilter,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CEOTradeInDashboard = () => {
    const navigate = useNavigate();
    const [tradeIns, setTradeIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTradeIn, setSelectedTradeIn] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [filter, setFilter] = useState('pending');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [serialNumberPhoto, setSerialNumberPhoto] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadTradeIns();
        loadCategories();
    }, [filter]);

    const loadCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } });
            setCategories(response.data.data.categories || []);
            if (response.data.data.categories && response.data.data.categories.length > 0) {
                setSelectedCategory(response.data.data.categories[0].name);
            }
        } catch (error) {
            console.error('Category fetch error:', error);
        }
    };

    const loadTradeIns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const endpoint = filter === 'pending' ? '/trade-ins/pending' : `/trade-ins?status=${filter}`;
            const response = await axios.get(`${API_BASE_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
            setTradeIns(response.data.data.tradeIns || []);
        } catch (error) {
            console.error('Trade-in fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (tradeIn) => {
        try {
            const token = localStorage.getItem('token');
            const approvedValue = customValue || tradeIn.valuation?.recommendedOffer;
            await axios.put(`${API_BASE_URL}/trade-ins/${tradeIn.id}/approve`, {
                approvedValue, notes: approvalNotes, category: selectedCategory, serialNumberPhoto
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(`Authorized!\n\nTSH ${approvedValue.toLocaleString()} credited to trade-in value.`);
            setShowApprovalModal(false);
            setSelectedTradeIn(null);
            setCustomValue('');
            setApprovalNotes('');
            loadTradeIns();
        } catch (error) {
            const errorMsg = error.response?.data?.warning || 'Approval failed';
            alert(errorMsg);
        }
    };

    const handleReject = async (tradeIn) => {
        if (!rejectionReason.trim()) { alert('Rejection reason required'); return; }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/trade-ins/${tradeIn.id}/reject`, { reason: rejectionReason }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Trade-In Rejected');
            setShowApprovalModal(false);
            setSelectedTradeIn(null);
            setRejectionReason('');
            loadTradeIns();
        } catch (error) {
            alert('Rejection failed');
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            analyzed: 'bg-blue-100 text-blue-700 border-blue-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading && tradeIns.length === 0) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-black tracking-tight uppercase text-xs">Loading Trade-Ins...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Elite Gradient Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#008069] relative overflow-hidden pb-12 pt-4 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Trade-In Insights</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Trade-In Overview</h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Pending', value: tradeIns.filter(t => t.status === 'pending').length, icon: faHistory },
                            { label: 'Analyzed', value: tradeIns.filter(t => t.status === 'analyzed').length, icon: faChartLine },
                            { label: 'Approved', value: tradeIns.filter(t => t.status === 'approved').length, icon: faCheckCircle },
                            { label: 'Rejected', value: tradeIns.filter(t => t.status === 'rejected').length, icon: faTimesCircle }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                                <div className="flex items-center gap-3 mb-1">
                                    <FontAwesomeIcon icon={s.icon} className="text-white/60 text-[10px]" />
                                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <p className="text-xl text-white font-black leading-none">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Sector Filters */}
                <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 mb-8 flex gap-2 overflow-x-auto no-scrollbar">
                    {['pending', 'analyzed', 'approved', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === status ? 'bg-gray-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            {status} records
                        </button>
                    ))}
                </div>

                {/* Business Intelligence Matrix */}
                {tradeIns.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-gray-100 mb-6" />
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Trade-Ins Found</h3>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No records found for {filter} parameters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tradeIns.map((tradeIn) => (
                            <motion.div
                                key={tradeIn.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-2xl transition-all group flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#008069] group-hover:bg-[#008069] group-hover:text-white transition-all shadow-inner overflow-hidden relative">
                                            {tradeIn.photos?.front ? (
                                                <img src={tradeIn.photos.front} className="w-full h-full object-cover" alt="Asset" />
                                            ) : (
                                                <FontAwesomeIcon icon={faMobileAlt} className="text-xl" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 tracking-tight leading-none mb-1">{tradeIn.deviceInfo?.brand} {tradeIn.deviceInfo?.model}</h3>
                                            <p className="text-[10px] font-black text-[#008069] uppercase tracking-widest">{tradeIn.deviceInfo?.storage || 'Base Model'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(tradeIn.status)}`}>
                                        {tradeIn.status}
                                    </span>
                                </div>

                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Attached Client</p>
                                        <p className="text-xs font-black text-gray-900">{tradeIn.customerName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Agent</p>
                                        <p className="text-[10px] font-black text-blue-600">{tradeIn.staff?.name || 'System'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Condition Score</p>
                                        <p className="text-sm font-black text-gray-900">{tradeIn.aiAnalysis?.conditionScore || 'N/A'}/10</p>
                                    </div>
                                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Risk Profile</p>
                                        <p className={`text-sm font-black uppercase ${tradeIn.aiAnalysis?.fraudRisk === 'low' ? 'text-green-600' : 'text-amber-600'}`}>{tradeIn.aiAnalysis?.fraudRisk || 'SCANNING'}</p>
                                    </div>
                                </div>

                                {tradeIn.valuation && (
                                    <div className="bg-[#008069]/5 rounded-[2rem] p-6 border border-[#008069]/10 mt-auto">
                                        <p className="text-[10px] font-black text-[#008069] uppercase tracking-widest mb-1">System Recommendation</p>
                                        <p className="text-2xl font-black text-[#008069] tracking-tighter leading-none">{formatCurrency(tradeIn.valuation.recommendedOffer)}</p>
                                    </div>
                                )}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => { setSelectedTradeIn(tradeIn); setShowApprovalModal(true); setCustomValue(tradeIn.valuation?.recommendedOffer || ''); }}
                                        className="flex-1 bg-gray-900 text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Review Trade-In
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approval Decision Modal */}
            <AnimatePresence>
                {showApprovalModal && selectedTradeIn && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowApprovalModal(false); setSelectedTradeIn(null); }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-gray-900 p-10 text-white relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter leading-none mb-1">{selectedTradeIn.deviceInfo?.brand} {selectedTradeIn.deviceInfo?.model}</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Trade-In Review</p>
                                    </div>
                                    <button onClick={() => { setShowApprovalModal(false); setSelectedTradeIn(null); }} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-lg">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto no-scrollbar p-10 space-y-8">
                                {/* Photo Intelligence */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Device Photos</p>
                                    <div className="grid grid-cols-4 gap-4">
                                        {Object.entries(selectedTradeIn.photos || {}).map(([key, url]) => (
                                            url && (
                                                <div key={key} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-[#008069] transition-all cursor-zoom-in">
                                                    <img src={url} alt={key} className="w-full h-full object-cover" onClick={() => window.open(url, '_blank')} />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                        <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">{key}</p>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-blue-50/50 rounded-[2rem] p-8 border border-blue-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                                                    <FontAwesomeIcon icon={faMicrochip} />
                                                </div>
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">System Analysis</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Condition Score</p>
                                                    <p className="text-3xl font-black text-blue-600 tracking-tighter">{selectedTradeIn.aiAnalysis?.conditionScore}/10</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Assessment</p>
                                                    <p className={`text-xl font-black uppercase tracking-tighter ${selectedTradeIn.aiAnalysis?.fraudRisk === 'low' ? 'text-green-600' : 'text-amber-600'}`}>{selectedTradeIn.aiAnalysis?.fraudRisk}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category Selection */}
                                        <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Inventory Placement *</p>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all shadow-inner"
                                            >
                                                <option value="">📂 All Categories...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Valuation Engine */}
                                        <div className="bg-[#008069]/5 rounded-[2rem] p-8 border border-[#008069]/10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-[#008069] text-white rounded-xl flex items-center justify-center shadow-lg">
                                                    <FontAwesomeIcon icon={faShieldAlt} />
                                                </div>
                                                <h3 className="text-sm font-black text-[#008069] uppercase tracking-widest">Valuation Engine</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                                                    <span>Market Standard</span>
                                                    <span>{formatCurrency(selectedTradeIn.valuation?.marketValue)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                                                    <span>Min Authorization</span>
                                                    <span>{formatCurrency(selectedTradeIn.valuation?.minOffer)}</span>
                                                </div>
                                                <div className="pt-4 border-t border-[#008069]/20 flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-[#008069] uppercase tracking-widest">Recommended Offer</span>
                                                    <span className="text-2xl font-black text-[#008069] leading-none tracking-tighter">{formatCurrency(selectedTradeIn.valuation?.recommendedOffer)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Value Entry */}
                                        <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Authorized Value</p>
                                            <input
                                                type="number"
                                                value={customValue}
                                                onChange={(e) => setCustomValue(e.target.value)}
                                                placeholder="Enter authorized amount..."
                                                className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rejection Rationales */}
                                <div className="bg-red-50/30 rounded-[2rem] p-8 border border-red-100">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Veto Rationale (Required for Rejection)</p>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejection..."
                                        rows={2}
                                        className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-red-500/10 transition-all resize-none shadow-inner"
                                    />
                                </div>

                                {/* Global Action Row */}
                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => handleReject(selectedTradeIn)}
                                        className="flex-1 py-5 bg-red-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-red-950 transition-all"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedTradeIn)}
                                        className="flex-[2] bg-[#008069] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#008069]/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Approve (TSH {(customValue || selectedTradeIn.valuation?.recommendedOffer || 0).toLocaleString()})
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CEOTradeInDashboard;
