import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    faUsers, faArrowLeft, faTrophy, faCrown, faGem, faIdCard, faUserPlus, faPhone, faMapMarkerAlt,
    faHistory, faMoneyBillWave, faTools, faStar, faMedal, faSearch, faUserTie, faTimesCircle,
    faEdit, faSave, faExchangeAlt, faSync, faInfoCircle, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WanakitaaHub = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('community'); // 'community', 'leaderboard', 'enroll'
    const [period, setPeriod] = useState('month');
    const [customers, setCustomers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [tiers, setTiers] = useState([]);
    const [editingTiers, setEditingTiers] = useState(false);
    const [tempTiers, setTempTiers] = useState([]);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Enroll Form State
    const [enrollForm, setEnrollForm] = useState({ name: '', phone: '', email: '', address: '' });
    const [submitting, setSubmitting] = useState(false);
    const [enrollSuccess, setEnrollSuccess] = useState(false);

    useEffect(() => {
        fetchTiers();
        if (activeTab === 'community') fetchCustomers();
        if (activeTab === 'leaderboard') fetchLeaderboard();
    }, [activeTab, period]);

    const fetchTiers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/loyalty/tiers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiers(response.data.data);
            setTempTiers(response.data.data);
        } catch (err) {
            console.error('Fetch tiers error:', err);
        }
    };

    const handleUpdateTiers = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/loyalty/tiers`, { tiers: tempTiers }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiers(tempTiers);
            setEditingTiers(false);
            fetchCustomers();
            fetchLeaderboard();
        } catch (err) {
            alert('Update failed');
        }
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data.data.customers);
        } catch (err) {
            console.error('Fetch customers error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberHistory = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/loyalty/customer/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedMember(response.data.data);
        } catch (err) {
            console.error('Fetch history error:', err);
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/loyalty/leaderboard?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaderboard(response.data.data);
        } catch (err) {
            console.error('Fetch leaderboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/customers`, enrollForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrollSuccess(true);
            setTimeout(() => {
                setEnrollForm({ name: '', phone: '', email: '', address: '' });
                setEnrollSuccess(false);
                setActiveTab('community');
                fetchCustomers();
            }, 3000);
        } catch (err) {
            console.error('Enroll error:', err);
            alert('Enrollment failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSync = async () => {
        if (!window.confirm('This will award points for all historical Sales and Repairs. Proceed?')) return;
        setSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/loyalty/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message);
            fetchCustomers();
        } catch (err) {
            console.error('Sync error:', err);
            alert('Sync failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSyncing(false);
        }
    };

    const getTierColor = (tierName) => {
        const tier = tiers.find(t => t.name === tierName);
        return tier ? tier.color : '#94a3b8';
    };

    const isEliteTier = (tierName) => {
        return tierName === 'Wanakitaa Elite' || tierName === 'Mwanakitaa Elite';
    };

    const filteredCustomers = customers
        .filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery)
        )
        .sort((a, b) => (b.points || 0) - (a.points || 0)); // Sort by points descending

    return (
        <div className="premium-bg pb-20" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-3 md:px-8 pt-4 md:pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 mb-6 md:mb-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="premium-card w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all flex-shrink-0"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                        </button>
                        <div>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Customer Rewards & Loyalty</p>
                            <h1 className="text-xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Wanakitaa Hub</h1>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex gap-1.5 p-1.5 bg-gray-50 rounded-xl overflow-x-auto">
                        {[
                            { id: 'community', label: 'Members', icon: faIdCard },
                            { id: 'leaderboard', label: 'Leaderboard', icon: faTrophy },
                            { id: 'enroll', label: 'Enroll', icon: faUserPlus }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Community Engagement Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="premium-card p-3 md:p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center text-blue-600 mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faUsers} className="text-sm" />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900 mb-0.5 md:mb-1">{customers.length}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wide">Members</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="premium-card p-3 md:p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 rounded-lg md:rounded-xl flex items-center justify-center text-amber-600 mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faCrown} className="text-sm" />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900 mb-0.5 md:mb-1">{customers.filter(c => isEliteTier(c.tier)).length}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wide">Elite</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="premium-card p-3 md:p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faGem} className="text-sm" />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900 mb-0.5 md:mb-1">{customers.reduce((acc, c) => acc + (c.points || 0), 0).toLocaleString()}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wide">Points</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="premium-card p-3 md:p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 rounded-lg md:rounded-xl flex items-center justify-center text-rose-600 mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faHistory} className="text-sm" />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900 mb-0.5 md:mb-1">{Math.round(customers.reduce((acc, c) => acc + (c.points || 0), 0) / (customers.length || 1))}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wide">Avg</p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 md:px-8 mt-6 md:mt-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'community' && (
                        <motion.div
                            key="community"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Community Registry Ledger */}
                                <div className="flex-1">
                                    <div className="relative mb-10">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search Members (Name or Phone)..."
                                            className="w-full bg-white border border-black/5 rounded-[2rem] py-4 md:py-6 pl-16 md:pl-20 pr-6 md:pr-8 shadow-xl shadow-black/5 focus:outline-none font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredCustomers.map(member => (
                                            <motion.div
                                                key={member.id}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    fetchMemberHistory(member.id);
                                                }}
                                                className="premium-card p-6 flex items-center gap-6 cursor-pointer border-white group"
                                            >
                                                <div className="relative shrink-0">
                                                    <div
                                                        className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-white text-2xl font-black shadow-lg transition-transform group-hover:rotate-6"
                                                        style={{ backgroundColor: getTierColor(member.tier) }}
                                                    >
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    {(isEliteTier(member.tier) || member.tier === 'Balozi') && (
                                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-xl border border-amber-100 flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col">
                                                        <span className="premium-label text-[10px] opacity-40 mb-1">{member.phone}</span>
                                                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors truncate">{member.name}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <span
                                                            className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border"
                                                            style={{
                                                                backgroundColor: `${getTierColor(member.tier)}08`,
                                                                color: getTierColor(member.tier),
                                                                borderColor: `${getTierColor(member.tier)}20`
                                                            }}
                                                        >
                                                            {member.tier}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="text-2xl font-black text-gray-900 tracking-tighter">{(member.points || 0).toLocaleString()}</p>
                                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Points</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Member Insights Section */}
                                <div className="w-full lg:w-96 space-y-8">
                                    <div className="bg-[#0a0a0b] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/10">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                                <span className="premium-label text-[10px] text-white/40 tracking-[0.3em]">Loyalty Overview</span>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">TOTAL MEMBERS</p>
                                                        <p className="text-sm font-bold text-white/60">Registered Customers</p>
                                                    </div>
                                                    <p className="text-4xl font-black tracking-tighter">{customers.length}</p>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest mb-1">ELITE CORE</p>
                                                        <p className="text-sm font-bold text-white/60">Gold & Platinum Members</p>
                                                    </div>
                                                    <p className="text-4xl font-black text-amber-400 tracking-tighter">{customers.filter(c => isEliteTier(c.tier)).length}</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 md:mt-10 space-y-2 md:space-y-3">
                                                {['CEO', 'MANAGER'].includes(user.role) && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleSync}
                                                        disabled={syncing}
                                                        className="w-full py-3 md:py-4 bg-white/10 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center gap-2 md:gap-3 transition-all"
                                                    >
                                                        <FontAwesomeIcon icon={faSync} className={`${syncing ? 'animate-spin' : ''} text-indigo-400 text-sm`} />
                                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">{syncing ? 'Calculating...' : 'Recalculate Points'}</span>
                                                    </motion.button>
                                                )}

                                                {user.role === 'CEO' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(52, 211, 153, 0.15)' }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setEditingTiers(!editingTiers)}
                                                        className="w-full py-3 md:py-4 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20 flex items-center justify-center gap-2 md:gap-3 transition-all text-emerald-400"
                                                    >
                                                        <FontAwesomeIcon icon={editingTiers ? faSave : faEdit} className="text-sm" />
                                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">{editingTiers ? 'Save' : 'Manage Tiers'}</span>
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-[100px] opacity-20" />
                                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600 rounded-full blur-[100px] opacity-10" />
                                    </div>

                                    {/* Tier Identity Matrix Editor */}
                                    <AnimatePresence>
                                        {editingTiers && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, y: -20 }}
                                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                                exit={{ height: 0, opacity: 0, y: -20 }}
                                                className="premium-card p-8 border-emerald-500/20 shadow-emerald-500/5 overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                                        <FontAwesomeIcon icon={faShieldAlt} />
                                                    </div>
                                                    <h3 className="font-black text-gray-900 tracking-tighter uppercase text-sm">Tier Configuration</h3>
                                                </div>

                                                <div className="space-y-6">
                                                    {tempTiers.map((tier, idx) => (
                                                        <div key={idx} className="space-y-2">
                                                            <div className="flex justify-between items-center px-1">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level {idx + 1}</label>
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="premium-input w-full py-3"
                                                                value={tier.name}
                                                                onChange={(e) => {
                                                                    const newTiers = [...tempTiers];
                                                                    newTiers[idx].name = e.target.value;
                                                                    setTempTiers(newTiers);
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleUpdateTiers}
                                                        className="premium-btn-primary w-full py-5 text-[10px] shadow-emerald-500/20"
                                                    >
                                                        Save Tiers
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Loyalty System Guide */}
                                    <div className="premium-card p-8 border-indigo-500/10 shadow-indigo-500/5">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                            </div>
                                            <h3 className="font-black text-gray-900 tracking-tighter uppercase text-sm">Loyalty System</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-black/5 group hover:border-blue-500/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">POINTS FROM SALES</p>
                                                        <p className="text-[9px] font-bold text-gray-400">1 Point / TSH 5,000</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-black/5 group hover:border-purple-500/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                                        <FontAwesomeIcon icon={faTools} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">POINTS FROM REPAIRS</p>
                                                        <p className="text-[9px] font-bold text-gray-400">1 Point / TSH 2,000</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-black/5 group hover:border-amber-500/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                                        <FontAwesomeIcon icon={faStar} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">REVIEW BONUSES</p>
                                                        <p className="text-[9px] font-bold text-gray-400">20 Points Per Review</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl p-6 md:p-12 overflow-hidden border border-black/5 relative"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 relative z-10">
                                <div>
                                    <span className="premium-label text-amber-600 mb-1">Prestige Rankings</span>
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900">Hall of Fame</h2>
                                    <p className="text-gray-500 text-xs md:text-sm font-semibold mt-2">Celebrating our most active customers</p>
                                </div>

                                <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 rounded-xl">
                                    {['day', 'week', 'month', 'year'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all ${period === p
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {leaderboard.length > 0 ? (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                                    {/* Podium (Top 3) Rankings */}
                                    <div className="space-y-6">
                                        {leaderboard.slice(0, 3).map((champion, idx) => (
                                            <motion.div
                                                key={champion.customerId}
                                                whileHover={{ x: 10, scale: 1.02 }}
                                                className={`relative p-6 md:p-8 rounded-3xl border transition-all flex items-center gap-4 md:gap-8 ${idx === 0
                                                    ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-lg'
                                                    : idx === 1
                                                        ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100'
                                                        : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
                                                    }`}
                                            >
                                                <div className={`absolute -top-3 -left-3 w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg flex items-center justify-center font-black text-lg border-4 ${idx === 0 ? 'bg-amber-400 text-white border-white' : 'bg-white text-gray-900 border-gray-100'
                                                    }`}>
                                                    {idx + 1}
                                                </div>

                                                <div
                                                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-lg shrink-0"
                                                    style={{ backgroundColor: getTierColor(champion.tier) }}
                                                >
                                                    {champion.customerName.charAt(0)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg md:text-xl font-black text-gray-900 truncate">{champion.championName || champion.customerName}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                                                        <span className="text-sm md:text-base font-black text-indigo-600">{(champion.points || 0).toLocaleString()} <span className="text-xs opacity-60">PTS</span></span>
                                                        <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block" />
                                                        <span className="text-xs font-bold text-gray-500">{champion.tier}</span>
                                                    </div>
                                                </div>

                                                {idx === 0 && (
                                                    <div className="text-3xl md:text-4xl text-amber-400 shrink-0">
                                                        <FontAwesomeIcon icon={faCrown} />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Detailed Runner-ups */}
                                    <div className="bg-gray-50/50 rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-8 border border-gray-100">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 px-4">Loyalty Pursuit Lineage</p>
                                        <div className="space-y-4">
                                            {leaderboard.slice(3).map((member, idx) => (
                                                <div key={member.customerId} className="bg-white p-5 rounded-3xl flex items-center gap-4 shadow-sm border border-white hover:shadow-lg transition-all">
                                                    <span className="w-8 text-[11px] font-black text-gray-300">#{idx + 4}</span>
                                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 text-xs">
                                                        {member.customerName.charAt(0)}
                                                    </div>
                                                    <p className="font-bold text-gray-700">{member.customerName}</p>
                                                    <p className="ml-auto font-black text-gray-900">{member.points.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-32">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 opacity-50">
                                        <FontAwesomeIcon icon={faMedal} className="text-4xl" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">No Activity Found</h3>
                                    <p className="text-gray-400 mt-2 font-bold">Try selecting a different time period</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'enroll' && (
                        <motion.div
                            key="enroll"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl p-6 md:p-10 lg:p-16 border border-black/5 max-w-4xl mx-auto relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="text-center mb-10 md:mb-16">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-[1.8rem] flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-xl shadow-indigo-500/10">
                                        <FontAwesomeIcon icon={faUserPlus} className="text-3xl" />
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">Enroll New Member</h2>
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Add a new customer to the rewards system</p>
                                </div>

                                <form onSubmit={handleEnroll} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="premium-input w-full py-4 text-base"
                                                placeholder="Customer Full Name"
                                                value={enrollForm.name}
                                                onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="premium-input w-full py-4 text-base"
                                                placeholder="Mobile / WhatsApp"
                                                value={enrollForm.phone}
                                                onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={submitting}
                                            className="premium-btn-primary w-full py-3 md:py-4 text-sm md:text-base shadow-lg font-bold"
                                        >
                                            {submitting ? 'Adding...' : 'Confirm Enrollment'}
                                        </motion.button>
                                    </div>

                                    {enrollSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center justify-center gap-4 text-emerald-800 font-bold"
                                        >
                                            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                                <FontAwesomeIcon icon={faShieldAlt} />
                                            </div>
                                            Added Successfully. Returning to Member List...
                                        </motion.div>
                                    )}
                                </form>
                            </div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] opacity-30 -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-[120px] opacity-30 -ml-48 -mb-48" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Resident Dossier Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMember(null)}
                            className="absolute inset-0 bg-[#0a0a0b]/60 backdrop-blur-3xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden relative z-10 shadow-3xl border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Dossier Meta Header */}
                            <div className="relative h-44 md:h-56 bg-gradient-to-br from-[#0a0a0b] to-indigo-950 p-6 md:p-12 flex items-end">
                                <div className="absolute top-8 right-8">
                                    <motion.button
                                        whileHover={{ rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelectedMember(null)}
                                        className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white/50 hover:text-white transition-colors backdrop-blur-md"
                                    >
                                        <FontAwesomeIcon icon={faTimesCircle} />
                                    </motion.button>
                                </div>
                                <div className="flex items-center gap-6 md:gap-10 relative z-10 translate-y-10 md:translate-y-16">
                                    <div
                                        className="w-24 h-24 md:w-36 md:h-36 rounded-[2.2rem] md:rounded-[2.5rem] border-[8px] md:border-[10px] border-white flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl"
                                        style={{ backgroundColor: getTierColor(selectedMember.tier) }}
                                    >
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                    <div className="pb-4">
                                        <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg leading-none mb-2">{selectedMember.name}</h3>
                                        <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em]">Active Member</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                            </div>

                            {/* Member Detail Data */}
                            <div className="pt-16 md:pt-24 p-6 md:p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-black/5 hover:border-indigo-500/20 transition-all">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TOTAL POINTS</p>
                                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{(selectedMember.points || 0).toLocaleString()} <span className="text-[10px] text-indigo-600">POINTS</span></p>
                                    </div>
                                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-black/5 hover:border-amber-500/20 transition-all">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">CURRENT TIER</p>
                                        <p className="text-xl font-black tracking-tighter" style={{ color: getTierColor(selectedMember.tier) }}>{selectedMember.tier}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-black/5 hover:border-emerald-500/20 transition-all">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PHONE NUMBER</p>
                                        <p className="text-xl font-black text-gray-900 tracking-tighter truncate">{selectedMember.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity History</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] md:max-h-[350px] overflow-y-auto custom-scrollbar pr-2 md:pr-4">
                                        {selectedMember.history && selectedMember.history.length > 0 ? (
                                            selectedMember.history.map((record, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-black/5 group hover:border-black/10 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-xl ${record.type === 'EARNED' || record.type === 'sale' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                            }`}>
                                                            <FontAwesomeIcon icon={record.type === 'sale' ? faMoneyBillWave : record.type === 'repair' ? faTools : faSync} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                                {record.productName || record.repairDevice || record.description || 'System Engagement'}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                                {new Date(record.date || record.createdAt).toLocaleDateString()} • {record.staffName || 'Automated'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xl font-black tracking-tighter ${record.points > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {record.points > 0 ? '+' : ''}{(record.points || record.amount).toLocaleString()}
                                                        </p>
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tokens</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                                                    <FontAwesomeIcon icon={faHistory} className="text-2xl" />
                                                </div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Activity Records Found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WanakitaaHub;
