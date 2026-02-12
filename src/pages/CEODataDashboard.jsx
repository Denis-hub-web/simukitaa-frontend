import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faExchangeAlt, faShoppingCart, faTools,
    faBox, faBell, faSearch, faDownload, faUserShield,
    faArrowLeft, faCalendarAlt, faFilter, faChevronRight,
    faHistory, faChartLine, faMoneyBillWave, faLightbulb, faExclamationTriangle,
    faCubes, faMicrochip, faShieldAlt, faBrain, faCalendarDay, faCircle, faChevronLeft,
    faTruck, faBriefcase, faPlusCircle, faCheckDouble,
    faStar, faLayerGroup, faCogs, faKey, faSync, faCalculator
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CEODataDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('intelligence');
    const [data, setData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executiveInsights, setExecutiveInsights] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        dateFrom: '',
        dateTo: ''
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewingMonth, setViewingMonth] = useState(new Date());
    const [activitiesForDate, setActivitiesForDate] = useState([]);
    const [userFilter, setUserFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [communityChampions, setCommunityChampions] = useState({ day: null, week: null, month: null, year: null });

    const tabs = [
        { id: 'intelligence', label: 'Activity Feed', icon: faBrain, sub: 'Recent Activity' },
        { id: 'users', label: 'Workforce', icon: faUsers, sub: 'All Staff' },
        { id: 'tradeIns', label: 'Trade-Ins', icon: faExchangeAlt, sub: 'Trade-In History' },
        { id: 'sales', label: 'Revenue', icon: faShoppingCart, sub: 'Sales Records' },
        { id: 'repairs', label: 'Repairs', icon: faTools, sub: 'Repair Status' },
        { id: 'products', label: 'Inventory', icon: faBox, sub: 'Inventory Status' },
        { id: 'calculator', label: 'Stock Analytics', icon: 'lucide-calculator', sub: 'Calculator', isLucide: true },
        { id: 'tools', label: 'System Tools', icon: faCogs, sub: 'Settings' }
    ];

    useEffect(() => {
        loadData();
    }, [activeTab, filters]);

    useEffect(() => {
        if (activeTab === 'intelligence' && data.length > 0) {
            filterActivitiesForDate(selectedDate, userFilter);
        }
    }, [data, selectedDate, activeTab, userFilter]);

    // Fetch users for filtering
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/ceo/data?type=users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data.data.items || []);
            } catch (error) {
                console.error('Fetch users error:', error);
            }
        };
        fetchUsers();

        const fetchChampions = async () => {
            try {
                const token = localStorage.getItem('token');
                const [d, w, m, y] = await Promise.all([
                    axios.get(`${API_BASE_URL}/loyalty/leaderboard?period=day`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/loyalty/leaderboard?period=week`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/loyalty/leaderboard?period=month`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/loyalty/leaderboard?period=year`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setCommunityChampions({
                    day: d.data.data[0],
                    week: w.data.data[0],
                    month: m.data.data[0],
                    year: y.data.data[0]
                });
            } catch (err) {
                console.error('Fetch champions error:', err);
            }
        };
        fetchChampions();
    }, []);

    const filterActivitiesForDate = (date, userId = 'all') => {
        const targetYear = date.getFullYear();
        const targetMonth = date.getMonth();
        const targetDay = date.getDate();

        let dayActivities = data.filter(a => {
            const aDate = new Date(a.date);
            return aDate.getFullYear() === targetYear &&
                aDate.getMonth() === targetMonth &&
                aDate.getDate() === targetDay;
        });

        if (userId !== 'all') {
            dayActivities = dayActivities.filter(a => a.actorId === userId);
        }

        setActivitiesForDate(dayActivities);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                type: activeTab,
                ...filters
            });

            const response = await axios.get(`${API_BASE_URL}/ceo/data?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setData(response.data.data.items);
            setStatistics(response.data.data.statistics);
            setExecutiveInsights(response.data.data.executiveInsights);

            // Re-filter if in intelligence tab
            if (activeTab === 'intelligence') {
                filterActivitiesForDate(selectedDate, userFilter);
            }
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Fill empty slots from previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Fill actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const getMonthName = (date) => {
        return date.toLocaleString('default', { month: 'long' });
    };

    const renderActivityDetail = () => {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full bg-white/60 backdrop-blur-3xl border-l border-white/40 w-full lg:w-[450px] shadow-2xl relative z-10"
            >
                {/* Executive Pulse Header */}
                <div className="p-10 border-b border-gray-100/50 bg-gradient-to-br from-blue-50/50 to-transparent">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <p className="premium-label text-blue-600 mb-2">History</p>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                                {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long' })}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                {activitiesForDate.length}
                            </span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Recorded</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="premium-card p-4 border-white shadow-sm bg-white/40">
                            <p className="premium-label text-[9px] mb-1">Total Value</p>
                            <p className="text-sm font-black text-gray-900">
                                {formatCurrency(activitiesForDate.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0))}
                            </p>
                        </div>
                        <div className="premium-card p-4 border-white shadow-sm bg-white/40">
                            <p className="premium-label text-[9px] mb-1">Activity Points</p>
                            <p className="text-sm font-black text-blue-600">
                                {activitiesForDate.reduce((acc, curr) => acc + (curr.pulse || 10), 0)} P
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative">
                    {/* Timeline Connector */}
                    {activitiesForDate.length > 0 && (
                        <div className="absolute left-[59px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-100 via-gray-100 to-blue-100 rounded-full" />
                    )}

                    {activitiesForDate.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-24">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faCalendarDay} className="text-4xl text-gray-200" />
                            </div>
                            <p className="premium-label">No activity found</p>
                        </div>
                    ) : (
                        activitiesForDate.map((activity, idx) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative z-10 flex gap-6 group"
                            >
                                {/* Time Stamp & Icon Matrix */}
                                <div className="flex flex-col items-center shrink-0">
                                    <span className="text-[9px] font-black text-gray-400 mb-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
                                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 ring-4 ring-white"
                                        style={{ backgroundColor: activity.color, boxShadow: `0 20px 40px ${activity.color}30` }}
                                    >
                                        <FontAwesomeIcon icon={
                                            activity.type === 'sale' ? faShoppingCart :
                                                activity.type === 'repair' ? faTools :
                                                    activity.type === 'inventory' ? faBox :
                                                        activity.type === 'delivery' ? faTruck :
                                                            activity.type === 'enrollment' ? faUsers :
                                                                activity.type === 'workforce' ? faBriefcase :
                                                                    activity.type === 'review' ? faStar :
                                                                        faExchangeAlt
                                        } className="text-lg" />
                                    </div>
                                </div>

                                {/* Activity Content */}
                                <div
                                    onClick={() => {
                                        if (activity.type === 'repair') navigate(`/repairs/${activity.id.replace('repair-', '')}`);
                                    }}
                                    className="flex-1 premium-card p-6 bg-white/70 backdrop-blur-md hover:bg-white cursor-pointer group/card border-white/60 hover:border-blue-200"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border" style={{ color: activity.color, borderColor: `${activity.color}20`, backgroundColor: `${activity.color}08` }}>
                                            {activity.category}
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                        </div>
                                    </div>

                                    <h4 className="text-[15px] font-black text-gray-900 leading-tight mb-1">{activity.title}</h4>
                                    <p className="premium-label text-[9px] mb-4 truncate">{activity.subtitle}</p>

                                    {/* Data Overview: Financial & Technical Insights */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {(activity.paymentMethod || activity.type === 'sale') && (
                                            <div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100/50">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Channel</p>
                                                <p className="text-[10px] font-black text-gray-900 text-center">{activity.paymentMethod || 'LIQUID'}</p>
                                            </div>
                                        )}
                                        {activity.type === 'repair' && (
                                            <div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100/50">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Diagnosis</p>
                                                <p className="text-[10px] font-black text-indigo-600 text-center truncate">{activity.diagnosis || 'Standard'}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                                        <div className="flex flex-col">
                                            {activity.value ? (
                                                <>
                                                    <span className="text-[12px] font-black text-gray-900 leading-none mb-1">{formatCurrency(activity.value)}</span>
                                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-60">Revenue Captured</span>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Live Update</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 premium-btn-outline rounded-xl flex items-center justify-center text-[10px] shadow-sm bg-white border-gray-100">
                                                {activity.actor?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-900 tracking-tighter leading-none mb-0.5">{activity.actor}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{activity.actorRole}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        );
    };

    const renderCalendar = () => {
        const days = getDaysInMonth(viewingMonth);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="flex flex-col lg:flex-row h-full min-h-[700px] overflow-hidden">
                {/* Main Calendar View */}
                <div className="flex-1 p-12 bg-white/40">
                    <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-[#0a0a0b] rounded-3xl flex items-center justify-center shadow-2xl rotate-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl text-white" />
                            </div>
                            <div>
                                <p className="premium-label text-blue-600 mb-2">Activity Calendar</p>
                                <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
                                    {getMonthName(viewingMonth)} <span className="text-gray-200">{viewingMonth.getFullYear()}</span>
                                </h2>
                            </div>
                        </div>

                        <div className="flex gap-4 p-2 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
                            <button
                                onClick={() => setViewingMonth(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))}
                                className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all active:scale-95"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="scale-75 -mr-1 opacity-40" />
                                <FontAwesomeIcon icon={faChevronLeft} className="scale-75" />
                            </button>
                            <button
                                onClick={() => setViewingMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all active:scale-95"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button
                                onClick={() => setViewingMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all active:scale-95"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                            <button
                                onClick={() => setViewingMonth(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))}
                                className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all active:scale-95"
                            >
                                <FontAwesomeIcon icon={faChevronRight} className="scale-75" />
                                <FontAwesomeIcon icon={faChevronRight} className="scale-75 -ml-1 opacity-40" />
                            </button>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-7 mb-10">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] py-4">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-6">
                            {days.map((date, idx) => {
                                if (!date) return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/10 rounded-3xl" />;

                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                const isToday = date.toDateString() === new Date().toDateString();
                                const dayActivities = data.filter(a => new Date(a.date).toDateString() === date.toDateString());

                                // Heat-Aware intensity calculations
                                const totalPulse = dayActivities.reduce((acc, curr) => acc + (curr.pulse || 10), 0);
                                const intensity = Math.min(totalPulse, 100);
                                const isBusy = totalPulse >= 50;

                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        onClick={() => setSelectedDate(date)}
                                        className={`aspect-square rounded-[2rem] p-6 cursor-pointer relative transition-all group border-2 ${isSelected ? 'bg-[#0a0a0b] border-[#0a0a0b] shadow-2xl scale-110 z-20' :
                                            isToday ? 'bg-white border-blue-600 shadow-xl' :
                                                'bg-white border-transparent shadow-sm hover:shadow-2xl hover:border-white'
                                            }`}
                                        style={!isSelected && dayActivities.length > 0 ? {
                                            backgroundColor: `rgba(59, 130, 246, ${intensity / 500 + 0.05})`,
                                            borderColor: isBusy ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                        } : {}}
                                    >
                                        <span className={`text-xl font-black leading-none ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                            {date.getDate()}
                                        </span>

                                        {dayActivities.length > 0 && (
                                            <>
                                                {/* Desktop Dots */}
                                                <div className="hidden lg:flex absolute bottom-6 left-6 -space-x-2 overflow-hidden">
                                                    {dayActivities.slice(0, 3).map((a, i) => (
                                                        <div
                                                            key={a.id}
                                                            className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-[#0a0a0b]' : 'border-white'} shadow-sm`}
                                                            style={{ backgroundColor: a.color, zIndex: 3 - i }}
                                                        />
                                                    ))}
                                                    {dayActivities.length > 3 && (
                                                        <div className={`w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center border-2 ${isSelected ? 'border-[#0a0a0b]' : 'border-white'}`}>
                                                            <span className="text-[7px] font-black text-gray-500">+{dayActivities.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Mobile Red Badge */}
                                                <div className="lg:hidden absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg scale-90">
                                                    <span className="text-[8px] font-black text-white leading-none">{dayActivities.length}</span>
                                                </div>
                                            </>
                                        )}

                                        {isBusy && !isSelected && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full animate-ping shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Tab Detail Flow */}
                {renderActivityDetail()}
            </div>
        );
    };

    return (
        <div className="premium-bg pb-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="premium-card w-12 h-12 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <p className="premium-label mb-0.5">Enterprise Intelligence</p>
                            <h1 className="premium-h1">Master Records</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="premium-btn-outline px-5 py-2.5 text-xs">
                            <FontAwesomeIcon icon={faSync} className="mr-2" />
                            Refresh
                        </button>
                        <button className="premium-btn-primary px-5 py-2.5 text-xs">
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <AnimatePresence>
                    {statistics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Trade Volume', value: statistics.tradeIns?.total, icon: faExchangeAlt, color: 'blue' },
                                { label: 'Revenue', value: formatCurrency(statistics.sales?.revenue), icon: faMoneyBillWave, color: 'emerald' },
                                { label: 'Profit', value: formatCurrency(statistics.sales?.profit), icon: faChartLine, color: 'blue' },
                                { label: 'Repairs', value: statistics.repairs?.total, icon: faTools, color: 'orange' }
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="premium-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all mb-3">
                                        <FontAwesomeIcon icon={s.icon} className="text-sm" />
                                    </div>
                                    <p className="premium-caption text-gray-500 mb-1">{s.label}</p>
                                    <p className="text-xl font-black text-gray-900 truncate">{s.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Business Health Index */}
            <AnimatePresence>
                {executiveInsights && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto px-4 md:px-8 mt-8"
                    >
                        <div className="bg-[#0a0a0b] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                                <div className="flex items-center gap-4 md:gap-6 md:border-r md:border-white/10 md:pr-8">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg">
                                        <FontAwesomeIcon icon={faBrain} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Health Score</p>
                                        <h3 className="text-3xl md:text-4xl font-black text-white leading-none">
                                            {executiveInsights.healthScore}<span className="text-xl text-white/40 ml-1">%</span>
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Growth Signals</p>
                                        <div className="space-y-2">
                                            {executiveInsights.growthSignals.map((signal, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    <p className="text-xs font-semibold text-white/90">{signal}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faLightbulb} className="text-blue-400 text-xs" />
                                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Insight</p>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed text-white/80 italic">"{executiveInsights.aiRecommendation}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
                {/* Navigation Tabs */}
                <div className="premium-card p-2 mb-8 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'calculator') {
                                        navigate('/stock-calculator');
                                    } else {
                                        setActiveTab(tab.id);
                                    }
                                }}
                                className={`px-5 py-3 rounded-xl transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-wider ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    {tab.isLucide ? (
                                        <Calculator className="w-4 h-4" />
                                    ) : (
                                        <FontAwesomeIcon icon={tab.icon} className="text-sm" />
                                    )}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="leading-none">{tab.label}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Ecosystem */}
                <div className="premium-card p-8 mb-10 border-white/60">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2 relative group">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder={`Filter ${activeTab} records by identifier...`}
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="premium-input pl-16 pr-6 bg-gray-50/50 focus:bg-white"
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto lg:overflow-visible no-scrollbar">
                            {activeTab === 'intelligence' && (
                                <div className="relative flex-1 min-w-[200px]">
                                    <FontAwesomeIcon icon={faUserShield} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <select
                                        value={userFilter}
                                        onChange={(e) => setUserFilter(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 bg-gray-50/50 rounded-[1.5rem] border-0 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-600/10 appearance-none cursor-pointer text-gray-700"
                                    >
                                        <option value="all">All Staff</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                        <FontAwesomeIcon icon={faChevronRight} className="rotate-90 scale-75" />
                                    </div>
                                </div>
                            )}
                            <div className="relative flex-1 min-w-[140px]">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-[1.5rem] border-0 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-600/10 text-gray-700"
                                />
                            </div>
                            <div className="relative flex-1 min-w-[140px]">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-[1.5rem] border-0 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-600/10 text-gray-700"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFilters({ search: '', status: '', dateFrom: '', dateTo: '' });
                                setUserFilter('all');
                            }}
                            className="premium-btn-primary py-4 text-[10px] shadow-lg"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* 🏆 Wanakitaa Hall of Fame Widget */}
                {activeTab === 'intelligence' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Champion of the Day', data: communityChampions.day, color: 'blue' },
                            { label: 'Hero of the Week', data: communityChampions.week, color: 'indigo' },
                            { label: 'Legend of the Month', data: communityChampions.month, color: 'purple' },
                            { label: 'Titan of the Year', data: communityChampions.year, color: 'amber' }
                        ].map((champion, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="premium-card p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-2xl transition-all border-white/60"
                            >
                                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg group-hover:rotate-12 transition-transform bg-${champion.color}-600`}>
                                    {champion.data?.customerName?.charAt(0) || '?'}
                                </div>
                                <h4 className="premium-label mb-2">{champion.label}</h4>
                                <p className="premium-h2 mb-1 truncate w-full text-base">{champion.data?.customerName || 'No Data Yet'}</p>
                                <p className="text-[11px] font-black text-blue-600 mt-1 uppercase tracking-tighter">{champion.data?.points || 0} Power Points</p>

                                <div className="absolute top-4 right-6 text-gray-100 opacity-20 text-3xl">
                                    <FontAwesomeIcon icon={faStar} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Intelligent Data Matrix */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loading Data...</p>
                            </div>
                        </div>
                    ) : activeTab === 'intelligence' ? (
                        renderCalendar()
                    ) : activeTab === 'tools' ? (
                        <div className="p-12">
                            <div className="flex items-center gap-8 mb-12">
                                <div className="w-20 h-20 bg-[#0a0a0b] rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
                                    <FontAwesomeIcon icon={faCogs} className="text-3xl text-white" />
                                </div>
                                <div>
                                    <p className="premium-label text-blue-600 mb-2">Access Management</p>
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">Business Tools</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* WhatsApp Templates Card */}
                                <motion.button
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    onClick={() => navigate('/settings/whatsapp')}
                                    className="premium-card p-10 hover:shadow-2xl transition-all text-left flex flex-col group relative overflow-hidden border-white"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#128c7e]/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform blur-3xl" />

                                    <div className="w-16 h-16 bg-[#128c7e] rounded-3xl flex items-center justify-center text-white text-3xl mb-8 shadow-xl shadow-[#128c7e]/20 group-hover:rotate-6 transition-transform">
                                        <FontAwesomeIcon icon={faWhatsapp} />
                                    </div>

                                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-3">WhatsApp Templates</h4>
                                    <p className="premium-label text-sm leading-relaxed mb-8 opacity-70">Customize automated Swahili & English message templates with real-time mobile vision integration.</p>

                                    <div className="mt-auto pt-8 border-t border-gray-100/50 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#128c7e]">Open Portal</span>
                                        <div className="w-10 h-10 bg-[#128c7e]/10 rounded-xl flex items-center justify-center text-[#128c7e] group-hover:translate-x-2 transition-transform">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                                        </div>
                                    </div>
                                </motion.button>

                                {/* Supplier Management Card */}
                                <motion.button
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    onClick={() => navigate('/suppliers')}
                                    className="premium-card p-10 hover:shadow-2xl transition-all text-left flex flex-col group relative overflow-hidden border-white"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform blur-3xl" />

                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl mb-8 shadow-xl shadow-indigo-600/20 group-hover:rotate-6 transition-transform">
                                        <FontAwesomeIcon icon={faTruck} />
                                    </div>

                                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-3">Supplier Network</h4>
                                    <p className="premium-label text-sm leading-relaxed mb-8 opacity-70">Manage supplier relationships, contact details, and payment terms for stock procurement.</p>

                                    <div className="mt-auto pt-8 border-t border-gray-100/50 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Open Portal</span>
                                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 group-hover:translate-x-2 transition-transform">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                                        </div>
                                    </div>
                                </motion.button>

                                {/* Stock Management Card */}
                                <motion.button
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    onClick={() => navigate('/stock-management')}
                                    className="premium-card p-10 hover:shadow-2xl transition-all text-left flex flex-col group relative overflow-hidden border-white"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform blur-3xl" />

                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center text-white text-3xl mb-8 shadow-xl shadow-blue-600/20 group-hover:rotate-6 transition-transform">
                                        <FontAwesomeIcon icon={faCubes} />
                                    </div>

                                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-3">Stock Management</h4>
                                    <p className="premium-label text-sm leading-relaxed mb-8 opacity-70">Manage product inventory, track devices with serial numbers, and monitor stock levels.</p>

                                    <div className="mt-auto pt-8 border-t border-gray-100/50 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Open Portal</span>
                                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:translate-x-2 transition-transform">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                                        </div>
                                    </div>
                                </motion.button>

                                {/* Stock Analytics Calculator Card */}
                                <motion.button
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    onClick={() => navigate('/stock-calculator')}
                                    className="premium-card p-10 hover:shadow-2xl transition-all text-left flex flex-col group relative overflow-hidden border-white"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform blur-3xl" />

                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mb-8 shadow-xl shadow-indigo-600/20 group-hover:rotate-6 transition-transform">
                                        <FontAwesomeIcon icon={faCalculator} />
                                    </div>

                                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-3">Stock Analytics</h4>
                                    <p className="premium-label text-sm leading-relaxed mb-8 opacity-70">Run granular stock analytics with AI intelligence. Calculate value, quantity and trends.</p>

                                    <div className="mt-auto pt-8 border-t border-gray-100/50 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Launch Intelligence</span>
                                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 group-hover:translate-x-2 transition-transform">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                                        </div>
                                    </div>
                                </motion.button>

                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-20">
                            <div>
                                <FontAwesomeIcon icon={faHistory} className="text-4xl text-gray-100 mb-6" />
                                <h3 className="text-xl font-black text-gray-900 mb-2">No Records Detected</h3>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Adjust filters to broaden registry scan</p>
                            </div>
                        </div>
                    ) : (
                        <div className="premium-card overflow-hidden border-white/60 mb-10 shadow-xl mx-8">
                            <div className="p-8 border-b border-gray-100/50 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                        <FontAwesomeIcon icon={tabs.find(t => t.id === activeTab)?.icon} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
                                            {tabs.find(t => t.id === activeTab)?.label} <span className="text-blue-600">Matrix</span>
                                        </h3>
                                        <p className="premium-label text-[10px] font-black uppercase tracking-widest opacity-60">Synchronized Signal Stream: {data.length} entries</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100/50">
                                            {activeTab === 'users' && (
                                                <>
                                                    <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Operator Identity</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Access Layer</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Vital Status</th>
                                                </>
                                            )}
                                            {activeTab === 'tradeIns' && (
                                                <>
                                                    <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Origin Client</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Device Spec</th>
                                                    <th className="px-6 py-5 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">Equity Value</th>
                                                    <th className="px-8 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Entry Status</th>
                                                </>
                                            )}
                                            {activeTab === 'sales' && (
                                                <>
                                                    <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Consumer / Agent</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Asset Transferred</th>
                                                    <th className="px-6 py-5 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">Final Ledger</th>
                                                    <th className="px-8 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Loop</th>
                                                </>
                                            )}
                                            {activeTab === 'repairs' && (
                                                <>
                                                    <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Service Client</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Technical Asset</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Anomaly Signature</th>
                                                    <th className="px-8 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Lifecycle</th>
                                                </>
                                            )}
                                            {activeTab === 'products' && (
                                                <>
                                                    <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Catalog Entry</th>
                                                    <th className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Market Health</th>
                                                    <th className="px-6 py-5 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">Reserve</th>
                                                    <th className="px-8 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Liquidity Value</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {data.map((item, index) => (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.01 }}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                {activeTab === 'users' && (
                                                    <>
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{item.name}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.email}</p>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
                                                                {item.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-sm' : 'bg-rose-50 text-rose-600 border-rose-100/50 shadow-sm'
                                                                }`}>
                                                                {item.isActive ? 'OPERATIONAL' : 'OFF-GRID'}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'tradeIns' && (
                                                    <>
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{item.customerName}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <p className="text-xs font-black text-gray-900 leading-none mb-1">{item.deviceInfo?.brand} {item.deviceInfo?.model}</p>
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{item.deviceInfo?.serial || 'SCAN_LOCK'}</p>
                                                        </td>
                                                        <td className="px-6 py-6 text-center">
                                                            <p className="text-sm font-black text-emerald-600">{formatCurrency(item.approvedValue)}</p>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50 shadow-sm animate-pulse'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'sales' && (
                                                    <>
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{item.customer?.name || 'GUEST'}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent: {item.staff?.name || 'SYS'}</p>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <p className="text-xs font-black text-gray-900">{item.product?.name || 'GENERIC_ASSET'}</p>
                                                        </td>
                                                        <td className="px-6 py-6 text-center">
                                                            <p className="text-sm font-black text-gray-900">{formatCurrency(item.totalAmount)}</p>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            {item.tradeInId ? (
                                                                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[8px] font-black uppercase tracking-widest border border-indigo-100/50 shadow-sm">
                                                                    Network Credit
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Direct Node</span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'repairs' && (
                                                    <>
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{item.customerName || 'VERIFIED_CLIENT'}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent: {item.staffName}</p>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <p className="text-xs font-black text-gray-900 leading-none mb-1">{item.deviceType} {item.deviceModel}</p>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter line-clamp-1">{item.problemDescription}</p>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <span className={`px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                                item.status === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-100/50 shadow-sm' :
                                                                    'bg-amber-50 text-amber-600 border-amber-100/50 shadow-sm animate-pulse'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'products' && (
                                                    <>
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{item.name}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.model} • {item.color}</p>
                                                        </td>
                                                        <td className="px-6 py-6 w-48">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                                    <div className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all" style={{ width: `${item.aiInsights?.healthScore || 0}%` }} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-gray-400">{item.aiInsights?.healthScore || 0}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 text-center">
                                                            <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${item.quantity > 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                                item.quantity > 0 ? 'bg-amber-50 text-amber-600 border-amber-100/50 shadow-sm' :
                                                                    'bg-rose-50 text-rose-600 border-rose-100/50 shadow-sm'
                                                                }`}>
                                                                {item.quantity} units
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <p className="text-sm font-black text-gray-900 leading-none mb-1">{formatCurrency(item.sellingPrice)}</p>
                                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{item.aiInsights?.priceOptimization}</p>
                                                        </td>
                                                    </>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ledger Insights */}
                {!loading && data.length > 0 && (
                    <div className="mt-8 bg-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                            <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-2xl">
                                <FontAwesomeIcon icon={faChartLine} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black tracking-tighter leading-none mb-1">Sector Overview</h4>
                                <p className="text-white font-black uppercase tracking-widest opacity-70 text-[10px]">Displaying top {data.length} records in current matrix</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Matrix Resolution</p>
                                <p className="text-lg font-black leading-none">{data.length} Signals</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CEODataDashboard;
