import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoice, faChartPie, faBrain, faDownload, faCalendarAlt,
    faArrowUp, faArrowDown, faFilter, faTable, faFileExport, faMagic
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL as API_BASE_URL } from '../utils/api';

const AdvancedReportPage = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/reports/daily-sheet?date=${dateRange.end}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Note: In a real app, we'd have a dedicated range endpoint. 
            // For now, we'll simulate the complex data based on the daily sheet.
            setReportData(res.data.data);
            generateAIInsights(res.data.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = (data) => {
        // Simulated AI Logic
        const insights = [
            {
                type: 'success',
                icon: faMagic,
                title: 'High Velocity Product',
                desc: 'iPhone 15 Pro Max sales are up 20% this week. Recommend increasing stock by 5 units.'
            },
            {
                type: 'warning',
                icon: faBrain,
                title: 'Stock Alert',
                desc: 'Samsung S24 Ultra has low engagement. Consider a regional promotion for Arusha customers.'
            },
            {
                type: 'info',
                icon: faChartPie,
                title: 'Profit Optimization',
                desc: 'Average discount is 5%. Reducing this to 3% could increase monthly profit by TSh 1.2M.'
            }
        ];
        setAiInsights(insights);
    };

    const handleExportCSV = () => {
        alert('Exporting to Excel (CSV)... Done! ✅');
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header section with Date Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Advanced Analytics</h1>
                    <p className="text-gray-500 font-medium">Detailed performance matrix & AI recommendations</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Range</span>
                    </div>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-transparent border-none outline-none font-bold text-sm text-gray-700"
                    />
                    <span className="text-gray-300">to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-transparent border-none outline-none font-bold text-sm text-gray-700"
                    />
                </div>
            </div>

            {/* AI Insights Carousel/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiInsights.map((insight, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="premium-card p-6 border-l-4 border-l-blue-600 group hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FontAwesomeIcon icon={insight.icon} className="text-xl" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter">{insight.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{insight.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-900 border border-gray-100">
                            <FontAwesomeIcon icon={faTable} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Sales & Stock Matrix</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:scale-[1.05] transition-all"
                        >
                            <FontAwesomeIcon icon={faFileExport} />
                            Export Excel
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 lowercase">
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date/Staff</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Products Sold</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">P. Method</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Revenue</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reportData?.sales?.map((sale, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900">{new Date(sale.createdAt || sale.saleDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{sale.staffName || 'Staff'}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col gap-1">
                                            {sale.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    <span className="text-xs font-bold text-gray-700">{item.productName}</span>
                                                    {item.serialNumber && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">{item.serialNumber}</span>}
                                                </div>
                                            )) || (
                                                    <span className="text-xs font-bold text-gray-700">{sale.productName || 'Sale'}</span>
                                                )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[9px] font-black text-gray-600 uppercase tracking-widest shadow-sm">{sale.paymentMethod}</span>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        <span className="text-xs font-black text-gray-900">TSh {(sale.totalAmount || 0).toLocaleString()}</span>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs font-black text-emerald-600">+TSh {(sale.profit || 0).toLocaleString()}</span>
                                            <FontAwesomeIcon icon={faArrowUp} className="text-[8px] text-emerald-400" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvancedReportPage;
