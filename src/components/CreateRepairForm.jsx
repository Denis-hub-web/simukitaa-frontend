import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools, faUser, faMobileAlt, faPlus, faUserPlus, faTruck } from '@fortawesome/free-solid-svg-icons';
import { repairAPI, customerAPI, userAPI } from '../utils/api';

const CreateRepairForm = ({ onSuccess, onCancel }) => {
    const [customers, setCustomers] = useState([]);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deviceType: 'PHONE',
        deviceModel: '',
        issueDescription: '',
        estimatedCost: ''
    });
    const [requiresDelivery, setRequiresDelivery] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        address: '',
        phone: '',
        time: 'now',
        customTime: '',
        specialInstructions: '',
        deliveryPersonId: ''
    });
    const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : `http://${window.location.hostname}:5000/api`;

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const res = await customerAPI.getAll();
            setCustomers(res.data.data.customers || []);

            // Fetch delivery personnel using unified API client
            const usersRes = await userAPI.getAll();
            if (usersRes.data.success) {
                const drivers = usersRes.data.data.users.filter(u => u.role === 'DELIVERY' && u.isActive !== false);
                setDeliveryPersonnel(drivers);
            }
        } catch (err) {
            console.error('Loader error:', err);
            setError('Failed to load data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            let customerId = formData.customerId;

            // Create new customer if needed
            if (isNewCustomer) {
                const customerResponse = await axios.post(
                    `${API_URL}/customers`,
                    {
                        name: formData.customerName,
                        phone: formData.customerPhone,
                        email: formData.customerEmail || undefined
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (customerResponse.data.success) {
                    customerId = customerResponse.data.data.customer.id;
                } else {
                    throw new Error('Failed to create customer');
                }
            }

            // Create repair
            await repairAPI.create({
                customerId,
                deviceType: formData.deviceType,
                deviceModel: formData.deviceModel,
                issueDescription: formData.issueDescription,
                estimatedCost: formData.estimatedCost,
                requiresDelivery,
                ...(requiresDelivery && {
                    deliveryAddress: deliveryInfo.address,
                    deliveryPhone: deliveryInfo.phone,
                    deliveryTime: deliveryInfo.time === 'custom' ? deliveryInfo.customTime : deliveryInfo.time,
                    specialInstructions: deliveryInfo.specialInstructions,
                    deliveryPersonId: deliveryInfo.deliveryPersonId || undefined
                })
            });

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create repair');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Toggle between existing and new customer */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                    type="button"
                    onClick={() => setIsNewCustomer(false)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${!isNewCustomer ? 'bg-white shadow-sm text-[#008069]' : 'text-gray-500'
                        }`}
                >
                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                    Existing
                </button>
                <button
                    type="button"
                    onClick={() => setIsNewCustomer(true)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${isNewCustomer ? 'bg-white shadow-sm text-[#008069]' : 'text-gray-500'
                        }`}
                >
                    <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                    New Customer
                </button>
            </div>

            {/* Customer Selection or New Customer Form */}
            {!isNewCustomer ? (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Customer *</label>
                    <select
                        required={!isNewCustomer}
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                    >
                        <option value="">Choose customer...</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="Full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            placeholder="+255..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Device Type *</label>
                    <select
                        value={formData.deviceType}
                        onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                    >
                        <option value="PHONE">Phone</option>
                        <option value="LAPTOP">Laptop</option>
                        <option value="TABLET">Tablet</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Model *</label>
                    <input
                        type="text"
                        required
                        value={formData.deviceModel}
                        onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                        placeholder="e.g. iPhone 13"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Issue Description *</label>
                <textarea
                    required
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    rows="3"
                    placeholder="Describe the problem..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Cost (TZS)</label>
                <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="Optional estimate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent text-sm"
                />
            </div>

            {/* Delivery Section */}
            <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={requiresDelivery}
                        onChange={(e) => setRequiresDelivery(e.target.checked)}
                        className="w-4 h-4 text-[#008069] rounded focus:ring-[#008069]"
                    />
                    <span className="text-sm font-black text-gray-700 uppercase tracking-tighter flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlus} className="text-[#008069]" />
                        Requires Delivery / Pickup
                    </span>
                </label>

                {requiresDelivery && (
                    <div className="space-y-3 pl-6 border-l-2 border-[#008069]/20 animate-in fade-in slide-in-from-left-2 transition-all">
                        <input
                            type="text"
                            placeholder="Pickup/Delivery Address *"
                            required={requiresDelivery}
                            value={deliveryInfo.address}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        />
                        <input
                            type="tel"
                            placeholder="Contact Phone *"
                            required={requiresDelivery}
                            value={deliveryInfo.phone}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        />
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
                                <FontAwesomeIcon icon={faTruck} className="text-emerald-600 text-[10px]" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Driver Dispatch</span>
                        </div>
                        <select
                            value={deliveryInfo.deliveryPersonId}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryPersonId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
                        >
                            <option value="">⏳ No Assignment (Queued)</option>
                            {deliveryPersonnel.map(p => (
                                <option key={p.id} value={p.id}>🚀 {p.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm transition-colors active:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-[#008069] text-white rounded-xl font-medium text-sm shadow-lg shadow-[#008069]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Create Repair'}
                </button>
            </div>
        </form>
    );
};

export default CreateRepairForm;
