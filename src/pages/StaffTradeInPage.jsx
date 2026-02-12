import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faExchangeAlt, faCamera, faMicrochip, faShieldAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import TradeInForm from '../components/TradeInForm';
import { motion } from 'framer-motion';

const StaffTradeInPage = () => {
    const navigate = useNavigate();
    const [showTradeInForm, setShowTradeInForm] = useState(false);

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Premium Global Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#008069] relative overflow-hidden pb-12 pt-4 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">Asset Intake</p>
                            <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Trade-In Management</h1>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-black text-white tracking-tight mb-2">Initialize New Exchange</h2>
                            <p className="text-white font-bold opacity-80 text-xs leading-relaxed max-w-sm">Capture clear photos and assess condition to generate an AI-driven valuation for customer approval.</p>
                        </div>
                        <button
                            onClick={() => setShowTradeInForm(true)}
                            className="px-8 py-4 bg-white text-[#008069] rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New Trade-In
                        </button>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
                {/* Procedure Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Quality Inspection', desc: 'Secure high-resolution front and rear imagery for condition analysis.', icon: faCamera, color: 'blue' },
                        { label: 'Smart Valuation', desc: 'Real-time market assessment via proprietary AI condition scoring.', icon: faMicrochip, color: 'purple' },
                        { label: 'Manager Approval', desc: 'Secure CEO oversight and approval before credit finalization.', icon: faShieldAlt, color: 'green' }
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-inner group-hover:scale-110 transition-transform ${step.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                step.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                    'bg-green-50 text-green-600'
                                }`}>
                                <FontAwesomeIcon icon={step.icon} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">{step.label}</h3>
                            <p className="text-xs font-black text-gray-600 uppercase tracking-tighter leading-relaxed mb-4">{step.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Step 0{i + 1}</span>
                                <div className="h-px flex-1 bg-gray-100"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trade-In Form Modal Proxy */}
            <TradeInForm
                isOpen={showTradeInForm}
                onClose={() => setShowTradeInForm(false)}
                onSuccess={() => {
                    setShowTradeInForm(false);
                    alert('✅ Trade-in request submitted successfully!');
                }}
            />
        </div>
    );
};

export default StaffTradeInPage;
