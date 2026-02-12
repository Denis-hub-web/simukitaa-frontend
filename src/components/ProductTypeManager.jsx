import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const ProductTypeManager = ({ show, onClose }) => {
    const [productTypes, setProductTypes] = useState([
        { id: 1, name: 'iPhone', icon: '🍎', color: 'from-slate-800 to-slate-900' },
        { id: 2, name: 'Samsung', icon: '📱', color: 'from-blue-600 to-blue-700' },
        { id: 3, name: 'Google', icon: '🟦', color: 'from-blue-400 to-blue-500' },
        { id: 4, name: 'Apple Mac', icon: '💻', color: 'from-gray-700 to-gray-800' },
        { id: 5, name: 'Xiaomi', icon: '📲', color: 'from-orange-500 to-orange-600' },
        { id: 6, name: 'Sony', icon: '🎧', color: 'from-purple-600 to-purple-700' },
        { id: 7, name: 'Accessories', icon: '🔌', color: 'from-teal-500 to-teal-600' },
        { id: 8, name: 'Repair Parts', icon: '🔧', color: 'from-red-500 to-red-600' },
    ]);

    const [editing, setEditing] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newType, setNewType] = useState({ name: '', icon: '', color: 'from-gray-500 to-gray-600' });

    const colorOptions = [
        { value: 'from-blue-500 to-blue-600', label: 'Blue' },
        { value: 'from-purple-500 to-purple-600', label: 'Purple' },
        { value: 'from-green-500 to-green-600', label: 'Green' },
        { value: 'from-red-500 to-red-600', label: 'Red' },
        { value: 'from-orange-500 to-orange-600', label: 'Orange' },
        { value: 'from-pink-500 to-pink-600', label: 'Pink' },
        { value: 'from-indigo-500 to-indigo-600', label: 'Indigo' },
        { value: 'from-yellow-500 to-yellow-600', label: 'Yellow' },
        { value: 'from-teal-500 to-teal-600', label: 'Teal' },
    ];

    const handleAdd = () => {
        const type = {
            id: Date.now(),
            ...newType
        };
        setProductTypes([...productTypes, type]);
        setNewType({ name: '', icon: '', color: 'from-gray-500 to-gray-600' });
        setShowAdd(false);
        // TODO: Save to localStorage or backend
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this product type? This cannot be undone.')) {
            setProductTypes(productTypes.filter(t => t.id !== id));
            // TODO: Save to localStorage or backend
        }
    };

    const handleSave = () => {
        // TODO: Save all types to backend
        localStorage.setItem('productTypes', JSON.stringify(productTypes));
        alert('✅ Product types saved!');
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#008069] to-[#00a884] p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-white">Product Type Management</h2>
                            <p className="text-white/80 text-sm font-bold">Customize your shelf types</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Product Types Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {productTypes.map((type) => (
                            <div
                                key={type.id}
                                className={`bg-gradient-to-r ${type.color} p-4 rounded-2xl text-white`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{type.icon}</span>
                                        <div>
                                            <h3 className="font-black text-lg">{type.name}</h3>
                                            <p className="text-xs text-white/80">Product Type</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(type.id)}
                                        className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-red-500 transition-all"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Type */}
                    {showAdd && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 rounded-2xl p-6 mb-4"
                        >
                            <h3 className="font-black text-gray-900 mb-4">Add New Product Type</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2">Type Name</label>
                                    <input
                                        type="text"
                                        value={newType.name}
                                        onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                        placeholder="e.g., Drone, VR Headset"
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#008069] focus:border-[#008069]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        value={newType.icon}
                                        onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                                        placeholder="🚁 (paste emoji here)"
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#008069] focus:border-[#008069] text-2xl"
                                        maxLength={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2">Color</label>
                                    <select
                                        value={newType.color}
                                        onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#008069] focus:border-[#008069]"
                                    >
                                        {colorOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAdd}
                                        className="flex-1 bg-[#008069] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#006e59]"
                                    >
                                        Add Type
                                    </button>
                                    <button
                                        onClick={() => setShowAdd(false)}
                                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!showAdd && (
                        <button
                            onClick={() => setShowAdd(true)}
                            className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-all border-2 border-dashed border-gray-300"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Add Custom Product Type</span>
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-[#008069] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#006e59]"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        <span>Save Changes</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductTypeManager;
