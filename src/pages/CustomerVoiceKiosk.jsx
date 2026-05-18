import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquareHeart, Send } from 'lucide-react';
import { customerVoiceAPI } from '../utils/api';

const CustomerVoiceKiosk = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const response = await customerVoiceAPI.getQuestions();
            setQuestions(response.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await customerVoiceAPI.submitResponse({ customerName, customerPhone, answers, deviceLabel: 'office-kiosk' });
            setDone(true);
            setAnswers({});
            setCustomerName('');
            setCustomerPhone('');
            setTimeout(() => setDone(false), 3500);
        } catch (error) {
            alert(error.response?.data?.message || 'Please complete the form');
        } finally {
            setSubmitting(false);
        }
    };

    const renderQuestion = (question) => {
        if (question.type === 'rating') {
            return (
                <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(value => (
                        <button key={value} type="button" onClick={() => setAnswers(prev => ({ ...prev, [question.id]: value }))} className={`h-16 rounded-2xl font-black text-xl transition-all ${answers[question.id] === value ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50'}`}>
                            {value}
                        </button>
                    ))}
                </div>
            );
        }

        if (question.type === 'select') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(question.options || []).map(option => (
                        <button key={option} type="button" onClick={() => setAnswers(prev => ({ ...prev, [question.id]: option }))} className={`p-4 rounded-2xl text-left font-bold transition-all border ${answers[question.id] === option ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'}`}>
                            {option}
                        </button>
                    ))}
                </div>
            );
        }

        return <input className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100" value={answers[question.id] || ''} onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))} placeholder="Type your answer" />;
    };

    if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 font-bold">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 md:p-10 flex items-center justify-center">
            <div className="w-full max-w-4xl">
                <div className="text-center text-white mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center mb-5">
                        <MessageSquareHeart className="w-10 h-10 text-indigo-200" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.35em] text-indigo-200 font-black">SimuKitaa Customer Voice</p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-3">Tell us about your visit</h1>
                    <p className="text-white/60 font-semibold mt-3">Your answer helps us serve you better.</p>
                </div>

                <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-2xl space-y-7">
                    {done && (
                        <div className="p-6 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center gap-4 font-black">
                            <CheckCircle2 className="w-7 h-7" /> Thank you. Your response has been recorded.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your name (optional)" />
                        <input className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number (optional)" />
                    </div>

                    {questions.map(question => (
                        <div key={question.id} className="space-y-3">
                            <label className="block text-lg font-black text-slate-900">{question.label}{question.required && <span className="text-rose-500"> *</span>}</label>
                            {renderQuestion(question)}
                        </div>
                    ))}

                    <button disabled={submitting} className="w-full py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                        {submitting ? 'Sending...' : 'Submit Feedback'} <Send className="w-5 h-5" />
                    </button>
                </motion.form>
            </div>
        </div>
    );
};

export default CustomerVoiceKiosk;
