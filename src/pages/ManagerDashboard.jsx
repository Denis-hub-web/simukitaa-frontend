import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUsers, faChartLine, faTrophy,
    faMoneyBillWave, faStar, faBoxOpen, faLightbulb,
    faShieldAlt, faUserTie, faChevronRight, faCalendarAlt,
    faCrown, faFingerprint, faBolt, faHistory, faCubes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../utils/api';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        loadTeamPerformance();
    }, []);

    const loadTeamPerformance = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/manager/team-performance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeamData(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load team performance:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (user?.role === 'MANAGER') return '••••••';
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const isCEO = user?.role === 'CEO';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 border-4 border-[#00ffa3] border-t-transparent rounded-2xl mx-auto mb-8 shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                    />
                    <p className="text-[#00ffa3] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Accessing Leadership Terminal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 selection:bg-[#00ffa3] selection:text-black">
            {/* Ultra-Premium Leadership Header */}
            <div className="relative pt-12 pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#00ffa3]/5 rounded-full blur-[150px] -mr-[20%] -mt-[10%]"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -ml-[10%] -mb-[10%]"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
                        <div className="flex items-center gap-8">
                            <motion.button
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/dashboard')}
                                className="w-16 h-16 bg-[#111] rounded-[1.5rem] flex items-center justify-center text-white/40 hover:text-[#00ffa3] border border-white/5 transition-all shadow-2xl"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                            </motion.button>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-[#00ffa3]/10 text-[#00ffa3] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00ffa3]/20">Management Console</span>
                                    <FontAwesomeIcon icon={faShieldAlt} className="text-[#00ffa3] text-[10px]" />
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter text-white">Ops Control</h1>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Personnel Oversight & Tactical Data</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-[#111]/80 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-[#00ffa3] text-xs" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                />
                                <span className="text-white/20 text-[10px] font-black mx-1">TO</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="bg-transparent text-white text-[11px] font-black uppercase outline-none"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/analytics')}
                                className="bg-[#00ffa3] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_10px_30px_rgba(0,255,163,0.3)]"
                            >
                                <FontAwesomeIcon icon={faChartLine} />
                                <span>Advanced Reports</span>
                            </motion.button>
                        </div>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            { label: 'Team Capacity', value: teamData?.team?.length || 0, sub: 'Active Personnel', icon: faUsers, color: '#3b82f6' },
                            { label: 'Sales Velocity', value: teamData?.team?.reduce((acc, curr) => acc + curr.salesCount, 0) || 0, sub: 'Closed Signals', icon: faBolt, color: '#00ffa3' },
                            { label: 'Operational Revenue', value: formatCurrency(teamData?.totalTeamRevenue || 0), sub: 'Financial Flow', icon: faMoneyBillWave, color: '#10b981', restricted: !isCEO },
                            { label: 'Elite Performer', value: teamData?.topPerformer?.name?.split(' ')[0] || 'N/A', sub: 'Performance Lead', icon: faCrown, color: '#f59e0b' }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 relative group overflow-hidden shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-[#00ffa3]/5"></div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 transition-transform group-hover:scale-110 duration-500" style={{ color: s.color }}>
                                        <FontAwesomeIcon icon={s.icon} className="text-2xl" />
                                    </div>
                                    <FontAwesomeIcon icon={faFingerprint} className="text-white/5 text-xl" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                                <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">
                                    {s.restricted ? '••••••' : s.value}
                                </h3>
                                <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">{s.sub}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
                {/* Elite Performer Spotlight */}
                <AnimatePresence>
                    {teamData?.topPerformer && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111]/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-[#f59e0b]/20 mb-12 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[120px] -mr-64 -mt-64 transition-opacity group-hover:opacity-100 opacity-50" />
                            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-[#f59e0b]/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all"></div>
                                    <div className="relative w-32 h-32 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-[2.5rem] flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform duration-700">
                                        <FontAwesomeIcon icon={faTrophy} className="text-black text-5xl" />
                                    </div>
                                </div>
                                <div className="flex-1 text-center lg:text-left">
                                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                        <h3 className="text-4xl font-black text-white tracking-tighter leading-none">Elite Performance Lead</h3>
                                        <span className="px-4 py-1.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-[#f59e0b]/20 shadow-lg">Lvl Master</span>
                                    </div>
                                    <p className="text-3xl font-black text-white/90 mb-6 tracking-tight leading-none uppercase">{teamData.topPerformer.name}</p>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/40">
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest leading-none mb-1">Activity</p>
                                                <p className="text-lg font-black text-white">{teamData.topPerformer.salesCount} Signals Closed</p>
                                            </div>
                                        </div>
                                        {isCEO && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/40">
                                                    <FontAwesomeIcon icon={faChartLine} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-[#00ffa3] uppercase tracking-widest leading-none mb-1">Financial Impact</p>
                                                    <p className="text-lg font-black text-white">{formatCurrency(teamData.topPerformer.revenue)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-6 bg-white text-black rounded-[2.2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all"
                                >
                                    View dossier
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Performance Matrix Terminal */}
                <div className="bg-[#111]/40 backdrop-blur-3xl rounded-[4.5rem] p-16 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ffa3]/20 to-transparent"></div>

                    <div className="flex items-center justify-between mb-16 relative z-10">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 leading-none uppercase">Personnel Performance Matrix</h2>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Integrated Real-time Human Asset Analysis</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-[#00ffa3]/5 rounded-xl border border-[#00ffa3]/10">
                                <span className="w-2.5 h-2.5 bg-[#00ffa3] rounded-full animate-ping shadow-[0_0_10px_#00ffa3]" />
                                <span className="text-[10px] font-black text-[#00ffa3] uppercase tracking-widest">Neural Link Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 relative z-10">
                        {teamData?.team?.map((member, index) => (
                            <motion.div
                                key={member.id}
                                variants={itemVariants}
                                whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.02)' }}
                                className="group p-10 rounded-[3.5rem] bg-white/1 border border-white/5 transition-all flex flex-col lg:flex-row items-center gap-12"
                            >
                                <div className={`relative w-20 h-20 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl border border-white/5 transition-all duration-500 overflow-hidden ${index === 0 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                                    index === 1 ? 'bg-white/10 text-white/60' :
                                        index === 2 ? 'bg-orange-500/10 text-orange-500' :
                                            'bg-white/2 text-white/10'
                                    }`}>
                                    {index < 3 ? (
                                        <FontAwesomeIcon icon={faCrown} className="text-3xl relative z-10" />
                                    ) : (
                                        <span className="font-black text-xl relative z-10">#{index + 1}</span>
                                    )}
                                    <div className="absolute bottom-0 w-full h-1 bg-current opacity-50"></div>
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
                                        <div className="text-center lg:text-left mb-6 lg:mb-0">
                                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2 group-hover:text-[#00ffa3] transition-colors uppercase">{member.name}</h3>
                                            <div className="flex items-center justify-center lg:justify-start gap-3">
                                                <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest border border-white/5">{member.role}</span>
                                                <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">{member.salesCount} Signals</span>
                                            </div>
                                        </div>
                                        <div className="text-center lg:text-right">
                                            {isCEO && (
                                                <p className="text-2xl font-black text-white tracking-tighter leading-none mb-2">{formatCurrency(member.revenue)}</p>
                                            )}
                                            <div className="flex items-center justify-center lg:justify-end gap-2 text-[#00ffa3]">
                                                <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Elite</p>
                                            </div>
                                        </div>
                                    </div>

                                    {member.salesCount > 0 && isCEO && (
                                        <div className="relative group/bar">
                                            <div className="bg-white/2 rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((member.revenue / (teamData.totalTeamRevenue || 1)) * 100, 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className={`absolute inset-y-0 left-0 rounded-full shadow-[0_0_15px_rgba(0,255,163,0.3)] ${index === 0 ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]' :
                                                        'bg-gradient-to-r from-[#00ffa3] to-blue-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-end px-4 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">{Math.round((member.revenue / (teamData.totalTeamRevenue || 1)) * 100)}% Efficiency</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <motion.div
                                    whileHover={{ rotate: 90, scale: 1.2 }}
                                    className="shrink-0 flex items-center justify-center w-16 h-16 bg-[#111] rounded-[1.5rem] border border-white/5 group-hover:border-[#00ffa3]/50 group-hover:text-[#00ffa3] text-white/10 transition-all cursor-pointer shadow-2xl"
                                >
                                    <FontAwesomeIcon icon={faArrowRight} className="text-lg" />
                                </motion.div>
                            </motion.div>
                        ))}

                        {(!teamData?.team || teamData.team.length === 0) && (
                            <div className="py-40 text-center opacity-20">
                                <FontAwesomeIcon icon={faCubes} className="text-8xl mb-10" />
                                <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-4 text-center">No Signals Detected</h3>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.5em]">System is waiting for operational personnel sync</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
