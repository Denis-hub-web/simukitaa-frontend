import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUsers, faChartLine, faTrophy,
    faMoneyBillWave, faStar, faBoxOpen, faLightbulb,
    faShieldAlt, faUserTie, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingAI, setGeneratingAI] = useState(false);

    // Get user for role checking
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadTeamPerformance();
    }, []);

    const loadTeamPerformance = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/manager/team-performance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeamData(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load team performance:', error);
            setLoading(false);
        }
    };

    const generateAIRecommendations = async () => {
        try {
            setGeneratingAI(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/manager/ai-recommendations`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ AI Analysis Active: Recommendations generated for leadership oversight.');
            setGeneratingAI(false);
        } catch (error) {
            alert('❌ Analysis Error: AI synthesis failed.');
            setGeneratingAI(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency', currency: 'TZS', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Team Performance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-24">
            {/* Premium Global Header */}
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
                                <p className="white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">Operations Center</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Team Management</h1>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/technicians')}
                                className="bg-white/10 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/20 transition-all"
                            >
                                <FontAwesomeIcon icon={faUserTie} />
                                <span className="hidden sm:inline">Staff Directory</span>
                            </button>
                            <button
                                onClick={generateAIRecommendations}
                                disabled={generatingAI}
                                className="bg-white text-[#008069] px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faLightbulb} className={generatingAI ? 'animate-pulse' : ''} />
                                <span className="hidden sm:inline">{generatingAI ? 'Analyzing...' : 'Strategic AI Insights'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Team Size', value: teamData?.team?.length || 0, icon: faUsers, color: 'blue' },
                            { label: 'Sales Revenue', value: formatCurrency(teamData?.totalTeamRevenue || 0), icon: faMoneyBillWave, color: 'green', restricted: true },
                            { label: 'Top Performer', value: teamData?.topPerformer?.name?.split(' ')[0] || 'N/A', icon: faTrophy, color: 'amber' }
                        ].filter(s => !s.restricted || user?.role === 'CEO').map((s, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <FontAwesomeIcon icon={s.icon} className="text-white/80 text-[10px]" />
                                    <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <p className="text-lg text-white font-black leading-none truncate">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Elite Performer Highlight */}
                <AnimatePresence>
                    {teamData?.topPerformer && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 mb-8 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl transform group-hover:rotate-12 transition-transform">
                                    <FontAwesomeIcon icon={faTrophy} className="text-white text-4xl" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Top Team Performer</h3>
                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">Top Agent</span>
                                    </div>
                                    <p className="text-xl font-black text-gray-800 mb-2">{teamData.topPerformer.name}</p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBoxOpen} className="text-gray-300 text-xs" />
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{teamData.topPerformer.salesCount} Sales</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBoxOpen} className="text-gray-300 text-xs" />
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{teamData.topPerformer.salesCount} Sales</p>
                                        </div>
                                        {user?.role === 'CEO' && (
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faChartLine} className="text-green-500 text-xs" />
                                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{formatCurrency(teamData.topPerformer.revenue)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">View Performance Details</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Performance Matrix */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Team Performance Dashboard</h2>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Real-time performance metrics</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-[#008069] uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            Live
                        </div>
                    </div>

                    <div className="space-y-4">
                        {teamData?.team?.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-6 rounded-[2rem] hover:bg-gray-50/80 transition-all border-2 border-transparent hover:border-gray-100 flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${index === 0 ? 'bg-amber-50 text-amber-600' :
                                    index === 1 ? 'bg-gray-50 text-gray-400' :
                                        index === 2 ? 'bg-orange-50 text-orange-600' :
                                            'bg-white text-gray-200 border border-gray-100'
                                    }`}>
                                    {index < 3 ? (
                                        <FontAwesomeIcon icon={faTrophy} className="text-xl" />
                                    ) : (
                                        <span className="font-black text-xs">#{index + 1}</span>
                                    )}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                        <div className="text-center md:text-left mb-4 md:mb-0">
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1 group-hover:text-[#008069] transition-colors">{member.name}</h3>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{member.role}</p>
                                        </div>
                                        <div className="text-center md:text-right">
                                            {user?.role === 'CEO' && (
                                                <p className="text-lg font-black text-gray-900 leading-none mb-1">{formatCurrency(member.revenue)}</p>
                                            )}
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{member.salesCount} Sales Completed</p>
                                        </div>
                                    </div>

                                    {member.salesCount > 0 && user?.role === 'CEO' && (
                                        <div className="bg-gray-100/50 rounded-full h-2 overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((member.revenue / (teamData.totalTeamRevenue || 1)) * 100, 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`absolute inset-y-0 left-0 rounded-full ${index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                                    'bg-gradient-to-r from-[#008069] to-[#00a884]'
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-white rounded-2xl border border-gray-100 group-hover:bg-[#008069] group-hover:text-white transition-all cursor-pointer shadow-sm">
                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                </div>
                            </motion.div>
                        ))}

                        {(!teamData?.team || teamData.team.length === 0) && (
                            <div className="py-20 text-center">
                                <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-100 mb-6" />
                                <h3 className="text-xl font-black text-gray-900 mb-2">No Performance Data</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No personnel records found for the current period</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
