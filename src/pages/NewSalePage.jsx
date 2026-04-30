import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, ArrowLeftRight, Ban, Barcode, Camera,
    CheckCircle2, CreditCard, Search, Smartphone, Truck, User,
    X, Repeat2, Sparkles, ShoppingCart, Package, Zap
} from 'lucide-react';
import axios from 'axios';
import api, { customerAPI, salesAPI, paymentAPI, API_URL } from '../utils/api';
import TradeInForm from '../components/TradeInForm';
import SerialScannerModal from '../components/SerialScannerModal';

/* ─────────── Design Tokens (inlined so file is self-contained) ─────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --bg:       #080b12;
  --surface:  #0e1320;
  --card:     #131929;
  --border:   rgba(255,255,255,0.06);
  --border-active: rgba(99,179,237,0.5);
  --text-1:   #f0f4ff;
  --text-2:   #8b9ab5;
  --text-3:   #4a5578;
  --accent:   #4f8ef7;
  --accent-2: #8b5cf6;
  --green:    #34d399;
  --orange:   #fb923c;
  --red:      #f87171;
  --gold:     #fbbf24;
  --glow:     rgba(79,142,247,0.15);
  --glow-strong: rgba(79,142,247,0.35);
}

.ns-root {
  font-family: 'Syne', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--text-1);
  position: relative;
  overflow-x: hidden;
}

/* Ambient background orbs */
.ns-root::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 60% 40% at 15% 20%, rgba(79,142,247,0.07) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 85% 75%, rgba(139,92,246,0.06) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 50% 50%, rgba(52,211,153,0.03) 0%, transparent 70%);
}

/* ── Cards ── */
.ns-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}
.ns-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
}

.ns-glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
}

/* ── Step Pill ── */
.step-pill {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  cursor: default;
}
.step-pill.active {
  background: var(--accent);
  border-color: transparent;
  box-shadow: 0 0 24px rgba(79,142,247,0.5), 0 0 8px rgba(79,142,247,0.3);
  transform: scale(1.15);
}
.step-pill.done {
  background: rgba(52,211,153,0.15);
  border-color: rgba(52,211,153,0.3);
  cursor: pointer;
}
.step-connector {
  flex: 1; height: 1px;
  background: var(--border);
  margin: 0 6px;
  position: relative; overflow: hidden;
}
.step-connector.done::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, var(--green), rgba(52,211,153,0.4));
  animation: fillLine 0.5s ease forwards;
}
@keyframes fillLine { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); } }

/* ── Input ── */
.ns-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 18px;
  color: var(--text-1);
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  outline: none;
}
.ns-input:focus {
  border-color: var(--accent);
  background: rgba(79,142,247,0.05);
  box-shadow: 0 0 0 3px rgba(79,142,247,0.12);
}
.ns-input::placeholder { color: var(--text-3); }

.ns-input-icon-wrap { position: relative; }
.ns-input-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--text-3); pointer-events: none; transition: color 0.2s;
}
.ns-input-icon-wrap:focus-within .ns-input-icon { color: var(--accent); }
.ns-input-icon-wrap .ns-input { padding-left: 48px; }

/* ── Buttons ── */
.ns-btn-primary {
  background: var(--accent);
  color: #fff;
  border: none; border-radius: 14px;
  padding: 14px 28px;
  font-family: 'Syne', sans-serif;
  font-weight: 700; font-size: 13px;
  letter-spacing: 0.04em; text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 8px; justify-content: center;
  box-shadow: 0 4px 20px rgba(79,142,247,0.35);
}
.ns-btn-primary:hover { background: #6fa3fa; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(79,142,247,0.45); }
.ns-btn-primary:active { transform: translateY(0); }
.ns-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }

.ns-btn-ghost {
  background: rgba(255,255,255,0.04);
  color: var(--text-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 24px;
  font-family: 'Syne', sans-serif;
  font-weight: 700; font-size: 13px;
  letter-spacing: 0.04em; text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.ns-btn-ghost:hover { background: rgba(255,255,255,0.08); color: var(--text-1); border-color: rgba(255,255,255,0.12); }

.ns-btn-dark {
  background: rgba(255,255,255,0.08);
  color: var(--text-1);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 28px;
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 12px;
  letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.ns-btn-dark:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }

/* ── Customer Card ── */
.customer-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 14px;
  text-align: left;
}
.customer-card:hover { background: rgba(79,142,247,0.06); border-color: rgba(79,142,247,0.2); transform: translateY(-1px); }
.customer-card.selected { background: rgba(79,142,247,0.1); border-color: var(--accent); box-shadow: 0 0 20px rgba(79,142,247,0.15); }
.customer-avatar {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--text-3);
  border: 1px solid var(--border);
}

/* ── Device Card ── */
.device-found-card {
  background: linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(79,142,247,0.05) 100%);
  border: 1px solid rgba(52,211,153,0.2);
  border-radius: 20px; padding: 20px;
}

/* ── Cart Item ── */
.cart-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 14px; padding: 14px;
  transition: all 0.2s;
}
.cart-item:hover { border-color: rgba(255,255,255,0.1); }

/* ── Suggestion Dropdown ── */
.suggestions-drop {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 200;
  background: #111827;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.1);
  max-height: 380px; overflow-y: auto;
}
.suggestions-drop::-webkit-scrollbar { width: 4px; }
.suggestions-drop::-webkit-scrollbar-track { background: transparent; }
.suggestions-drop::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.suggestion-item {
  display: flex; align-items: start; gap: 12px;
  padding: 14px 16px; cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  width: 100%; text-align: left;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: rgba(79,142,247,0.08); }

.suggestion-section-label {
  padding: 8px 16px;
  font-size: 9px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--accent); background: rgba(79,142,247,0.06);
  border-bottom: 1px solid rgba(79,142,247,0.1);
}
.suggestion-section-label.purple { color: var(--accent-2); background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.1); }

/* ── Payment Method ── */
.payment-method-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 14px; padding: 14px;
  cursor: pointer; transition: all 0.2s; text-align: left;
}
.payment-method-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(79,142,247,0.2); }
.payment-method-btn.selected { background: rgba(79,142,247,0.1); border-color: var(--accent); box-shadow: 0 0 16px rgba(79,142,247,0.12); }
.pm-icon { width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; border: 1px solid var(--border); transition: all 0.2s; }
.payment-method-btn.selected .pm-icon { background: var(--accent); border-color: transparent; }

/* ── Summary Panel ── */
.summary-panel {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 20px; padding: 20px;
}

/* ── Price row ── */
.price-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.price-row .label { color: var(--text-2); font-weight: 600; }
.price-row .val { color: var(--text-1); font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.price-row.total .label { color: var(--text-1); font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
.price-row.total .val { color: var(--text-1); font-size: 22px; font-weight: 700; }

/* ── Toggle ── */
.ns-toggle-group {
  display: flex; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; border: 1px solid var(--border);
}
.ns-toggle-btn {
  flex: 1; padding: 8px 16px; border-radius: 9px; border: none;
  background: transparent; color: var(--text-3);
  font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  cursor: pointer; transition: all 0.2s;
}
.ns-toggle-btn.active {
  background: rgba(79,142,247,0.15); color: var(--accent);
  box-shadow: 0 0 0 1px rgba(79,142,247,0.3);
}

/* ── Loading Overlay ── */
.ns-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(8,11,18,0.9);
  backdrop-filter: blur(24px);
  display: flex; align-items: center; justify-content: center;
}
.loading-orb {
  width: 110px; height: 110px; border-radius: 28px;
  background: rgba(79,142,247,0.1);
  border: 1px solid rgba(79,142,247,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 52px;
  box-shadow: 0 0 60px rgba(79,142,247,0.2), inset 0 0 40px rgba(79,142,247,0.05);
}

/* ── Review badge ── */
.review-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.05); border: 1px solid var(--border);
  border-radius: 8px; padding: 4px 10px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-2);
}

