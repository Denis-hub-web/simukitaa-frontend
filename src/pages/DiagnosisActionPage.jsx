import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faWrench, faCheck, faPlus, faTimes,
    faMoneyBillWave, faClock, faMicrochip, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnosisInput from '../components/DiagnosisInput';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `http://${window.location.hostname}:5000/api`;

const DiagnosisActionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [repair, setRepair] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [partSearch, setPartSearch] = useState('');
    const [showPartDropdown, setShowPartDropdown] = useState(false);

    // Form States
    const [diagnosis, setDiagnosis] = useState('');
    const [laborCost, setLaborCost] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [selectedParts, setSelectedParts] = useState([]);
    const [customParts, setCustomParts] = useState([]);
    const [noInventory, setNoInventory] = useState(false);
    const [customPartEntry, setCustomPartEntry] = useState({ name: '', price: '' });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [repairRes, spareRes] = await Promise.all([
                axios.get(`${API_URL}/repairs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/spare-parts`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const repairData = repairRes.data.data;
            setRepair(repairData);
            setSpareParts(spareRes.data.data || []);

            // Pre-fill if exists
            if (repairData.diagnosis) {
                setDiagnosis(repairData.diagnosis || '');
                setLaborCost(repairData.laborCost?.toString() || '');
                setEstimatedTime(repairData.estimatedTime || '');
                setSelectedParts(repairData.partsRequired || []);
                setCustomParts(repairData.customComponents || []);
                setNoInventory(repairData.noInventoryNeeded || false);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load repair data');
        } finally {
            setLoading(false);
        }
    };

    const addInventoryPart = (part) => {
        setSelectedParts(prev => {
            const exists = prev.find(p => p.id === part.id);
            if (exists) {
                return prev.map(p => p.id === part.id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, { ...part, qty: 1 }];
        });
        setPartSearch('');
        setShowPartDropdown(false);
    };

    const removeInventoryPart = (partId) => {
        setSelectedParts(prev => prev.filter(p => p.id !== partId));
    };

    const addCustomPart = () => {
        if (!customPartEntry.name || !customPartEntry.price) return;
        setCustomParts(prev => [...prev, { ...customPartEntry }]);
        setCustomPartEntry({ name: '', price: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const partsRequired = selectedParts.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.qty,
                sellingPrice: p.sellingPrice,
                costPrice: p.costPrice
            }));

            await axios.post(`${API_URL}/repairs/${id}/diagnosis`, {
                diagnosis,
                partsRequired,
                customComponents: customParts,
                noInventoryNeeded: noInventory,
                estimatedTime,
                laborCost: parseFloat(laborCost) || 0
            }, { headers: { Authorization: `Bearer ${token}` } });

            navigate(`/repairs/${id}`);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to save diagnosis');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const calcTotal = () => {
        const invTotal = selectedParts.reduce((sum, p) => sum + (p.sellingPrice * p.qty), 0);
        const cusTotal = customParts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
        const labor = parseFloat(laborCost) || 0;
        return invTotal + cusTotal + labor;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-gray-900">Technical Diagnosis</h1>
                        <p className="text-xs font-bold text-blue-600">{repair?.customerName}'s {repair?.deviceModel}</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Findings */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Initial Findings & Solution</label>
                        <DiagnosisInput
                            value={diagnosis}
                            onChange={(val) => setDiagnosis(val)}
                            placeholder="Type the technical diagnosis here..."
                        />
                    </section>

                    {/* Costing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Labor Cost (TZS)</label>
                            <div className="relative">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    required
                                    value={laborCost}
                                    onChange={(e) => setLaborCost(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-gray-100 font-black text-xl"
                                    placeholder="0"
                                />
                            </div>
                        </section>
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Est. Wait Time</label>
                            <div className="relative">
                                <FontAwesomeIcon icon={faClock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={estimatedTime}
                                    onChange={(e) => setEstimatedTime(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-gray-100 font-bold"
                                    placeholder="e.g. 2-3 Hours"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Inventory */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Spare Parts & Components</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={noInventory}
                                    onChange={(e) => setNoInventory(e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                                <span className="text-xs font-bold text-gray-400">No Parts Needed</span>
                            </label>
                        </div>

                        {!noInventory && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search inventory spare parts..."
                                        value={partSearch}
                                        onChange={(e) => {
                                            setPartSearch(e.target.value);
                                            setShowPartDropdown(true);
                                        }}
                                        className="w-full px-6 py-4 rounded-xl border-2 border-gray-100 font-bold"
                                    />
                                    <AnimatePresence>
                                        {showPartDropdown && partSearch && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto overflow-x-hidden"
                                            >
                                                {spareParts
                                                    .filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase()))
                                                    .map(part => (
                                                        <button
                                                            key={part.id}
                                                            type="button"
                                                            onClick={() => addInventoryPart(part)}
                                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 border-b last:border-0"
                                                        >
                                                            <div className="text-left">
                                                                <p className="font-black text-gray-800">{part.name}</p>
                                                                <p className="text-xs text-blue-600 font-bold">Stock: {part.quantity}</p>
                                                            </div>
                                                            <p className="font-black text-gray-900">TZS {part.sellingPrice?.toLocaleString()}</p>
                                                        </button>
                                                    ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Custom Part */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            placeholder="External Part Name"
                                            value={customPartEntry.name}
                                            onChange={e => setCustomPartEntry({ ...customPartEntry, name: e.target.value })}
                                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={customPartEntry.price}
                                            onChange={e => setCustomPartEntry({ ...customPartEntry, price: e.target.value })}
                                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addCustomPart}
                                        className="w-full mt-3 py-2 bg-white text-blue-600 text-xs font-black uppercase tracking-widest rounded-lg border border-blue-100 hover:bg-blue-50 transition-all"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add External Part
                                    </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2 mt-4">
                                    {selectedParts.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                            <div>
                                                <p className="font-black text-gray-800 text-sm">{p.name}</p>
                                                <p className="text-[10px] uppercase font-black text-blue-600">Inventory Part × {p.qty}</p>
                                            </div>
                                            <button type="button" onClick={() => removeInventoryPart(p.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500">
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                    {customParts.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                                            <div>
                                                <p className="font-black text-gray-800 text-sm">{p.name}</p>
                                                <p className="text-[10px] uppercase font-black text-indigo-600">External Component</p>
                                            </div>
                                            <button type="button" onClick={() => setCustomParts(prev => prev.filter((_, i) => i !== idx))} className="w-8 h-8 rounded-full bg-red-50 text-red-500">
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Summary & Submit */}
                    <section className="bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-500/20 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-black">TZS {calcTotal().toLocaleString()}</h3>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Total Repair Estimate</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faClipboardList} className="text-xl" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-5 bg-white text-blue-600 font-black text-lg rounded-2xl shadow-lg hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {saving ? 'Processing Reference...' : 'Finalize Diagnosis'}
                        </button>
                    </section>
                </form>
            </main>
        </div>
    );
};

export default DiagnosisActionPage;
