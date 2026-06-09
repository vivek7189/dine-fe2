'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getDenominationLabels, buildDenomState, getQuickPresets, computeDenomTotal } from '@/lib/denominationData';
import { FaEnvelope, FaSpinner, FaClock as FaClockIcon } from 'react-icons/fa';
import {
  LuBanknote,
  LuClock,
  LuCircleArrowUp,
  LuCircleArrowDown,
  LuLock,
  LuLockOpen,
  LuHistory,
  LuWallet,
  LuTrendingUp,
  LuTrendingDown,
  LuUser,
  LuCalendar,
  LuX,
  LuCheck,
  LuLoaderCircle,
  LuCircleAlert,
  LuChevronDown,
  LuChevronUp,
} from 'react-icons/lu';

// ── Styles ──────────────────────────────────────────────────────────────────

const cardStyle = {
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  padding: '20px',
};

const btnBase = {
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#64748b',
  marginBottom: '6px',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

function formatTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ShiftsCashPage() {
  const { formatCurrency, getCurrencySymbol, currencySettings } = useCurrency();
  const currencyCode = currencySettings?.currencyCode || 'INR';

  // Restaurant ID resolution
  const [restaurantId, setRestaurantId] = useState(null);
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.restaurantId) {
      setRestaurantId(userData.restaurantId);
    } else {
      const savedId = localStorage.getItem('selectedRestaurantId');
      if (savedId) setRestaurantId(savedId);
    }
  }, []);

  // State
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [openingCash, setOpeningCash] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cash in/out form
  const [cashFormType, setCashFormType] = useState(null); // 'in' | 'out' | 'drop' | null
  const [cashAmount, setCashAmount] = useState('');
  const [cashReason, setCashReason] = useState('');

  // Close shift modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingCash, setClosingCash] = useState('');
  const [cashTips, setCashTips] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [closeSummary, setCloseSummary] = useState(null);

  // Duration timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // History toggle
  const [showHistory, setShowHistory] = useState(false);

  // All active shifts (admin/owner only)
  const [allActiveShifts, setAllActiveShifts] = useState([]);

  // User info
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isOwnerAdmin = ['owner', 'admin'].includes((user.role || '').toLowerCase());

  // Email report state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    emailEnabled: false,
    reportEmails: [],
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata',
    reportTime: '08:00'
  });
  const [newEmailInput, setNewEmailInput] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [savingEmailPrefs, setSavingEmailPrefs] = useState(false);

  // ── Data loading ──────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const promises = [
        apiClient.getCurrentShift(restaurantId),
        apiClient.getShiftHistory(restaurantId),
      ];
      if (isOwnerAdmin) {
        promises.push(apiClient.getAllActiveShifts(restaurantId).catch(() => ({ shifts: [] })));
      }
      const results = await Promise.all(promises);
      setShift(results[0].shift || null);
      setShiftHistory(results[1].shifts || []);
      if (isOwnerAdmin && results[2]) {
        setAllActiveShifts(results[2].shifts || []);
      }
    } catch (err) {
      setError('Failed to load shift data');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Auto-refresh shift sales every 120s while shift is open ──────────
  useEffect(() => {
    if (!shift || shift.status !== 'open') return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadData();
    }, 120_000);
    return () => clearInterval(interval);
  }, [shift?.id, shift?.status, loadData]);

  // ── Duration timer ────────────────────────────────────────────────────

  useEffect(() => {
    if (shift && shift.status === 'open' && shift.openedAt) {
      const tick = () => {
        setElapsed(Date.now() - new Date(shift.openedAt).getTime());
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
      return () => clearInterval(timerRef.current);
    } else {
      setElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [shift]);

  // ── Auto-clear messages ───────────────────────────────────────────────

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  // ── Email preferences ────────────────────────────────────────────────

  const loadEmailPreferences = async () => {
    try {
      const response = await apiClient.getEmailPreferences();
      if (response.success && response.preferences) {
        const prefs = { ...response.preferences };
        if (!prefs.reportEmails && prefs.reportEmail) prefs.reportEmails = [prefs.reportEmail];
        if (!prefs.reportEmails) prefs.reportEmails = [];
        prefs.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (prefs.reportTime && !prefs.reportTime.endsWith(':00')) prefs.reportTime = prefs.reportTime.split(':')[0] + ':00';
        setEmailPreferences(prefs);
      }
    } catch (e) { console.error('Error loading email preferences:', e); }
  };

  const saveEmailPreferences = async () => {
    try {
      setSavingEmailPrefs(true);
      let prefsToSave = { ...emailPreferences };
      const pendingEmail = newEmailInput.trim().replace(/,$/, '');
      if (pendingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pendingEmail) && !(prefsToSave.reportEmails || []).includes(pendingEmail) && (prefsToSave.reportEmails?.length || 0) < 5) {
        prefsToSave = { ...prefsToSave, reportEmails: [...(prefsToSave.reportEmails || []), pendingEmail] };
        setEmailPreferences(prefsToSave);
        setNewEmailInput('');
      }
      await apiClient.updateEmailPreferences(prefsToSave);
      setShowEmailModal(false);
    } catch (e) { console.error('Error saving email preferences:', e); }
    finally { setSavingEmailPrefs(false); }
  };

  const sendReportToEmail = async () => {
    try {
      setSendingReport(true);
      setReportSent(false);
      await apiClient.sendTestReport();
      setReportSent(true);
      setTimeout(() => setReportSent(false), 5000);
    } catch (e) { console.error('Error sending report:', e); }
    finally { setSendingReport(false); }
  };

  useEffect(() => {
    if (isOwnerAdmin) {
      loadEmailPreferences();
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────

  const handleOpenShift = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setError('');
    try {
      await apiClient.openShift(restaurantId, {
        openingCash: parseFloat(openingCash) || 0,
      });
      setSuccess('Shift opened successfully');
      setOpeningCash('0');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to open shift');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCashInOut = async () => {
    if (actionLoading || !cashFormType) return;
    const amount = parseFloat(cashAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await apiClient.shiftCashInOut(shift.id, {
        type: cashFormType,
        amount,
        reason: cashReason.trim() || undefined,
      });
      setSuccess(`Cash ${cashFormType === 'in' ? 'added' : cashFormType === 'drop' ? 'drop recorded' : 'removed'} successfully`);
      setCashFormType(null);
      setCashAmount('');
      setCashReason('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to record cash movement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (actionLoading) return;
    const closing = parseFloat(closingCash);
    if (isNaN(closing) || closing < 0) {
      setError('Enter a valid closing cash amount');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const res = await apiClient.closeShift(shift.id, {
        closingCash: closing,
        cashTips: parseFloat(cashTips) || 0,
        closingNotes: closeNotes.trim() || undefined,
      });
      setCloseSummary(res.summary || null);
      if (!res.summary) {
        setShowCloseModal(false);
        setSuccess('Shift closed successfully');
        setClosingCash('');
        setCashTips('');
        setCloseNotes('');
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to close shift');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModalDone = async () => {
    setShowCloseModal(false);
    setCloseSummary(null);
    setClosingCash('');
    setCashTips('');
    setCloseNotes('');
    setSuccess('Shift closed successfully');
    await loadData();
  };

  // ── Computed values ───────────────────────────────────────────────────

  const expectedCash = shift
    ? (shift.openingCash || 0) + (shift.cashSales || 0) + (shift.cashIn || 0) - (shift.cashOut || 0)
    : 0;

  const transactions = shift?.transactions || [];
  const quickPresets = getQuickPresets(currencyCode);

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LuLoaderCircle size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
          Shifts & Cash
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Manage your cash drawer and track per-staff shift activity
        </p>
      </div>

      {/* Email Report Buttons */}
      {isOwnerAdmin && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={sendReportToEmail}
            disabled={sendingReport}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: reportSent ? '#dcfce7' : '#ef4444', color: reportSent ? '#16a34a' : 'white',
              fontSize: '14px', fontWeight: '600', cursor: sendingReport ? 'not-allowed' : 'pointer',
              opacity: sendingReport ? 0.7 : 1
            }}
          >
            {sendingReport ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaEnvelope />}
            {reportSent ? 'Report Sent!' : sendingReport ? 'Sending...' : 'Email Report'}
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              border: '2px solid #e5e7eb', background: 'white',
              color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <FaClockIcon /> Daily Schedule {emailPreferences.emailEnabled ? '(On)' : ''}
          </button>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div style={{ ...cardStyle, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', padding: '14px 20px' }}>
          <LuCircleAlert size={18} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ ...cardStyle, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', padding: '14px 20px' }}>
          <LuCheck size={18} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{success}</span>
        </div>
      )}

      {/* All Active Shifts - Admin/Owner Panel */}
      {isOwnerAdmin && allActiveShifts.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '16px', border: '1px solid #e0e7ff', background: '#fafafe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <LuUser size={16} style={{ color: '#6366f1' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#312e81', margin: 0 }}>
              All Active Shifts ({allActiveShifts.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allActiveShifts.map(s => {
              const isMyShift = s.openedBy?.userId === (user.userId || user.id);
              const openedAt = new Date(s.openedAt);
              const duration = Date.now() - openedAt.getTime();
              const hrs = Math.floor(duration / 3600000);
              const mins = Math.floor((duration % 3600000) / 60000);
              return (
                <div key={s.id} style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: isMyShift ? '#eff6ff' : 'white',
                  border: isMyShift ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {s.openedBy?.name || 'Unknown'}
                      {isMyShift && <span style={{ fontSize: '11px', color: '#3b82f6', marginLeft: '6px' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {s.openedBy?.role || 'staff'}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LuClock size={12} />
                    {hrs}h {mins}m
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', fontFamily: 'monospace', minWidth: '80px', textAlign: 'right' }}>
                    {formatCurrency(s.totalSales || 0)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {s.orderCount || 0} orders
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!shift ? (
        /* ── No Active Shift ─────────────────────────────────────────── */
        <>
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px', marginBottom: '24px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <LuBanknote size={36} style={{ color: '#3b82f6' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
              Start Your Shift
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 28px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
              Open the cash drawer to begin tracking sales, cash movements, and revenue for this shift.
            </p>

            <div style={{ maxWidth: '320px', margin: '0 auto 24px' }}>
              <label style={labelStyle}>Opening Cash</label>
              {/* Quick presets */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
                {quickPresets.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setOpeningCash(String(amt))}
                    style={{
                      ...btnBase,
                      background: openingCash === String(amt) ? '#3b82f6' : '#f1f5f9',
                      color: openingCash === String(amt) ? 'white' : '#64748b',
                      padding: '8px 16px',
                      fontSize: '13px',
                      borderRadius: '8px',
                    }}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: '600', fontSize: '15px' }}>
                  {getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  value={openingCash}
                  onChange={e => setOpeningCash(e.target.value)}
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  style={{ ...inputStyle, paddingLeft: '40px', fontSize: '18px', fontWeight: '600', textAlign: 'right' }}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <button
              onClick={handleOpenShift}
              disabled={actionLoading}
              style={{
                ...btnBase,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '14px 36px',
                fontSize: '16px',
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              {actionLoading ? <LuLoaderCircle size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <LuLockOpen size={18} />}
              {actionLoading ? 'Opening...' : 'Open Cash Drawer'}
            </button>
          </div>

          {/* Download Report & History */}
          <DownloadReportSection restaurantId={restaurantId} formatCurrency={formatCurrency} />

          <ShiftHistorySection
            shiftHistory={shiftHistory}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            formatCurrency={formatCurrency}
          />
        </>
      ) : (
        /* ── Active Shift Dashboard ──────────────────────────────────── */
        <>
          {/* Shift Info Bar */}
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
            border: '1px solid #bfdbfe',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Active Shift</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '13px', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuCalendar size={14} />
                Opened {formatDateTime(shift.openedAt)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#1e40af', fontFamily: 'monospace', fontSize: '14px' }}>
                <LuClock size={14} />
                {formatDuration(elapsed)}
              </span>
              {shift.openedBy && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LuUser size={14} />
                  {typeof shift.openedBy === 'object' ? shift.openedBy.name : shift.openedBy}
                </span>
              )}
            </div>
          </div>

          {/* Sales Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <StatCard icon={<LuTrendingUp size={20} />} label="Total Sales" value={formatCurrency(shift.totalSales || 0)} color="#0f172a" bg="#f1f5f9" />
            <StatCard icon={<LuBanknote size={20} />} label="Cash Sales" value={formatCurrency(shift.cashSales || 0)} color="#16a34a" bg="#f0fdf4" />
            <StatCard icon={<LuWallet size={20} />} label="Card Sales" value={formatCurrency(shift.cardSales || 0)} color="#3b82f6" bg="#eff6ff" />
            <StatCard icon={<LuWallet size={20} />} label="UPI Sales" value={formatCurrency(shift.upiSales || 0)} color="#7c3aed" bg="#f5f3ff" />
            <StatCard icon={<LuHistory size={20} />} label="Orders" value={shift.orderCount || 0} color="#f59e0b" bg="#fffbeb" />
          </div>

          {/* Cash Drawer Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <StatCard icon={<LuWallet size={20} />} label="Opening Cash" value={formatCurrency(shift.openingCash || 0)} color="#3b82f6" bg="#eff6ff" />
            <StatCard icon={<LuCircleArrowUp size={20} />} label="Cash In" value={formatCurrency(shift.cashIn || 0)} color="#16a34a" bg="#f0fdf4" />
            <StatCard icon={<LuCircleArrowDown size={20} />} label="Cash Out" value={formatCurrency(shift.cashOut || 0)} color="#dc2626" bg="#fef2f2" />
            <StatCard icon={<LuTrendingUp size={20} />} label="Expected Cash" value={formatCurrency(expectedCash)} color="#7c3aed" bg="#f5f3ff" />
          </div>

          {/* Cash In/Out Section */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px' }}>
              Cash Movements
            </h3>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCashFormType(cashFormType === 'in' ? null : 'in'); setCashAmount(''); setCashReason(''); }}
                style={{
                  ...btnBase,
                  background: cashFormType === 'in' ? '#16a34a' : '#f0fdf4',
                  color: cashFormType === 'in' ? 'white' : '#16a34a',
                  border: '1px solid #bbf7d0',
                  padding: '10px 20px',
                  fontSize: '14px',
                }}
              >
                <LuCircleArrowUp size={16} /> Cash In
              </button>
              <button
                onClick={() => { setCashFormType(cashFormType === 'out' ? null : 'out'); setCashAmount(''); setCashReason(''); }}
                style={{
                  ...btnBase,
                  background: cashFormType === 'out' ? '#dc2626' : '#fef2f2',
                  color: cashFormType === 'out' ? 'white' : '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '10px 20px',
                  fontSize: '14px',
                }}
              >
                <LuCircleArrowDown size={16} /> Cash Out
              </button>
              <button
                onClick={() => { setCashFormType(cashFormType === 'drop' ? null : 'drop'); setCashAmount(''); setCashReason('Cash drop for security'); }}
                style={{
                  ...btnBase,
                  background: cashFormType === 'drop' ? '#7c3aed' : '#f5f3ff',
                  color: cashFormType === 'drop' ? 'white' : '#7c3aed',
                  border: '1px solid #ddd6fe',
                  padding: '10px 20px',
                  fontSize: '14px',
                }}
              >
                <LuBanknote size={16} /> Cash Drop
              </button>
            </div>

            {/* Inline Cash Form */}
            {cashFormType && (
              <div style={{
                background: cashFormType === 'in' ? '#f0fdf4' : cashFormType === 'drop' ? '#f5f3ff' : '#fef2f2',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                border: `1px solid ${cashFormType === 'in' ? '#bbf7d0' : cashFormType === 'drop' ? '#ddd6fe' : '#fecaca'}`,
              }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1', minWidth: '140px' }}>
                    <label style={labelStyle}>Amount</label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={inputStyle}
                      autoFocus
                    />
                  </div>
                  <div style={{ flex: '2', minWidth: '200px' }}>
                    <label style={labelStyle}>Reason (optional)</label>
                    <input
                      type="text"
                      value={cashReason}
                      onChange={e => setCashReason(e.target.value)}
                      placeholder={cashFormType === 'in' ? 'e.g. Change refill, tip collection' : cashFormType === 'drop' ? 'e.g. Excess cash removed for security' : 'e.g. Vendor payment, petty cash'}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCashInOut}
                      disabled={actionLoading}
                      style={{
                        ...btnBase,
                        background: cashFormType === 'in' ? '#16a34a' : cashFormType === 'drop' ? '#7c3aed' : '#dc2626',
                        color: 'white',
                        padding: '12px 20px',
                        fontSize: '14px',
                        opacity: actionLoading ? 0.7 : 1,
                      }}
                    >
                      {actionLoading ? <LuLoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <LuCheck size={16} />}
                      Submit
                    </button>
                    <button
                      onClick={() => setCashFormType(null)}
                      style={{
                        ...btnBase,
                        background: '#f1f5f9',
                        color: '#64748b',
                        padding: '12px 16px',
                        fontSize: '14px',
                      }}
                    >
                      <LuX size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction List */}
            {transactions.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {transactions.map((tx, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < transactions.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {tx.type === 'in' ? (
                        <LuCircleArrowUp size={18} style={{ color: '#16a34a' }} />
                      ) : tx.type === 'drop' ? (
                        <LuBanknote size={18} style={{ color: '#7c3aed' }} />
                      ) : (
                        <LuCircleArrowDown size={18} style={{ color: '#dc2626' }} />
                      )}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                          {tx.reason || (tx.type === 'in' ? 'Cash In' : tx.type === 'drop' ? 'Cash Drop' : 'Cash Out')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {tx.performedByName || ''} {formatDateTime(tx.performedAt)}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: tx.type === 'in' ? '#16a34a' : tx.type === 'drop' ? '#7c3aed' : '#dc2626',
                    }}>
                      {tx.type === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '14px' }}>
                No cash movements recorded yet
              </div>
            )}
          </div>

          {/* Close Shift Button */}
          <div style={{ ...cardStyle, marginBottom: '24px', textAlign: 'center' }}>
            <button
              onClick={() => setShowCloseModal(true)}
              style={{
                ...btnBase,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '14px 32px',
                fontSize: '15px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <LuLock size={18} />
              Close Shift
            </button>
          </div>

          {/* Download Report & History */}
          <DownloadReportSection restaurantId={restaurantId} formatCurrency={formatCurrency} />

          <ShiftHistorySection
            shiftHistory={shiftHistory}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            formatCurrency={formatCurrency}
          />

          {/* Close Shift Modal */}
          {showCloseModal && (
            <CloseShiftModal
              shift={shift}
              closingCash={closingCash}
              setClosingCash={setClosingCash}
              cashTips={cashTips}
              setCashTips={setCashTips}
              closeNotes={closeNotes}
              setCloseNotes={setCloseNotes}
              closeSummary={closeSummary}
              actionLoading={actionLoading}
              expectedCash={expectedCash}
              handleCloseShift={handleCloseShift}
              handleCloseModalDone={handleCloseModalDone}
              onCancel={() => { setShowCloseModal(false); setCloseSummary(null); setClosingCash(''); setCashTips(''); setCloseNotes(''); }}
              formatCurrency={formatCurrency}
              getCurrencySymbol={getCurrencySymbol}
              currencyCode={currencyCode}
            />
          )}
        </>
      )}

      {/* Email Preferences Modal */}
      {showEmailModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', width: '100%',
            maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Daily Email Reports</h2>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>x</button>
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.5' }}>
              Receive daily AI-powered insights about your restaurant performance, sales trends, and shift summaries.
            </p>

            {/* Enable toggle */}
            <div
              onClick={() => setEmailPreferences(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '12px', marginBottom: '20px', cursor: 'pointer',
                backgroundColor: emailPreferences.emailEnabled ? '#f0fdf4' : '#f9fafb',
                border: emailPreferences.emailEnabled ? '2px solid #86efac' : '2px solid #e5e7eb'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Enable Daily Reports</span>
              <div style={{
                width: '52px', height: '28px', borderRadius: '14px', padding: '3px', cursor: 'pointer',
                backgroundColor: emailPreferences.emailEnabled ? '#22c55e' : '#d1d5db', transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '11px', backgroundColor: 'white',
                  transition: 'all 0.2s', transform: emailPreferences.emailEnabled ? 'translateX(24px)' : 'translateX(0)'
                }} />
              </div>
            </div>

            {/* Email chips + input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Email Addresses</label>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 12px',
                borderRadius: '12px', border: '2px solid #e5e7eb', minHeight: '48px', alignItems: 'center'
              }}>
                {(emailPreferences.reportEmails || []).map((em, idx) => (
                  <span key={idx} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: '#f3f4f6', borderRadius: '8px', padding: '4px 10px', fontSize: '13px', color: '#374151'
                  }}>
                    {em}
                    <button onClick={() => setEmailPreferences(prev => ({ ...prev, reportEmails: prev.reportEmails.filter((_, i) => i !== idx) }))} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: '700', padding: '0 2px'
                    }}>x</button>
                  </span>
                ))}
                {(emailPreferences.reportEmails?.length || 0) < 5 && (
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const val = newEmailInput.trim().replace(/,$/, '');
                        if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && !(emailPreferences.reportEmails || []).includes(val)) {
                          setEmailPreferences(prev => ({ ...prev, reportEmails: [...(prev.reportEmails || []), val] }));
                          setNewEmailInput('');
                        }
                      }
                    }}
                    onBlur={() => {
                      const val = newEmailInput.trim().replace(/,$/, '');
                      if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && !(emailPreferences.reportEmails || []).includes(val) && (emailPreferences.reportEmails?.length || 0) < 5) {
                        setEmailPreferences(prev => ({ ...prev, reportEmails: [...(prev.reportEmails || []), val] }));
                        setNewEmailInput('');
                      }
                    }}
                    placeholder={(emailPreferences.reportEmails?.length || 0) === 0 ? 'Enter email address' : 'Add another...'}
                    style={{ border: 'none', outline: 'none', flex: 1, minWidth: '120px', fontSize: '13px' }}
                  />
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Press Enter or comma to add. Max 5 emails.</p>
            </div>

            {/* Delivery Time */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Delivery Time</label>
              <select
                value={emailPreferences.reportTime}
                onChange={(e) => setEmailPreferences(prev => ({ ...prev, reportTime: e.target.value }))}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', backgroundColor: '#fff' }}
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const val = `${String(i).padStart(2, '0')}:00`;
                  const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                Your timezone: {emailPreferences.timezone?.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={saveEmailPreferences}
                disabled={savingEmailPrefs}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                  fontSize: '14px', fontWeight: '600', cursor: savingEmailPrefs ? 'not-allowed' : 'pointer',
                  opacity: savingEmailPrefs ? 0.7 : 1
                }}
              >
                {savingEmailPrefs ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px' }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {label}
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Shift History ───────────────────────────────────────────────────────────

function ShiftHistorySection({ shiftHistory, showHistory, setShowHistory, formatCurrency }) {
  if (!shiftHistory || shiftHistory.length === 0) return null;

  return (
    <div style={cardStyle}>
      <button
        onClick={() => setShowHistory(!showHistory)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LuHistory size={18} style={{ color: '#64748b' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Shift History
          </h3>
          <span style={{
            background: '#f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: '600',
            padding: '2px 8px', borderRadius: '10px',
          }}>
            {shiftHistory.length}
          </span>
        </div>
        {showHistory ? <LuChevronUp size={18} style={{ color: '#94a3b8' }} /> : <LuChevronDown size={18} style={{ color: '#94a3b8' }} />}
      </button>

      {showHistory && (
        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Date', 'Opened By', 'Opening', 'Total Sales', 'Orders', 'Closing', 'Difference', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shiftHistory.map((s, i) => {
                const diff = s.cashDifference ?? (s.closingCash != null && s.expectedCash != null ? s.closingCash - s.expectedCash : null);
                return (
                  <tr key={s.id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: '#0f172a', fontWeight: '500' }}>
                      {formatDate(s.openedAt)}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#475569' }}>
                      {typeof s.openedBy === 'object' ? s.openedBy.name : (s.openedBy || '-')}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#475569', fontFamily: 'monospace' }}>
                      {formatCurrency(s.openingCash || 0)}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>
                      {s.totalSales != null ? formatCurrency(s.totalSales) : '-'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#475569', textAlign: 'center' }}>
                      {s.orderCount ?? '-'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#475569', fontFamily: 'monospace' }}>
                      {s.closingCash != null ? formatCurrency(s.closingCash) : '-'}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: '600', fontFamily: 'monospace', color: diff == null ? '#94a3b8' : diff >= 0 ? '#16a34a' : '#dc2626' }}>
                      {diff != null ? `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}` : '-'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        background: s.status === 'open' ? '#f0fdf4' : s.status === 'closed' ? '#f1f5f9' : '#fef3c7',
                        color: s.status === 'open' ? '#16a34a' : s.status === 'closed' ? '#64748b' : '#d97706',
                      }}>
                        {s.status || 'closed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Download Shift Report ─────────────────────────────────────────────────────

function DownloadReportSection({ restaurantId, formatCurrency: fmtCurrency }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState(null);
  const [reportStartDate, setReportStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportFormat, setReportFormat] = useState('xlsx');
  const [activePeriod, setActivePeriod] = useState('today');

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isOwnerAdmin = ['owner', 'admin'].includes((user.role || '').toLowerCase());

  const handleDownload = async (staffId) => {
    if (!restaurantId) return;
    setDownloading(true);
    setDownloadType(staffId ? 'my' : 'all');
    try {
      await apiClient.downloadShiftReport(restaurantId, {
        startDate: reportStartDate,
        endDate: reportEndDate,
        staffId,
        format: reportFormat,
      });
    } catch (err) {
      alert(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setReportStartDate(today);
    setReportEndDate(today);
    setActivePeriod('today');
  };
  const setThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    setReportStartDate(start.toISOString().split('T')[0]);
    setReportEndDate(now.toISOString().split('T')[0]);
    setActivePeriod('week');
  };
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setReportStartDate(start.toISOString().split('T')[0]);
    setReportEndDate(now.toISOString().split('T')[0]);
    setActivePeriod('month');
  };

  return (
    <div style={{ ...cardStyle, marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <LuTrendingUp size={18} style={{ color: '#8b5cf6' }} />
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          Download Shift Report
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: '1.5' }}>
        {isOwnerAdmin
          ? 'Download detailed shift reports - your own or all staff. Includes sales breakdown, cash drawer status, shift timing, and payment details.'
          : 'Download your shift report with sales breakdown, cash drawer status, and payment details.'}
      </p>

      {/* Quick period chips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {[
          { label: 'Today', key: 'today', fn: setToday },
          { label: 'This Week', key: 'week', fn: setThisWeek },
          { label: 'This Month', key: 'month', fn: setThisMonth },
        ].map(({ label, key, fn }) => (
          <button key={key} onClick={fn} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none',
            background: activePeriod === key ? '#3b82f6' : '#f1f5f9',
            color: activePeriod === key ? 'white' : '#475569',
            fontSize: '12px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: activePeriod === key ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: '600' }}>From</label>
          <input
            type="date"
            value={reportStartDate}
            onChange={(e) => { setReportStartDate(e.target.value); setActivePeriod(null); }}
            style={{
              padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
              fontSize: '13px', fontFamily: 'inherit', color: '#0f172a', background: 'white',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: '600' }}>To</label>
          <input
            type="date"
            value={reportEndDate}
            onChange={(e) => { setReportEndDate(e.target.value); setActivePeriod(null); }}
            style={{
              padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
              fontSize: '13px', fontFamily: 'inherit', color: '#0f172a', background: 'white',
            }}
          />
        </div>
      </div>

      {/* Format selector */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Format</label>
        <div style={{ display: 'flex', gap: '0', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', width: 'fit-content' }}>
          {[
            { value: 'xlsx', label: 'Excel' },
            { value: 'csv', label: 'CSV' },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setReportFormat(value)} style={{
              padding: '8px 18px', border: 'none', fontSize: '12px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.15s',
              background: reportFormat === value ? '#3b82f6' : 'white',
              color: reportFormat === value ? 'white' : '#64748b',
              borderRight: value !== 'csv' ? '1px solid #e2e8f0' : 'none',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleDownload(user.userId || user.id)}
          disabled={downloading}
          style={{
            ...btnBase,
            background: downloading && downloadType === 'my' ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: downloading && downloadType === 'my' ? '#94a3b8' : 'white',
            padding: '12px 24px', fontSize: '14px', fontWeight: '700',
            cursor: downloading ? 'not-allowed' : 'pointer',
            borderRadius: '12px',
            boxShadow: downloading ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
          }}
        >
          {downloading && downloadType === 'my' ? 'Downloading...' : `Download My Report (${reportFormat.toUpperCase()})`}
        </button>
        {isOwnerAdmin && (
          <button
            onClick={() => handleDownload(null)}
            disabled={downloading}
            style={{
              ...btnBase,
              background: downloading && downloadType === 'all' ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: downloading && downloadType === 'all' ? '#94a3b8' : 'white',
              padding: '12px 24px', fontSize: '14px', fontWeight: '700',
              cursor: downloading ? 'not-allowed' : 'pointer',
              borderRadius: '12px',
              boxShadow: downloading ? 'none' : '0 4px 12px rgba(139,92,246,0.3)',
            }}
          >
            {downloading && downloadType === 'all' ? 'Downloading...' : `All Staff Report (${reportFormat.toUpperCase()})`}
          </button>
        )}
      </div>

      {/* Report contents info */}
      <div style={{ marginTop: '14px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
          Report includes: Shift Summary, Payment Breakdown (Cash/Card/UPI), Cash Transactions{reportFormat === 'xlsx' ? ' - Excel has 3 separate sheets' : ''}
        </p>
      </div>
    </div>
  );
}

// ── Close Shift Modal ───────────────────────────────────────────────────────

function CloseShiftModal({
  shift, closingCash, setClosingCash, cashTips, setCashTips,
  closeNotes, setCloseNotes,
  closeSummary, actionLoading, expectedCash,
  handleCloseShift, handleCloseModalDone, onCancel,
  formatCurrency, getCurrencySymbol, currencyCode,
}) {
  const currSymbol = getCurrencySymbol ? getCurrencySymbol() : '\u20B9';
  const [showDenomination, setShowDenomination] = useState(false);
  const denomLabels = getDenominationLabels(currencyCode, currSymbol);
  const [denominations, setDenominations] = useState(() => buildDenomState(currencyCode));

  const denominationTotal = computeDenomTotal(denomLabels, denominations);

  const handleDenomChange = (key, count) => {
    const newDenoms = { ...denominations, [key]: Math.max(0, parseInt(count) || 0) };
    setDenominations(newDenoms);
    const total = computeDenomTotal(denomLabels, newDenoms);
    setClosingCash(String(total));
  };

  const summary = closeSummary;

  // Post-close summary view
  if (summary) {
    const diff = summary.cashDifference ?? (summary.closingCash - summary.expectedCash);
    return (
      <ModalOverlay onClose={onCancel}>
        <div style={{ ...cardStyle, maxWidth: '480px', width: '100%', margin: '40px auto', padding: '28px', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <LuCheck size={28} style={{ color: '#16a34a' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
              Shift Closed
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Here is your shift summary</p>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <SummaryRow label="Opening Cash" value={formatCurrency(summary.openingCash || 0)} />
            <SummaryRow label="Cash Sales" value={formatCurrency(summary.cashSales || 0)} />
            <SummaryRow label="Card Sales" value={formatCurrency(summary.cardSales || 0)} />
            <SummaryRow label="UPI Sales" value={formatCurrency(summary.upiSales || 0)} />
            <SummaryRow label="Total Sales" value={formatCurrency(summary.totalSales || 0)} bold />
            <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />
            <SummaryRow label="Cash In" value={`+${formatCurrency(summary.cashIn || 0)}`} color="#16a34a" />
            <SummaryRow label="Cash Out" value={`-${formatCurrency(summary.cashOut || 0)}`} color="#dc2626" />
            {(summary.cashTips || 0) > 0 && <SummaryRow label="Cash Tips" value={formatCurrency(summary.cashTips)} />}
            <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />
            <SummaryRow label="Expected Cash" value={formatCurrency(summary.expectedCash || 0)} bold />
            <SummaryRow label="Closing Cash" value={formatCurrency(summary.closingCash || 0)} bold />
            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            <SummaryRow
              label="Difference"
              value={`${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`}
              bold
              color={Math.abs(diff) < 0.01 ? '#0f172a' : diff > 0 ? '#16a34a' : '#dc2626'}
            />
            <SummaryRow label="Total Orders" value={summary.orderCount ?? '-'} />
          </div>

          <button
            onClick={handleCloseModalDone}
            style={{
              ...btnBase,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              width: '100%',
              justifyContent: 'center',
              padding: '14px',
              fontSize: '15px',
            }}
          >
            Done
          </button>
        </div>
      </ModalOverlay>
    );
  }

  // Pre-close form
  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{ ...cardStyle, maxWidth: '480px', width: '100%', margin: '40px auto', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
          <LuX size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <LuLock size={24} style={{ color: '#dc2626' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
            Close Shift
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Count your cash drawer and enter the closing amount</p>
        </div>

        {/* Expected Cash Summary */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <SummaryRow label="Opening Cash" value={formatCurrency(shift.openingCash || 0)} />
          <SummaryRow label="Cash Sales" value={formatCurrency(shift.cashSales || 0)} />
          <SummaryRow label="Cash In" value={`+${formatCurrency(shift.cashIn || 0)}`} color="#16a34a" />
          <SummaryRow label="Cash Out" value={`-${formatCurrency(shift.cashOut || 0)}`} color="#dc2626" />
          <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
          <SummaryRow label="Expected Cash in Drawer" value={formatCurrency(expectedCash)} bold />
        </div>

        {/* Denomination Counting Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setShowDenomination(!showDenomination)}
            style={{
              ...btnBase,
              background: showDenomination ? '#eff6ff' : '#f8fafc',
              color: showDenomination ? '#2563eb' : '#64748b',
              border: `1px solid ${showDenomination ? '#bfdbfe' : '#e2e8f0'}`,
              width: '100%',
              justifyContent: 'center',
              padding: '10px',
              fontSize: '13px',
            }}
          >
            <LuBanknote size={14} />
            {showDenomination ? 'Hide Denomination Counter' : 'Count by Denomination'}
          </button>
        </div>

        {showDenomination && (
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '6px', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Denomination</span>
              <span style={{ fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Count</span>
              <span style={{ fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Subtotal</span>
              {denomLabels.map(d => (
                <React.Fragment key={d.key}>
                  <span style={{ color: '#374151', fontWeight: '500' }}>{d.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={denominations[d.key] || ''}
                    onChange={e => handleDenomChange(d.key, e.target.value)}
                    placeholder="0"
                    style={{ ...inputStyle, padding: '6px 8px', textAlign: 'center', fontSize: '13px' }}
                  />
                  <span style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '500', color: '#475569' }}>
                    {formatCurrency((denominations[d.key] || 0) * d.value)}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ borderTop: '2px solid #e2e8f0', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Total Counted</span>
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px', fontFamily: 'monospace' }}>{formatCurrency(denominationTotal)}</span>
            </div>
          </div>
        )}

        {/* Closing Cash Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Actual Closing Cash</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: '600', fontSize: '15px' }}>
              {currSymbol}
            </span>
            <input
              type="number"
              value={closingCash}
              onChange={e => setClosingCash(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{ ...inputStyle, paddingLeft: '40px', fontSize: '18px', fontWeight: '600', textAlign: 'right' }}
              autoFocus
            />
          </div>
          {closingCash !== '' && (
            <DifferenceDisplay
              difference={parseFloat(closingCash) - expectedCash}
              formatCurrency={formatCurrency}
            />
          )}
        </div>

        {/* Cash Tips */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Cash Tips (optional)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: '600', fontSize: '15px' }}>
              {currSymbol}
            </span>
            <input
              type="number"
              value={cashTips}
              onChange={e => setCashTips(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{ ...inputStyle, paddingLeft: '40px', fontSize: '15px' }}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            value={closeNotes}
            onChange={e => setCloseNotes(e.target.value)}
            placeholder="Any observations about this shift..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{ ...btnBase, background: '#f1f5f9', color: '#64748b', flex: 1, justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCloseShift}
            disabled={actionLoading}
            style={{
              ...btnBase,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              flex: 2,
              justifyContent: 'center',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {actionLoading ? <LuLoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <LuLock size={16} />}
            {actionLoading ? 'Closing...' : 'Confirm Close Shift'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── Small helper components ─────────────────────────────────────────────────

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}

function SummaryRow({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: bold ? '600' : '400' }}>{label}</span>
      <span style={{
        fontSize: bold ? '15px' : '13px',
        fontWeight: bold ? '700' : '500',
        color: color || (bold ? '#0f172a' : '#475569'),
        fontFamily: 'monospace',
      }}>
        {value}
      </span>
    </div>
  );
}

function DifferenceDisplay({ difference, formatCurrency }) {
  if (isNaN(difference)) return null;
  const isZero = Math.abs(difference) < 0.01;
  const isPositive = difference > 0;

  return (
    <div style={{
      marginTop: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: isZero ? '#f0fdf4' : isPositive ? '#f0fdf4' : '#fef2f2',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      {isZero ? (
        <LuCheck size={14} style={{ color: '#16a34a' }} />
      ) : isPositive ? (
        <LuTrendingUp size={14} style={{ color: '#16a34a' }} />
      ) : (
        <LuTrendingDown size={14} style={{ color: '#dc2626' }} />
      )}
      <span style={{
        fontSize: '13px',
        fontWeight: '700',
        color: isZero ? '#16a34a' : isPositive ? '#16a34a' : '#dc2626',
      }}>
        {isZero ? 'Exact match' : `${isPositive ? '+' : ''}${formatCurrency(difference)} ${isPositive ? 'over' : 'short'}`}
      </span>
    </div>
  );
}