/* ── Scrollbar global ── */
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

/* ── Animations ── */
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(79,142,247,0.3); }
  50% { box-shadow: 0 0 40px rgba(79,142,247,0.6), 0 0 80px rgba(79,142,247,0.2); }
}
@keyframes floatUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spinIn { from { opacity: 0; transform: rotate(-15deg) scale(0.8); } to { opacity: 1; transform: rotate(0deg) scale(1); } }

.animate-float { animation: floatUp 0.4s ease forwards; }
.animate-spin-in { animation: spinIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }

/* ── Mobile bottom nav ── */
.mobile-nav-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  padding: 12px 16px 24px;
  background: linear-gradient(to top, rgba(8,11,18,1) 60%, transparent);
  display: grid; grid-template-columns: 1fr 2fr; gap: 10px;
}

/* ── Header ── */
.ns-header {
  font-family: 'Clash Display', sans-serif;
  font-size: clamp(22px, 4vw, 34px);
  font-weight: 600;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text-1) 0%, rgba(240,244,255,0.6) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.ns-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-3);
}

/* ── Trade-in choice ── */
.tradein-choice {
  background: rgba(255,255,255,0.03); border: 1px solid var(--border);
  border-radius: 18px; padding: 24px; cursor: pointer;
  transition: all 0.25s; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.tradein-choice:hover { transform: translateY(-3px); }
.tradein-choice.active-red { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.3); box-shadow: 0 0 24px rgba(248,113,113,0.1); }
.tradein-choice.active-orange { background: rgba(251,146,60,0.1); border-color: rgba(251,146,60,0.3); box-shadow: 0 0 24px rgba(251,146,60,0.1); }

/* ── Step title area ── */
.step-section-title {
  font-family: 'Clash Display', sans-serif;
  font-size: 20px; font-weight: 600; color: var(--text-1);
  letter-spacing: -0.02em;
}

