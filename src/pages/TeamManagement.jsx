import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUsers, faSearch, faUserTie, faTools, faTruck,
    faCheckCircle, faBan, faKey, faEdit, faTimes, faMoneyBillWave,
    faStar, faWrench, faUserCog, faShieldAlt, faUserPlus, faTrash
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const TeamManagement = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [editingPasscode, setEditingPasscode] = useState(null);
    const [newPasscode, setNewPasscode] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'STAFF',
        passcode: ''
    });
    const [editingUser, setEditingUser] = useState(null);
    const [editUserData, setEditUserData] = useState({
        name: '',
        email: '',
        phone: '',
        role: ''
    });
    const [currentUser, setCurrentUser] = useState(null);

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : `http://${window.location.hostname}:5000/api`;

    useEffect(() => {
        checkUserRole();
        loadStaff();
    }, []);

    useEffect(() => {
        filterStaff();
    }, [searchQuery, roleFilter, staff]);

    const checkUserRole = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurrentUser(response.data.data.user);

            // Redirect if not CEO
            if (response.data.data.user.role !== 'CEO') {
                alert('Access denied. This page is for CEO only.');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Failed to check user role:', error);
            navigate('/dashboard');
        }
    };

    const loadStaff = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Show all users including CEO for transparency
            const allUsers = response.data.data.users || [];

            setStaff(allUsers);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load staff:', error);
            setLoading(false);
        }
    };

    const filterStaff = () => {
        let filtered = [...staff];

        // Apply role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(s => s.role === roleFilter);
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query) ||
                s.phone?.includes(query)
            );
        }

        setFilteredStaff(filtered);
    };

    const handleUpdatePasscode = async (userId) => {
        if (!newPasscode.trim()) {
            alert('Please enter a 6-digit passcode');
            return;
        }

        if (newPasscode.trim().length !== 6) {
            alert('Passcode must be exactly 6 digits');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                customPasscode: newPasscode.trim()
            };

            await axios.post(`${API_BASE_URL}/users/${userId}/reset-password`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Passcode updated successfully!');
            setEditingPasscode(null);
            setNewPasscode('');
            loadStaff();
        } catch (error) {
            console.error('Failed to update passcode:', error);
            alert(error.response?.data?.message || 'Failed to update passcode');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/users/${userId}/status`, {
                isActive: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`✅ Account ${!currentStatus ? 'activated' : 'suspended'} successfully!`);
            loadStaff();
        } catch (error) {
            console.error('Failed to toggle status:', error);
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.role) {
            alert('Please fill in name, email, and role');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userData = {
                ...newUser,
                customPasscode: newUser.passcode.trim() || undefined
            };

            await axios.post(`${API_BASE_URL}/users/register`, userData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ User created successfully!');
            setShowAddUser(false);
            setNewUser({
                name: '',
                email: '',
                phone: '',
                role: 'STAFF',
                passcode: ''
            });
            loadStaff();
        } catch (error) {
            console.error('Failed to create user:', error);
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        // Prevent deleting own account
        if (userId === currentUser?.id) {
            alert('❌ You cannot delete your own account!');
            return;
        }

        // Double confirmation
        const confirmFirst = window.confirm(
            `⚠️ WARNING: You are about to permanently delete user "${userName}".\n\nThis action CANNOT be undone.\n\nAre you sure you want to continue?`
        );

        if (!confirmFirst) return;

        const confirmSecond = window.confirm(
            `🚨 FINAL CONFIRMATION\n\nDelete "${userName}" permanently?\n\nType OK in your mind and click OK to proceed.`
        );

        if (!confirmSecond) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ User deleted successfully!');
            loadStaff();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setEditUserData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            role: user.role
        });
    };

    const handleUpdateUser = async () => {
        if (!editUserData.name.trim() || !editUserData.email.trim()) {
            alert('Name and email are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/users/${editingUser}`, editUserData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ User updated successfully!');
            setEditingUser(null);
            setEditUserData({ name: '', email: '', phone: '', role: '' });
            loadStaff();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert(error.response?.data?.message || 'Failed to update user');
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            CEO: { icon: faShieldAlt, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', label: 'Chief Executive' },
            MANAGER: { icon: faUserCog, color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Manager' },
            STAFF: { icon: faMoneyBillWave, color: 'bg-green-50 text-green-600 border-green-200', label: 'Sales Staff' },
            TECHNICIAN: { icon: faWrench, color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Technician' },
            DELIVERY: { icon: faTruck, color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Delivery' }
        };
        return badges[role] || badges.STAFF;
    };

    if (loading) {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Team...</p>
                </div>
            </div>
        );
    }

    const totalCount = staff.length;
    const activeCount = staff.filter(s => s.isActive).length;
    const suspendedCount = staff.filter(s => !s.isActive).length;

    return (
        <div className="min-h-screen premium-bg p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all border border-white shrink-0"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div className="flex-1">
                        <p className="premium-label mb-0">CEO Control Center</p>
                        <h1 className="premium-h1">Team Management</h1>
                    </div>
                    <button
                        onClick={() => setShowAddUser(true)}
                        className="premium-btn-primary w-full md:w-auto px-6 py-3 shadow-lg flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        Add New User
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="premium-card p-5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Users</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter">{totalCount}</p>
                    </div>
                    <div className="premium-card p-5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Active</p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">{activeCount}</p>
                    </div>
                    <div className="premium-card p-5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Suspended</p>
                        <p className="text-2xl font-black text-rose-600 tracking-tighter">{suspendedCount}</p>
                    </div>
                </div>

                {/* Add User Modal */}
                {showAddUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="premium-card bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Add New User</h2>
                                <button
                                    onClick={() => setShowAddUser(false)}
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="premium-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="premium-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        placeholder="+255712345678"
                                        className="premium-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="premium-input"
                                    >
                                        <option value="STAFF">Sales Staff</option>
                                        <option value="TECHNICIAN">Technician</option>
                                        <option value="DELIVERY">Delivery Person</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">6-Digit Passcode (Optional)</label>
                                    <input
                                        type="text"
                                        value={newUser.passcode}
                                        onChange={(e) => setNewUser({ ...newUser, passcode: e.target.value })}
                                        placeholder="Leave empty for auto-generated"
                                        maxLength={6}
                                        className="premium-input font-mono"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleAddUser}
                                        className="premium-btn-primary flex-1 px-6 py-4"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                                        Create User
                                    </button>
                                    <button
                                        onClick={() => setShowAddUser(false)}
                                        className="premium-btn-secondary px-6 py-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="premium-card bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Edit User Details</h2>
                                <button
                                    onClick={() => {
                                        setEditingUser(null);
                                        setEditUserData({ name: '', email: '', phone: '', role: '' });
                                    }}
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={editUserData.name}
                                        onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="premium-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={editUserData.email}
                                        onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="premium-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={editUserData.phone}
                                        onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                                        placeholder="+255712345678"
                                        className="premium-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
                                    <select
                                        value={editUserData.role}
                                        onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                                        className="premium-input"
                                    >
                                        <option value="STAFF">Sales Staff</option>
                                        <option value="TECHNICIAN">Technician</option>
                                        <option value="DELIVERY">Delivery Person</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="CEO">CEO</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleUpdateUser}
                                        className="premium-btn-primary flex-1 px-6 py-4"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                        Update User
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingUser(null);
                                            setEditUserData({ name: '', email: '', phone: '', role: '' });
                                        }}
                                        className="premium-btn-secondary px-6 py-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="premium-card p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or phone..."
                                className="premium-input pl-12"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {['ALL', 'CEO', 'MANAGER', 'STAFF', 'TECHNICIAN', 'DELIVERY'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`min-w-[90px] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${roleFilter === role
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {role === 'ALL' ? 'All' : role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-bold text-gray-600">
                            Showing <span className="text-blue-600 font-black">{filteredStaff.length}</span> of {staff.length} team members
                        </p>
                    </div>
                </div>

                {/* Staff List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredStaff.map((member, index) => {
                            const badge = getRoleBadge(member.role);
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="premium-card p-6 relative group"
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6">
                                        {member.isActive ? (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest border border-green-200">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-200">
                                                Suspended
                                            </span>
                                        )}
                                    </div>

                                    {/* Member Info */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${badge.color} border-2`}>
                                            <FontAwesomeIcon icon={badge.icon} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-gray-900 mb-1">{member.name}</h3>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${badge.color.split(' ')[1]}`}>
                                                {badge.label}
                                            </p>
                                            <div className="space-y-1">
                                                {member.email && (
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-bold">📧</span> {member.email}
                                                    </p>
                                                )}
                                                {member.phone && (
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-bold">📞</span> {member.phone}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-bold">🔑 Passcode:</span> {member.passcode || 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {editingPasscode === member.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Edit Passcode</h4>
                                                <button
                                                    onClick={() => {
                                                        setEditingPasscode(null);
                                                        setNewPasscode('');
                                                    }}
                                                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2">New Passcode (6 digits)</label>
                                                    <input
                                                        type="text"
                                                        value={newPasscode}
                                                        onChange={(e) => setNewPasscode(e.target.value)}
                                                        placeholder="Enter 6-digit passcode..."
                                                        maxLength={6}
                                                        className="premium-input font-mono"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleUpdatePasscode(member.id)}
                                                    className="premium-btn-primary w-full px-4 py-3"
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                                    Update Passcode
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <button
                                            onClick={() => handleEditUser(member)}
                                            className="px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-100 transition-all border-2 border-purple-200"
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setEditingPasscode(member.id)}
                                            disabled={editingPasscode === member.id}
                                            className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-50 border-2 border-blue-200"
                                        >
                                            <FontAwesomeIcon icon={faKey} className="mr-2" />
                                            {editingPasscode === member.id ? 'Editing...' : 'Edit Passcode'}
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(member.id, member.isActive)}
                                            className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${member.isActive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={member.isActive ? faBan : faCheckCircle} className="mr-2" />
                                            {member.isActive ? 'Suspend' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(member.id, member.name)}
                                            disabled={member.id === currentUser?.id}
                                            className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed border-2 border-red-700"
                                            title={member.id === currentUser?.id ? 'Cannot delete your own account' : 'Delete user permanently'}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredStaff.length === 0 && (
                    <div className="premium-card p-20 text-center">
                        <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-200 mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No Team Members Found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManagement;
