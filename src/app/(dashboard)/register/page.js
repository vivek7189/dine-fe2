'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '@/lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getDenominationLabels, buildDenomState, getQuickPresets, computeDenomTotal } from '@/lib/denominationData';
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
  LuStickyNote,
  LuArrowDownToLine,
  LuCreditCard,
  LuReceipt,
  LuHandCoins,
  LuPrinter,
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

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
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

export default function RegisterPage() {
  const { formatCurrency, getCurrencySymbol, currencySettings } = useCurrency();
  const currencySymbol = getCurrencySymbol();
  const currencyCode = currencySettings?.currencyCode || 'INR';
  const denominationLabels = useMemo(
    () => getDenominationLabels(currencyCode, currencySymbol),
    [currencyCode, currencySymbol]
  );
  const emptyDenomState = useMemo(
    () => buildDenomState(currencyCode),
    [currencyCode]
  );
  const openingPresets = useMemo(
    () => getQuickPresets(currencyCode),
    [currencyCode]
  );

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [register, setRegister] = useState(null);
  const [registerHistory, setRegisterHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Open form
  const [openingCash, setOpeningCash] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [opening, setOpening] = useState(false);

  // Active register
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  // Transaction modal
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('in');
  const [txAmount, setTxAmount] = useState('');
  const [txReason, setTxReason] = useState('');
  const [savingTx, setSavingTx] = useState(false);

  // Close modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingCash, setClosingCash] = useState('');
  const [cashTips, setCashTips] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [closing, setClosing] = useState(false);
  const [closeSummary, setCloseSummary] = useState(null);

  // Denomination (closing)
  const [showDenom, setShowDenom] = useState(false);
  const [denoms, setDenoms] = useState(() => buildDenomState('INR'));

  // Denomination (opening)
  const [showOpeningDenom, setShowOpeningDenom] = useState(false);
  const [openingDenoms, setOpeningDenoms] = useState(() => buildDenomState('INR'));

  // Payment summary (live)
  const [livePaymentSummary, setLivePaymentSummary] = useState(null);
  const [loadingPaymentSummary, setLoadingPaymentSummary] = useState(false);

  // History
  const [showHistory, setShowHistory] = useState(false);

  // X-Report
  const [xReportSummary, setXReportSummary] = useState(null);
  const [loadingXReport, setLoadingXReport] = useState(false);

  // Restaurant ID & settings
  const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null;
  const posSettings = useMemo(() => {
    try {
      const r = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('selectedRestaurant') || '{}') : {};
      return r.posSettings || {};
    } catch { return {}; }
  }, []);
  const restaurantName = useMemo(() => {
    try {
      const r = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('selectedRestaurant') || '{}') : {};
      return r.name || 'Restaurant';
    } catch { return 'Restaurant'; }
  }, []);

  // ── Mobile detection ────────────────────────────────────────────────────

  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Data loading ────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.all([
        apiClient.getCurrentRegister(restaurantId),
        apiClient.getRegisterHistory(restaurantId),
      ]);
      setRegister(currentRes.register || null);
      setRegisterHistory(historyRes.registers || []);
    } catch (err) {
      setError('Failed to load register data');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset denomination state when currency changes (only if register not open)
  useEffect(() => {
    if (!register) {
      setDenoms(buildDenomState(currencyCode));
      setOpeningDenoms(buildDenomState(currencyCode));
    }
  }, [currencyCode, register]);

  // Fetch payment summary when register is open
  const fetchPaymentSummary = useCallback(async () => {
    if (!register?.id) return;
    setLoadingPaymentSummary(true);
    try {
      const res = await apiClient.getXReport(register.id);
      setLivePaymentSummary(res.summary || res || null);
    } catch (err) {
      console.error('Failed to fetch payment summary:', err);
    } finally {
      setLoadingPaymentSummary(false);
    }
  }, [register?.id]);

  useEffect(() => {
    if (register && register.status === 'open') {
      fetchPaymentSummary();
    }
  }, [register, fetchPaymentSummary]);

  // ── Duration timer ──────────────────────────────────────────────────────

  useEffect(() => {
    if (register && register.status === 'open') {
      const start = new Date(register.openedAt).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return () => clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [register]);

  // ── Auto-clear messages ─────────────────────────────────────────────────

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const handleOpenRegister = async () => {
    if (opening) return;
    setOpening(true);
    setError('');
    try {
      await apiClient.openRegister(restaurantId, {
        openingCash: parseFloat(openingCash) || 0,
        operatorName: operatorName.trim() || undefined,
        openingNotes: openingNotes.trim() || undefined,
      });
      setSuccess('Register opened successfully');
      setOpeningCash('');
      setOperatorName('');
      setOpeningNotes('');
      localStorage.setItem('registerOpen', 'true');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to open register');
    } finally {
      setOpening(false);
    }
  };

  const handleTransaction = async () => {
    if (savingTx) return;
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setSavingTx(true);
    setError('');
    try {
      await apiClient.registerTransaction(register.id, {
        type: txType,
        amount,
        reason: txReason.trim() || undefined,
      });
      const typeLabel = txType === 'in' ? 'added' : txType === 'drop' ? 'drop recorded' : 'removed';
      setSuccess(`Cash ${typeLabel} successfully`);
      setShowTxModal(false);
      setTxAmount('');
      setTxReason('');
      setTxType('in');
      await loadData();
      fetchPaymentSummary();
    } catch (err) {
      setError(err.message || 'Failed to record cash movement');
    } finally {
      setSavingTx(false);
    }
  };

  const handleCloseRegister = async () => {
    if (closing) return;
    const closingVal = parseFloat(closingCash);
    if (isNaN(closingVal) || closingVal < 0) {
      setError('Enter a valid closing cash amount');
      return;
    }
    setClosing(true);
    setError('');
    try {
      const res = await apiClient.closeRegister(register.id, {
        closingCash: closingVal,
        cashTips: parseFloat(cashTips) || 0,
        closingNotes: closeNotes.trim() || undefined,
        denominations: showDenom ? denoms : undefined,
      });
      setCloseSummary(res.summary || null);
      if (!res.summary) {
        setShowCloseModal(false);
        setSuccess('Register closed successfully');
        setClosingCash('');
        setCashTips('');
        setCloseNotes('');
        setShowDenom(false);
        setDenoms(emptyDenomState);
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to close register');
    } finally {
      setClosing(false);
    }
  };

  const handleCloseModalDone = async () => {
    setShowCloseModal(false);
    setCloseSummary(null);
    setClosingCash('');
    setCashTips('');
    setCloseNotes('');
    setShowDenom(false);
    setDenoms(emptyDenomState);
    setSuccess('Register closed successfully');
    localStorage.setItem('registerOpen', 'false');
    await loadData();
  };

  // ── X-Report ──────────────────────────────────────────────────────────
  const handleXReport = async () => {
    if (!register?.id || loadingXReport) return;
    setLoadingXReport(true);
    setError('');
    try {
      const res = await apiClient.getXReport(register.id);
      setXReportSummary(res.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to generate X-report');
    } finally {
      setLoadingXReport(false);
    }
  };

  // ── Print Z-Report ───────────────────────────────────────────────────
  const handlePrintReport = (summary, reportTitle = 'Z-REPORT / EOD SUMMARY') => {
    const s = summary;
    const fc = formatCurrency;
    const diff = s.cashDifference ?? ((s.closingCash || 0) - (s.expectedCash || 0));
    const html = `<!DOCTYPE html><html><head><title>${reportTitle}</title>
<style>
body{font-family:'Courier New',monospace;width:300px;margin:0 auto;padding:16px;font-size:12px;color:#000;}
.center{text-align:center;}.bold{font-weight:bold;}
.line{border-top:1px dashed #000;margin:8px 0;}
.row{display:flex;justify-content:space-between;padding:2px 0;}
@media print{body{margin:0;padding:8px;}}
</style></head><body>
<div class="center bold">${reportTitle}</div>
<div class="center">${restaurantName}</div>
<div class="center">${s.closedAt ? new Date(s.closedAt).toLocaleString() : s.reportGeneratedAt ? new Date(s.reportGeneratedAt).toLocaleString() : new Date().toLocaleString()}</div>
<div class="center">Operator: ${s.operatorName || register?.operatorName || register?.openedByName || '-'}</div>
<div class="line"></div>
<div class="bold">SALES</div>
<div class="row"><span>Total Sales</span><span>${fc(s.totalSales || 0)}</span></div>
<div class="row"><span>Cash Sales</span><span>${fc(s.cashSales || 0)}</span></div>
<div class="row"><span>Card Sales</span><span>${fc(s.cardSales || 0)}</span></div>
<div class="row"><span>UPI Sales</span><span>${fc(s.upiSales || 0)}</span></div>
<div class="row"><span>Aggregator</span><span>${fc(s.aggregatorSales || 0)}</span></div>
<div class="row"><span>Other</span><span>${fc(s.otherSales || 0)}</span></div>
<div class="line"></div>
<div class="row"><span>Total Orders</span><span>${s.orderCount || 0}</span></div>
<div class="line"></div>
<div class="bold">TIPS & CHARGES</div>
<div class="row"><span>Cash Tips</span><span>${fc(s.cashTips || 0)}</span></div>
<div class="row"><span>Card/UPI Tips</span><span>${fc(s.cardTips || 0)}</span></div>
<div class="row"><span>Service Charge</span><span>${fc(s.serviceChargeCollected || 0)}</span></div>
<div class="line"></div>
<div class="bold">CASH FLOW</div>
<div class="row"><span>Opening Cash</span><span>${fc(s.openingCash || 0)}</span></div>
<div class="row"><span>+ Cash In</span><span>${fc(s.cashIn || 0)}</span></div>
<div class="row"><span>- Cash Out</span><span>${fc(s.cashOut || 0)}</span></div>
<div class="row"><span>- Cash Drops</span><span>${fc(s.cashDrops || 0)}</span></div>
<div class="line"></div>
<div class="bold">RECONCILIATION</div>
<div class="row bold"><span>Expected Cash</span><span>${fc(s.expectedCash || 0)}</span></div>
${s.closingCash !== undefined ? `<div class="row bold"><span>Closing Cash</span><span>${fc(s.closingCash || 0)}</span></div>` : ''}
<div class="line"></div>
${s.closingCash !== undefined ? `<div class="row bold"><span>Difference</span><span>${diff >= 0 ? '+' : ''}${fc(diff)}</span></div><div class="line"></div>` : ''}
<div class="center" style="margin-top:16px;font-size:10px;">Powered by DineOpen</div>
</body></html>`;
    const w = window.open('', '_blank', 'width=350,height=700');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  // ── Computed values ─────────────────────────────────────────────────────

  const cashIn = register ? (register.cashIn || 0) : 0;
  const cashOut = register ? (register.cashOut || 0) : 0;
  const cashDrops = register ? (register.cashDrops || 0) : 0;
  const openCash = register ? (register.openingCash || 0) : 0;
  const expectedCash = openCash + cashIn - cashOut;

  const transactions = register?.transactions || [];

  // ── Denomination helpers ────────────────────────────────────────────────

  const denomTotal = computeDenomTotal(denominationLabels, denoms);

  // ── Render ──────────────────────────────────────────────────────────────

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
          Cash Register
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Manage your cash drawer, track shifts, and reconcile at end of day
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          ...cardStyle,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#dc2626',
          padding: '14px 20px',
        }}>
          <LuCircleAlert size={18} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span>
        </div>
      )}
      {success && (
        <div style={{
          ...cardStyle,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#16a34a',
          padding: '14px 20px',
        }}>
          <LuCheck size={18} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{success}</span>
        </div>
      )}

      {!register ? (
        /* ── No Active Register ─────────────────────────────────────────── */
        <>
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <LuBanknote size={36} style={{ color: '#3b82f6' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
              Open Cash Register
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: '0 0 28px',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Start your shift by opening the cash register. Count your starting cash and record the opening amount.
            </p>

            <div style={{ maxWidth: '380px', margin: '0 auto 20px' }}>
              {/* Opening Cash */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Opening Cash</label>
                {/* Quick presets */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
                  {openingPresets.map(amt => (
                    <button
                      key={amt}
                      onClick={() => { setOpeningCash(String(amt)); setShowOpeningDenom(false); }}
                      style={{
                        ...btnBase,
                        background: openingCash === String(amt) ? '#3b82f6' : '#f1f5f9',
                        color: openingCash === String(amt) ? 'white' : '#64748b',
                        padding: '8px 16px',
                        fontSize: '13px',
                        borderRadius: '8px',
                      }}
                    >
                      {currencySymbol}{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                {/* Denomination counter toggle for opening */}
                {denominationLabels.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <button
                      onClick={() => {
                        if (showOpeningDenom) {
                          setShowOpeningDenom(false);
                          setOpeningDenoms(emptyDenomState);
                          setOpeningCash('');
                        } else {
                          setShowOpeningDenom(true);
                          setOpeningCash('0');
                        }
                      }}
                      style={{
                        ...btnBase,
                        background: showOpeningDenom ? '#eff6ff' : '#f8fafc',
                        color: showOpeningDenom ? '#2563eb' : '#64748b',
                        border: `1px solid ${showOpeningDenom ? '#bfdbfe' : '#e2e8f0'}`,
                        width: '100%',
                        justifyContent: 'center',
                        padding: '8px',
                        fontSize: '12px',
                      }}
                    >
                      <LuBanknote size={14} />
                      {showOpeningDenom ? 'Hide Denomination Counter' : 'Count by Denomination'}
                    </button>
                  </div>
                )}
                {showOpeningDenom && (
                  <DenominationCounter
                    denominationLabels={denominationLabels}
                    denoms={openingDenoms}
                    onDenomChange={(key, count) => {
                      const parsed = Math.max(0, parseInt(count) || 0);
                      const newDenoms = { ...openingDenoms, [key]: parsed };
                      setOpeningDenoms(newDenoms);
                      const total = computeDenomTotal(denominationLabels, { ...newDenoms, [key]: parsed });
                      setOpeningCash(String(total));
                    }}
                    total={computeDenomTotal(denominationLabels, openingDenoms)}
                    formatCurrency={formatCurrency}
                  />
                )}
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontWeight: '600',
                    fontSize: '15px',
                  }}>
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={openingCash}
                    onChange={e => { if (!showOpeningDenom) setOpeningCash(e.target.value); }}
                    onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                    readOnly={showOpeningDenom}
                    placeholder="0.00"
                    style={{
                      ...inputStyle,
                      paddingLeft: '36px',
                      fontSize: '18px',
                      fontWeight: '600',
                      textAlign: 'right',
                    }}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Operator / Worker Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Operator / Worker Name</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  placeholder="Leave blank to use your login name"
                  style={inputStyle}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Optional -- defaults to your logged-in name
                </span>
              </div>

              {/* Opening Notes */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Opening Notes</label>
                <textarea
                  value={openingNotes}
                  onChange={e => setOpeningNotes(e.target.value)}
                  placeholder="Specials, 86'd items, shift notes..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <button
              onClick={handleOpenRegister}
              disabled={opening}
              style={{
                ...btnBase,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '14px 36px',
                fontSize: '16px',
                opacity: opening ? 0.7 : 1,
              }}
            >
              {opening ? (
                <LuLoaderCircle size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <LuLockOpen size={18} />
              )}
              {opening ? 'Opening...' : 'Open Cash Register'}
            </button>
          </div>

          {/* Register History */}
          <RegisterHistorySection
            registerHistory={registerHistory}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
            onPrintReport={handlePrintReport}
          />
        </>
      ) : (
        /* ── Active Register Dashboard ──────────────────────────────────── */
        <>
          {/* Register Info Bar */}
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
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34,197,94,0.4)',
              }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                Register Open
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              fontSize: '13px',
              color: '#475569',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuCalendar size={14} />
                Opened {formatDateTime(register.openedAt)}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '700',
                color: '#1e40af',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}>
                <LuClock size={14} />
                {formatDuration(elapsed)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuUser size={14} />
                {register.operatorName || register.openedByName || register.openedBy || '-'}
              </span>
            </div>
          </div>

          {/* Quick Stats - 5 cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, 1fr)'
              : 'repeat(auto-fit, minmax(155px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <StatCard
              icon={<LuWallet size={20} />}
              label="Opening Cash"
              value={formatCurrency(openCash)}
              color="#3b82f6"
              bg="#eff6ff"
            />
            <StatCard
              icon={<LuCircleArrowUp size={20} />}
              label="Cash In"
              value={formatCurrency(cashIn)}
              color="#16a34a"
              bg="#f0fdf4"
            />
            <StatCard
              icon={<LuCircleArrowDown size={20} />}
              label="Cash Out"
              value={formatCurrency(cashOut)}
              color="#dc2626"
              bg="#fef2f2"
            />
            <StatCard
              icon={<LuArrowDownToLine size={20} />}
              label="Cash Drops"
              value={formatCurrency(cashDrops)}
              color="#6366f1"
              bg="#eef2ff"
            />
            <StatCard
              icon={<LuTrendingUp size={20} />}
              label="Expected Cash"
              value={formatCurrency(expectedCash)}
              color="#7c3aed"
              bg="#f5f3ff"
            />
          </div>

          {/* Payment Summary */}
          {(livePaymentSummary || loadingPaymentSummary) && (
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Payment Summary
                </h3>
                <button
                  onClick={fetchPaymentSummary}
                  disabled={loadingPaymentSummary}
                  style={{
                    ...btnBase,
                    background: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    padding: '6px 14px',
                    fontSize: '12px',
                    opacity: loadingPaymentSummary ? 0.6 : 1,
                  }}
                >
                  {loadingPaymentSummary ? (
                    <LuLoaderCircle size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <LuReceipt size={13} />
                  )}
                  Refresh
                </button>
              </div>
              {loadingPaymentSummary && !livePaymentSummary ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '14px' }}>
                  Loading payment data...
                </div>
              ) : livePaymentSummary ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  gap: '10px',
                }}>
                  <PaymentMethodCard
                    icon={<LuBanknote size={18} />}
                    label="Cash Sales"
                    value={formatCurrency(livePaymentSummary.cashSales || 0)}
                    color="#16a34a"
                    bg="#f0fdf4"
                  />
                  <PaymentMethodCard
                    icon={<LuCreditCard size={18} />}
                    label="Card Sales"
                    value={formatCurrency(livePaymentSummary.cardSales || 0)}
                    color="#2563eb"
                    bg="#eff6ff"
                  />
                  <PaymentMethodCard
                    icon={<LuWallet size={18} />}
                    label="UPI Sales"
                    value={formatCurrency(livePaymentSummary.upiSales || 0)}
                    color="#7c3aed"
                    bg="#f5f3ff"
                  />
                  <PaymentMethodCard
                    icon={<LuReceipt size={18} />}
                    label="Aggregator"
                    value={formatCurrency(livePaymentSummary.aggregatorSales || 0)}
                    color="#ea580c"
                    bg="#fff7ed"
                  />
                  <PaymentMethodCard
                    icon={<LuHandCoins size={18} />}
                    label="Other Sales"
                    value={formatCurrency(livePaymentSummary.otherSales || 0)}
                    color="#64748b"
                    bg="#f8fafc"
                  />
                  <PaymentMethodCard
                    icon={<LuTrendingUp size={18} />}
                    label="Total Sales"
                    value={formatCurrency(livePaymentSummary.totalSales || 0)}
                    color="#0f172a"
                    bg="#f1f5f9"
                    bold
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Cash Movements Section */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px' }}>
              Cash Movements
            </h3>

            {/* Action Buttons - 3 buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setTxType('in');
                  setTxAmount('');
                  setTxReason('');
                  setShowTxModal(true);
                }}
                style={{
                  ...btnBase,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  padding: '10px 20px',
                  fontSize: '14px',
                }}
              >
                <LuCircleArrowUp size={16} /> Cash In
              </button>
              <button
                onClick={() => {
                  setTxType('out');
                  setTxAmount('');
                  setTxReason('');
                  setShowTxModal(true);
                }}
                style={{
                  ...btnBase,
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '10px 20px',
                  fontSize: '14px',
                }}
              >
                <LuCircleArrowDown size={16} /> Cash Out
              </button>
              <button
                onClick={() => {
                  setTxType('drop');
                  setTxAmount('');
                  setTxReason('Cash drop for security');
                  setShowTxModal(true);
                }}
                style={{
                  ...btnBase,
                  background: '#eef2ff',
                  color: '#6366f1',
                  border: '1px solid #c7d2fe',
                  padding: '10px 20px',
                  fontSize: '14px',
                }}
              >
                <LuArrowDownToLine size={16} /> Cash Drop
              </button>
              <button
                onClick={handleXReport}
                disabled={loadingXReport}
                style={{
                  ...btnBase,
                  background: '#f0f9ff',
                  color: '#0284c7',
                  border: '1px solid #bae6fd',
                  padding: '10px 20px',
                  fontSize: '14px',
                  opacity: loadingXReport ? 0.6 : 1,
                }}
              >
                {loadingXReport ? <LuLoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <LuReceipt size={16} />} X-Report
              </button>
            </div>

            {/* Transaction List */}
            {transactions.length > 0 ? (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {transactions.map((tx, i) => {
                  const isIn = tx.type === 'in';
                  const isDrop = tx.type === 'drop';
                  const isOut = tx.type === 'out';

                  let badgeColor, badgeBg, badgeText, icon, amountColor, amountPrefix;
                  if (isIn) {
                    badgeColor = '#16a34a';
                    badgeBg = '#f0fdf4';
                    badgeText = 'IN';
                    icon = <LuCircleArrowUp size={18} style={{ color: '#16a34a' }} />;
                    amountColor = '#16a34a';
                    amountPrefix = '+';
                  } else if (isDrop) {
                    badgeColor = '#6366f1';
                    badgeBg = '#eef2ff';
                    badgeText = 'DROP';
                    icon = <LuArrowDownToLine size={18} style={{ color: '#6366f1' }} />;
                    amountColor = '#6366f1';
                    amountPrefix = '-';
                  } else {
                    badgeColor = '#dc2626';
                    badgeBg = '#fef2f2';
                    badgeText = 'OUT';
                    icon = <LuCircleArrowDown size={18} style={{ color: '#dc2626' }} />;
                    amountColor = '#dc2626';
                    amountPrefix = '-';
                  }

                  return (
                    <div key={tx.id || i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: i < transactions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {icon}
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: badgeColor,
                              background: badgeBg,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              {badgeText}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                              {tx.reason || (isIn ? 'Cash In' : isDrop ? 'Cash Drop' : 'Cash Out')}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            {formatDateTime(tx.performedAt || tx.createdAt)}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: amountColor,
                      }}>
                        {amountPrefix}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '14px' }}>
                No cash movements recorded yet
              </div>
            )}
          </div>

          {/* Close Register Button */}
          <div style={{ ...cardStyle, marginBottom: '24px', textAlign: 'center' }}>
            <button
              onClick={() => {
                if (posSettings.requireDenomination) {
                  setShowDenom(true);
                  setClosingCash('0');
                }
                setShowCloseModal(true);
              }}
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
              Close Register
            </button>
          </div>

          {/* Register History */}
          <RegisterHistorySection
            registerHistory={registerHistory}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
            onPrintReport={handlePrintReport}
          />

          {/* Transaction Modal */}
          {showTxModal && (
            <TransactionModal
              txType={txType}
              txAmount={txAmount}
              setTxAmount={setTxAmount}
              txReason={txReason}
              setTxReason={setTxReason}
              savingTx={savingTx}
              handleTransaction={handleTransaction}
              onCancel={() => {
                setShowTxModal(false);
                setTxAmount('');
                setTxReason('');
              }}
              formatCurrency={formatCurrency}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Close Register Modal */}
          {showCloseModal && (
            <CloseRegisterModal
              register={register}
              closingCash={closingCash}
              setClosingCash={setClosingCash}
              cashTips={cashTips}
              setCashTips={setCashTips}
              closeNotes={closeNotes}
              setCloseNotes={setCloseNotes}
              closeSummary={closeSummary}
              closing={closing}
              expectedCash={expectedCash}
              showDenom={showDenom}
              setShowDenom={setShowDenom}
              denoms={denoms}
              setDenoms={setDenoms}
              denomTotal={denomTotal}
              handleCloseRegister={handleCloseRegister}
              handleCloseModalDone={handleCloseModalDone}
              onCancel={() => {
                setShowCloseModal(false);
                setCloseSummary(null);
                setClosingCash('');
                setCashTips('');
                setCloseNotes('');
                setShowDenom(false);
                setDenoms(emptyDenomState);
              }}
              formatCurrency={formatCurrency}
              isMobile={isMobile}
              posSettings={posSettings}
              currencySymbol={currencySymbol}
              denominationLabels={denominationLabels}
              emptyDenomState={emptyDenomState}
            />
          )}

          {/* X-Report Modal */}
          {xReportSummary && (
            <ModalOverlay onClose={() => setXReportSummary(null)}>
              <div style={{
                ...cardStyle,
                maxWidth: '520px',
                width: '100%',
                margin: '40px auto',
                padding: '28px',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: '#eff6ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <LuReceipt size={28} style={{ color: '#2563eb' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
                    X-Report (Mid-Shift)
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                    Snapshot — register stays open
                  </p>
                </div>

                {/* Sales */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LuReceipt size={14} /> Sales
                  </div>
                  <SummaryRow label="Total Sales" value={formatCurrency(xReportSummary.totalSales || 0)} bold />
                  <SummaryRow label="Cash Sales" value={formatCurrency(xReportSummary.cashSales || 0)} />
                  <SummaryRow label="Card Sales" value={formatCurrency(xReportSummary.cardSales || 0)} />
                  <SummaryRow label="UPI Sales" value={formatCurrency(xReportSummary.upiSales || 0)} />
                  <SummaryRow label="Aggregator Sales" value={formatCurrency(xReportSummary.aggregatorSales || 0)} />
                  <SummaryRow label="Other Sales" value={formatCurrency(xReportSummary.otherSales || 0)} />
                  <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />
                  <SummaryRow label="Total Orders" value={xReportSummary.orderCount || 0} />
                </div>

                {/* Tips */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LuHandCoins size={14} /> Tips & Charges
                  </div>
                  <SummaryRow label="Card/UPI Tips" value={formatCurrency(xReportSummary.cardTips || 0)} />
                  <SummaryRow label="Service Charge" value={formatCurrency(xReportSummary.serviceChargeCollected || 0)} />
                </div>

                {/* Cash Flow */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LuBanknote size={14} /> Cash Flow
                  </div>
                  <SummaryRow label="Opening Cash" value={formatCurrency(xReportSummary.openingCash || 0)} />
                  <SummaryRow label="Cash In" value={`+${formatCurrency(xReportSummary.cashIn || 0)}`} color="#16a34a" />
                  <SummaryRow label="Cash Out" value={`-${formatCurrency(xReportSummary.cashOut || 0)}`} color="#dc2626" />
                  <SummaryRow label="Cash Drops" value={`-${formatCurrency(xReportSummary.cashDrops || 0)}`} color="#6366f1" />
                  <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
                  <SummaryRow label="Expected Cash" value={formatCurrency(xReportSummary.expectedCash || 0)} bold />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handlePrintReport(xReportSummary, 'X-REPORT (MID-SHIFT)')}
                    style={{ ...btnBase, background: 'white', color: '#374151', border: '1px solid #d1d5db', flex: 1, justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                  >
                    <LuReceipt size={16} /> Print
                  </button>
                  <button
                    onClick={() => setXReportSummary(null)}
                    style={{ ...btnBase, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', flex: 1, justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </ModalOverlay>
          )}
        </>
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
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          {label}
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Transaction Modal ───────────────────────────────────────────────────────

function TransactionModal({
  txType, txAmount, setTxAmount, txReason, setTxReason,
  savingTx, handleTransaction, onCancel, formatCurrency, currencySymbol,
}) {
  const isIn = txType === 'in';
  const isDrop = txType === 'drop';

  let title, subtitle, accentColor, accentBg, borderColor, iconEl;
  if (isIn) {
    title = 'Cash In';
    subtitle = 'Add cash to the register';
    accentColor = '#16a34a';
    accentBg = '#f0fdf4';
    borderColor = '#bbf7d0';
    iconEl = <LuCircleArrowUp size={24} style={{ color: '#16a34a' }} />;
  } else if (isDrop) {
    title = 'Cash Drop';
    subtitle = 'Remove excess cash for security';
    accentColor = '#6366f1';
    accentBg = '#eef2ff';
    borderColor = '#c7d2fe';
    iconEl = <LuArrowDownToLine size={24} style={{ color: '#6366f1' }} />;
  } else {
    title = 'Cash Out';
    subtitle = 'Remove cash from the register';
    accentColor = '#dc2626';
    accentBg = '#fef2f2';
    borderColor = '#fecaca';
    iconEl = <LuCircleArrowDown size={24} style={{ color: '#dc2626' }} />;
  }

  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{
        ...cardStyle,
        maxWidth: '420px',
        width: '100%',
        margin: '40px auto',
        padding: '28px',
        position: 'relative',
      }}>
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: '4px',
          }}
        >
          <LuX size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            {iconEl}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
            {title}
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{subtitle}</p>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontWeight: '600',
              fontSize: '15px',
            }}>
              {currencySymbol}
            </span>
            <input
              type="number"
              value={txAmount}
              onChange={e => setTxAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{
                ...inputStyle,
                paddingLeft: '36px',
                fontSize: '18px',
                fontWeight: '600',
                textAlign: 'right',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Reason Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Reason (optional)</label>
          <input
            type="text"
            value={txReason}
            onChange={e => setTxReason(e.target.value)}
            placeholder={
              isIn
                ? 'e.g. Change refill, tip collection'
                : isDrop
                  ? 'e.g. Safe deposit, excess cash removal'
                  : 'e.g. Vendor payment, petty cash'
            }
            style={inputStyle}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              ...btnBase,
              background: '#f1f5f9',
              color: '#64748b',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleTransaction}
            disabled={savingTx}
            style={{
              ...btnBase,
              background: accentColor,
              color: 'white',
              flex: 2,
              justifyContent: 'center',
              opacity: savingTx ? 0.7 : 1,
            }}
          >
            {savingTx ? (
              <LuLoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <LuCheck size={16} />
            )}
            {savingTx ? 'Saving...' : `Confirm ${title}`}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── Close Register Modal ────────────────────────────────────────────────────

function CloseRegisterModal({
  register, closingCash, setClosingCash, cashTips, setCashTips,
  closeNotes, setCloseNotes, closeSummary, closing, expectedCash,
  showDenom, setShowDenom, denoms, setDenoms, denomTotal,
  handleCloseRegister, handleCloseModalDone, onCancel, formatCurrency, isMobile, posSettings,
  currencySymbol, denominationLabels, emptyDenomState,
}) {
  const handleDenomChange = (key, count) => {
    const parsed = Math.max(0, parseInt(count) || 0);
    const newDenoms = { ...denoms, [key]: parsed };
    setDenoms(newDenoms);
    const total = computeDenomTotal(denominationLabels, { ...newDenoms, [key]: parsed });
    setClosingCash(String(total));
  };

  const computedDenomTotal = computeDenomTotal(denominationLabels, denoms);

  const handleToggleDenom = () => {
    if (showDenom) {
      // Turning off denomination mode - clear denomination values and let user type manually
      setShowDenom(false);
      setDenoms(emptyDenomState);
      setClosingCash('');
    } else {
      setShowDenom(true);
      // Reset closing cash to denomination total (0 initially)
      setClosingCash('0');
    }
  };

  // ── Phase 2: Summary view (after API returns) ──────────────────────────

  if (closeSummary) {
    const summary = closeSummary;
    const diff = summary.cashDifference ?? ((summary.closingCash || 0) - (summary.expectedCash || 0));
    const diffColor = diff === 0 ? '#64748b' : diff > 0 ? '#16a34a' : '#dc2626';

    return (
      <ModalOverlay onClose={() => {}}>
        <div style={{
          ...cardStyle,
          maxWidth: '520px',
          width: '100%',
          margin: '40px auto',
          padding: '28px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <LuCheck size={28} style={{ color: '#16a34a' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
              Register Closed
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Full shift summary
            </p>
          </div>

          {/* Sales Section */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <LuReceipt size={14} />
              Sales
            </div>
            <SummaryRow
              label="Total Sales"
              value={formatCurrency(summary.totalSales || 0)}
              bold
            />
            <SummaryRow
              label="Cash Sales"
              value={formatCurrency(summary.cashSales || 0)}
            />
            <SummaryRow
              label="Card Sales"
              value={formatCurrency(summary.cardSales || 0)}
            />
            <SummaryRow
              label="UPI Sales"
              value={formatCurrency(summary.upiSales || 0)}
            />
            <SummaryRow
              label="Aggregator Sales"
              value={formatCurrency(summary.aggregatorSales || 0)}
            />
            <SummaryRow
              label="Other Sales"
              value={formatCurrency(summary.otherSales || 0)}
            />
            <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />
            <SummaryRow
              label="Total Orders"
              value={summary.totalOrders ?? summary.orderCount ?? '-'}
            />
          </div>

          {/* Tips & Charges Section */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <LuHandCoins size={14} />
              Tips & Charges
            </div>
            <SummaryRow
              label="Cash Tips Declared"
              value={formatCurrency(summary.cashTips || 0)}
            />
            <SummaryRow
              label="Card/UPI Tips"
              value={formatCurrency(summary.cardTips || 0)}
            />
            <SummaryRow
              label="Service Charge Collected"
              value={formatCurrency(summary.serviceChargeCollected || 0)}
            />
          </div>

          {/* Cash Flow Section */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <LuBanknote size={14} />
              Cash Flow
            </div>
            <SummaryRow
              label="Opening Cash"
              value={formatCurrency(summary.openingCash || 0)}
            />
            <SummaryRow
              label="Cash In"
              value={`+${formatCurrency(summary.cashIn || 0)}`}
              color="#16a34a"
            />
            <SummaryRow
              label="Cash Out"
              value={`-${formatCurrency(summary.cashOut || 0)}`}
              color="#dc2626"
            />
            <SummaryRow
              label="Cash Drops"
              value={`-${formatCurrency(summary.cashDrops || 0)}`}
              color="#6366f1"
            />
          </div>

          {/* Reconciliation Section */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <LuWallet size={14} />
              Reconciliation
            </div>
            <SummaryRow
              label="Expected Cash"
              value={formatCurrency(summary.expectedCash || 0)}
              bold
            />
            <SummaryRow
              label="Closing Cash"
              value={formatCurrency(summary.closingCash || 0)}
              bold
            />
            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            <SummaryRow
              label="Difference"
              value={`${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`}
              bold
              color={diffColor}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handlePrintReport(summary)}
              style={{
                ...btnBase,
                background: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                flex: 1,
                justifyContent: 'center',
                padding: '14px',
                fontSize: '15px',
              }}
            >
              <LuReceipt size={16} /> Print Report
            </button>
            <button
              onClick={handleCloseModalDone}
              style={{
                ...btnBase,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                flex: 1,
                justifyContent: 'center',
                padding: '14px',
                fontSize: '15px',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </ModalOverlay>
    );
  }

  // ── Phase 1: Close form ────────────────────────────────────────────────

  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{
        ...cardStyle,
        maxWidth: '520px',
        width: '100%',
        margin: '40px auto',
        padding: '28px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: '4px',
          }}
        >
          <LuX size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <LuLock size={24} style={{ color: '#dc2626' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
            Close Register
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Count your cash drawer, declare tips, and close out the shift
          </p>
        </div>

        {/* Pre-close Estimate — hidden in blind close mode */}
        {!posSettings.blindClose && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <SummaryRow label="Opening Cash" value={formatCurrency(register.openingCash || 0)} />
            <SummaryRow
              label="Cash In"
              value={`+${formatCurrency(register.cashIn || 0)}`}
              color="#16a34a"
            />
            <SummaryRow
              label="Cash Out"
              value={`-${formatCurrency(register.cashOut || 0)}`}
              color="#dc2626"
            />
            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            <SummaryRow
              label="Estimated Expected Cash"
              value={formatCurrency(expectedCash)}
              bold
            />
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              fontStyle: 'italic',
              marginTop: '4px',
            }}>
              Sales data will be included after closing
            </div>
          </div>
        )}

        {/* Cash Tips Declared */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Cash Tips Declared</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontWeight: '600',
              fontSize: '15px',
            }}>
              {currencySymbol}
            </span>
            <input
              type="number"
              value={cashTips}
              onChange={e => setCashTips(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              style={{ ...inputStyle, paddingLeft: '36px', fontSize: '16px', fontWeight: '600', textAlign: 'right' }}
            />
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
            Cash tips received during shift (optional, defaults to 0)
          </span>
        </div>

        {/* Denomination Counting Toggle — hidden when required */}
        {!posSettings.requireDenomination && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={handleToggleDenom}
              style={{
                ...btnBase,
                background: showDenom ? '#eff6ff' : '#f8fafc',
                color: showDenom ? '#2563eb' : '#64748b',
                border: `1px solid ${showDenom ? '#bfdbfe' : '#e2e8f0'}`,
                width: '100%',
                justifyContent: 'center',
                padding: '10px',
                fontSize: '13px',
              }}
            >
              <LuBanknote size={14} />
              {showDenom ? 'Hide Denomination Counter' : 'Count by Denomination'}
            </button>
          </div>
        )}
        {posSettings.requireDenomination && (
          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#6366f1', fontWeight: 500, textAlign: 'center' }}>
            Denomination counting is required
          </div>
        )}

        {/* Denomination Counter */}
        {showDenom && (
          <DenominationCounter
            denominationLabels={denominationLabels}
            denoms={denoms}
            onDenomChange={handleDenomChange}
            total={computedDenomTotal}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Closing Cash Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Closing Cash</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontWeight: '600',
              fontSize: '15px',
            }}>
              {currencySymbol}
            </span>
            <input
              type="number"
              value={closingCash}
              onChange={e => {
                if (!showDenom) {
                  setClosingCash(e.target.value);
                }
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              readOnly={showDenom}
              style={{
                ...inputStyle,
                paddingLeft: '36px',
                fontSize: '18px',
                fontWeight: '600',
                textAlign: 'right',
                background: showDenom ? '#f1f5f9' : 'white',
                cursor: showDenom ? 'not-allowed' : 'text',
              }}
              autoFocus={!showDenom}
            />
          </div>
          {showDenom && (
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Auto-calculated from denomination count above
            </span>
          )}
          {closingCash !== '' && !posSettings.blindClose && (
            <DifferenceDisplay
              difference={parseFloat(closingCash) - expectedCash}
              formatCurrency={formatCurrency}
              label="vs estimated expected"
            />
          )}
        </div>

        {/* Closing Notes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Closing Notes (optional)</label>
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
            style={{
              ...btnBase,
              background: '#f1f5f9',
              color: '#64748b',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCloseRegister}
            disabled={closing}
            style={{
              ...btnBase,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              flex: 2,
              justifyContent: 'center',
              opacity: closing ? 0.7 : 1,
            }}
          >
            {closing ? (
              <LuLoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <LuLock size={16} />
            )}
            {closing ? 'Closing...' : 'Confirm Close'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── Register History Section ────────────────────────────────────────────────

function RegisterHistorySection({
  registerHistory, showHistory, setShowHistory, formatCurrency, isMobile, onPrintReport,
}) {
  if (!registerHistory || registerHistory.length === 0) return null;

  // Show last 30 entries
  const displayHistory = registerHistory.slice(0, 30);

  return (
    <div style={cardStyle}>
      <button
        onClick={() => setShowHistory(!showHistory)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LuHistory size={18} style={{ color: '#64748b' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Register History
          </h3>
          <span style={{
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            {registerHistory.length}
          </span>
        </div>
        {showHistory ? (
          <LuChevronUp size={18} style={{ color: '#94a3b8' }} />
        ) : (
          <LuChevronDown size={18} style={{ color: '#94a3b8' }} />
        )}
      </button>

      {showHistory && (
        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Date', 'Operator', 'Opening', 'Sales', 'Orders', 'Closing', 'Difference', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    color: '#64748b',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((r, i) => {
                const diff = r.cashDifference ?? (
                  r.closingCash != null && r.expectedCash != null
                    ? r.closingCash - r.expectedCash
                    : null
                );
                const diffColor = diff == null
                  ? '#94a3b8'
                  : diff === 0
                    ? '#64748b'
                    : diff > 0
                      ? '#16a34a'
                      : '#dc2626';

                return (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{
                      padding: '10px 8px',
                      whiteSpace: 'nowrap',
                      color: '#0f172a',
                      fontWeight: '500',
                    }}>
                      {formatDate(r.openedAt)}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#475569' }}>
                      {r.operatorName || r.openedByName || r.openedBy || '-'}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      color: '#475569',
                      fontFamily: 'monospace',
                    }}>
                      {formatCurrency(r.openingCash || 0)}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      color: '#0f172a',
                      fontWeight: '600',
                      fontFamily: 'monospace',
                    }}>
                      {r.totalSales != null ? formatCurrency(r.totalSales) : '-'}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      color: '#475569',
                      textAlign: 'center',
                    }}>
                      {r.totalOrders ?? r.orderCount ?? '-'}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      color: '#475569',
                      fontFamily: 'monospace',
                    }}>
                      {r.closingCash != null ? formatCurrency(r.closingCash) : '-'}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      fontWeight: '600',
                      fontFamily: 'monospace',
                      color: diffColor,
                    }}>
                      {diff != null
                        ? `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`
                        : '-'
                      }
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                      {r.status === 'closed' && r.totalSales != null && (
                        <button
                          onClick={() => onPrintReport({
                            ...r,
                            openingCash: r.openingCash || 0,
                            cashIn: r.cashIn || 0,
                            cashOut: r.cashOut || 0,
                            cashDrops: r.cashDrops || 0,
                          })}
                          title="Print Z-Report"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
                          onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                        >
                          <LuPrinter size={15} />
                        </button>
                      )}
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

// ── Small Helper Components ─────────────────────────────────────────────────

function ModalOverlay({ children, onClose }) {
  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

function SummaryRow({ label, value, bold, color }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 0',
    }}>
      <span style={{
        fontSize: '13px',
        color: '#64748b',
        fontWeight: bold ? '600' : '400',
      }}>
        {label}
      </span>
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

function PaymentMethodCard({ icon, label, value, color, bg, bold }) {
  return (
    <div style={{
      background: bg,
      borderRadius: '10px',
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <div style={{ color, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {label}
        </div>
        <div style={{ fontSize: bold ? '16px' : '15px', fontWeight: bold ? '700' : '600', color: '#0f172a', marginTop: '1px', fontFamily: 'monospace' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function DenominationCounter({ denominationLabels, denoms, onDenomChange, total, formatCurrency }) {
  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 100px',
        gap: '6px',
        alignItems: 'center',
        fontSize: '13px',
      }}>
        <span style={{ fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
          Denomination
        </span>
        <span style={{ fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>
          Count
        </span>
        <span style={{ fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>
          Subtotal
        </span>
        {denominationLabels.map(d => (
          <React.Fragment key={d.key}>
            <span style={{ color: '#374151', fontWeight: '500' }}>{d.label}</span>
            <input
              type="number"
              min="0"
              value={denoms[d.key] || ''}
              onChange={e => onDenomChange(d.key, e.target.value)}
              placeholder="0"
              style={{
                ...inputStyle,
                padding: '6px 8px',
                textAlign: 'center',
                fontSize: '13px',
              }}
            />
            <span style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '500', color: '#475569' }}>
              {formatCurrency((denoms[d.key] || 0) * d.value)}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div style={{
        borderTop: '2px solid #e2e8f0',
        marginTop: '10px',
        paddingTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Total Counted</span>
        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px', fontFamily: 'monospace' }}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}

function DifferenceDisplay({ difference, formatCurrency, label }) {
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
        {isZero
          ? 'Exact match'
          : `${isPositive ? '+' : ''}${formatCurrency(difference)} ${isPositive ? 'over' : 'short'}`
        }
        {label ? ` ${label}` : ''}
      </span>
    </div>
  );
}