/* ── Select ── */
.ns-select {
  background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: 14px; padding: 12px 16px;
  color: var(--text-1); font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
  text-transform: uppercase; letter-spacing: 0.05em;
  outline: none; cursor: pointer;
}
.ns-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
.ns-select option { background: #1a2035; }

/* responsive */
@media (max-width: 640px) {
  .ns-card { border-radius: 16px; }
  .hide-mobile { display: none !important; }
}
@media (min-width: 1024px) {
  .show-mobile-only { display: none !important; }
}
`;

/* ─────────── constants ─────────── */
const SALE_STEPS = [
    { icon: '📦', text: 'Packaging device...' },
    { icon: '🧾', text: 'Generating receipt...' },
    { icon: '💾', text: 'Saving to records...' },
    { icon: '📊', text: 'Updating inventory...' },
    { icon: '💬', text: 'Sending WhatsApp receipt...' },
    { icon: '✅', text: 'Finalising transfer...' },
];

const STEP_META = [
    { icon: User, title: 'Customer', color: '#4f8ef7' },
    { icon: Barcode, title: 'Products', color: '#8b5cf6' },
    { icon: Repeat2, title: 'Trade-In', color: '#fb923c' },
    { icon: CreditCard, title: 'Payment', color: '#34d399' },
    { icon: CheckCircle2, title: 'Review', color: '#fbbf24' },
];

/* ─────────── helpers ─────────── */
const normalizeDiscountType = (t) => {
    const v = String(t || '').toUpperCase();
    if (v === 'PERCENT' || v === 'PERCENTAGE') return 'PERCENT';
    if (v === 'AMOUNT' || v === 'FIXED') return 'AMOUNT';
    return '';
};
const computeDiscountAmount = ({ baseAmount, discountType, discountValue }) => {
    const t = normalizeDiscountType(discountType);
    const val = parseFloat(discountValue);
    const base = parseFloat(baseAmount);
    if (!t || !Number.isFinite(val) || val <= 0) return 0;
    if (!Number.isFinite(base) || base <= 0) return 0;
    if (t === 'PERCENT') return Math.max(0, Math.min(base, (base * val) / 100));
    return Math.max(0, Math.min(base, val));
};

/* ─────────── main component ─────────── */
const NewSalePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const [formData, setFormData] = useState({
        customerId: '', customerName: '', customerPhone: '', isNewCustomer: false,
        serialNumber: '', productId: '', productName: '', deviceId: '',
        condition: '', sellingPrice: 0, paymentMethod: 'CASH', amountPaid: '',
        receiptMode: 'SINGLE', invoiceDiscountType: 'AMOUNT', invoiceDiscountValue: '',
        tradeInId: '', tradeInValue: 0, tradeInDeviceName: '', tradeInSerialNumber: '',
        isRegional: false, approximateDays: '3-5', hasTradeIn: false, customPaymentMethod: ''
    });

    const [cartItems, setCartItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchSerial, setSearchSerial] = useState('');
    const [foundDevice, setFoundDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showTradeInForm, setShowTradeInForm] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState(['CASH', 'M-PESA', 'TIGOPESA', 'AIRTEL_MONEY', 'HALOPESA', 'BANK']);

    const loadingStepRef = useRef(0);
    const searchDebounceRef = useRef(null);
    const searchAbortRef = useRef(null);

    /* inject CSS once */
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        if (!loading) { loadingStepRef.current = 0; setLoadingStep(0); return; }
        const interval = setInterval(() => {
            loadingStepRef.current = (loadingStepRef.current + 1) % SALE_STEPS.length;
            setLoadingStep(loadingStepRef.current);
        }, 1400);
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => { loadCustomers(); loadPaymentMethods(); }, []);

    const loadPaymentMethods = async () => {
        try {
            const r = await paymentAPI.getMethods();
            if (r.data.success) setPaymentMethods(r.data.data.methods);
        } catch {}
    };
    const loadCustomers = async () => {
        try {
            const r = await customerAPI.getAll();
            setCustomers(r.data.data.customers || []);
        } catch {}
    };

    const handleUnifiedSearch = useCallback((query) => {
        setSearchSerial(query);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        if (query.length < 2) { setSuggestions([]); setProductSuggestions([]); setSearching(false); return; }
        setSearching(true);
        searchDebounceRef.current = setTimeout(async () => {
            if (searchAbortRef.current) searchAbortRef.current.abort();
            const controller = new AbortController();
            searchAbortRef.current = controller;
            try {
                const response = await api.get(`/stock/products`, { signal: controller.signal });
                const products = response.data.data || [];
                const fp = products.filter(p =>
                    (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
                    (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
                    (p.model && p.model.toLowerCase().includes(query.toLowerCase()))
                );
                setProductSuggestions(fp);
                if (query.length >= 3) {
                    const dm = [];
                    products.forEach(product => {
                        if (product.devices && Array.isArray(product.devices)) {
                            product.devices.forEach(device => {
                                if (device.status === 'available' && device.serialNumber &&
                                    device.serialNumber.toUpperCase().includes(query.toUpperCase())) {
                                    dm.push({ product, device, price: device.price || product.basePricing?.[device.condition] || 0, condition: device.condition });
                                }
                            });
                        }
                    });
                    setSuggestions(dm);
                } else { setSuggestions([]); }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') console.error('Search error:', err);
            } finally { setSearching(false); }
        }, 300);
    }, []);

    const handleSelectSimpleProduct = (product) => {
        setFoundDevice({ product, device: { id: null, status: 'available' }, price: product.basePricing?.nonActive || 0, condition: 'nonActive' });
        setFormData(f => ({ ...f, serialNumber: 'N/A', productId: product.id, productName: `${product.brand} ${product.name}`, deviceId: '', condition: 'nonActive', sellingPrice: product.basePricing?.nonActive || 0 }));
        setProductSuggestions([]); setSuggestions([]);
        setSearchSerial(`${product.brand} ${product.name}`);
    };
    const handleSelectDevice = (match) => {
        setFoundDevice(match);
        setFormData(f => ({ ...f, serialNumber: match.device.serialNumber, productId: match.product.id, productName: `${match.product.brand} ${match.product.name}`, deviceId: match.device.id, condition: match.device.condition, sellingPrice: match.device.price, supplierId: match.device.supplierId, supplierName: match.device.supplierName }));
        setSuggestions([]); setProductSuggestions([]);
        setSearchSerial(match.device.serialNumber);
    };

    const addSelectedToCart = () => {
        if (!foundDevice) return;
        const productId = formData.productId;
        const deviceId = formData.deviceId || null;
        const key = `${productId}__${deviceId || 'no_device'}__${formData.condition || ''}`;
        setCartItems(prev => {
            const existingIndex = prev.findIndex(i => i.key === key);
            const trackSerials = foundDevice?.product?.trackSerials !== false;
            if (trackSerials && existingIndex !== -1) return prev;
            const newItem = { key, productId, productName: formData.productName || `${foundDevice.product?.brand || ''} ${foundDevice.product?.name || ''}`.trim(), deviceId, serialNumber: formData.serialNumber || '', condition: formData.condition || '', sellingPrice: parseFloat(formData.sellingPrice) || 0, quantity: 1, discountType: '', discountValue: '' };
            if (existingIndex !== -1) {
                const next = [...prev];
                next[existingIndex] = { ...next[existingIndex], quantity: (parseInt(next[existingIndex].quantity) || 1) + 1 };
                return next;
            }
            return [...prev, newItem];
        });
        setFoundDevice(null); setSearchSerial('');
        setFormData(f => ({ ...f, serialNumber: '', productId: '', productName: '', deviceId: '', condition: '', sellingPrice: 0, supplierId: '', supplierName: '' }));
    };

    const updateCartItem = (key, patch) => setCartItems(prev => prev.map(i => i.key === key ? { ...i, ...patch } : i));
    const removeCartItem = (key) => setCartItems(prev => prev.filter(i => i.key !== key));

    const cartTotals = (() => {
        const items = cartItems.map(i => {
            const qty = Math.max(1, parseInt(i.quantity) || 1);
            const unit = parseFloat(i.sellingPrice) || 0;
            const itemDiscPerUnit = computeDiscountAmount({ baseAmount: unit, discountType: i.discountType, discountValue: i.discountValue });
            const unitFinal = Math.max(0, unit - itemDiscPerUnit);
            return { ...i, quantity: qty, originalUnitPrice: unit, itemDiscountAmount: itemDiscPerUnit, finalUnitPrice: unitFinal, lineBase: unit * qty, lineItemDiscount: itemDiscPerUnit * qty, lineTotalAfterItemDiscount: unitFinal * qty };
        });
        const subtotalOriginal = items.reduce((s, i) => s + i.lineBase, 0);
        const itemDiscountTotal = items.reduce((s, i) => s + i.lineItemDiscount, 0);
        const subtotalAfterItemDiscount = items.reduce((s, i) => s + i.lineTotalAfterItemDiscount, 0);
        const invoiceDiscountAmount = Math.max(0, Math.min(subtotalAfterItemDiscount, computeDiscountAmount({ baseAmount: subtotalAfterItemDiscount, discountType: formData.invoiceDiscountType, discountValue: formData.invoiceDiscountValue })));
        const totalAfterInvoiceDiscount = Math.max(0, subtotalAfterItemDiscount - invoiceDiscountAmount);
        const netPayable = Math.max(0, totalAfterInvoiceDiscount - (parseFloat(formData.tradeInValue) || 0));
        const paid = parseFloat(formData.amountPaid || 0) || 0;
        const balance = paid - netPayable;
        return { items, subtotalOriginal, itemDiscountTotal, subtotalAfterItemDiscount, invoiceDiscountAmount, totalAfterInvoiceDiscount, netPayable, paid, balance };
    })();

    const handleNext = () => currentStep < totalSteps && setCurrentStep(s => s + 1);
    const handleBack = () => currentStep > 1 && setCurrentStep(s => s - 1);

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                if (formData.isNewCustomer) {
                    const isDup = customers.some(c => c.phone === formData.customerPhone);
                    return formData.customerName.trim() !== '' && formData.customerPhone.trim() !== '' && !isDup;
                }
                return formData.customerId !== '';
            case 2: return cartItems.length > 0;
            case 3: return true;
            case 4: return !!(formData.paymentMethod && formData.amountPaid);
            case 5: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const paymentMethod = formData.paymentMethod === 'CUSTOM' ? formData.customPaymentMethod : formData.paymentMethod;
            const paid = parseFloat(formData.amountPaid) || 0;
            if (formData.receiptMode === 'SEPARATE') {
                const baseForSplit = cartTotals.subtotalAfterItemDiscount || 0;
                const totalInvoiceDiscount = cartTotals.invoiceDiscountAmount || 0;
                const split = cartTotals.items.map(i => {
                    const ratio = baseForSplit > 0 ? (i.lineTotalAfterItemDiscount / baseForSplit) : 0;
                    return { item: i, invoiceDiscountShare: Math.max(0, totalInvoiceDiscount * ratio) };
                });
                const netPerReceipt = split.map(s => ({ ...s, net: Math.max(0, s.item.lineTotalAfterItemDiscount - s.invoiceDiscountShare) }));
                const totalNet = netPerReceipt.reduce((sum, x) => sum + x.net, 0);
                for (const part of netPerReceipt) {
                    const paidShare = totalNet > 0 ? (paid * (part.net / totalNet)) : 0;
                    await salesAPI.create({ customerId: formData.isNewCustomer ? null : formData.customerId, customerName: formData.customerName, customerPhone: formData.customerPhone, isNewCustomer: formData.isNewCustomer, paymentMethod, amountPaid: paidShare, discountAmount: part.invoiceDiscountShare, discountNote: 'Invoice discount split across separate receipts', items: [{ productId: part.item.productId, deviceId: part.item.deviceId, quantity: part.item.quantity, sellingPrice: part.item.originalUnitPrice, discountType: part.item.discountType, discountValue: part.item.discountValue }], tradeInId: formData.tradeInId || null, isRegional: formData.isRegional || false, approximateDays: formData.approximateDays || '3-5' });
                }
            } else {
                await salesAPI.create({ customerId: formData.isNewCustomer ? null : formData.customerId, customerName: formData.customerName, customerPhone: formData.customerPhone, isNewCustomer: formData.isNewCustomer, paymentMethod, amountPaid: paid, invoiceDiscountType: formData.invoiceDiscountType, invoiceDiscountValue: formData.invoiceDiscountValue, discountAmount: cartTotals.invoiceDiscountAmount, items: cartTotals.items.map(i => ({ productId: i.productId, deviceId: i.deviceId, quantity: i.quantity, sellingPrice: i.originalUnitPrice, discountType: i.discountType, discountValue: i.discountValue })), tradeInId: formData.tradeInId || null, isRegional: formData.isRegional || false, approximateDays: formData.approximateDays || '3-5' });
            }
            alert('✅ Sale completed successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create sale');
        } finally { setLoading(false); }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.phone.includes(searchCustomer)
    );

    /* ── step variants ── */
    const stepVariants = {
        enter: { opacity: 0, y: 24, scale: 0.98 },
        center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, y: -16, scale: 1.01, transition: { duration: 0.22 } }
    };

    /* ── render ── */
    return (
        <div className="ns-root" style={{ paddingBottom: 100 }}>
            {/* ── Loading Overlay ── */}
            <AnimatePresence>
                {loading && (
                    <motion.div className="ns-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, maxWidth: 320, width: '100%', padding: '0 24px', textAlign: 'center' }}>
                            {/* top ambient glow */}
                            <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={loadingStep}
                                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                                    exit={{ scale: 1.3, opacity: 0, transition: { duration: 0.25 } }}
                                    className="loading-orb"
                                    style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
                                >
                                    {SALE_STEPS[loadingStep].icon}
                                </motion.div>
                            </AnimatePresence>
                            <div>
                                <p className="ns-label" style={{ marginBottom: 8, color: 'var(--accent)' }}>Processing Sale</p>
                                <AnimatePresence mode="wait">
                                    <motion.h2
                                        key={`t-${loadingStep}`}
                                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                                        style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 24, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}
                                    >
                                        {SALE_STEPS[loadingStep].text}
                                    </motion.h2>
                                </AnimatePresence>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {SALE_STEPS.map((_, i) => (
                                    <motion.div key={i} animate={{ width: i === loadingStep ? 28 : 8, opacity: i === loadingStep ? 1 : 0.3 }}
                                        style={{ height: 4, borderRadius: 2, background: 'var(--accent)' }} transition={{ duration: 0.3 }} />
                                ))}
                            </div>
                            <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                                <motion.div animate={{ width: `${((loadingStep + 1) / SALE_STEPS.length) * 100}%` }}
                                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', borderRadius: 1 }} />
                            </div>
                            <p className="ns-label" style={{ color: 'var(--text-3)', marginTop: -16 }}>Please wait — do not close this page</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 1 }}>

                {/* ── PAGE HEADER ── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '32px 0 28px' }}>
                    <button onClick={() => navigate('/dashboard')} className="ns-btn-ghost"
                        style={{ padding: '10px 14px', borderRadius: 12, minWidth: 'auto', flexShrink: 0 }}>
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                    </button>
                    <div>
                        <div className="ns-label" style={{ marginBottom: 4, color: 'var(--accent)' }}>POS System</div>
                        <h1 className="ns-header">Register New Sale</h1>
                    </div>
                    {/* Cart badge (mobile) */}
                    {cartItems.length > 0 && (
                        <div className="show-mobile-only" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 12, padding: '8px 14px' }}>
                            <ShoppingCart style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{cartItems.length}</span>
                        </div>
                    )}
                </motion.div>

                {/* ── STEP PROGRESS ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'center', marginBottom: 32, padding: '0 4px' }}>
                    {STEP_META.map((meta, idx) => {
                        const stepNo = idx + 1;
                        const isActive = stepNo === currentStep;
                        const isDone = stepNo < currentStep;
                        const Icon = meta.icon;
                        return (
                            <div key={stepNo} style={{ display: 'flex', alignItems: 'center', flex: stepNo < 5 ? 1 : 'none' }}>
                                <button type="button" onClick={() => isDone && setCurrentStep(stepNo)}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, background: 'none', border: 'none', cursor: isDone ? 'pointer' : 'default' }}>
                                    <div className={`step-pill ${isActive ? 'active' : isDone ? 'done' : ''}`}
                                        style={isActive ? { background: meta.color, boxShadow: `0 0 24px ${meta.color}60` } : isDone ? { background: `${meta.color}20`, borderColor: `${meta.color}40` } : {}}>
                                        {isDone
                                            ? <CheckCircle2 style={{ width: 16, height: 16, color: meta.color }} />
                                            : <Icon style={{ width: 15, height: 15, color: isActive ? '#fff' : 'var(--text-3)' }} />}
                                    </div>
                                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: isActive ? meta.color : isDone ? `${meta.color}80` : 'var(--text-3)' }} className="hide-mobile">
                                        {meta.title}
                                    </span>
                                </button>
                                {stepNo < 5 && (
                                    <div className={`step-connector ${isDone ? 'done' : ''}`}
                                        style={{ '--fill-color': meta.color }} />
                                )}
                            </div>
                        );
                    })}
                </motion.div>

                {/* ── TWO-COL LAYOUT ── */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

                    {/* MAIN CONTENT */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <AnimatePresence mode="wait">

                            {/* ═══════════════════════════════ STEP 1 ═══════════════════════════════ */}
                            {currentStep === 1 && (
                                <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit">
                                    <div className="ns-card" style={{ padding: '28px 24px' }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <User style={{ width: 20, height: 20, color: 'var(--accent)' }} />
                                            </div>
                                            <div>
                                                <p className="step-section-title">Customer</p>
                                                <p className="ns-label" style={{ marginTop: 2, color: 'var(--text-3)' }}>Select existing or add new</p>
                                            </div>
                                        </div>

                                        {/* Toggle */}
                                        <div className="ns-toggle-group" style={{ marginBottom: 20 }}>
                                            <button className={`ns-toggle-btn ${!formData.isNewCustomer ? 'active' : ''}`}
                                                onClick={() => setFormData(f => ({ ...f, isNewCustomer: false, customerId: '', customerName: '', customerPhone: '' }))}>
                                                Search Existing
                                            </button>
                                            <button className={`ns-toggle-btn ${formData.isNewCustomer ? 'active' : ''}`}
                                                onClick={() => setFormData(f => ({ ...f, isNewCustomer: true, customerId: '', customerName: '', customerPhone: '' }))}>
                                                + New Customer
                                            </button>
                                        </div>

                                        {!formData.isNewCustomer ? (
                                            <>
                                                <div className="ns-input-icon-wrap" style={{ marginBottom: 16 }}>
                                                    <Search className="ns-input-icon" style={{ width: 18, height: 18 }} />
                                                    <input type="text" value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)}
                                                        placeholder="Search by name or phone..." className="ns-input" autoFocus />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
                                                    {filteredCustomers.slice(0, 12).map((c, idx) => (
                                                        <motion.button key={c.id} className={`customer-card ${formData.customerId === c.id ? 'selected' : ''}`}
                                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                                                            onClick={() => { setFormData(f => ({ ...f, customerId: c.id, customerName: c.name, customerPhone: c.phone, isNewCustomer: false })); setSearchCustomer(''); handleNext(); }}>
                                                            <div className="customer-avatar">
                                                                <User style={{ width: 18, height: 18 }} />
                                                            </div>
                                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{c.phone}</div>
                                                            </div>
                                                            {formData.customerId === c.id && <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--accent)', flexShrink: 0 }} />}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div>
                                                    <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Full Name</label>
                                                    <input type="text" value={formData.customerName}
                                                        onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))}
                                                        placeholder="Enter customer name..." className="ns-input" autoFocus />
                                                </div>
                                                <div>
                                                    <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Phone Number</label>
                                                    <input type="text" value={formData.customerPhone}
                                                        onChange={e => setFormData(f => ({ ...f, customerPhone: e.target.value }))}
                                                        placeholder="e.g. 0712345678"
                                                        className="ns-input"
                                                        style={customers.some(c => c.phone === formData.customerPhone) ? { borderColor: 'var(--red)' } : {}} />
                                                    {formData.customerPhone && customers.some(c => c.phone === formData.customerPhone) && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                            style={{ color: 'var(--red)', fontSize: 11, fontWeight: 700, marginTop: 6, letterSpacing: '0.05em' }}>
                                                            ⚠️ This phone number is already registered
                                                        </motion.p>
                                                    )}
                                                </div>
                                                <button className="ns-btn-primary" onClick={handleNext}
                                                    disabled={!formData.customerName || !formData.customerPhone || customers.some(c => c.phone === formData.customerPhone)}
                                                    style={{ marginTop: 8 }}>
                                                    Continue <ArrowRight style={{ width: 16, height: 16 }} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════════════════════════════ STEP 2 ═══════════════════════════════ */}
                            {currentStep === 2 && (
                                <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit">
                                    <div className="ns-card" style={{ padding: '28px 24px', overflow: 'visible' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Barcode style={{ width: 20, height: 20, color: 'var(--accent-2)' }} />
                                            </div>
                                            <div>
                                                <p className="step-section-title">Product Selection</p>
                                                <p className="ns-label" style={{ marginTop: 2, color: 'var(--text-3)' }}>Search by name or scan serial number</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
                                            {/* Search col */}
                                            <div style={{ flex: cartItems.length > 0 ? '1 1 55%' : '1', minWidth: 0, position: 'relative', zIndex: 10 }}>
                                                {/* Search bar */}
                                                <div className="ns-input-icon-wrap" style={{ position: 'relative', marginBottom: 20 }}>
                                                    <Search className="ns-input-icon" style={{ width: 18, height: 18 }} />
                                                    <input type="text" value={searchSerial} onChange={e => handleUnifiedSearch(e.target.value)}
                                                        placeholder="Product name or serial..." className="ns-input"
                                                        style={{ paddingRight: 100, textTransform: 'uppercase' }} autoFocus />
                                                    {searching && (
                                                        <div style={{ position: 'absolute', right: 90, top: '50%', transform: 'translateY(-50%)' }}>
                                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                                style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)' }} />
                                                        </div>
                                                    )}
                                                    <button onClick={() => setShowScannerModal(true)}
                                                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                                                        <Camera style={{ width: 14, height: 14 }} /> Scan
                                                    </button>

                                                    {/* Suggestions dropdown */}
                                                    <AnimatePresence>
                                                        {(suggestions.length > 0 || productSuggestions.length > 0) && (
                                                            <motion.div className="suggestions-drop"
                                                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -8, scale: 0.98 }}>
                                                                {suggestions.length > 0 && (
                                                                    <>
                                                                        <div className="suggestion-section-label">📡 Matched by Serial</div>
                                                                        {suggestions.map(match => (
                                                                            <button key={match.device.id} className="suggestion-item"
                                                                                onClick={() => { handleSelectDevice(match); setSuggestions([]); setProductSuggestions([]); }}>
                                                                                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(79,142,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                                    <Smartphone style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                                                                </div>
                                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{match.product.brand} {match.product.name}</div>
                                                                                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>SN: {match.device.serialNumber}</div>
                                                                                </div>
                                                                                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{match.price.toLocaleString()} TZS</div>
                                                                            </button>
                                                                        ))}
                                                                    </>
                                                                )}
                                                                {productSuggestions.length > 0 && (
                                                                    <>
                                                                        <div className="suggestion-section-label purple">📦 Products by Name</div>
                                                                        {productSuggestions.map(product => (
                                                                            <button key={product.id} className="suggestion-item"
                                                                                onClick={() => { if (product.quantity <= 0) return; handleSelectSimpleProduct(product); setSuggestions([]); setProductSuggestions([]); }}
                                                                                disabled={product.quantity <= 0}
                                                                                style={product.quantity <= 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                                                                                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                                    <Package style={{ width: 16, height: 16, color: 'var(--accent-2)' }} />
                                                                                </div>
                                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{product.brand} {product.name}</div>
                                                                                    <div style={{ fontSize: 10, color: product.quantity > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{product.quantity} in stock</div>
                                                                                </div>
                                                                                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent-2)', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{(product.basePricing?.nonActive || 0).toLocaleString()} TZS</div>
                                                                            </button>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Found device */}
                                                <AnimatePresence>
                                                    {foundDevice && (
                                                        <motion.div className="device-found-card"
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            style={{ marginBottom: 16 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <Zap style={{ width: 16, height: 16, color: 'var(--green)' }} />
                                                                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Device Found</span>
                                                                </div>
                                                                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(52,211,153,0.12)', color: 'var(--green)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{foundDevice.device.status || 'available'}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'start', gap: 14 }}>
                                                                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <Smartphone style={{ width: 22, height: 22, color: 'var(--green)' }} />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 18, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.2 }}>
                                                                        {foundDevice.product.brand} {foundDevice.product.name}
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                                                        {foundDevice.product.trackSerials !== false && foundDevice.device.condition && (
                                                                            <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{foundDevice.device.condition}</span>
                                                                        )}
                                                                        {foundDevice.device.storage && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)', padding: '3px 8px', borderRadius: 6 }}>{foundDevice.device.storage}</span>}
                                                                        {foundDevice.device.color && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)', padding: '3px 8px', borderRadius: 6 }}>{foundDevice.device.color}</span>}
                                                                    </div>
                                                                    {foundDevice.device.supplierName && (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                                                                            <Truck style={{ width: 12, height: 12, color: 'var(--text-3)' }} />
                                                                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{foundDevice.device.supplierName}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(52,211,153,0.15)' }}>
                                                                <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Selling Price</span>
                                                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{foundDevice.price.toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-3)' }}>TZS</span></span>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                                                                <button className="ns-btn-ghost" onClick={addSelectedToCart} style={{ fontSize: 11, padding: '12px 16px' }}>
                                                                    <ShoppingCart style={{ width: 14, height: 14 }} /> Add to Cart
                                                                </button>
                                                                <button className="ns-btn-primary" onClick={() => { addSelectedToCart(); handleNext(); }} style={{ fontSize: 11, padding: '12px 16px' }}>
                                                                    Add &amp; Continue <ArrowRight style={{ width: 14, height: 14 }} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Not found */}
                                                {searchSerial.length >= 3 && !foundDevice && !searching && suggestions.length === 0 && productSuggestions.length === 0 && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                        style={{ padding: '16px 20px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, textAlign: 'center', fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>
                                                        ⚠️ No matching device or product found
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* In-step cart (when has items, desktop) */}
                                            {cartItems.length > 0 && (
                                                <div className="hide-mobile" style={{ flex: '0 0 42%', minWidth: 0 }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                                            <span className="ns-label" style={{ color: 'var(--accent)' }}>Cart</span>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{cartItems.length} item(s)</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            {cartTotals.items.map(i => (
                                                                <div key={i.key} className="cart-item">
                                                                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                                                                        <div style={{ minWidth: 0 }}>
                                                                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.productName}</div>
                                                                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{i.serialNumber ? `SN: ${i.serialNumber}` : i.condition || 'ITEM'}</div>
                                                                        </div>
                                                                        <button onClick={() => removeCartItem(i.key)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '4px 8px', color: 'var(--red)', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: "'Syne',sans-serif", flexShrink: 0 }}>✕</button>
                                                                    </div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                                        <div>
                                                                            <div className="ns-label" style={{ marginBottom: 4, fontSize: 8 }}>Qty</div>
                                                                            <input type="number" min={1} value={i.quantity} onChange={e => updateCartItem(i.key, { quantity: e.target.value })} className="ns-input" style={{ padding: '8px 12px', fontSize: 13 }} />
                                                                        </div>
                                                                        <div>
                                                                            <div className="ns-label" style={{ marginBottom: 4, fontSize: 8 }}>Unit Price</div>
                                                                            <input type="number" min={0} value={i.originalUnitPrice} onChange={e => updateCartItem(i.key, { sellingPrice: e.target.value })} className="ns-input" style={{ padding: '8px 12px', fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }} />
                                                                        </div>
                                                                        <div style={{ gridColumn: 'span 2' }}>
                                                                            <div className="ns-label" style={{ marginBottom: 4, fontSize: 8 }}>Discount</div>
                                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                                <select value={i.discountType || ''} onChange={e => updateCartItem(i.key, { discountType: e.target.value })} className="ns-select" style={{ padding: '8px 10px', fontSize: 10 }}>
                                                                                    <option value="">None</option>
                                                                                    <option value="AMOUNT">Amt</option>
                                                                                    <option value="PERCENT">%</option>
                                                                                </select>
                                                                                <input type="number" min={0} value={i.discountValue ?? ''} onChange={e => updateCartItem(i.key, { discountValue: e.target.value })} className="ns-input" style={{ flex: 1, padding: '8px 10px', fontSize: 12 }} />
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ gridColumn: 'span 2' }}>
                                                                            <div className="ns-label" style={{ marginBottom: 4, fontSize: 8 }}>Line Total</div>
                                                                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: 'var(--accent)', padding: '8px 12px', background: 'rgba(79,142,247,0.06)', borderRadius: 10, border: '1px solid rgba(79,142,247,0.1)' }}>
                                                                                {Math.round(i.lineTotalAfterItemDiscount).toLocaleString()} TZS
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(79,142,247,0.08)', borderRadius: 12, border: '1px solid rgba(79,142,247,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span className="ns-label" style={{ color: 'var(--text-2)' }}>Subtotal</span>
                                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{Math.round(cartTotals.subtotalAfterItemDiscount).toLocaleString()} TZS</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════════════════════════════ STEP 3 ═══════════════════════════════ */}
                            {currentStep === 3 && (
                                <motion.div key="s3" variants={stepVariants} initial="enter" animate="center" exit="exit">
                                    <div className="ns-card" style={{ padding: '28px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Repeat2 style={{ width: 20, height: 20, color: 'var(--orange)' }} />
                                            </div>
                                            <div>
                                                <p className="step-section-title">Trade-In Device</p>
                                                <p className="ns-label" style={{ marginTop: 2, color: 'var(--text-3)' }}>Optional — add a trade-in to this sale</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                                            <button className={`tradein-choice ${!formData.hasTradeIn ? 'active-red' : ''}`}
                                                onClick={() => { setFormData(f => ({ ...f, hasTradeIn: false, tradeInId: '', tradeInValue: 0, tradeInDeviceName: '', tradeInSerialNumber: '' })); handleNext(); }}>
                                                <div style={{ width: 52, height: 52, borderRadius: 14, background: formData.hasTradeIn === false ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${formData.hasTradeIn === false ? 'rgba(248,113,113,0.2)' : 'var(--border)'}` }}>
                                                    <Ban style={{ width: 22, height: 22, color: 'var(--red)' }} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: formData.hasTradeIn === false ? 'var(--red)' : 'var(--text-2)' }}>No Trade-In</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>Skip this step and proceed to payment</div>
                                            </button>
                                            <button className={`tradein-choice ${formData.hasTradeIn ? 'active-orange' : ''}`}
                                                onClick={() => { setFormData(f => ({ ...f, hasTradeIn: true })); setShowTradeInForm(true); }}>
                                                <div style={{ width: 52, height: 52, borderRadius: 14, background: formData.hasTradeIn ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${formData.hasTradeIn ? 'rgba(251,146,60,0.2)' : 'var(--border)'}` }}>
                                                    <ArrowLeftRight style={{ width: 22, height: 22, color: 'var(--orange)' }} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: formData.hasTradeIn ? 'var(--orange)' : 'var(--text-2)' }}>Add Trade-In</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>Customer brings a device to offset cost</div>
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {formData.tradeInValue > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{ padding: '16px 20px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                                    <div>
                                                        <div className="ns-label" style={{ color: 'var(--orange)', marginBottom: 4 }}>Trade-In Applied</div>
                                                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{formData.tradeInDeviceName}</div>
                                                    </div>
                                                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: 'var(--orange)', whiteSpace: 'nowrap' }}>
                                                        − {formData.tradeInValue.toLocaleString()} TZS
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════════════════════════════ STEP 4 ═══════════════════════════════ */}
                            {currentStep === 4 && (
                                <motion.div key="s4" variants={stepVariants} initial="enter" animate="center" exit="exit">
                                    <div className="ns-card" style={{ padding: '28px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CreditCard style={{ width: 20, height: 20, color: 'var(--green)' }} />
                                            </div>
                                            <div>
                                                <p className="step-section-title">Payment</p>
                                                <p className="ns-label" style={{ marginTop: 2, color: 'var(--text-3)' }}>Select method and enter amount</p>
                                            </div>
                                        </div>

                                        {/* Payment methods */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10, marginBottom: 24 }}>
                                            {paymentMethods.map(method => (
                                                <button key={method} className={`payment-method-btn ${formData.paymentMethod === method ? 'selected' : ''}`}
                                                    onClick={() => setFormData(f => ({ ...f, paymentMethod: method }))}>
                                                    <div className="pm-icon"><CreditCard style={{ width: 15, height: 15, color: formData.paymentMethod === method ? '#fff' : 'var(--text-3)' }} /></div>
                                                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: formData.paymentMethod === method ? 'var(--accent)' : 'var(--text-2)', lineHeight: 1.2 }}>{method.replace(/_/g, ' ')}</div>
                                                </button>
                                            ))}
                                            <button className={`payment-method-btn ${formData.paymentMethod === 'CUSTOM' ? 'selected' : ''}`}
                                                onClick={() => setFormData(f => ({ ...f, paymentMethod: 'CUSTOM' }))}>
                                                <div className="pm-icon" style={formData.paymentMethod === 'CUSTOM' ? { background: 'rgba(255,255,255,0.15)' } : {}}>
                                                    <span style={{ fontSize: 18, fontWeight: 800, color: formData.paymentMethod === 'CUSTOM' ? '#fff' : 'var(--text-3)' }}>+</span>
                                                </div>
                                                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: formData.paymentMethod === 'CUSTOM' ? 'var(--text-1)' : 'var(--text-3)' }}>Custom</div>
                                            </button>
                                        </div>

                                        {formData.paymentMethod === 'CUSTOM' && (
                                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
                                                <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Specify Method</label>
                                                <input type="text" value={formData.customPaymentMethod || ''}
                                                    onChange={e => setFormData(f => ({ ...f, customPaymentMethod: e.target.value.toUpperCase() }))}
                                                    placeholder="e.g. CHEQUE, EXCHANGE, ESCROW..." className="ns-input" style={{ textTransform: 'uppercase' }} autoFocus />
                                            </motion.div>
                                        )}

                                        {/* Amount */}
                                        <div style={{ marginBottom: 20 }}>
                                            <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Amount Paid (TZS)</label>
                                            <input type="number" value={formData.amountPaid}
                                                onChange={e => setFormData(f => ({ ...f, amountPaid: e.target.value }))}
                                                placeholder="0" className="ns-input"
                                                style={{ fontSize: 24, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '-0.02em' }} />
                                        </div>

                                        {/* Receipt mode + Discount side by side */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                                            <div>
                                                <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Receipt Mode</label>
                                                <div className="ns-toggle-group">
                                                    <button className={`ns-toggle-btn ${formData.receiptMode === 'SINGLE' ? 'active' : ''}`} onClick={() => setFormData(f => ({ ...f, receiptMode: 'SINGLE' }))}>Single</button>
                                                    <button className={`ns-toggle-btn ${formData.receiptMode === 'SEPARATE' ? 'active' : ''}`} onClick={() => setFormData(f => ({ ...f, receiptMode: 'SEPARATE' }))}>Separate</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Invoice Discount</label>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <select value={formData.invoiceDiscountType} onChange={e => setFormData(f => ({ ...f, invoiceDiscountType: e.target.value }))} className="ns-select" style={{ flexShrink: 0 }}>
                                                        <option value="AMOUNT">Amt</option>
                                                        <option value="PERCENT">%</option>
                                                    </select>
                                                    <input type="number" min={0} value={formData.invoiceDiscountValue} onChange={e => setFormData(f => ({ ...f, invoiceDiscountValue: e.target.value }))}
                                                        placeholder={formData.invoiceDiscountType === 'PERCENT' ? '0%' : '0'} className="ns-input" style={{ flex: 1 }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price summary */}
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div className="price-row"><span className="label">Subtotal</span><span className="val">{Math.round(cartTotals.subtotalOriginal).toLocaleString()}</span></div>
                                            {cartTotals.itemDiscountTotal > 0 && <div className="price-row"><span className="label">Item Discounts</span><span className="val" style={{ color: 'var(--red)' }}>−{Math.round(cartTotals.itemDiscountTotal).toLocaleString()}</span></div>}
                                            {cartTotals.invoiceDiscountAmount > 0 && <div className="price-row"><span className="label">Invoice Discount</span><span className="val" style={{ color: 'var(--red)' }}>−{Math.round(cartTotals.invoiceDiscountAmount).toLocaleString()}</span></div>}
                                            {formData.tradeInValue > 0 && <div className="price-row"><span className="label" style={{ color: 'var(--orange)' }}>Trade-In Credit</span><span className="val" style={{ color: 'var(--orange)' }}>−{formData.tradeInValue.toLocaleString()}</span></div>}
                                            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                                            <div className="price-row total"><span className="label">Net Payable</span><span className="val">{Math.round(cartTotals.netPayable).toLocaleString()} TZS</span></div>
                                            {formData.amountPaid && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    style={{ padding: '10px 14px', background: cartTotals.balance >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${cartTotals.balance >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Change / Balance</span>
                                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18, color: cartTotals.balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{Math.round(cartTotals.balance).toLocaleString()} TZS</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Regional toggle */}
                                        <div style={{ padding: '16px 18px', background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.12)', borderRadius: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                <Truck style={{ width: 16, height: 16, color: 'var(--orange)' }} />
                                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Regional Delivery?</span>
                                            </div>
                                            <button onClick={() => setFormData(f => ({ ...f, isRegional: !f.isRegional }))}
                                                style={{ width: '100%', padding: '12px 16px', background: formData.isRegional ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${formData.isRegional ? 'rgba(251,146,60,0.3)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'all 0.2s' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${formData.isRegional ? 'var(--orange)' : 'var(--border)'}`, background: formData.isRegional ? 'var(--orange)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                                    {formData.isRegional && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: formData.isRegional ? 'var(--orange)' : 'var(--text-2)' }}>
                                                    {formData.isRegional ? '✓ Regional Customer — delivery in 3–5 days' : 'Local Customer (Dar es Salaam)'}
                                                </span>
                                            </button>
                                            <AnimatePresence>
                                                {formData.isRegional && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: 10 }}>
                                                        <label className="ns-label" style={{ display: 'block', marginBottom: 6 }}>Approximate Delivery Days</label>
                                                        <input type="text" value={formData.approximateDays} onChange={e => setFormData(f => ({ ...f, approximateDays: e.target.value }))}
                                                            placeholder="e.g. 3-5" className="ns-input" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════════════════════════════ STEP 5 ═══════════════════════════════ */}
                            {currentStep === 5 && (
                                <motion.div key="s5" variants={stepVariants} initial="enter" animate="center" exit="exit">
                                    <div className="ns-card" style={{ padding: '28px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Sparkles style={{ width: 20, height: 20, color: 'var(--gold)' }} />
                                            </div>
                                            <div>
                                                <p className="step-section-title">Review Sale</p>
                                                <p className="ns-label" style={{ marginTop: 2, color: 'var(--text-3)' }}>Verify all details before completing</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                                            {/* Customer */}
                                            <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <User style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                                                </div>
                                                <div>
                                                    <div className="ns-label" style={{ marginBottom: 3, color: 'var(--accent)' }}>Customer</div>
                                                    <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text-1)' }}>{formData.customerName || '—'}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{formData.customerPhone || '—'}</div>
                                                </div>
                                                {formData.isNewCustomer && (
                                                    <div className="review-badge" style={{ marginLeft: 'auto' }}>New</div>
                                                )}
                                            </div>

                                            {/* Items */}
                                            <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                                    <div className="ns-label" style={{ color: 'var(--accent-2)' }}>Invoice Items</div>
                                                    <div className="review-badge">{cartTotals.items.length} item(s)</div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {cartTotals.items.map(i => (
                                                        <div key={i.key} style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.productName}</div>
                                                                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>{i.serialNumber ? `SN: ${i.serialNumber}` : i.condition || 'ITEM'}</div>
                                                                {i.lineItemDiscount > 0 && <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, marginTop: 3 }}>−{Math.round(i.lineItemDiscount).toLocaleString()} TZS disc.</div>}
                                                            </div>
                                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{Math.round(i.lineTotalAfterItemDiscount).toLocaleString()}</div>
                                                                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{i.quantity} × {Math.round(i.originalUnitPrice).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment + Totals */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14 }}>
                                                    <div className="ns-label" style={{ marginBottom: 12, color: 'var(--green)' }}>Payment</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Method</div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>
                                                        {formData.paymentMethod === 'CUSTOM' ? (formData.customPaymentMethod || 'CUSTOM') : formData.paymentMethod}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Paid</div>
                                                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: 'var(--green)' }}>{Math.round(cartTotals.paid).toLocaleString()} TZS</div>
                                                </div>
                                                <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14 }}>
                                                    <div className="ns-label" style={{ marginBottom: 12, color: 'var(--gold)' }}>Totals</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                                            <span style={{ color: 'var(--text-2)' }}>Subtotal</span>
                                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: 'var(--text-1)', fontSize: 11 }}>{Math.round(cartTotals.subtotalOriginal).toLocaleString()}</span>
                                                        </div>
                                                        {cartTotals.itemDiscountTotal > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                                                <span style={{ color: 'var(--text-2)' }}>Discounts</span>
                                                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: 'var(--red)', fontSize: 11 }}>−{Math.round(cartTotals.itemDiscountTotal).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {formData.tradeInValue > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                                                <span style={{ color: 'var(--orange)' }}>Trade-In</span>
                                                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: 'var(--orange)', fontSize: 11 }}>−{Math.round(formData.tradeInValue).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-1)' }}>Net</span>
                                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 15, color: 'var(--gold)' }}>{Math.round(cartTotals.netPayable).toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: cartTotals.balance >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', borderRadius: 8, border: `1px solid ${cartTotals.balance >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)'}` }}>
                                                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Change</span>
                                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13, color: cartTotals.balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{Math.round(cartTotals.balance).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── NAVIGATION ── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 16 }} className="hide-mobile">
                            <button className="ns-btn-ghost" onClick={handleBack} disabled={currentStep === 1}
                                style={currentStep === 1 ? { opacity: 0, pointerEvents: 'none' } : {}}>
                                <ArrowLeft style={{ width: 16, height: 16 }} /> Back
                            </button>
                            {currentStep < totalSteps ? (
                                <button className="ns-btn-primary" onClick={handleNext} disabled={!isStepValid()}>
                                    Next Step <ArrowRight style={{ width: 16, height: 16 }} />
                                </button>
                            ) : (
                                <button className="ns-btn-dark" onClick={handleSubmit} disabled={loading}
                                    style={{ background: 'linear-gradient(135deg,#1a2035,#0e1320)', border: '1px solid rgba(79,142,247,0.2)', boxShadow: '0 0 30px rgba(79,142,247,0.12)' }}>
                                    {loading ? 'Processing...' : 'Complete Sale'} <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--green)' }} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── SIDEBAR SUMMARY ── */}
                    {currentStep >= 2 && cartItems.length > 0 && (
                        <div className="hide-mobile" style={{ width: 260, flexShrink: 0, position: 'sticky', top: 20 }}>
                            <div className="summary-panel">
                                <div className="ns-label" style={{ color: 'var(--accent)', marginBottom: 16 }}>
                                    <ShoppingCart style={{ display: 'inline', width: 12, height: 12, marginRight: 6, verticalAlign: 'middle' }} />
                                    Order Summary
                                </div>

                                {formData.customerName && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 14, border: '1px solid var(--border)' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(79,142,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <User style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.customerName}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{formData.customerPhone}</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                                    {cartTotals.items.map(i => (
                                        <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.3, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.productName}</span>
                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', flexShrink: 0 }}>{Math.round(i.lineTotalAfterItemDiscount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {cartTotals.items.length > 0 && (
                                    <>
                                        <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {cartTotals.itemDiscountTotal > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                    <span style={{ color: 'var(--red)' }}>Discounts</span>
                                                    <span style={{ color: 'var(--red)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>−{Math.round(cartTotals.itemDiscountTotal).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {formData.tradeInValue > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                    <span style={{ color: 'var(--orange)' }}>Trade-In</span>
                                                    <span style={{ color: 'var(--orange)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>−{Math.round(parseFloat(formData.tradeInValue)).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: 14, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(79,142,247,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Net Payable</span>
                                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 20, color: 'var(--text-1)' }}>{Math.round(cartTotals.netPayable).toLocaleString()}</span>
                                            </div>
                                            <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, marginTop: 2 }}>TZS</div>
                                            {formData.amountPaid && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, fontWeight: 700 }}>
                                                    <span style={{ color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cartTotals.balance >= 0 ? 'Change' : 'Due'}</span>
                                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", color: cartTotals.balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{Math.abs(Math.round(cartTotals.balance)).toLocaleString()} TZS</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {formData.paymentMethod !== 'CASH' ? formData.paymentMethod.replace(/_/g, ' ') : 'Cash'}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <div className="mobile-nav-bar show-mobile-only">
                <button className="ns-btn-ghost" onClick={handleBack} disabled={currentStep === 1}
                    style={currentStep === 1 ? { opacity: 0, pointerEvents: 'none' } : {}}>
                    <ArrowLeft style={{ width: 16, height: 16 }} /> Back
                </button>
                {currentStep < totalSteps ? (
                    <button className="ns-btn-primary" onClick={handleNext} disabled={!isStepValid()}>
                        Next <ArrowRight style={{ width: 16, height: 16 }} />
                    </button>
                ) : (
                    <button className="ns-btn-dark" onClick={handleSubmit} disabled={loading}
                        style={{ background: 'linear-gradient(135deg,#1a2035,#0e1320)', border: '1px solid rgba(79,142,247,0.2)' }}>
                        {loading ? 'Processing...' : 'Complete Sale'} <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--green)' }} />
                    </button>
                )}
            </div>

            {/* ── Modals ── */}
            {showTradeInForm && (
                <TradeInForm isOpen={showTradeInForm} onClose={() => setShowTradeInForm(false)}
                    onSuccess={(response) => {
                        const tradeIn = response.data.tradeIn;
                        setFormData(f => ({ ...f, tradeInId: tradeIn.id, tradeInValue: parseFloat(tradeIn.valuation || 0), tradeInDeviceName: `${tradeIn.deviceInfo.brand} ${tradeIn.deviceInfo.model}`, tradeInSerialNumber: tradeIn.deviceInfo.serialNumber }));
                        setShowTradeInForm(false);
                    }}
                    prefilledCustomer={{ id: formData.customerId, name: formData.customerName, phone: formData.customerPhone }} />
            )}
            <SerialScannerModal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)}
                onSerialDetected={(serial) => { handleUnifiedSearch(serial); setShowScannerModal(false); }} />
        </div>
    );
};

export default NewSalePage;
