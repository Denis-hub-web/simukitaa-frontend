
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faCheckCircle, faCircleNotch, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerReview = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, ready, submitting, completed, error
    const [reviewData, setReviewData] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await axios.get(`${API_URL}/reviews/t/${token}`);
                if (response.data.success) {
                    setReviewData(response.data.data);
                    setStatus('ready');
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage(error.response?.data?.message || 'Kiungo hiki hakifanyi kazi.');
            }
        };
        fetchReview();
    }, [token]);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Tafadhali chagua nyota angalau moja.');
            return;
        }

        setStatus('submitting');
        try {
            await axios.post(`${API_URL}/reviews/t/${token}`, { rating, comment });
            setStatus('completed');
        } catch (error) {
            setStatus('ready');
            alert('Imeshindwa kutuma. Tafadhali jaribu tena.');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#008069] flex items-center justify-center p-6">
                <FontAwesomeIcon icon={faCircleNotch} className="text-white text-4xl animate-spin" />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-[#008069] flex items-center justify-center p-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm">
                    <h2 className="text-white font-black text-2xl mb-4">Poleni Sana!</h2>
                    <p className="text-white/80 font-medium mb-6">{errorMessage}</p>
                    <button onClick={() => window.close()} className="bg-white text-[#008069] font-black py-4 px-8 rounded-2xl w-full shadow-xl">Funga</button>
                </div>
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#008069] via-[#00a884] to-[#008069] flex items-center justify-center p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/10 backdrop-blur-3xl border border-white/30 p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] text-center max-w-md relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[#008069] text-5xl" />
                    </motion.div>
                    <h2 className="text-white font-black text-4xl mb-4 tracking-tighter">Asante Sana!</h2>
                    <p className="text-white/80 text-lg font-medium mb-8 leading-relaxed">
                        Tumepokea maoni yako. Tunathamini sana muda wako na tunaahidi kuendelea kuboresha huduma zetu kwa ajili yako.
                    </p>
                    <div className="h-1 w-20 bg-white/20 mx-auto mb-8 rounded-full"></div>
                    <p className="text-white/50 text-sm font-black uppercase tracking-widest">Karibu Tena SimuKitaa 📱✨</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#008069] via-[#00a884] to-[#008069] flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-4 h-4 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 right-20 w-8 h-8 bg-white rounded-full animate-bounce"></div>
                <div className="absolute bottom-1/4 left-1/2 w-6 h-6 bg-white rounded-full animate-ping"></div>
            </div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-2xl"
            >
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <h1 className="text-white font-black text-5xl tracking-tighter mb-2">SIMUKITAA</h1>
                    <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs">Voice of the Customer</p>
                </div>

                {/* Main Glass Card */}
                <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3.5rem] p-8 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="relative z-10 text-center">
                        <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full mb-8 border border-white/10">
                            <span className="text-white font-black text-xs uppercase tracking-widest">Huduma: {reviewData?.type === 'sale' ? 'MANUNUZI' : 'MATENGENEZO'}</span>
                        </div>

                        <h2 className="text-white font-black text-3xl md:text-4xl mb-4 leading-tight">Umependezwa na huduma yetu?</h2>
                        <p className="text-white/70 text-lg mb-12 font-medium">Tafadhali tupa maoni yako kwa kuchagua nyota hapa chini.</p>

                        {/* Star Rating */}
                        <div className="flex items-center justify-center gap-4 mb-14">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(star)}
                                    className="relative transition-all duration-300 transform"
                                    style={{ transform: hover === star || rating === star ? 'scale(1.3)' : 'scale(1)' }}
                                >
                                    <FontAwesomeIcon
                                        icon={(hover || rating) >= star ? faStarSolid : faStarRegular}
                                        className={`text-5xl md:text-6xl ${(hover || rating) >= star ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'text-white/30'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Comment Section using Swahili */}
                        <div className="relative mb-12 group">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#008069] rounded-2xl flex items-center justify-center shadow-xl border border-white/10 transform -rotate-12">
                                <FontAwesomeIcon icon={faQuoteLeft} className="text-white text-lg" />
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Andika maoni yako hapa (Hiari)..."
                                className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-8 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-medium min-h-[180px] text-lg resize-none shadow-inner"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={status === 'submitting'}
                            onClick={handleSubmit}
                            className={`group relative w-full ${status === 'submitting' ? 'bg-gray-400' : 'bg-white'} py-6 px-10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all active:scale-[0.98]`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className={`text-xl font-black uppercase tracking-widest ${status === 'submitting' ? 'text-gray-100' : 'text-[#008069]'}`}>
                                {status === 'submitting' ? (
                                    <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                                ) : 'Tuma Maoni Yangu 🚀'}
                            </span>
                        </button>
                    </div>

                    {/* Decorative Card Element */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">System Version 2.0 • SimuKitaa Tech Center</p>
                </div>
            </motion.div>
        </div>
    );
};

export default CustomerReview;
