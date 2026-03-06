import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faCalendarAlt,
    faChartLine,
    faBoxOpen,
    faMoneyBillWave,
    faUsers,
    faFilter,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../utils/api';

const formatTZS = (amount) => new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0
}).format(amount || 0);

const toISODate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const ReportsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [tab, setTab] = useState('sales');
    const [startDate, setStartDate] = useState(toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [endDate, setEndDate] = useState(toISODate(new Date()));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState(null);

    const canAccess = useMemo(() => ['CEO', 'MANAGER'].includes(user?.role), [user?.role]);

    const loadReport = async () => {
        if (!canAccess) return;
        setLoading(true);
        setError('');
        try {
            const params = { startDate, endDate };
            const res = tab === 'sales'
                ? await reportsAPI.getSales(params)
                : await reportsAPI.getImports(params);
            if (res.data?.success) setReport(res.data.data);
            else setError(res.data?.message || 'Failed to load report');
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon, label, value, accent }) => (
        <div className="premium-card p-5 md:p-6 relative overflow-hidden">
            <div className={`absolute inset-0 ${accent} opacity-[0.06]`} />
            <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter break-words">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent} bg-opacity-10 text-gray-700`}>
                    <FontAwesomeIcon icon={icon} className="text-lg" />
                </div>
            </div>
        </div>
    );

    if (!canAccess) {
        return (
            <div className="premium-bg min-h-screen flex items-center justify-center p-6">
                <div className="premium-card p-8 max-w-xl w-full text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Access</p>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">Reports are restricted</h1>
                    <p className="text-sm font-bold text-gray-500 mb-6">Only CEO and MANAGER can view reports.</p>
                    <button className="premium-btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-bg pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
                <div className="flex items-center justify-between gap-4 mb-6 md:mb-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="premium-card w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all flex-shrink-0"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                        </button>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Business Intelligence</p>
                            <h1 className="text-xl md:text-3xl font-black text-gray-900">Reports</h1>
                        </div>
                    </div>

                    <div className="flex bg-gray-100/60 p-1 rounded-xl">
                        <button
                            onClick={() => { setTab('sales'); setReport(null); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'sales' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Sales
                        </button>
                        <button
                            onClick={() => { setTab('imports'); setReport(null); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'imports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Imports
                        </button>
                    </div>
                </div>

                <div className="premium-card p-5 md:p-6 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Date Range</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input className="premium-input pl-12" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input className="premium-input pl-12" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="premium-btn-primary h-[46px]"
                        >
                            <FontAwesomeIcon icon={loading ? faSpinner : faFilter} className={loading ? 'animate-spin' : ''} />
                            Run
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-sm font-bold text-rose-600">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {report && (
                    <div className="space-y-6">
                        {tab === 'sales' ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard icon={faMoneyBillWave} label="Revenue" value={formatTZS(report.summary?.revenue)} accent="bg-emerald-500" />
                                    <StatCard icon={faChartLine} label="Profit" value={formatTZS(report.summary?.profit)} accent="bg-blue-500" />
                                    <StatCard icon={faBoxOpen} label="Transactions" value={report.summary?.count || 0} accent="bg-purple-500" />
                                    <StatCard icon={faUsers} label="Avg Sale" value={formatTZS(report.summary?.averageSale)} accent="bg-amber-500" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="premium-card p-5 md:p-6">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">By Payment Method</p>
                                        <div className="space-y-3">
                                            {(report.byPaymentMethod || []).slice(0, 8).map((m) => (
                                                <div key={m.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900">{m.method}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{m.count} tx</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-gray-900">{formatTZS(m.revenue)}</p>
                                                        <p className="text-[10px] font-bold text-emerald-600">{formatTZS(m.profit)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="premium-card p-5 md:p-6">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Top Staff</p>
                                        <div className="space-y-3">
                                            {(report.byStaff || []).slice(0, 8).map((s) => (
                                                <div key={s.staffName} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 break-words">{s.staffName}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{s.count} tx</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-gray-900">{formatTZS(s.revenue)}</p>
                                                        <p className="text-[10px] font-bold text-emerald-600">{formatTZS(s.profit)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-card p-5 md:p-6 overflow-hidden">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Sales List</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-[900px] w-full">
                                            <thead>
                                                <tr className="text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    <th className="py-3 pr-4">Date</th>
                                                    <th className="py-3 pr-4">Product</th>
                                                    <th className="py-3 pr-4">Customer</th>
                                                    <th className="py-3 pr-4">Staff</th>
                                                    <th className="py-3 pr-4">Method</th>
                                                    <th className="py-3 pr-4 text-right">Amount</th>
                                                    <th className="py-3 pr-0 text-right">Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {(report.items || []).slice(0, 200).map((it) => (
                                                    <tr key={it.id} className="text-sm">
                                                        <td className="py-3 pr-4 font-bold text-gray-700 whitespace-nowrap">{new Date(it.date).toLocaleString()}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-900 break-words">{it.productName}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700 break-words">{it.customerName}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700 break-words">{it.staffName}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700">{it.paymentMethod}</td>
                                                        <td className="py-3 pr-4 font-black text-gray-900 text-right whitespace-nowrap">{formatTZS(it.amount)}</td>
                                                        <td className="py-3 pr-0 font-black text-emerald-700 text-right whitespace-nowrap">{formatTZS(it.profit)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-4 text-[10px] font-bold text-gray-400">Showing up to 200 rows. (We can add export next.)</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard icon={faBoxOpen} label="Units Imported" value={report.summary?.totalUnits || 0} accent="bg-blue-500" />
                                    <StatCard icon={faMoneyBillWave} label="Total Cost" value={formatTZS(report.summary?.totalCost)} accent="bg-rose-500" />
                                    <StatCard icon={faChartLine} label="Selling Value" value={formatTZS(report.summary?.totalSellingValue)} accent="bg-emerald-500" />
                                    <StatCard icon={faFilter} label="Est. Margin" value={formatTZS(report.summary?.estimatedMargin)} accent="bg-amber-500" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="premium-card p-5 md:p-6">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">By Supplier</p>
                                        <div className="space-y-3">
                                            {(report.bySupplier || []).slice(0, 10).map((s) => (
                                                <div key={s.supplierName} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 break-words">{s.supplierName}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{s.units} units</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-gray-900">{formatTZS(s.totalCost)}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{formatTZS(s.totalSellingValue)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="premium-card p-5 md:p-6">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">By Product</p>
                                        <div className="space-y-3">
                                            {(report.byProduct || []).slice(0, 10).map((p) => (
                                                <div key={p.productName} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 break-words">{p.productName}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{p.units} units</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-gray-900">{formatTZS(p.totalCost)}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{formatTZS(p.totalSellingValue)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-card p-5 md:p-6 overflow-hidden">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Imported Devices</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-[1100px] w-full">
                                            <thead>
                                                <tr className="text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    <th className="py-3 pr-4">Added</th>
                                                    <th className="py-3 pr-4">Product</th>
                                                    <th className="py-3 pr-4">Supplier</th>
                                                    <th className="py-3 pr-4">Serial</th>
                                                    <th className="py-3 pr-4">Variant</th>
                                                    <th className="py-3 pr-4">Condition</th>
                                                    <th className="py-3 pr-4">Status</th>
                                                    <th className="py-3 pr-4 text-right">Cost</th>
                                                    <th className="py-3 pr-0 text-right">Sell</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {(report.items || []).slice(0, 200).map((d) => (
                                                    <tr key={d.deviceId} className="text-sm">
                                                        <td className="py-3 pr-4 font-bold text-gray-700 whitespace-nowrap">{new Date(d.addedAt).toLocaleString()}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-900 break-words">{d.productName}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700 break-words">{d.supplierName}</td>
                                                        <td className="py-3 pr-4 font-mono text-xs text-gray-700 break-words">{d.serialNumber}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700">{`${d.variant?.storage || ''} ${d.variant?.color || ''}`.trim() || '-'}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700">{d.condition}</td>
                                                        <td className="py-3 pr-4 font-bold text-gray-700">{d.status}</td>
                                                        <td className="py-3 pr-4 font-black text-gray-900 text-right whitespace-nowrap">{formatTZS(d.costPrice)}</td>
                                                        <td className="py-3 pr-0 font-black text-emerald-700 text-right whitespace-nowrap">{formatTZS(d.sellingPrice)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-4 text-[10px] font-bold text-gray-400">Showing up to 200 rows. (We can add export next.)</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {!report && (
                    <div className="premium-card p-10 md:p-14 text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ready</p>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-3">Choose a date range</h2>
                        <p className="text-sm font-bold text-gray-500 max-w-2xl mx-auto">Run a Sales or Imports report to see totals, breakdowns, and detailed rows. Designed to be fast on mobile and powerful on desktop.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
