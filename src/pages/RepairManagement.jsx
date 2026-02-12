import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPlus, faSearch, faWrench, faFilter,
    faCheckCircle, faClock, faExclamationTriangle, faTimes,
    faChevronRight, faUser, faMobileAlt, faMoneyBillWave,
    faTools, faShieldAlt, faCircle, faHistory
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RepairManagement = () => {
    const navigate = useNavigate();
    const [repairs, setRepairs] = useState([]);
    const [filteredRepairs, setFilteredRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [user, setUser] = useState(null);

    const isTechnician = user?.role === 'TECHNICIAN';
    const isManager = user?.role === 'MANAGER';
    const isCEO = user?.role === 'CEO';

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        loadRepairs();
    }, []);

    useEffect(() => {
        filterRepairs();
    }, [repairs, searchQuery, statusFilter]);

    const loadRepairs = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('user') || '{}');

            if (userData.role === 'TECHNICIAN') {
                const techResponse = await axios.get(`${API_URL}/technicians`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myTech = techResponse.data.data.find(t => t.userId === (userData.id || userData.userId));

                if (myTech) {
                    const response = await axios.get(
                        `${API_URL}/repairs?technicianId=${myTech.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setRepairs(response.data.data || []);
                } else {
                    setRepairs([]);
                }
            } else {
                const response = await axios.get(`${API_URL}/repairs`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRepairs(response.data.data || []);
            }
        } catch (error) {
            console.error('Error loading repairs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRepairs = () => {
        let filtered = repairs;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.customerCode?.toLowerCase().includes(query) ||
                r.customerName?.toLowerCase().includes(query) ||
                r.deviceType?.toLowerCase().includes(query) ||
                r.deviceModel?.toLowerCase().includes(query)
            );
        }
        setFilteredRepairs(filtered);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending Assignment': 'bg-gray-100 text-gray-700 border-gray-200',
            'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
            'Device Handed Over': 'bg-purple-100 text-purple-700 border-purple-200',
            'Awaiting Approval': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Approved': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
            'Completed': 'bg-green-100 text-green-700 border-green-200',
            'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
            'Rejected': 'bg-red-100 text-red-700 border-red-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const stats = {
        total: repairs.length,
        pending: repairs.filter(r => r.status === 'Pending Assignment').length,
        awaiting: repairs.filter(r => r.status === 'Awaiting Approval').length,
        active: repairs.filter(r => r.status === 'In Progress').length
    };

    if (loading) {
        return (
            <div className="premium-bg flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="premium-label">Loading Repairs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-bg pb-32">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="premium-card w-12 h-12 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <p className="premium-label mb-0.5">Service Center</p>
                            <h1 className="premium-h1">
                                {user?.role === 'TECHNICIAN' ? 'My Repairs' : 'Repair Management'}
                            </h1>
                        </div>
                    </div>

                    {user?.role !== 'TECHNICIAN' && (
                        <button
                            onClick={() => navigate('/repairs/new')}
                            className="premium-btn-primary flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>New Repair</span>
                        </button>
                    )}
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, icon: faTools, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                        { label: 'Pending', value: stats.pending, icon: faClock, bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
                        { label: 'Awaiting', value: stats.awaiting, icon: faExclamationTriangle, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
                        { label: 'Active', value: stats.active, icon: faWrench, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' }
                    ].map((s, i) => (
                        <div key={i} className="premium-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                            <div className={`w-12 h-12 ${s.bgColor} rounded-2xl flex items-center justify-center ${s.textColor} mb-3 shadow-sm transition-transform group-hover:scale-110`}>
                                <FontAwesomeIcon icon={s.icon} className="text-lg" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 mb-1">{s.value}</p>
                            <p className="premium-caption text-gray-500">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters & Control Bar */}
                <div className="premium-card p-6 mb-8 space-y-4">
                    <div className="relative group">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search repairs by customer, device, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-input pl-16 py-4 w-full"
                        />
                    </div>

                    <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl overflow-x-auto">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'Pending Assignment', label: 'Pending' },
                            { id: 'Awaiting Approval', label: 'Awaiting' },
                            { id: 'In Progress', label: 'Active' },
                            { id: 'Completed', label: 'Done' }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => setStatusFilter(status.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${statusFilter === status.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Repair List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRepairs.map((repair, index) => (
                        <motion.div
                            key={repair.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/repairs/${repair.id}`)}
                            className="premium-card p-4 group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center transition-all group-hover:bg-blue-50 group-hover:text-blue-600">
                                        <FontAwesomeIcon icon={faTools} className="text-lg" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                                            {repair.customerCode || repair.id.slice(-8).toUpperCase()}
                                        </span>
                                        <h3 className="text-lg font-black text-gray-900 mt-1">{repair.deviceType}</h3>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase">{repair.deviceModel}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wide border ${getStatusColor(repair.status)}`}>
                                    {repair.status}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-gray-500 line-clamp-2 italic">
                                    "{repair.issueDescription}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-400 text-[9px]">
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase mb-0.5">Customer</p>
                                        <p className="font-bold text-gray-900 text-[11px] truncate">{repair.customerName}</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-xl flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-emerald-500 text-[9px]">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-bold text-emerald-500 uppercase mb-0.5">Estimate</p>
                                        <p className="font-black text-emerald-600 text-xs">{formatCurrency(repair.totalEstimate || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">
                                        {repair.assignedTechnicianName?.charAt(0) || <FontAwesomeIcon icon={faUser} className="opacity-20" />}
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-semibold text-gray-400 uppercase">Tech</p>
                                        <p className="text-[10px] font-bold text-gray-900">{repair.assignedTechnicianName || 'Pending'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {repair.status === 'Awaiting Diagnosis' && (isTechnician || isManager) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/repairs/${repair.id}/diagnosis-action`);
                                            }}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[8px] font-bold uppercase hover:bg-blue-700 transition-colors"
                                        >
                                            Start
                                        </button>
                                    )}
                                    {repair.status === 'Awaiting Approval' && (isManager || isCEO) && (
                                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-[8px]" />
                                            <span className="text-[7px] font-bold uppercase">Review</span>
                                        </div>
                                    )}
                                    <div className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-[9px] group-hover:bg-blue-600 transition-all">
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredRepairs.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-gray-200 mt-12">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200 text-3xl">
                            <FontAwesomeIcon icon={faHistory} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No Service Records</h3>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">The operations floor is clear</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepairManagement;
