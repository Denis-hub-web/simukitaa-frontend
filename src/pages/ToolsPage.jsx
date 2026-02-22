import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExchangeAlt, faWallet, faFileAlt, faBoxOpen, faTruck,
    faUsers, faUserCog, faGem, faCompass, faBullhorn,
    faEnvelope, faChartLine, faTools, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const ToolsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role || 'STAFF';

    const tools = [
        { title: 'Dashboard', desc: 'Home Overview', icon: faHome, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { title: 'Sales History', desc: 'Transactional Ledger', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/sales', roles: ['CEO'] },
        { title: 'Expenses', desc: 'Record & Track Costs', icon: faWallet, color: 'text-rose-500', bg: 'bg-rose-50', link: '/expenses', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { title: 'Trade-In Manager', desc: 'Approve & Add to Stock', icon: faExchangeAlt, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/trade-ins', roles: ['CEO', 'MANAGER', 'STAFF'] },
        { title: 'Stock Management', desc: 'Add & Organize Inventory', icon: faBoxOpen, color: 'text-blue-500', bg: 'bg-blue-50', link: '/stock-management', roles: ['CEO', 'MANAGER'] },
        { title: 'Supplier Network', desc: 'Procurement Partners', icon: faTruck, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/suppliers', roles: ['CEO', 'MANAGER'] },
        { title: 'Wanakitaa Hub', desc: 'Loyalty & Community', icon: faGem, color: 'text-purple-500', bg: 'bg-purple-50', link: '/wanakitaa', roles: ['CEO', 'MANAGER'] },
        { title: 'Campaigns', desc: 'Bulk Customer Messaging', icon: faBullhorn, color: 'text-purple-500', bg: 'bg-purple-50', link: '/campaigns', roles: ['CEO'] },
        { title: 'Templates', desc: 'Customize Messages', icon: faEnvelope, color: 'text-blue-500', bg: 'bg-blue-50', link: '/notification-templates', roles: ['CEO'] },
        { title: 'Team Management', desc: 'Staff & Permissions', icon: faUserCog, color: 'text-green-500', bg: 'bg-green-50', link: '/team-management', roles: ['CEO'] },
        { title: 'Settings', desc: 'System Config', icon: faCog, color: 'text-gray-500', bg: 'bg-gray-50', link: '/settings', roles: ['CEO', 'MANAGER', 'STAFF'] },
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
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                        <FontAwesomeIcon icon={faTools} className="text-xl" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">System <span className="text-blue-600">Tools</span></h1>
                </div>
                <p className="text-gray-500 max-w-2xl font-medium uppercase tracking-[0.2em] text-[10px] opacity-70">Unified Management Module</p>
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
                        className="group premium-card p-6 flex items-start gap-5 hover:scale-[1.02] transition-all text-left relative overflow-hidden h-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
                        <div className={`w-14 h-14 ${tool.bg} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform relative z-10`}>
                            <FontAwesomeIcon icon={tool.icon} className={`${tool.color} text-2xl`} />
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="font-black text-gray-900 text-sm mb-1 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{tool.title}</h3>
                            <p className="text-blue-600 text-[10px] font-black tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">{tool.desc}</p>
                        </div>
                        <div className="self-center relative z-10">
                            <FontAwesomeIcon icon={faChevronRight} className="text-blue-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default ToolsPage;
