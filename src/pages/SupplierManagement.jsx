import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPlus, faTruck, faPhone, faUser, faEdit, faTrash,
    faCheckCircle, faTimesCircle, faMoneyBillWave, faSearch, faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { supplierAPI } from '../utils/supplierAPI';

const SupplierManagement = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        paymentTerms: 'Cash'
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await supplierAPI.getAll();
            setSuppliers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            alert('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await supplierAPI.update(editingSupplier.id, formData);
                alert('✅ Supplier updated successfully!');
            } else {
                await supplierAPI.create(formData);
                alert('✅ Supplier created successfully!');
            }
            setShowAddModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contactPerson: '', phone: '', paymentTerms: 'Cash' });
            fetchSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert(error.response?.data?.message || 'Failed to save supplier');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            phone: supplier.phone,
            paymentTerms: supplier.paymentTerms
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        try {
            await supplierAPI.delete(id);
            alert('✅ Supplier deleted successfully!');
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert(error.response?.data?.message || 'Failed to delete supplier');
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
    );

    const activeSuppliers = filteredSuppliers.filter(s => s.status === 'active').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FontAwesomeIcon icon={faTruck} className="text-indigo-600" />
                        Supplier Management
                    </h1>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setFormData({ name: '', contactPerson: '', phone: '', paymentTerms: 'Cash' });
                            setShowAddModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span className="hidden sm:inline">Add Supplier</span>
                    </button>
                </div>

                {/* Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-100 mb-6"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-black text-indigo-600">{suppliers.length}</div>
                            <div className="text-sm text-gray-600 font-semibold">Total Suppliers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-600">{activeSuppliers}</div>
                            <div className="text-sm text-gray-600 font-semibold">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-orange-600">{suppliers.length - activeSuppliers}</div>
                            <div className="text-sm text-gray-600 font-semibold">Inactive</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-purple-600">{filteredSuppliers.length}</div>
                            <div className="text-sm text-gray-600 font-semibold">Showing</div>
                        </div>
                    </div>
                </motion.div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search suppliers by name, contact, or phone..."
                        className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Supplier List - Stripe Design */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-semibold">Loading suppliers...</p>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <FontAwesomeIcon icon={faTruck} className="text-6xl text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Suppliers Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Get started by adding your first supplier'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Add First Supplier
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredSuppliers.map((supplier, index) => (
                                <motion.div
                                    key={supplier.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border-2 border-gray-100 hover:border-indigo-200"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${supplier.status === 'active'
                                                ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                                                : 'bg-gradient-to-br from-gray-100 to-slate-100'
                                            }`}>
                                            <FontAwesomeIcon
                                                icon={faBuilding}
                                                className={`text-2xl ${supplier.status === 'active' ? 'text-green-600' : 'text-gray-400'
                                                    }`}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-black text-gray-900 truncate">{supplier.name}</h3>
                                                {supplier.status === 'active' ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">
                                                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                                    {supplier.contactPerson}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faPhone} className="text-green-500" />
                                                    {supplier.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-orange-500" />
                                                    {supplier.paymentTerms}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(supplier)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                title="Edit Supplier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier.id)}
                                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                title="Delete Supplier"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => {
                            setShowAddModal(false);
                            setEditingSupplier(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={editingSupplier ? faEdit : faPlus} className="text-indigo-600 text-xl" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">
                                    {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faBuilding} className="mr-2 text-indigo-500" />
                                        Supplier Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                        placeholder="e.g., Apple Tanzania Ltd"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
                                        Contact Person *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                        placeholder="e.g., John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                        placeholder="e.g., +255712345678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-orange-500" />
                                        Payment Terms
                                    </label>
                                    <select
                                        value={formData.paymentTerms}
                                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Net 7">Net 7 Days</option>
                                        <option value="Net 15">Net 15 Days</option>
                                        <option value="Net 30">Net 30 Days</option>
                                        <option value="Net 60">Net 60 Days</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditingSupplier(null);
                                        }}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                    >
                                        {editingSupplier ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierManagement;
