import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faDownload, faFilePdf, faFileExcel,
    faArrowUp, faArrowDown, faMoneyBillWave, faWallet,
    faChartLine, faReceipt, faSpinner, faChevronLeft,
    faChevronRight, faMagic, faInfoCircle, faCashRegister,
    faUserTie, faTags, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

const DailySheetReport = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO' || user?.role === 'MANAGER';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsights, setAiInsights] = useState([]);
    const [activeTab, setActiveTab] = useState('summary');

    // Date Range State
    const getToday = () => new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());
    const [isRangeMode, setIsRangeMode] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate, isRangeMode]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const params = isRangeMode
                ? { startDate, endDate }
                : { date: startDate };

            const response = await axios.get(`${API_URL}/reports/daily-sheet`, {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setData(response.data.data);
            setAiInsights([]); // Clear old insights
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = async () => {
        if (!data || aiLoading) return;
        try {
            setAiLoading(true);
            const response = await axios.post(`${API_URL}/reports/ai-insight`, {
                reportData: {
                    summary: data.summary,
                    paymentBreakdown: data.paymentBreakdown
                }
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAiInsights(response.data.insights);
            setActiveTab('ai');
        } catch (error) {
            console.error('AI Insight Error:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getProductDetailString = (t) => {
        let name = t.productName;
        const variants = [];
        if (t.storage) variants.push(t.storage);
        if (t.color) variants.push(t.color);
        if (t.simType) variants.push(t.simType);

        if (variants.length > 0) {
            name += ` (${variants.join(', ')})`;
        }

        if (t.serialNumber && t.serialNumber !== 'N/A') {
            name += ` [SN: ${t.serialNumber}]`;
        }

        if (t.quantity > 1) {
            return `[QTY: ${t.quantity}] ${name}`;
        }
        return name;
    };

    const handleExportExcel = () => {
        if (!data) return;
        let csv = `SimuKitaa Business Report\nRange: ${startDate} to ${endDate}\n\n`;

        csv += `SUMMARY\n`;
        csv += `Revenue,${data.summary.totalRevenue}\n`;
        csv += `Expenses,${data.summary.totalExpenses}\n`;
        csv += `Gross Profit,${data.summary.grossProfit}\n`;
        csv += `Net Profit,${data.summary.netProfit}\n\n`;

        csv += `SALES TRANSACTIONS\n`;
        csv += `Date,Product Details,Personnel,Amount,Profit,Method\n`;
        data.sales.transactions.forEach(t => {
            const productDetail = getProductDetailString(t).replace(/"/g, '""');
            csv += `${new Date(t.time).toLocaleDateString()},"${productDetail}",${t.staffName},${t.amount},${t.profit},${t.paymentMethod}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SimuKitaa_Report_${startDate}_${endDate}.csv`;
        a.click();
    };

    const handleExportPDF = () => {
        if (!data) return;
        const doc = new jsPDF();

        // Header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('SimuKitaa Business Report', 15, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${startDate} - ${endDate}`, 15, 30);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 30);

        // Summary Table
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Performance Summary', 15, 50);

        autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', formatCurrency(data.summary.totalRevenue)],
                ['Total Expenses', formatCurrency(data.summary.totalExpenses)],
                ['Net Profit', formatCurrency(data.summary.netProfit)],
                ['Sales Count', data.summary.salesCount],
                ['Profit Margin', `${data.summary.profitMargin}%`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] }
        });

        // Sales Table
        doc.text('Detailed Sales Transactions', 15, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Date', 'Product Details', 'Staff', 'Amount', 'Method']],
            body: data.sales.transactions.slice(0, 50).map(t => [
                new Date(t.time).toLocaleDateString(),
                getProductDetailString(t),
                t.staffName,
                formatCurrency(t.amount),
                t.paymentMethod
            ]),
            theme: 'grid',
            styles: { fontSize: 8 },
            columnStyles: { 1: { cellWidth: 80 } }
        });

        doc.save(`SimuKitaa_Report_${startDate}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <FontAwesomeIcon icon={faSpinner} className="text-5xl text-blue-600" />
                </motion.div>
                <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Loading Intelligence...</p>
            </div>
        );
    }

    const StatCard = ({ icon, label, value, sub, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700`}>
                <FontAwesomeIcon icon={icon} className="text-6xl" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className={`text-2xl font-black ${color} tracking-tighter`}>{value}</h3>
            {sub && <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Navigation Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
                                Comprehensive Report
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SimuKitaa Business Intelligence</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <button onClick={handleExportExcel} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all">
                            <FontAwesomeIcon icon={faFileExcel} /> Excel
                        </button>
                        <button onClick={handleExportPDF} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                            <FontAwesomeIcon icon={faFilePdf} /> PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-8">
                {/* Control Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    <div className="lg:col-span-8 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl w-fit">
                                <button
                                    onClick={() => setIsRangeMode(false)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRangeMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Single Day
                                </button>
                                <button
                                    onClick={() => setIsRangeMode(true)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRangeMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Custom Range
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {isRangeMode && (
                                    <>
                                        <span className="text-slate-400 font-bold text-xs uppercase">to</span>
                                        <div className="relative">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['summary', 'sales', 'expenses', 'ai'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 p-6 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-100 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">AI Recommendations</p>
                            <h3 className="text-lg font-black tracking-tight leading-tight">Need smart insights about this report?</h3>
                        </div>
                        <button
                            onClick={generateAIInsights}
                            disabled={aiLoading}
                            className="mt-6 w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-3"
                        >
                            {aiLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faMagic} /> Generate Insights</>}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'summary' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard icon={faMoneyBillWave} label="Gross Revenue" value={formatCurrency(data.summary.totalRevenue)} sub={`${data.summary.salesCount} Transactions`} color="text-slate-900" />
                                <StatCard icon={faWallet} label="Total Expenses" value={formatCurrency(data.summary.totalExpenses)} sub={`${data.summary.expensesCount} Recordings`} color="text-rose-600" />
                                <StatCard icon={faChartLine} label="Net Profit" value={formatCurrency(data.summary.netProfit)} sub={`${data.summary.profitMargin}% Margin`} color="text-emerald-600" />
                                <StatCard icon={faCashRegister} label="Cash Remainings" value={formatCurrency(data.paymentBreakdown.remainings)} sub="Theoretical Balance" color="text-blue-600" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Payment Distribution
                                    </h4>
                                    <div className="space-y-4">
                                        {data.paymentBreakdown.sales.map((p, i) => (
                                            <div key={i} className="group cursor-default">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black text-slate-700">{p.method}</span>
                                                    <span className="text-xs font-black text-slate-900">{formatCurrency(p.total)}</span>
                                                </div>
                                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(p.total / data.summary.totalRevenue) * 100}%` }}
                                                        className="h-full bg-blue-600 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Expense Analysis
                                    </h4>
                                    <div className="space-y-4">
                                        {data.expenses.byCategory.slice(0, 5).map((p, i) => (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black text-slate-700">{p.category}</span>
                                                    <span className="text-xs font-black text-slate-900">{formatCurrency(p.total)}</span>
                                                </div>
                                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(p.total / data.summary.totalExpenses) * 100}%` }}
                                                        className="h-full bg-rose-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'sales' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Transaction Ledger</h4>
                                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-black text-[10px] uppercase">{data.sales.transactions.length} Total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Item</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit</th>
                                            <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.sales.transactions.map((t, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(t.time).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-xs font-black text-slate-900">{t.productName}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-black uppercase">
                                                            {t.staffName.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{t.staffName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right text-xs font-black text-slate-900">{formatCurrency(t.amount)}</td>
                                                <td className="px-8 py-5 text-right text-xs font-black text-emerald-600">{formatCurrency(t.profit)}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-black text-[9px] uppercase tracking-wider">
                                                        {t.paymentMethod}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'expenses' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Expense Audit Trail</h4>
                                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-black text-[10px] uppercase">{data.expenses.transactions.length} Entries</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.expenses.transactions.map((e, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(e.time).toLocaleDateString()}</td>
                                                <td className="px-8 py-5">
                                                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-black text-[10px] uppercase">
                                                        {e.category}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-xs font-bold text-slate-900 max-w-xs truncate">{e.description}</td>
                                                <td className="px-8 py-5 text-right text-xs font-black text-rose-600">{formatCurrency(e.amount)}</td>
                                                <td className="px-8 py-5 text-center text-xs font-bold text-slate-500">{e.recordedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ai' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {aiInsights.length > 0 ? (
                                    aiInsights.map((insight, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-8 rounded-[2rem] bg-white border-2 border-blue-50 shadow-xl shadow-blue-50/50 relative group"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                                <FontAwesomeIcon icon={faMagic} />
                                            </div>
                                            <p className="text-sm font-black text-slate-900 leading-relaxed tracking-tight italic">"{insight}"</p>
                                            <div className="absolute top-4 right-4 text-blue-100 text-4xl">
                                                {i + 1}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-3 p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-slate-200 mb-4" />
                                        <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">No insights generated yet. Click the "Generate Insights" button.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Actions Overlay */}
            <div className="md:hidden fixed bottom-6 right-6 flex flex-col gap-3">
                <button onClick={handleExportPDF} className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center text-xl">
                    <FontAwesomeIcon icon={faFilePdf} />
                </button>
            </div>
        </div>
    );
};

export default DailySheetReport;
