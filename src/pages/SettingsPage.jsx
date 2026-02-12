import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faBell, faShield, faLanguage, faPalette,
    faQuestionCircle, faSignOutAlt, faChevronRight, faKey,
    faDatabase, faDownload, faArrowLeft, faCheckCircle,
    faMoon, faGlobe, faUserShield
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [activeSection, setActiveSection] = useState('account');

    const handleLogout = () => {
        if (window.confirm('Log out of your account?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const settingsSections = [
        { id: 'account', icon: faUser, label: 'Account Profile', desc: 'Manage your profile', color: 'blue' },
        { id: 'notifications', icon: faBell, label: 'Notifications', desc: 'Alert preferences', color: 'green' },
        { id: 'security', icon: faShield, label: 'Security', desc: 'Privacy & password', color: 'purple' },
        { id: 'preferences', icon: faPalette, label: 'Appearance', desc: 'Theme & display', color: 'pink' },
        { id: 'help', icon: faQuestionCircle, label: 'Support', desc: 'Documentation & FAQ', color: 'gray' }
    ];

    return (
        <div className="min-h-screen bg-[#efeff4] pb-24">
            {/* Premium Global Header */}
            <div className="bg-gradient-to-r from-[#008069] via-[#00a884] to-[#008069] relative overflow-hidden pb-12 pt-4 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <p className="text-white font-black uppercase tracking-[0.2em] opacity-90 text-[10px]">App Preferences</p>
                            <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Settings</h1>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-8"
                    >
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden border-2 border-white/20 shrink-0">
                            <span className="text-4xl font-black text-[#008069]">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                <h2 className="text-2xl font-black text-white tracking-tighter leading-none">{user?.name}</h2>
                                <span className="inline-block bg-white/20 px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-white border border-white/10 backdrop-blur-sm self-center md:self-auto">{user?.role || 'STAFF'}</span>
                            </div>
                            <p className="text-white font-bold uppercase tracking-widest opacity-80 text-[10px]">{user?.email || user?.phone}</p>
                        </div>
                        <button className="px-8 py-4 bg-white text-[#008069] rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Profile Settings</button>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Navigation Sector */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100">
                            <div className="px-4 py-3 mb-2">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Settings Menu</p>
                            </div>
                            <div className="space-y-2">
                                {settingsSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeSection === section.id ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'hover:bg-gray-50 text-gray-500'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSection === section.id ? 'bg-white/10' : 'bg-gray-50'
                                            }`}>
                                            <FontAwesomeIcon icon={section.icon} className={activeSection === section.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">{section.label}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${activeSection === section.id ? 'text-white/70' : 'text-gray-500'}`}>{section.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleLogout} className="w-full bg-white text-red-600 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-sm border border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-3">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Logout
                        </button>
                    </div>

                    {/* Operational Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {activeSection === 'account' && (
                                    <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Account Profile</h3>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Update your account information</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="group">
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Identity Signature</p>
                                                <input type="text" defaultValue={user?.name} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all shadow-inner" />
                                            </div>
                                            <div className="group">
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Email System</p>
                                                <input type="email" defaultValue={user?.email} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all shadow-inner" />
                                            </div>
                                            <div className="group">
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Communications System (Phone)</p>
                                                <input type="tel" defaultValue={user?.phone} className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-[#008069]/10 transition-all shadow-inner" />
                                            </div>
                                            <button className="px-10 py-5 bg-[#008069] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#008069]/20 hover:scale-[1.02] active:scale-95 transition-all">Save Changes</button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'notifications' && (
                                    <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Notifications</h3>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Manage alerts and messages</p>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Sale Notifications', desc: 'Real-time sales transaction alerts', active: true },
                                                { label: 'Low Stock Alerts', desc: 'Critical stock level notifications', active: true },
                                                { label: 'Staff Updates', desc: 'Team news & shift updates', active: false }
                                            ].map((pref, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:border-[#008069]/20 transition-all group">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 mb-1 group-hover:text-[#008069] transition-colors">{pref.label}</p>
                                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{pref.desc}</p>
                                                    </div>
                                                    <div className={`w-14 h-8 rounded-full relative transition-all cursor-pointer ${pref.active ? 'bg-[#008069]' : 'bg-gray-200'}`}>
                                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${pref.active ? 'left-7' : 'left-1'}`} />
                                                    </div>
                                                </div>
                                            ))}

                                            {/* WhatsApp Customization Portal */}
                                            {user.role === 'CEO' && (
                                                <button
                                                    onClick={() => navigate('/settings/whatsapp')}
                                                    className="w-full flex items-center justify-between p-8 bg-gradient-to-r from-[#075e54] to-[#128c7e] rounded-[2.5rem] border border-white/10 group hover:shadow-2xl hover:scale-[1.01] transition-all text-white mt-8"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner group-hover:rotate-6 transition-transform">
                                                            <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-black tracking-tighter mb-1">WhatsApp Templates</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Manage Swahili & English Templates</p>
                                                        </div>
                                                    </div>
                                                    <FontAwesomeIcon icon={faChevronRight} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'security' && (
                                    <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Security</h3>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Privacy & Security Settings</p>
                                        </div>
                                        <button className="w-full flex items-center justify-between p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 group hover:bg-[#008069]/5 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#008069] shadow-sm transform group-hover:rotate-12 transition-transform">
                                                    <FontAwesomeIcon icon={faKey} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-gray-900 mb-1">Change Password</p>
                                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Update your account password</p>
                                                </div>
                                            </div>
                                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 flex gap-4">
                                            <FontAwesomeIcon icon={faUserShield} className="text-amber-500 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Advanced Protection</p>
                                                <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase opacity-80">Biometric & hardware key modules are managed by terminal administrator.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'preferences' && (
                                    <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Appearance</h3>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Theme & Display Settings</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Language</p>
                                                <div className="relative group">
                                                    <FontAwesomeIcon icon={faGlobe} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                    <select className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-xs font-black uppercase border-0 focus:ring-4 focus:ring-[#008069]/10 shadow-inner">
                                                        <option>English (Global)</option>
                                                        <option>Kiswahili (Regional)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Display Mode</p>
                                                <div className="relative group">
                                                    <FontAwesomeIcon icon={faMoon} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                    <select className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-xs font-black uppercase border-0 focus:ring-4 focus:ring-[#008069]/10 shadow-inner">
                                                        <option>Lux Light</option>
                                                        <option>Elite Dark</option>
                                                        <option>System Modern</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'help' && (
                                    <motion.div key="help" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Support</h3>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Documentation & Help</p>
                                        </div>
                                        <div className="space-y-4">
                                            <button className="w-full flex items-center gap-4 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 group transition-all">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#008069] shadow-sm"><FontAwesomeIcon icon={faQuestionCircle} /></div>
                                                <p className="text-xs font-black text-gray-900 uppercase">Knowledge Base (FAQ)</p>
                                            </button>
                                            <button className="w-full flex items-center gap-4 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 group transition-all">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#008069] shadow-sm"><FontAwesomeIcon icon={faDownload} /></div>
                                                <p className="text-xs font-black text-gray-900 uppercase">Fleet Operations Manual</p>
                                            </button>
                                        </div>
                                        <div className="bg-[#008069]/5 rounded-[2.5rem] p-8 border border-[#008069]/10">
                                            <div className="flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">
                                                <span>Version</span>
                                                <span className="text-[#008069]">v1.0.42</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-600 leading-relaxed uppercase">Simu Kitaa Enterprise System. Management software for mobile hardware.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
