'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaParking, FaCar, FaMotorcycle, FaTruck, FaBus, FaPlus, FaTimes, FaSearch,
  FaQrcode, FaCamera, FaPrint, FaSignOutAlt, FaSignInAlt, FaChartBar,
  FaCog, FaLayerGroup, FaMoneyBillWave, FaSpinner, FaCheck, FaExclamationTriangle,
  FaClock, FaHashtag, FaMapMarkerAlt, FaRobot, FaBan, FaEye, FaFilter,
  FaChevronDown, FaChevronRight, FaChevronLeft, FaSync, FaUndo
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import Link from 'next/link';

const PRIMARY = '#0369a1';
const PRIMARY_DARK = '#075985';
const PRIMARY_LIGHT = '#e0f2fe';
const PRIMARY_BG = '#f0f9ff';
const BG = '#f8fafc';
const SUCCESS = '#16a34a';
const SUCCESS_BG = '#dcfce7';
const DANGER = '#dc2626';
const DANGER_BG = '#fee2e2';
const WARNING = '#d97706';
const WARNING_BG = '#fef3c7';
const OCCUPIED = '#ef4444';
const AVAILABLE = '#22c55e';

const VEHICLE_ICONS = {
  car: FaCar, suv: FaCar, bike: FaMotorcycle, motorcycle: FaMotorcycle,
  truck: FaTruck, bus: FaBus
};

function getVehicleIcon(type) {
  return VEHICLE_ICONS[type] || FaCar;
}

function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function calcElapsed(entryTime) {
  if (!entryTime) return '';
  const entry = entryTime?._seconds ? new Date(entryTime._seconds * 1000) : new Date(entryTime);
  const mins = Math.max(0, Math.floor((Date.now() - entry.getTime()) / 60000));
  return formatDuration(mins);
}

// Extract display string from bilingual {en, ar} objects or plain strings
function dt(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.en || val.ar || Object.values(val).find(v => typeof v === 'string') || '';
  return String(val);
}

function ticketStatusBadge(s) {
  const map = {
    active: { bg: '#dbeafe', text: '#1e40af', label: 'Active' },
    completed: { bg: '#dcfce7', text: '#166534', label: 'Completed' },
    cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
    lost_ticket: { bg: '#fef3c7', text: '#92400e', label: 'Lost Ticket' },
  };
  return map[s] || { bg: '#f1f5f9', text: '#475569', label: s };
}

