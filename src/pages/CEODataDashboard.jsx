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
    faStar, faLayerGroup, faCogs, faKey, faSync, faCalculator,
    faFingerprint, faBolt, faCrown
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { API_URL as API_BASE_URL } from '../utils/api';

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

            setData(response.data.data.items || []);
            setStatistics(response.data.data.statistics);
            setExecutiveInsights(response.data.data.executiveInsights);

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
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const getMonthName = (date) => date.toLocaleString('default', { month: 'long' });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const renderActivityDetail = () => {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full bg-[#111]/60 backdrop-blur-3xl border-l border-white/5 w-full lg:w-[450px] shadow-2xl relative z-10"
            >
                <div className="p-10 border-b border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">History</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">
                                {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long' })}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black text-white leading-none">
                                {activitiesForDate.length}
                            </span>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Recorded</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Value</p>
                            <p className="text-sm font-black text-white">
                                {formatCurrency(activitiesForDate.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0))}
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Activity Points</p>
                            <p className="text-sm font-black text-blue-500">
                                {activitiesForDate.reduce((acc, curr) => acc + (curr.pulse || 10), 0)} P
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative">
                    {activitiesForDate.length > 0 && (
                        <div className="absolute left-[59px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-blue-500/20 via-white/5 to-blue-500/20 rounded-full" />
                    )}

                    {activitiesForDate.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-24">
                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faCalendarDay} className="text-4xl text-white" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest text-[10px]">No activity detected</p>
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
                                <div className="flex flex-col items-center shrink-0">
                                    <span className="text-[8px] font-black text-white/40 mb-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 ring-4 ring-[#050505]"
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

                                <div
                                    onClick={() => {
                                        if (activity.type === 'repair') navigate(`/repairs/${activity.id.replace('repair-', '')}`);
                                    }}
                                    className="flex-1 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-blue-500/40 cursor-pointer group/card transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border" style={{ color: activity.color, borderColor: `${activity.color}20`, backgroundColor: `${activity.color}08` }}>
                                            {activity.category}
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                        </div>
                                    </div>

                                    <h4 className="text-[14px] font-black text-white leading-tight mb-1 uppercase tracking-tight">{activity.title}</h4>
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4 truncate">{activity.subtitle}</p>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {(activity.paymentMethod || activity.type === 'sale') && (
                                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1 text-center">Channel</p>
                                                <p className="text-[9px] font-black text-white text-center uppercase">{activity.paymentMethod || 'LIQUID'}</p>
                                            </div>
                                        )}
                                        {activity.type === 'repair' && (
                                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1 text-center">Diagnosis</p>
                                                <p className="text-[9px] font-black text-indigo-400 text-center truncate uppercase">{activity.diagnosis || 'Standard'}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex flex-col">
                                            {activity.value ? (
                                                <>
                                                    <span className="text-[11px] font-black text-white leading-none mb-1">{formatCurrency(activity.value)}</span>
                                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-60">Revenue Captured</span>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Live Update</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-[#00ffa3] border border-white/5">
                                                {activity.actor?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-white tracking-widest leading-none mb-0.5 uppercase">{activity.actor}</span>
                                                <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">{activity.actorRole}</span>
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
                <div className="flex-1 p-12 bg-white/2">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-[#00ffa3]/10 text-[#00ffa3] rounded-3xl flex items-center justify-center shadow-2xl rotate-2 border border-[#00ffa3]/20">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-500 mb-2 uppercase tracking-[0.3em]">Temporal Grid</p>
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">
                                    {getMonthName(viewingMonth)} <span className="text-white/10">{viewingMonth.getFullYear()}</span>
                                </h2>
                            </div>
                        </div>

                        <div className="flex gap-4 p-2 bg-[#111] rounded-3xl border border-white/5 shadow-inner">
                            <button
                                onClick={() => setViewingMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                className="w-14 h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-white/40 hover:text-blue-500 transition-all active:scale-95"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button
                                onClick={() => setViewingMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                className="w-14 h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-white/40 hover:text-blue-500 transition-all active:scale-95"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-7 mb-10">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.4em] py-4">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-6">
                            {days.map((date, idx) => {
                                if (!date) return <div key={`empty-${idx}`} className="aspect-square bg-white/2 rounded-3xl" />;

                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                const isToday = date.toDateString() === new Date().toDateString();
                                const dayActivities = data.filter(a => new Date(a.date).toDateString() === date.toDateString());

                                const totalPulse = dayActivities.reduce((acc, curr) => acc + (curr.pulse || 10), 0);
                                const intensity = Math.min(totalPulse, 100);
                                const isBusy = totalPulse >= 50;

                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        onClick={() => setSelectedDate(date)}
                                        className={`aspect-square rounded-[2rem] p-6 cursor-pointer relative transition-all group border-2 ${isSelected ? 'bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110 z-20' :
                                            isToday ? 'bg-blue-600 border-blue-600 shadow-xl' :
                                                'bg-[#111] border-transparent shadow-sm hover:shadow-2xl hover:border-white/20'
                                            }`}
                                        style={!isSelected && !isToday && dayActivities.length > 0 ? {
                                            backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                                            borderColor: isBusy ? 'rgba(59, 130, 246, 0.4)' : 'transparent'
                                        } : {}}
                                    >
                                        <span className={`text-xl font-black leading-none ${isSelected ? 'text-black' : 'text-white'}`}>
                                            {date.getDate()}
                                        </span>

                                        {dayActivities.length > 0 && (
                                            <div className="absolute bottom-6 left-6 -space-x-2 overflow-hidden flex">
                                                {dayActivities.slice(0, 3).map((a, i) => (
                                                    <div
                                                        key={a.id}
                                                        className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-white' : 'border-[#050505]'} shadow-sm`}
                                                        style={{ backgroundColor: a.color, zIndex: 3 - i }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {isBusy && !isSelected && !isToday && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-white rounded-full animate-ping" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {renderActivityDetail()}
            </div>
        );
    };

    if (loading && !data.length) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 border-4 border-[#00ffa3] border-t-transparent rounded-2xl mx-auto mb-8 shadow-[0_0_20px_rgba(0,255,163,0.3)]" />
                    <p className="text-[#00ffa3] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Master Terminal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 pt-12 selection:bg-[#00ffa3] selection:text-black">
            <div className="max-w-[95%] mx-auto px-6">
                {/* Elite Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16"
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/dashboard')}
                            className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-[#00ffa3] border border-white/5 transition-all"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Command Terminal</span>
                                <FontAwesomeIcon icon={faFingerprint} className="text-[#00ffa3] text-[10px]" />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-1 uppercase">Master Records</h1>
                            <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">Strategic Asset Management & Intelligence</p>
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <button onClick={loadData} className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-[#00ffa3] transition-all">
                            <FontAwesomeIcon icon={faSync} className="mr-2" /> Refresh Signal
                        </button>
                        <button className="px-6 py-3 bg-[#00ffa3] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,255,163,0.3)] hover:scale-105 transition-all">
                            <FontAwesomeIcon icon={faDownload} className="mr-2" /> Extract Data
                        </button>
                    </div>
                </motion.div>

                {/* Macro Statistics */}
                <AnimatePresence>
                    {statistics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Trade Volume', value: statistics.tradeIns?.total, icon: faExchangeAlt, color: '#3b82f6' },
                                { label: 'Aggregate Revenue', value: formatCurrency(statistics.sales?.revenue), icon: faMoneyBillWave, color: '#00ffa3' },
                                { label: 'Operational Yield', value: formatCurrency(statistics.sales?.profit), icon: faChartLine, color: '#a855f7' },
                                { label: 'Service Units', value: statistics.repairs?.total, icon: faTools, color: '#f59e0b' }
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors"></div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 mb-6 text-white/40 group-hover:text-white transition-all" style={{ color: s.color }}>
                                        <FontAwesomeIcon icon={s.icon} className="text-sm" />
                                    </div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                                    <p className="text-2xl font-black text-white tracking-tighter truncate">{s.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Neural Intelligence Hub */}
                <AnimatePresence>
                    {executiveInsights && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-[#111] to-[#0a0a0b] rounded-[4rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden mb-12"
                        >
                            <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-600/10 rounded-full blur-[120px] -mr-40" />

                            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                                <div className="flex items-center gap-8 lg:border-r lg:border-white/10 lg:pr-12">
                                    <div className="w-24 h-24 bg-[#00ffa3]/10 text-[#00ffa3] rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,163,0.1)] border border-[#00ffa3]/20">
                                        <FontAwesomeIcon icon={faBrain} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Neural Health Index</p>
                                        <h3 className="text-6xl font-black text-white tracking-tighter leading-none">
                                            {executiveInsights.healthScore}<span className="text-2xl text-white/20 ml-1">%</span>
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                                    <div className="space-y-6">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Convergence Signals</p>
                                        <div className="space-y-3">
                                            {executiveInsights.growthSignals.map((signal, idx) => (
                                                <div key={idx} className="flex items-center gap-4 group">
                                                    <div className="w-1.5 h-1.5 bg-[#00ffa3] rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(0,255,163,0.5)]" />
                                                    <p className="text-xs font-black text-white/80 uppercase tracking-widest leading-loose">{signal}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ffa3]/30 to-transparent"></div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <FontAwesomeIcon icon={faLightbulb} className="text-[#00ffa3] text-xs animate-pulse" />
                                            <p className="text-[9px] font-black text-[#00ffa3] uppercase tracking-[0.4em]">Heuristic Insight</p>
                                        </div>
                                        <p className="text-[13px] font-black leading-relaxed text-white/90 uppercase tracking-tight italic">"{executiveInsights.aiRecommendation}"</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Ecosystem */}
                <div className="bg-[#111]/40 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/5 mb-12 shadow-2xl sticky top-6 z-50">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => tab.id === 'calculator' ? navigate('/stock-calculator') : setActiveTab(tab.id)}
                                className={`px-8 py-4 rounded-2xl transition-all flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-[#00ffa3] text-black shadow-[0_10px_20px_rgba(0,255,163,0.3)]'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === tab.id ? 'bg-black/10' : 'bg-white/5'}`}>
                                    {tab.isLucide ? <Calculator className="w-4 h-4" /> : <FontAwesomeIcon icon={tab.icon} />}
                                </div>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Matrix */}
                <div className="bg-[#111]/80 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 shadow-2xl mb-12 transition-all">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2 relative group px-2">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ffa3] transition-colors" />
                            <input
                                type="text"
                                placeholder={`FILTER ${activeTab.toUpperCase()} RECORDS...`}
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-16 pr-8 py-5 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest focus:border-[#00ffa3]/40 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap lg:flex-nowrap gap-4 px-2">
                            {activeTab === 'intelligence' && (
                                <div className="relative flex-1 min-w-[200px]">
                                    <FontAwesomeIcon icon={faUserShield} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                    <select
                                        value={userFilter}
                                        onChange={(e) => setUserFilter(e.target.value)}
                                        className="w-full pl-14 pr-10 py-5 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest focus:border-blue-500/40 outline-none appearance-none cursor-pointer text-white"
                                    >
                                        <option value="all" className="bg-[#111]">ALL PERSONNEL</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id} className="bg-[#111]">{u.name.toUpperCase()} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="relative min-w-[150px] flex-1">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                    className="w-full pl-14 pr-4 py-5 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black text-white focus:border-blue-500/40 outline-none"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setFilters({ search: '', status: '', dateFrom: '', dateTo: '' });
                                setUserFilter('all');
                            }}
                            className="bg-white/5 border border-white/5 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all"
                        >
                            Reset Sequence
                        </motion.button>
                    </div>
                </div>

                {/* Champion Leaderboard Matrix */}
                {activeTab === 'intelligence' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Champion of Day', data: communityChampions.day, color: '#3b82f6' },
                            { label: 'Hero of Week', data: communityChampions.week, color: '#6366f1' },
                            { label: 'Legend of Month', data: communityChampions.month, color: '#a855f7' },
                            { label: 'Titan of Year', data: communityChampions.year, color: '#f59e0b' }
                        ].map((champion, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#111]/40 p-8 flex flex-col items-center text-center relative overflow-hidden group hover:bg-[#111] transition-all border border-white/5 rounded-[3rem] shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -mr-16 -mt-16 group-hover:bg-white/5 transition-colors blur-2xl"></div>
                                <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6 shadow-2xl group-hover:rotate-12 transition-transform border border-white/10" style={{ backgroundColor: champion.color }}>
                                    {champion.data?.customerName?.charAt(0) || '?'}
                                </div>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">{champion.label}</p>
                                <h4 className="text-xl font-black text-white tracking-widest truncate w-full uppercase">{champion.data?.customerName || 'No Data Signal'}</h4>
                                <p className="text-[10px] font-black text-blue-500 mt-2 uppercase tracking-tighter">{champion.data?.points || 0} Power Points</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Terminal Display */}
                <div className="bg-[#111]/40 rounded-[4rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden relative min-h-[600px]">
                    {activeTab === 'intelligence' ? (
                        renderCalendar()
                    ) : activeTab === 'tools' ? (
                        <div className="p-16 lg:p-24">
                            <div className="flex items-center gap-8 mb-16">
                                <div className="w-20 h-20 bg-[#00ffa3]/10 text-[#00ffa3] rounded-[2.5rem] flex items-center justify-center border border-[#00ffa3]/20 shadow-2xl rotate-3">
                                    <FontAwesomeIcon icon={faCogs} className="text-3xl" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 mb-2 uppercase tracking-[0.4em]">Integrated Subsystems</p>
                                    <h3 className="text-5xl font-black text-white tracking-tighter uppercase">Protocol Control</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    { label: 'WA TEMPLATES', desc: 'Real-time mobile vision & automated Swahili messaging.', path: '/settings/whatsapp', icon: faWhatsapp, bg: '#128c7e' },
                                    { label: 'SUPPLIER HUB', desc: 'Logistics chain & relationship terminal management.', path: '/suppliers', icon: faTruck, bg: '#3b82f6' },
                                    { label: 'STOCK MATRIX', desc: 'Serial tracking & inventory flow state monitoring.', path: '/stock-management', icon: faCubes, bg: '#f43f5e' }
                                ].map((t, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ y: -10, scale: 1.02 }}
                                        onClick={() => navigate(t.path)}
                                        className="bg-[#111] p-12 rounded-[3.5rem] hover:shadow-2xl transition-all text-left flex flex-col group relative overflow-hidden border border-white/5"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/2 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform blur-3xl opacity-20" />
                                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl mb-10 shadow-2xl group-hover:rotate-6 transition-transform border border-white/5" style={{ backgroundColor: t.bg }}>
                                            <FontAwesomeIcon icon={t.icon} />
                                        </div>
                                        <h4 className="text-2xl font-black text-white tracking-widest mb-4 uppercase">{t.label}</h4>
                                        <p className="text-[11px] font-black text-white/30 tracking-widest leading-loose mb-10 uppercase">{t.desc}</p>
                                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white transition-colors">Access Portal</span>
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:translate-x-2 group-hover:text-white transition-all">
                                                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 lg:p-24 overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Record Block</th>
                                        <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Primary Actor</th>
                                        <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">State Status</th>
                                        <th className="py-8 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] text-right">Value Flux</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/2">
                                    {data.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/2 transition-colors group">
                                            <td className="py-8 px-4">
                                                <div className="text-xs font-black text-white tracking-tight uppercase group-hover:text-[#00ffa3] transition-colors">{item.name || item.title || 'Unknown Entity'}</div>
                                                <div className="text-[9px] font-black text-white/20 uppercase mt-1 tracking-widest">{item.subtitle || item.id}</div>
                                            </td>
                                            <td className="py-8 px-4">
                                                <div className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest">{item.actor || 'System Engine'}</div>
                                                <div className="text-[8px] font-bold text-white/10 mt-1 uppercase">Personnel ID</div>
                                            </td>
                                            <td className="py-8 px-4">
                                                <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{item.status || 'Verified'}</span>
                                            </td>
                                            <td className="py-8 px-4 text-right">
                                                <div className="text-base font-black text-white tracking-tighter">{item.value ? formatCurrency(item.value) : '---'}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!data || data.length === 0) && (
                                <div className="py-40 text-center opacity-10">
                                    <FontAwesomeIcon icon={faFingerprint} className="text-8xl mb-8" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Zero Intersection Detected</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CEODataDashboard;
