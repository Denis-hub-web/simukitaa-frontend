import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faBell,
    faShield,
    faLanguage,
    faPalette,
    faQuestionCircle,
    faSignOutAlt,
    faChevronRight,
    faKey,
    faDownload,
    faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SettingsTab = ({ user }) => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('main');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const settingsItems = [
        {
            id: 'account',
            icon: faUser,
            label: 'Account Settings',
            value: user?.name || 'User',
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            id: 'notifications',
            icon: faBell,
            label: 'Notifications',
            value: 'Manage alerts',
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            id: 'security',
            icon: faShield,
            label: 'Privacy & Security',
            value: 'Password & permissions',
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            id: 'preferences',
            icon: faPalette,
            label: 'Preferences',
            value: 'Language & theme',
            color: 'text-pink-600',
            bg: 'bg-pink-100'
        },
        {
            id: 'help',
            icon: faQuestionCircle,
            label: 'Help & Support',
            value: 'FAQs & contact',
            color: 'text-gray-600',
            bg: 'bg-gray-100'
        }
    ];

    if (activeSection === 'main') {
        return (
            <div className="px-4 space-y-4 pb-6">
                {/* User Card */}
                <div className="bg-gradient-to-br from-[#008069] to-[#00a884] rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-[#008069]">
                                {user?.name?.charAt(0) || 'S'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
                            <p className="text-white/80 text-sm">{user?.email || user?.phone || 'user@simukitaa.com'}</p>
                            <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full">
                                <span className="text-white text-xs font-semibold">{user?.role || 'STAFF'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {settingsItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSection(item.id)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                        >
                            <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center`}>
                                <FontAwesomeIcon icon={item.icon} className={item.color} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-900">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.value}</p>
                            </div>
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 text-sm" />
                        </button>
                    ))}
                </div>

                {/* App Info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                    <p className="text-sm text-gray-500">Simukitaa Business</p>
                    <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                    <span>Logout</span>
                </button>
            </div>
        );
    }

    // Detail Pages
    return (
        <div className="px-4 space-y-4 pb-6">
            {/* Back Button Header */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => setActiveSection('main')}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-[#008069]" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                    {settingsItems.find(item => item.id === activeSection)?.label}
                </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
                {activeSection === 'account' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                defaultValue={user?.name}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                defaultValue={user?.email}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                defaultValue={user?.phone}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                            />
                        </div>
                        <button className="w-full bg-[#008069] hover:bg-[#006655] active:bg-[#005544] text-white font-semibold py-3 rounded-xl transition-all shadow-lg">
                            Save Changes
                        </button>
                    </div>
                )}

                {activeSection === 'notifications' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-semibold text-gray-900">Sales Notifications</p>
                                <p className="text-sm text-gray-600">Get notified about new sales</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#008069] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008069]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-semibold text-gray-900">Stock Alerts</p>
                                <p className="text-sm text-gray-600">Low stock level warnings</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#008069] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008069]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-semibold text-gray-900">Team Updates</p>
                                <p className="text-sm text-gray-600">Staff performance alerts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#008069] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008069]"></div>
                            </label>
                        </div>
                    </div>
                )}

                {activeSection === 'security' && (
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all">
                            <div className="w-10 h-10 bg-[#008069]/10 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faKey} className="text-[#008069]" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-900">Change Password</p>
                                <p className="text-sm text-gray-600">Update your password</p>
                            </div>
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-400" />
                        </button>
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm font-medium text-blue-900 mb-2">Security Tips</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Use a strong, unique password</li>
                                <li>• Enable two-factor authentication</li>
                                <li>• Don't share your login credentials</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeSection === 'preferences' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] bg-white">
                                <option value="en">🇬🇧 English</option>
                                <option value="sw">🇹🇿 Kiswahili</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008069] bg-white">
                                <option value="light">☀️ Light</option>
                                <option value="dark">🌙 Dark</option>
                                <option value="auto">⚙️ Auto</option>
                            </select>
                        </div>
                        <button className="w-full bg-[#008069] hover:bg-[#006655] active:bg-[#005544] text-white font-semibold py-3 rounded-xl transition-all shadow-lg">
                            Save Preferences
                        </button>
                    </div>
                )}

                {activeSection === 'help' && (
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">Frequently Asked Questions</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 ml-auto" />
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faDownload} className="text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">Download User Guide</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 ml-auto" />
                        </button>
                        <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                            <p className="font-semibold text-gray-900 mb-3">Contact Support</p>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p><strong>📧 Email:</strong> support@simukitaa.com</p>
                                <p><strong>📱 Phone:</strong> +255 123 456 789</p>
                                <p><strong>🕒 Hours:</strong> Mon-Fri, 8AM-6PM</p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
                            <p className="text-sm text-gray-600">App Version</p>
                            <p className="text-lg font-bold text-gray-900">1.0.0</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsTab;
