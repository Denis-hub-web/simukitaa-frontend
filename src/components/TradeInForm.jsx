import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faArrowRight, faArrowLeft, faCamera, faCheckCircle,
    faMobileAlt, faSpinner, faMicrochip, faShieldAlt, faInfoCircle,
    faUser, faBoxOpen, faTools
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Tesseract from 'tesseract.js';

const TradeInForm = ({ isOpen, onClose, onSuccess, prefilledCustomer }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        deviceInfo: { brand: '', model: '', storage: '', color: '', serialNumber: '', isRefurbished: false },
        condition: { screen: 'excellent', body: 'excellent', camera: 'excellent', battery: 100, functionality: [] },
        photos: { front: null },
        accessories: { charger: false, box: false, earphones: false },
        valuation: '',
        estimatedSellingPrice: ''
    });
    const [showCamera, setShowCamera] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [showCustomStorage, setShowCustomStorage] = useState(false);
    const [videoRef, setVideoRef] = useState(null);
    const [stream, setStream] = useState(null);

    const totalSteps = 5;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (prefilledCustomer) {
            setFormData(prev => ({
                ...prev,
                customerId: prefilledCustomer.id || '',
                customerName: prefilledCustomer.name || '',
                customerPhone: prefilledCustomer.phone || ''
            }));
        }
    }, [prefilledCustomer]);

    if (!isOpen) return null;

    const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
    const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const handlePhotoUpload = (type) => (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height;
                    const maxDimension = 1200;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) { height = (height / width) * maxDimension; width = maxDimension; }
                        else { width = (width / height) * maxDimension; height = maxDimension; }
                    }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData({ ...formData, photos: { ...formData.photos, [type]: compressedImage } });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        try {
            if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
            const token = localStorage.getItem('token');
            const submissionData = { ...formData, customerId: formData.customerId || `cust_${Date.now()}` };
            const response = await axios.post(`${API_BASE_URL}/trade-ins`, submissionData, { headers: { Authorization: `Bearer ${token}` } });
            onSuccess(response.data);
            onClose();
        } catch (error) {
            alert('System failure: ' + (error.response?.data?.message || error.message));
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.customerName && formData.customerPhone;
            case 2: return formData.deviceInfo.brand && formData.deviceInfo.model && formData.deviceInfo.storage && formData.deviceInfo.serialNumber;
            case 3: return true;
            case 4: return formData.photos.front;
            case 5: return formData.valuation && formData.estimatedSellingPrice;
            default: return true;
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            setShowCamera(true);
            setTimeout(() => { if (videoRef && mediaStream) videoRef.srcObject = mediaStream; }, 100);
        } catch (error) { alert('Access Denied'); }
    };

    const stopCamera = () => { if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); } setShowCamera(false); };

    const captureAndScan = async () => {
        if (!videoRef) return;
        setScanning(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.videoWidth; canvas.height = videoRef.videoHeight;
            canvas.getContext('2d').drawImage(videoRef, 0, 0);
            const result = await Tesseract.recognize(canvas.toDataURL('image/png'), 'eng');
            const patterns = [/Serial\s*No\.?\s*:?\s*([A-Z0-9]{8,})/i, /S\/N\s*:?\s*([A-Z0-9]{8,})/i, /Serial\s*:?\s*([A-Z0-9]{8,})/i];
            let serialNum = null;
            for (const p of patterns) { const match = result.data.text.match(p); if (match) { serialNum = match[1]; break; } }
            if (serialNum) {
                setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, serialNumber: serialNum.toUpperCase() } });
                alert('✓ Extractions Verified: ' + serialNum);
                stopCamera();
            } else { alert('⚠️ Pattern Mismatch: Manual entry required'); }
        } catch (error) { alert('Scan Failure'); } finally { setScanning(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-blue-600 p-8 text-white relative">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Trade-In Process</p>
                            <h2 className="text-2xl font-extrabold tracking-tight leading-none">New Trade-In</h2>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg border border-white/10">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {[...Array(totalSteps)].map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 <= currentStep ? 'bg-white w-full' : 'bg-white/20 w-8'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-10 min-h-[450px] max-h-[70vh] overflow-y-auto no-scrollbar">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#008069] shadow-inner"><FontAwesomeIcon icon={faUser} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Customer Details</h3>
                                        <p className="premium-label mb-0">Enter customer information</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="group">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Legal Name *</p>
                                        <input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="Full client signature..." className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <p className="premium-label mb-2">Phone Number *</p>
                                        <input type="tel" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} placeholder="e.g. 2557..." className="premium-input" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner"><FontAwesomeIcon icon={faMobileAlt} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Device Details</h3>
                                        <p className="premium-label mb-0">Enter device information</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Brand</p>
                                        <select value={formData.deviceInfo.brand} onChange={(e) => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, brand: e.target.value } })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-blue-500/10 shadow-inner">
                                            <option value="">Select Brand...</option>
                                            <option value="Apple">Apple</option>
                                            <option value="Samsung">Samsung</option>
                                            <option value="Google">Google</option>
                                            <option value="Xiaomi">Xiaomi</option>
                                            <option value="Oppo">Oppo</option>
                                            <option value="Tecno">Tecno</option>
                                            <option value="Infinix">Infinix</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Model</p>
                                        <input type="text" value={formData.deviceInfo.model} onChange={(e) => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, model: e.target.value } })} placeholder="e.g. iPhone 15 Pro Max" className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-blue-500/10 shadow-inner" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Storage Capacity *</p>
                                        <select value={formData.deviceInfo.storage} onChange={(e) => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, storage: e.target.value } })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-blue-500/10 shadow-inner">
                                            <option value="">Select Storage...</option>
                                            <option value="32GB">32GB</option>
                                            <option value="64GB">64GB</option>
                                            <option value="128GB">128GB</option>
                                            <option value="256GB">256GB</option>
                                            <option value="512GB">512GB</option>
                                            <option value="1TB">1TB</option>
                                            <option value="2TB">2TB</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Color</p>
                                        <input type="text" value={formData.deviceInfo.color} onChange={(e) => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, color: e.target.value } })} placeholder="e.g. Space Black, Gold" className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-blue-500/10 shadow-inner" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Device Status</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, isRefurbished: false } })}
                                            className={`px-6 py-4 rounded-2xl text-sm font-bold border-2 transition-all ${!formData.deviceInfo.isRefurbished
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-lg'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            ✓ Original
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, isRefurbished: true } })}
                                            className={`px-6 py-4 rounded-2xl text-sm font-bold border-2 transition-all ${formData.deviceInfo.isRefurbished
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            ⚠ Refurbished
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Serial Number *</p>
                                    <div className="flex gap-3">
                                        <input type="text" value={formData.deviceInfo.serialNumber} onChange={(e) => setFormData({ ...formData, deviceInfo: { ...formData.deviceInfo, serialNumber: e.target.value.toUpperCase() } })} placeholder="REQUIRED - Autocapitalized" className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 shadow-inner uppercase" required />
                                        <button type="button" onClick={startCamera} className="px-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><FontAwesomeIcon icon={faCamera} /> Scan</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner"><FontAwesomeIcon icon={faTools} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Condition Assessment</h3>
                                        <p className="premium-label mb-0">Check device condition</p>
                                    </div>
                                </div>
                                {['screen', 'body', 'camera'].map(attr => (
                                    <div key={attr}>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{attr} integrity</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['excellent', 'good', 'fair', 'poor'].map(lvl => (
                                                <button key={lvl} onClick={() => setFormData({ ...formData, condition: { ...formData.condition, [attr]: lvl } })} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${formData.condition[attr] === lvl ? 'bg-orange-600 text-white border-orange-600 shadow-lg scale-105' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-orange-600/30'}`}>{lvl}</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner"><FontAwesomeIcon icon={faCamera} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Device Photos</h3>
                                        <p className="premium-label mb-0">Upload photos of the device</p>
                                    </div>
                                </div>
                                <div className="max-w-md mx-auto">
                                    <label className="block cursor-pointer">
                                        <div className="border-4 border-dashed border-gray-100 rounded-[3rem] p-12 text-center hover:border-purple-600/30 transition-all bg-gray-50/50">
                                            {formData.photos.front ? (
                                                <div className="relative group">
                                                    <img src={formData.photos.front} className="w-full h-48 object-cover rounded-[2rem] shadow-2xl" alt="Front" />
                                                    <div className="absolute inset-0 bg-purple-600/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><FontAwesomeIcon icon={faCheckCircle} className="text-4xl" /></div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <FontAwesomeIcon icon={faCamera} className="text-5xl text-gray-200" />
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Primary Focal Point Capture</p>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload('front')} className="hidden" />
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 5 && (
                            <motion.div key="5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner"><FontAwesomeIcon icon={faShieldAlt} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Valuation & Review</h3>
                                        <p className="premium-label mb-0">Review and set price</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Subject</p>
                                            <p className="text-sm font-black text-gray-900">{formData.customerName}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400">{formData.customerPhone}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Equipment</p>
                                            <p className="text-sm font-black text-gray-900">{formData.deviceInfo.brand} {formData.deviceInfo.model}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">{formData.deviceInfo.storage}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Valuation (Credit) *</p>
                                            <input type="number" value={formData.valuation} onChange={(e) => setFormData({ ...formData, valuation: e.target.value })} placeholder="Credit amount..." className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold border border-gray-100 focus:ring-4 focus:ring-green-500/10 shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Est. Selling Price *</p>
                                            <input type="number" value={formData.estimatedSellingPrice} onChange={(e) => setFormData({ ...formData, estimatedSellingPrice: e.target.value })} placeholder="Target price..." className="w-full px-6 py-4 bg-white rounded-2xl text-sm font-bold border border-gray-100 focus:ring-4 focus:ring-green-500/10 shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <FontAwesomeIcon icon={faMicrochip} className="text-[#008069] text-xs" />
                                        <p className="text-[10px] font-black text-gray-900 uppercase">System Updated with Valuation Details</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-8 border-t border-gray-50 flex gap-4">
                    <button onClick={handleBack} disabled={currentStep === 1} className={`flex-1 py-5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${currentStep === 1 ? 'text-gray-200' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}><FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Cancel</button>
                    {currentStep < totalSteps ? (
                        <button onClick={handleNext} disabled={!isStepValid()} className={`flex-[2] py-5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all ${isStepValid() ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-gray-100 text-gray-300'}`}>Next <FontAwesomeIcon icon={faArrowRight} className="ml-2" /></button>
                    ) : (
                        <button onClick={handleSubmit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all">Complete Trade-In</button>
                    )}
                </div>
            </motion.div>

            {/* Camera Overlay */}
            {showCamera && (
                <div className="fixed inset-0 bg-gray-900/95 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl overflow-hidden">
                        <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black tracking-tight leading-none">Status Scanner</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase mt-1">S/N Pattern Detection</p>
                            </div>
                            <button onClick={stopCamera} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
                                <video ref={(ref) => setVideoRef(ref)} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none"></div>
                                <div className="absolute inset-12 border-2 border-white/40 border-dashed rounded-xl pointer-events-none"></div>
                                {scanning && <div className="absolute inset-0 bg-[#008069]/40 backdrop-blur-sm flex items-center justify-center text-white"><FontAwesomeIcon icon={faSpinner} spin className="text-4xl" /></div>}
                            </div>
                            <button onClick={captureAndScan} disabled={scanning} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">Trigger Capture</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeInForm;
