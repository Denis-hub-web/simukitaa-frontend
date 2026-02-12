import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faArrowLeft, faCompass } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden text-white">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-red-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10 max-w-lg"
            >
                <div className="w-24 h-24 bg-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl">
                    <FontAwesomeIcon icon={faCompass} className="text-4xl text-red-500" />
                </div>
                <h1 className="text-8xl font-black tracking-tighter mb-4">404</h1>
                <p className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-8">Page Not Found</p>
                <p className="text-sm font-bold text-white/60 mb-12 uppercase tracking-widest leading-relaxed">The requested page does not exist in the system database. Return to the Dashboard immediately.</p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-10 py-5 bg-white text-[#0a0a0b] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-3" />
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default NotFound;
