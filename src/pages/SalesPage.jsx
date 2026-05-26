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
    Search,
    Wallet,
    CalendarDays,
    PlusCircle,
    TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { API_URL as API_BASE_URL } from '../utils/api';
import { expenseAPI, serviceIncomeAPI } from '../utils/api';

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
    const [expenses, setExpenses] = useState([]);
    const [serviceIncome, setServiceIncome] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        serviceName: 'iOS Update',
        customerName: '',
        customerPhone: '',
        description: '',
        amount: '',
        paymentMethod: 'CASH'
    });

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        fetchExpensesAndServices();
    }, [startDate, endDate]);

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

    const fetchExpensesAndServices = async () => {
        if (!isCEO) return;
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const [expenseResponse, serviceResponse] = await Promise.all([
                expenseAPI.getAll(params),
                serviceIncomeAPI.getAll(params)
            ]);
            setExpenses(expenseResponse.data.data || []);
            setServiceIncome(serviceResponse.data.data || []);
        } catch (error) {
            console.error('Failed to fetch expenses/services:', error);
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
                PaymentMethod: getPaymentLabel(sale),
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
                    PaymentMethod: getPaymentLabel(sale),
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
                    getPaymentLabel(t)
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

    const getMissingCostBadge = (sale) => {
        if (!isCEO) return null;
        const cost = computeSaleCostTotal(sale);
        if (cost > 0) return null;
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                Missing cost
            </span>
        );
    };

    const normalizePayments = (sale) => {
        if (Array.isArray(sale?.payments) && sale.payments.length > 0) {
            return sale.payments
                .map(p => ({ method: p.method || 'Unspecified', amount: parseFloat(p.amount) || 0 }))
                .filter(p => p.amount > 0);
        }
        return [{ method: sale?.paymentMethod || 'Unspecified', amount: parseFloat(sale?.amountPaid ?? sale?.totalAmount) || 0 }];
    };

    const getPaymentLabel = (sale) => {
        const payments = normalizePayments(sale);
        if (payments.length > 1) return payments.map(p => `${p.method.replace(/_/g, ' ')} ${formatCurrency(p.amount)}`).join(' + ');
        return (payments[0]?.method || 'Unspecified').replace(/_/g, ' ');
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            await serviceIncomeAPI.create(serviceForm);
            setServiceForm({
                date: new Date().toISOString().split('T')[0],
                serviceName: 'iOS Update',
                customerName: '',
                customerPhone: '',
                description: '',
                amount: '',
                paymentMethod: 'CASH'
            });
            setShowServiceForm(false);
            fetchExpensesAndServices();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to record service income');
        }
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

        const matchesMethod = filterMethod === 'all' || normalizePayments(sale).some(p => p.method === filterMethod);
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

    const filteredRevenue = filteredSales.reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);
    const filteredCost = filteredSales.reduce((sum, s) => sum + computeSaleCostTotal(s), 0);
    const filteredProfit = filteredSales.reduce((sum, s) => sum + (parseFloat(s.profit) || 0), 0);
    const filteredDiscount = filteredSales.reduce((sum, s) => sum + (parseFloat(s.totalDiscountAmount ?? s.discountAmount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    const totalServiceIncome = serviceIncome.reduce((sum, service) => sum + (parseFloat(service.amount) || 0), 0);
    const closeRevenue = filteredRevenue + totalServiceIncome;
    const netCashAfterExpenses = closeRevenue - totalExpenses;
    const netProfitAfterExpenses = filteredProfit + totalServiceIncome - totalExpenses;
    const filteredItemsSold = filteredSales.reduce((sum, s) => sum + normalizeItems(s).reduce((acc, it) => acc + (parseInt(it.quantity) || 1), 0), 0);
    const averageSaleValue = filteredSales.length ? filteredRevenue / filteredSales.length : 0;
    const filteredMarginPct = filteredRevenue > 0 ? (filteredProfit / filteredRevenue) * 100 : 0;
    const periodLabel = `${startDate || 'All time'} → ${endDate || 'Today'}`;
    const paymentSummary = Array.from(filteredSales.reduce((map, sale) => {
        const salePaid = normalizePayments(sale).reduce((sum, p) => sum + p.amount, 0);
        normalizePayments(sale).forEach(payment => {
            const current = map.get(payment.method) || { method: payment.method, amount: 0, count: 0, profit: 0 };
            const profitShare = salePaid > 0 ? ((parseFloat(sale.profit) || 0) * (payment.amount / salePaid)) : 0;
            current.amount += payment.amount;
            current.profit += profitShare;
            current.count += 1;
            map.set(payment.method, current);
        });
        return map;
    }, new Map()).values()).sort((a, b) => b.amount - a.amount);
    const topPaymentAmount = paymentSummary[0]?.amount || 0;
    const dailySummary = Array.from(filteredSales.reduce((map, sale) => {
        const key = new Date(sale.saleDate).toISOString().split('T')[0];
        const current = map.get(key) || { key, amount: 0, count: 0, profit: 0 };
        current.amount += parseFloat(sale.totalAmount) || 0;
        current.profit += parseFloat(sale.profit) || 0;
        current.count += 1;
        map.set(key, current);
        return map;
    }, new Map()).values()).sort((a, b) => new Date(b.key) - new Date(a.key));
    const weeklySummary = Array.from(filteredSales.reduce((map, sale) => {
        const date = new Date(sale.saleDate);
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const key = start.toISOString().split('T')[0];
        const current = map.get(key) || { key, label: `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`, amount: 0, count: 0, profit: 0 };
        current.amount += parseFloat(sale.totalAmount) || 0;
        current.profit += parseFloat(sale.profit) || 0;
        current.count += 1;
        map.set(key, current);
        return map;
    }, new Map()).values()).sort((a, b) => new Date(b.key) - new Date(a.key));

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

    const paymentMethods = Array.from(new Set([
        'CASH',
        'M-PESA',
        'TIGOPESA',
        'AIRTEL_MONEY',
        'HALOPESA',
        'BANK',
        ...sales.flatMap(s => normalizePayments(s).map(p => p.method))
    ].filter(method => method && method !== 'Unspecified'))).sort();
    const staffOptions = Array.from(
        new Map(
            sales.map(s => {
                const id = s.staff?.id || s.staffId || 'unknown';
                const name = s.staff?.name || s.staffName || 'System';
                return [id, { id, name }];
            })
        ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
    const todayIso = new Date().toISOString().split('T')[0];
    const weekStartIso = (() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay() + 1);
        return d.toISOString().split('T')[0];
    })();
    const monthStartIso = (() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    })();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8 overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Modern Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors self-start"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="text-center sm:flex-1">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Sales History</h1>
                        <p className="text-sm text-gray-600 font-semibold mt-1">{filteredSales.length} transactions • {filteredItemsSold} items • {periodLabel}</p>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                        {isCEO && (
                            <>
                                <button
                                    onClick={handleExportExcel}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span className="hidden sm:inline">Excel</span>
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button
                                    onClick={() => setShowServiceForm(!showServiceForm)}
                                    className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Service</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isCEO && (
                    <AnimatePresence>
                        {showServiceForm && (
                            <motion.form
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleServiceSubmit}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 mb-5"
                            >
                                <div className="flex flex-col md:flex-row md:items-end gap-3">
                                    <label className="flex-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Service</span>
                                        <input value={serviceForm.serviceName} onChange={e => setServiceForm(f => ({ ...f, serviceName: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold" placeholder="iOS Update" required />
                                    </label>
                                    <label>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</span>
                                        <input type="number" value={serviceForm.amount} onChange={e => setServiceForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold" required />
                                    </label>
                                    <label>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Method</span>
                                        <select value={serviceForm.paymentMethod} onChange={e => setServiceForm(f => ({ ...f, paymentMethod: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold">
                                            {paymentMethods.map(method => <option key={method} value={method}>{method.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </label>
                                    <label>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</span>
                                        <input value={serviceForm.customerName} onChange={e => setServiceForm(f => ({ ...f, customerName: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold" placeholder="Optional" />
                                    </label>
                                    <button className="px-5 py-3 rounded-xl bg-slate-900 text-white font-black">Record Income</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                )}

                {isCEO && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Date Range</p>
                                    <h2 className="text-lg font-black text-gray-900">Choose report period</h2>
                                </div>
                                <CalendarDays className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">From</span>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-800 focus:border-blue-500 focus:outline-none" />
                                </label>
                                <label className="block">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">To</span>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-800 focus:border-blue-500 focus:outline-none" />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => { setStartDate(todayIso); setEndDate(todayIso); }} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-black hover:bg-blue-100 transition-colors">Today</button>
                                <button onClick={() => { setStartDate(weekStartIso); setEndDate(todayIso); }} className="px-3 py-2 rounded-xl bg-gray-50 text-gray-700 text-xs font-black hover:bg-gray-100 transition-colors">This Week</button>
                                <button onClick={() => { setStartDate(monthStartIso); setEndDate(todayIso); }} className="px-3 py-2 rounded-xl bg-gray-50 text-gray-700 text-xs font-black hover:bg-gray-100 transition-colors">This Month</button>
                                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-3 py-2 rounded-xl bg-white text-gray-500 border border-gray-200 text-xs font-black hover:bg-gray-50 transition-colors">All Time</button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Methods</p>
                                    <h2 className="text-lg font-black text-gray-900">Breakdown for selected range</h2>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-gray-700 text-xs font-black self-start sm:self-auto">
                                    <Wallet className="w-4 h-4 text-blue-600" />
                                    {paymentSummary.length || 0}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {paymentSummary.map(item => {
                                    const pct = topPaymentAmount > 0 ? (item.amount / topPaymentAmount) * 100 : 0;
                                    return (
                                        <div key={item.method} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <div className="font-black text-gray-900 text-sm">{item.method.replace(/_/g, ' ')}</div>
                                                    <div className="text-xs font-bold text-gray-500">{item.count} sale(s)</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-emerald-700">{formatCurrency(item.amount)}</div>
                                                    <div className="text-[11px] font-bold text-purple-600">Profit {formatCurrency(item.profit)}</div>
                                                </div>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-white overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {paymentSummary.length === 0 && <div className="text-center py-8 text-gray-400 font-bold md:col-span-2">No payment data in this filter</div>}
                            </div>
                        </div>
                    </div>
                )}

                {isCEO && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-3 mb-5">
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-blue-600 truncate">{filteredSales.length}</div>
                            <div className="text-xs text-gray-500 font-bold">Sales</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 truncate" title={formatCurrency(filteredRevenue)}>{formatCurrency(filteredRevenue)}</div>
                            <div className="text-xs text-gray-500 font-bold">Revenue</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-amber-600 truncate" title={formatCurrency(filteredCost)}>{formatCurrency(filteredCost)}</div>
                            <div className="text-xs text-gray-500 font-bold">COGS</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-purple-600 truncate" title={formatCurrency(filteredProfit)}>{formatCurrency(filteredProfit)}</div>
                            <div className="text-xs text-gray-500 font-bold">Profit</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-indigo-600 truncate">{filteredMarginPct.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500 font-bold">Margin</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-700 truncate" title={formatCurrency(averageSaleValue)}>{formatCurrency(averageSaleValue)}</div>
                            <div className="text-xs text-gray-500 font-bold">Avg Sale</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-red-600 truncate" title={`-${formatCurrency(totalExpenses)}`}>-{formatCurrency(totalExpenses)}</div>
                            <div className="text-xs text-gray-500 font-bold">Expenses</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm min-w-0 overflow-hidden">
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-green-700 truncate" title={formatCurrency(netProfitAfterExpenses)}>{formatCurrency(netProfitAfterExpenses)}</div>
                            <div className="text-xs text-gray-500 font-bold">Net Close</div>
                        </div>
                    </div>
                )}

                {isCEO && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Close Reality</p>
                            <h2 className="text-lg font-black text-gray-900 mb-4">Sales + Services - Expenses</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-bold"><span>Sales Revenue</span><span>{formatCurrency(filteredRevenue)}</span></div>
                                <div className="flex justify-between text-sm font-bold text-emerald-700"><span>Service Income</span><span>+{formatCurrency(totalServiceIncome)}</span></div>
                                <div className="flex justify-between text-sm font-bold text-red-600"><span>Expenses</span><span>-{formatCurrency(totalExpenses)}</span></div>
                                <div className="pt-3 border-t border-gray-100 flex justify-between font-black text-gray-900"><span>Cash After Expenses</span><span>{formatCurrency(netCashAfterExpenses)}</span></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expenses Tab</p>
                            <h2 className="text-lg font-black text-gray-900 mb-4">Latest Expenses</h2>
                            <div className="space-y-2 max-h-44 overflow-y-auto">
                                {expenses.slice(0, 5).map(expense => (
                                    <div key={expense.id} className="flex justify-between gap-3 rounded-xl bg-red-50 px-3 py-2 text-sm">
                                        <span className="font-bold text-gray-700 truncate">{expense.category} • {expense.description}</span>
                                        <span className="font-black text-red-700">-{formatCurrency(expense.amount)}</span>
                                    </div>
                                ))}
                                {expenses.length === 0 && <div className="text-sm text-gray-400 font-bold">No expenses in this period</div>}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Services Tab</p>
                            <h2 className="text-lg font-black text-gray-900 mb-4">Office Service Income</h2>
                            <div className="space-y-2 max-h-44 overflow-y-auto">
                                {serviceIncome.slice(0, 5).map(service => (
                                    <div key={service.id} className="flex justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                                        <span className="font-bold text-gray-700 truncate">{service.serviceName} • {service.customerName || 'Walk-in'}</span>
                                        <span className="font-black text-emerald-700">+{formatCurrency(service.amount)}</span>
                                    </div>
                                ))}
                                {serviceIncome.length === 0 && <div className="text-sm text-gray-400 font-bold">No service income in this period</div>}
                            </div>
                        </div>
                    </div>
                )}

                {isCEO && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Report</p>
                                    <h2 className="text-lg font-black text-gray-900">Everyday Sales</h2>
                                </div>
                                <CalendarDays className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                {dailySummary.slice(0, 14).map(day => (
                                    <div key={day.key} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                        <div>
                                            <div className="font-black text-gray-900">{new Date(day.key).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="text-xs font-bold text-gray-500">{day.count} transaction(s)</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-emerald-700">{formatCurrency(day.amount)}</div>
                                            <div className="text-xs font-bold text-purple-600">+{formatCurrency(day.profit)}</div>
                                        </div>
                                    </div>
                                ))}
                                {dailySummary.length === 0 && <div className="text-center py-8 text-gray-400 font-bold">No daily report data</div>}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Report</p>
                                    <h2 className="text-lg font-black text-gray-900">Week by Week</h2>
                                </div>
                                <CalendarDays className="w-7 h-7 text-indigo-500" />
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                {weeklySummary.slice(0, 12).map(week => (
                                    <div key={week.key} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                        <div>
                                            <div className="font-black text-gray-900">{week.label}</div>
                                            <div className="text-xs font-bold text-gray-500">{week.count} transaction(s)</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-indigo-700">{formatCurrency(week.amount)}</div>
                                            <div className="text-xs font-bold text-purple-600">+{formatCurrency(week.profit)}</div>
                                        </div>
                                    </div>
                                ))}
                                {weeklySummary.length === 0 && <div className="text-center py-8 text-gray-400 font-bold">No weekly report data</div>}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Filters Toolbar */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100 mb-6 sticky top-2 z-10">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 relative group w-full sm:min-w-[260px] basis-full md:basis-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID, product, customer, serial..."
                                className="w-full !pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
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
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
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
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
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
                            <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-3 rounded-2xl border-2 border-gray-200 shadow-sm w-full lg:w-auto">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Profit</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-24 bg-transparent border-2 border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700 outline-none"
                                        value={profitMin}
                                        onChange={(e) => setProfitMin(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-24 bg-transparent border-2 border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700 outline-none"
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
                                        className="w-20 bg-transparent border-2 border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700 outline-none"
                                        value={marginMin}
                                        onChange={(e) => setMarginMin(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-20 bg-transparent border-2 border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700 outline-none"
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

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {filteredSales.map((sale) => {
                        const items = normalizeItems(sale);
                        const preview = items.slice(0, 2);
                        const { month, day, time } = formatDate(sale.saleDate);
                        return (
                            <div key={sale.id} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-gray-100">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center border border-indigo-100">
                                            <span className="text-[10px] text-indigo-500 font-black uppercase">{month}</span>
                                            <span className="text-lg font-black text-gray-900 leading-none">{day}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-500">{time}</div>
                                            <div className="text-xs font-mono text-blue-700 font-bold mt-1">{sale.id}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-gray-400 uppercase">{getPaymentLabel(sale)}</div>
                                        {isCEO && (
                                            <div className="mt-2 space-y-1">
                                                <div className="text-base font-black text-gray-900">{formatCurrency(sale.totalAmount)}</div>
                                                <div className="text-xs font-bold text-gray-600">COGS: {formatCurrency(computeSaleCostTotal(sale))}</div>
                                                <div className="text-xs font-bold text-emerald-700">Profit: +{formatCurrency(sale.profit || 0)}</div>
                                                <div className="flex justify-end">{getMissingCostBadge(sale)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-wider">Items</div>
                                    <div className="mt-1 space-y-1">
                                        {preview.map((it, i) => (
                                            <div key={i} className="text-sm font-bold text-gray-900">{getItemDetailString(it)}</div>
                                        ))}
                                        {items.length > 2 && (
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">+{items.length - 2} more</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-black text-gray-900">{sale.customer?.name || 'Walk-in'}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{sale.customer?.phone || 'No Contact'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-bold">Staff</div>
                                        <div className="text-sm font-bold text-gray-900">{sale.staff?.name || sale.staffName || 'System'}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredSales.length === 0 && (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                            <p className="text-gray-400 font-medium">No sales data available</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-gray-100">
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
                                                    {getPaymentLabel(sale)}
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
                                                        <div className="mt-1 flex justify-end">
                                                            {getMissingCostBadge(sale)}
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
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
