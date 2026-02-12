import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPlus, faUsers, faPaperPlane, faChartLine,
    faCheckCircle, faClock, faExclamationCircle, faEye, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const CampaignManager = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, sent, scheduled

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [campaignsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/campaigns`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/campaigns/stats`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setCampaigns(campaignsRes.data.data.campaigns || []);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            sent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            draft: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return colors[status] || colors.draft;
    };

    const getStatusIcon = (status) => {
        const icons = {
            sent: faCheckCircle,
            scheduled: faClock,
            draft: faExclamationCircle
        };
        return icons[status] || faExclamationCircle;
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaign Manager</h1>
                                <p className="text-sm text-gray-500 mt-0.5">Send targeted messages to customer segments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/campaigns/create')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Create Campaign
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-1">{stats?.totalCampaigns || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Campaigns Created</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faPaperPlane} className="text-emerald-600 text-xl" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sent</span>
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-1">{stats?.totalMessagesSent || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Messages Delivered</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faChartLine} className="text-indigo-600 text-xl" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rate</span>
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-1">{stats?.averageDeliveryRate || 0}%</h3>
                        <p className="text-sm text-gray-500 font-medium">Delivery Success</p>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-6">
                    {[
                        { id: 'all', label: 'All Campaigns' },
                        { id: 'sent', label: 'Sent' },
                        { id: 'scheduled', label: 'Scheduled' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f.id
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Campaign List */}
                <div className="space-y-4">
                    {filteredCampaigns.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faUsers} className="text-gray-300 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns yet</h3>
                            <p className="text-gray-500 mb-6">Create your first campaign to reach customers</p>
                            <button
                                onClick={() => navigate('/campaigns/create')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Create Campaign
                            </button>
                        </div>
                    ) : (
                        filteredCampaigns.map((campaign, index) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all cursor-pointer"
                                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusColor(campaign.status)}`}>
                                                <FontAwesomeIcon icon={getStatusIcon(campaign.status)} className="mr-1.5" />
                                                {campaign.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {campaign.description && (
                                            <p className="text-sm text-gray-500 mb-3">{campaign.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                                                <span className="font-medium text-gray-700">{campaign.targetCount} recipients</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                                                <span className="text-gray-500">
                                                    {new Date(campaign.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg uppercase">
                                                    {campaign.channel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/campaigns/${campaign.id}`);
                                        }}
                                        className="ml-4 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                </div>

                                {/* Delivery Stats */}
                                {campaign.deliveryStats && campaign.status === 'sent' && (
                                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{campaign.deliveryStats.queued}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Queued</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-emerald-600">{campaign.deliveryStats.sent}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Sent</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-indigo-600">{campaign.deliveryStats.delivered}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Delivered</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-rose-600">{campaign.deliveryStats.failed}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Failed</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignManager;
