import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileDown,
    FileSpreadsheet,
    Filter,
    Loader2,
    RefreshCcw,
    Repeat2,
    Search
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { API_URL as API_BASE_URL } from '../utils/api';

const SalesPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCEO = user?.role === 'CEO';
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState('all');
    const [filterStaffId, setFilterStaffId] = useState('all');
    const [profitMin, setProfitMin] = useState('');
    const [profitMax, setProfitMax] = useState('');
    const [marginMin, setMarginMin] = useState('');
    const [marginMax, setMarginMax] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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

    const normalizeItems = (sale) => {
        if (Array.isArray(sale?.items) && sale.items.length > 0) return sale.items;

        // Legacy single-item fallback
        const legacyProductName = sale?.product?.name || sale?.productName || 'Unknown';
        return [
            {
                productId: sale?.productId || null,
                productName: legacyProductName,
                deviceId: sale?.deviceId || null,
                quantity: sale?.quantity || 1,
                sellingPrice: sale?.sellingPrice || sale?.totalAmount || 0,
                costPrice: sale?.costPrice || 0,
                serialNumber: sale?.serialNumber || null,
                storage: sale?.storage || null,
                color: sale?.color || null,
                simType: sale?.simType || null,
                itemDiscountType: sale?.discountType || null,
                itemDiscountValue: sale?.discountValue ?? null,
                itemDiscountAmount: sale?.itemDiscountAmount || 0
            }
        ];
    };

    const getItemDetailString = (item) => {
        let name = item?.productName || 'Unknown';
        const variants = [];
        if (item.storage) variants.push(item.storage);
        if (item.color) variants.push(item.color);
        if (item.simType) variants.push(item.simType);
        if (variants.length > 0) name += ` (${variants.join(', ')})`;
        if (item.serialNumber && item.serialNumber !== 'N/A') name += ` [SN: ${item.serialNumber}]`;
        if ((item.quantity || 1) > 1) return `[QTY: ${item.quantity}] ${name}`;
        return name;
    };

    const computeSaleCostTotal = (sale) => {
        const items = normalizeItems(sale);
        return items.reduce((sum, it) => sum + ((parseFloat(it.costPrice) || 0) * (parseInt(it.quantity) || 1)), 0);
    };

    const computeSaleMarginPct = (sale) => {
        const total = parseFloat(sale?.totalAmount) || 0;
        const profit = parseFloat(sale?.profit) || 0;
        if (total <= 0) return 0;
        return (profit / total) * 100;
    };

    const handleExportExcel = () => {
        if (!filteredSales.length) return;

        const generatedAt = new Date();

        const summaryRows = filteredSales.map(sale => {
            const saleCost = computeSaleCostTotal(sale);
            const marginPct = computeSaleMarginPct(sale);
            const items = normalizeItems(sale);
            const topItems = items.slice(0, 2).map(getItemDetailString).join(' | ');

            return {
                Date: new Date(sale.saleDate).toLocaleString(),
                SaleID: sale.id,
                Customer: sale.customer?.name || 'Walk-in',
                Phone: sale.customer?.phone || '',
                Staff: sale.staff?.name || sale.staffName || 'System',
                PaymentMethod: sale.paymentMethod || 'N/A',
                ItemsCount: items.reduce((sum, it) => sum + (parseInt(it.quantity) || 1), 0),
                ItemsPreview: topItems,
                Amount: parseFloat(sale.totalAmount) || 0,
                Cost: saleCost,
                Profit: parseFloat(sale.profit) || 0,
                MarginPct: Number.isFinite(marginPct) ? marginPct : 0,
                Discount: parseFloat(sale.totalDiscountAmount ?? sale.discountAmount) || 0,
                PaymentStatus: sale.paymentStatus || '',
                AmountPaid: parseFloat(sale.amountPaid) || 0
            };
        });

        const itemRows = filteredSales.flatMap(sale => {
            const items = normalizeItems(sale);
            return items.map((it, idx) => {
                const qty = parseInt(it.quantity) || 1;
                const unitSell = parseFloat(it.sellingPrice) || 0;
                const unitCost = parseFloat(it.costPrice) || 0;
                const itemDiscountAmountPerUnit = parseFloat(it.itemDiscountAmount) || 0;

                return {
                    SaleID: sale.id,
                    SaleDate: new Date(sale.saleDate).toLocaleString(),
                    Customer: sale.customer?.name || 'Walk-in',
                    Staff: sale.staff?.name || sale.staffName || 'System',
                    PaymentMethod: sale.paymentMethod || 'N/A',
                    LineNo: idx + 1,
                    Product: it.productName || 'Unknown',
                    Quantity: qty,
                    SerialNumber: it.serialNumber || '',
                    Storage: it.storage || '',
                    Color: it.color || '',
                    SIMType: it.simType || '',
                    UnitSellingPrice: unitSell,
                    UnitCostPrice: unitCost,
                    UnitDiscount: itemDiscountAmountPerUnit,
                    UnitNetSelling: Math.max(0, unitSell),
                    LineRevenue: unitSell * qty,
                    LineCost: unitCost * qty,
                    LineProfit: (unitSell - unitCost) * qty
                };
            });
        });

        const wb = XLSX.utils.book_new();

        const metaRows = [
            { Key: 'Report', Value: 'SimuKitaa Sales History' },
            { Key: 'Generated', Value: generatedAt.toLocaleString() },
            { Key: 'Period', Value: `${startDate || 'All Time'} to ${endDate || 'Present'}` },
            { Key: 'Rows', Value: filteredSales.length }
        ];
        const wsMeta = XLSX.utils.json_to_sheet(metaRows);
        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        const wsItems = XLSX.utils.json_to_sheet(itemRows);

        XLSX.utils.book_append_sheet(wb, wsMeta, 'Meta');
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Sales Summary');
        XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items');

        XLSX.writeFile(wb, `SimuKitaa_Sales_History_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        if (!filteredSales.length) return;
        const doc = new jsPDF();

        // Header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('SimuKitaa Sales History', 15, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${startDate || 'All Time'} - ${endDate || 'Present'}`, 15, 30);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 30);

        // Stats Summary
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Key Metrics', 15, 50);

        const summaryRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const summaryProfit = filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0);
        const summaryCost = filteredSales.reduce((sum, s) => sum + computeSaleCostTotal(s), 0);
        const summaryDiscount = filteredSales.reduce((sum, s) => sum + (parseFloat(s.totalDiscountAmount ?? s.discountAmount) || 0), 0);

        autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: [
                ['Total Transactions', filteredSales.length],
                ['Total Revenue', `TSh ${summaryRevenue.toLocaleString()}`],
                ['Total Discount', `TSh ${summaryDiscount.toLocaleString()}`],
                ['Total Cost (COGS)', `TSh ${summaryCost.toLocaleString()}`],
                ['Total Profit', `TSh ${summaryProfit.toLocaleString()}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] }
        });

        // Transactions Table
        doc.text('Detailed Transaction Record', 15, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Date', 'Sale ID', 'Customer', 'Items', 'Amount', 'Cost', 'Profit', 'Method']],
            body: filteredSales.map(t => {
                const items = normalizeItems(t);
                const itemsPreview = items.slice(0, 2).map(getItemDetailString).join(' | ');
                return [
                    new Date(t.saleDate).toLocaleDateString(),
                    t.id,
                    t.customer?.name || 'Walk-in',
                    itemsPreview,
                    `TSh ${(t.totalAmount || 0).toLocaleString()}`,
                    `TSh ${computeSaleCostTotal(t).toLocaleString()}`,
                    `TSh ${(t.profit || 0).toLocaleString()}`,
                    t.paymentMethod || 'N/A'
                ];
            }),
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [51, 65, 85] },
            columnStyles: { 3: { cellWidth: 70 } }
        });

        doc.save(`SimuKitaa_Sales_History_${new Date().toISOString().split('T')[0]}.pdf`);
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
        const q = searchQuery.trim().toLowerCase();
        const items = normalizeItems(sale);

        const searchHaystack = [
            sale.id,
            sale.customer?.name,
            sale.customer?.phone,
            sale.staff?.name,
            sale.staffName,
            sale.paymentMethod,
            ...(items.flatMap(it => [
                it.productName,
                it.serialNumber,
                it.storage,
                it.color,
                it.simType
            ]))
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesSearch = !q || searchHaystack.includes(q);

        const matchesMethod = filterMethod === 'all' || sale.paymentMethod === filterMethod;
        const saleStaffId = sale.staff?.id || sale.staffId || 'unknown';
        const matchesStaff = filterStaffId === 'all' || saleStaffId === filterStaffId;

        // Date Range Logic
        let matchesDate = true;
        const saleDateObj = new Date(sale.saleDate);
        saleDateObj.setHours(0, 0, 0, 0);
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (saleDateObj < start) matchesDate = false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);
            if (saleDateObj > end) matchesDate = false;
        }

        const profit = parseFloat(sale.profit) || 0;
        const marginPct = computeSaleMarginPct(sale);

        const pMin = profitMin === '' ? null : (parseFloat(profitMin) || 0);
        const pMax = profitMax === '' ? null : (parseFloat(profitMax) || 0);
        const mMin = marginMin === '' ? null : (parseFloat(marginMin) || 0);
        const mMax = marginMax === '' ? null : (parseFloat(marginMax) || 0);

        const matchesProfit = (pMin === null || profit >= pMin) && (pMax === null || profit <= pMax);
        const matchesMargin = (mMin === null || marginPct >= mMin) && (mMax === null || marginPct <= mMax);

        return matchesSearch && matchesMethod && matchesStaff && matchesDate && matchesProfit && matchesMargin;
    }).sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));

    // Calculate Dashboard Stats
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
    const tradeInCount = sales.filter(s => s.tradeInId).length;
    const itemsSold = sales.reduce((sum, s) => sum + normalizeItems(s).reduce((acc, it) => acc + (parseInt(it.quantity) || 1), 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">Loading sales...</p>
                </div>
            </div>
        );
    }

    const paymentMethods = Array.from(new Set(sales.map(s => s.paymentMethod).filter(Boolean))).sort();
    const staffOptions = Array.from(
        new Map(
            sales.map(s => {
                const id = s.staff?.id || s.staffId || 'unknown';
                const name = s.staff?.name || s.staffName || 'System';
                return [id, { id, name }];
            })
        ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Modern Header */}
            <div className="apple-surface border-b border-white/40">
                <div className="max-w-[95%] mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors mobile-only"
                            >
                                <ArrowLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales History</h1>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">{filteredSales.length} transactions • {itemsSold} total sales</p>
                            </div>
                        </div>
                        {isCEO && (
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)} <span className="text-sm text-gray-500 font-normal">TSh</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Net Profit</p>
                                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalProfit)} <span className="text-sm text-gray-500 font-normal">TSh</span></p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={handleExportExcel}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" /> Excel
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <FileDown className="w-4 h-4" /> PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="apple-surface border-b border-white/40 sticky top-0 z-10">
                <div className="max-w-[95%] mx-auto px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID, product, customer, serial..."
                                className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">From</span>
                                <input
                                    type="date"
                                    className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none p-0"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-purple-500 uppercase tracking-tighter">To</span>
                                <input
                                    type="date"
                                    className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none p-0"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <Filter className="w-4 h-4 text-purple-600" />
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
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <Filter className="w-4 h-4 text-blue-600" />
                            <select
                                value={filterStaffId}
                                onChange={(e) => setFilterStaffId(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
                            >
                                <option value="all">👤 All Staff</option>
                                {staffOptions.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        {isCEO && (
                            <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Profit</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-24 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none"
                                        value={profitMin}
                                        onChange={(e) => setProfitMin(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-24 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none"
                                        value={profitMax}
                                        onChange={(e) => setProfitMax(e.target.value)}
                                    />
                                </div>
                                <div className="w-px h-4 bg-gray-200" />
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">Margin%</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-20 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none"
                                        value={marginMin}
                                        onChange={(e) => setMarginMin(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-20 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none"
                                        value={marginMax}
                                        onChange={(e) => setMarginMax(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setFilterMethod('all');
                                setFilterStaffId('all');
                                setSearchQuery('');
                                setProfitMin('');
                                setProfitMax('');
                                setMarginMin('');
                                setMarginMax('');
                                fetchSales();
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-blue-500 transition-all"
                        >
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Summary - Moved to Top */}
            {isCEO && filteredSales.length > 0 && (
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
                <div className="apple-card rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Minimal Header */}
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Items (Preview)</span>
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
                                    {isCEO && (
                                        <>
                                            <th className="px-5 py-3 text-right">
                                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (TSh)</span>
                                            </th>
                                            <th className="px-5 py-3 text-right">
                                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">COGS</span>
                                            </th>
                                            <th className="px-5 py-3 text-right">
                                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</span>
                                            </th>
                                            <th className="px-5 py-3 text-right">
                                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Margin%</span>
                                            </th>
                                        </>
                                    )}
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

                                            {/* Items Preview */}
                                            <td className="px-5 py-3">
                                                {(() => {
                                                    const items = normalizeItems(sale);
                                                    const preview = items.slice(0, 2);
                                                    return (
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-gray-500">
                                                                {items.reduce((sum, it) => sum + (parseInt(it.quantity) || 1), 0)} item(s)
                                                            </div>
                                                            {preview.map((it, i) => (
                                                                <div key={i} className="text-sm font-semibold text-gray-900">
                                                                    {getItemDetailString(it)}
                                                                </div>
                                                            ))}
                                                            {items.length > 2 && (
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                    +{items.length - 2} more
                                                                </div>
                                                            )}
                                                            {isTradeIn && (
                                                                <div className="mt-1 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                                                                    <Repeat2 className="inline-block w-3 h-3 mr-1" />
                                                                    Trade-In
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
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

                                            {isCEO && (
                                                <>
                                                    {/* Amount */}
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="font-semibold text-base text-gray-900">
                                                            {formatCurrency(sale.totalAmount)}
                                                        </div>
                                                    </td>

                                                    {/* COGS */}
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="font-semibold text-sm text-gray-700">
                                                            {formatCurrency(computeSaleCostTotal(sale))}
                                                        </div>
                                                    </td>

                                                    {/* Profit */}
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="font-semibold text-sm text-emerald-600">
                                                            +{formatCurrency(sale.profit || 0)}
                                                        </div>
                                                    </td>

                                                    {/* Margin */}
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="font-semibold text-sm text-indigo-700">
                                                            {computeSaleMarginPct(sale).toFixed(1)}%
                                                        </div>
                                                    </td>
                                                </>
                                            )}
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
                {isCEO && filteredSales.length > 0 && (
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
