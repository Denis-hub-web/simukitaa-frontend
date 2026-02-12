import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faShoppingCart, faWrench, faBox, faTruck,
    faEnvelope, faCommentDots, faSms, faCheck, faToggleOn, faToggleOff,
    faClock, faCheckCircle, faExclamationCircle, faUsers, faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const NotificationTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('sales');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedTemplate) {
            setSubject(selectedTemplate.subject || '');
            setMessage(selectedTemplate.message || '');
            setChannels(selectedTemplate.channels || []);
            setIsActive(selectedTemplate.active !== false);
        }
    }, [selectedTemplate]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [templatesRes, categoriesRes] = await Promise.all([
                axios.get(`${API_URL}/notification-templates`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/notification-templates/categories`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const templatesData = templatesRes.data.data.templates || [];
            setTemplates(templatesData);
            setCategories(categoriesRes.data.data.categories || []);

            // Select first template by default
            const firstTemplate = templatesData.find(t => t.category === selectedCategory) || templatesData[0];
            setSelectedTemplate(firstTemplate);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/notification-templates/${selectedTemplate.id}`,
                { subject, message, channels, active: isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Reload templates
            await loadData();

            // Show success feedback
            const successDiv = document.getElementById('success-toast');
            if (successDiv) {
                successDiv.classList.remove('hidden');
                setTimeout(() => successDiv.classList.add('hidden'), 3000);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = (variable) => {
        const textarea = document.getElementById('message-textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.substring(0, start) + `{${variable}}` + message.substring(end);
        setMessage(newMessage);

        // Set cursor position after inserted variable
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
        }, 0);
    };

    const toggleChannel = (channel) => {
        setChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    const getCategoryIcon = (cat) => {
        const icons = {
            sales: faShoppingCart,
            repairs: faWrench,
            inventory: faBox,
            delivery: faTruck,
            'trade-ins': faExchangeAlt
        };
        return icons[cat] || faEnvelope;
    };

    const filteredTemplates = templates.filter(t => t.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Templates</h1>
                                    <p className="text-sm text-gray-500 mt-0.5">Customize your system notifications</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/notification-preferences')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                User Preferences
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                    {templates.length} Templates Active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Category Pills */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat.id);
                                const firstTemplate = templates.find(t => t.category === cat.id);
                                setSelectedTemplate(firstTemplate);
                            }}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <FontAwesomeIcon icon={getCategoryIcon(cat.id)} className="mr-2" />
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Template List */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                            {filteredTemplates.length} Templates
                        </h2>
                        {filteredTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className={`w-full text-left p-5 rounded-2xl transition-all ${selectedTemplate?.id === template.id
                                    ? 'bg-white ring-2 ring-gray-900 shadow-lg'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <p className="font-bold text-gray-900 text-sm">{template.name}</p>
                                    {template.active ? (
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-sm" />
                                    ) : (
                                        <FontAwesomeIcon icon={faExclamationCircle} className="text-gray-300 text-sm" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {template.channels.map(ch => (
                                        <span key={ch} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase">
                                            {ch}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Editor - Main Focus Area */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                        {selectedTemplate && (
                            <motion.div
                                key={selectedTemplate.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-8 space-y-8"
                            >
                                {/* Status Toggle */}
                                <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Template Status</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {isActive ? 'Active - notifications will be sent' : 'Disabled - notifications paused'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsActive(!isActive)}
                                        className={`w-16 h-8 rounded-full transition-all flex items-center ${isActive ? 'bg-emerald-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isActive ? 'translate-x-9' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Subject Line
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-0 py-3 text-lg font-medium border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors outline-none"
                                        placeholder="Enter subject..."
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Message Body
                                    </label>
                                    <textarea
                                        id="message-textarea"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={10}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors outline-none resize-none leading-relaxed rounded-2xl"
                                        placeholder="Type your message..."
                                    />
                                </div>

                                {/* Variables */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Insert Variables
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.variables.map(variable => (
                                            <button
                                                key={variable}
                                                onClick={() => insertVariable(variable)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl text-sm font-bold hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200"
                                            >
                                                {`{${variable}}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Channels */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Delivery Channels
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['whatsapp', 'email', 'sms'].map(channel => (
                                            <button
                                                key={channel}
                                                onClick={() => toggleChannel(channel)}
                                                className={`p-4 rounded-xl text-sm font-bold transition-all border-2 ${channels.includes(channel)
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                                    }`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={channel === 'whatsapp' ? faCommentDots : channel === 'email' ? faEnvelope : faSms}
                                                    className="mb-2 text-lg"
                                                />
                                                <div className="text-xs">{channel.charAt(0).toUpperCase() + channel.slice(1)}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-bold text-lg hover:from-black hover:to-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                    >
                                        {saving ? 'Saving Changes...' : 'Save Template'}
                                    </button>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>Last updated: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className="font-mono text-gray-300">ID: {selectedTemplate.id}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            <div id="success-toast" className="hidden fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
                <div>
                    <p className="font-bold">Template Saved!</p>
                    <p className="text-xs opacity-90">Changes applied successfully</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationTemplates;
