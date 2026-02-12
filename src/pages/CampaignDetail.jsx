import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUsers, faPaperPlane, faCheckCircle,
    faExclamationCircle, faCalendar, faEnvelope, faCommentDots, faSms
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCampaign();
    }, [id]);

    const loadCampaign = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/campaigns/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCampaign(res.data.data.campaign);
        } catch (error) {
            console.error('Error loading campaign:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChannelIcon = (channel) => {
        const icons = {
            whatsapp: faCommentDots,
            email: faEnvelope,
            sms: faSms
        };
        return icons[channel] || faEnvelope;
    };

    const getStatusColor = (status) => {
        const colors = {
            sent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            draft: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return colors[status] || colors.draft;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</p>
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="text-blue-600 hover:underline font-bold"
                    >
                        Back to Campaigns
                    </button>
                </div>
            </div>
        );
    }

    const deliveryRate = campaign.deliveryStats.sent > 0
        ? ((campaign.deliveryStats.delivered / campaign.deliveryStats.sent) * 100).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{campaign.name}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Campaign Details</p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${getStatusColor(campaign.status)}`}>
                            {campaign.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Main Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl mb-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Audience</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">{campaign.targetCount}</p>
                                    <p className="text-sm text-gray-500">Customers</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Channel</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={getChannelIcon(campaign.channel)} className="text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 capitalize">{campaign.channel}</p>
                                    <p className="text-sm text-gray-500">Platform</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Created Date</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCalendar} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(campaign.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {campaign.description && (
                        <div className="p-4 bg-gray-50 rounded-xl mb-6">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                            <p className="text-gray-700">{campaign.description}</p>
                        </div>
                    )}

                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Message Content</p>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{campaign.message}</p>
                    </div>
                </motion.div>

                {/* Delivery Statistics */}
                {campaign.status === 'sent' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl mb-6"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Statistics</h2>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <p className="text-2xl font-black text-blue-600">{campaign.deliveryStats.queued}</p>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Queued</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <p className="text-2xl font-black text-emerald-600">{campaign.deliveryStats.sent}</p>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sent</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <p className="text-2xl font-black text-indigo-600">{campaign.deliveryStats.delivered}</p>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivered</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <p className="text-2xl font-black text-rose-600">{campaign.deliveryStats.failed}</p>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failed</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <p className="text-2xl font-black text-purple-600">{deliveryRate}%</p>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Success Rate</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Recipients List */}
                {campaign.recipientDetails && campaign.recipientDetails.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recipients ({campaign.recipientDetails.length})</h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {campaign.recipientDetails.map((recipient, index) => (
                                <div
                                    key={recipient.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                                >
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                        {recipient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{recipient.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{recipient.phone}</p>
                                    </div>
                                    {recipient.email && (
                                        <p className="text-sm text-gray-500 hidden md:block">{recipient.email}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CampaignDetail;
