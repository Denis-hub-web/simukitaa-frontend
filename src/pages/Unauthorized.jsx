import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faArrowLeft, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden text-white">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#008069]/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10 max-w-lg"
            >
                <div className="w-24 h-24 bg-[#008069]/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-[#008069]/30 shadow-2xl">
                    <FontAwesomeIcon icon={faUserLock} className="text-4xl text-[#008069]" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-4">ACCESS DENIED</h1>
                <p className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-8">Access Restricted</p>
                <p className="text-sm font-bold text-white/60 mb-12 uppercase tracking-widest leading-relaxed">Your account does not have the necessary permissions for this page. This attempt has been logged in the system records.</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-3" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-5 bg-[#008069] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        Sign In
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Unauthorized;
