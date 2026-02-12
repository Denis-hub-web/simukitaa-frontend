import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faChartLine, faBoxOpen, faUsers, faCog,
    faBell, faSearch, faSignOutAlt, faBars, faTimes,
    faMoneyBillWave, faTools, faTruck, faUser, faBox,
    faExchangeAlt, faDatabase, faChevronRight, faCompass, faBrain, faGem, faEnvelope, faBullhorn
} from '@fortawesome/free-solid-svg-icons';
import { notificationAPI } from '../utils/api';

const DesktopLayout = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role || 'STAFF';
    const userName = JSON.parse(localStorage.getItem('user') || '{}')?.name || 'User';


    useEffect(() => {
        loadNotificationCount();
        const interval = setInterval(loadNotificationCount, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const loadNotificationCount = async () => {
        try {
            const response = await notificationAPI.getAll();
            const notifications = response.data.data.notifications || [];
            const unreadCount = notifications.filter(n => !n.isRead).length;
            setNotificationCount(unreadCount);
        } catch (error) {
            console.error('Failed to load notification count:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { icon: faHome, label: 'Dashboard', path: '/dashboard', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { icon: faMoneyBillWave, label: 'Sales', path: '/sales', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { icon: faTools, label: 'Repair Form', path: '/repair-form', roles: ['CEO', 'MANAGER', 'STAFF', 'TECHNICIAN'] },
        { icon: faBoxOpen, label: 'Advanced Inventory', path: '/stock-advanced', roles: ['CEO', 'MANAGER'] },
        { icon: faDatabase, label: 'AI Stock Manager', path: '/condition-stock', roles: ['CEO', 'MANAGER'] },
        { icon: faExchangeAlt, label: 'Trade-In Manager', path: '/trade-ins', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { icon: faBrain, label: 'Activity Ledger', path: '/ceo-data', roles: ['CEO'] },
        { icon: faChartLine, label: 'Reports', path: '/reports', roles: ['CEO', 'MANAGER'] },
        { icon: faTruck, label: 'Deliveries', path: '/deliveries', roles: ['CEO', 'MANAGER'] },
        { icon: faUsers, label: 'User Management', path: '/users', roles: ['CEO', 'MANAGER'] },
        { icon: faGem, label: 'Wanakitaa Hub', path: '/wanakitaa', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { icon: faCompass, label: 'Message Center', path: '/messages', roles: ['CEO', 'MANAGER'] },
        { icon: faBullhorn, label: 'Campaigns', path: '/campaigns', roles: ['CEO', 'MANAGER'] },
        { icon: faEnvelope, label: 'Notifications', path: '/notification-templates', roles: ['CEO', 'MANAGER'] },
        { icon: faCog, label: 'Settings', path: '/settings', roles: ['CEO', 'MANAGER', 'STAFF'] },
    ];

    const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="premium-bg min-h-screen flex overflow-hidden">
            {/* Elite Sidebar */}
            <aside
                className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-white/80 backdrop-blur-2xl transition-all duration-500 z-50 shadow-[0_0_50px_rgba(0,0,0,0.05)] border-r border-white/40 ${sidebarCollapsed ? 'w-24' : 'w-72'}`}
            >
                {/* Brand Identity */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-gray-100/50">
                    <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-10 h-10 premium-btn-primary rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20">
                                    <FontAwesomeIcon icon={faCompass} />
                                </div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tighter italic">Simu<span className="text-blue-600">Kitaa</span></h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`}
                    >
                        <FontAwesomeIcon icon={sidebarCollapsed ? faBars : faTimes} />
                    </button>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                    {visibleMenuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative overflow-hidden ${window.location.pathname === item.path
                                ? 'premium-btn-primary shadow-xl shadow-blue-500/20'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        >
                            <FontAwesomeIcon
                                icon={item.icon}
                                className={`text-lg transition-transform duration-500 group-hover:scale-110 ${sidebarCollapsed ? '' : 'w-6'} ${window.location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}
                            />
                            {!sidebarCollapsed && (
                                <span className={`font-black text-[10px] uppercase tracking-widest ${window.location.pathname === item.path ? 'text-white' : ''}`}>{item.label}</span>
                            )}
                            {window.location.pathname === item.path && !sidebarCollapsed && (
                                <FontAwesomeIcon icon={faChevronRight} className="ml-auto text-[8px] opacity-40 text-white" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User Terminal Info */}
                <div className="p-6 border-t border-gray-100/50">
                    <div className={`flex items-center gap-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-12 h-12 premium-btn-outline border-gray-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-sm">
                            {userName.charAt(0)}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="overflow-hidden">
                                <p className="premium-h2 mb-0.5 text-xs truncate">{userName}</p>
                                <p className="premium-label text-[8px] mb-0">{userRole}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Content Scaffolding */}
            <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>
                {/* Global Command Bar */}
                <header className="h-24 bg-transparent px-8 flex items-center justify-between z-40 relative">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative group">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="Search inventory, customers, or sales..."
                                className="premium-input pl-16 pr-8 shadow-sm border-gray-100/50 relative z-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-8">
                        {/* Notifications Bell */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="relative w-14 h-14 premium-card flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all border-gray-100/50 shadow-sm group"
                        >
                            <FontAwesomeIcon icon={faBell} className="text-xl" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded-full font-black shadow-lg border-2 border-white">
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Quick Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-14 h-14 premium-card flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all border-gray-100/50 shadow-sm"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    <div className="max-w-7xl mx-auto">
                        <div className="pb-12">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DesktopLayout;
