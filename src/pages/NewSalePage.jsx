import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faBarcode, faCreditCard, faArrowsRotate, faCheckCircle,
    faArrowLeft, faArrowRight, faMobileAlt, faSearch, faTimes, faTruck, faBan, faExchangeAlt, faCamera
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import api, { customerAPI, salesAPI } from '../utils/api';
import TradeInForm from '../components/TradeInForm';
import SerialScannerModal from '../components/SerialScannerModal';

const NewSalePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

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
        tradeInId: '',
        tradeInValue: 0,
        tradeInDeviceName: '',
        tradeInSerialNumber: '',
        isRegional: false,
        approximateDays: '3-5'
    });

    // UI state
    const [customers, setCustomers] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchSerial, setSearchSerial] = useState('');
    const [foundDevice, setFoundDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showTradeInForm, setShowTradeInForm] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);

    // API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Load customers
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await customerAPI.getAll();
            setCustomers(response.data.data.customers || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    // Serial number search
    const handleSerialSearch = async (serial) => {
        setSearchSerial(serial);

        if (serial.length < 1) {
            setFoundDevice(null);
            setSuggestions([]);
            return;
        }

        setSearching(true);
        try {
            const response = await api.get(`/serial-search/${serial.trim()}`);

            if (response.data.success) {
                setSuggestions(response.data.data);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
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
                    return formData.customerName.trim() !== '' && formData.customerPhone.trim() !== '';
                }
                return formData.customerId !== '';
            case 2: return formData.deviceId !== '';
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
            const saleData = {
                customerId: formData.isNewCustomer ? null : formData.customerId,
                customerName: formData.customerName, // Send name for new customer creation
                customerPhone: formData.customerPhone, // Send phone for new customer creation
                isNewCustomer: formData.isNewCustomer,
                productId: formData.productId,
                condition: formData.condition,
                deviceId: formData.deviceId,
                sellingPrice: parseFloat(formData.sellingPrice),
                paymentMethod: formData.paymentMethod === 'CUSTOM' ? formData.customPaymentMethod : formData.paymentMethod,
                amountPaid: parseFloat(formData.amountPaid),
                tradeInId: formData.tradeInId || null,
                serialNumber: formData.serialNumber,
                isRegional: formData.isRegional || false,
                approximateDays: formData.approximateDays || '3-5'
            };

            await salesAPI.create(saleData);
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
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all border border-white"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
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
                                        <FontAwesomeIcon icon={stepInfo.icon} className="text-sm" />
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
                                        <FontAwesomeIcon icon={faUser} className="text-2xl" />
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
                                            <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
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
                                                            <FontAwesomeIcon icon={faUser} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-extrabold text-gray-900 leading-tight mb-0.5">{customer.name}</h4>
                                                            <p className="premium-label text-[10px] mb-0">{customer.phone}</p>
                                                        </div>
                                                    </div>
                                                    {formData.customerId === customer.id && (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" />
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
                                                className="premium-input py-4"
                                            />
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
                                                Continue with New Customer <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
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
                                        <FontAwesomeIcon icon={faBarcode} className="text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Product Selection</h2>
                                        <p className="premium-label mb-0">Select or scan the product serial number</p>
                                    </div>
                                </div>

                                {/* Serial Number Input */}
                                <div className="relative mb-8 group">
                                    <FontAwesomeIcon icon={faBarcode} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={searchSerial}
                                        onChange={(e) => handleSerialSearch(e.target.value.toUpperCase())}
                                        placeholder="Enter Serial Number or IMEI..."
                                        className="premium-input !pl-16 !pr-48 py-4 uppercase"
                                        autoFocus
                                    />
                                    {searching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                        </div>
                                    )}

                                    {/* Scan Button */}
                                    <button
                                        onClick={() => setShowScannerModal(true)}
                                        className="absolute right-16 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faCamera} />
                                        <span className="hidden sm:inline">Scan</span>
                                    </button>

                                    {/* Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[500px] overflow-y-auto"
                                            >
                                                {suggestions.map((match) => (
                                                    <button
                                                        key={match.device.id}
                                                        onClick={() => handleSelectDevice(match)}
                                                        className="w-full p-5 flex items-start gap-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FontAwesomeIcon icon={faMobileAlt} className="text-blue-600" />
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

                                                            {/* Serial Number */}
                                                            <div className="mb-2">
                                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-bold">
                                                                    SN: {match.device.serialNumber}
                                                                </span>
                                                            </div>

                                                            {/* Specs as separate badges */}
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                {/* SIM Type Badge - First */}
                                                                {match.device.simType && (
                                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${match.device.simType === 'ESIM' ? 'bg-blue-100 text-blue-700' :
                                                                        match.device.simType === 'DUAL_SIM' ? 'bg-indigo-100 text-indigo-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {match.device.simType === 'ESIM' ? '📶 eSIM' :
                                                                            match.device.simType === 'DUAL_SIM' ? '📱📶 Dual' :
                                                                                '📱 Physical'}
                                                                    </span>
                                                                )}

                                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">
                                                                    💾 {match.device.storage}
                                                                </span>
                                                                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-md text-xs font-bold">
                                                                    🎨 {match.device.color}
                                                                </span>
                                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-xs font-bold uppercase">
                                                                    {match.device.condition}
                                                                </span>
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
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                                                <h3 className="text-lg font-bold text-green-900">Device Found!</h3>
                                            </div>
                                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">
                                                {foundDevice.device.status}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-green-100">
                                                    <FontAwesomeIcon icon={faMobileAlt} className="text-2xl text-green-600" />
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

                                                        <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md text-[10px] font-bold border border-green-100 uppercase">
                                                            {foundDevice.condition}
                                                        </span>
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
                                                <FontAwesomeIcon icon={faTruck} className="text-green-500" />
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
                                        </div>
                                    </motion.div>
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
                                        <FontAwesomeIcon icon={faArrowsRotate} className="text-2xl" />
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
                                        <FontAwesomeIcon icon={faBan} className="text-3xl mb-3 opacity-80" />
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
                                        <FontAwesomeIcon icon={faExchangeAlt} className="text-3xl mb-3 opacity-80" />
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
                                        <FontAwesomeIcon icon={faCreditCard} className="text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="premium-h2">Payment</h2>
                                        <p className="premium-label mb-0">Select payment method and amount</p>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                                    {['CASH', 'M-PESA', 'TIGOPESA', 'AIRTEL_MONEY', 'HALOPESA', 'BANK', 'CUSTOM'].map(method => (
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

                                {/* Price Summary */}
                                <div className="p-5 rounded-3xl bg-gray-50 space-y-3 border border-gray-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-bold uppercase tracking-wider">Product Price</span>
                                        <span className="font-bold text-gray-900">TSH {formData.sellingPrice.toLocaleString()}</span>
                                    </div>

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
                                            TSH {(formData.sellingPrice - (formData.tradeInValue || 0)).toLocaleString()}
                                        </span>
                                    </div>

                                    {formData.amountPaid && (
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200 mt-2">
                                            <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Change / Balance</span>
                                            <span className={`font-black text-lg ${parseFloat(formData.amountPaid) - (formData.sellingPrice - (formData.tradeInValue || 0)) >= 0
                                                ? 'text-emerald-500'
                                                : 'text-red-500'
                                                }`}>
                                                TSH {(parseFloat(formData.amountPaid || 0) - (formData.sellingPrice - (formData.tradeInValue || 0))).toLocaleString()}
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
                                            <div className="text-sm text-gray-600">Serial: <span className="font-bold">{formData.serialNumber}</span></div>
                                            <div className="text-sm text-gray-600 text-right">Condition: <span className="font-bold uppercase tracking-tighter">{formData.condition}</span></div>
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
                        handleSerialSearch(serial);
                        setShowScannerModal(false);
                    }}
                />
            </div>
        </div>
    );
};

export default NewSalePage;
