import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Calculator,
    Compass,
    LayoutGrid,
    LogOut,
    PackageOpen,
    Mail,
    Megaphone,
    Menu,
    ReceiptText,
    Repeat2,
    Search,
    Settings,
    Truck,
    Users,
    Wallet,
    Wrench,
    X,
    ChevronRight
} from 'lucide-react';
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
        { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard', roles: ['CEO', 'MANAGER'] },
        { icon: ReceiptText, label: 'Sales History', path: '/sales', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { icon: Wallet, label: 'Expenses', path: '/expenses', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { icon: Repeat2, label: 'Trade-In Manager', path: '/trade-ins', roles: ['CEO', 'MANAGER'] },
        { icon: PackageOpen, label: 'Stock Management', path: '/stock-management', roles: ['CEO', 'MANAGER'] },
        { icon: Calculator, label: 'Calculator', path: '/stock-calculator', roles: ['CEO', 'MANAGER'] },
        { icon: Truck, label: 'Supplier Network', path: '/suppliers', roles: ['CEO', 'MANAGER'] },
        { icon: Compass, label: 'Wanakitaa Hub', path: '/wanakitaa', roles: ['CEO'] },
        { icon: Megaphone, label: 'Campaigns', path: '/campaigns', roles: ['CEO', 'MANAGER'] },
        { icon: Mail, label: 'Templates', path: '/notification-templates', roles: ['CEO'] },
        { icon: Users, label: 'Team Management', path: '/team-management', roles: ['CEO', 'MANAGER'] },
        { icon: Wrench, label: 'Tools', path: '/tools', roles: ['CEO', 'MANAGER'] },
        { icon: Settings, label: 'Settings', path: '/settings', roles: ['CEO', 'MANAGER'] },
    ];

    const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    // Group items by category for rendering

    return (
        <div className="premium-bg min-h-screen flex overflow-hidden">
            {/* Elite Sidebar */}
            <aside
                className={`hidden md:flex flex-col fixed left-0 top-0 h-full apple-surface transition-all duration-500 z-50 border-r border-white/40 ${sidebarCollapsed ? 'w-24' : 'w-72'}`}
            >
                {/* Brand Identity */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-gray-100/60">
                    <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-apple-sm border border-white/20">
                                    <Compass className="w-5 h-5" />
                                </div>
                                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Simu<span className="text-blue-600">Kitaa</span></h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`}
                    >
                        {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                    {visibleMenuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${window.location.pathname === item.path
                                ? 'premium-btn-primary shadow-xl shadow-blue-500/20'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon
                                className={`transition-transform duration-500 group-hover:scale-110 ${sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5'} ${window.location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}
                            />
                            {!sidebarCollapsed && (
                                <span className={`font-medium text-sm tracking-tight ${window.location.pathname === item.path ? 'text-white' : ''}`}>{item.label}</span>
                            )}
                            {window.location.pathname === item.path && !sidebarCollapsed && (
                                <ChevronRight className="ml-auto w-4 h-4 opacity-50 text-white" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User Terminal Info */}
                <div className="p-6 border-t border-gray-100/50">
                    <div className={`flex items-center gap-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 shadow-apple-sm flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {userName.charAt(0)}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 mb-0">{userRole}</p>
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
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10 pointer-events-none" />
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
                            <Bell className="w-6 h-6" />
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
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="premium-container">
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
