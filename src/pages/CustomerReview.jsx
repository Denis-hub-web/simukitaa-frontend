
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faCheckCircle, faCircleNotch, faQuoteLeft, faHeart, faSparkles } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import confetti from 'canvas-confetti';

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

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            confetti({
                particleCount: 3,
                angle: randomInRange(55, 125),
                spread: randomInRange(50, 70),
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FF6347', '#00a884', '#FFFFFF']
            });
        }, 20);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Tafadhali chagua nyota angalau moja.');
            return;
        }

        setStatus('submitting');
        try {
            await axios.post(`${API_URL}/reviews/t/${token}`, { rating, comment });
            triggerConfetti();
            setTimeout(() => setStatus('completed'), 500);
        } catch (error) {
            setStatus('ready');
            alert('Imeshindwa kutuma. Tafadhali jaribu tena.');
        }
    };

    const getEmojiForRating = (stars) => {
        if (stars === 0) return '';
        if (stars <= 2) return '😞';
        if (stars === 3) return '😊';
        if (stars === 4) return '😄';
        return '🤩';
    };

    const getRatingText = (stars) => {
        if (stars === 0) return '';
        if (stars <= 2) return 'Tunajua tunaweza kufanya vizuri zaidi';
        if (stars === 3) return 'Asante! Tutajitahidi zaidi';
        if (stars === 4) return 'Nzuri! Tunafurahi';
        return 'Bora kabisa! Asante sana!';
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#008069] via-[#00a884] to-[#00695c] flex items-center justify-center p-6">
                <div className="text-center">
                    <FontAwesomeIcon icon={faCircleNotch} className="text-white text-5xl animate-spin mb-4" />
                    <p className="text-white/60 font-medium">Inapakia...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#008069] via-[#00a884] to-[#00695c] flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/15 backdrop-blur-2xl border border-white/30 p-10 rounded-[3rem] shadow-2xl text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-5xl">😔</span>
                    </div>
                    <h2 className="text-white font-black text-3xl mb-4">Poleni Sana!</h2>
                    <p className="text-white/70 font-medium mb-8 text-lg">{errorMessage}</p>
                    <button onClick={() => window.close()} className="bg-white text-[#008069] font-black py-5 px-10 rounded-2xl w-full shadow-xl hover:scale-105 transition-transform">
                        Funga
                    </button>
                </motion.div>
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#008069] via-[#00a884] to-[#00695c] flex items-center justify-center p-6 overflow-hidden relative">
                {/* Animated background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400/10 rounded-full -ml-40 -mb-40 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-ping" style={{ animationDuration: '3s' }}></div>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    className="bg-white/15 backdrop-blur-3xl border border-white/40 p-12 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] text-center max-w-md relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                        className="w-28 h-28 bg-gradient-to-br from-white to-white/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[#008069] text-6xl" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-2 -right-2"
                        >
                            <FontAwesomeIcon icon={faSparkles} className="text-yellow-400 text-2xl" />
                        </motion.div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white font-black text-5xl mb-6 tracking-tight"
                    >
                        Asante Sana! 🎉
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/80 text-xl font-medium mb-8 leading-relaxed"
                    >
                        Tumepokea maoni yako. Tunathamini sana muda wako na tunaahidi kuendelea kuboresha huduma zetu kwa ajili yako.
                    </motion.p>

                    <div className="flex items-center justify-center gap-3 mb-8">
                        <FontAwesomeIcon icon={faHeart} className="text-red-400 text-2xl animate-pulse" />
                        <div className="h-1 w-24 bg-white/30 rounded-full"></div>
                        <FontAwesomeIcon icon={faHeart} className="text-red-400 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    <p className="text-white/50 text-sm font-black uppercase tracking-widest">
                        Karibu Tena SimuKitaa 📱✨
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#008069] via-[#00a884] to-[#00695c] flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
            {/* Animated Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-2xl relative z-10"
            >
                {/* Brand Header */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-white font-black text-6xl md:text-7xl tracking-tighter mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        SIMUKITAA
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '120px' }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-3"
                    />
                    <p className="text-white/70 font-black uppercase tracking-[0.4em] text-xs">Voice of the Customer</p>
                </div>

                {/* Main Glass Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/15 backdrop-blur-3xl border border-white/30 rounded-[4rem] p-8 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative overflow-hidden"
                >
                    {/* Decorative glow */}
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring' }}
                            className="inline-block bg-white/25 backdrop-blur-md px-8 py-3 rounded-full mb-10 border border-white/20 shadow-lg"
                        >
                            <span className="text-white font-black text-sm uppercase tracking-widest">
                                Huduma: {reviewData?.type === 'sale' ? 'MANUNUZI 🛍️' : 'MATENGENEZO 🔧'}
                            </span>
                        </motion.div>

                        <h2 className="text-white font-black text-3xl md:text-5xl mb-6 leading-tight drop-shadow-lg">
                            Umependezwa na huduma yetu?
                        </h2>
                        <p className="text-white/80 text-xl mb-14 font-medium">
                            Tafadhali tupa maoni yako kwa kuchagua nyota hapa chini.
                        </p>

                        {/* Star Rating with animations */}
                        <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.3, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(star)}
                                    className="relative transition-all duration-200"
                                >
                                    <FontAwesomeIcon
                                        icon={(hover || rating) >= star ? faStarSolid : faStarRegular}
                                        className={`text-5xl md:text-7xl transition-all duration-200 ${(hover || rating) >= star
                                                ? 'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] animate-pulse'
                                                : 'text-white/30'
                                            }`}
                                        style={{
                                            filter: (hover || rating) >= star ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.6))' : 'none'
                                        }}
                                    />
                                </motion.button>
                            ))}
                        </div>

                        {/* Rating feedback */}
                        <AnimatePresence>
                            {(rating > 0 || hover > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-12"
                                >
                                    <div className="text-6xl mb-3">{getEmojiForRating(hover || rating)}</div>
                                    <p className="text-white font-bold text-xl">{getRatingText(hover || rating)}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Comment Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative mb-12 group"
                        >
                            <div className="absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br from-[#008069] to-[#00a884] rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 transform -rotate-12 group-hover:rotate-0 transition-transform">
                                <FontAwesomeIcon icon={faQuoteLeft} className="text-white text-xl" />
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Andika maoni yako hapa (Hiari)..."
                                maxLength={500}
                                className="w-full bg-white/10 border-2 border-white/20 rounded-[2.5rem] p-10 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all font-medium min-h-[200px] text-lg resize-none shadow-inner focus:shadow-[inset_0_0_30px_rgba(255,255,255,0.1)]"
                            />
                            <div className="text-right mt-2 text-white/50 text-sm font-medium">
                                {comment.length}/500
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            disabled={status === 'submitting'}
                            onClick={handleSubmit}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative w-full ${status === 'submitting' ? 'bg-gray-400' : 'bg-gradient-to-r from-white to-white/90'
                                } py-7 px-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden transition-all`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className={`relative text-2xl font-black uppercase tracking-widest ${status === 'submitting' ? 'text-gray-100' : 'text-[#008069]'}`}>
                                {status === 'submitting' ? (
                                    <>
                                        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-3" />
                                        Inatuma...
                                    </>
                                ) : (
                                    'Tuma Maoni Yangu 🚀'
                                )}
                            </span>
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-14"
                >
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">
                        System Version 2.0 • SimuKitaa Tech Center
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CustomerReview;