// ═════════════════════════════════════════════════════════
export default function ParkingDashboardPage() {
  const [tab, setTab] = useState('live');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');

  // Data
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [rates, setRates] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Modals
  const [entryModal, setEntryModal] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const [exitPreview, setExitPreview] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);

  // Entry form
  const [entryForm, setEntryForm] = useState({
    vehicleNumber: '', vehicleType: 'car', vehicleColor: '',
    zoneId: '', slotId: '', notes: '',
    vehicleImageUrl: '', vehicleImageFile: null,
    aiRecognizedPlate: '', aiConfidence: 0
  });
  const [entryLoading, setEntryLoading] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);

  // Exit form
  const [exitForm, setExitForm] = useState({ ticketNumber: '', qrData: '' });
  const [exitLoading, setExitLoading] = useState(false);
  const [confirmingExit, setConfirmingExit] = useState(false);
  const [exitPaymentMethod, setExitPaymentMethod] = useState('cash');

  // Lost ticket
  const [lostTicketModal, setLostTicketModal] = useState(false);
  const [lostTicketForm, setLostTicketForm] = useState({ vehicleNumber: '', vehicleType: '', vehicleColor: '' });
  const [lostTicketLoading, setLostTicketLoading] = useState(false);
  const [lostTicketResult, setLostTicketResult] = useState(null);

  // Cancel ticket
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Refresh state (distinct from initial loading)
  const [refreshing, setRefreshing] = useState(false);
  const [prevStats, setPrevStats] = useState(null);

  // Auto-refresh
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [elapsedTick, setElapsedTick] = useState(0);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Responsive ───────────────────────────────────────
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Init — resolve restaurantId (localStorage → user → API) ───
  useEffect(() => {
    const resolve = async () => {
      try {
        // 1. Fast path: already in localStorage
        const saved = localStorage.getItem('selectedRestaurantId');
        if (saved) { setRestaurantId(saved); return; }
        // 2. From user object
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.restaurantId) { setRestaurantId(user.restaurantId); return; }
        // 3. Fetch from API (same as dashboard)
        const res = await apiClient.getRestaurants();
        const list = res?.restaurants || [];
        if (list.length > 0) {
          const r = list.find(r => r.id === res.defaultRestaurantId) || list[0];
          localStorage.setItem('selectedRestaurantId', r.id);
          setRestaurantId(r.id);
          return;
        }
      } catch {}
      setLoading(false);
    };
    resolve();
  }, []);

  // ─── Load data ────────────────────────────────────────
  const loadData = useCallback(async (isInitial = false) => {
    if (!restaurantId) return;
    if (isInitial || !stats) {
      setLoading(true);
    } else {
      setRefreshing(true);
      setPrevStats(stats);
    }
    try {
      const [configRes, statsRes, zonesRes, ratesRes, printRes] = await Promise.allSettled([
        apiClient.getParkingConfig(restaurantId),
        apiClient.getParkingDashboardStats(restaurantId),
        apiClient.getParkingZones(restaurantId),
        apiClient.getParkingRates(restaurantId),
        apiClient.getPrintSettings(restaurantId)
      ]);
      const fetchedConfig = configRes.status === 'fulfilled' ? configRes.value.config : null;
      // Merge receipt logo from admin print settings as fallback
      if (fetchedConfig) {
        const ps = printRes.status === 'fulfilled' ? printRes.value.printSettings : null;
        if (!fetchedConfig.logo && ps?.receiptLogo?.url && ps.receiptLogo.enabled !== false) {
          fetchedConfig.logo = ps.receiptLogo.url;
        }
        setConfig(fetchedConfig);
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
      const fetchedZones = zonesRes.status === 'fulfilled' ? (zonesRes.value.zones || []) : [];
      const fetchedRates = ratesRes.status === 'fulfilled' ? (ratesRes.value.rates || []) : [];
      setZones(fetchedZones);
      setRates(fetchedRates);
      // Sync entry form defaults with fetched config
      const vTypes = fetchedConfig?.vehicleTypes?.filter(v => v.enabled) || [];
      const vTypeIds = vTypes.map(v => v.id);
      setEntryForm(f => ({
        ...f,
        zoneId: f.zoneId || (fetchedZones.length > 0 ? fetchedZones[0].id : ''),
        vehicleType: vTypeIds.includes(f.vehicleType) ? f.vehicleType : (vTypes[0]?.id || f.vehicleType),
      }));
      setLastRefreshedAt(new Date());
    } catch (e) {
      console.error('Failed to load parking data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId]);

  useEffect(() => { loadData(true); }, [loadData]);

  // ─── Load tickets ─────────────────────────────────────
  const loadTickets = useCallback(async () => {
    if (!restaurantId) return;
    setTicketsLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (dateFilter) filters.date = dateFilter;
      const res = await apiClient.getParkingTickets(restaurantId, filters);
      setTickets(res.tickets || []);
    } catch (e) {
      console.error('Failed to load tickets:', e);
    } finally {
      setTicketsLoading(false);
    }
  }, [restaurantId, statusFilter, dateFilter]);

  useEffect(() => {
    if (tab === 'tickets' || tab === 'history') loadTickets();
  }, [tab, loadTickets]);

  // ─── Auto-refresh: visibility change ──────────────────
  const lastParkingFetchRef = useRef(0);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && restaurantId) {
        // Debounce: only fetch if last fetch was >30s ago
        if (Date.now() - lastParkingFetchRef.current > 30000) {
          lastParkingFetchRef.current = Date.now();
          loadData(false);
          if (tab === 'tickets' || tab === 'history') loadTickets();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [restaurantId, tab, loadData, loadTickets]);

  // ─── Auto-refresh: 2-minute polling ────────────────────────
  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(() => {
      lastParkingFetchRef.current = Date.now();
      loadData(false);
      if (tab === 'tickets') loadTickets();
    }, 120000);
    return () => clearInterval(interval);
  }, [restaurantId, tab, loadData, loadTickets]);

  // ─── Elapsed timer tick (every 60s) ───────────────────
  useEffect(() => {
    const interval = setInterval(() => setElapsedTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── No restaurant / No config state ─────────────────
  if (!loading && (!restaurantId || !config)) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <FaParking size={64} color={PRIMARY} style={{ marginBottom: 16 }} />
          {!restaurantId ? (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>No Restaurant Found</h2>
              <p style={{ color: '#64748b', marginBottom: 24 }}>Please log in again or select a restaurant from the dashboard.</p>
              <Link href="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                background: PRIMARY, color: '#fff', borderRadius: 10, textDecoration: 'none',
                fontWeight: 600, fontSize: 15
              }}>
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Set Up Parking</h2>
              <p style={{ color: '#64748b', marginBottom: 24 }}>Configure your parking lot settings to get started.</p>
              <Link href="/parking/config" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                background: PRIMARY, color: '#fff', borderRadius: 10, textDecoration: 'none',
                fontWeight: 600, fontSize: 15
              }}>
                <FaCog /> Configure Parking
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Vehicle Entry ────────────────────────────────────
  const handleEntry = async () => {
    if (!entryForm.vehicleNumber && !entryForm.aiRecognizedPlate) {
      showToast('Vehicle number is required', 'error');
      return;
    }
    if (!entryForm.zoneId) {
      showToast('Please select a zone', 'error');
      return;
    }
    setEntryLoading(true);
    try {
      const payload = { ...entryForm };
      delete payload.vehicleImageFile;
      const res = await apiClient.createParkingEntry(restaurantId, payload);
      if (res.success) {
        showToast(`Ticket ${res.ticket.ticketNumber} created`);
        setEntryModal(false);
        resetEntryForm();
        loadData(false);
        if (tab === 'tickets') loadTickets();
        if (res.printData?.qrCodeDataUrl) {
          handlePrintEntrySlip(res.printData, res.ticket);
        }
      }
    } catch (e) {
      showToast(e.message || 'Failed to create entry', 'error');
    } finally {
      setEntryLoading(false);
    }
  };

  const resetEntryForm = () => {
    if (entryForm.vehicleImageUrl?.startsWith('blob:')) URL.revokeObjectURL(entryForm.vehicleImageUrl);
    const vTypes = config?.vehicleTypes?.filter(v => v.enabled) || [];
    setEntryForm({
      vehicleNumber: '', vehicleType: vTypes[0]?.id || 'car', vehicleColor: '',
      zoneId: zones[0]?.id || '', slotId: '',
      notes: '', vehicleImageUrl: '', vehicleImageFile: null,
      aiRecognizedPlate: '', aiConfidence: 0
    });
  };

  // ─── AI Plate Scan ────────────────────────────────────
  const handleAIScan = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setAiScanning(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiClient.recognizeLicensePlate(restaurantId, formData);
        if (res.success && res.recognition) {
          const r = res.recognition;
          setEntryForm(f => ({
            ...f,
            vehicleNumber: r.plateNumber || f.vehicleNumber,
            vehicleType: r.vehicleType || f.vehicleType,
            vehicleColor: r.vehicleColor || f.vehicleColor,
            vehicleImageUrl: r.imageUrl || f.vehicleImageUrl,
            licensePlateImageUrl: r.imageUrl || '',
            aiRecognizedPlate: r.plateNumber || '',
            aiConfidence: r.confidence || 0
          }));
          showToast(`Plate recognized: ${r.plateNumber} (${Math.round((r.confidence || 0) * 100)}% confidence)`);
        }
      } catch (e) {
        showToast('AI recognition failed', 'error');
      } finally {
        setAiScanning(false);
      }
    };
    input.click();
  };

  // ─── Vehicle Photo ────────────────────────────────────
  const handleVehiclePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setEntryForm(f => ({ ...f, vehicleImageUrl: url, vehicleImageFile: file }));
    };
    input.click();
  };

  const removeVehiclePhoto = () => {
    if (entryForm.vehicleImageUrl?.startsWith('blob:')) URL.revokeObjectURL(entryForm.vehicleImageUrl);
    setEntryForm(f => ({ ...f, vehicleImageUrl: '', vehicleImageFile: null }));
  };

  // ─── Exit Flow ────────────────────────────────────────
  const handleExitLookup = async () => {
    if (!exitForm.ticketNumber && !exitForm.qrData) {
      showToast('Enter ticket number or scan QR', 'error');
      return;
    }
    setExitLoading(true);
    try {
      const res = await apiClient.processParkingExit(restaurantId, exitForm);
      if (res.success) {
        setExitPreview(res.exitPreview);
      }
    } catch (e) {
      showToast(e.message || 'Ticket not found', 'error');
    } finally {
      setExitLoading(false);
    }
  };

  const handleExitConfirm = async () => {
    if (!exitPreview) return;
    setConfirmingExit(true);
    try {
      const res = await apiClient.confirmParkingExit(restaurantId, {
        ticketId: exitPreview.ticketId,
        paymentMethod: exitPaymentMethod,
        finalAmount: exitPreview.calculatedAmount
      });
      if (res.success) {
        showToast(`Exit confirmed. Amount: ${res.exitData.finalAmount} ${res.exitData.currency}`);
        setExitModal(false);
        setExitPreview(null);
        setExitForm({ ticketNumber: '', qrData: '' });
        loadData(false);
        if (tab === 'tickets' || tab === 'history') loadTickets();
      }
    } catch (e) {
      showToast(e.message || 'Failed to confirm exit', 'error');
    } finally {
      setConfirmingExit(false);
    }
  };

  // ─── Cancel Ticket (modal-based) ──────────────────────
  const openCancelModal = (ticketId) => {
    setCancelModal(ticketId);
    setCancelReason('');
  };

  const confirmCancelTicket = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      await apiClient.cancelParkingTicket(restaurantId, cancelModal, cancelReason || 'Cancelled by operator');
      showToast('Ticket cancelled');
      setCancelModal(null);
      loadData(false);
      loadTickets();
      if (ticketDetail?.id === cancelModal) setTicketDetail(null);
    } catch (e) {
      showToast('Failed to cancel', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  // ─── Lost Ticket Flow ─────────────────────────────────
  const handleLostTicketLookup = async () => {
    if (!lostTicketForm.vehicleNumber) {
      showToast('Vehicle number is required', 'error');
      return;
    }
    setLostTicketLoading(true);
    try {
      const res = await apiClient.lookupParkingTicket(restaurantId, {
        vehicleNumber: lostTicketForm.vehicleNumber,
        status: 'active'
      });
      const found = res.tickets || res.ticket ? [res.ticket].filter(Boolean) : [];
      if (found.length > 0) {
        setLostTicketResult(found[0]);
      } else {
        showToast('No active ticket found for this vehicle', 'error');
      }
    } catch (e) {
      showToast(e.message || 'Lookup failed', 'error');
    } finally {
      setLostTicketLoading(false);
    }
  };

  const handleLostTicketExit = async () => {
    if (!lostTicketResult) return;
    setLostTicketLoading(true);
    try {
      const res = await apiClient.processParkingExit(restaurantId, {
        ticketId: lostTicketResult.id,
        lostTicket: true,
        vehicleNumber: lostTicketForm.vehicleNumber
      });
      if (res.success) {
        setExitPreview({ ...res.exitPreview, isLostTicket: true });
        setLostTicketModal(false);
        setLostTicketResult(null);
        setExitModal(true);
      }
    } catch (e) {
      showToast(e.message || 'Failed to process lost ticket', 'error');
    } finally {
      setLostTicketLoading(false);
    }
  };

  // ─── Print ────────────────────────────────────────────
  const handlePrintEntrySlip = (printData, ticket) => {
    const { generateParkingSlipHTML } = require('../../../utils/printHtmlGenerator');
    if (typeof generateParkingSlipHTML === 'function') {
      const html = generateParkingSlipHTML(
        { ...ticket, ...printData },
        config || {}
      );
      const w = window.open('', '_blank', 'width=400,height=600');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.print();
      }
    }
  };

  const handlePrintExitSlip = (ticket) => {
    const { generateParkingExitSlipHTML } = require('../../../utils/printHtmlGenerator');
    if (typeof generateParkingExitSlipHTML === 'function') {
      const html = generateParkingExitSlipHTML(ticket, config || {});
      const w = window.open('', '_blank', 'width=400,height=600');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.print();
      }
    }
  };

  // ─── Date navigation ─────────────────────────────────
  const navigateDate = (direction) => {
    const d = new Date(dateFilter);
    d.setDate(d.getDate() + direction);
    setDateFilter(d.toISOString().split('T')[0]);
  };
  const goToToday = () => setDateFilter(new Date().toISOString().split('T')[0]);
  const isToday = dateFilter === new Date().toISOString().split('T')[0];

  // ─── Manual refresh ───────────────────────────────────
  const handleRefresh = () => {
    loadData(false);
    if (tab === 'tickets' || tab === 'history') loadTickets();
  };

  // ─── Filtered tickets ────────────────────────────────
  const filteredTickets = tickets.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.vehicleNumber?.toLowerCase().includes(q) ||
             t.ticketNumber?.toLowerCase().includes(q);
    }
    return true;
  });

  const vehicleTypes = config?.vehicleTypes?.filter(v => v.enabled) || [
    { id: 'car', label: 'Car' }, { id: 'suv', label: 'SUV' },
    { id: 'bike', label: 'Motorcycle' }, { id: 'truck', label: 'Truck' }
  ];

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      {/* Progress bar on refresh */}
      {refreshing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
          background: `linear-gradient(90deg, transparent, ${PRIMARY}, transparent)`,
          backgroundSize: '200% 100%',
          animation: 'progressSlide 1.2s ease-in-out infinite'
        }} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px',
          borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? DANGER : SUCCESS,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)', animation: 'fadeIn 0.3s ease',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? <FaExclamationTriangle size={14} /> : <FaCheck size={14} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0', padding: isMobile ? '16px' : '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaParking size={24} color={PRIMARY} />
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {dt(config?.lotName) || 'Parking Management'}
            </h1>
            {config?.lotNameAr && (
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, direction: 'rtl' }}>{dt(config.lotNameAr)}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setEntryModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
            background: SUCCESS, color: '#fff', border: 'none', borderRadius: 24,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'transform 0.1s, box-shadow 0.15s'
          }}>
            <FaSignInAlt /> Vehicle Entry
          </button>
          <button onClick={() => { setExitModal(true); setExitPreview(null); setExitForm({ ticketNumber: '', qrData: '' }); }} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
            background: PRIMARY, color: '#fff', border: 'none', borderRadius: 24,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(3,105,161,0.3)', transition: 'transform 0.1s, box-shadow 0.15s'
          }}>
            <FaSignOutAlt /> Vehicle Exit
          </button>
          <button onClick={() => { setLostTicketModal(true); setLostTicketForm({ vehicleNumber: '', vehicleType: '', vehicleColor: '' }); setLostTicketResult(null); }} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
            background: WARNING, color: '#fff', border: 'none', borderRadius: 24,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(217,119,6,0.3)', transition: 'transform 0.1s, box-shadow 0.15s'
          }}>
            <FaExclamationTriangle /> Lost Ticket
          </button>
          <button onClick={handleRefresh} title="Refresh data" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, background: refreshing ? PRIMARY_LIGHT : '#f1f5f9',
            border: refreshing ? `1px solid ${PRIMARY}` : '1px solid #e2e8f0',
            borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s'
          }}>
            <FaSync size={14} color={refreshing ? PRIMARY : '#475569'}
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <Link href="/parking/config" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, background: '#f1f5f9', border: '1px solid #e2e8f0',
            borderRadius: 20, textDecoration: 'none', cursor: 'pointer'
          }}>
            <FaCog size={14} color="#475569" />
          </Link>
        </div>
      </div>

      {/* Last refreshed indicator */}
      {lastRefreshedAt && (
        <div style={{
          padding: isMobile ? '6px 16px' : '6px 32px', fontSize: 11, color: '#94a3b8',
          background: '#fff', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: refreshing ? WARNING : SUCCESS,
            animation: refreshing ? 'refreshPulse 1s infinite' : 'none',
          }} />
          {refreshing ? 'Updating...' : (
            <>Last updated: {lastRefreshedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} &middot; Auto-refreshes every 30s</>
          )}
        </div>
      )}

      {/* Stats Bar */}
      {(loading && !stats) ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 14, padding: isMobile ? '16px' : '20px 32px' }}>
          {[1,2,3,4].map(i => <Shimmer key={i} w="100%" h={90} r={14} />)}
        </div>
      ) : stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 14, padding: isMobile ? '16px' : '20px 32px'
        }}>
          <StatCard icon={FaLayerGroup} label="Total Slots" value={stats.totalSlots} color={PRIMARY}
            refreshing={refreshing} changed={prevStats && prevStats.totalSlots !== stats.totalSlots} />
          <StatCard icon={FaCar} label="Occupied" value={stats.occupiedSlots} color={OCCUPIED}
            subtitle={stats.totalSlots ? `${Math.round((stats.occupiedSlots / stats.totalSlots) * 100)}% full` : undefined}
            refreshing={refreshing} changed={prevStats && prevStats.occupiedSlots !== stats.occupiedSlots} />
          <StatCard icon={FaCheck} label="Available" value={stats.availableSlots} color={AVAILABLE}
            subtitle={stats.totalSlots ? `${Math.round((stats.availableSlots / stats.totalSlots) * 100)}% free` : undefined}
            refreshing={refreshing} changed={prevStats && prevStats.availableSlots !== stats.availableSlots} />
          <StatCard icon={FaMoneyBillWave} label="Today Revenue"
            value={`${config?.currency || 'AED'} ${stats.todayRevenue || 0}`} color={SUCCESS}
            refreshing={refreshing} changed={prevStats && prevStats.todayRevenue !== stats.todayRevenue} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: isMobile ? '0 16px' : '0 32px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {[
            { id: 'live', label: 'Live View', icon: FaLayerGroup },
            { id: 'tickets', label: 'Active Tickets', icon: FaCar },
            { id: 'history', label: 'History', icon: FaClock },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'history') setStatusFilter(''); else if (t.id === 'tickets') setStatusFilter('active'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '14px 22px',
                border: 'none', borderBottom: tab === t.id ? `3px solid ${PRIMARY}` : '3px solid transparent',
                background: 'none', color: tab === t.id ? PRIMARY : '#64748b',
                fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s', letterSpacing: '0.01em'
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ padding: isMobile ? '12px 16px' : '12px 32px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link href="/parking/zones" style={quickLinkStyle}><FaLayerGroup size={12} /> Zones</Link>
        <Link href="/parking/rates" style={quickLinkStyle}><FaMoneyBillWave size={12} /> Rates</Link>
        <Link href="/parking/reports" style={quickLinkStyle}><FaChartBar size={12} /> Reports</Link>
      </div>

      {/* Tab Content */}
      <div style={{ padding: isMobile ? '0 16px 80px' : '0 32px 40px' }}>
        {tab === 'live' && <LiveViewTab stats={stats} zones={zones} config={config} isMobile={isMobile} loading={loading && !stats} refreshing={refreshing} />}
        {(tab === 'tickets' || tab === 'history') && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <FaSearch style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search vehicle or ticket number..."
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              {tab === 'history' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { value: '', label: 'All' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'lost_ticket', label: 'Lost Ticket' },
                  ].map(chip => {
                    const active = statusFilter === chip.value;
                    return (
                      <button key={chip.value} onClick={() => setStatusFilter(chip.value)}
                        style={{
                          padding: '6px 14px', borderRadius: 20,
                          border: active ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                          background: active ? PRIMARY_LIGHT : '#fff',
                          color: active ? PRIMARY_DARK : '#64748b',
                          fontWeight: active ? 600 : 400, fontSize: 13, cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}>
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Date navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <button onClick={() => navigateDate(-1)} style={{
                  padding: '9px 10px', border: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}>
                  <FaChevronLeft size={12} color="#475569" />
                </button>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderLeft: 'none', borderRight: 'none', borderRadius: 0, fontSize: 14, outline: 'none' }} />
                <button onClick={() => navigateDate(1)} style={{
                  padding: '9px 10px', border: '1px solid #e2e8f0', borderRadius: '0 8px 8px 0',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}>
                  <FaChevronRight size={12} color="#475569" />
                </button>
                {!isToday && (
                  <button onClick={goToToday} style={{
                    padding: '8px 14px', background: PRIMARY_LIGHT, color: PRIMARY, border: `1px solid ${PRIMARY}`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 6
                  }}>
                    Today
                  </button>
                )}
              </div>
            </div>

            {/* Ticket List */}
            {ticketsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4].map(i => <Shimmer key={i} h={80} r={12} />)}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
                background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <FaCar size={36} style={{ opacity: 0.3 }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b', margin: '0 0 4px' }}>No tickets found</p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                  {searchQuery ? 'Try a different search term' : 'No tickets for the selected filters'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredTickets.map(ticket => {
                  const VIcon = getVehicleIcon(ticket.vehicleType);
                  const badge = ticketStatusBadge(ticket.status);
                  const entryTime = ticket.entryTime?._seconds ? new Date(ticket.entryTime._seconds * 1000) : new Date(ticket.entryTime);
                  const statusBorderColors = { active: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', lost_ticket: '#f59e0b' };
                  const elapsedStr = ticket.status === 'active' ? calcElapsed(ticket.entryTime) : '';
                  const elapsedMins = ticket.status === 'active' ? (() => {
                    const entry = ticket.entryTime?._seconds ? new Date(ticket.entryTime._seconds * 1000) : new Date(ticket.entryTime);
                    return Math.max(0, Math.floor((Date.now() - entry.getTime()) / 60000));
                  })() : 0;
                  return (
                    <div key={ticket.id} style={{
                      background: '#fff', borderRadius: 12, padding: isMobile ? 14 : 18,
                      border: '1px solid #f1f5f9',
                      borderLeft: `4px solid ${statusBorderColors[ticket.status] || '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center',
                      gap: isMobile ? 10 : 16, flexWrap: 'wrap', cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'box-shadow 0.2s, transform 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    onClick={() => setTicketDetail(ticket)}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, background: PRIMARY_LIGHT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <VIcon size={20} color={PRIMARY} />
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{ticket.vehicleNumber}</span>
                          <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: badge.bg, color: badge.text
                          }}>{badge.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {ticket.ticketNumber} &middot; {dt(ticket.zoneName) || 'N/A'} {ticket.slotNumber ? `/ ${ticket.slotNumber}` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                          {formatTime(entryTime.toISOString())}
                        </div>
                        {ticket.status === 'active' && elapsedStr && (
                          <div style={{
                            fontSize: 12, color: '#fff', fontWeight: 700,
                            background: elapsedMins > 120 ? DANGER : WARNING,
                            padding: '3px 8px', borderRadius: 6, marginTop: 4,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            <FaClock size={10} /> {elapsedStr}
                          </div>
                        )}
                        {ticket.status === 'completed' && ticket.finalAmount !== null && (
                          <div style={{ fontSize: 14, color: SUCCESS, fontWeight: 700 }}>
                            {ticket.currency} {ticket.finalAmount}
                          </div>
                        )}
                      </div>
                      {ticket.status === 'active' && (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={(e) => { e.stopPropagation(); setExitModal(true); setExitForm({ ticketNumber: ticket.ticketNumber, qrData: '' }); handleExitLookupDirect(ticket.ticketNumber); }}
                            style={{
                              padding: '7px 16px', background: PRIMARY, color: '#fff', border: 'none',
                              borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4,
                              boxShadow: '0 1px 4px rgba(3,105,161,0.3)', transition: 'background 0.15s'
                            }}>
                            <FaSignOutAlt size={11} /> Exit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openCancelModal(ticket.id); }}
                            style={{
                              padding: '7px 10px', background: '#fee2e2', color: DANGER, border: 'none',
                              borderRadius: 20, fontSize: 12, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', transition: 'background 0.15s'
                            }}>
                            <FaBan />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ ENTRY MODAL ═══ */}
      {entryModal && (
        <Modal title="Vehicle Entry" onClose={() => setEntryModal(false)} isMobile={isMobile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* AI Scan Button */}
            <button onClick={handleAIScan} disabled={aiScanning} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', background: aiScanning ? '#e2e8f0' : '#f0f9ff',
              border: `2px dashed ${PRIMARY}`, borderRadius: 10, cursor: aiScanning ? 'wait' : 'pointer',
              color: PRIMARY, fontWeight: 600, fontSize: 15
            }}>
              {aiScanning ? <><FaSpinner className="spin" /> Scanning...</> : <><FaRobot /> AI Scan License Plate</>}
            </button>

            {entryForm.aiConfidence > 0 && (
              <div style={{ padding: '8px 12px', background: SUCCESS_BG, borderRadius: 8, fontSize: 13, color: '#166534' }}>
                AI recognized: <strong>{entryForm.aiRecognizedPlate}</strong> ({Math.round(entryForm.aiConfidence * 100)}% confidence)
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <FormField label="Vehicle Number *">
                <input value={entryForm.vehicleNumber} onChange={e => setEntryForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))}
                  placeholder="e.g. A 12345 DXB" style={inputStyle} />
              </FormField>
              <FormField label="Vehicle Color">
                <input value={entryForm.vehicleColor} onChange={e => setEntryForm(f => ({ ...f, vehicleColor: e.target.value }))}
                  placeholder="e.g. White" style={inputStyle} />
              </FormField>
            </div>

            {/* Vehicle Type */}
            <FormField label="Vehicle Type">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {vehicleTypes.map(vt => {
                  const VIcon = getVehicleIcon(vt.id);
                  const selected = entryForm.vehicleType === vt.id;
                  return (
                    <button key={vt.id} onClick={() => setEntryForm(f => ({ ...f, vehicleType: vt.id }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        border: selected ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                        borderRadius: 8, background: selected ? PRIMARY_LIGHT : '#fff',
                        color: selected ? PRIMARY_DARK : '#475569', cursor: 'pointer',
                        fontWeight: selected ? 600 : 400, fontSize: 13
                      }}>
                      <VIcon size={14} /> {dt(vt.label)}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <FormField label="Zone *">
              <select value={entryForm.zoneId} onChange={e => setEntryForm(f => ({ ...f, zoneId: e.target.value, slotId: '' }))} style={inputStyle}>
                <option value="">Select Zone</option>
                {zones.filter(z => z.isActive).map(z => (
                  <option key={z.id} value={z.id}>{dt(z.zoneName)} ({dt(z.zoneCode)}) - {(z.totalSlots || 0) - (z.occupiedSlots || 0)} free</option>
                ))}
              </select>
            </FormField>

            <FormField label="Notes">
              <input value={entryForm.notes} onChange={e => setEntryForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..." style={inputStyle} />
            </FormField>

            {/* Vehicle Photo with Preview */}
            <FormField label="Vehicle Photo">
              {entryForm.vehicleImageUrl ? (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={entryForm.vehicleImageUrl} alt="Vehicle preview"
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <button onClick={removeVehiclePhoto} style={{
                    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaTimes color="#fff" size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={handleVehiclePhoto} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '24px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 10,
                  cursor: 'pointer', fontSize: 14, color: '#64748b'
                }}>
                  <FaCamera size={18} /> Take or Upload Vehicle Photo
                </button>
              )}
            </FormField>

            <button onClick={handleEntry}
              disabled={entryLoading || (!entryForm.vehicleNumber && !entryForm.aiRecognizedPlate) || !entryForm.zoneId}
              style={{
              padding: '14px',
              background: (entryLoading || (!entryForm.vehicleNumber && !entryForm.aiRecognizedPlate) || !entryForm.zoneId) ? '#94a3b8' : SUCCESS,
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
              fontSize: 16, cursor: entryLoading ? 'wait' : 'pointer', marginTop: 4,
              opacity: (!entryForm.vehicleNumber && !entryForm.aiRecognizedPlate) || !entryForm.zoneId ? 0.6 : 1
            }}>
              {entryLoading ? <><FaSpinner className="spin" /> Creating...</> : <><FaSignInAlt /> Create Entry Ticket</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ EXIT MODAL ═══ */}
      {exitModal && (
        <Modal title="Vehicle Exit" onClose={() => { setExitModal(false); setExitPreview(null); }} isMobile={isMobile}>
          {!exitPreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="Ticket Number">
                <input value={exitForm.ticketNumber} onChange={e => setExitForm(f => ({ ...f, ticketNumber: e.target.value.toUpperCase() }))}
                  placeholder="e.g. PKT-000123" style={inputStyle} />
              </FormField>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>or</div>
              <FormField label="QR Code Data">
                <input value={exitForm.qrData} onChange={e => setExitForm(f => ({ ...f, qrData: e.target.value }))}
                  placeholder="Scan or paste QR code data..." style={inputStyle} />
              </FormField>
              <button onClick={handleExitLookup} disabled={exitLoading} style={{
                padding: '14px', background: exitLoading ? '#94a3b8' : PRIMARY,
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
                fontSize: 16, cursor: exitLoading ? 'wait' : 'pointer'
              }}>
                {exitLoading ? <><FaSpinner className="spin" /> Looking up...</> : <><FaSearch /> Find Ticket</>}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Lost ticket surcharge indicator */}
              {exitPreview.isLostTicket && (
                <div style={{
                  padding: '10px 14px', background: WARNING_BG, borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 8, border: `1px solid #fbbf24`
                }}>
                  <FaExclamationTriangle color={WARNING} />
                  <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Lost ticket - surcharge may be applied</span>
                </div>
              )}

              <div style={{ background: PRIMARY_BG, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <InfoRow label="Ticket" value={exitPreview.ticketNumber} />
                  <InfoRow label="Vehicle" value={exitPreview.vehicleNumber} />
                  <InfoRow label="Type" value={dt(exitPreview.vehicleType)} />
                  <InfoRow label="Zone" value={dt(exitPreview.zoneName)} />
                  <InfoRow label="Entry" value={formatTime(exitPreview.entryTime)} />
                  <InfoRow label="Exit" value={formatTime(exitPreview.exitTime)} />
                </div>
                <div style={{ marginTop: 12, padding: '12px', background: '#fff', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Duration</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{exitPreview.durationFormatted}</div>
                </div>
                <div style={{ marginTop: 8, padding: '16px', background: SUCCESS_BG, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#166534' }}>Amount Due</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#166534' }}>
                    {exitPreview.currency} {exitPreview.calculatedAmount}
                  </div>
                </div>
              </div>

              <FormField label="Payment Method">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['cash', 'card', 'digital'].map(m => (
                    <button key={m} onClick={() => setExitPaymentMethod(m)}
                      style={{
                        flex: 1, padding: '10px', border: exitPaymentMethod === m ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                        borderRadius: 8, background: exitPaymentMethod === m ? PRIMARY_LIGHT : '#fff',
                        color: exitPaymentMethod === m ? PRIMARY_DARK : '#475569',
                        fontWeight: exitPaymentMethod === m ? 600 : 400, cursor: 'pointer',
                        fontSize: 14, textTransform: 'capitalize'
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </FormField>

              <button onClick={handleExitConfirm} disabled={confirmingExit} style={{
                padding: '14px', background: confirmingExit ? '#94a3b8' : SUCCESS,
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
                fontSize: 16, cursor: confirmingExit ? 'wait' : 'pointer'
              }}>
                {confirmingExit ? <><FaSpinner className="spin" /> Processing...</> : <><FaCheck /> Confirm Exit & Payment</>}
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* ═══ TICKET DETAIL MODAL ═══ */}
      {ticketDetail && (
        <Modal title={`Ticket ${ticketDetail.ticketNumber}`} onClose={() => setTicketDetail(null)} isMobile={isMobile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <InfoRow label="Vehicle" value={ticketDetail.vehicleNumber} />
                <InfoRow label="Type" value={dt(ticketDetail.vehicleType)} />
                <InfoRow label="Color" value={ticketDetail.vehicleColor || '-'} />
                <InfoRow label="Zone" value={dt(ticketDetail.zoneName) || '-'} />
                <InfoRow label="Slot" value={ticketDetail.slotNumber || '-'} />
                <InfoRow label="Rate" value={dt(ticketDetail.rateName) || '-'} />
                <InfoRow label="Entry" value={formatDateTime(ticketDetail.entryTime?._seconds ? new Date(ticketDetail.entryTime._seconds * 1000).toISOString() : ticketDetail.entryTime)} />
                {ticketDetail.exitTime && <InfoRow label="Exit" value={formatDateTime(ticketDetail.exitTime?._seconds ? new Date(ticketDetail.exitTime._seconds * 1000).toISOString() : ticketDetail.exitTime)} />}
                {ticketDetail.duration && <InfoRow label="Duration" value={formatDuration(ticketDetail.duration)} />}
                {ticketDetail.finalAmount !== null && ticketDetail.finalAmount !== undefined && <InfoRow label="Amount" value={`${ticketDetail.currency || 'AED'} ${ticketDetail.finalAmount}`} />}
                {ticketDetail.paymentMethod && <InfoRow label="Payment" value={ticketDetail.paymentMethod} />}
              </div>
              {/* Live elapsed for active tickets */}
              {ticketDetail.status === 'active' && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: WARNING_BG, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaClock color={WARNING} size={14} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>Parked for: {calcElapsed(ticketDetail.entryTime)}</span>
                </div>
              )}
            </div>
            {ticketDetail.vehicleImageUrl && (
              <img src={ticketDetail.vehicleImageUrl} alt="Vehicle" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
            )}
            {ticketDetail.qrCodeDataUrl && (
              <div style={{ textAlign: 'center', padding: 12 }}>
                <img src={ticketDetail.qrCodeDataUrl} alt="QR" style={{ width: 140, height: 140 }} />
              </div>
            )}
            {ticketDetail.notes && (
              <div style={{ padding: 10, background: '#fef3c7', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
                {ticketDetail.notes}
              </div>
            )}
            {/* Action buttons based on status */}
            {ticketDetail.status === 'active' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => {
                  const tn = ticketDetail.ticketNumber;
                  setTicketDetail(null);
                  setExitModal(true);
                  setExitForm({ ticketNumber: tn, qrData: '' });
                  handleExitLookupDirect(tn);
                }} style={{
                  flex: 1, padding: '12px', background: PRIMARY, color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  <FaSignOutAlt /> Process Exit
                </button>
                <button onClick={() => {
                  openCancelModal(ticketDetail.id);
                }} style={{
                  padding: '12px 16px', background: DANGER_BG, color: DANGER,
                  border: `1px solid ${DANGER}`, borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <FaBan /> Cancel
                </button>
              </div>
            )}
            {ticketDetail.status === 'completed' && (
              <button onClick={() => handlePrintExitSlip(ticketDetail)} style={{
                width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <FaPrint /> Reprint Receipt
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ LOST TICKET MODAL ═══ */}
      {lostTicketModal && (
        <Modal title="Lost Ticket Lookup" onClose={() => { setLostTicketModal(false); setLostTicketResult(null); }} isMobile={isMobile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', background: WARNING_BG, borderRadius: 8, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaExclamationTriangle /> Find a vehicle&apos;s active ticket by searching their plate number.
            </div>

            <FormField label="Vehicle Number *">
              <input value={lostTicketForm.vehicleNumber}
                onChange={e => setLostTicketForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))}
                placeholder="e.g. A 12345 DXB" style={inputStyle} />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Vehicle Type (optional)">
                <select value={lostTicketForm.vehicleType}
                  onChange={e => setLostTicketForm(f => ({ ...f, vehicleType: e.target.value }))} style={inputStyle}>
                  <option value="">Any</option>
                  {vehicleTypes.map(vt => <option key={vt.id} value={vt.id}>{dt(vt.label)}</option>)}
                </select>
              </FormField>
              <FormField label="Vehicle Color (optional)">
                <input value={lostTicketForm.vehicleColor}
                  onChange={e => setLostTicketForm(f => ({ ...f, vehicleColor: e.target.value }))}
                  placeholder="e.g. White" style={inputStyle} />
              </FormField>
            </div>

            {!lostTicketResult ? (
              <button onClick={handleLostTicketLookup} disabled={lostTicketLoading} style={{
                padding: '14px', background: lostTicketLoading ? '#94a3b8' : WARNING,
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
                fontSize: 16, cursor: lostTicketLoading ? 'wait' : 'pointer'
              }}>
                {lostTicketLoading ? <><FaSpinner className="spin" /> Searching...</> : <><FaSearch /> Find Active Ticket</>}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: SUCCESS_BG, borderRadius: 10, padding: 14, border: `1px solid #86efac` }}>
                  <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 8 }}>Ticket Found</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <InfoRow label="Ticket" value={lostTicketResult.ticketNumber} />
                    <InfoRow label="Vehicle" value={lostTicketResult.vehicleNumber} />
                    <InfoRow label="Type" value={dt(lostTicketResult.vehicleType)} />
                    <InfoRow label="Zone" value={dt(lostTicketResult.zoneName) || '-'} />
                    <InfoRow label="Entry" value={formatDateTime(lostTicketResult.entryTime?._seconds ? new Date(lostTicketResult.entryTime._seconds * 1000).toISOString() : lostTicketResult.entryTime)} />
                    <InfoRow label="Parked For" value={calcElapsed(lostTicketResult.entryTime)} />
                  </div>
                </div>
                <button onClick={handleLostTicketExit} disabled={lostTicketLoading} style={{
                  padding: '14px', background: lostTicketLoading ? '#94a3b8' : PRIMARY,
                  color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
                  fontSize: 16, cursor: lostTicketLoading ? 'wait' : 'pointer'
                }}>
                  {lostTicketLoading ? <><FaSpinner className="spin" /> Processing...</> : <><FaSignOutAlt /> Process Exit (Lost Ticket)</>}
                </button>
                <button onClick={() => setLostTicketResult(null)} style={{
                  padding: '10px', background: '#f1f5f9', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 500,
                  fontSize: 14, cursor: 'pointer'
                }}>
                  Search Again
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ═══ CANCEL TICKET MODAL ═══ */}
      {cancelModal && (
        <Modal title="Cancel Ticket" onClose={() => setCancelModal(null)} isMobile={isMobile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '12px 14px', background: DANGER_BG, borderRadius: 8, fontSize: 14, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaExclamationTriangle /> Are you sure you want to cancel this ticket? This action cannot be undone.
            </div>
            <FormField label="Reason for cancellation">
              <input value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Duplicate entry, Customer request..." style={inputStyle} />
            </FormField>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setCancelModal(null)} style={{
                flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14
              }}>
                Keep Ticket
              </button>
              <button onClick={confirmCancelTicket} disabled={cancelLoading} style={{
                flex: 1, padding: '12px', background: cancelLoading ? '#94a3b8' : DANGER,
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600,
                cursor: cancelLoading ? 'wait' : 'pointer', fontSize: 14
              }}>
                {cancelLoading ? 'Cancelling...' : 'Cancel Ticket'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes progressSlide { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes valueChange { 0% { transform: scale(1); } 30% { transform: scale(1.12); color: #0369a1; } 100% { transform: scale(1); } }
        @keyframes refreshPulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );

  // Direct exit lookup helper
  function handleExitLookupDirect(ticketNumber) {
    setExitForm({ ticketNumber, qrData: '' });
    setTimeout(async () => {
      setExitLoading(true);
      try {
        const res = await apiClient.processParkingExit(restaurantId, { ticketNumber });
        if (res.success) setExitPreview(res.exitPreview);
      } catch (e) {
        showToast(e.message || 'Ticket not found', 'error');
      } finally {
        setExitLoading(false);
      }
    }, 100);
  }
}

// ═════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color, subtitle, refreshing, changed }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 20px',
      border: '1px solid #f1f5f9', borderLeft: `4px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
      display: 'flex', alignItems: 'center', gap: 14,
      position: 'relative', overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {refreshing && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{
          fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.1,
          animation: changed ? 'valueChange 0.6s ease' : 'none',
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function LiveViewTab({ stats, zones, config, isMobile, loading, refreshing }) {
  if (loading) {
    return <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
      {[1,2,3].map(i => <Shimmer key={i} h={200} r={14} />)}
    </div>;
  }

  if (!zones || zones.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
        background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <FaLayerGroup size={36} style={{ opacity: 0.3 }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b', margin: '0 0 4px' }}>No zones configured</p>
        <Link href="/parking/zones" style={{ color: PRIMARY, textDecoration: 'underline', fontSize: 14 }}>
          Add zones to get started
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {zones.filter(z => z.isActive).map(zone => {
        const total = zone.totalSlots || 0;
        const occupied = zone.occupiedSlots || 0;
        const available = total - occupied;
        const occupancyPct = total > 0 ? (occupied / total) * 100 : 0;
        const barColor = occupancyPct > 90 ? OCCUPIED : occupancyPct > 70 ? WARNING : AVAILABLE;
        const barGradient = occupancyPct > 90
          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
          : occupancyPct > 70
          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
          : 'linear-gradient(90deg, #22c55e, #16a34a)';

        return (
          <div key={zone.id} style={{
            background: '#fff', borderRadius: 14, padding: 22,
            border: '1px solid #f1f5f9', borderTop: `3px solid ${barColor}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s, transform 0.15s',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {refreshing && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
                pointerEvents: 'none', zIndex: 1, borderRadius: 14,
              }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>{dt(zone.zoneName)}</h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{dt(zone.zoneCode)} &middot; Floor {zone.floor ?? 0}</span>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                background: zone.zoneType === 'vip' ? '#fef3c7' : zone.zoneType === 'reserved' ? '#e0f2fe' : '#f1f5f9',
                color: zone.zoneType === 'vip' ? '#92400e' : zone.zoneType === 'reserved' ? '#0369a1' : '#475569'
              }}>
                {dt(zone.zoneType)}
              </span>
            </div>

            {/* Occupancy Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                fontSize: 12, color: '#64748b', marginBottom: 6
              }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{Math.round(occupancyPct)}% occupied</span>
                <span>{available} of {total} available</span>
              </div>
              <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%', width: `${occupancyPct}%`, background: barGradient,
                  borderRadius: 6, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>

            {/* Stats Row with circular badges */}
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              {[
                { label: 'Total', val: total, col: '#475569' },
                { label: 'Occupied', val: occupied, col: OCCUPIED },
                { label: 'Free', val: available, col: AVAILABLE },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', margin: '0 auto 4px',
                    background: `${s.col}10`, border: `2px solid ${s.col}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: s.col
                  }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Modal({ title, onClose, children, isMobile }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: isMobile ? '20px 20px 0 0' : 16,
        width: isMobile ? '100%' : 520, maxHeight: '90vh', overflow: 'auto',
        padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f1f5f9',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaTimes color="#64748b" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box'
};

const quickLinkStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
  fontSize: 13, color: '#475569', textDecoration: 'none', fontWeight: 500,
  cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'all 0.15s',
};
