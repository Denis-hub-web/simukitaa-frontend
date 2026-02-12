import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave, faArrowLeft, faEdit, faLayerGroup,
    faMobileAlt, faInfoCircle, faUndo, faLanguage, faCheckCircle,
    faChevronRight, faCopy
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WhatsAppTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({ swahili: '', english: '' });
    const [previewLang, setPreviewLang] = useState('swahili'); // 'swahili' or 'english'
    const [status, setStatus] = useState(null);

    const API_BASE = 'http://localhost:5000/api/settings/whatsapp';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(API_BASE, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setTemplates(res.data.data);
                if (res.data.data.length > 0) {
                    handleSelectTemplate(res.data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setEditData({
            swahili: template.swahili,
            english: template.english
        });
        setStatus(null);
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setSaving(true);
        try {
            const res = await axios.put(`${API_BASE}/${selectedTemplate.id}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStatus('success');
                // Update local list
                setTemplates(templates.map(t => t.id === selectedTemplate.id ? { ...t, ...editData } : t));
                setTimeout(() => setStatus(null), 3000);
            }
        } catch (error) {
            console.error('Save failed:', error);
            setStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const renderPreview = (text) => {
        if (!text) return 'No content';

        // Simple variable replacement for preview
        let preview = text;
        const mockVars = {
            customerName: 'Joram Kishoka',
            productName: 'iPhone 17 Pro Max',
            totalAmount: '3,500,000',
            deviceType: 'Screentest iPhone',
            deviceModel: '15 Pro',
            transitCode: 'TRN-KITAA-X',
            estimatedTime: '2 Hours',
            itemType: 'Device',
            deliveryNumber: 'DEL-2026-001',
            verificationCode: '778899'
        };

        Object.entries(mockVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            preview = preview.replace(regex, `<span class="text-blue-500 font-bold">${value}</span>`);
        });

        return <div dangerouslySetInnerHTML={{ __html: preview.replace(/\n/g, '<br/>') }} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#008069] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-24 font-['Inter',system-ui,sans-serif]">
            {/* Mega Header */}
            <div className="bg-gradient-to-r from-[#075e54] via-[#128c7e] to-[#075e54] relative overflow-hidden pb-12 pt-4 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 hover:scale-110 active:scale-90"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <p className="text-white/70 font-black uppercase tracking-[0.3em] text-[10px] mb-1">Communication Core</p>
                            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                                WhatsApp Procedures
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-white/10">v2.0 Beta</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Catalog Dashboard */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/40 overflow-hidden">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-[#128c7e]" />
                                    Template Flux
                                </h2>
                                <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-lg text-gray-500 uppercase">{templates.length} Modules</span>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => handleSelectTemplate(tpl)}
                                        className={`w-full group/item text-left p-4 rounded-3xl transition-all border ${selectedTemplate?.id === tpl.id
                                            ? 'bg-gray-900 border-gray-900 shadow-xl scale-[1.02]'
                                            : 'bg-white/50 border-gray-100 hover:border-[#128c7e]/30 hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedTemplate?.id === tpl.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {tpl.category}
                                            </span>
                                            {selectedTemplate?.id === tpl.id && (
                                                <FontAwesomeIcon icon={faChevronRight} className="text-white/50 text-xs" />
                                            )}
                                        </div>
                                        <h3 className={`font-black text-sm tracking-tight mb-1 ${selectedTemplate?.id === tpl.id ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {tpl.name}
                                        </h3>
                                        <p className={`text-[10px] truncate ${selectedTemplate?.id === tpl.id ? 'text-white/60' : 'text-gray-500'
                                            }`}>
                                            {tpl.swahili || tpl.english}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Variable Data */}
                        <div className="bg-[#128c7e] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-125 transition-transform">
                                <FontAwesomeIcon icon={faInfoCircle} size="4x" />
                            </div>
                            <h4 className="text-lg font-black tracking-tighter mb-4">Variable System</h4>
                            <div className="space-y-3">
                                {selectedTemplate?.variables.map(v => (
                                    <div key={v} className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                                        <code className="text-xs font-black text-white/90">{"{{"}{v}{"}}"}</code>
                                        <FontAwesomeIcon icon={faCopy} className="text-[10px] ml-auto opacity-0 group-hover:opacity-50" />
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-[10px] font-bold text-white/70 uppercase tracking-widest leading-relaxed">
                                Variables are dynamic markers. The engine replaces them with real transaction data at runtime.
                            </p>
                        </div>
                    </div>

                    {/* Editor Matrix */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[3rem] p-4 shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Script Management</h2>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Editing: {selectedTemplate?.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewLang('swahili')}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewLang === 'swahili' ? 'bg-[#128c7e] text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            Swahili
                                        </button>
                                        <button
                                            onClick={() => setPreviewLang('english')}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewLang === 'english' ? 'bg-[#128c7e] text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            English
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <div className="flex items-center justify-between mb-3 px-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FontAwesomeIcon icon={faLanguage} className="text-[#128c7e]" />
                                                Swahili Overlay
                                            </span>
                                        </div>
                                        <textarea
                                            value={editData.swahili}
                                            onChange={(e) => setEditData({ ...editData, swahili: e.target.value })}
                                            className="w-full min-h-[160px] bg-gray-50/50 rounded-3xl p-6 text-sm font-medium text-gray-800 border-2 border-transparent focus:border-[#128c7e]/20 focus:bg-white transition-all outline-none resize-none shadow-inner"
                                            placeholder="Write Swahili version..."
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="flex items-center justify-between mb-3 px-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FontAwesomeIcon icon={faLanguage} className="text-blue-500" />
                                                English Primary
                                            </span>
                                        </div>
                                        <textarea
                                            value={editData.english}
                                            onChange={(e) => setEditData({ ...editData, english: e.target.value })}
                                            className="w-full min-h-[160px] bg-gray-50/50 rounded-3xl p-6 text-sm font-medium text-gray-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all outline-none resize-none shadow-inner"
                                            placeholder="Write English version..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={saving ? faUndo : faSave} className={saving ? 'animate-spin' : ''} />
                                        {saving ? 'Syncing...' : 'Authorize Template Update'}
                                    </button>

                                    <AnimatePresence>
                                        {status && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl ${status === 'success' ? 'bg-[#128c7e] text-white' : 'bg-red-500 text-white'
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={status === 'success' ? faCheckCircle : faInfoCircle} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Mobile Vision Preview */}
                            <div className="w-full md:w-[320px] bg-gray-900/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-center border-l border-gray-100 border-t md:border-t-0">
                                <div className="flex items-center gap-2 mb-6 text-gray-400">
                                    <FontAwesomeIcon icon={faMobileAlt} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Mobile Vision</span>
                                </div>

                                <div className="w-full aspect-[9/16] bg-[#e5ddd5] rounded-[2rem] border-[4px] border-gray-900 relative shadow-2xl overflow-hidden max-w-[240px]">
                                    {/* Phone Bezel Top */}
                                    <div className="absolute top-0 w-full h-5 bg-gray-900 flex justify-center pt-1 z-20">
                                        <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                                    </div>

                                    {/* WhatsApp UI Header */}
                                    <div className="bg-[#075e54] p-3 pt-6 flex items-center gap-2 z-10 relative">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faWhatsapp} className="text-white text-[10px]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-white leading-none">SIMUKITAA Official</p>
                                            <p className="text-[6px] text-white/70 uppercase font-black">System Status</p>
                                        </div>
                                    </div>

                                    {/* Message Flow */}
                                    <div className="p-3 space-y-4 overflow-y-auto max-h-[280px] custom-scrollbar">
                                        <div className="bg-white/90 p-3 rounded-2xl rounded-tl-none shadow-sm relative border-l-4 border-[#128c7e]">
                                            <div className="text-[10px] text-gray-800 leading-relaxed font-medium">
                                                {renderPreview(editData[previewLang])}
                                            </div>
                                            <div className="text-right mt-1">
                                                <span className="text-[6px] text-gray-400 uppercase font-black">10:45 • Viewed</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input Sim */}
                                    <div className="absolute bottom-0 w-full p-2 bg-white/80 backdrop-blur-md flex items-center gap-2">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full px-3 text-[8px] flex items-center text-gray-400">Message...</div>
                                        <div className="w-6 h-6 bg-[#075e54] rounded-full flex items-center justify-center text-white">
                                            <FontAwesomeIcon icon={faEdit} className="text-[8px]" />
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-6 text-[8px] font-black text-gray-400 uppercase tracking-widest text-center px-4 leading-relaxed">
                                    Simulating {previewLang} payload delivery on standard AOS/iOS interface.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default WhatsAppTemplates;
