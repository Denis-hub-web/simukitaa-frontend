import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faFilter, faMoneyBillWave, faReceipt, faUser, faPhone,
    faCalendarAlt, faChevronRight, faPrint, faEllipsisV, faChartPie,
    faCashRegister, faExchangeAlt, faBox, faClock, faUserTie, faArrowUp,
    faDollarSign, faPercent, faShoppingCart, faFileInvoiceDollar, faRedo,
    faArrowLeft, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SalesPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMethod, setFilterMethod] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/sales`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSales(response.data.data.sales || []);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            maximumFractionDigits: 0
        }).format(amount).replace('TSh', '').trim();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            raw: date.toISOString().split('T')[0],
            month: date.toLocaleString('default', { month: 'short' }),
            day: date.getDate()
        };
    };

    const filteredSales = sales.filter(sale => {
        const matchesSearch =
            (sale.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.staffName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.serialNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sale.id || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMethod = filterMethod === 'all' || sale.paymentMethod === filterMethod;
        const matchesDate = !filterDate || sale.saleDate.startsWith(filterDate);

        return matchesSearch && matchesMethod && matchesDate;
    }).sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));

    // Calculate Dashboard Stats
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
    const tradeInCount = sales.filter(s => s.tradeInId).length;
    const itemsSold = sales.length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-5xl text-blue-600 animate-spin mb-3" />
                    <p className="text-gray-600 font-semibold">Loading sales...</p>
                </div>
            </div>
        );
    }

    const paymentMethods = Array.from(new Set(sales.map(s => s.paymentMethod).filter(Boolean))).sort();

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Modern Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[95%] mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700 text-sm" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales History</h1>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">{filteredSales.length} transactions • {itemsSold} total sales</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)} <span className="text-sm text-gray-500 font-normal">TSh</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Net Profit</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalProfit)} <span className="text-sm text-gray-500 font-normal">TSh</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-[95%] mx-auto px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 relative group min-w-[300px]">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID, product, customer, serial..."
                                className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" />
                            <input
                                type="date"
                                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <FontAwesomeIcon icon={faFilter} className="text-purple-500" />
                            <select
                                value={filterMethod}
                                onChange={(e) => setFilterMethod(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
                            >
                                <option value="all">💳 All Methods</option>
                                {paymentMethods.map(method => (
                                    <option key={method} value={method}>
                                        💳 {method.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setFilterDate('');
                                setFilterMethod('all');
                                setSearchQuery('');
                                fetchSales();
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-blue-500 transition-all"
                        >
                            <FontAwesomeIcon icon={faRedo} className={`${loading ? 'animate-spin' : ''} text-sm`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Summary - Moved to Top */}
            {filteredSales.length > 0 && (
                <div className="max-w-[95%] mx-auto px-6 py-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1 mb-4">Payment Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(() => {
                            // Calculate totals by payment method
                            const methodTotals = {};
                            filteredSales.forEach(sale => {
                                const method = sale.paymentMethod || 'UNKNOWN';
                                if (!methodTotals[method]) {
                                    methodTotals[method] = { revenue: 0, profit: 0, count: 0 };
                                }
                                methodTotals[method].revenue += sale.totalAmount || 0;
                                methodTotals[method].profit += sale.profit || 0;
                                methodTotals[method].count += 1;
                            });

                            const methodColors = {
                                'CASH': { bg: 'bg-green-50', text: 'text-green-700', icon: '💵' },
                                'TIGOPESA': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔵' },
                                'M_PESA': { bg: 'bg-red-50', text: 'text-red-700', icon: '🔴' },
                                'AIRTEL_MONEY': { bg: 'bg-orange-50', text: 'text-orange-700', icon: '🟠' },
                                'BANK': { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🏦' },
                                'UNKNOWN': { bg: 'bg-gray-50', text: 'text-gray-700', icon: '❓' }
                            };

                            return Object.entries(methodTotals).map(([method, totals]) => {
                                const colors = methodColors[method] || methodColors['UNKNOWN'];
                                return (
                                    <div key={method} className={`${colors.bg} rounded-xl p-5 border border-gray-100 shadow-sm`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{colors.icon}</span>
                                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                {method.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <p className={`text-2xl font-black ${colors.text}`}>
                                            {formatCurrency(totals.revenue)} <span className="text-xs text-gray-500 font-normal">TSh</span>
                                        </p>
                                        <div className="flex items-center justify-between mt-2 text-xs">
                                            <span className="text-gray-500 font-medium">{totals.count} transactions</span>
                                            <span className="text-emerald-600 font-bold">+{formatCurrency(totals.profit)}</span>
                                        </div>
                                    </div>
                                );
                            });
                        })()}

                        {/* Grand Total Card */}
                        <div className="bg-gray-900 rounded-xl p-5 text-white shadow-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">💰</span>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grand Total</p>
                            </div>
                            <p className="text-2xl font-black">
                                {formatCurrency(filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0))}
                                <span className="text-xs text-gray-500 font-normal ml-1">TSh</span>
                            </p>
                            <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-gray-400 font-medium">{filteredSales.length} sales</span>
                                <span className="text-emerald-400 font-bold">
                                    +{formatCurrency(filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clean Table Container */}
            <div className="max-w-[95%] mx-auto px-6 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Minimal Header */}
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff</span>
                                    </th>
                                    <th className="px-5 py-3 text-center">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</span>
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (TSh)</span>
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</span>
                                    </th>
                                </tr>
                            </thead>

                            {/* Zebra Rows */}
                            <tbody className="divide-y divide-gray-100">
                                {filteredSales.map((sale, index) => {
                                    const isEven = index % 2 === 0;
                                    const { month, day, time } = formatDate(sale.saleDate);
                                    const isTradeIn = !!sale.tradeInId;

                                    return (
                                        <tr
                                            key={sale.id}
                                            className={`
                                                ${isEven ? 'bg-white' : 'bg-gray-50/50'}
                                                ${isTradeIn ? 'bg-orange-50/20' : ''}
                                                hover:bg-blue-50/30 transition-colors
                                            `}
                                        >
                                            {/* Date */}
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center border border-gray-100">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{month}</span>
                                                        <span className="text-lg font-black text-gray-900 leading-none">{day}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500">
                                                            {time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Product */}
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-sm text-gray-900">{sale.product?.name || 'Unknown'}</div>
                                                <div className={`text-xs font-medium mt-0.5 ${sale.condition === 'active' ? 'text-green-600' :
                                                    sale.condition === 'used' ? 'text-amber-600' :
                                                        'text-gray-500'
                                                    }`}>
                                                    {sale.condition || 'N/A'}
                                                </div>
                                            </td>

                                            {/* Serial */}
                                            <td className="px-5 py-3">
                                                <div className="text-xs font-mono text-gray-700 font-bold">
                                                    {sale.serialNumber || 'N/A'}
                                                </div>
                                                {isTradeIn && (
                                                    <div className="mt-1 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                                                        <FontAwesomeIcon icon={faExchangeAlt} className="mr-1" />
                                                        Trade-In
                                                    </div>
                                                )}
                                            </td>

                                            {/* Customer */}
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-sm text-gray-900">{sale.customer?.name || 'Walk-in'}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{sale.customer?.phone || 'No Contact'}</div>
                                            </td>

                                            {/* Staff */}
                                            <td className="px-5 py-3">
                                                <div className="text-sm font-medium text-gray-800">{sale.staff?.name || sale.staffName || 'System'}</div>
                                            </td>

                                            {/* Payment Method */}
                                            <td className="px-5 py-3 text-center">
                                                <span className={`
                                                    inline-block px-2 py-1 rounded text-[10px] font-bold uppercase
                                                    ${sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' :
                                                        sale.paymentMethod === 'TIGOPESA' ? 'bg-blue-100 text-blue-700' :
                                                            sale.paymentMethod === 'AIRTEL_MONEY' ? 'bg-red-100 text-red-700' :
                                                                sale.paymentMethod === 'M_PESA' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'}
                                                `}>
                                                    {sale.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-3 text-right">
                                                <div className="font-semibold text-base text-gray-900">
                                                    {formatCurrency(sale.totalAmount)}
                                                </div>
                                            </td>

                                            {/* Profit */}
                                            <td className="px-5 py-3 text-right">
                                                <div className="font-semibold text-sm text-emerald-600">
                                                    +{formatCurrency(sale.profit || 0)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredSales.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-400 font-medium">No sales data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer - Payment Method Breakdown */}
                {filteredSales.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Payment Summary</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(() => {
                                // Calculate totals by payment method
                                const methodTotals = {};
                                filteredSales.forEach(sale => {
                                    const method = sale.paymentMethod || 'UNKNOWN';
                                    if (!methodTotals[method]) {
                                        methodTotals[method] = { revenue: 0, profit: 0, count: 0 };
                                    }
                                    methodTotals[method].revenue += sale.totalAmount || 0;
                                    methodTotals[method].profit += sale.profit || 0;
                                    methodTotals[method].count += 1;
                                });

                                const methodColors = {
                                    'CASH': { bg: 'bg-green-50', text: 'text-green-700', icon: '💵' },
                                    'TIGOPESA': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔵' },
                                    'M_PESA': { bg: 'bg-red-50', text: 'text-red-700', icon: '🔴' },
                                    'AIRTEL_MONEY': { bg: 'bg-orange-50', text: 'text-orange-700', icon: '🟠' },
                                    'BANK': { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🏦' },
                                    'UNKNOWN': { bg: 'bg-gray-50', text: 'text-gray-700', icon: '❓' }
                                };

                                return Object.entries(methodTotals).map(([method, totals]) => {
                                    const colors = methodColors[method] || methodColors['UNKNOWN'];
                                    return (
                                        <div key={method} className={`${colors.bg} rounded-xl p-5 border border-gray-100 shadow-sm`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">{colors.icon}</span>
                                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                    {method.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                            <p className={`text-2xl font-black ${colors.text}`}>
                                                {formatCurrency(totals.revenue)} <span className="text-xs text-gray-500 font-normal">TSh</span>
                                            </p>
                                            <div className="flex items-center justify-between mt-2 text-xs">
                                                <span className="text-gray-500 font-medium">{totals.count} transactions</span>
                                                <span className="text-emerald-600 font-bold">+{formatCurrency(totals.profit)}</span>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}

                            {/* Grand Total Card */}
                            <div className="bg-gray-900 rounded-xl p-5 text-white shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">💰</span>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grand Total</p>
                                </div>
                                <p className="text-2xl font-black">
                                    {formatCurrency(filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0))}
                                    <span className="text-xs text-gray-500 font-normal ml-1">TSh</span>
                                </p>
                                <div className="flex items-center justify-between mt-2 text-xs">
                                    <span className="text-gray-400 font-medium">{filteredSales.length} sales</span>
                                    <span className="text-emerald-400 font-bold">
                                        +{formatCurrency(filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesPage;
