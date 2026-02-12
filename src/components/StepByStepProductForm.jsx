import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import {
    faTimes,
    faArrowRight,
    faArrowLeft,
    faCamera,
    faUpload,
    faCheck,
    faSave
} from '@fortawesome/free-solid-svg-icons';

const StepByStepProductForm = ({ isOpen, onClose, onSave, product, isEdit, showBuyingPrice }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        serialNumber: product?.serialNumber || '',
        category: product?.category || 'iPhone 16',
        status: product?.status || 'ACTIVE',
        quantity: product?.quantity || 1,
        sellingPrice: product?.sellingPrice || '',
        costPrice: product?.costPrice || '',
        model: product?.model || '',
        color: product?.color || '',
        storage: product?.storage || ''
    });
    const [serialImage, setSerialImage] = useState(null);
    const [scanningBarcode, setScanningBarcode] = useState(false);
    const [serialDuplicate, setSerialDuplicate] = useState(false);
    const [checkingSerial, setCheckingSerial] = useState(false);

    const API_BASE_URL = 'http://localhost:5000/api';

    const totalSteps = showBuyingPrice ? 8 : 7;

    // Update form data when product changes (for edit mode)
    useEffect(() => {
        if (product && isEdit) {
            setFormData({
                name: product.name || '',
                serialNumber: product.serialNumber || '',
                category: product.category || 'iPhone 16',
                status: product.status || 'ACTIVE',
                quantity: product.quantity || 1,
                sellingPrice: product.sellingPrice || 0,
                costPrice: product.costPrice || 0,
                model: product.model || '',
                color: product.color || '',
                storage: product.storage || ''
            });
        }
    }, [product, isEdit]);

    // Barcode Scanner for Product Info
    const handleBarcodeUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setSerialImage(URL.createObjectURL(file));
            setScanningBarcode(true);

            try {
                console.log('📸 Scanning barcode...');
                const codeReader = new BrowserMultiFormatReader();
                const imageUrl = URL.createObjectURL(file);

                // Create image element
                const img = new Image();
                img.src = imageUrl;

                await new Promise((resolve) => {
                    img.onload = resolve;
                });

                // Scan barcode
                const result = await codeReader.decodeFromImageUrl(imageUrl);
                console.log('✅ Barcode scanned:', result.getText());

                // Barcode typically contains UPC/EAN - use it to identify product
                const barcodeData = result.getText();

                // Try to extract product info from barcode
                // For AirPods, barcode might be the model number
                alert(`✅ Barcode: ${barcodeData}\n\nNow enter product details and serial number manually.`);

                setScanningBarcode(false);
            } catch (error) {
                console.error('❌ Barcode scan failed:', error);
                alert('Could not read barcode. Please take a clearer photo or enter details manually.');
                setScanningBarcode(false);
            }
        }
    };

    // Check for duplicate serial numbers
    const checkDuplicateSerial = async (serial) => {
        if (!serial || serial.length < 8) {
            setSerialDuplicate(false);
            return;
        }

        setCheckingSerial(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/stock-advanced`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const products = response.data.data.products || [];
            const duplicate = products.find(p =>
                p.serialNumber === serial && (!isEdit || p.id !== product?.id)
            );

            setSerialDuplicate(!!duplicate);
            if (duplicate) {
                console.log('⚠️ Duplicate serial found:', duplicate.name);
            }
        } catch (error) {
            console.error('Error checking serial:', error);
        } finally {
            setCheckingSerial(false);
        }
    };

    // Debounce serial check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.serialNumber) {
                checkDuplicateSerial(formData.serialNumber);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.serialNumber]);

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

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.name.trim() !== '';
            case 2: return formData.serialNumber.trim() !== '';
            case 3: return formData.category !== '';
            case 4: return formData.status !== '';
            case 5: return formData.quantity > 0;
            case 6: return formData.sellingPrice > 0;
            case 7: return !showBuyingPrice || formData.costPrice > 0;
            case 8: return true; // Details are optional
            default: return false;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#008069] to-[#00a884] p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">
                                {isEdit ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 flex-1 rounded-full transition-all ${index + 1 <= currentStep
                                        ? 'bg-white'
                                        : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-white/80 text-sm mt-2">
                            Step {currentStep} of {totalSteps}
                        </p>
                    </div>

                    {/* Form Steps */}
                    <div className="p-6 min-h-[400px] flex flex-col">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Product Name */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Product Name</h3>
                                    <p className="text-gray-600 text-sm mb-6">What product are you adding?</p>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., iPhone 16 Pro Max"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#008069] focus:border-transparent transition-all"
                                        autoFocus
                                    />
                                </motion.div>
                            )}

                            {/* Step 2: Serial Number with OCR */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Serial Number</h3>
                                    <p className="text-gray-600 text-sm mb-6">Scan or enter the serial number</p>

                                    {/* Camera Scan for OCR */}
                                    <div className="mb-4">
                                        <label className="block w-full">
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-[#008069] transition-all">
                                                {serialImage ? (
                                                    <div className="relative">
                                                        <img src={serialImage} alt="Serial" className="w-full h-32 object-cover rounded-xl mb-2" />
                                                        {scanningBarcode && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                                                <div className="text-white text-sm">Scanning barcode...</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faCamera} className="text-4xl text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600">Upload or scan serial image</p>
                                                        <p className="text-xs text-gray-400 mt-1">Take photo or choose from gallery</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBarcodeUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <input
                                        type="text"
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                        placeholder="Or type serial number manually"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#008069] focus:border-transparent transition-all"
                                    />
                                </motion.div>
                            )}

                            {/* Step 3: Category */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Category</h3>
                                    <p className="text-gray-600 text-sm mb-6">Select product category</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['iPhone 16', 'iPhone 15', 'iPhone 14', 'Samsung', 'Accessories', 'Repair Parts'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`p-4 rounded-2xl border-2 transition-all ${formData.category === cat
                                                    ? 'border-[#008069] bg-[#008069]/10 text-[#008069] font-semibold'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Status */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Product Status</h3>
                                    <p className="text-gray-600 text-sm mb-6">What's the condition?</p>
                                    <div className="space-y-3">
                                        {[
                                            { value: 'ACTIVE', label: 'Active', emoji: '✅', desc: 'Ready for sale' },
                                            { value: 'NON_ACTIVE', label: 'Non-Active', emoji: '⏸️', desc: 'Not for sale yet' },
                                            { value: 'REFURBISHED', label: 'Refurbished', emoji: '🔄', desc: 'Restored product' },
                                            { value: 'USED', label: 'Used', emoji: '📦', desc: 'Pre-owned' }
                                        ].map((status) => (
                                            <button
                                                key={status.value}
                                                onClick={() => setFormData({ ...formData, status: status.value })}
                                                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${formData.status === status.value
                                                    ? 'border-[#008069] bg-[#008069]/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{status.emoji}</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{status.label}</p>
                                                        <p className="text-sm text-gray-500">{status.desc}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Quantity */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quantity</h3>
                                    <p className="text-gray-600 text-sm mb-6">How many units?</p>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        placeholder="Enter quantity"
                                        min="1"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#008069] focus:border-transparent transition-all"
                                    />
                                </motion.div>
                            )}

                            {/* Step 6: Selling Price */}
                            {currentStep === 6 && (
                                <motion.div
                                    key="step6"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Selling Price</h3>
                                    <p className="text-gray-600 text-sm mb-6">Price for customers (TZS)</p>
                                    <input
                                        type="number"
                                        value={formData.sellingPrice}
                                        onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 3500000"
                                        min="0"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#008069] focus:border-transparent transition-all"
                                    />
                                </motion.div>
                            )}

                            {/* Step 7: Cost Price (CEO only) */}
                            {currentStep === 7 && showBuyingPrice && (
                                <motion.div
                                    key="step7"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cost Price</h3>
                                    <p className="text-gray-600 text-sm mb-6">Your buying price (TZS)</p>
                                    <input
                                        type="number"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 3000000"
                                        min="0"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#008069] focus:border-transparent transition-all"
                                    />
                                    {formData.sellingPrice > 0 && formData.costPrice > 0 && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-2xl">
                                            <p className="text-sm text-gray-600">Profit per unit</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                TZS {(formData.sellingPrice - formData.costPrice).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 8: Additional Details */}
                            {currentStep === (showBuyingPrice ? 8 : 7) && (
                                <motion.div
                                    key="step8"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Additional Details</h3>
                                    <p className="text-gray-600 text-sm mb-6">Optional information</p>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="Model (e.g., Pro Max)"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.storage}
                                            onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                            placeholder="Storage (e.g., 512GB)"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="Color (e.g., Desert Titanium)"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    <span>Back</span>
                                </button>
                            )}
                            {currentStep < totalSteps ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${isStepValid()
                                        ? 'bg-[#008069] hover:bg-[#006655] text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <span>Next</span>
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-6 py-3 bg-[#008069] hover:bg-[#006655] text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>{isEdit ? 'Update' : 'Add'} Product</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StepByStepProductForm;
