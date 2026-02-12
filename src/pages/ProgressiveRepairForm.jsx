import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DiagnosisInput from '../components/DiagnosisInput';
import {
    faArrowLeft, faCheck, faLock, faUser, faWrench, faClipboardCheck,
    faMoneyBillWave, faPlus, faTimes, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0
    }).format(amount || 0);
};

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const ProgressiveRepairForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [repair, setRepair] = useState(null);
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    // Step 1: Create Repair
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [createData, setCreateData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deviceType: '',
        deviceModel: '',
        imei: '',
        issueDescription: ''
    });

    // Step 2: Diagnosis
    const [technicians, setTechnicians] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [diagnosisData, setDiagnosisData] = useState({
        diagnosis: '',
        laborCost: '',
        estimatedTime: '',
        selectedParts: [],
        customParts: [],
        noInventory: false
    });
    const [partSearch, setPartSearch] = useState('');
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const [customPartEntry, setCustomPartEntry] = useState({ name: '', price: '' });

    // Step 3: Approval
    const [approvalNotes, setApprovalNotes] = useState('');

    // Step 4: Complete
    const [completionNotes, setCompletionNotes] = useState('');
    const [warrantyPeriod, setWarrantyPeriod] = useState('30');

    // Step 5: Payment
    const [paymentData, setPaymentData] = useState({
        finalPrice: '',
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        loadInitialData();
        if (id) {
            loadRepair();
        }
    }, [id]);

    const loadInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [custRes, techRes, spareRes] = await Promise.all([
                axios.get(`${API_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/technicians`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/spare-parts`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            // Handle different API structures
            if (custRes.data?.data?.customers) {
                setCustomers(custRes.data.data.customers);
            } else if (Array.isArray(custRes.data?.data)) {
                setCustomers(custRes.data.data);
            } else {
                setCustomers([]);
            }

            setTechnicians(Array.isArray(techRes.data?.data) ? techRes.data.data : []);
            setSpareParts(Array.isArray(spareRes.data?.data) ? spareRes.data.data : []);
        } catch (error) {
            console.error('Error loading data:', error);
            setCustomers([]);
            setTechnicians([]);
            setSpareParts([]);
        }
    };

    const loadRepair = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/repairs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const repairData = response.data.data;
            setRepair(repairData);

            // Pre-fill diagnosis data if diagnosis has been submitted
            if (repairData.diagnosis) {
                setDiagnosisData({
                    diagnosis: repairData.diagnosis || '',
                    laborCost: repairData.laborCost?.toString() || '',
                    estimatedTime: repairData.estimatedTime || '',
                    selectedParts: repairData.partsRequired || [],
                    customParts: repairData.customComponents || [],
                    noInventory: repairData.noInventoryNeeded || false
                });
            }

            // Pre-fill payment data if at payment stage
            if (repairData.status === 'Awaiting Payment') {
                setPaymentData({
                    finalPrice: repairData.totalEstimate,
                    paymentMethod: 'Cash'
                });
            }
        } catch (error) {
            console.error('Error loading repair:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStep = () => {
        if (!repair) return 1;
        if (repair.status === 'Closed') return 6;
        if (repair.status === 'Awaiting Payment') return 5;
        if (repair.status === 'In Progress') return 4;
        if (repair.status === 'Awaiting Approval') return 3;
        if (repair.status === 'Awaiting Diagnosis') return 2;
        return 1;
    };

    const canAccessStep = (step) => {
        const currentStep = getCurrentStep();
        if (step < currentStep) return true; // Can view completed steps
        if (step > currentStep) return false; // Cannot access future steps

        // Check role permissions for current step
        if (step === 2 && !['TECHNICIAN', 'MANAGER', 'CEO'].includes(user?.role)) return false;
        if (step === 3 && !['MANAGER', 'CEO'].includes(user?.role)) return false;
        if (step === 4 && !['TECHNICIAN', 'MANAGER', 'CEO'].includes(user?.role)) return false;
        if (step === 5 && !['STAFF', 'MANAGER', 'CEO'].includes(user?.role)) return false;

        return true;
    };

    // Step 1: Create Repair
    const handleCreateRepair = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            let customerId = selectedCustomer?.id;

            if (isNewCustomer) {
                const customerRes = await axios.post(`${API_URL}/customers`, {
                    name: createData.customerName,
                    phone: createData.customerPhone,
                    email: createData.customerEmail || undefined
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (customerRes.data.success) {
                    customerId = customerRes.data.data.customer.id;
                }
            }

            const response = await axios.post(`${API_URL}/repairs`, {
                customerId,
                deviceType: createData.deviceType,
                deviceModel: createData.deviceModel,
                imei: createData.imei,
                issueDescription: createData.issueDescription
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (response.data.success) {
                navigate(`/repair-form/${response.data.data.id}`);
                window.location.reload();
            }
        } catch (error) {
            alert('Error creating repair: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Step 2: Diagnosis
    const addInventoryPart = (part) => {
        setDiagnosisData(prev => {
            const exists = prev.selectedParts.find(p => p.id === part.id);
            if (exists) {
                return {
                    ...prev,
                    selectedParts: prev.selectedParts.map(p =>
                        p.id === part.id ? { ...p, qty: p.qty + 1 } : p
                    )
                };
            }
            return {
                ...prev,
                selectedParts: [...prev.selectedParts, { ...part, qty: 1 }]
            };
        });
        setPartSearch('');
        setShowPartDropdown(false);
    };

    const removeInventoryPart = (partId) => {
        setDiagnosisData(prev => ({
            ...prev,
            selectedParts: prev.selectedParts.filter(p => p.id !== partId)
        }));
    };

    const addCustomPart = () => {
        if (!customPartEntry.name || !customPartEntry.price) return;
        setDiagnosisData(prev => ({
            ...prev,
            customParts: [...prev.customParts, { ...customPartEntry }]
        }));
        setCustomPartEntry({ name: '', price: '' });
    };

    const removeCustomPart = (index) => {
        setDiagnosisData(prev => ({
            ...prev,
            customParts: prev.customParts.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        const selectedParts = diagnosisData.selectedParts || [];
        const customParts = diagnosisData.customParts || [];
        const invTotal = selectedParts.reduce((sum, p) => sum + (p.sellingPrice * p.qty), 0);
        const cusTotal = customParts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
        const labor = parseFloat(diagnosisData.laborCost) || 0;
        return invTotal + cusTotal + labor;
    };

    const handleSubmitDiagnosis = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const partsRequired = diagnosisData.selectedParts.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.qty,
                sellingPrice: p.sellingPrice,
                costPrice: p.costPrice
            }));

            await axios.post(`${API_URL}/repairs/${id}/diagnosis`, {
                diagnosis: diagnosisData.diagnosis,
                partsRequired,
                customComponents: diagnosisData.customParts,
                noInventoryNeeded: diagnosisData.noInventory,
                estimatedTime: diagnosisData.estimatedTime,
                laborCost: parseFloat(diagnosisData.laborCost) || 0
            }, { headers: { Authorization: `Bearer ${token}` } });

            loadRepair();
        } catch (error) {
            alert('Error submitting diagnosis: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Step 3: Approval
    const handleApproval = async (approved) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/approve`, {
                approved,
                notes: approvalNotes
            }, { headers: { Authorization: `Bearer ${token}` } });

            loadRepair();
        } catch (error) {
            alert('Error processing approval: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Step 4: Complete
    const handleComplete = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/complete`, {
                completionNotes,
                warrantyPeriod: parseInt(warrantyPeriod)
            }, { headers: { Authorization: `Bearer ${token}` } });

            loadRepair();
        } catch (error) {
            alert('Error completing repair: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Step 5: Payment
    const handlePayment = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/repairs/${id}/payment`, {
                amountPaid: parseFloat(paymentData.finalPrice),
                finalSellingPrice: parseFloat(paymentData.finalPrice),
                paymentMethod: paymentData.paymentMethod
            }, { headers: { Authorization: `Bearer ${token}` } });

            loadRepair();
            alert('✅ Repair completed and payment recorded!');
            navigate('/repairs');
        } catch (error) {
            alert('Error processing payment: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        { num: 1, title: 'Create', icon: faUser, role: 'All' },
        { num: 2, title: 'Diagnosis', icon: faWrench, role: 'Technician' },
        { num: 3, title: 'Approval', icon: faClipboardCheck, role: 'Manager' },
        { num: 4, title: 'Complete', icon: faCheck, role: 'Technician' },
        { num: 5, title: 'Payment', icon: faMoneyBillWave, role: 'Staff' }
    ];

    const currentStep = getCurrentStep();

    if (loading) {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-lg font-black text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen premium-bg pb-20 md:pb-32">
            {/* Mobile-Optimized Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate('/repairs')}
                        className="min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600 text-sm md:text-base" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-gray-400 truncate">
                            {repair ? `Repair #${repair.customerCode}` : 'New Repair'}
                        </p>
                        <h1 className="text-base md:text-xl font-black text-gray-900 truncate">Progressive Repair Form</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
                {/* Responsive Stepper - Vertical on Mobile, Horizontal on Desktop */}
                <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-lg mb-4 md:mb-8">
                    {/* Mobile: Vertical Stepper */}
                    <div className="md:hidden space-y-3">
                        {steps.map((step, idx) => (
                            <div key={step.num} className="flex items-center gap-3">
                                <div className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${step.num < currentStep
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md'
                                    : step.num === currentStep
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <FontAwesomeIcon
                                        icon={step.num < currentStep ? faCheck : step.num > currentStep ? faLock : step.icon}
                                        className="text-base"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black truncate ${step.num <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.num}. {step.title}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 truncate">{step.role}</p>
                                </div>
                                {step.num === currentStep && (
                                    <div className="px-2 py-1 bg-blue-50 rounded-lg">
                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Active</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Horizontal Stepper */}
                    <div className="hidden md:flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <div key={step.num} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all ${step.num < currentStep
                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg'
                                        : step.num === currentStep
                                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl scale-110'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <FontAwesomeIcon
                                            icon={step.num < currentStep ? faCheck : step.num > currentStep ? faLock : step.icon}
                                            className="text-xl"
                                        />
                                    </div>
                                    <p className={`text-sm font-black ${step.num <= currentStep ? 'text-gray-900' : 'text-gray-400'
                                        }`}>{step.title}</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1">{step.role}</p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${step.num < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {/* Step 1: Create Repair */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-lg"
                        >
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Create Repair</h2>
                                <p className="text-sm md:text-base text-gray-600 font-bold">Enter customer and device information</p>
                            </div>

                            <form onSubmit={handleCreateRepair} className="space-y-6">
                                {/* Customer Selection */}
                                <div>
                                    <label className="block text-xs md:text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Customer</label>
                                    <div className="flex gap-2 md:gap-4 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsNewCustomer(false)}
                                            className={`flex-1 min-h-[44px] py-3 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all ${!isNewCustomer
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                                                }`}
                                        >
                                            Existing Customer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsNewCustomer(true)}
                                            className={`flex-1 min-h-[44px] py-3 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all ${isNewCustomer
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                                                }`}
                                        >
                                            New Customer
                                        </button>
                                    </div>

                                    {!isNewCustomer ? (
                                        <div className="relative">
                                            {/* Search Input */}
                                            <div className="relative mb-3">
                                                <input
                                                    type="text"
                                                    placeholder="Search customer by name or phone..."
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    onFocus={() => setShowCustomerDropdown(true)}
                                                    className="w-full min-h-[44px] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm md:text-base"
                                                />
                                                <FontAwesomeIcon
                                                    icon={faUser}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                            </div>

                                            {/* Selected Customer Display */}
                                            {selectedCustomer && (
                                                <div className="mb-3 p-3 md:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl md:rounded-2xl flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-gray-900 text-sm md:text-base truncate">{selectedCustomer.name}</p>
                                                        <p className="text-xs md:text-sm text-gray-600 font-bold">{selectedCustomer.phone}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCustomer(null);
                                                            setCustomerSearch('');
                                                            setShowCustomerDropdown(true);
                                                        }}
                                                        className="ml-3 w-8 h-8 md:w-10 md:h-10 bg-red-100 hover:bg-red-200 active:bg-red-300 rounded-lg flex items-center justify-center text-red-600 transition-colors flex-shrink-0"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="text-sm" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Customer Dropdown */}
                                            <AnimatePresence>
                                                {showCustomerDropdown && !selectedCustomer && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl md:rounded-2xl shadow-2xl border-2 border-gray-100 max-h-64 overflow-y-auto"
                                                    >
                                                        {Array.isArray(customers) && customers
                                                            .filter(c =>
                                                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                                c.phone.includes(customerSearch)
                                                            )
                                                            .map(c => (
                                                                <div
                                                                    key={c.id}
                                                                    onClick={() => {
                                                                        setSelectedCustomer(c);
                                                                        setCustomerSearch('');
                                                                        setShowCustomerDropdown(false);
                                                                    }}
                                                                    className="p-3 md:p-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 active:bg-blue-100"
                                                                >
                                                                    <p className="font-black text-gray-900 text-sm md:text-base">{c.name}</p>
                                                                    <p className="text-xs md:text-sm text-gray-500 font-bold">{c.phone}</p>
                                                                    {c.email && <p className="text-xs text-gray-400 mt-1">{c.email}</p>}
                                                                </div>
                                                            ))}
                                                        {customers.filter(c =>
                                                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                            c.phone.includes(customerSearch)
                                                        ).length === 0 && (
                                                                <div className="p-6 text-center">
                                                                    <p className="text-gray-400 font-bold text-sm">No customers found</p>
                                                                </div>
                                                            )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Hidden input for form validation */}
                                            <input
                                                type="hidden"
                                                required={!isNewCustomer}
                                                value={selectedCustomer?.id || ''}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Customer Name"
                                                value={createData.customerName}
                                                onChange={(e) => setCreateData({ ...createData, customerName: e.target.value })}
                                                className="min-h-[44px] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm md:text-base"
                                            />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Phone Number"
                                                value={createData.customerPhone}
                                                onChange={(e) => setCreateData({ ...createData, customerPhone: e.target.value })}
                                                className="min-h-[44px] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm md:text-base"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email (Optional)"
                                                value={createData.customerEmail}
                                                onChange={(e) => setCreateData({ ...createData, customerEmail: e.target.value })}
                                                className="min-h-[44px] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold md:col-span-2 text-sm md:text-base"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Device Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Device Type</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., iPhone 15"
                                            value={createData.deviceType}
                                            onChange={(e) => setCreateData({ ...createData, deviceType: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Model</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Pro Max"
                                            value={createData.deviceModel}
                                            onChange={(e) => setCreateData({ ...createData, deviceModel: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">IMEI (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Serial number"
                                            value={createData.imei}
                                            onChange={(e) => setCreateData({ ...createData, imei: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Issue Description */}
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Issue Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        id="issueDescription"
                                        name="issueDescription"
                                        placeholder="Describe the problem..."
                                        value={createData.issueDescription || ''}
                                        onChange={(e) => setCreateData(prev => ({ ...prev, issueDescription: e.target.value }))}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full min-h-[50px] py-4 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-wider text-sm md:text-base hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? 'Creating...' : 'Create Repair'}
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 2: Diagnosis */}
                    {currentStep === 2 && canAccessStep(2) && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-lg"
                        >
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-blue-200 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <FontAwesomeIcon icon={faWrench} className="text-3xl text-blue-600 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 mb-2">Technical Diagnosis</h2>
                                <p className="text-gray-500 font-bold mb-8 max-w-sm">
                                    To ensure high performance and precision, diagnosis is now handled in a dedicated session.
                                </p>
                                <button
                                    onClick={() => navigate(`/repairs/${id}/diagnosis-action`)}
                                    className="px-10 py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3"
                                >
                                    <FontAwesomeIcon icon={faMicrochip} />
                                    Launch Diagnosis Studio
                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Approval */}
                    {currentStep === 3 && canAccessStep(3) && repair && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-lg"
                        >
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Manager Approval</h2>
                                <p className="text-sm md:text-base text-gray-600 font-bold">Review and approve the repair estimate</p>
                            </div>

                            <div className="space-y-6">
                                {/* Diagnosis Summary */}
                                <div className="p-6 bg-gray-50 rounded-3xl">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Diagnosis</p>
                                    <p className="text-gray-700 font-bold italic">"{repair.diagnosis}"</p>
                                </div>

                                {/* Estimate */}
                                <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl text-center border-2 border-amber-200">
                                    <p className="text-sm font-black uppercase tracking-wider text-amber-600 mb-3">Total Estimate</p>
                                    <p className="text-5xl font-black text-gray-900 mb-2">{formatCurrency(repair.totalEstimate)}</p>
                                    <p className="text-xs font-bold text-gray-500">Approval will auto-start work</p>
                                </div>

                                {/* Approval Notes */}
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add approval notes..."
                                        value={approvalNotes}
                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <button
                                        onClick={() => handleApproval(true)}
                                        disabled={saving}
                                        className="min-h-[50px] py-4 md:py-5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-wider text-sm md:text-base hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Processing...' : 'Approve & Start'}
                                    </button>
                                    <button
                                        onClick={() => handleApproval(false)}
                                        disabled={saving}
                                        className="min-h-[50px] py-4 md:py-5 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-wider text-sm md:text-base hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Complete */}
                    {currentStep === 4 && canAccessStep(4) && repair && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-lg"
                        >
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Complete Repair</h2>
                                <p className="text-sm md:text-base text-gray-600 font-bold">Mark the repair work as finished</p>
                            </div>

                            <form onSubmit={handleComplete} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Completion Notes</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Work completed successfully..."
                                        value={completionNotes}
                                        onChange={(e) => setCompletionNotes(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Warranty Period (Days)</label>
                                    <input
                                        type="number"
                                        value={warrantyPeriod}
                                        onChange={(e) => setWarrantyPeriod(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-lg"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-3xl font-black uppercase tracking-wider hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? 'Processing...' : 'Mark as Complete'}
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 5: Payment */}
                    {currentStep === 5 && canAccessStep(5) && repair && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-lg"
                        >
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Process Payment</h2>
                                <p className="text-sm md:text-base text-gray-600 font-bold">Record payment and close repair</p>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-6">
                                <div className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl text-center border-2 border-emerald-200">
                                    <p className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3">Payment Due</p>
                                    <p className="text-5xl font-black text-gray-900">{formatCurrency(repair.totalEstimate)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Final Price</label>
                                    <input
                                        type="number"
                                        required
                                        value={paymentData.finalPrice}
                                        onChange={(e) => setPaymentData({ ...paymentData, finalPrice: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-2xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Payment Method</label>
                                    <select
                                        value={paymentData.paymentMethod}
                                        onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold appearance-none"
                                    >
                                        <option value="Cash">💵 Cash</option>
                                        <option value="M-Pesa">📱 M-Pesa</option>
                                        <option value="Tigo-Pesa">📱 Tigo-Pesa</option>
                                        <option value="Airtel-Money">📱 Airtel-Money</option>
                                        <option value="Bank Transfer">🏦 Bank Transfer</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-6 bg-gradient-to-r from-gray-900 to-black text-white rounded-3xl font-black uppercase tracking-wider hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Processing...' : 'Complete & Record Payment'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Completed */}
                    {currentStep === 6 && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] p-8 md:p-12 shadow-lg text-center"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon icon={faCheck} className="text-2xl md:text-3xl text-emerald-600" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Repair Completed!</h2>
                            <p className="text-sm md:text-base text-gray-600 font-bold mb-6 md:mb-8">This repair has been successfully finalized and closed.</p>
                            <button
                                onClick={() => navigate('/repairs')}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-black uppercase tracking-wider hover:shadow-2xl hover:scale-[1.02] transition-all"
                            >
                                Back to Repairs
                            </button>
                        </motion.div>
                    )}

                    {/* Access Denied */}
                    {!canAccessStep(currentStep) && currentStep < 6 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] p-12 shadow-lg text-center"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <FontAwesomeIcon icon={faLock} className="text-3xl" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
                            <p className="text-gray-600 font-bold">You don't have permission to access this step.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default ProgressiveRepairForm;
