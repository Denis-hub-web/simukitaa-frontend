import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faMapMarkerAlt, faPhone, faStickyNote, faBox, faUser, faCheckCircle, faClock, faArrowLeft, faPlus, faTimes, faKey, faSignature, faEraser } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import DeliveryAssignment from '../components/DeliveryAssignment';

const DeliveryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [enteredCode, setEnteredCode] = useState('');
    const [signature, setSignature] = useState(null);
    const [rating, setRating] = useState(5);
    const [copied, setCopied] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isManager = ['CEO', 'MANAGER', 'STAFF'].includes(user?.role);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        loadDelivery();
    }, [id]);

    const loadDelivery = async () => {
        try {
            const res = await deliveryAPI.getById(id);
            setDelivery(res.data.data.delivery);
            setLoading(false);
        } catch (err) {
            setError('Failed to load delivery');
            setLoading(false);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        setSignature(canvas.toDataURL());
    };

    const handleStatusUpdate = async (newStatus, note, vCode = null) => {
        setUpdating(true);
        setError('');

        try {
            await deliveryAPI.updateStatus(id, newStatus, note, vCode, signature, rating);
            await loadDelivery(); // Reload to get updated data
            setUpdating(false);
            setEnteredCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING_ASSIGNMENT': return 'bg-gray-100 text-gray-600';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-600';
            case 'ACCEPTED': return 'bg-purple-100 text-purple-600';
            case 'IN_PREPARATION': return 'bg-amber-100 text-amber-600';
            case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-600';
            case 'ARRIVED': return 'bg-green-100 text-green-600';
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDeliveryTime = (time) => {
        if (time === 'now') return 'ASAP';
        if (time === 'tomorrow') return 'Tomorrow';
        return new Date(time).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-semibold text-gray-600">Loading delivery...</p>
                </div>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <p className="text-red-800 font-bold text-lg">Delivery not found</p>
                    <button
                        onClick={() => navigate('/deliveries')}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                    >
                        Back to Deliveries
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/deliveries')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition-all"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back
                </button>

                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace(/_/g, ' ')}
                </span>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left Channel) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <FontAwesomeIcon icon={faTruck} className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Delivery #{delivery.deliveryNumber}</h1>
                                <p className="text-sm font-bold text-gray-400">INITIATED {new Date(delivery.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                        <p className="font-bold text-slate-900">{delivery.deliveryAddress}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                        <FontAwesomeIcon icon={faPhone} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                                        <p className="font-bold text-slate-900">{delivery.deliveryPhone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                        <FontAwesomeIcon icon={faClock} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">Delivery Time</p>
                                        <p className="font-bold text-slate-900">{formatDeliveryTime(delivery.deliveryTime)}</p>
                                    </div>
                                </div>

                                {delivery.specialInstructions && (
                                    <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                                            <FontAwesomeIcon icon={faStickyNote} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">Delivery Notes</p>
                                            <p className="text-slate-700 text-sm font-medium italic">\"{delivery.specialInstructions}\"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Delivery Security - Staff/Manager/CEO Only */}
                    {isManager && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                    <FontAwesomeIcon icon={faKey} className="text-amber-400 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Handover Security</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Handover Authorization</p>
                                </div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative z-10">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Delivery OTP</p>
                                <p className="text-5xl font-black text-amber-400 font-mono tracking-[0.4em] text-center">{delivery.verificationCode}</p>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(delivery.verificationCode);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${copied
                                            ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-lg shadow-amber-500/20'
                                            : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={copied ? faCheckCircle : faSignature} className={copied ? 'text-slate-900' : 'text-amber-400'} />
                                        {copied ? 'OTP Saved' : 'Copy Code'}
                                    </button>
                                    <a
                                        href={`https://wa.me/${delivery.deliveryPhone?.replace(/\+/g, '')}?text=${encodeURIComponent(`Habari, Code yako ya kupokelea mzigo (Delivery #${delivery.deliveryNumber}) ni: ${delivery.verificationCode}. Tafadhali mpe driver atakapofika.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-[#25D366]/20 flex items-center justify-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faPhone} />
                                        WhatsApp
                                    </a>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-gray-500 font-bold italic text-center">Share this code with the customer. The driver must obtain this code from them at the destination to finalize the delivery.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Cargo / Product Details */}
                    {delivery.sale && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                    <FontAwesomeIcon icon={faBox} />
                                </div>
                                <h2 className="text-lg font-black text-slate-900">Cargo Logistics</h2>
                            </div>

                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Name</p>
                                    <p className="font-black text-slate-900 text-lg">{delivery.sale.productName || 'Equipment'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Value</p>
                                    <p className="text-xl font-black text-green-600">
                                        TSH {delivery.sale.totalAmount?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Recipient / Customer Info */}
                    {delivery.customer && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <h2 className="text-lg font-black text-slate-900">Recipient Details</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identifier</p>
                                    <p className="font-bold text-slate-900">{delivery.customer.name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Link</p>
                                    <p className="font-bold text-slate-900">{delivery.customer.phone}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar (Right Channel) */}
                <div className="space-y-6">
                    {/* Delivery Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm space-y-4"
                    >
                        <h3 className="font-black text-lg text-slate-900 mb-2 tracking-tight">Actions</h3>

                        {delivery.status === 'PENDING_ASSIGNMENT' && isManager && (
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
                            >
                                <FontAwesomeIcon icon={faPlus} className="group-hover:rotate-90 transition-transform" />
                                Assign Driver
                            </button>
                        )}

                        {delivery.status === 'ASSIGNED' && (
                            <button
                                onClick={() => handleStatusUpdate('ACCEPTED', 'Delivery accepted by driver')}
                                disabled={updating}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                            >
                                {updating ? 'SYNCHRONIZING...' : '✓ Accept Delivery'}
                            </button>
                        )}

                        {delivery.status === 'ACCEPTED' && (
                            <button
                                onClick={() => handleStatusUpdate('OUT_FOR_DELIVERY', 'Shipment dispatched')}
                                disabled={updating}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                            >
                                {updating ? 'DISPATCHING...' : '🚀 Start Delivery'}
                            </button>
                        )}

                        {delivery.status === 'OUT_FOR_DELIVERY' && (
                            <button
                                onClick={() => handleStatusUpdate('ARRIVED', 'Driver at destination')}
                                disabled={updating}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                            >
                                {updating ? 'REPORTING...' : '📍 Driver Arrived'}
                            </button>
                        )}

                        {delivery.status === 'ARRIVED' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <FontAwesomeIcon icon={faSignature} className="text-blue-600 text-sm" />
                                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Customer Signature</p>
                                </div>
                                <div className="relative bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden aspect-[3/1] shadow-inner mb-4">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={150}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="w-full h-full cursor-crosshair touch-none"
                                    />
                                    {!signature && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                            <p className="text-xs font-black uppercase tracking-tighter">Sign Here</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={clearSignature}
                                        className="absolute bottom-2 right-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all font-black text-[10px]"
                                    >
                                        <FontAwesomeIcon icon={faEraser} />
                                    </button>
                                </div>

                                <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50">
                                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3 text-center">Customer Rating</p>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`text-2xl transition-all ${star <= rating ? 'text-amber-400 scale-110' : 'text-gray-300'
                                                    }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FontAwesomeIcon icon={faKey} className="text-amber-600 text-sm" />
                                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Handover Verification</p>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="CODE"
                                        value={enteredCode}
                                        onChange={(e) => setEnteredCode(e.target.value)}
                                        className="w-full bg-white border-2 border-amber-200 p-4 rounded-2xl text-center text-3xl font-black tracking-[0.4em] focus:border-amber-500 focus:outline-none transition-all placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-sm shadow-inner"
                                    />
                                </div>

                                <button
                                    onClick={() => handleStatusUpdate('DELIVERED', 'Delivery complete, OTP & Signature Verified', enteredCode)}
                                    disabled={updating || enteredCode.length !== 6 || !signature}
                                    className="w-full py-5 bg-gradient-to-r from-[#008069] to-[#00a884] text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase font-black tracking-widest text-sm flex items-center justify-center gap-3 group"
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} className="group-hover:scale-125 transition-transform" />
                                    {updating ? 'VERIFYING...' : 'Confirm Delivery'}
                                </button>
                            </div>
                        )}

                        {delivery.status === 'DELIVERED' && (
                            <div className="text-center py-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 shadow-inner">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100 ring-8 ring-emerald-50/50">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-emerald-500" />
                                </div>
                                <p className="text-emerald-900 font-black text-xl tracking-tight leading-none mb-1 uppercase">Delivered Successfully</p>
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest opacity-60 mb-6">Delivery Complete</p>

                                {delivery.deliveryProof?.rating && (
                                    <div className="mb-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Insight</p>
                                        <div className="flex justify-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className={`text-xl ${star <= delivery.deliveryProof.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {delivery.deliveryProof?.signature && (
                                    <div className="px-8">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-left">Recipient Acknowledgement</p>
                                        <div className="bg-white p-2 rounded-xl border border-emerald-100/50 h-20 flex items-center justify-center overflow-hidden">
                                            <img src={delivery.deliveryProof.signature} alt="Signature" className="max-h-full opacity-80" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Delivery History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden"
                    >
                        <h3 className="font-black text-[13px] text-gray-400 uppercase tracking-[0.2em] mb-8 border-b border-gray-50 pb-4">Delivery History</h3>

                        <div className="space-y-0 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-50"></div>

                            {delivery.statusHistory?.slice().reverse().map((item, index) => (
                                <div key={index} className="flex gap-5 mb-8 last:mb-0 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center ${index === 0 ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-gray-200'
                                            }`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`font-black text-xs uppercase tracking-tight leading-none ${index === 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                                                {item.status.replace(/_/g, ' ')}
                                            </p>
                                            {item.status === 'DELIVERED' && delivery.deliveryProof?.rating && (
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span key={s} className={`text-[10px] ${s <= delivery.deliveryProof.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 mb-2">
                                            {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                        {item.note && (
                                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 italic text-[10px] text-gray-500 leading-relaxed font-medium">
                                                {item.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals Channel */}
            <AnimatePresence>
                {showAssignModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Assignment</h2>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-slate-900 transition-all font-black text-xs"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <DeliveryAssignment
                                    delivery={delivery}
                                    onClose={() => setShowAssignModal(false)}
                                    onSuccess={() => {
                                        setShowAssignModal(false);
                                        loadDelivery();
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeliveryDetail;
