'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';
import {
  FaWineBottle, FaWeight, FaPlus, FaTimes, FaChartBar,
  FaExclamationTriangle, FaCheck, FaPlay, FaStop, FaHistory,
  FaSync, FaTrash, FaEdit, FaSpinner, FaBoxOpen, FaGlassWhiskey,
  FaTimesCircle, FaCheckCircle
} from 'react-icons/fa';

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────
const colors = {
  bg: '#111827',
  card: '#1f2937',
  cardHover: '#283548',
  text: '#f9fafb',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  accent: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  border: '#374151',
  inputBg: '#374151',
  overlay: 'rgba(0,0,0,0.6)',
};

const styles = {
  page: {
    padding: '24px', maxWidth: '1200px', margin: '0 auto',
    minHeight: '100vh', backgroundColor: colors.bg, color: colors.text,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  title: {
    fontSize: '26px', fontWeight: '800', margin: 0,
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  titleIcon: {
    width: '38px', height: '38px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  subtitle: { fontSize: '13px', color: colors.textMuted, margin: '4px 0 0 48px' },
  btn: (bg = colors.accent) => ({
    padding: '10px 18px', background: bg, color: 'white',
    border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.15s',
  }),
  btnOutline: {
    padding: '10px 18px', background: 'transparent', color: colors.text,
    border: `1px solid ${colors.border}`, borderRadius: '10px',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
  },
  btnSmall: (bg = colors.accent) => ({
    padding: '6px 12px', background: bg, color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
  }),
  tabs: {
    display: 'flex', gap: '2px', backgroundColor: colors.card,
    padding: '4px', borderRadius: '12px', marginBottom: '20px',
  },
  tab: (active) => ({
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    backgroundColor: active ? colors.accent : 'transparent',
    color: active ? 'white' : colors.textMuted,
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  }),
  card: {
    backgroundColor: colors.card, borderRadius: '12px', padding: '16px',
    border: `1px solid ${colors.border}`, marginBottom: '12px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '12px',
  },
  badge: (color) => ({
    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
    backgroundColor: color + '22', color: color, display: 'inline-block',
  }),
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.overlay, display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
    width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
    border: `1px solid ${colors.border}`,
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, margin: 0 },
  closeBtn: {
    background: 'none', border: 'none', color: colors.textMuted,
    cursor: 'pointer', fontSize: '20px', padding: '4px',
  },
  formGroup: { marginBottom: '14px' },
  label: {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%', padding: '10px 12px', backgroundColor: colors.inputBg,
    border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 12px', backgroundColor: colors.inputBg,
    border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  statRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0', fontSize: '13px',
  },
  toast: (type) => ({
    position: 'fixed', top: '20px', right: '20px', zIndex: 2000,
    padding: '14px 20px', borderRadius: '10px',
    backgroundColor: type === 'error' ? '#dc2626' : '#059669',
    color: 'white', fontSize: '14px', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    animation: 'slideInRight 0.3s ease-out',
  }),
  spinner: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '200px',
  },
  emptyState: {
    textAlign: 'center', padding: '48px 20px', color: colors.textMuted,
  },
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function getStatusBadge(status) {
  const map = {
    active: { label: 'Active', color: colors.green },
    sealed: { label: 'Sealed', color: colors.blue },
    empty: { label: 'Empty', color: colors.textDim },
    opened: { label: 'Active', color: colors.green },
    closed: { label: 'Empty', color: colors.textDim },
  };
  const s = map[status] || { label: status, color: colors.textMuted };
  return <span style={styles.badge(s.color)}>{s.label}</span>;
}

function pourAccuracy(pegsPoured, pegsExpected) {
  if (!pegsExpected || pegsExpected === 0) return null;
  return ((pegsPoured / pegsExpected) * 100).toFixed(1);
}

function accuracyColor(pct) {
  if (pct === null) return colors.textMuted;
  const n = parseFloat(pct);
  if (n >= 95 && n <= 105) return colors.green;
  if (n >= 85 && n <= 115) return colors.yellow;
  return colors.accent;
}

function varianceColor(variance) {
  if (variance === undefined || variance === null) return colors.textMuted;
  const abs = Math.abs(variance);
  if (abs <= 5) return colors.green;
  if (abs <= 15) return colors.yellow;
  return colors.accent;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function BarInventoryPage() {
  // Auth & restaurant
  const [restaurantId, setRestaurantId] = useState(null);

  // Data
  const [bottles, setBottles] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // UI
  const [activeTab, setActiveTab] = useState('active');
  const [activeSection, setActiveSection] = useState('bottles'); // 'bottles' | 'reconciliation' | 'history'
  const [toast, setToast] = useState(null);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showWastageModal, setShowWastageModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState(null);

  // Forms
  const emptyRegisterForm = {
    name: '', brand: '', categoryId: '', bottleSize: '750',
    pegSize: '30', fullWeight: '', tareWeight: '', costPrice: '',
  };
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [openWeight, setOpenWeight] = useState('');
  const [wastageForm, setWastageForm] = useState({ quantity: '', reason: '', notes: '' });
  const [closeWeight, setCloseWeight] = useState('');
  const [reconcileBottles, setReconcileBottles] = useState([]);

  // ──────────────────────────────────────────
  // Init
  // ──────────────────────────────────────────
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const rid = user?.restaurantId || localStorage.getItem('selectedRestaurantId');
      if (rid) setRestaurantId(rid);
    } catch {}
  }, []);

  // ──────────────────────────────────────────
  // Data Loading
  // ──────────────────────────────────────────
  const loadBottles = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await apiClient.request(`/api/bar/bottles/${restaurantId}`);
      setBottles(res?.bottles || res || []);
    } catch (err) {
      console.error('Error loading bottles:', err);
      showToast('Failed to load bottles', 'error');
    }
  }, [restaurantId]);

  const loadReconciliations = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await apiClient.request(`/api/bar/reconciliation/${restaurantId}`);
      setReconciliations(res?.reconciliations || res || []);
    } catch (err) {
      console.error('Error loading reconciliations:', err);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      setLoading(true);
      await Promise.all([loadBottles(), loadReconciliations()]);
      setLoading(false);
    };
    load();
  }, [restaurantId, loadBottles, loadReconciliations]);

  // ──────────────────────────────────────────
  // Toast
  // ──────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ──────────────────────────────────────────
  // Bottle Filters
  // ──────────────────────────────────────────
  const filteredBottles = bottles.filter((b) => {
    const s = (b.status || '').toLowerCase();
    if (activeTab === 'active') return s === 'active' || s === 'opened';
    if (activeTab === 'sealed') return s === 'sealed';
    if (activeTab === 'empty') return s === 'empty' || s === 'closed';
    return true;
  });

  // ──────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────
  const handleRegisterBottle = async () => {
    if (!registerForm.name || !registerForm.fullWeight || !registerForm.tareWeight) {
      showToast('Name, full weight, and tare weight are required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.request(`/api/bar/bottles/${restaurantId}`, {
        method: 'POST',
        body: {
          name: registerForm.name,
          brand: registerForm.brand,
          categoryId: registerForm.categoryId || undefined,
          bottleSize: parseFloat(registerForm.bottleSize),
          pegSize: parseFloat(registerForm.pegSize),
          fullWeight: parseFloat(registerForm.fullWeight),
          tareWeight: parseFloat(registerForm.tareWeight),
          costPrice: registerForm.costPrice ? parseFloat(registerForm.costPrice) : undefined,
        },
      });
      showToast('Bottle registered successfully');
      setShowRegisterModal(false);
      setRegisterForm(emptyRegisterForm);
      await loadBottles();
    } catch (err) {
      showToast(err.message || 'Failed to register bottle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenBottle = async () => {
    if (!openWeight || !selectedBottle) {
      showToast('Opening weight is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.request(`/api/bar/bottles/${restaurantId}/${selectedBottle._id || selectedBottle.id}`, {
        method: 'PUT',
        body: { action: 'open', weight: parseFloat(openWeight) },
      });
      showToast('Bottle opened');
      setShowOpenModal(false);
      setOpenWeight('');
      setSelectedBottle(null);
      await loadBottles();
    } catch (err) {
      showToast(err.message || 'Failed to open bottle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordWastage = async () => {
    if (!wastageForm.quantity || !wastageForm.reason || !selectedBottle) {
      showToast('Quantity and reason are required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.request(`/api/bar/bottles/${restaurantId}/${selectedBottle._id || selectedBottle.id}/wastage`, {
        method: 'POST',
        body: {
          quantity: parseFloat(wastageForm.quantity),
          reason: wastageForm.reason,
          notes: wastageForm.notes || undefined,
        },
      });
      showToast('Wastage recorded');
      setShowWastageModal(false);
      setWastageForm({ quantity: '', reason: '', notes: '' });
      setSelectedBottle(null);
      await loadBottles();
    } catch (err) {
      showToast(err.message || 'Failed to record wastage', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseBottle = async () => {
    if (!closeWeight || !selectedBottle) {
      showToast('Closing weight is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.request(`/api/bar/bottles/${restaurantId}/${selectedBottle._id || selectedBottle.id}`, {
        method: 'PUT',
        body: { action: 'close', weight: parseFloat(closeWeight) },
      });
      showToast('Bottle closed');
      setShowCloseModal(false);
      setCloseWeight('');
      setSelectedBottle(null);
      await loadBottles();
    } catch (err) {
      showToast(err.message || 'Failed to close bottle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ──────────────────────────────────────────
  // Reconciliation
  // ──────────────────────────────────────────
  const handleStartSession = async () => {
    setActionLoading(true);
    try {
      await apiClient.request(`/api/bar/reconciliation/${restaurantId}`, {
        method: 'POST',
      });
      showToast('Reconciliation session started');
      await Promise.all([loadBottles(), loadReconciliations()]);
    } catch (err) {
      showToast(err.message || 'Failed to start session', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openReconcileModal = () => {
    const activeBottles = bottles.filter(
      (b) => (b.status || '').toLowerCase() === 'active' || (b.status || '').toLowerCase() === 'opened'
    );
    setReconcileBottles(activeBottles.map((b) => ({
      bottleId: b._id || b.id,
      name: b.name,
      brand: b.brand,
      currentWeight: b.currentWeight || b.openingWeight || '',
      closingWeight: '',
    })));
    setShowReconcileModal(true);
  };

  const handleCloseSession = async () => {
    const openSession = reconciliations.find(
      (r) => (r.status || '').toLowerCase() === 'open' || (r.status || '').toLowerCase() === 'active'
    );
    if (!openSession) {
      showToast('No open session found', 'error');
      return;
    }
    const incomplete = reconcileBottles.some((b) => !b.closingWeight);
    if (incomplete) {
      showToast('Enter closing weight for all bottles', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.request(`/api/bar/reconciliation/${restaurantId}/${openSession._id || openSession.id}`, {
        method: 'PUT',
        body: {
          bottles: reconcileBottles.map((b) => ({
            bottleId: b.bottleId,
            closingWeight: parseFloat(b.closingWeight),
          })),
        },
      });
      showToast('Session closed successfully');
      setShowReconcileModal(false);
      await Promise.all([loadBottles(), loadReconciliations()]);
    } catch (err) {
      showToast(err.message || 'Failed to close session', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const updateReconcileWeight = (index, value) => {
    setReconcileBottles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], closingWeight: value };
      return updated;
    });
  };

  // ──────────────────────────────────────────
  // Computed
  // ──────────────────────────────────────────
  const openSession = reconciliations.find(
    (r) => (r.status || '').toLowerCase() === 'open' || (r.status || '').toLowerCase() === 'active'
  );
  const closedSessions = reconciliations.filter(
    (r) => (r.status || '').toLowerCase() === 'closed' || (r.status || '').toLowerCase() === 'completed'
  );

  // ──────────────────────────────────────────
  // Loading State
  // ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:none; } }`}</style>
        <div style={styles.spinner}>
          <FaSpinner size={24} color={colors.accent} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:none; } }
        input:focus, select:focus { border-color: ${colors.accent} !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={styles.toast(toast.type)}>
          {toast.type === 'error' ? <FaTimesCircle size={14} /> : <FaCheckCircle size={14} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <div style={styles.titleIcon}>
              <FaWineBottle color="white" size={16} />
            </div>
            Bar Inventory
          </h1>
          <p style={styles.subtitle}>Bottle tracking, pour analysis & reconciliation</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button style={styles.btn()} onClick={() => setShowRegisterModal(true)}>
            <FaPlus size={12} /> Register Bottle
          </button>
          <button style={styles.btn(colors.blue)} onClick={() => loadBottles()}>
            <FaSync size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'bottles', label: 'Bottles', icon: FaWineBottle },
          { id: 'reconciliation', label: 'Reconciliation', icon: FaChartBar },
          { id: 'history', label: 'History', icon: FaHistory },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              ...styles.btnOutline,
              backgroundColor: activeSection === s.id ? colors.accent : 'transparent',
              color: activeSection === s.id ? 'white' : colors.textMuted,
              borderColor: activeSection === s.id ? colors.accent : colors.border,
            }}
          >
            <s.icon size={13} /> {s.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* BOTTLES SECTION */}
      {/* ═══════════════════════════════════════ */}
      {activeSection === 'bottles' && (
        <>
          {/* Status Tabs */}
          <div style={styles.tabs}>
            {[
              { id: 'active', label: 'Active', icon: FaGlassWhiskey },
              { id: 'sealed', label: 'Sealed', icon: FaBoxOpen },
              { id: 'empty', label: 'Empty', icon: FaTrash },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={styles.tab(activeTab === tab.id)}
              >
                <tab.icon size={13} /> {tab.label}
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.inputBg,
                  padding: '2px 8px', borderRadius: '10px',
                }}>
                  {bottles.filter((b) => {
                    const st = (b.status || '').toLowerCase();
                    if (tab.id === 'active') return st === 'active' || st === 'opened';
                    if (tab.id === 'sealed') return st === 'sealed';
                    return st === 'empty' || st === 'closed';
                  }).length}
                </span>
              </button>
            ))}
          </div>

          {/* Bottle Cards */}
          {filteredBottles.length === 0 ? (
            <div style={styles.emptyState}>
              <FaWineBottle size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px', fontWeight: 600 }}>No {activeTab} bottles</p>
              <p style={{ fontSize: '13px' }}>
                {activeTab === 'sealed'
                  ? 'Register new bottles to get started'
                  : activeTab === 'active'
                  ? 'Open a sealed bottle to start tracking'
                  : 'Closed bottles will appear here'}
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredBottles.map((bottle) => {
                const bid = bottle._id || bottle.id;
                const accuracy = pourAccuracy(bottle.pegsPoured, bottle.pegsExpected);
                return (
                  <div key={bid} style={styles.card}>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>{bottle.name}</h3>
                        {bottle.brand && (
                          <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{bottle.brand}</p>
                        )}
                      </div>
                      {getStatusBadge(bottle.status)}
                    </div>

                    {/* Weight Info */}
                    <div style={{ backgroundColor: colors.bg, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                      <div style={styles.statRow}>
                        <span style={{ color: colors.textMuted }}>
                          <FaWeight size={10} style={{ marginRight: '6px' }} />Opening Weight
                        </span>
                        <span style={{ fontWeight: 600 }}>{bottle.openingWeight ? `${bottle.openingWeight}g` : '-'}</span>
                      </div>
                      <div style={styles.statRow}>
                        <span style={{ color: colors.textMuted }}>
                          <FaWeight size={10} style={{ marginRight: '6px' }} />Current Weight
                        </span>
                        <span style={{ fontWeight: 600 }}>{bottle.currentWeight ? `${bottle.currentWeight}g` : '-'}</span>
                      </div>
                      <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: '6px', paddingTop: '6px' }}>
                        <div style={styles.statRow}>
                          <span style={{ color: colors.textMuted }}>Pegs Poured</span>
                          <span style={{ fontWeight: 600 }}>
                            {bottle.pegsPoured ?? '-'} / {bottle.pegsExpected ?? '-'}
                          </span>
                        </div>
                        <div style={styles.statRow}>
                          <span style={{ color: colors.textMuted }}>Pour Accuracy</span>
                          <span style={{ fontWeight: 700, color: accuracyColor(accuracy) }}>
                            {accuracy !== null ? `${accuracy}%` : '-'}
                          </span>
                        </div>
                      </div>
                      {bottle.bottleSize && (
                        <div style={styles.statRow}>
                          <span style={{ color: colors.textMuted }}>Size / Peg</span>
                          <span style={{ fontWeight: 600 }}>{bottle.bottleSize}ml / {bottle.pegSize || 30}ml</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(bottle.status === 'sealed') && (
                        <button
                          style={styles.btnSmall(colors.green)}
                          onClick={() => { setSelectedBottle(bottle); setShowOpenModal(true); }}
                        >
                          <FaPlay size={10} /> Open
                        </button>
                      )}
                      {(bottle.status === 'active' || bottle.status === 'opened') && (
                        <>
                          <button
                            style={styles.btnSmall(colors.yellow)}
                            onClick={() => { setSelectedBottle(bottle); setShowWastageModal(true); }}
                          >
                            <FaExclamationTriangle size={10} /> Wastage
                          </button>
                          <button
                            style={styles.btnSmall(colors.accent)}
                            onClick={() => { setSelectedBottle(bottle); setShowCloseModal(true); }}
                          >
                            <FaStop size={10} /> Close
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* RECONCILIATION SECTION */}
      {/* ═══════════════════════════════════════ */}
      {activeSection === 'reconciliation' && (
        <div>
          <div style={{ ...styles.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>Daily Reconciliation</h2>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                {openSession
                  ? `Session in progress (started ${formatDate(openSession.startedAt || openSession.createdAt)})`
                  : 'No active session. Start one to begin weighing bottles.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!openSession ? (
                <button
                  style={styles.btn(colors.green)}
                  onClick={handleStartSession}
                  disabled={actionLoading}
                >
                  {actionLoading ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlay size={12} />}
                  Start Session
                </button>
              ) : (
                <button
                  style={styles.btn(colors.accent)}
                  onClick={openReconcileModal}
                  disabled={actionLoading}
                >
                  <FaStop size={12} /> Close Session
                </button>
              )}
            </div>
          </div>

          {/* Variance Report from last closed session */}
          {closedSessions.length > 0 && (() => {
            const last = closedSessions[0];
            const sessionBottles = last.bottles || [];
            return (
              <div style={styles.card}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                  <FaChartBar size={13} style={{ marginRight: '8px' }} />
                  Latest Variance Report
                </h3>
                <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
                  {formatDate(last.closedAt || last.updatedAt)}
                  {last.shift && <span> | Shift: {last.shift}</span>}
                </p>
                {sessionBottles.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <th style={{ textAlign: 'left', padding: '8px', color: colors.textMuted, fontWeight: 600 }}>Bottle</th>
                          <th style={{ textAlign: 'right', padding: '8px', color: colors.textMuted, fontWeight: 600 }}>Consumed (ml)</th>
                          <th style={{ textAlign: 'right', padding: '8px', color: colors.textMuted, fontWeight: 600 }}>Sold (ml)</th>
                          <th style={{ textAlign: 'right', padding: '8px', color: colors.textMuted, fontWeight: 600 }}>Variance (ml)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionBottles.map((sb, idx) => {
                          const variance = (sb.mlConsumed || 0) - (sb.mlSold || 0);
                          return (
                            <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}22` }}>
                              <td style={{ padding: '8px' }}>{sb.name || sb.bottleName || `Bottle ${idx + 1}`}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>{sb.mlConsumed ?? '-'}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>{sb.mlSold ?? '-'}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: varianceColor(variance) }}>
                                {variance > 0 ? '+' : ''}{variance.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: colors.textMuted }}>No bottle data in this session.</p>
                )}
                {last.totalVariance !== undefined && (
                  <div style={{
                    marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
                    backgroundColor: varianceColor(last.totalVariance) + '15',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Total Variance</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: varianceColor(last.totalVariance) }}>
                      {last.totalVariance > 0 ? '+' : ''}{last.totalVariance.toFixed(1)} ml
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* HISTORY SECTION */}
      {/* ═══════════════════════════════════════ */}
      {activeSection === 'history' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            <FaHistory size={15} style={{ marginRight: '8px' }} />
            Reconciliation History
          </h2>
          {closedSessions.length === 0 ? (
            <div style={styles.emptyState}>
              <FaHistory size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px', fontWeight: 600 }}>No reconciliation history</p>
              <p style={{ fontSize: '13px' }}>Completed sessions will appear here</p>
            </div>
          ) : (
            closedSessions.map((session, idx) => {
              const sid = session._id || session.id || idx;
              return (
                <div key={sid} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>
                        {formatDate(session.closedAt || session.updatedAt || session.createdAt)}
                      </p>
                      {session.shift && (
                        <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>Shift: {session.shift}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {session.totalVariance !== undefined && (
                        <span style={{
                          fontSize: '15px', fontWeight: 800,
                          color: varianceColor(session.totalVariance),
                        }}>
                          {session.totalVariance > 0 ? '+' : ''}{session.totalVariance.toFixed(1)} ml
                        </span>
                      )}
                      <span style={styles.badge(colors.green)}>Closed</span>
                    </div>
                  </div>
                  {(session.bottles || []).length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: colors.textMuted }}>
                      {session.bottles.length} bottle{session.bottles.length !== 1 ? 's' : ''} reconciled
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════ */}

      {/* Register Bottle Modal */}
      {showRegisterModal && (
        <div style={styles.modal} onClick={() => setShowRegisterModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}><FaPlus size={14} style={{ marginRight: '8px' }} />Register New Bottle</h3>
              <button style={styles.closeBtn} onClick={() => setShowRegisterModal(false)}><FaTimes /></button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                style={styles.input}
                placeholder="e.g. Johnnie Walker Black Label"
                value={registerForm.name}
                onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Brand</label>
              <input
                style={styles.input}
                placeholder="e.g. Johnnie Walker"
                value={registerForm.brand}
                onChange={(e) => setRegisterForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category ID</label>
              <input
                style={styles.input}
                placeholder="Category identifier"
                value={registerForm.categoryId}
                onChange={(e) => setRegisterForm((f) => ({ ...f, categoryId: e.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bottle Size (ml)</label>
                <select
                  style={styles.select}
                  value={registerForm.bottleSize}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, bottleSize: e.target.value }))}
                >
                  <option value="180">180 ml</option>
                  <option value="375">375 ml</option>
                  <option value="500">500 ml</option>
                  <option value="700">700 ml</option>
                  <option value="750">750 ml</option>
                  <option value="1000">1000 ml</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Peg Size (ml)</label>
                <select
                  style={styles.select}
                  value={registerForm.pegSize}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, pegSize: e.target.value }))}
                >
                  <option value="30">30 ml (Small)</option>
                  <option value="60">60 ml (Large)</option>
                  <option value="90">90 ml (Extra Large)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Weight (g) *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="e.g. 1200"
                  value={registerForm.fullWeight}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, fullWeight: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tare Weight (g) *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="e.g. 450"
                  value={registerForm.tareWeight}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, tareWeight: e.target.value }))}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Cost Price</label>
              <input
                style={styles.input}
                type="number"
                placeholder="Purchase cost"
                value={registerForm.costPrice}
                onChange={(e) => setRegisterForm((f) => ({ ...f, costPrice: e.target.value }))}
              />
            </div>

            <button
              style={{ ...styles.btn(), width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={handleRegisterBottle}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlus size={14} />}
              Register Bottle
            </button>
          </div>
        </div>
      )}

      {/* Open Bottle Modal */}
      {showOpenModal && selectedBottle && (
        <div style={styles.modal} onClick={() => { setShowOpenModal(false); setSelectedBottle(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}><FaPlay size={14} style={{ marginRight: '8px' }} />Open Bottle</h3>
              <button style={styles.closeBtn} onClick={() => { setShowOpenModal(false); setSelectedBottle(null); }}><FaTimes /></button>
            </div>

            <div style={{ ...styles.card, backgroundColor: colors.bg, marginBottom: '16px' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>{selectedBottle.name}</p>
              {selectedBottle.brand && <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{selectedBottle.brand}</p>}
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '4px 0 0' }}>
                Full: {selectedBottle.fullWeight}g | Tare: {selectedBottle.tareWeight}g
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Opening Weight (g) *</label>
              <input
                style={styles.input}
                type="number"
                placeholder="Weigh the bottle and enter grams"
                value={openWeight}
                onChange={(e) => setOpenWeight(e.target.value)}
                autoFocus
              />
            </div>

            <button
              style={{ ...styles.btn(colors.green), width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={handleOpenBottle}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={14} />}
              Confirm Open
            </button>
          </div>
        </div>
      )}

      {/* Wastage Modal */}
      {showWastageModal && selectedBottle && (
        <div style={styles.modal} onClick={() => { setShowWastageModal(false); setSelectedBottle(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <FaExclamationTriangle size={14} style={{ marginRight: '8px', color: colors.yellow }} />
                Record Wastage
              </h3>
              <button style={styles.closeBtn} onClick={() => { setShowWastageModal(false); setSelectedBottle(null); }}><FaTimes /></button>
            </div>

            <div style={{ ...styles.card, backgroundColor: colors.bg, marginBottom: '16px' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{selectedBottle.name}</p>
              {selectedBottle.brand && <p style={{ fontSize: '12px', color: colors.textMuted, margin: '4px 0 0' }}>{selectedBottle.brand}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Quantity (ml) *</label>
              <input
                style={styles.input}
                type="number"
                placeholder="Amount wasted in ml"
                value={wastageForm.quantity}
                onChange={(e) => setWastageForm((f) => ({ ...f, quantity: e.target.value }))}
                autoFocus
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reason *</label>
              <select
                style={styles.select}
                value={wastageForm.reason}
                onChange={(e) => setWastageForm((f) => ({ ...f, reason: e.target.value }))}
              >
                <option value="">Select reason</option>
                <option value="spillage">Spillage</option>
                <option value="breakage">Breakage</option>
                <option value="returned">Customer Return</option>
                <option value="quality">Quality Issue</option>
                <option value="expired">Expired</option>
                <option value="staff_consumption">Staff Consumption</option>
                <option value="complimentary">Complimentary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <input
                style={styles.input}
                placeholder="Additional details (optional)"
                value={wastageForm.notes}
                onChange={(e) => setWastageForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <button
              style={{ ...styles.btn(colors.yellow), width: '100%', justifyContent: 'center', marginTop: '8px', color: '#111' }}
              onClick={handleRecordWastage}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaExclamationTriangle size={14} />}
              Record Wastage
            </button>
          </div>
        </div>
      )}

      {/* Close Bottle Modal */}
      {showCloseModal && selectedBottle && (
        <div style={styles.modal} onClick={() => { setShowCloseModal(false); setSelectedBottle(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}><FaStop size={14} style={{ marginRight: '8px', color: colors.accent }} />Close Bottle</h3>
              <button style={styles.closeBtn} onClick={() => { setShowCloseModal(false); setSelectedBottle(null); }}><FaTimes /></button>
            </div>

            <div style={{ ...styles.card, backgroundColor: colors.bg, marginBottom: '16px' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>{selectedBottle.name}</p>
              {selectedBottle.brand && <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px' }}>{selectedBottle.brand}</p>}
              <div style={styles.statRow}>
                <span style={{ color: colors.textMuted }}>Opening Weight</span>
                <span style={{ fontWeight: 600 }}>{selectedBottle.openingWeight}g</span>
              </div>
              <div style={styles.statRow}>
                <span style={{ color: colors.textMuted }}>Tare Weight</span>
                <span style={{ fontWeight: 600 }}>{selectedBottle.tareWeight}g</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Closing Weight (g) *</label>
              <input
                style={styles.input}
                type="number"
                placeholder="Weigh the empty bottle"
                value={closeWeight}
                onChange={(e) => setCloseWeight(e.target.value)}
                autoFocus
              />
            </div>

            {/* Variance Preview */}
            {closeWeight && selectedBottle.openingWeight && (
              <div style={{
                backgroundColor: colors.bg, borderRadius: '8px', padding: '12px',
                marginBottom: '12px',
              }}>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Variance Preview
                </p>
                <div style={styles.statRow}>
                  <span style={{ color: colors.textMuted }}>Weight Used</span>
                  <span style={{ fontWeight: 600 }}>
                    {(selectedBottle.openingWeight - parseFloat(closeWeight)).toFixed(1)}g
                  </span>
                </div>
                <div style={styles.statRow}>
                  <span style={{ color: colors.textMuted }}>Liquid Used (approx)</span>
                  <span style={{ fontWeight: 600 }}>
                    {(selectedBottle.openingWeight - parseFloat(closeWeight)).toFixed(1)} ml
                  </span>
                </div>
                {selectedBottle.tareWeight && (
                  <div style={styles.statRow}>
                    <span style={{ color: colors.textMuted }}>Remaining Above Tare</span>
                    <span style={{
                      fontWeight: 700,
                      color: parseFloat(closeWeight) <= selectedBottle.tareWeight ? colors.green : colors.yellow,
                    }}>
                      {(parseFloat(closeWeight) - selectedBottle.tareWeight).toFixed(1)}g
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              style={{ ...styles.btn(colors.accent), width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={handleCloseBottle}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaStop size={14} />}
              Close Bottle
            </button>
          </div>
        </div>
      )}

      {/* Reconciliation Close Session Modal */}
      {showReconcileModal && (
        <div style={styles.modal} onClick={() => setShowReconcileModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}><FaChartBar size={14} style={{ marginRight: '8px' }} />Close Session</h3>
              <button style={styles.closeBtn} onClick={() => setShowReconcileModal(false)}><FaTimes /></button>
            </div>

            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
              Enter closing weights for all active bottles to complete reconciliation.
            </p>

            {reconcileBottles.length === 0 ? (
              <p style={{ fontSize: '14px', color: colors.textMuted, textAlign: 'center', padding: '20px' }}>
                No active bottles to reconcile.
              </p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {reconcileBottles.map((rb, idx) => (
                  <div
                    key={rb.bottleId}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', backgroundColor: colors.bg, borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>{rb.name}</p>
                      {rb.brand && <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{rb.brand}</p>}
                      {rb.currentWeight && (
                        <p style={{ fontSize: '11px', color: colors.textDim, margin: '2px 0 0' }}>
                          Current: {rb.currentWeight}g
                        </p>
                      )}
                    </div>
                    <div style={{ width: '130px' }}>
                      <input
                        style={{ ...styles.input, textAlign: 'right' }}
                        type="number"
                        placeholder="Weight (g)"
                        value={rb.closingWeight}
                        onChange={(e) => updateReconcileWeight(idx, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              style={{ ...styles.btn(colors.accent), width: '100%', justifyContent: 'center', marginTop: '16px' }}
              onClick={handleCloseSession}
              disabled={actionLoading || reconcileBottles.length === 0}
            >
              {actionLoading ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={14} />}
              Submit & Close Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
