import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faBoxOpen, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { productAPI } from '../utils/api';

const AddProductForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'PHONE',
        model: '',
        storage: '',
        color: '',
        imei: '',
        condition: 'NEW',
        costPrice: '',
        sellingPrice: '',
        quantity: '1'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError('');
        setShowConfirm(false);

        try {
            await productAPI.create(formData);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product');
            setLoading(false);
        }
    };

    const InputField = ({ label, icon, ...props }) => (
        <div className="space-y-2">
            <label className="block text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">
                {icon && <FontAwesomeIcon icon={icon} className="mr-2 text-[#00ffa3]/40" />}
                {label}
            </label>
            <input
                {...props}
                className="w-full px-5 py-4 bg-white/5 border border-white/5 focus:border-[#00ffa3]/40 rounded-2xl text-[10px] font-black uppercase tracking-wider text-white outline-none transition-all placeholder:text-white/5"
            />
        </div>
    );

    const SelectField = ({ label, options, ...props }) => (
        <div className="space-y-2">
            <label className="block text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">
                {label}
            </label>
            <select
                {...props}
                className="w-full px-5 py-4 bg-white/5 border border-white/5 focus:border-[#00ffa3]/40 rounded-2xl text-[10px] font-black uppercase tracking-wider text-white outline-none transition-all appearance-none cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0c] text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="bg-[#0a0a0c] overflow-hidden -m-6 flex flex-col min-h-[80vh] md:min-h-0 relative">
            {/* Premium Integration Hub Header */}
            <div className="p-10 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ffa3] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
                        <p className="text-[10px] font-black text-[#00ffa3]/60 uppercase tracking-[0.3em] leading-none">Product Registry</p>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Add New Product</h2>
                    <p className="text-[10px] font-black text-white/20 mt-3 uppercase tracking-[0.4em]">Inventory Update // Secure Entry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar relative z-10">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        ERROR: {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputField
                            label="Product Name"
                            icon={faMobileAlt}
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="I.E. IPHONE 15 PRO MAX"
                        />
                    </div>

                    <SelectField
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[
                            { value: 'PHONE', label: 'COMMUNICATIONS (PHONE)' },
                            { value: 'LAPTOP', label: 'COMPUTING (LAPTOP)' },
                            { value: 'ACCESSORY', label: 'PERIPHERALS (ACCESSORY)' },
                            { value: 'OTHER', label: 'MISC (OTHER)' }
                        ]}
                    />

                    <SelectField
                        label="Condition"
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        options={[
                            { value: 'NEW', label: 'ALPHA (NEW)' },
                            { value: 'USED', label: 'BETA (USED)' },
                            { value: 'REFURBISHED', label: 'GAMMA (REFURBISHED)' }
                        ]}
                    />

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <InputField
                            label="Model"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            placeholder="PRO MAX"
                        />
                        <InputField
                            label="Capacity"
                            value={formData.storage}
                            onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                            placeholder="256GB"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <InputField
                            label="Color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            placeholder="NATURAL TITANIUM"
                        />
                        <InputField
                            label="IMEI Number"
                            value={formData.imei}
                            onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                            placeholder="IDENTIFIER..."
                        />
                    </div>

                    {/* Financial Matrix */}
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#00ffa3] rounded-full blur-3xl opacity-5 -mr-16 -mb-16" />

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Buying Price</label>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-white/20">T$H</span>
                                <input
                                    type="number"
                                    required
                                    value={formData.costPrice}
                                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                    className="bg-transparent border-b border-white/10 focus:border-[#00ffa3] py-2 w-full text-xl font-black text-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Selling Price</label>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-[#00ffa3]/40">T$H</span>
                                <input
                                    type="number"
                                    required
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    className="bg-transparent border-b border-white/10 focus:border-[#00ffa3] py-2 w-full text-xl font-black text-[#00ffa3] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Quantity</label>
                            <div className="flex items-center gap-4">
                                <FontAwesomeIcon icon={faBoxOpen} className="text-white/10" />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="bg-transparent border-b border-white/10 focus:border-[#00ffa3] py-2 w-full text-xl font-black text-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-5 bg-white/5 text-white/20 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-5 bg-[#00ffa3] text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(0,255,163,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'ADDING...' : 'ADD PRODUCT'}
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#0a0a0c]/90 backdrop-blur-xl flex items-center justify-center z-[200] p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0a0a0c] border border-white/10 rounded-[3rem] p-12 max-w-sm w-full shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffa3] rounded-full blur-3xl opacity-10 -mr-16 -mt-16" />
                            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase leading-none">Confirm Add</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] leading-relaxed mb-10">
                                Confirm adding {formData.quantity} product(s) to inventory. This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-5 bg-white/5 text-white/20 rounded-2xl font-black text-[9px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="flex-[2] py-5 bg-[#00ffa3] text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddProductForm;
