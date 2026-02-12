import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUsers, faFilter, faPaperPlane, faCheckCircle,
    faChevronRight, faCommentDots, faEnvelope, faSms, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [channel, setChannel] = useState('whatsapp');
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [message, setMessage] = useState('');
    const [audiencePreview, setAudiencePreview] = useState(null);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        if (step === 2 && selectedProducts.length > 0) {
            previewAudience();
        }
    }, [selectedProducts, dateFrom, dateTo]);

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/campaigns/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data.data.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const previewAudience = async () => {
        setPreviewLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/campaigns/preview`, {
                filters: {
                    products: selectedProducts,
                    dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : null
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAudiencePreview(res.data.data);
        } catch (error) {
            console.error('Error previewing audience:', error);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !message || selectedProducts.length === 0) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/campaigns`, {
                name,
                description,
                filters: {
                    products: selectedProducts,
                    dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : null
                },
                message,
                channel
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/campaigns');
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    const insertVariable = (variable) => {
        const textarea = document.getElementById('message-textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.substring(0, start) + `{${variable}}` + message.substring(end);
        setMessage(newMessage);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
        }, 0);
    };

    const toggleProduct = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const steps = [
        { number: 1, title: 'Details', desc: 'Campaign info' },
        { number: 2, title: 'Audience', desc: 'Target customers' },
        { number: 3, title: 'Message', desc: 'Compose content' },
        { number: 4, title: 'Review', desc: 'Send campaign' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Campaign</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Step {step} of 4 - {steps[step - 1].desc}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-between">
                    {steps.map((s, index) => (
                        <div key={s.number} className="flex items-center relative" style={{ width: `${100 / steps.length}%` }}>
                            <div className={`flex items-center gap-3 relative z-10 ${step >= s.number ? '' : 'opacity-40'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all ${step > s.number
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : step === s.number
                                        ? 'bg-blue-600 text-white shadow-xl ring-4 ring-blue-100'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > s.number ? <FontAwesomeIcon icon={faCheckCircle} /> : s.number}
                                </div>
                                <div className="hidden md:block">
                                    <p className="font-bold text-sm text-gray-900">{s.title}</p>
                                    <p className="text-xs text-gray-500">{s.desc}</p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`absolute left-12 right-0 h-1 ${step > s.number ? 'bg-emerald-500' : 'bg-gray-200'} transition-all`} style={{ top: '24px', marginLeft: '12px' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {/* Step 1: Campaign Details */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., iPhone 17 Software Update"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Brief description of this campaign..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Channel *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['whatsapp', 'email', 'sms'].map(ch => (
                                        <button
                                            key={ch}
                                            onClick={() => setChannel(ch)}
                                            className={`p-4 rounded-xl text-sm font-bold transition-all border-2 ${channel === ch
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={ch === 'whatsapp' ? faCommentDots : ch === 'email' ? faEnvelope : faSms}
                                                className="mb-2 text-lg"
                                            />
                                            <div className="text-xs">{ch.charAt(0).toUpperCase() + ch.slice(1)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Audience Selection */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Target Products * <span className="text-gray-500 font-normal">({selectedProducts.length} selected)</span>
                                </label>

                                {/* Search Bar */}
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search sold products..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none mb-4"
                                />

                                {/* Product Grid - Only Sold Products */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                                    {products
                                        .filter(product =>
                                            product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                            (product.category && product.category.toLowerCase().includes(productSearch.toLowerCase())) ||
                                            (product.model && product.model.toLowerCase().includes(productSearch.toLowerCase()))
                                        )
                                        .map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => toggleProduct(product.id)}
                                                className={`p-4 rounded-xl text-left transition-all border-2 ${selectedProducts.includes(product.id)
                                                        ? 'bg-blue-50 border-blue-500 shadow-md'
                                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                                                        {product.model && (
                                                            <p className="text-xs text-blue-600 mt-0.5 font-mono">{product.model}</p>
                                                        )}
                                                    </div>
                                                    {selectedProducts.includes(product.id) && (
                                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24  24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    {products.filter(product =>
                                        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                        (product.category && product.category.toLowerCase().includes(productSearch.toLowerCase())) ||
                                        (product.model && product.model.toLowerCase().includes(productSearch.toLowerCase()))
                                    ).length === 0 && (
                                            <div className="col-span-2 text-center py-8">
                                                <p className="text-gray-500">
                                                    {productSearch ? `No products found matching "${productSearch}"` : 'No sold products available yet'}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">From Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">To Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            {/* Audience Preview */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <FontAwesomeIcon icon={faUsers} className="text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">Target Audience</p>
                                        {previewLoading ? (
                                            <p className="text-2xl font-black text-blue-600">Loading...</p>
                                        ) : audiencePreview ? (
                                            <p className="text-4xl font-black text-blue-600">{audiencePreview.count} Customers</p>
                                        ) : (
                                            <p className="text-gray-500">Select products to see count</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Message Composition */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Message *</label>
                                <textarea
                                    id="message-textarea"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={10}
                                    placeholder="Type your message here..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Insert Variables</label>
                                <div className="flex flex-wrap gap-2">
                                    {['customerName', 'phone', 'email'].map(variable => (
                                        <button
                                            key={variable}
                                            onClick={() => insertVariable(variable)}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl text-sm font-bold hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200"
                                        >
                                            {`{${variable}}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Review & Send */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Campaign</h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Campaign Name</p>
                                    <p className="text-lg font-bold text-gray-900">{name}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Audience</p>
                                    <p className="text-lg font-bold text-blue-600">{audiencePreview?.count || 0} Customers</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Channel</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{channel}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message Preview</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && !name) ||
                                (step === 2 && selectedProducts.length === 0) ||
                                (step === 3 && !message)
                            }
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    Send Campaign
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;
