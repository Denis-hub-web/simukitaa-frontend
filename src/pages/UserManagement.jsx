import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUserPlus, faSearch, faEdit, faToggleOn, faToggleOff,
    faIdBadge, faCheckCircle, faTimes, faChevronRight,
    faPhone, faEnvelope, faUserShield, faUsers, faCircle, faKey,
    faTrashAlt, faFilter, faUserTie, faTruck, faWrench, faUserTag
} from '@fortawesome/free-solid-svg-icons';
import { userAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userAPI.getAll();
            if (response.data.success) {
                setUsers(response.data.data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const response = await userAPI.update(userId, { isActive: !currentStatus });
            if (response.data.success) {
                loadUsers();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure? This will remove the user from the user database.')) return;
        try {
            await userAPI.delete(userId);
            loadUsers();
        } catch (error) {
            alert('Delete failed: ' + (error.response?.data?.message || 'Server error'));
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery))
        );
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case 'CEO': return faUserShield;
            case 'MANAGER': return faUserTie;
            case 'TECHNICIAN': return faWrench;
            case 'DELIVERY': return faTruck;
            case 'STAFF': return faUserTag;
            default: return faIdBadge;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'CEO': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'MANAGER': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'TECHNICIAN': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DELIVERY': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'STAFF': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#efeff4] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-black tracking-tight uppercase text-xs">Loading Users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#efeff4] pb-20">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden pb-12 pt-4 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">System Administration</p>
                                <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Personnel Management</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl hover:bg-emerald-600 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            <FontAwesomeIcon icon={faUserPlus} />
                            <span>Register User</span>
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: 'Total Personnel', value: users.length, icon: faUsers },
                            { label: 'Active Sessions', value: users.filter(u => u.isActive).length, icon: faCircle, color: 'text-emerald-400' },
                            { label: 'Delivery Support', value: users.filter(u => u.role === 'DELIVERY').length, icon: faTruck }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">{s.label}</p>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={s.icon} className={`text-[10px] ${s.color || 'text-white/60'}`} />
                                    <span className="text-sm font-black text-white">{s.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                {/* Search & Filter Ecosystem */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative group w-full">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-gray-50/50 rounded-[2rem] text-sm font-bold border-0 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {['ALL', 'CEO', 'MANAGER', 'STAFF', 'TECHNICIAN', 'DELIVERY'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === role ? 'bg-slate-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Roster */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 group hover:shadow-xl transition-all relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${getRoleColor(user.role)}`}>
                                    <FontAwesomeIcon icon={getRoleIcon(user.role)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-gray-900 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{user.name}</h3>
                                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-1 border ${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className={`w-3 h-3 rounded-full mt-1 ${user.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`}></div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                    <FontAwesomeIcon icon={faEnvelope} className="w-4 text-gray-300" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                    <FontAwesomeIcon icon={faPhone} className="w-4 text-gray-300" />
                                    <span>{user.phone || 'No contact'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                                    className={`flex-1 py-3 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                >
                                    <FontAwesomeIcon icon={user.isActive ? faToggleOff : faToggleOn} className="mr-1.5" />
                                    {user.isActive ? 'Suspend' : 'Resume'}
                                </button>
                                <button
                                    onClick={() => {
                                        const pass = prompt('Define custom access key:');
                                        if (pass !== null) {
                                            userAPI.resetPassword(user.id, pass || undefined)
                                                .then(res => alert(`System Updated - Access Key: ${res.data.data.tempPassword}`))
                                                .catch(err => alert('Reset failed'));
                                        }
                                    }}
                                    className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all active:scale-95"
                                    title="Reset Password"
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="w-10 h-10 bg-red-50 text-red-300 rounded-xl flex items-center justify-center hover:text-red-600 transition-all active:scale-95"
                                    title="Delete User"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100">
                        <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Users Found</h3>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">No matching personnel records found.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegisterModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <UserRegistrationModal onClose={() => setShowRegisterModal(false)} onSuccess={() => { setShowRegisterModal(false); loadUsers(); }} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const UserRegistrationModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'STAFF', password: '' });
    const [loading, setLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState('');

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : `http://${window.location.hostname}:5000/api`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/users/register`, formData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setTempPassword(response.data.data.tempPassword);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Authorization failure');
            setLoading(false);
        }
    };

    if (tempPassword) {
        return (
            <div className="p-10 text-center">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-100">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-4xl" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Registration Success</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Access Key Generated</p>
                <div className="bg-slate-900 rounded-[2rem] p-8 mb-8 border border-white/10">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Temporary Password</p>
                    <p className="text-4xl font-black text-emerald-400 tracking-tighter">{tempPassword}</p>
                </div>
                <button onClick={onSuccess} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl">Complete Registration</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-slate-900 p-10 text-white">
                <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase">New User</h2>
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">User Registration Form</p>
            </div>
            <div className="p-8 space-y-4">
                {[
                    { label: 'Full Legal Name', field: 'name', type: 'text', req: true },
                    { label: 'Network Email', field: 'email', type: 'email', req: true },
                    { label: 'Operational Phone', field: 'phone', type: 'tel', ph: '+255...' },
                ].map((f, i) => (
                    <div key={i}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{f.label}</p>
                        <input
                            type={f.type}
                            required={f.req}
                            placeholder={f.ph || ''}
                            value={formData[f.field]}
                            onChange={(e) => setFormData({ ...formData, [f.field]: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl text-sm font-bold border-gray-100 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                    </div>
                ))}

                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Operational Role</p>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-xl text-sm font-bold border-gray-100 focus:ring-4 focus:ring-emerald-500/10 transition-all uppercase tracking-widest"
                    >
                        <option value="STAFF">Staff (Logistics/Sales)</option>
                        <option value="MANAGER">Manager</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="DELIVERY">Delivery Personnel</option>
                        <option value="CEO">CEO / Admin</option>
                    </select>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-50 transition-all">Abort</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl hover:bg-slate-800 transition-all">
                        {loading ? 'Processing...' : 'Create User'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default UserManagement;
