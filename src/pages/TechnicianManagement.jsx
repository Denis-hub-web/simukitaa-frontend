import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUserPlus, faSearch, faEdit, faToggleOn, faToggleOff,
    faWrench, faCheckCircle, faTimesCircle, faStar, faTimes, faChevronRight,
    faPhone, faEnvelope, faAward, faUsers, faCircle, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TechnicianManagement = () => {
    const navigate = useNavigate();
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadTechnicians();
    }, []);

    const loadTechnicians = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/technicians`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setTechnicians(response.data.data);
            }
        } catch (error) {
            console.error('Error loading technicians:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTechnicianStatus = async (techId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

            const response = await axios.put(
                `${API_URL}/technicians/${techId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                loadTechnicians();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredTechnicians = technicians.filter(tech =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tech.phone && tech.phone.includes(searchQuery))
    );

    const stats = {
        total: technicians.length,
        active: technicians.filter(t => t.status === 'Active').length,
        topRated: technicians.filter(t => (t.performance?.averageRating || 0) >= 4.5).length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-black tracking-tight uppercase text-xs">Loading Technicians...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Premium Global Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#008069] relative overflow-hidden pb-12 pt-4 shadow-xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">Technician Directory</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Team Performance</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-white text-[#008069] px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            <FontAwesomeIcon icon={faUserPlus} />
                            <span>Add Technician</span>
                        </button>
                    </div>

                    {/* Performance Overview */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Technicians', value: stats.total, icon: faUsers, color: 'blue' },
                            { label: 'Active Status', value: stats.active, icon: faCircle, color: 'green' },
                            { label: 'Top Rated', value: stats.topRated, icon: faAward, color: 'amber' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                                <div className="flex items-center gap-3 mb-1">
                                    <FontAwesomeIcon icon={s.icon} className="text-white/60 text-[10px]" />
                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <p className="text-xl text-white font-black leading-none">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Search Ecosystem */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative group w-full">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#008069] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or credentials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-gray-50/50 rounded-[2rem] text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Technician List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredTechnicians.map((tech, index) => (
                        <motion.div
                            key={tech.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-2xl transition-all border border-gray-50 group active:scale-[0.98] relative overflow-hidden"
                        >
                            <div className="flex items-start gap-5 relative z-10">
                                <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-3xl transition-transform group-hover:scale-110 shadow-inner ${tech.status === 'Active' ? 'bg-green-50 text-[#008069]' : 'bg-gray-50 text-gray-300'
                                    }`}>
                                    <FontAwesomeIcon icon={faWrench} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-black text-gray-900 leading-tight group-hover:text-[#008069] transition-colors">{tech.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${tech.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                                                    }`}>
                                                    {tech.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                <span className="text-sm font-black">{tech.performance?.averageRating || '0.0'}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Efficiency</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <FontAwesomeIcon icon={faEnvelope} className="w-4 text-gray-300" />
                                            <span>{tech.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <FontAwesomeIcon icon={faPhone} className="w-4 text-gray-300" />
                                            <span>{tech.phone}</span>
                                        </div>
                                    </div>

                                    {/* Operational Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100 shadow-inner">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Repairs Completed</p>
                                            <p className="text-lg font-black text-gray-900 leading-none">{tech.performance?.totalRepairs || 0}</p>
                                        </div>
                                        <div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100 shadow-inner">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Success Rate</p>
                                            <p className="text-lg font-black text-[#008069] leading-none">
                                                {tech.performance?.totalRepairs ? Math.round((tech.performance.completedRepairs / tech.performance.totalRepairs) * 100) : 0}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 relative z-20">
                                        <button
                                            onClick={() => toggleTechnicianStatus(tech.id, tech.status)}
                                            className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${tech.status === 'Active' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#008069] text-white'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={tech.status === 'Active' ? faToggleOff : faToggleOn} className="mr-2" />
                                            {tech.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedTechnician(tech)}
                                            className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg active:scale-90"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const customPwd = prompt('Define custom system password:');
                                                if (customPwd === null) return;
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    const response = await axios.post(`${API_URL}/technicians/${tech.id}/reset-password`, { customPassword: customPwd || undefined }, { headers: { Authorization: `Bearer ${token}` } });
                                                    if (response.data.success) alert(`Registry Updated!\n\nAccess Key: ${response.data.data.newPassword}`);
                                                } catch (error) { alert('Credential override failed'); }
                                            }}
                                            className="w-12 h-12 bg-white border border-gray-200 text-gray-400 rounded-xl flex items-center justify-center hover:text-[#008069] hover:border-[#008069] transition-all shadow-sm active:scale-90"
                                        >
                                            <FontAwesomeIcon icon={faShieldAlt} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredTechnicians.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100">
                        <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Personnel Found</h3>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Registry scan complete. No matching records found.</p>
                    </div>
                )}
            </div>

            {/* Premium Modals Overlay */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegisterModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <TechnicianRegistrationModal onClose={() => setShowRegisterModal(false)} onSuccess={() => { setShowRegisterModal(false); loadTechnicians(); }} />
                        </motion.div>
                    </div>
                )}
                {selectedTechnician && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTechnician(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <EditTechnicianModal technician={selectedTechnician} onClose={() => setSelectedTechnician(null)} onSuccess={() => { setSelectedTechnician(null); loadTechnicians(); }} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TechnicianRegistrationModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', customPassword: '', specializations: [] });
    const [specializationInput, setSpecializationInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const addSpecialization = () => {
        if (specializationInput.trim() && !formData.specializations.includes(specializationInput.trim())) {
            setFormData({ ...formData, specializations: [...formData.specializations, specializationInput.trim()] });
            setSpecializationInput('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/technicians/register`, formData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) setTempPassword(response.data.data.tempPassword);
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failure');
            setLoading(false);
        }
    };

    if (tempPassword) {
        return (
            <div className="p-10 text-center">
                <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-100">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-4xl" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Technician Registered</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Registration Complete</p>
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Temporary Password</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{tempPassword}</p>
                </div>
                <button onClick={onSuccess} className="w-full bg-[#008069] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl">Confirm Registration</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-gray-900 p-10 text-white">
                <h2 className="text-3xl font-black tracking-tighter leading-none mb-1 text-white">Add Technician</h2>
                <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">Registration Form</p>
            </div>
            <div className="p-10 space-y-6">
                {[
                    { label: 'Full Name', field: 'name', type: 'text', req: true },
                    { label: 'Email Address', field: 'email', type: 'email', sub: 'Optional - will auto-generate if null' },
                    { label: 'Phone Number', field: 'phone', type: 'tel', req: true, ph: '+255...' }
                ].map((f, i) => (
                    <div key={i}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{f.label} {f.req && '*'}</p>
                        <input
                            type={f.type}
                            required={f.req}
                            placeholder={f.ph || ''}
                            value={formData[f.field]}
                            onChange={(e) => setFormData({ ...formData, [f.field]: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all"
                        />
                        {f.sub && <p className="text-[8px] font-bold text-gray-400 mt-1 ml-2 uppercase tracking-tighter">{f.sub}</p>}
                    </div>
                ))}

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 px-6 border border-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50">Abort</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 px-6 bg-[#008069] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#008069]/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {loading ? 'Processing...' : 'Authorize'}
                    </button>
                </div>
            </div>
        </form>
    );
};

const EditTechnicianModal = ({ technician, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: technician.name, email: technician.email, phone: technician.phone });
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/technicians/${technician.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) { alert('Registry Modified'); onSuccess(); }
        } catch (error) { alert('Modification failed'); } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-gray-900 p-10 text-white">
                <h2 className="text-3xl font-black tracking-tighter leading-none mb-1 text-white">Modify Profile</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Data Correction Process</p>
            </div>
            <div className="p-10 space-y-6">
                {[
                    { label: 'Personnel Name', field: 'name' },
                    { label: 'Contact Channel', field: 'email' },
                    { label: 'Operational Phone', field: 'phone' }
                ].map((f, i) => (
                    <div key={i}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{f.label}</p>
                        <input
                            type="text"
                            value={formData[f.field]}
                            onChange={(e) => setFormData({ ...formData, [f.field]: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all"
                        />
                    </div>
                ))}
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 px-6 border border-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50">Discard</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 px-6 bg-[#008069] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#008069]/20">Update</button>
                </div>
            </div>
        </form>
    );
};


export default TechnicianManagement;
