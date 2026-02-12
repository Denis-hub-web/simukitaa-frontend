import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaperPlane,
    faShieldHalved,
    faCircleCheck,
    faCircleXmark,
    faBell,
    faSpinner,
    faEnvelope,
    faAt,
    faHeading,
    faUsers,
    faPen,
    faCheck,
    faXmark,
    faMobileButton
} from '@fortawesome/free-solid-svg-icons';
import { notificationAPI, customerAPI } from '../utils/api';

const MessageCenter = () => {
    // Gmail Testing State
    const [testEmail, setTestEmail] = useState('');
    const [testEmailSubject, setTestEmailSubject] = useState('📊 Simukitaa Business Report');
    const [testEmailMsg, setTestEmailMsg] = useState('This is a test of the Gmail notification system. Email templates are now operational.');
    const [emailSending, setEmailSending] = useState(false);
    const [emailResult, setEmailResult] = useState('idle');

    // WhatsApp Pairing State
    const [qrCode, setQrCode] = useState('');
    const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
    const [loadingQR, setLoadingQR] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('0755855909');

    // User Management State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editEmail, setEditEmail] = useState('');
    const [savingUser, setSavingUser] = useState(false);

    // WhatsApp Manual Dispatch State
    const [testWhatsAppPhone, setTestWhatsAppPhone] = useState('0755855909');
    const [testWhatsAppMsg, setTestWhatsAppMsg] = useState('This is a test of the automated WhatsApp notification system.');
    const [waSending, setWaSending] = useState(false);
    const [waResult, setWaResult] = useState('idle');
    const [isManualOverride, setIsManualOverride] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await notificationAPI.getUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const response = await customerAPI.getAll();
            if (response.data.success) {
                setCustomers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const fetchWhatsAppStatus = async () => {
        try {
            const response = await notificationAPI.getWhatsAppStatus();
            if (response.data.success) {
                const status = response.data.data.status;
                // Map internal status to display status
                if (status === 'CONNECTED') setWhatsappStatus('connected');
                else if (status === 'WAITING_FOR_CODE' || status === 'REQUESTING_CODE') setWhatsappStatus('pairing');
                else setWhatsappStatus('disconnected');
            }
        } catch (error) {
            console.error('Failed to fetch WhatsApp status:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCustomers();
        fetchWhatsAppStatus();
        const statusPoll = setInterval(fetchWhatsAppStatus, 15000);
        return () => clearInterval(statusPoll);
    }, []);

    const fetchWhatsAppQR = async (phoneNumber) => {
        if (loadingQR) return;
        setLoadingQR(true);
        try {
            const response = await notificationAPI.requestPairingCode(phoneNumber);
            if (response.data.success && response.data.code) {
                setQrCode(response.data.code);
            }
        } catch (error) {
            console.error('Failed to fetch pairing code:', error);
            const errorMsg = error.response?.data?.message || 'Connection failure';
            alert(`Connection Error: ${errorMsg}`);
        } finally {
            setLoadingQR(false);
        }
    };

    const handleRebootWhatsApp = async () => {
        if (!window.confirm('Restart WhatsApp connection? All active sessions will be closed.')) return;
        setLoadingQR(true);
        try {
            const response = await notificationAPI.rebootWhatsApp();
            if (response.data.success) {
                alert('Restart sequence initiated. Please wait.');
                setQrCode('');
                setWhatsappStatus('disconnected');
            }
        } catch (error) {
            console.error('Reboot failed:', error);
            alert('Restart declined.');
        } finally {
            setLoadingQR(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmail) return;
        setEmailSending(true);
        setEmailResult('idle');
        try {
            await notificationAPI.sendTestEmail(testEmail, testEmailSubject, testEmailMsg);
            setEmailResult('success');
            setTimeout(() => setEmailResult('idle'), 5000);
        } catch (error) {
            setEmailResult('error');
        } finally {
            setEmailSending(false);
        }
    };

    const handleSaveEmail = async (userId) => {
        setSavingUser(true);
        try {
            const response = await notificationAPI.updateUserEmail(userId, editEmail);
            if (response.data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, email: editEmail } : u));
                setEditingUserId(null);
            }
        } catch (error) {
            console.error('Failed to update email:', error);
        } finally {
            setSavingUser(false);
        }
    };

    const handleSendTestWhatsApp = async () => {
        const targetPhone = isManualOverride ? testWhatsAppPhone : '0755855909';
        if (!targetPhone || !testWhatsAppMsg) return;
        setWaSending(true);
        setWaResult('idle');
        try {
            await notificationAPI.sendTestWhatsApp({
                phone: targetPhone,
                message: testWhatsAppMsg
            });
            setWaResult('success');
            setTimeout(() => setWaResult('idle'), 5000);
        } catch (error) {
            setWaResult('error');
        } finally {
            setWaSending(false);
        }
    };

    return (
        <div className="min-h-screen business-bg text-slate-200 p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* System Status Bar */}
                <div className="premium-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="premium-mono text-[10px] uppercase text-slate-500 font-bold">System Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${whatsappStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse'}`}></div>
                                <span className="premium-mono text-xs font-black uppercase text-white tracking-widest">
                                    {whatsappStatus === 'connected' ? 'WhatsApp Online' : 'WhatsApp Offline'}
                                </span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                        <div className="flex flex-col hidden md:flex">
                            <span className="premium-mono text-[10px] uppercase text-slate-500 font-bold">Active Personnel</span>
                            <span className="premium-mono text-[10px] uppercase text-slate-500 font-bold text-blue-400 tracking-widest">{users.length} Active Staff</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <span className="premium-mono text-[10px] uppercase text-slate-500 font-bold">Server Node</span>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{window.location.hostname}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse-glow">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 text-xs" />
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-8">
                    <div className="flex items-center gap-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 p-1 rounded-[2rem] premium-panel relative group"
                        >
                            <img src="/img/IMG_2989.jpeg" alt="Simukitaa" className="w-full h-full object-cover rounded-[1.8rem]" />
                            <div className="absolute inset-0 bg-blue-500/10 rounded-[1.8rem] group-hover:bg-transparent transition-colors"></div>
                        </motion.div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Message Center</h1>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Communication Hub v4.2</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notification System</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Control Center */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Operator Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-panel rounded-[2.5rem] overflow-hidden border border-white/5"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                        <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Staff Email Configuration</h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configure Email Notifications</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loadingUsers ? (
                                    <div className="col-span-full py-20 text-center">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500/20" />
                                    </div>
                                ) : users.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col justify-between group hover:bg-white/[0.05] transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 font-black text-lg border border-white/5">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-white text-sm">{user.name}</h3>
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${user.role === 'CEO' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                            {editingUserId !== user.id && (
                                                <button
                                                    onClick={() => { setEditingUserId(user.id); setEditEmail(user.email || ''); }}
                                                    className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    <FontAwesomeIcon icon={faPen} className="text-xs" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Email Address</label>
                                            {editingUserId === user.id ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        value={editEmail}
                                                        onChange={(e) => setEditEmail(e.target.value)}
                                                        className="flex-1 premium-input-field rounded-xl px-4 py-2 text-xs font-bold outline-none"
                                                        placeholder="operator.node@simukitaa.com"
                                                    />
                                                    <button
                                                        onClick={() => handleSaveEmail(user.id)}
                                                        disabled={savingUser}
                                                        className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                    >
                                                        <FontAwesomeIcon icon={savingUser ? faSpinner : faCheck} className={savingUser ? 'animate-spin' : ''} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUserId(null)}
                                                        className="w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center hover:bg-white/10"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-blue-500/50" />
                                                    <span className="text-xs font-bold text-slate-400 truncate">{user.email || 'NO EMAIL CONFIGURED'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* WhatsApp Pairing Hub */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="premium-panel rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                            <div className="flex flex-col md:flex-row gap-12 relative z-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                            <FontAwesomeIcon icon={faBell} className="text-white text-lg" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white tracking-tight">WhatsApp Connection</h2>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Connect automated notification system</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">1</div>
                                            <p className="text-xs font-bold text-slate-400 leading-relaxed">Ensure target device has active internet connection for the <span className="text-emerald-400">Primary Administrator Number</span>.</p>
                                        </div>
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs">2</div>
                                            <p className="text-xs font-bold text-slate-400 leading-relaxed">Navigate to <span className="text-white">Settings → Linked Devices → Link with Phone</span> on your mobile app.</p>
                                        </div>
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs">3</div>
                                            <p className="text-xs font-bold text-slate-400 leading-relaxed">Authorize access using the 8-digit point code generated below.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-80 flex flex-col gap-4">
                                    <div className="premium-panel rounded-3xl p-8 flex flex-col items-center justify-center border border-white/10 shadow-2xl bg-white/[0.02]">
                                        {whatsappStatus === 'connected' ? (
                                            <div className="text-center space-y-4">
                                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                                    <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-3xl" />
                                                </div>
                                                <h3 className="premium-mono font-black text-emerald-500 uppercase tracking-widest text-sm">Secure Connection Active</h3>
                                                <div className="text-[10px] font-black uppercase text-slate-500">Autonomous Mode: Active</div>
                                            </div>
                                        ) : qrCode ? (
                                            <div className="text-center space-y-6">
                                                <div className="p-4 bg-slate-900 rounded-2xl border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Pairing Code</div>
                                                    <div className="text-4xl font-black text-white tracking-widest premium-mono">{qrCode}</div>
                                                </div>
                                                <div className="flex items-center gap-2 justify-center text-[10px] font-black uppercase text-amber-500 animate-pulse">
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                    <span>Waiting for Authorization</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full space-y-6">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                                                        <FontAwesomeIcon icon={faMobileButton} className="text-blue-500 text-xl" />
                                                    </div>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Status: Offline</h3>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Ready for Connection</p>
                                                </div>
                                                <button
                                                    onClick={() => fetchWhatsAppQR(phoneNumber)}
                                                    disabled={loadingQR}
                                                    className="w-full h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase tracking-[0.15em] text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
                                                >
                                                    {loadingQR ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                            Connecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faPaperPlane} />
                                                            Connect WhatsApp
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleRebootWhatsApp}
                                                    className="w-full py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faSpinner} className={loadingQR ? 'animate-spin' : ''} />
                                                    Restart Process
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Side Dashboard Indicators */}
                    <div className="lg:col-span-4 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Gmail Dispatch Console */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="premium-panel p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </div>
                                    <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 text-accent-blue">Email Test Console</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Receiver Address</label>
                                        <div className="relative">
                                            <FontAwesomeIcon icon={faAt} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]" />
                                            <input
                                                type="email"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                className="w-full premium-input-field pl-10 pr-4 py-3 rounded-xl text-xs font-bold"
                                                placeholder="operator.node@network.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Email Subject</label>
                                        <input
                                            type="text"
                                            value={testEmailSubject}
                                            onChange={(e) => setTestEmailSubject(e.target.value)}
                                            className="w-full premium-input-field px-4 py-3 rounded-xl text-xs font-black tracking-tight"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Message Body</label>
                                        <textarea
                                            rows="3"
                                            value={testEmailMsg}
                                            onChange={(e) => setTestEmailMsg(e.target.value)}
                                            className="w-full premium-input-field px-4 py-3 rounded-xl text-xs font-medium leading-relaxed resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSendTestEmail}
                                        disabled={emailSending || !testEmail}
                                        className={`w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${emailSending ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900 hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={emailSending ? faSpinner : faPaperPlane} className={emailSending ? 'animate-spin' : ''} />
                                        {emailSending ? 'Sending...' : 'Send Test Email'}
                                    </button>

                                    <AnimatePresence>
                                        {emailResult !== 'idle' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className={`text-center py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${emailResult === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={emailResult === 'success' ? faCircleCheck : faCircleXmark} />
                                                {emailResult === 'success' ? 'Email Sent Successfully' : 'Email Failed to Send'}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            {/* WhatsApp Dispatch Console */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="premium-panel p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                        <FontAwesomeIcon icon={faBell} />
                                    </div>
                                    <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 text-accent-emerald">WhatsApp Test Console</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Configuration</label>
                                        <button
                                            onClick={() => setIsManualOverride(!isManualOverride)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all text-[8px] font-black uppercase tracking-widest ${isManualOverride
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                : 'bg-white/5 text-slate-500 border-white/5'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faShieldHalved} className={isManualOverride ? 'text-blue-400' : 'text-slate-600'} />
                                            Manual Override
                                        </button>
                                    </div>

                                    {!isManualOverride ? (
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Target Number</label>
                                                <div className="text-xs font-black text-emerald-400 uppercase tracking-tight">Main Admin Number</div>
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                                Verified
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Customer Selection</label>
                                                <select
                                                    onChange={(e) => setTestWhatsAppPhone(e.target.value)}
                                                    className="w-full premium-input-field px-4 py-3 rounded-xl text-xs font-bold"
                                                >
                                                    <option value="">-- Select Target from CRM --</option>
                                                    {customers.map(customer => (
                                                        <option key={customer.id} value={customer.phone}>
                                                            {customer.name} ({customer.phone})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Manual Node Identity</label>
                                                <div className="relative">
                                                    <FontAwesomeIcon icon={faMobileButton} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]" />
                                                    <input
                                                        type="text"
                                                        value={testWhatsAppPhone}
                                                        onChange={(e) => setTestWhatsAppPhone(e.target.value)}
                                                        className="w-full premium-input-field pl-10 pr-4 py-3 rounded-xl text-xs font-bold"
                                                        placeholder="255..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Message Content</label>
                                        <textarea
                                            rows="4"
                                            value={testWhatsAppMsg}
                                            onChange={(e) => setTestWhatsAppMsg(e.target.value)}
                                            className="w-full premium-input-field px-4 py-3 rounded-xl text-xs font-medium leading-relaxed resize-none"
                                            placeholder="Enter automated transmission data..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleSendTestWhatsApp}
                                        disabled={waSending}
                                        className={`w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${waSending ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={waSending ? faSpinner : faPaperPlane} className={waSending ? 'animate-spin' : ''} />
                                        {waSending ? 'Sending...' : 'Send Test WhatsApp'}
                                    </button>

                                    <AnimatePresence>
                                        {waResult !== 'idle' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className={`text-center py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${waResult === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={waResult === 'success' ? faCircleCheck : faCircleXmark} />
                                                {waResult === 'success' ? 'WhatsApp Sent Successfully' : 'WhatsApp Failed to Send'}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>

                        {/* Automated Systems Workflows */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="premium-panel p-8 rounded-[2.5rem] border border-white/5 space-y-6"
                        >
                            <h2 className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-500">Active Workflows</h2>
                            <div className="space-y-4">
                                {[
                                    { icon: faShieldHalved, label: 'Delivery Verification', active: true, color: 'blue' },
                                    { icon: faBell, label: 'Revenue Analytics', active: true, color: 'emerald' },
                                    { icon: faSpinner, label: 'Stock Monitor', active: false, color: 'slate' }
                                ].map((workflow, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg bg-${workflow.color}-500/10 text-${workflow.color}-500 flex items-center justify-center text-[10px]`}>
                                                <FontAwesomeIcon icon={workflow.icon} className={workflow.label === 'Stock Monitor' ? 'animate-spin' : ''} />
                                            </div>
                                            <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">{workflow.label}</span>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${workflow.active ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageCenter;
