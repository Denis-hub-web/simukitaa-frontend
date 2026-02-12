import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft, faChevronRight, faCalendarAlt,
    faFilter, faChartBar, faUserCircle, faClock,
    faTachometerAlt, faCheckCircle, faExclamationCircle,
    faBoxOpen
} from '@fortawesome/free-solid-svg-icons';

const ExecutiveCalendar = ({ events = [], loading = false }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('ACTIVITY'); // 'ACTIVITY' or 'SALES'
    const [selectedDate, setSelectedDate] = useState(null);

    // Helpers
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthData = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const calendar = [];
        // Pad with empty days for previous month
        for (let i = 0; i < startDay; i++) calendar.push(null);
        // Fill actual days
        for (let i = 1; i <= days; i++) calendar.push(i);

        return calendar;
    }, [viewDate]);

    const navigateMonth = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(viewDate.getMonth() + direction);
        setViewDate(newDate);
    };

    const getDayEvents = (day) => {
        if (!day) return [];
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === viewDate.getMonth() &&
                eventDate.getFullYear() === viewDate.getFullYear();
        });
    };

    const formatDayRevenue = (day) => {
        const dayEvents = getDayEvents(day);
        const total = dayEvents
            .filter(e => e.type === 'sale')
            .reduce((sum, e) => sum + (e.amount || 0), 0);
        return total > 0 ? `Tsh ${total.toLocaleString()}` : null;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/5">
                <div className="w-12 h-12 border-4 border-[#00ffa3] border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Loading Calendar Data...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl rounded-[3rem] border border-white/5 h-full flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ffa3] rounded-full blur-[120px] opacity-[0.03] -mr-64 -mt-64 pointer-events-none" />

            {/* Calendar Header */}
            <div className="p-8 border-b border-white/5 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
                            <p className="text-[9px] font-black text-[#00ffa3]/60 uppercase tracking-[0.4em]">Business Insights</p>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                            {monthNames[viewDate.getMonth()]} <span className="text-white/20">{viewDate.getFullYear()}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setViewMode('ACTIVITY')}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'ACTIVITY' ? 'bg-[#00ffa3] text-black shadow-[0_0_20px_rgba(0,255,163,0.3)]' : 'text-white/40 hover:text-white'}`}
                        >
                            Activity Feed
                        </button>
                        <button
                            onClick={() => setViewMode('SALES')}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'SALES' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-white/40 hover:text-white'}`}
                        >
                            Revenue Flow
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => navigateMonth(-1)} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 text-white/40">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button onClick={() => setViewDate(new Date())} className="px-5 py-3.5 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 text-white/60">
                            Refresh
                        </button>
                        <button onClick={() => navigateMonth(1)} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 text-white/40">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 p-6 relative z-10 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="p-1 md:p-4 text-[7px] md:text-[9px] font-black text-white/10 uppercase tracking-[0.3em] text-center mb-1">
                            {day}
                        </div>
                    ))}

                    {monthData.map((day, idx) => {
                        const dayEvents = getDayEvents(day);
                        const isToday = day === new Date().getDate() &&
                            viewDate.getMonth() === new Date().getMonth() &&
                            viewDate.getFullYear() === new Date().getFullYear();

                        return (
                            <div
                                key={idx}
                                onClick={() => day && setSelectedDate(day)}
                                className={`min-h-[80px] md:min-h-[130px] p-2 md:p-4 rounded-xl md:rounded-2xl transition-all relative ${day ? 'bg-white/5 cursor-pointer hover:bg-white/10 border border-white/5 group hover:border-white/20' : 'opacity-10 pointer-events-none'}`}
                            >
                                {day && (
                                    <>
                                        <div className="flex items-center justify-between mb-1 md:mb-3">
                                            <span className={`text-[10px] md:text-sm font-black transition-colors ${isToday ? 'bg-[#00ffa3] text-black w-5 h-5 md:w-7 md:h-7 rounded-md md:rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.4)]' : 'text-white/20 group-hover:text-white'}`}>
                                                {day}
                                            </span>
                                            {dayEvents.length > 0 && (
                                                <div className="flex gap-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'SALES' ? 'bg-blue-400' : 'bg-[#00ffa3]'} shadow-[0_0_8px_currentColor] animate-pulse`} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {viewMode === 'SALES' ? (
                                                <div className="mt-4">
                                                    {formatDayRevenue(day) && (
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-[10px] font-black text-blue-400 tracking-wider text-center"
                                                        >
                                                            {formatDayRevenue(day).replace('Tsh', 'T$H')}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            ) : (
                                                dayEvents.slice(0, 2).map((e, ei) => (
                                                    <div key={ei} className="px-2 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2 overflow-hidden">
                                                        <div className={`w-1 h-3 rounded-full flex-shrink-0 bg-[#00ffa3]/40`} />
                                                        <p className="text-[8px] font-black text-white/40 truncate uppercase tracking-tighter group-hover:text-white/70 transition-colors">
                                                            {e.title}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                            {dayEvents.length > 2 && viewMode === 'ACTIVITY' && (
                                                <p className="text-[7px] font-black text-white/10 text-center uppercase tracking-[0.2em]">
                                                    +{dayEvents.length - 2} MORE EVENTS
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI Temporal Recommendation */}
            <div className="m-6 mt-0 p-6 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10 -mr-16 -mt-16" />
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 text-xl border border-blue-500/30">
                    <FontAwesomeIcon icon={faTachometerAlt} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Business Forecast</p>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">Projected Sales Peak: Next Week</h4>
                </div>
                <button className="ml-auto px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                    Run Analysis
                </button>
            </div>

            {/* Event Detail Modal (Slide Over style) */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute inset-y-0 right-0 w-full md:max-w-sm bg-[#0a0a0c] border-l border-white/10 z-[100] p-6 md:p-10 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <p className="text-[9px] font-black text-[#00ffa3] uppercase tracking-[.4em] mb-2">Daily Activity Report</p>
                                <h3 className="text-3xl font-black tracking-tighter text-white uppercase">
                                    {selectedDate} {monthNames[viewDate.getMonth()]}
                                </h3>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 hover:text-white transition-all border border-white/10">
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
                            {getDayEvents(selectedDate).length === 0 ? (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                                    <FontAwesomeIcon icon={faBoxOpen} className="text-2xl text-white/5 mb-4" />
                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">No Activity Records</p>
                                </div>
                            ) : (
                                getDayEvents(selectedDate).map((e, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10`}>
                                                {e.type}
                                            </div>
                                            <div className="text-white/20 text-[9px] font-black uppercase tracking-[0.1em]">
                                                {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <h4 className="text-base font-black text-white mb-1 group-hover:text-[#00ffa3] transition-colors uppercase tracking-tight">{e.title}</h4>
                                        <p className="text-[10px] text-white/40 font-bold leading-relaxed mb-6 line-clamp-2">{e.description}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/20 text-xs">
                                                    <FontAwesomeIcon icon={faUserCircle} />
                                                </div>
                                                <div>
                                                    <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">Recorder</p>
                                                    <p className="text-[9px] font-black text-white/60 uppercase">{e.userName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#00ffa3] text-[8px] font-black uppercase tracking-widest">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                <span>OK</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedDate(null)}
                            className="mt-8 w-full py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                        >
                            Close Details
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExecutiveCalendar;
