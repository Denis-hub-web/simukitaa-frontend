import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, MessageSquareText } from 'lucide-react';
import { customerVoiceAPI } from '../utils/api';

const emptyQuestion = () => ({ id: `question_${Date.now()}`, label: '', type: 'text', required: true, options: [], order: 1, active: true });

const CustomerVoiceAdmin = () => {
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [settings, responseList] = await Promise.all([
            customerVoiceAPI.getSettings(),
            customerVoiceAPI.getResponses()
        ]);
        setQuestions(settings.data.data.questions || []);
        setResponses(responseList.data.data || []);
    };

    const updateQuestion = (index, patch) => setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...patch } : q));
    const removeQuestion = (index) => setQuestions(prev => prev.filter((_, i) => i !== index));

    const save = async () => {
        setSaving(true);
        try {
            await customerVoiceAPI.updateSettings(questions.map((q, index) => ({ ...q, order: index + 1 })));
            alert('Questions saved');
            loadData();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Office Kiosk</p>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-950">Customer Voice</h1>
                        <p className="text-slate-500 font-semibold mt-2">Customize the questions customers answer on the office device.</p>
                    </div>
                    <div className="flex gap-3">
                        <a href="/customer-voice" target="_blank" className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-black text-slate-700 hover:bg-slate-100">Open Kiosk</a>
                        <button onClick={save} disabled={saving} className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black shadow-lg flex items-center gap-2">
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-black text-slate-900">Questions</h2>
                            <button onClick={() => setQuestions(prev => [...prev, { ...emptyQuestion(), order: prev.length + 1 }])} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-black flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        <div className="space-y-4">
                            {questions.map((question, index) => (
                                <motion.div key={question.id || index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_90px_auto] gap-3">
                                        <input value={question.label} onChange={e => updateQuestion(index, { label: e.target.value })} placeholder="Question" className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100" />
                                        <select value={question.type} onChange={e => updateQuestion(index, { type: e.target.value })} className="p-3 rounded-xl border border-slate-200">
                                            <option value="text">Text</option>
                                            <option value="select">Choices</option>
                                            <option value="rating">Rating</option>
                                        </select>
                                        <label className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
                                            <input type="checkbox" checked={question.required !== false} onChange={e => updateQuestion(index, { required: e.target.checked })} /> Required
                                        </label>
                                        <button onClick={() => removeQuestion(index)} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {question.type === 'select' && (
                                        <input value={(question.options || []).join(', ')} onChange={e => updateQuestion(index, { options: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} placeholder="Options separated by comma" className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><MessageSquareText className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Recent Responses</h2>
                                <p className="text-xs font-bold text-slate-400">{responses.length} total response(s)</p>
                            </div>
                        </div>
                        <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                            {responses.slice(0, 30).map(response => (
                                <div key={response.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="flex justify-between gap-3 mb-3">
                                        <div className="font-black text-slate-900">{response.customerName || 'Anonymous'}</div>
                                        <div className="text-xs font-bold text-slate-400">{new Date(response.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(response.answers || {}).map(([key, value]) => (
                                            <div key={key} className="text-sm flex justify-between gap-4 border-t border-slate-200 pt-2">
                                                <span className="text-slate-400 font-bold truncate">{questions.find(q => q.id === key)?.label || key}</span>
                                                <span className="text-slate-800 font-black text-right">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerVoiceAdmin;
