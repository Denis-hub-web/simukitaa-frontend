import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUser, faMobileAlt, faTools,
    faClipboardList, faChevronRight, faSearch, faPlus
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const CreateRepairPage = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deviceType: '',
        deviceModel: '',
        imei: '',
        issueDescription: '',
        assignedTechnicianId: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [custRes, techRes] = await Promise.all([
                axios.get(`${API_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/technicians`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setCustomers(custRes.data.data.customers || []);
            setTechnicians(techRes.data.data || []);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let customerId = selectedCustomer?.id;

            if (isNewCustomer) {
                const customerRes = await axios.post(`${API_URL}/customers`, {
                    name: formData.customerName,
                    phone: formData.customerPhone,
                    email: formData.customerEmail || undefined
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (customerRes.data.success) {
                    customerId = customerRes.data.data.customer.id;
                }
            }

            if (!customerId) {
                alert('Please select or create a customer');
                setLoading(false);
                return;
            }

            const response = await axios.post(`${API_URL}/repairs`, {
                ...formData,
                customerId
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (response.data.success) {
                navigate(`/repairs/${response.data.data.id}`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating repair record');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    return (
        <div className="premium-bg p-4 md:p-8 pb-32">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/repairs')}
                        className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all border border-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div>
                        <p className="premium-label mb-0">New Entry</p>
                        <h1 className="premium-h1">Register Repair</h1>
                    </div>
                </div>

                <div className="premium-card p-6 md:p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="premium-icon-box bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
                            <FontAwesomeIcon icon={faTools} className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="premium-h2 text-2xl">Repair Intake</h2>
                            <p className="premium-label mb-0">Enter device and customer details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Customer Identification */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Customer Information</h3>
                            </div>

                            <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => { setIsNewCustomer(false); setSelectedCustomer(null); }}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!isNewCustomer ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400'}`}
                                >
                                    Existing Customer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null); }}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isNewCustomer ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400'}`}
                                >
                                    New Customer
                                </button>
                            </div>

                            {!isNewCustomer ? (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or phone..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowCustomerList(true);
                                            }}
                                            onFocus={() => setShowCustomerList(true)}
                                            className="premium-input pl-14"
                                        />
                                    </div>

                                    {showCustomerList && searchQuery && (
                                        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-3xl border border-gray-100 p-2 space-y-2 no-scrollbar">
                                            {filteredCustomers.map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setSearchQuery('');
                                                        setShowCustomerList(false);
                                                    }}
                                                    className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                                                >
                                                    <p className="font-bold text-gray-900 leading-none mb-1">{c.name}</p>
                                                    <p className="premium-label mb-0">{c.phone}</p>
                                                </div>
                                            ))}
                                            {filteredCustomers.length === 0 && (
                                                <p className="text-center py-6 premium-label">No Matches In Database</p>
                                            )}
                                        </div>
                                    )}

                                    {selectedCustomer && (
                                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm font-black">
                                                    {selectedCustomer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="premium-label mb-0">Selected Customer</p>
                                                    <p className="font-extrabold text-gray-900 text-lg leading-tight">{selectedCustomer.name}</p>
                                                    <p className="text-sm font-bold text-blue-600">{selectedCustomer.phone}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCustomer(null)}
                                                className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-all border border-red-100"
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="rotate-45" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="space-y-2">
                                        <label className="premium-label ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerName}
                                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                            placeholder="Enter name..."
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.customerPhone}
                                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                            placeholder="Enter phone..."
                                            className="premium-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-100" />

                        {/* Equipment Metadata */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                                    <FontAwesomeIcon icon={faMobileAlt} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Device Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="premium-label ml-1">Device Category</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.deviceType}
                                        onChange={e => setFormData({ ...formData, deviceType: e.target.value })}
                                        placeholder="e.g. Phone, Laptop, Tablet"
                                        className="premium-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label ml-1">Model</label>
                                    <input
                                        type="text"
                                        value={formData.deviceModel}
                                        onChange={e => setFormData({ ...formData, deviceModel: e.target.value })}
                                        placeholder="e.g. iPhone 15 Pro Max"
                                        className="premium-input"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="premium-label ml-1">IMEI or Serial Number</label>
                                    <input
                                        type="text"
                                        value={formData.imei}
                                        onChange={e => setFormData({ ...formData, imei: e.target.value })}
                                        placeholder="Enter IMEI or Serial Number..."
                                        className="premium-input font-mono uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Operational Scope */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-800">Repair Details</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="premium-label ml-1">Issue Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    id="issueDescriptionIntake"
                                    name="issueDescription"
                                    value={formData.issueDescription || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, issueDescription: e.target.value }))}
                                    placeholder="Describe the problem with the device..."
                                    className="premium-input resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="premium-label ml-1">Assign Specialist</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {technicians.map(tech => (
                                        <div
                                            key={tech.id}
                                            onClick={() => setFormData({ ...formData, assignedTechnicianId: tech.id })}
                                            className={`p-4 rounded-3xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 group ${formData.assignedTechnicianId === tech.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.assignedTechnicianId === tech.id ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-gray-400 group-hover:text-emerald-500'}`}>
                                                <FontAwesomeIcon icon={faTools} />
                                            </div>
                                            <p className="font-extrabold text-xs text-gray-900 leading-tight">{tech.name.split(' ')[0]}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Technician</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading || (!selectedCustomer && !isNewCustomer)}
                                className="w-full py-6 premium-btn-primary flex items-center justify-center gap-4 group"
                            >
                                <span className="text-sm font-black uppercase tracking-[0.3em]">
                                    {loading ? 'Saving...' : 'Create Repair Record'}
                                </span>
                                <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mt-6">
                                Professional Device Repair Management System
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRepairPage;
