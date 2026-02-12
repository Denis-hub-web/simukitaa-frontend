import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faShoppingBag,
    faStar,
    faCreditCard,
    faArrowsRotate,
    faCheckCircle,
    faLightbulb,
    faArrowLeft,
    faArrowRight,
    faTimes,
    faUserPlus,
    faSearch,
    faMobileAlt,
    faLaptop,
    faTabletAlt,
    faHeadphones,
    faBox
} from '@fortawesome/free-solid-svg-icons';
import { salesAPI, productAPI, customerAPI } from '../utils/api';
import axios from 'axios';
import TradeInForm from './TradeInForm';

const ConversationalSaleForm = ({ onSuccess, onCancel }) => {
    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

    // Form data
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        productId: '',
        productName: '',
        condition: '',
        deviceId: '',
        sellingPrice: '',
        paymentMethod: 'CASH',
        amountPaid: '',
        tradeInId: '',
        tradeInValue: 0,
        hasTradeIn: false,
        serialNumber: '',
        isRegional: false,
        approximateDays: '3-5'
    });

    // Data from API
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // UI states
    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchProduct, setSearchProduct] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [showTradeInModal, setShowTradeInModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Dynamically determine API URL (same logic as api.js)
            const hostname = window.location.hostname;
            let API_URL;
            if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                API_URL = `http://${hostname}:5000/api`;
            } else {
                API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            }

            console.log('Loading data from:', API_URL);
            console.log('Token exists:', !!token);

            const [customersRes, productsRes] = await Promise.all([
                customerAPI.getAll(),
                axios.get(`${API_URL}/condition-stock`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            console.log('Loaded customers:', customersRes.data.data.customers?.length);
            console.log('Loaded products:', productsRes.data.data.products?.length);
            console.log('Sample product:', productsRes.data.data.products?.[0]);

            setCustomers(customersRes.data.data.customers || []);
            setProducts(productsRes.data.data.products || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            // Don't show alert, just log the error
        }
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

    const handleStepClick = (step) => {
        if (step <= currentStep) {
            setCurrentStep(step);
        }
    };

    // Validation
    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.customerId !== '';
            case 2: return formData.productId !== '';
            case 3: {
                // Require condition
                if (!formData.condition) return false;
                // If product has devices for this condition, require device selection
                const selectedProduct = products.find(p => p.id === formData.productId);
                if (selectedProduct?.devices) {
                    const availableDevices = selectedProduct.devices.filter(
                        d => d.condition === formData.condition && d.status === 'in_stock'
                    );
                    if (availableDevices.length > 0) {
                        return formData.deviceId !== '';
                    }
                }
                return true;
            }
            case 4: return formData.paymentMethod !== '' && formData.amountPaid !== '';
            case 5: return true; // Trade-in is optional
            case 6: return true; // Review step
            default: return false;
        }
    };

    // Submit
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const saleData = {
                customerId: formData.customerId,
                productId: formData.productId,
                condition: formData.condition,
                deviceId: formData.deviceId || null,
                sellingPrice: parseFloat(formData.sellingPrice),
                paymentMethod: formData.paymentMethod,
                amountPaid: parseFloat(formData.amountPaid),
                tradeInId: formData.tradeInId || null,
                serialNumber: formData.serialNumber || '',
                isRegional: formData.isRegional || false,
                approximateDays: formData.approximateDays || '3-5'
            };

            const response = await salesAPI.create(saleData);
            console.log('Sale created successfully:', response.data);
            onSuccess();
        } catch (error) {
            console.error('Failed to create sale:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create sale. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Get step info
    const getStepInfo = (step) => {
        const steps = [
            { icon: faUser, title: 'Customer', color: 'from-blue-500 to-blue-600' },
            { icon: faShoppingBag, title: 'Product', color: 'from-green-500 to-green-600' },
            { icon: faStar, title: 'Condition', color: 'from-yellow-500 to-orange-600' },
            { icon: faCreditCard, title: 'Payment', color: 'from-indigo-500 to-blue-600' },
            { icon: faArrowsRotate, title: 'Trade-In', color: 'from-purple-500 to-pink-600' },
            { icon: faCheckCircle, title: 'Review', color: 'from-green-500 to-emerald-600' }
        ];
        return steps[step - 1];
    };

    // Filtered data
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.phone.includes(searchCustomer)
    );

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
                {/* Header with Progress */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Quick Sale</h2>
                            <p className="text-blue-100 text-sm">Step {currentStep} of {totalSteps}</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-2">
                        {[...Array(totalSteps)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleStepClick(i + 1)}
                                className={`h-2 rounded-full transition-all ${i + 1 <= currentStep
                                    ? 'bg-white flex-1'
                                    : 'bg-white/20 w-8'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Step 1: Customer Selection */}
                            {currentStep === 1 && (
                                <div className="max-w-2xl mx-auto">
                                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${getStepInfo(1).color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                        <FontAwesomeIcon icon={faUser} className="text-3xl text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-center mb-2">Who is the customer?</h3>
                                    <p className="text-gray-500 text-center mb-8">Search by name or phone number</p>

                                    {/* Search Input */}
                                    <div className="relative mb-6">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchCustomer}
                                            onChange={(e) => setSearchCustomer(e.target.value)}
                                            placeholder="Start typing name or phone..."
                                            className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Customer Results */}
                                    {!formData.customerId && (
                                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.slice(0, 10).map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                customerId: customer.id,
                                                                customerName: customer.name,
                                                                customerPhone: customer.phone
                                                            });
                                                            setSearchCustomer('');
                                                        }}
                                                        className="w-full p-4 rounded-2xl border-2 transition-all text-left border-gray-200 hover:border-blue-300 bg-white"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                                <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-lg">{customer.name}</h4>
                                                                <p className="text-sm text-gray-500">{customer.phone}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-center text-gray-500 py-4">
                                                    {searchCustomer ? 'No customers found' : 'Loading customers...'}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Selected Customer */}
                                    {formData.customerId && !searchCustomer && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 mb-6">
                                            <div className="flex items-center gap-3">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-2xl" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-blue-600 font-bold">Selected Customer</p>
                                                    <p className="font-bold text-lg">{formData.customerName}</p>
                                                    <p className="text-sm text-gray-600">{formData.customerPhone}</p>
                                                </div>
                                                <button
                                                    onClick={() => setFormData({ ...formData, customerId: '', customerName: '', customerPhone: '' })}
                                                    className="text-blue-600 text-sm font-bold"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Tip */}
                                    <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                                        <FontAwesomeIcon icon={faLightbulb} className="text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-900 mb-1">AI Tip</p>
                                            <p className="text-sm text-blue-800">Can't find them? Click "Add New Customer" below</p>
                                        </div>
                                    </div>

                                    {/* Add New Customer Button */}
                                    <button
                                        onClick={() => setShowNewCustomer(!showNewCustomer)}
                                        className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 font-bold transition-all"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                                        Add New Customer
                                    </button>

                                    {/* Quick Add Customer Form */}
                                    {showNewCustomer && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Customer Name"
                                                value={newCustomer.name}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={newCustomer.phone}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await customerAPI.create(newCustomer);
                                                        const customer = res.data.data.customer;
                                                        setFormData({
                                                            ...formData,
                                                            customerId: customer.id,
                                                            customerName: customer.name,
                                                            customerPhone: customer.phone
                                                        });
                                                        setShowNewCustomer(false);
                                                        setNewCustomer({ name: '', phone: '' });
                                                        loadData();
                                                    } catch (error) {
                                                        alert('Failed to add customer');
                                                    }
                                                }}
                                                disabled={!newCustomer.name || !newCustomer.phone}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                                            >
                                                Add Customer
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Product Selection */}
                            {currentStep === 2 && (
                                <div className="max-w-2xl mx-auto">
                                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${getStepInfo(2).color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                        <FontAwesomeIcon icon={faShoppingBag} className="text-3xl text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-center mb-2">Which product are they buying?</h3>
                                    <p className="text-gray-500 text-center mb-8">Search by name, brand, or model</p>

                                    {/* Search Input */}
                                    <div className="relative mb-6">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchProduct}
                                            onChange={(e) => setSearchProduct(e.target.value)}
                                            placeholder="e.g., iPhone 15 Pro, Samsung Galaxy..."
                                            className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Product Results - Enhanced Design */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {filteredProducts.slice(0, 10).map(product => {
                                            const isSelected = formData.productId === product.id;
                                            const hasDevices = product.devices && product.devices.length > 0;
                                            const isOutOfStock = product.stock <= 0;

                                            return (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setFormData({
                                                            ...formData,
                                                            productId: product.id,
                                                            productName: product.name
                                                        });
                                                    }}
                                                    disabled={isOutOfStock}
                                                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left group ${isSelected
                                                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                                                            : isOutOfStock
                                                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                                : 'border-gray-200 hover:border-green-300 bg-white hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Product Icon/Image */}
                                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                                                ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg'
                                                                : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-emerald-100'
                                                            }`}>
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    product.category?.toLowerCase().includes('phone') ? faMobileAlt :
                                                                        product.category?.toLowerCase().includes('laptop') ? faLaptop :
                                                                            product.category?.toLowerCase().includes('tablet') ? faTabletAlt :
                                                                                product.category?.toLowerCase().includes('headphone') || product.category?.toLowerCase().includes('earphone') ? faHeadphones :
                                                                                    faBox
                                                                }
                                                                className={`text-3xl transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-green-500'
                                                                    }`}
                                                            />
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Product Name & Brand */}
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-lg text-gray-900 leading-tight mb-1">
                                                                        {product.name}
                                                                    </h4>
                                                                    {product.brand && (
                                                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                                                                            {product.brand}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {isSelected && (
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl flex-shrink-0" />
                                                                )}
                                                            </div>

                                                            {/* Category & Stock Status */}
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs text-gray-500 font-medium">
                                                                    {product.category}
                                                                </span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-600' :
                                                                        product.stock <= 5 ? 'text-amber-600' :
                                                                            'text-green-600'
                                                                    }`}>
                                                                    {isOutOfStock ? '❌ Out of Stock' :
                                                                        product.stock <= 5 ? `⚠️ ${product.stock} left` :
                                                                            `✅ ${product.stock} in stock`}
                                                                </span>
                                                            </div>

                                                            {/* Storage & Color Variants */}
                                                            {hasDevices && product.devices[0] && (
                                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                    {/* Trade-In Badge */}
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm">
                                                                        <FontAwesomeIcon icon={faArrowsRotate} className="text-[10px]" />
                                                                        Trade-In Device
                                                                    </span>

                                                                    {/* Storage */}
                                                                    {product.devices[0].storage && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                                                                            💾 {product.devices[0].storage}
                                                                        </span>
                                                                    )}

                                                                    {/* Color */}
                                                                    {product.devices[0].color && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-bold">
                                                                            🎨 {product.devices[0].color}
                                                                        </span>
                                                                    )}

                                                                    {/* Serial Number Preview */}
                                                                    {product.devices[0].serialNumber && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono">
                                                                            SN: {product.devices[0].serialNumber.slice(0, 8)}...
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Price (if available) */}
                                                            {product.sellingPrice && (
                                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                                    <span className="text-lg font-black text-green-600">
                                                                        TSH {parseInt(product.sellingPrice).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {filteredProducts.length === 0 && (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faSearch} className="text-3xl text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No products found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Suggestion */}
                                    {filteredProducts.length > 0 && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl flex items-start gap-3 border border-purple-100">
                                            <FontAwesomeIcon icon={faLightbulb} className="text-purple-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-purple-900 mb-1">AI Suggestion</p>
                                                <p className="text-sm text-purple-800">
                                                    {filteredProducts[0].name} is popular this week
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Condition Selection */}
                            {currentStep === 3 && selectedProduct && (
                                <div className="max-w-2xl mx-auto">
                                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${getStepInfo(3).color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                        <FontAwesomeIcon icon={faStar} className="text-3xl text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-center mb-2">What's the condition?</h3>
                                    <p className="text-gray-500 text-center mb-8">This affects the final price</p>

                                    {/* Condition Cards */}
                                    <div className="space-y-3">
                                        {selectedProduct.stockByCondition && [
                                            { key: 'nonActive', label: 'Non-Active', desc: 'Brand new, sealed box' },
                                            { key: 'active', label: 'Active', desc: 'Used, excellent condition' },
                                            { key: 'used', label: 'Used', desc: 'Good condition, some wear' },
                                            { key: 'refurbished', label: 'Refurbished', desc: 'Professionally refurbished' }
                                        ].map(cond => {
                                            const stock = selectedProduct.stockByCondition[cond.key]?.quantity || 0;
                                            const price = selectedProduct.stockByCondition[cond.key]?.sellingPrice || selectedProduct.sellingPrice || 0;

                                            if (stock <= 0) return null; // Don't show out of stock conditions

                                            return (
                                                <button
                                                    key={cond.key}
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            condition: cond.key,
                                                            sellingPrice: price
                                                        });
                                                    }}
                                                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${formData.condition === cond.key
                                                        ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                                                        : 'border-gray-200 hover:border-yellow-300 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.condition === cond.key ? 'bg-yellow-200' : 'bg-gray-100'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faStar} className={`text-xl ${formData.condition === cond.key ? 'text-yellow-600' : 'text-gray-400'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-lg">{cond.label}</h4>
                                                                <p className="text-sm text-gray-500">{cond.desc}</p>
                                                                <p className="text-xs text-green-600 mt-1">{stock} available</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-green-600">
                                                                TSH {parseInt(price).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* AI Insight */}
                                    <div className="mt-6 p-4 bg-purple-50 rounded-xl flex items-start gap-3">
                                        <FontAwesomeIcon icon={faLightbulb} className="text-purple-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-purple-900 mb-1">AI Insight</p>
                                            <p className="text-sm text-purple-800">
                                                Choose the condition that best matches the product's current state
                                            </p>
                                        </div>
                                    </div>

                                    {/* Device Selection - Shows after condition is selected */}
                                    {formData.condition && selectedProduct.devices && selectedProduct.devices.length > 0 && (
                                        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                                            <h4 className="text-lg font-bold text-blue-900 mb-4">Select Specific Device</h4>
                                            <p className="text-sm text-blue-700 mb-4">Choose which device to sell</p>

                                            <div className="space-y-3">
                                                {selectedProduct.devices
                                                    .filter(d => d.condition === formData.condition && d.status === 'in_stock')
                                                    .map(device => (
                                                        <button
                                                            key={device.id}
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    deviceId: device.id,
                                                                    serialNumber: device.serialNumber
                                                                });
                                                            }}
                                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.deviceId === device.id
                                                                ? 'border-blue-500 bg-blue-100 shadow-lg'
                                                                : 'border-blue-200 bg-white hover:border-blue-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <FontAwesomeIcon icon={faMobileAlt} className="text-blue-600" />
                                                                        <span className="font-bold text-gray-900">Serial: {device.serialNumber || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                                        <div>Storage: {device.storage}</div>
                                                                        <div>Color: {device.color}</div>
                                                                        <div>Battery: {device.conditionDetails?.battery}%</div>
                                                                        <div>Screen: {device.conditionDetails?.screen}</div>
                                                                    </div>
                                                                </div>
                                                                {formData.deviceId === device.id && (
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-xl ml-4" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                            </div>

                                            {selectedProduct.devices.filter(d => d.condition === formData.condition && d.status === 'in_stock').length === 0 && (
                                                <p className="text-center text-gray-500 py-4">No devices available for this condition</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Payment Method */}
                            {currentStep === 4 && (
                                <div className="max-w-2xl mx-auto">
                                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${getStepInfo(4).color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                        <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-center mb-2">How are they paying?</h3>
                                    <p className="text-gray-500 text-center mb-8">Select payment method</p>

                                    {/* Payment Methods */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {[
                                            { value: 'CASH', label: 'Cash', icon: '💵' },
                                            { value: 'M-PESA', label: 'M-Pesa', icon: '📱' },
                                            { value: 'TIGO_PESA', label: 'Tigo Pesa', icon: '📱' },
                                            { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '📱' },
                                            { value: 'BANK_TRANSFER', label: 'Bank', icon: '🏦' },
                                            { value: 'CARD', label: 'Card', icon: '💳' }
                                        ].map(method => (
                                            <button
                                                key={method.value}
                                                onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                                                className={`p-6 rounded-2xl border-2 transition-all ${formData.paymentMethod === method.value
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-4xl mb-2">{method.icon}</div>
                                                    <h4 className="font-bold">{method.label}</h4>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Amount Paid
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">
                                                TSH
                                            </span>
                                            <input
                                                type="number"
                                                value={formData.amountPaid}
                                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                                className="w-full pl-20 pr-6 py-4 text-2xl font-bold rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        {formData.sellingPrice && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                Product price: TSH {parseInt(formData.sellingPrice).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Regional Customer Toggle */}
                                    <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                🚚
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
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Trade-In */}
                            {currentStep === 5 && (
                                <div className="max-w-2xl mx-auto">
                                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${getStepInfo(5).color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                        <FontAwesomeIcon icon={faArrowsRotate} className="text-3xl text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-center mb-2">Does the customer have a trade-in?</h3>
                                    <p className="text-gray-500 text-center mb-8">Old device to exchange</p>

                                    {/* Yes/No Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setFormData({ ...formData, hasTradeIn: true });
                                                setShowTradeInModal(true);
                                            }}
                                            className={`p-8 rounded-2xl border-2 transition-all ${formData.hasTradeIn
                                                ? 'border-green-500 bg-green-50 shadow-lg'
                                                : 'border-gray-200 hover:border-green-300 bg-white'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
                                                </div>
                                                <h4 className="font-bold text-lg">Yes</h4>
                                                <p className="text-sm text-gray-500 mt-1">Has trade-in</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setFormData({ ...formData, hasTradeIn: false, tradeInId: '', tradeInValue: 0 })}
                                            className={`p-8 rounded-2xl border-2 transition-all ${!formData.hasTradeIn
                                                ? 'border-gray-400 bg-gray-50 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faTimes} className="text-2xl text-gray-600" />
                                                </div>
                                                <h4 className="font-bold text-lg">No</h4>
                                                <p className="text-sm text-gray-500 mt-1">No trade-in</p>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Trade-In Info */}
                                    {formData.tradeInId && (
                                        <div className="mt-6 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                                            <div className="flex items-center gap-3">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-2xl" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-purple-600 font-bold">Trade-In Added</p>
                                                    <p className="font-bold text-lg">Credit: TSH {parseInt(formData.tradeInValue).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 6: Review & Confirm */}
                            {currentStep === 6 && (
                                <div className="max-w-3xl mx-auto">
                                    <div className="text-center mb-8">
                                        <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${getStepInfo(6).color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-2">Review Sale Details</h3>
                                        <p className="text-gray-500">Please verify everything is correct</p>
                                    </div>

                                    {/* Summary Card */}
                                    <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
                                        {/* Customer */}
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 uppercase font-bold">Customer</p>
                                                    <p className="text-lg font-bold">{formData.customerName}</p>
                                                    <p className="text-sm text-gray-600">{formData.customerPhone}</p>
                                                </div>
                                                <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-sm font-bold">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product */}
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faShoppingBag} className="text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 uppercase font-bold">Product</p>
                                                    <p className="text-lg font-bold">{formData.productName}</p>
                                                    <p className="text-sm text-gray-600">Condition: {formData.condition?.replace('_', ' ')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        TSH {parseInt(formData.sellingPrice).toLocaleString()}
                                                    </p>
                                                    <button onClick={() => setCurrentStep(2)} className="text-green-600 text-sm font-bold">
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment */}
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faCreditCard} className="text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 uppercase font-bold">Payment</p>
                                                    <p className="text-lg font-bold">{formData.paymentMethod}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold">TSH {parseInt(formData.amountPaid).toLocaleString()}</p>
                                                    <button onClick={() => setCurrentStep(4)} className="text-indigo-600 text-sm font-bold">
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trade-In */}
                                        {formData.tradeInId && (
                                            <div className="p-6 bg-purple-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                                        <FontAwesomeIcon icon={faArrowsRotate} className="text-purple-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-purple-700 uppercase font-bold">Trade-In Credit</p>
                                                        <p className="text-lg font-bold text-purple-900">Device Trade-In</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-purple-600">
                                                            - TSH {parseInt(formData.tradeInValue).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600">
                                            <div className="flex items-center justify-between text-white">
                                                <div>
                                                    <p className="text-sm opacity-90">Final Amount</p>
                                                    <p className="text-3xl font-bold">
                                                        TSH {(parseInt(formData.amountPaid) || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-5xl opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer with Navigation */}
                <div className="p-6 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${currentStep === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className={`flex-[2] py-3 rounded-xl font-bold transition-all ${isStepValid()
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Continue
                            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Confirm Sale ✓'}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Trade-In Modal */}
            {showTradeInModal && (
                <TradeInForm
                    isOpen={showTradeInModal}
                    onClose={() => setShowTradeInModal(false)}
                    onSuccess={(data) => {
                        setFormData({
                            ...formData,
                            tradeInId: data.data.tradeIn.id,
                            tradeInValue: data.data.tradeIn.estimatedValue || 0
                        });
                        setShowTradeInModal(false);
                    }}
                    prefilledCustomer={{
                        id: formData.customerId,
                        name: formData.customerName,
                        phone: formData.customerPhone
                    }}
                />
            )}
        </div>
    );
};

export default ConversationalSaleForm;
