import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar, faDownload, faPrint, faArrowUp, faArrowDown,
    faMoneyBillWave, faWallet, faChartLine, faReceipt, faSpinner,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../utils/api';

const DailySheetReport = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get local YYYY-MM-DD date
    const getLocalDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - (offset * 60 * 1000));
        return local.toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDate());

    useEffect(() => {
        fetchDailySheet();
    }, [selectedDate]);

    const fetchDailySheet = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reports/daily-sheet`, {
                params: { date: selectedDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch daily sheet:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Simple CSV export
        if (!data) return;

        let csv = `Daily Sheet Report - ${selectedDate}\n\n`;
        csv += `SUMMARY\n`;
        csv += `Total Revenue,${formatCurrency(data.summary.totalRevenue)}\n`;
        csv += `Total Expenses,${formatCurrency(data.summary.totalExpenses)}\n`;
        csv += `Gross Profit,${formatCurrency(data.summary.grossProfit)}\n`;
        csv += `Net Profit,${formatCurrency(data.summary.netProfit)}\n`;
        csv += `Profit Margin,${data.summary.profitMargin}%\n\n`;

        csv += `SALES TRANSACTIONS\n`;
        csv += `Time,Product,Staff,Amount,Profit,Payment Method\n`;
        data.sales.transactions.forEach(t => {
            csv += `${new Date(t.time).toLocaleString()},${t.productName},${t.staffName},${t.amount},${t.profit},${t.paymentMethod}\n`;
        });

        csv += `\nEXPENSES\n`;
        csv += `Time,Category,Description,Amount,Payment Method\n`;
        data.expenses.transactions.forEach(e => {
            csv += `${new Date(e.time).toLocaleString()},${e.category},${e.description},${e.amount},${e.paymentMethod}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-sheet-${selectedDate}.csv`;
        a.click();
    };

    const formatCurrency = (amount) => {
        return `Tsh ${Number(amount || 0).toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-blue-600" />
            </div>
        );
    }

    if (!data) return null;

    const isProfitable = data.summary.netProfit >= 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6 print:p-8 print:bg-white">
            {/* Header - Hide on print */}
            <div className="print:hidden mb-6 md:mb-8">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">📊 Daily Sheet Report</h1>
                        <p className="text-gray-600 text-sm md:text-base">Complete daily business summary</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPrint} />
                            <span className="text-sm md:text-base">Print</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            <span className="text-sm md:text-base">Export CSV</span>
                        </button>
                    </div>
                </motion.div>

                {/* Date Picker */}
                <div className="mt-4 md:mt-6 bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => changeDate(-1)}
                            className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>

                        <div className="flex-1 relative">
                            <FontAwesomeIcon icon={faCalendar} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm md:text-base"
                            />
                        </div>

                        <button
                            onClick={() => changeDate(1)}
                            className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>

                        <button
                            onClick={() => setSelectedDate(getLocalDate())}
                            className="px-3 md:px-4 py-2 md:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm md:text-base whitespace-nowrap"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-8">
                <h1 className="text-4xl font-black text-center mb-2">Daily Sheet Report</h1>
                <p className="text-center text-lg text-gray-600">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl print:shadow-none"
                >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg md:text-2xl" />
                        <div className="text-xs md:text-sm font-medium opacity-90">Revenue</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black break-words">{formatCurrency(data.summary.totalRevenue)}</div>
                    <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">{data.sales.count} sales</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl print:shadow-none"
                >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <FontAwesomeIcon icon={faWallet} className="text-lg md:text-2xl" />
                        <div className="text-xs md:text-sm font-medium opacity-90">Expenses</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black break-words">{formatCurrency(data.summary.totalExpenses)}</div>
                    <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">{data.expenses.count} expenses</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`bg-gradient-to-br ${isProfitable ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl print:shadow-none`}
                >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <FontAwesomeIcon icon={isProfitable ? faArrowUp : faArrowDown} className="text-lg md:text-2xl" />
                        <div className="text-xs md:text-sm font-medium opacity-90">Net Profit</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black break-words">{formatCurrency(data.summary.netProfit)}</div>
                    <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">{isProfitable ? 'Profitable' : 'Loss'}</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl print:shadow-none"
                >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <FontAwesomeIcon icon={faChartLine} className="text-lg md:text-2xl" />
                        <div className="text-xs md:text-sm font-medium opacity-90">Margin</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black">{data.summary.profitMargin}%</div>
                    <div className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2">Profit margin</div>
                </motion.div>
            </div>

            {/* Sales & Expenses Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Sales by Category */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl print:break-inside-avoid">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 mb-3 md:mb-4">Sales by Category</h2>
                    <div className="space-y-2 md:space-y-3">
                        {data.sales.byCategory.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-700 text-sm md:text-base">{item.category}</span>
                                <span className="font-black text-gray-900 text-sm md:text-base">{formatCurrency(item.total)}</span>
                            </div>
                        ))}
                        {data.sales.byCategory.length === 0 && (
                            <p className="text-gray-500 text-center py-4 text-sm md:text-base">No sales today</p>
                        )}
                    </div>
                </div>

                {/* Expenses by Category */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl print:break-inside-avoid">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 mb-3 md:mb-4">Expenses by Category</h2>
                    <div className="space-y-2 md:space-y-3">
                        {data.expenses.byCategory.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-700 text-sm md:text-base">{item.category}</span>
                                <span className="font-black text-red-600 text-sm md:text-base">{formatCurrency(item.total)}</span>
                            </div>
                        ))}
                        {data.expenses.byCategory.length === 0 && (
                            <p className="text-gray-500 text-center py-4 text-sm md:text-base">No expenses today</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sales Transactions */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl mb-6 md:mb-8 print:break-inside-avoid">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <FontAwesomeIcon icon={faReceipt} className="text-xl md:text-2xl text-blue-600" />
                    <h2 className="text-lg md:text-xl font-black text-gray-900">Sales Transactions</h2>
                    <span className="ml-auto bg-blue-100 text-blue-600 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-bold">
                        {data.sales.transactions.length} sales
                    </span>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Time</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Product</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Staff</th>
                                <th className="text-right p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Amount</th>
                                <th className="text-right p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Profit</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sales.transactions.map((t, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-2 md:p-3 text-gray-600 text-xs md:text-sm">
                                        {new Date(t.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-2 md:p-3 font-bold text-gray-800 text-xs md:text-sm truncate max-w-[150px]">{t.productName}</td>
                                    <td className="p-2 md:p-3 text-gray-700 text-xs md:text-sm">{t.staffName}</td>
                                    <td className="p-2 md:p-3 text-right font-black text-gray-900 text-xs md:text-sm">{formatCurrency(t.amount)}</td>
                                    <td className="p-2 md:p-3 text-right font-bold text-green-600 text-xs md:text-sm">{formatCurrency(t.profit)}</td>
                                    <td className="p-2 md:p-3 text-xs md:text-sm">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] md:text-xs font-medium">
                                            {t.paymentMethod}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {data.sales.transactions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center p-6 md:p-8 text-gray-500 text-sm md:text-base">No sales transactions today</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expenses Transactions */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl print:break-inside-avoid">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <FontAwesomeIcon icon={faWallet} className="text-xl md:text-2xl text-red-600" />
                    <h2 className="text-lg md:text-xl font-black text-gray-900">Expense Transactions</h2>
                    <span className="ml-auto bg-red-100 text-red-600 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-bold">
                        {data.expenses.transactions.length} expenses
                    </span>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Time</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Category</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Description</th>
                                <th className="text-right p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Amount</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Payment</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Recorded By</th>
                                <th className="text-left p-2 md:p-3 font-black text-gray-700 text-xs md:text-sm">Recorded At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.expenses.transactions.map((e, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-2 md:p-3 text-gray-600 text-xs md:text-sm">
                                        {new Date(e.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-2 md:p-3 font-bold text-gray-800 text-xs md:text-sm">{e.category}</td>
                                    <td className="p-2 md:p-3 text-gray-700 text-xs md:text-sm truncate max-w-[200px]">{e.description}</td>
                                    <td className="p-2 md:p-3 text-right font-black text-red-600 text-xs md:text-sm">{formatCurrency(e.amount)}</td>
                                    <td className="p-2 md:p-3 text-xs md:text-sm">
                                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] md:text-xs font-medium">
                                            {e.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="p-2 md:p-3 text-gray-700 font-medium text-xs md:text-sm">
                                        {e.recordedBy}
                                    </td>
                                    <td className="p-2 md:p-3 text-gray-500 text-xs md:text-sm">
                                        {new Date(e.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                            {data.expenses.transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center p-6 md:p-8 text-gray-500 text-sm md:text-base">No expense transactions today</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-8 pt-6 border-t-2 border-gray-200 text-center text-gray-600">
                <p>Generated on {new Date().toLocaleString()}</p>
                <p className="text-sm mt-2">SimuKitaa Business Management System</p>
            </div>
        </div>
    );
};

export default DailySheetReport;
