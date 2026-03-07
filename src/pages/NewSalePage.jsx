import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    ArrowLeftRight,
    Ban,
    Barcode,
    Camera,
    CheckCircle2,
    CreditCard,
    Search,
    Smartphone,
    Truck,
    User,
    X,
    Repeat2
} from 'lucide-react';
import axios from 'axios';
import api, { customerAPI, salesAPI, paymentAPI, API_URL } from '../utils/api';
import TradeInForm from '../components/TradeInForm';
import SerialScannerModal from '../components/SerialScannerModal';

const NewSalePage = () => {
    const API_URL_VAR = API_URL;
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const normalizeDiscountType = (t) => {
        const v = String(t || '').toUpperCase();
        if (v === 'PERCENT' || v === 'PERCENTAGE') return 'PERCENT';
        if (v === 'AMOUNT' || v === 'FIXED') return 'AMOUNT';
        return '';
    };

    const computeDiscountAmount = ({ baseAmount, discountType, discountValue }) => {
        const t = normalizeDiscountType(discountType);
        const val = parseFloat(discountValue);
        const base = parseFloat(baseAmount);
        if (!t || !Number.isFinite(val) || val <= 0) return 0;
        if (!Number.isFinite(base) || base <= 0) return 0;
        if (t === 'PERCENT') return Math.max(0, Math.min(base, (base * val) / 100));
        return Math.max(0, Math.min(base, val));
    };

    // Form data
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        isNewCustomer: false, // Flag for new customer
        serialNumber: '',
        productId: '',
        productName: '',
        deviceId: '',
        condition: '',
        sellingPrice: 0,
        paymentMethod: 'CASH',
        amountPaid: '',
        receiptMode: 'SINGLE', // SINGLE | SEPARATE
        invoiceDiscountType: 'AMOUNT', // AMOUNT | PERCENT
        invoiceDiscountValue: '',
        tradeInId: '',
        tradeInValue: 0,
        tradeInDeviceName: '',
        tradeInSerialNumber: '',
        isRegional: false,
        approximateDays: '3-5'
    });

    const [cartItems, setCartItems] = useState([]);

    // UI state
    const [customers, setCustomers] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchSerial, setSearchSerial] = useState('');
    const [foundDevice, setFoundDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showTradeInForm, setShowTradeInForm] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [searchMode, setSearchMode] = useState('SERIAL'); // 'SERIAL' or 'NAME'
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState(['CASH', 'M-PESA', 'TIGOPESA', 'AIRTEL_MONEY', 'HALOPESA', 'BANK']);

    const SALE_STEPS = [
        { icon: '📦', text: 'Packaging device...' },
        { icon: '🧾', text: 'Generating receipt...' },
        { icon: '💾', text: 'Saving to records...' },
        { icon: '📊', text: 'Updating inventory...' },
        { icon: '💬', text: 'Sending WhatsApp receipt...' },
        { icon: '✅', text: 'Finalising transfer...' },
    ];

    const loadingStepRef = useRef(0);
    useEffect(() => {
        if (!loading) { loadingStepRef.current = 0; setLoadingStep(0); return; }
        const interval = setInterval(() => {
            loadingStepRef.current = (loadingStepRef.current + 1) % SALE_STEPS.length;
            setLoadingStep(loadingStepRef.current);
        }, 1400);
        return () => clearInterval(interval);
    }, [loading]);

    // API URL

    // Load customers
    useEffect(() => {
        loadCustomers();
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const response = await paymentAPI.getMethods();
            if (response.data.success) {
                setPaymentMethods(response.data.data.methods);
            }
        } catch (error) {
            console.error('Failed to load payment methods:', error);
        }
    };

    const loadCustomers = async () => {
        try {
            const response = await customerAPI.getAll();
            setCustomers(response.data.data.customers || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    // Unified Product & Serial search
    const handleUnifiedSearch = async (query) => {
        setSearchSerial(query);
        if (query.length < 2) {
            setSuggestions([]);
            setProductSuggestions([]);
            return;
        }

        setSearching(true);
        try {
            const response = await api.get(`/stock/products`);
            const products = response.data.data || [];

            // 1. Find Products (by Name/Brand/Model)
            const filteredProducts = products.filter(p =>
                (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
                (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
                (p.model && p.model.toLowerCase().includes(query.toLowerCase()))
            );
            setProductSuggestions(filteredProducts);

            // 2. Find Specific Devices (by Serial/IMEI) - requires 3+ chars
            if (query.length >= 3) {
                const deviceMatches = [];
                products.forEach(product => {
                    if (product.devices && Array.isArray(product.devices)) {
                        product.devices.forEach(device => {
                            if (device.status === 'available' &&
                                device.serialNumber &&
                                device.serialNumber.toUpperCase().includes(query.toUpperCase())) {
                                deviceMatches.push({
                                    product: product,
                                    device: device,
                                    price: device.price || product.basePricing?.[device.condition] || 0,
                                    condition: device.condition
                                });
                            }
                        });
                    }
                });
                setSuggestions(deviceMatches);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectSimpleProduct = (product) => {
        setFoundDevice({
            product: product,
            device: { id: null, status: 'available' }, // No specific device
            price: product.basePricing?.nonActive || 0,
            condition: 'nonActive'
        });
        setFormData({
            ...formData,
            serialNumber: 'N/A',
            productId: product.id,
            productName: `${product.brand} ${product.name}`,
            deviceId: '', // Empty for non-tracked
            condition: 'nonActive',
            sellingPrice: product.basePricing?.nonActive || 0,
        });
        setProductSuggestions([]);
        setSearchSerial(`${product.brand} ${product.name}`);
    };

    const handleSelectDevice = (match) => {
        setFoundDevice(match);
        setFormData({
            ...formData,
            serialNumber: match.device.serialNumber,
            productId: match.product.id,
            productName: `${match.product.brand} ${match.product.name}`,
            deviceId: match.device.id,
            condition: match.device.condition,
            sellingPrice: match.device.price,
            supplierId: match.device.supplierId,
            supplierName: match.device.supplierName
        });
        setSuggestions([]);
        setSearchSerial(match.device.serialNumber);
    };

    const addSelectedToCart = () => {
        if (!foundDevice) return;

        const productId = formData.productId;
        const deviceId = formData.deviceId || null;
        const key = `${productId}__${deviceId || 'no_device'}__${formData.condition || ''}`;

        setCartItems((prev) => {
            const existingIndex = prev.findIndex(i => i.key === key);
            // For tracked devices: don't allow duplicates
            const trackSerials = foundDevice?.product?.trackSerials !== false;
            if (trackSerials && existingIndex !== -1) return prev;

            const newItem = {
                key,
                productId,
                productName: formData.productName || `${foundDevice.product?.brand || ''} ${foundDevice.product?.name || ''}`.trim(),
                deviceId,
                serialNumber: formData.serialNumber || '',
                condition: formData.condition || '',
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                quantity: trackSerials ? 1 : 1,
                discountType: '',
                discountValue: ''
            };

            if (existingIndex !== -1) {
                const next = [...prev];
                const qty = parseInt(next[existingIndex].quantity) || 1;
                next[existingIndex] = { ...next[existingIndex], quantity: qty + 1 };
                return next;
            }

            return [...prev, newItem];
        });

        setFoundDevice(null);
        setSearchSerial('');
        setFormData({
            ...formData,
            serialNumber: '',
            productId: '',
            productName: '',
            deviceId: '',
            condition: '',
            sellingPrice: 0,
            supplierId: '',
            supplierName: ''
        });
    };

    const updateCartItem = (key, patch) => {
        setCartItems((prev) => prev.map(i => (i.key === key ? { ...i, ...patch } : i)));
    };

    const removeCartItem = (key) => {
        setCartItems((prev) => prev.filter(i => i.key !== key));
    };

    const cartTotals = (() => {
        const items = cartItems.map((i) => {
            const qty = Math.max(1, parseInt(i.quantity) || 1);
            const unit = parseFloat(i.sellingPrice) || 0;
            const itemBase = unit;
            const itemDiscPerUnit = computeDiscountAmount({
                baseAmount: itemBase,
                discountType: i.discountType,
                discountValue: i.discountValue
            });
            const unitFinal = Math.max(0, itemBase - itemDiscPerUnit);
            return {
                ...i,
                quantity: qty,
                originalUnitPrice: itemBase,
                itemDiscountAmount: itemDiscPerUnit,
                finalUnitPrice: unitFinal,
                lineBase: itemBase * qty,
                lineItemDiscount: itemDiscPerUnit * qty,
                lineTotalAfterItemDiscount: unitFinal * qty
            };
        });

        const subtotalOriginal = items.reduce((s, i) => s + i.lineBase, 0);
        const itemDiscountTotal = items.reduce((s, i) => s + i.lineItemDiscount, 0);
        const subtotalAfterItemDiscount = items.reduce((s, i) => s + i.lineTotalAfterItemDiscount, 0);

        const invoiceDiscountAmount = computeDiscountAmount({
            baseAmount: subtotalAfterItemDiscount,
            discountType: formData.invoiceDiscountType,
            discountValue: formData.invoiceDiscountValue
        });

        const invoiceDiscountClamped = Math.max(0, Math.min(subtotalAfterItemDiscount, invoiceDiscountAmount));
        const totalAfterInvoiceDiscount = Math.max(0, subtotalAfterItemDiscount - invoiceDiscountClamped);

        const netPayable = Math.max(0, totalAfterInvoiceDiscount - (parseFloat(formData.tradeInValue) || 0));

        const paid = parseFloat(formData.amountPaid || 0) || 0;
        const balance = paid - netPayable;

        return {
            items,
            subtotalOriginal,
            itemDiscountTotal,
            subtotalAfterItemDiscount,
            invoiceDiscountAmount: invoiceDiscountClamped,
            totalAfterInvoiceDiscount,
            netPayable,
            paid,
            balance
        };
    })();

    // Navigation
    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Validation
    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                // Either existing customer selected OR new customer name/phone filled
                if (formData.isNewCustomer) {
                    const isDuplicate = customers.some(c => c.phone === formData.customerPhone);
                    return formData.customerName.trim() !== '' && formData.customerPhone.trim() !== '' && !isDuplicate;
                }
                return formData.customerId !== '';
            case 2:
                // At least one item in cart
                return cartItems.length > 0;
            case 3: return true; // Trade-in optional
            case 4: return formData.paymentMethod && formData.amountPaid;
            case 5: return true; // Review
            default: return false;
        }
    };

    // Submit
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const paymentMethod = formData.paymentMethod === 'CUSTOM' ? formData.customPaymentMethod : formData.paymentMethod;
            const paid = parseFloat(formData.amountPaid) || 0;

            if (formData.receiptMode === 'SEPARATE') {
                const baseForSplit = cartTotals.subtotalAfterItemDiscount || 0;
                const totalInvoiceDiscount = cartTotals.invoiceDiscountAmount || 0;

                // Split invoice discount proportionally by each item's total after item discount
                const split = cartTotals.items.map((i) => {
                    const ratio = baseForSplit > 0 ? (i.lineTotalAfterItemDiscount / baseForSplit) : 0;
                    return {
                        item: i,
                        invoiceDiscountShare: Math.max(0, totalInvoiceDiscount * ratio)
                    };
                });

                // Split amountPaid proportionally by final net payable per receipt
                const netPerReceipt = split.map((s) => {
                    const net = Math.max(0, (s.item.lineTotalAfterItemDiscount - s.invoiceDiscountShare));
                    return { ...s, net };
                });
                const totalNet = netPerReceipt.reduce((sum, x) => sum + x.net, 0);

                for (const part of netPerReceipt) {
                    const paidShare = totalNet > 0 ? (paid * (part.net / totalNet)) : 0;
                    const saleData = {
                        customerId: formData.isNewCustomer ? null : formData.customerId,
                        customerName: formData.customerName,
                        customerPhone: formData.customerPhone,
                        isNewCustomer: formData.isNewCustomer,
                        paymentMethod,
                        amountPaid: paidShare,
                        // Use fixed discountAmount per receipt after split
                        discountAmount: part.invoiceDiscountShare,
                        discountNote: 'Invoice discount split across separate receipts',
                        items: [
                            {
                                productId: part.item.productId,
                                deviceId: part.item.deviceId,
                                quantity: part.item.quantity,
                                sellingPrice: part.item.originalUnitPrice,
                                discountType: part.item.discountType,
                                discountValue: part.item.discountValue
                            }
                        ],
                        tradeInId: formData.tradeInId || null,
                        isRegional: formData.isRegional || false,
                        approximateDays: formData.approximateDays || '3-5'
                    };

                    await salesAPI.create(saleData);
                }
            } else {
                const saleData = {
                    customerId: formData.isNewCustomer ? null : formData.customerId,
                    customerName: formData.customerName,
                    customerPhone: formData.customerPhone,
                    isNewCustomer: formData.isNewCustomer,
                    paymentMethod,
                    amountPaid: paid,
                    invoiceDiscountType: formData.invoiceDiscountType,
                    invoiceDiscountValue: formData.invoiceDiscountValue,
                    discountAmount: cartTotals.invoiceDiscountAmount,
                    items: cartTotals.items.map((i) => ({
                        productId: i.productId,
                        deviceId: i.deviceId,
                        quantity: i.quantity,
                        sellingPrice: i.originalUnitPrice,
                        discountType: i.discountType,
                        discountValue: i.discountValue
                    })),
                    tradeInId: formData.tradeInId || null,
                    isRegional: formData.isRegional || false,
                    approximateDays: formData.approximateDays || '3-5'
                };

                await salesAPI.create(saleData);
            }

            alert('✅ Sale completed successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create sale:', error);
            alert(error.response?.data?.message || 'Failed to create sale');
        } finally {
            setLoading(false);
        }
    };

    // Filtered customers
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.phone.includes(searchCustomer)
    );

    // Step info
    const getStepInfo = (step) => {
        const steps = [
            { icon: faUser, title: 'Customer', color: 'from-blue-500 to-blue-600' },
            { icon: faBarcode, title: 'Serial Number', color: 'from-green-500 to-green-600' },
            { icon: faArrowsRotate, title: 'Trade-In', color: 'from-orange-500 to-pink-600' },
            { icon: faCreditCard, title: 'Payment', color: 'from-indigo-500 to-purple-600' },
            { icon: faCheckCircle, title: 'Review', color: 'from-emerald-500 to-teal-600' }
        ];
        return steps[step - 1];
    };

    const getStepClasses = (step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const base = "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-4 border-white shadow-lg ";
        if (isActive) return base + "bg-blue-600 text-white scale-110";
        if (isCompleted) return base + "bg-emerald-500 text-white";
        return base + "bg-gray-100 text-gray-400";
    };

    return (
        <div className="premium-bg p-4 md:p-8 pb-32">

            {/* ✨ ANIMATED SALE PROCESSING OVERLAY */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#008069] via-[#00a884] to-[#005c4b]"
                    >
                        {/* Background blobs */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-sm">
                            {/* Pulsing icon */}
                            <motion.div
                                key={loadingStep}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="w-28 h-28 bg-white/15 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border border-white/20"
                            >
                                {SALE_STEPS[loadingStep].icon}
                            </motion.div>

                            {/* Title */}
                            <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Processing Sale</p>
                                <motion.h2
                                    key={`text-${loadingStep}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-white text-2xl font-black tracking-tight"
                                >
                                    {SALE_STEPS[loadingStep].text}
                                </motion.h2>
                            </div>

                            {/* Step dots */}
                            <div className="flex items-center gap-2">
                                {SALE_STEPS.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ width: i === loadingStep ? 28 : 8, opacity: i === loadingStep ? 1 : 0.35 }}
                                        className="h-2 rounded-full bg-white"
                                    />
                                ))}
                            </div>

                            {/* Animated progress bar */}
                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white rounded-full"
                                    animate={{ width: `${((loadingStep + 1) / SALE_STEPS.length) * 100}%` }}
                                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                                />
                            </div>

                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Please wait, do not close this page</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all border border-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="premium-label mb-0">New Sale</p>
                            <h1 className="premium-h1">Register New Sale</h1>
                        </div>
                    </div>
                </div>

                <div className="premium-card p-10 mb-10">
                    <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-100 -z-0" />
                        {[1, 2, 3, 4, 5].map((stepNo) => {
                            const stepInfo = getStepInfo(stepNo);
                            return (
                                <div key={stepNo} className="relative z-10 flex flex-col items-center gap-4">
                                    <div className={getStepClasses(stepNo)}>
                                        <stepInfo.icon className="w-5 h-5" />
                                    </div>
                                    <span className={"text-[9px] font-black uppercase tracking-widest " + (stepNo === currentStep ? "text-blue-600" : "text-gray-400")}>
                                        {stepInfo.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Customer Selection */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="premium-card p-8 md:p-10"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="premium-icon-box bg-blue-50 text-blue-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Customer Information</h2>
                                        <p className="premium-label mb-0">Select or add a customer</p>
                                    </div>
                                </div>

                                {/* Toggle: Search vs New */}
                                <div className="flex p-1 bg-gray-100 rounded-xl mb-8 w-fit">
                                    <button
                                        onClick={() => setFormData({ ...formData, isNewCustomer: false, customerId: '', customerName: '', customerPhone: '' })}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!formData.isNewCustomer ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Search Existing
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, isNewCustomer: true, customerId: '', customerName: '', customerPhone: '' })}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.isNewCustomer ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Add New Customer
                                    </button>
                                </div>

                                {!formData.isNewCustomer ? (
                                    <>
                                        {/* Search Mode */}
                                        <div className="relative mb-8 group">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={searchCustomer}
                                                onChange={(e) => setSearchCustomer(e.target.value)}
                                                placeholder="Search by name or mobile number..."
                                                className="premium-input !pl-16 py-4"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Customer List */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                            {filteredCustomers.slice(0, 10).map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            customerId: customer.id,
                                                            customerName: customer.name,
                                                            customerPhone: customer.phone,
                                                            isNewCustomer: false
                                                        });
                                                        setSearchCustomer('');
                                                        handleNext();
                                                    }}
                                                    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group ${formData.customerId === customer.id
                                                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                        : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors shadow-sm">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-extrabold text-gray-900 leading-tight mb-0.5">{customer.name}</h4>
                                                            <p className="premium-label text-[10px] mb-0">{customer.phone}</p>
                                                        </div>
                                                    </div>
                                                    {formData.customerId === customer.id && (
                                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    /* New Customer Mode */
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <label className="premium-label ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                placeholder="Enter customer name..."
                                                className="premium-input py-4"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="premium-label ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                placeholder="e.g. 0712345678"
                                                className={`premium-input py-4 ${customers.some(c => c.phone === formData.customerPhone) ? 'border-red-400 focus:ring-red-500/10' : ''}`}
                                            />
                                            {formData.isNewCustomer && formData.customerPhone && customers.some(c => c.phone === formData.customerPhone) && (
                                                <p className="text-red-500 text-[10px] font-bold mt-2 animate-pulse">
                                                    ⚠️ Mteja mwenye namba hii tayari yupo! (This phone number is already registered)
                                                </p>
                                            )}
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                onClick={handleNext}
                                                disabled={!formData.customerName || !formData.customerPhone}
                                                className={`w-full py-4 rounded-xl font-bold transition-all ${formData.customerName && formData.customerPhone
                                                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Continue with New Customer <ArrowRight className="inline-block w-4 h-4 ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 2: Serial Number Search */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="premium-card p-8 md:p-10 min-h-[600px]"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="premium-icon-box bg-purple-50 text-purple-500">
                                        <Barcode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Product Selection</h2>
                                        <p className="premium-label mb-0">Search product name or scan serial number</p>
                                    </div>
                                </div>

                                {/* Unified Search Input */}
                                <div className="relative mb-8 group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={searchSerial}
                                        onChange={(e) => handleUnifiedSearch(e.target.value)}
                                        placeholder="Type product name (e.g. Speaker) or scan serial..."
                                        className="premium-input !pl-16 py-4 uppercase !pr-48"
                                        autoFocus
                                    />
                                    {searching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowScannerModal(true)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span className="hidden sm:inline">Scan</span>
                                    </button>

                                    {/* Combined Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {(suggestions.length > 0 || productSuggestions.length > 0) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[500px] overflow-y-auto"
                                            >
                                                {/* Devices (by Serial) */}
                                                {suggestions.length > 0 && (
                                                    <div className="p-3 bg-blue-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-blue-500">
                                                        Matched Devices (by Serial)
                                                    </div>
                                                )}
                                                {suggestions.map((match) => (
                                                    <button
                                                        key={match.device.id}
                                                        onClick={() => {
                                                            handleSelectDevice(match);
                                                            setSuggestions([]);
                                                            setProductSuggestions([]);
                                                        }}
                                                        className="w-full p-5 flex items-start gap-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Smartphone className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-black text-base text-gray-900 leading-tight">
                                                                    {match.product.brand} {match.product.name}
                                                                </h4>
                                                                <span className="text-sm font-black text-blue-600 whitespace-nowrap ml-3">
                                                                    {match.price.toLocaleString()} TZS
                                                                </span>
                                                            </div>
                                                            <div className="mb-2">
                                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-bold">
                                                                    SN: {match.device.serialNumber}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}

                                                {/* Products (by Name) */}
                                                {productSuggestions.length > 0 && (
                                                    <div className="p-3 bg-purple-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-purple-500">
                                                        Products (by Name)
                                                    </div>
                                                )}
                                                {productSuggestions.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => {
                                                            if (product.quantity <= 0) return;
                                                            handleSelectSimpleProduct(product);
                                                            setSuggestions([]);
                                                            setProductSuggestions([]);
                                                        }}
                                                        disabled={product.quantity <= 0}
                                                        className={`w-full p-5 flex items-start gap-4 transition-colors text-left border-b border-gray-50 last:border-0 ${product.quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-purple-50'}`}
                                                    >
                                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Smartphone className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-black text-base text-gray-900 leading-tight">
                                                                    {product.brand} {product.name}
                                                                </h4>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-black text-purple-600">
                                                                        {product.basePricing?.nonActive?.toLocaleString()} TZS
                                                                    </div>
                                                                    <div className={`text-[10px] font-bold ${product.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {product.quantity || 0} IN STOCK
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase">
                                                                    {product.category}
                                                                </span>
                                                                {product.trackSerials === false && (
                                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[10px] font-bold uppercase">
                                                                        QUANTITY-BASED
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Found Device */}
                                {foundDevice && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <h3 className="text-lg font-bold text-green-900">Device Found!</h3>
                                            </div>
                                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">
                                                {foundDevice.device.status}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-green-100">
                                                    <Smartphone className="w-7 h-7 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-xl text-gray-900 break-words">
                                                        {foundDevice.product.brand} {foundDevice.product.name}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {/* SIM Type Badge */}
                                                        {foundDevice.device.simType && (
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border border-green-100 ${foundDevice.device.simType === 'ESIM' ? 'bg-blue-50 text-blue-700' :
                                                                foundDevice.device.simType === 'DUAL_SIM' ? 'bg-indigo-50 text-indigo-700' :
                                                                    'bg-gray-50 text-gray-700'
                                                                }`}>
                                                                {foundDevice.device.simType === 'ESIM' ? '📶 eSIM' :
                                                                    foundDevice.device.simType === 'DUAL_SIM' ? '📱📶 Dual' :
                                                                        '📱 Physical'}
                                                            </span>
                                                        )}

                                                        {foundDevice.product.trackSerials !== false && (
                                                            <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md text-[10px] font-bold border border-green-100 uppercase">
                                                                {foundDevice.condition}
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md text-[10px] font-bold border border-green-100">
                                                            {foundDevice.device.storage}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md text-[10px] font-bold border border-green-100">
                                                            {foundDevice.device.color}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-green-100">
                                                <Truck className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-semibold text-gray-600">Supplier:</span>
                                                <span className="text-sm font-black text-gray-900">{foundDevice.device.supplierName}</span>
                                            </div>

                                            <div className="pt-3 border-t border-green-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-semibold">Selling Price:</span>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-green-600">
                                                            {foundDevice.price.toLocaleString()} TZS
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={addSelectedToCart}
                                                    className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] bg-gray-900 text-white shadow-lg hover:scale-[1.01] transition-all"
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        addSelectedToCart();
                                                        handleNext();
                                                    }}
                                                    className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
                                                >
                                                    Add & Continue
                                                    <ArrowRight className="inline-block w-4 h-4 ml-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Cart */}
                                {cartItems.length > 0 && (
                                    <div className="mt-8 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cart Items</p>
                                            <p className="text-sm font-black text-gray-900">{cartItems.length} item(s)</p>
                                        </div>

                                        <div className="space-y-3">
                                            {cartTotals.items.map((i) => (
                                                <div key={i.key} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-black text-gray-900 truncate">{i.productName}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                                {i.serialNumber ? `SN: ${i.serialNumber}` : (i.condition ? i.condition : 'ITEM')}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCartItem(i.key)}
                                                            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-all text-[10px] font-black uppercase tracking-widest"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Qty</label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={i.quantity}
                                                                onChange={(e) => updateCartItem(i.key, { quantity: e.target.value })}
                                                                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 font-black"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={i.originalUnitPrice}
                                                                onChange={(e) => updateCartItem(i.key, { sellingPrice: e.target.value })}
                                                                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 font-black"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Item Discount</label>
                                                            <div className="flex gap-2">
                                                                <select
                                                                    value={i.discountType || ''}
                                                                    onChange={(e) => updateCartItem(i.key, { discountType: e.target.value })}
                                                                    className="px-3 py-3 bg-white rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest"
                                                                >
                                                                    <option value="">None</option>
                                                                    <option value="AMOUNT">Amt</option>
                                                                    <option value="PERCENT">%</option>
                                                                </select>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={i.discountValue ?? ''}
                                                                    onChange={(e) => updateCartItem(i.key, { discountValue: e.target.value })}
                                                                    className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 font-black"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Line Total</label>
                                                            <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 font-black text-gray-900">
                                                                {Math.round(i.lineTotalAfterItemDiscount).toLocaleString()} TZS
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 p-4 rounded-2xl bg-gray-900 text-white">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Subtotal</span>
                                                <span className="font-black">{Math.round(cartTotals.subtotalAfterItemDiscount).toLocaleString()} TZS</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Not Found Message */}
                                {searchSerial.length >= 3 && !foundDevice && !searching && (
                                    <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-center">
                                        <p className="text-yellow-800">Serial number not found. Please check and try again.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Trade-In (Formerly Step 4) */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="premium-card p-8 md:p-10"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="premium-icon-box bg-orange-50 text-orange-500">
                                        <Repeat2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Trade-In Device</h2>
                                        <p className="premium-label mb-0">Add a trade-in device to this sale</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            setFormData({ ...formData, hasTradeIn: false, tradeInId: '', tradeInValue: 0, tradeInDeviceName: '', tradeInSerialNumber: '' });
                                            handleNext(); // Auto advance if skipping
                                        }}
                                        className={`p-6 rounded-2xl border-2 transition-all ${!formData.hasTradeIn
                                            ? 'border-red-500 bg-red-50 text-red-700 shadow-lg'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Ban className="w-8 h-8 mb-3 opacity-80" />
                                        <div className="font-black uppercase text-[10px] tracking-widest">No Trade-In</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFormData({ ...formData, hasTradeIn: true });
                                            setShowTradeInForm(true);
                                        }}
                                        className={`p-6 rounded-2xl border-2 transition-all ${formData.hasTradeIn
                                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg'
                                            : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <ArrowLeftRight className="w-8 h-8 mb-3 opacity-80" />
                                        <div className="font-bold uppercase text-[10px] tracking-widest">Add Trade-In</div>
                                    </button>
                                </div>

                                {formData.tradeInValue > 0 && (
                                    <div className="mt-6 p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">Trade-In Applied</p>
                                                <p className="font-bold text-orange-900">{formData.tradeInDeviceName}</p>
                                            </div>
                                            <span className="text-3xl font-black text-orange-600">
                                                - TSH {formData.tradeInValue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 4: Payment (Formerly Step 3) */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="premium-card p-8 md:p-10"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="premium-icon-box bg-emerald-50 text-emerald-500">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Payment</h2>
                                        <p className="premium-label mb-0">Select payment method and amount</p>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                                    {paymentMethods.map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                            className={`p-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${formData.paymentMethod === method
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                                                : 'border-gray-50 bg-gray-50/50 hover:bg-white text-gray-400 hover:text-gray-700 hover:border-gray-200'
                                                }`}
                                        >
                                            {method.replace('_', ' ')}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'CUSTOM' })}
                                        className={`p-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${formData.paymentMethod === 'CUSTOM'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                                            : 'border-gray-50 bg-gray-50/50 hover:bg-white text-gray-400 hover:text-gray-700 hover:border-gray-200'
                                            }`}
                                    >
                                        + CUSTOM
                                    </button>
                                </div>

                                {/* Custom Payment Method Input */}
                                {formData.paymentMethod === 'CUSTOM' && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Specify Payment Method</label>
                                        <input
                                            type="text"
                                            value={formData.customPaymentMethod || ''}
                                            onChange={(e) => setFormData({ ...formData, customPaymentMethod: e.target.value.toUpperCase() })}
                                            placeholder="e.g. CHEQUE, EXCHANGE, ESCROW..."
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-indigo-500/10 shadow-inner uppercase"
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {/* Payload Value */}
                                <div className="mb-8">
                                    <label className="premium-label ml-1">Amount Paid (TZS)</label>
                                    <input
                                        type="number"
                                        value={formData.amountPaid}
                                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                        placeholder="Enter transaction amount..."
                                        className="premium-input text-2xl font-black py-4"
                                    />
                                </div>

                                {/* Receipt Mode */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Receipt Mode</label>
                                    <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, receiptMode: 'SINGLE' })}
                                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.receiptMode === 'SINGLE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            One Receipt
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, receiptMode: 'SEPARATE' })}
                                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.receiptMode === 'SEPARATE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Separate
                                        </button>
                                    </div>
                                    {formData.receiptMode === 'SEPARATE' && (
                                        <p className="text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-widest">
                                            Invoice discount will be split proportionally across receipts.
                                        </p>
                                    )}
                                </div>

                                {/* Invoice Discount */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Invoice Discount</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <select
                                            value={formData.invoiceDiscountType}
                                            onChange={(e) => setFormData({ ...formData, invoiceDiscountType: e.target.value })}
                                            className="px-5 py-4 bg-gray-50 rounded-2xl text-sm font-black border-0 focus:ring-4 focus:ring-indigo-500/10 shadow-inner uppercase"
                                        >
                                            <option value="AMOUNT">Amount</option>
                                            <option value="PERCENT">Percent</option>
                                        </select>
                                        <input
                                            type="number"
                                            min={0}
                                            value={formData.invoiceDiscountValue}
                                            onChange={(e) => setFormData({ ...formData, invoiceDiscountValue: e.target.value })}
                                            placeholder={formData.invoiceDiscountType === 'PERCENT' ? 'e.g. 5' : 'e.g. 10000'}
                                            className="sm:col-span-2 px-6 py-4 bg-gray-50 rounded-2xl text-sm font-black border-0 focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="p-5 rounded-3xl bg-gray-50 space-y-3 border border-gray-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-bold uppercase tracking-wider">Subtotal</span>
                                        <span className="font-bold text-gray-900">TSH {Math.round(cartTotals.subtotalOriginal).toLocaleString()}</span>
                                    </div>

                                    {cartTotals.itemDiscountTotal > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold uppercase tracking-wider">Item Discounts</span>
                                            <span className="font-bold text-gray-900">- TSH {Math.round(cartTotals.itemDiscountTotal).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {cartTotals.invoiceDiscountAmount > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold uppercase tracking-wider">Invoice Discount</span>
                                            <span className="font-bold text-gray-900">- TSH {Math.round(cartTotals.invoiceDiscountAmount).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {formData.tradeInValue > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-orange-500 font-bold uppercase tracking-wider">Trade-In Credit</span>
                                            <span className="font-bold text-orange-600">- TSH {formData.tradeInValue.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-200 my-2" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 font-black uppercase tracking-wider text-sm">Net Payable</span>
                                        <span className="font-black text-2xl text-gray-900">
                                            TSH {Math.round(cartTotals.netPayable).toLocaleString()}
                                        </span>
                                    </div>

                                    {formData.amountPaid && (
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200 mt-2">
                                            <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Change / Balance</span>
                                            <span className={`font-black text-lg ${cartTotals.balance >= 0
                                                ? 'text-emerald-500'
                                                : 'text-red-500'
                                                }`}>
                                                TSH {Math.round(cartTotals.balance).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Regional Customer Toggle */}
                                <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FontAwesomeIcon icon={faTruck} className="text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-1">Regional Delivery?</h4>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Customer is outside Dar es Salaam (Arusha, Mwanza, etc.)
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isRegional: !formData.isRegional })}
                                                className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${formData.isRegional
                                                    ? 'border-orange-500 bg-orange-100 shadow-md'
                                                    : 'border-orange-200 bg-white hover:border-orange-300'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${formData.isRegional ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                                                    }`}>
                                                    {formData.isRegional && (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                                                    )}
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-bold text-gray-900">
                                                        {formData.isRegional ? '✓ Regional Customer' : 'Local Customer (Dar es Salaam)'}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {formData.isRegional
                                                            ? 'Will receive delivery timeline message (3-5 days)'
                                                            : 'Will receive standard confirmation'}
                                                    </p>
                                                </div>
                                            </button>

                                            {/* Approximate Days Input - Shows when regional is checked */}
                                            {formData.isRegional && (
                                                <div className="mt-3 p-3 bg-white rounded-xl border-2 border-orange-300 animate-in fade-in slide-in-from-top-2">
                                                    <label className="block text-xs font-bold text-gray-700 mb-2">
                                                        📅 Approximate Delivery Time (Days)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.approximateDays}
                                                        onChange={(e) => setFormData({ ...formData, approximateDays: e.target.value })}
                                                        placeholder="e.g., 3-5, 2-3, 5-7"
                                                        className="w-full px-4 py-2 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-sm font-bold"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Will show as "Kitaufikia kati ya siku {formData.approximateDays}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="premium-card p-8 md:p-10"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="premium-icon-box bg-emerald-50 text-emerald-500">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Review Sale</h2>
                                        <p className="premium-label mb-0">Check all details before finishing the sale</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Customer */}
                                    <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
                                        <div className="text-sm text-blue-600 font-semibold mb-1">Customer</div>
                                        <div className="font-bold text-lg">{formData.customerName}</div>
                                        <div className="text-sm text-gray-600">{formData.customerPhone}</div>
                                    </div>

                                    {/* Product */}
                                    <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-200">
                                        <div className="text-sm text-green-600 font-semibold mb-1">Product Details</div>
                                        <div className="font-bold text-lg">{formData.productName}</div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">Serial: <span className="font-bold">{formData.serialNumber}</span></div>
                                            {foundDevice?.product?.trackSerials !== false && (
                                                <div className="text-sm text-gray-600 text-right">Condition: <span className="font-bold uppercase tracking-tighter">{formData.condition}</span></div>
                                            )}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-green-100 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faTruck} className="text-green-500 text-xs" />
                                            <div className="text-xs text-gray-600">Supplier: <span className="font-bold">{formData.supplierName}</span></div>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200">
                                        <div className="text-sm border-b border-indigo-100 pb-2 mb-2 font-black uppercase tracking-widest text-indigo-400">Payment Breakdown</div>
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="font-bold">
                                                {formData.paymentMethod === 'CUSTOM' ? formData.customPaymentMethod : formData.paymentMethod}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-sm border-b border-indigo-100 pb-2">
                                            <span className="text-gray-600 font-semibold uppercase tracking-tighter">Amount Paid:</span>
                                            <span className="font-black text-indigo-600 text-lg">TSH {parseFloat(formData.amountPaid || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Device Price:</span>
                                            <span className="font-bold text-gray-900">TSH {formData.sellingPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Trade-In */}
                                    {formData.hasTradeIn && formData.tradeInValue > 0 && (
                                        <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-200">
                                            <div className="text-sm border-b border-orange-200/50 pb-2 mb-2 font-black uppercase tracking-widest text-orange-400">Trade-In Details</div>
                                            <div className="font-bold text-md mb-2">{formData.tradeInDeviceName}</div>
                                            <div className="flex justify-between items-center text-xs text-orange-900/70 mb-3 pb-3 border-b border-orange-200/50">
                                                <span>S/N: {formData.tradeInSerialNumber}</span>
                                                <span className="font-black">Credit: - TSH {formData.tradeInValue.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-600 uppercase tracking-tighter">Due After Trade-In:</span>
                                                <span className="font-black text-xl text-orange-600">
                                                    TSH {(formData.sellingPrice - formData.tradeInValue).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${currentStep === 1 ? 'opacity-0 cursor-default' : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-900 shadow-lg'}`}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-3" />
                            Back
                        </button>
                        {currentStep < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className={`py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${isStepValid()
                                    ? 'premium-btn-primary shadow-2xl shadow-blue-500/20'
                                    : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                Next Step
                                <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="py-5 rounded-3xl bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Complete Sale'}
                                <FontAwesomeIcon icon={faCheckCircle} className="ml-3 text-emerald-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Trade-In Form Modal */}
                {
                    showTradeInForm && (
                        <TradeInForm
                            isOpen={showTradeInForm}
                            onClose={() => setShowTradeInForm(false)}
                            onSuccess={(response) => {
                                const tradeIn = response.data.tradeIn;
                                setFormData({
                                    ...formData,
                                    tradeInId: tradeIn.id,
                                    tradeInValue: parseFloat(tradeIn.valuation || 0),
                                    tradeInDeviceName: `${tradeIn.deviceInfo.brand} ${tradeIn.deviceInfo.model}`,
                                    tradeInSerialNumber: tradeIn.deviceInfo.serialNumber
                                });
                                setShowTradeInForm(false);
                            }}
                            prefilledCustomer={{
                                id: formData.customerId,
                                name: formData.customerName,
                                phone: formData.customerPhone
                            }}
                        />
                    )
                }

                {/* Serial Scanner Modal */}
                <SerialScannerModal
                    isOpen={showScannerModal}
                    onClose={() => setShowScannerModal(false)}
                    onSerialDetected={(serial) => {
                        handleUnifiedSearch(serial);
                        setShowScannerModal(false);
                    }}
                />
            </div>
        </div>
    );
};

export default NewSalePage;
