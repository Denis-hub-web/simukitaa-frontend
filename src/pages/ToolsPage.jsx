import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Compass,
    FileText,
    LayoutGrid,
    Mail,
    Megaphone,
    PackageOpen,
    Repeat2,
    Settings,
    Truck,
    Users,
    Wallet,
    Wrench
} from 'lucide-react';

const ToolsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role || 'STAFF';

    const tools = [
        { title: 'Dashboard', desc: 'Home Overview', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { title: 'Sales History', desc: 'Transactional Ledger', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/sales', roles: ['CEO', 'MANAGER'] },
        { title: 'Expenses', desc: 'Record & Track Costs', icon: Wallet, color: 'text-rose-600', bg: 'bg-rose-50', link: '/expenses', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { title: 'Trade-In Manager', desc: 'Approve & Add to Stock', icon: Repeat2, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/trade-ins', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { title: 'Stock Management', desc: 'Add & Organize Inventory', icon: PackageOpen, color: 'text-blue-600', bg: 'bg-blue-50', link: '/stock-management', roles: ['CEO', 'MANAGER'] },
        { title: 'Supplier Network', desc: 'Procurement Partners', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/suppliers', roles: ['CEO', 'MANAGER'] },
        { title: 'Wanakitaa Hub', desc: 'Loyalty & Community', icon: Compass, color: 'text-purple-600', bg: 'bg-purple-50', link: '/wanakitaa', roles: ['CEO', 'MANAGER'] },
        { title: 'Campaigns', desc: 'Bulk Customer Messaging', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50', link: '/campaigns', roles: ['CEO', 'MANAGER'] },
        { title: 'Templates', desc: 'Customize Messages', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50', link: '/notification-templates', roles: ['CEO', 'MANAGER'] },
        { title: 'Team Management', desc: 'Staff & Permissions', icon: Users, color: 'text-green-600', bg: 'bg-green-50', link: '/team-management', roles: ['CEO', 'MANAGER'] },
        { title: 'Settings', desc: 'System Config', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50', link: '/settings', roles: ['CEO', 'MANAGER', 'STAFF'] },
    ];

    const visibleTools = tools.filter(tool => tool.roles.includes(userRole));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-apple-sm border border-gray-100">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">System <span className="text-blue-600">Tools</span></h1>
                </div>
                <p className="text-gray-500 max-w-2xl font-medium">Unified management module</p>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {visibleTools.map((tool, tIdx) => (
                    <motion.button
                        key={tIdx}
                        variants={itemVariants}
                        onClick={() => navigate(tool.link)}
                        className="group apple-card p-6 flex items-start gap-5 hover:scale-[1.01] transition-all text-left relative overflow-hidden h-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
                        <div className={`w-14 h-14 ${tool.bg} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform relative z-10`}>
                            <tool.icon className={`w-7 h-7 ${tool.color}`} />
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="font-semibold text-gray-900 text-base mb-1 leading-tight group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                            <p className="text-sm text-gray-500 opacity-90 group-hover:opacity-100 transition-opacity">{tool.desc}</p>
                        </div>
                        <div className="self-center relative z-10">
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default ToolsPage;
