import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faWrench, faClipboardList, faCheckCircle,
    faClock, faTools, faHome, faSearch, faBell, faListAlt, faFilter,
    faChevronRight, faUser, faExclamationTriangle, faCalendarAlt,
    faChartLine, faMicrochip, faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TechnicianDashboard = () => {
    const navigate = useNavigate();
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : `http://${window.location.hostname}:5000/api`;

    useEffect(() => {
        loadUserData();
        loadMyRepairs();
        const interval = setInterval(() => loadMyRepairs(), 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUserData = () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
    };

    const loadMyRepairs = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            let technicianId = localStorage.getItem('technicianId');

            if (!technicianId) {
                const techResponse = await axios.get(`${API_URL}/technicians`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myTech = techResponse.data.data.find(t => t.userId === (userData.id || userData.userId));
                if (myTech) {
                    technicianId = myTech.id;
                    localStorage.setItem('technicianId', myTech.id);
                }
            }

            if (technicianId) {
                const repairsResponse = await axios.get(
                    `${API_URL}/repairs?technicianId=${technicianId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRepairs(repairsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error loading repairs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        const styles = {
            'Assigned': 'bg-blue-50 text-blue-600 border-blue-100',
            'Device Handed Over': 'bg-purple-50 text-purple-600 border-purple-100',
            'Awaiting Approval': 'bg-amber-50 text-amber-600 border-amber-100',
            'In Progress': 'bg-orange-50 text-orange-600 border-orange-100',
            'Completed': 'bg-green-50 text-green-600 border-green-100',
            'Closed': 'bg-gray-50 text-gray-600 border-gray-100'
        };
        return styles[status] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    const stats = {
        total: repairs.length,
        inProgress: repairs.filter(r => r.status === 'In Progress').length,
        awaitingDiagnosis: repairs.filter(r => r.status === 'Device Handed Over').length,
        completed: repairs.filter(r => r.status === 'Completed' || r.status === 'Closed').length
    };

    const filteredRepairs = repairs.filter(r => {
        const matchesSearch = !searchQuery ||
            r.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.transitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="premium-bg flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="premium-label">Loading Technician Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-bg pb-32">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="premium-card w-12 h-12 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <p className="premium-label mb-0.5">My Workspace</p>
                            <h1 className="premium-h1">Repair Tasks</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="premium-card px-6 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                                {user?.name?.charAt(0) || 'T'}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">{user?.name || 'Technician'}</p>
                                <p className="premium-caption text-gray-500">Technician</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, icon: faListAlt, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                        { label: 'Active', value: stats.inProgress, icon: faTools, bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
                        { label: 'New', value: stats.awaitingDiagnosis, icon: faClock, bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
                        { label: 'Done', value: stats.completed, icon: faCheckCircle, bgColor: 'bg-green-50', textColor: 'text-green-600' }
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="premium-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.textColor} mb-3 shadow-sm transition-transform group-hover:scale-110`}>
                                <FontAwesomeIcon icon={stat.icon} className="text-sm" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 mb-1">{stat.value}</p>
                            <p className="premium-caption text-gray-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="premium-card p-6 mb-8 space-y-4">
                    <div className="relative group">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search tasks by code or device..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-input pl-16 py-4 w-full"
                        />
                    </div>

                    <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl overflow-x-auto">
                        {['all', 'Device Handed Over', 'In Progress', 'Awaiting Approval'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {status === 'all' ? 'All' : status.replace('Device Handed Over', 'New').replace('Awaiting Approval', 'Pending')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task Queue */}
                <div className="mb-4">
                    <h2 className="premium-h2 mb-2">My Tasks</h2>
                    <p className="premium-caption text-gray-500">{filteredRepairs.length} active tasks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRepairs.length === 0 ? (
                        <div className="md:col-span-2 premium-card p-20 text-center border-dashed">
                            <FontAwesomeIcon icon={faWrench} className="text-4xl text-gray-200 mb-6" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">No Tasks Found</h3>
                            <p className="premium-caption text-gray-400">No assigned tasks in this area</p>
                        </div>
                    ) : (
                        filteredRepairs.map((repair, index) => (
                            <motion.div
                                key={repair.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/repairs/${repair.id}`)}
                                className="premium-card p-4 group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <FontAwesomeIcon icon={faMicrochip} className="text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-0.5">{repair.deviceType}</h3>
                                            <p className="text-[10px] font-semibold text-blue-600 uppercase">{repair.transitCode}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase border ${getStatusStyles(repair.status)}`}>
                                        {repair.status === 'Device Handed Over' ? 'NEW' : repair.status}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">"{repair.issueDescription}"</p>

                                <div className="bg-gray-50 rounded-xl p-3 mb-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-400 text-[9px]">
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Customer</p>
                                            <p className="text-xs font-bold text-gray-900">{repair.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold text-blue-600 uppercase">{repair.currentPhase}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <div>
                                        {repair.totalEstimate > 0 && (
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-[10px] text-green-600" />
                                                <span className="text-xs font-bold text-gray-900">{formatCurrency(repair.totalEstimate)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-[9px] group-hover:bg-blue-600 transition-all">
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
