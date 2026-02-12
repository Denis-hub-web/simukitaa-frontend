import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faEnvelope, faCommentDots, faSearch, faFilter,
    faCheckCircle, faTimesCircle, faEdit, faSave, faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationPreferences = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ email: '', phone: '' });

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/user-preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.data.users || []);
            setCustomers(res.data.data.customers || []);
        } catch (error) {
            console.error('Error loading preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = async (userId, type, field, currentValue) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/user-preferences/${userId}`, {
                [field]: !currentValue,
                type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            if (type === 'user') {
                setUsers(users.map(u => u.id === userId ? { ...u, [field]: !currentValue } : u));
            } else {
                setCustomers(customers.map(c => c.id === userId ? { ...c, [field]: !currentValue } : c));
            }
        } catch (error) {
            console.error('Error toggling preference:', error);
        }
    };

    const startEditing = (user) => {
        setEditingUser(user.id);
        setEditForm({ email: user.email, phone: user.phone });
    };

    const cancelEditing = () => {
        setEditingUser(null);
        setEditForm({ email: '', phone: '' });
    };

    const saveContact = async (userId, type) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/user-preferences/${userId}`, {
                email: editForm.email,
                phone: editForm.phone,
                type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            if (type === 'user') {
                setUsers(users.map(u => u.id === userId ? { ...u, email: editForm.email, phone: editForm.phone } : u));
            } else {
                setCustomers(customers.map(c => c.id === userId ? { ...c, email: editForm.email, phone: editForm.phone } : c));
            }

            setEditingUser(null);
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            CEO: 'bg-purple-100 text-purple-700 border-purple-200',
            MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
            STAFF: 'bg-green-100 text-green-700 border-green-200',
            TECHNICIAN: 'bg-orange-100 text-orange-700 border-orange-200',
            DELIVERY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            CUSTOMER: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return badges[role] || badges.CUSTOMER;
    };

    const filteredUsers = [...users, ...customers].filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.phone.includes(search);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/notification-templates')}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Preferences</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage who receives notifications and through which channels</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors outline-none bg-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="CEO">CEO</option>
                        <option value="MANAGER">Manager</option>
                        <option value="STAFF">Staff</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="DELIVERY">Delivery</option>
                        <option value="CUSTOMER">Customer</option>
                    </select>
                </div>

                {/* User List */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faCommentDots} className="mr-2" />
                                        WhatsApp
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{user.name}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser === user.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Email"
                                                    />
                                                    <input
                                                        type="tel"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Phone"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <p className="text-gray-700">{user.email || 'No email'}</p>
                                                    <p className="text-gray-500 mt-1">{user.phone || 'No phone'}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => togglePreference(user.id, user.type, 'emailNotificationsEnabled', user.emailNotificationsEnabled)}
                                                className={`w-16 h-8 rounded-full transition-all relative ${user.emailNotificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                disabled={editingUser === user.id}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${user.emailNotificationsEnabled ? 'right-1' : 'left-1'
                                                    }`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => togglePreference(user.id, user.type, 'whatsappNotificationsEnabled', user.whatsappNotificationsEnabled)}
                                                className={`w-16 h-8 rounded-full transition-all relative ${user.whatsappNotificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                disabled={editingUser === user.id}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${user.whatsappNotificationsEnabled ? 'right-1' : 'left-1'
                                                    }`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editingUser === user.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => saveContact(user.id, user.type)}
                                                        className="w-8 h-8 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                                    >
                                                        <FontAwesomeIcon icon={faSave} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="w-8 h-8 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(user)}
                                                    className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="mt-8 text-center text-gray-500">
                        <p>No users found matching your search</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPreferences;
