import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMoneyBillWave,
    faMobileAlt,
    faUser,
    faSearch,
    faExchangeAlt,
    faArrowRight,
    faArrowLeft,
    faCheckCircle,
    faLaptop,
    faTabletAlt,
    faHeadphones,
    faClock,
    faGamepad,
    faTv,
    faCamera,
    faBox,
    faTruck,
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { salesAPI, productAPI, customerAPI, userAPI, tradeInAPI } from '../utils/api';
import TradeInForm from './TradeInForm';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { createWorker } from 'tesseract.js';
import { faTimes, faSync } from '@fortawesome/free-solid-svg-icons';

const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('phone') || categoryLower.includes('mobile')) return faMobileAlt;
    if (categoryLower.includes('laptop') || categoryLower.includes('computer')) return faLaptop;
    if (categoryLower.includes('tablet') || categoryLower.includes('ipad')) return faTabletAlt;
    if (categoryLower.includes('watch') || categoryLower.includes('smartwatch')) return faClock;
    if (categoryLower.includes('headphone') || categoryLower.includes('earphone') || categoryLower.includes('airpod')) return faHeadphones;
    if (categoryLower.includes('game') || categoryLower.includes('playstation') || categoryLower.includes('xbox')) return faGamepad;
    if (categoryLower.includes('tv') || categoryLower.includes('television')) return faTv;
    if (categoryLower.includes('camera')) return faCamera;
    return faBox; // Default icon
};

const getCategoryColor = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('phone') || categoryLower.includes('mobile')) return 'bg-blue-600';
    if (categoryLower.includes('laptop') || categoryLower.includes('computer')) return 'bg-purple-600';
    if (categoryLower.includes('tablet') || categoryLower.includes('ipad')) return 'bg-indigo-600';
    if (categoryLower.includes('watch') || categoryLower.includes('smartwatch')) return 'bg-pink-600';
    if (categoryLower.includes('headphone') || categoryLower.includes('earphone') || categoryLower.includes('airpod')) return 'bg-green-600';
    if (categoryLower.includes('game') || categoryLower.includes('playstation') || categoryLower.includes('xbox')) return 'bg-red-600';
    if (categoryLower.includes('tv') || categoryLower.includes('television')) return 'bg-yellow-600';
    if (categoryLower.includes('camera')) return 'bg-teal-600';
    return 'bg-gray-600'; // Default color
};

const RecordSaleForm = ({ onSuccess, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [searchCustomer, setSearchCustomer] = useState('');
    const [formData, setFormData] = useState({
        customerId: '',
        productId: '',
        sellingPrice: '',
        paymentMethod: 'CASH',
        amountPaid: '',
        tradeInId: '',
        tradeInValue: 0,
        serialNumber: '',
        condition: ''
    });
    const [customerTradeIns, setCustomerTradeIns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [hasTradeIn, setHasTradeIn] = useState(false);
    const [showTradeInModal, setShowTradeInModal] = useState(false);
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
    const [tradeInId, setTradeInId] = useState(null);
    const [customPaymentMethod, setCustomPaymentMethod] = useState('');

    // Scanner States (simplified for image upload)
    const [showScanner, setShowScanner] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);
    const ocrWorker = useRef(null);

    const startScanner = async () => {
        // Trigger file input click
        document.getElementById('serialNumberImageUpload').click();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScannerLoading(true);
        setShowScanner(true);

        try {
            console.log('📸 Processing image...');

            // Initialize OCR Worker if needed
            if (!ocrWorker.current) {
                console.log('🤖 Initializing OCR worker...');
                const worker = await createWorker('eng');
                ocrWorker.current = worker;
                console.log('✅ OCR worker ready');
            }

            // Read the image
            const imageUrl = URL.createObjectURL(file);

            console.log('🔍 Extracting text with advanced OCR...');

            // Preprocess image for better OCR
            const img = new Image();
            img.src = imageUrl;
            await new Promise(resolve => img.onload = resolve);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Enhance contrast and brightness
            ctx.filter = 'contrast(1.5) brightness(1.2)';
            ctx.drawImage(img, 0, 0);
            const preprocessedUrl = canvas.toDataURL();

            // Run OCR with word-level details
            const { data } = await ocrWorker.current.recognize(preprocessedUrl, {
                rotateAuto: true,
            });

            console.log('📄 Raw OCR text:', data.text);
            console.log('📊 OCR confidence:', data.confidence);

            const text = data.text;
            const words = data.words || [];
            console.log('📝 Words:', words.map(w => `${w.text}(${Math.round(w.confidence)}%)`).join(', '));

            // Clean up URLs
            URL.revokeObjectURL(imageUrl);

            // Extract serial number using AI/Regex
            // Enhanced patterns based on real iPhone labels

            // Priority patterns for serial number detection
            const patterns = [
                // Pattern 1: Explicit "Serial No" or "S/N" label (like iPhone labels)
                /(?:Serial\s*No\.?|S\/N|SN|SERIAL\s*NUMBER)[\s:]*([A-Z0-9]{10,12})/i,

                // Pattern 2: IMEI with explicit label
                /(?:IMEI|IMEI2|MEID)[\s:/]*(\d{15})/i,

                // Pattern 3: Apple-style serial (usually 10-12 alphanumeric, often starts with letter)
                /\b([A-Z][A-Z0-9]{9,11})\b/,

                // Pattern 4: IMEI without label (15 digits)
                /\b(\d{15})\b/,

                // Pattern 5: Generic serial pattern (8-17 characters)
                /\b([A-Z0-9]{8,17})\b/
            ];

            // Collect candidates with confidence scores
            const candidates = [];

            // PRIORITY: Find keyword first ("Serial", "IMEI"), then extract next word
            console.log('\ud83d\udd0d Looking for keywords...');
            for (let i = 0; i < words.length - 1; i++) {
                const wordText = words[i].text.toUpperCase().replace(/[^A-Z]/g, '');
                const nextWord = words[i + 1];

                if (['SERIAL', 'SN', 'SERIALNO'].includes(wordText)) {
                    const val = nextWord.text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                    if (val.length >= 8) {
                        console.log(`\u2705 Found Serial after "${words[i].text}": ${val}`);
                        candidates.push({ value: val, type: 'Serial Number', priority: 1, confidence: nextWord.confidence });
                    }
                }

                if (['IMEI', 'IMEI2', 'MEID'].includes(wordText)) {
                    const val = nextWord.text.replace(/[^0-9]/g, '');
                    if (val.length === 15) {
                        console.log(`\u2705 Found IMEI after "${words[i].text}": ${val}`);
                        candidates.push({ value: val, type: 'IMEI', priority: 1, confidence: nextWord.confidence });
                    }
                }
            }


            // Strategy 1: Pattern matching on full text
            for (let i = 0; i < patterns.length; i++) {
                const match = text.match(patterns[i]);
                if (match && match[1]) {
                    const value = match[1].replace(/\s/g, '');
                    let type = 'Code';
                    if (i === 0) type = 'Serial Number';
                    else if (i === 1 || i === 3) type = 'IMEI';
                    else if (i === 2) type = 'Serial Number';

                    candidates.push({ value, type, priority: 1, confidence: 90 });
                }
            }

            // Strategy 2: Analyze high-confidence words
            const highConfWords = words.filter(w => w.confidence > 70);
            for (const word of highConfWords) {
                const cleaned = word.text.replace(/[^A-Z0-9]/gi, '').toUpperCase();

                if (/^[A-Z][A-Z0-9]{9,11}$/.test(cleaned)) {
                    candidates.push({ value: cleaned, type: 'Serial Number', priority: 2, confidence: word.confidence });
                } else if (/^\d{15}$/.test(cleaned)) {
                    candidates.push({ value: cleaned, type: 'IMEI', priority: 2, confidence: word.confidence });
                } else if (/^[A-Z0-9]{10,17}$/.test(cleaned)) {
                    candidates.push({ value: cleaned, type: 'Code', priority: 3, confidence: word.confidence });
                }
            }

            // Filter garbage
            const filtered = candidates.filter(c => {
                const uniqueChars = new Set(c.value).size;
                if (uniqueChars < c.value.length * 0.4) return false; // Too repetitive
                if (/[OI]{4,}|[0]{4,}/.test(c.value)) return false; // Common OCR errors
                if (/^(.)\1+$/.test(c.value)) return false; // All same char
                return true;
            });

            // Sort by priority then confidence
            filtered.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return b.confidence - a.confidence;
            });

            console.log('🎯 Filtered candidates:', filtered);
            const best = filtered[0];

            if (best && best.confidence > 60) {
                setFormData(prev => ({ ...prev, serialNumber: best.value }));
                setShowScanner(false);
                alert(`🎯 ${best.type} Detected: ${best.value}\n\nConfidence: ${Math.round(best.confidence)}%\n\nPlease verify!`);
            } else {
                setShowScanner(false);
                const debugInfo = filtered.length > 0
                    ? `\n\nFound (low confidence):\n${filtered.slice(0, 3).map(c => `• ${c.value} (${Math.round(c.confidence)}%)`).join('\n')}`
                    : '';
                alert('❌ Could not detect a serial number in the image.\n\nPlease:\n• Ensure good lighting\n• Take a clear, focused photo\n• Make sure the serial number is visible\n\nOr enter it manually.');
            }
        } catch (err) {
            console.error('❌ OCR error:', err);
            setError('Failed to process image: ' + err.message);
            setShowScanner(false);
        } finally {
            setScannerLoading(false);
            // Reset the input so the same file can be selected again
            e.target.value = '';
        }
    };
    // Cleanup effect for OCR worker
    useEffect(() => {
        return () => {
            if (ocrWorker.current) {
                ocrWorker.current.terminate();
            }
        };
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsRes, customersRes] = await Promise.all([
                productAPI.getAll(),
                customerAPI.getAll()
            ]);
            setProducts(productsRes.data.data.products);
            setCustomers(customersRes.data.data.customers);
        } catch (err) {
            console.error('Loader error:', err);
            setError('Failed to load data');
        }
    };

    const handleProductChange = (productId) => {
        const product = products.find(p => p.id === productId);

        // If product has condition stock, default to first available
        let defaultCond = '';
        let defaultPrice = product?.sellingPrice || '';

        if (product?.stockByCondition) {
            const conditions = ['nonActive', 'active', 'used', 'refurbished'];
            defaultCond = conditions.find(c => (product.stockByCondition[c]?.quantity || 0) > 0) || 'nonActive';
            defaultPrice = product.stockByCondition[defaultCond]?.sellingPrice || product.sellingPrice || '';
        }

        setFormData({
            ...formData,
            productId,
            condition: defaultCond,
            sellingPrice: defaultPrice,
            amountPaid: defaultPrice
        });
    };

    const handleConditionChange = (conditionKey) => {
        const product = products.find(p => p.id === formData.productId);
        const condPrice = product?.stockByCondition?.[conditionKey]?.sellingPrice || product?.sellingPrice || '';

        setFormData({
            ...formData,
            condition: conditionKey,
            sellingPrice: condPrice,
            amountPaid: condPrice
        });
    };

    const handleCustomerChange = async (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        setFormData({ ...formData, customerId, tradeInId: '', tradeInValue: 0 });
        setDeliveryInfo({ ...deliveryInfo, phone: customer?.phone || '' });
        try {
            const response = await tradeInAPI.getCustomerApproved(customerId);
            setCustomerTradeIns(response.data.data.tradeIns || []);
        } catch (err) {
            console.error('Failed to load customer trade-ins');
        }
    };

    const handleTradeInSelection = (tradeIn) => {
        if (formData.tradeInId === tradeIn.id) {
            // Deselect
            setFormData({
                ...formData,
                tradeInId: '',
                tradeInValue: 0,
                amountPaid: formData.sellingPrice
            });
        } else {
            // Select
            const value = parseFloat(tradeIn.approvedValue || 0);
            setFormData({
                ...formData,
                tradeInId: tradeIn.id,
                tradeInValue: value,
                amountPaid: Math.max(0, formData.sellingPrice - value)
            });
        }
    };

    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            setError('Name and phone are required');
            return;
        }
        try {
            const response = await customerAPI.create(newCustomer);
            const createdCustomer = response.data.data.customer;
            setCustomers([...customers, createdCustomer]);
            setFormData({ ...formData, customerId: createdCustomer.id });
            setShowNewCustomer(false);
            setNewCustomer({ name: '', phone: '' });
            setError('');
        } catch (err) {
            setError('Failed to create customer');
        }
    };

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError('');
        setShowConfirm(false);

        try {
            const saleData = {
                ...formData,
                requiresDelivery,
                ...(requiresDelivery && {
                    deliveryAddress: deliveryInfo.address,
                    deliveryPhone: deliveryInfo.phone,
                    deliveryTime: deliveryInfo.time === 'custom' ? deliveryInfo.customTime : deliveryInfo.time,
                    specialInstructions: deliveryInfo.specialInstructions,
                    deliveryPersonId: deliveryInfo.deliveryPersonId || undefined
                })
            };

            await salesAPI.create(saleData);

            // Show congratulations message
            alert('🎉 Congratulations! Sale recorded successfully!\n\nGreat job on closing this sale!');

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record sale');
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.isAvailable &&
        (p.quantity > 0 || (p.totalStock > 0)) &&
        (p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
            p.model?.toLowerCase().includes(searchProduct.toLowerCase()))
    );

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.phone.includes(searchCustomer)
    );

    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const selectedProduct = products.find(p => p.id === formData.productId);

    const canProceed = () => {
        if (currentStep === 1) return formData.customerId;
        if (currentStep === 2) return formData.productId && formData.sellingPrice;
        if (currentStep === 3) return formData.paymentMethod && formData.amountPaid;
        return true;
    };

    return (
        <>
            <div className="space-y-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex-1 flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step
                                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step}
                            </div>
                            {step < 4 && (
                                <div className={`flex-1 h-1 mx-2 transition-all ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step Header with Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {currentStep === 1 && 'Select Customer'}
                                {currentStep === 2 && 'Select Product'}
                                {currentStep === 3 && 'Payment Details'}
                                {currentStep === 4 && 'Review & Confirm'}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {currentStep === 1 && 'Choose the customer for this sale'}
                                {currentStep === 2 && 'Choose the product to sell'}
                                {currentStep === 3 && 'Select payment method and amount'}
                                {currentStep === 4 && 'Please review the sale details'}
                            </p>
                        </div>

                        {/* Navigation Buttons - Top Right */}
                        <div className="flex gap-2">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    Back
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2"
                                >
                                    Next
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    {loading ? 'Recording...' : 'Confirm Sale'}
                                </button>
                            )}

                            {currentStep === 1 && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step Content */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <button
                                type="button"
                                onClick={() => setShowNewCustomer(!showNewCustomer)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                            >
                                {showNewCustomer ? '← Back to Customer List' : '+ Add New Customer'}
                            </button>

                            {showNewCustomer ? (
                                <div className="bg-blue-50 rounded-2xl p-6 space-y-4 border-2 border-blue-200">
                                    <h4 className="font-bold text-gray-900">Quick Add Customer</h4>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={newCustomer.name}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            placeholder="0755855909"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreateCustomer}
                                        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                                    >
                                        Create Customer
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or phone..."
                                            value={searchCustomer}
                                            onChange={(e) => setSearchCustomer(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                        {filteredCustomers.map(customer => (
                                            <div
                                                key={customer.id}
                                                onClick={() => handleCustomerChange(customer.id)}
                                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.customerId === customer.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <FontAwesomeIcon icon={faUser} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{customer.name}</p>
                                                        <p className="text-sm text-gray-600">{customer.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or model..."
                                    value={searchProduct}
                                    onChange={(e) => setSearchProduct(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductChange(product.id)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.productId === product.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${getCategoryColor(product.category)} rounded-full flex items-center justify-center`}>
                                                    <FontAwesomeIcon icon={getCategoryIcon(product.category)} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{product.name} {product.model}</p>
                                                    <p className="text-sm text-green-600 font-medium">✓ Available</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">TSH {product.sellingPrice?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Condition Selection Section */}
                            {selectedProduct && selectedProduct.stockByCondition && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-gray-50 rounded-[2rem] p-6 border-2 border-gray-100 space-y-4 shadow-inner"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pick Specific Variant & Condition</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { key: 'nonActive', label: '🆕 Non-Active', color: 'blue' },
                                            { key: 'active', label: '📱 Active', color: 'green' },
                                            { key: 'used', label: '👤 Used', color: 'orange' },
                                            { key: 'refurbished', label: '🔧 Refurbished', color: 'purple' }
                                        ].map(cond => {
                                            const stock = selectedProduct.stockByCondition[cond.key]?.quantity || 0;
                                            const price = selectedProduct.stockByCondition[cond.key]?.sellingPrice || selectedProduct.sellingPrice || 0;
                                            const isSelected = formData.condition === cond.key;

                                            return (
                                                <button
                                                    key={cond.key}
                                                    type="button"
                                                    disabled={stock <= 0}
                                                    onClick={() => handleConditionChange(cond.key)}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col text-left relative overflow-hidden group ${isSelected
                                                        ? `border-${cond.color}-500 bg-white shadow-lg`
                                                        : stock > 0
                                                            ? 'border-white bg-white/50 hover:border-gray-200'
                                                            : 'border-transparent bg-gray-100 opacity-40 grayscale pointer-events-none'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <div className={`absolute top-0 right-0 w-8 h-8 bg-${cond.color}-500 flex items-center justify-center rounded-bl-xl text-white`}>
                                                            <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                                        </div>
                                                    )}
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${isSelected ? `text-${cond.color}-600` : 'text-gray-400'}`}>
                                                        {cond.label}
                                                    </span>
                                                    <div className="flex justify-between items-end">
                                                        <p className="font-black text-gray-900 leading-none">
                                                            <span className="text-[10px]">TSH</span> {price.toLocaleString()}
                                                        </p>
                                                        <span className={`text-[10px] font-black ${stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {stock > 0 ? '✓ Available' : '✗ Unavailable'}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Serial Number / IMEI Scan Section */}
                            <div className={`bg-blue-50 rounded-xl p-4 border-2 transition-all ${formData.productId ? 'border-blue-200 opacity-100' : 'border-gray-100 opacity-50 grayscale pointer-events-none'}`}>
                                <label className="block text-sm font-semibold text-blue-700 mb-2">
                                    <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                                    Serial Number / IMEI (Recommended)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                        className="flex-1 px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 placeholder-blue-300"
                                        placeholder={formData.productId ? "Enter or Upload Photo" : "Select a product first..."}
                                        disabled={!formData.productId}
                                    />
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        id="serialNumberImageUpload"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={startScanner}
                                        disabled={!formData.productId || scannerLoading}
                                        className="w-14 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-md active:scale-95 disabled:bg-gray-400"
                                        title="Upload Photo to Extract Serial Number"
                                    >
                                        {scannerLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FontAwesomeIcon icon={faCamera} className="text-xl" />
                                        )}
                                    </button>
                                </div>
                                {!formData.productId && (
                                    <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase">
                                        ⚠️ Select a product above to enable scanning
                                    </p>
                                )}
                                {formData.productId && (
                                    <p className="text-[10px] text-blue-600 mt-2 font-medium italic">
                                        * Click 📷 to upload a photo. AI will extract the serial number automatically.
                                    </p>
                                )}
                            </div>

                            {formData.productId && (
                                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Selling Price</span>
                                        <span className="text-2xl font-bold text-green-600">TSH {parseInt(formData.sellingPrice).toLocaleString()}</span>
                                    </div>
                                    {hasTradeIn && formData.tradeInValue > 0 && (
                                        <div className="mt-3 pt-3 border-t border-green-200">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Trade-In Credit:</span>
                                                <span className="font-bold text-purple-600">- TSH {parseInt(formData.tradeInValue).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mt-2">
                                                <span className="font-semibold text-gray-700">Final Price:</span>
                                                <span className="text-xl font-bold text-green-600">TSH {(parseInt(formData.sellingPrice) - parseInt(formData.tradeInValue)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'CASH', label: 'Cash / Taslimu' },
                                        { value: 'M-PESA', label: 'M-Pesa (Vodacom)' },
                                        { value: 'TIGO_PESA', label: 'Tigo Pesa' },
                                        { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
                                        { value: 'HALOPESA', label: 'Halopesa (Halotel)' },
                                        { value: 'T-PESA', label: 'T-Pesa (TTCL)' },
                                        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                                        { value: 'CARD', label: 'Card Payment' },
                                        { value: 'MIXED', label: 'Mixed / Mchanganyiko' },
                                        { value: 'CUSTOM', label: 'Custom / Nyingine' }
                                    ].map(method => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, paymentMethod: method.value });
                                                if (method.value !== 'CUSTOM') setCustomPaymentMethod('');
                                            }}
                                            className={`px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${formData.paymentMethod === method.value
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {method.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Trade-In Selection Section */}
                                {customerTradeIns.length > 0 && (
                                    <div className="mt-6 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                                        <div className="flex items-center gap-2 mb-3 text-purple-800">
                                            <FontAwesomeIcon icon={faExchangeAlt} />
                                            <h4 className="font-bold">Available Trade-In Credit</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {customerTradeIns.map(ti => (
                                                <div
                                                    key={ti.id}
                                                    onClick={() => handleTradeInSelection(ti)}
                                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.tradeInId === ti.id
                                                        ? 'border-purple-500 bg-white'
                                                        : 'border-purple-100 bg-purple-50 hover:border-purple-300'}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-sm">{ti.deviceInfo?.brand} {ti.deviceInfo?.model}</p>
                                                            <p className="text-xs text-gray-600">Approved Value</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-purple-700">TSH {parseFloat(ti.approvedValue || 0).toLocaleString()}</p>
                                                            {formData.tradeInId === ti.id && (
                                                                <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full">SELECTED</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Breakdown Row */}
                                {formData.tradeInValue > 0 && (
                                    <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Price:</span>
                                            <span className="font-semibold italic line-through text-gray-400">TSH {parseFloat(formData.sellingPrice || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-purple-600">Trade-In Credit:</span>
                                            <span className="font-semibold text-purple-600">- TSH {formData.tradeInValue.toLocaleString()}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                                            <span className="text-gray-900">Amount Due:</span>
                                            <span className="text-green-600">TSH {(formData.sellingPrice - formData.tradeInValue).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Custom Payment Method Input */}
                                {formData.paymentMethod === 'CUSTOM' && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            value={customPaymentMethod}
                                            onChange={(e) => setCustomPaymentMethod(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                            placeholder="Enter custom payment method..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Trade-In Option */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border-2 border-purple-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasTradeIn}
                                        onChange={(e) => {
                                            setHasTradeIn(e.target.checked);
                                            if (e.target.checked) {
                                                setShowTradeInModal(true);
                                            }
                                        }}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faExchangeAlt} className="text-purple-600" />
                                            <span className="font-semibold text-gray-900">Customer has Trade-In?</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">Customer wants to trade-in old device</p>
                                    </div>
                                </label>
                            </div>

                            {/* Amount Paid */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Amount Paid (TSH) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amountPaid}
                                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="2100000"
                                />
                            </div>

                            {/* Delivery removed for simplicity - can be added separately after sale */}
                        </motion.div>
                    )}

                    {currentStep === 4 && (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
        >
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-semibold">{selectedCustomer?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Product</span>
                    <span className="font-semibold">{selectedProduct?.name} {selectedProduct?.model}</span>
                </div>
                {formData.serialNumber && (
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">SN/IMEI</span>
                        <span className="font-semibold text-blue-600">{formData.serialNumber}</span>
                    </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Selling Price</span>
                    <span className="font-semibold text-green-600">TSH {parseInt(formData.sellingPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold">
                        {formData.paymentMethod === 'CUSTOM' && customPaymentMethod
                            ? customPaymentMethod
                            : formData.paymentMethod}
                    </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold">TSH {parseInt(formData.amountPaid).toLocaleString()}</span>
                </div>
                {hasTradeIn && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Trade-In</span>
                        <span className="font-semibold text-purple-600">✓ Included</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

{/* Navigation Buttons */ }
<div className="flex gap-3 pt-6">
    {currentStep > 1 && (
        <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
        >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
        </button>
    )}

    {currentStep < 4 ? (
        <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
        >
            Next
            <FontAwesomeIcon icon={faArrowRight} />
        </button>
    ) : (
        <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
        >
            <FontAwesomeIcon icon={faCheckCircle} />
            {loading ? 'Recording...' : 'Record Sale'}
        </button>
    )}

    {currentStep === 1 && (
        <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
        >
            Cancel
        </button>
    )}
</div>
                </form >
            </div >

    {/* Confirmation Dialog */ }
{
    showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Sale</h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to record this sale?
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                        No
                    </button>
                    <button
                        onClick={() => {
                            console.log("Submitting with TradeInID:", tradeInId);
                            if (tradeInId) alert(`Linked Trade-In ID: ${tradeInId}`);
                            confirmSubmit();
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div >
    )
}

{/* Trade-In Modal */ }
{
    showTradeInModal && (
        <TradeInForm
            isOpen={showTradeInModal}
            onClose={() => setShowTradeInModal(false)}
            onSuccess={(data) => {
                console.log('Trade-In Success Data:', data);
                // Handle both possible data structures (nested data or direct)
                const tradeInObj = data.data?.tradeIn || data.tradeIn || data;
                if (tradeInObj && tradeInObj.id) {
                    setTradeInId(tradeInObj.id);
                    alert(`✅ Trade-In Linked! ID: ${tradeInObj.id}`);
                } else {
                    alert('⚠️ Trade-in submitted but ID missing in response.');
                    console.error('Missing tradeIn ID in:', data);
                }
                setShowTradeInModal(false);
            }}
            prefilledCustomer={selectedCustomer}
        />
    )
}
{/* Processing Overlay with Status */ }
<AnimatePresence>
    {showScanner && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
            <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md w-full">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-900 font-bold text-lg">AI Processing Image...</p>
                <div className="w-full bg-gray-100 rounded-lg p-4 text-left space-y-2 max-h-64 overflow-y-auto">
                    <p className="text-xs font-mono text-gray-600">📸 Image loaded</p>
                    <p className="text-xs font-mono text-gray-600">🎨 Enhancing contrast & brightness...</p>
                    <p className="text-xs font-mono text-gray-600">🔍 Running OCR...</p>
                    <p className="text-xs font-mono text-blue-600 font-bold">⏳ Looking for "Serial" keyword...</p>
                    <p className="text-xs font-mono text-gray-400 italic">Check browser console (F12) for detailed logs</p>
                </div>
            </div>
        </motion.div>
    )}
</AnimatePresence>
        </>
    );
};

export default RecordSaleForm;
