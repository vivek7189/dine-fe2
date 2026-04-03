'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FaExclamationTriangle, FaPlus, FaSync, FaCheckCircle, FaMagic, FaTrash } from 'react-icons/fa';

const InventoryDownloadPDFButton = dynamic(() => import('./pdf/InventoryDownloadPDFButton'), { ssr: false });

const reasonColorMap = {
  spillage: { bg: '#fffbeb', color: '#f59e0b' },
  expired: { bg: '#fef2f2', color: '#ef4444' },
  damaged: { bg: '#f5f3ff', color: '#8b5cf6' },
  leftover: { bg: '#eff6ff', color: '#3b82f6' },
  shrinkage: { bg: '#fdf2f8', color: '#ec4899' },
  other: { bg: '#f3f4f6', color: '#6b7280' },
};

const sourceLabels = {
  MANUAL: 'Manual',
  AUTO_EXPIRY: 'Auto',
  EXPIRY: 'Expiry',
  LEFTOVER: 'AI Leftover',
};

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'this_month', label: 'This Month' },
];

const reasonOptions = [
  { value: '', label: 'All Reasons' },
  { value: 'spillage', label: 'Spillage' },
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'leftover', label: 'Leftover' },
  { value: 'shrinkage', label: 'Shrinkage' },
  { value: 'other', label: 'Other' },
];

const selectStyle = {
  padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 12, background: '#fff', outline: 'none', cursor: 'pointer', color: '#374151',
};

const btnStyle = (bg, color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', background: bg, color,
  border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
});

export default function WasteTab({ waste, inventoryItems, isMobile, formatCurrency }) {
  const {
    loading, wasteEntries, wasteSummary, expiryAlerts,
    wastePeriod, setWastePeriod, wasteReason, setWasteReason,
    setShowQuickWasteModal, setShowLeftoverModal,
    handleMarkExpiredWaste, handleDismissExpired,
    loadWasteData,
  } = waste;

  const todayWaste = wasteSummary?.today || { value: 0, qty: 0 };
  const weekWaste = wasteSummary?.week || { value: 0, qty: 0 };
  const monthWaste = wasteSummary?.month || { value: 0, qty: 0 };
  const topItem = wasteSummary?.topItems?.[0] || null;

  const expiredBatches = expiryAlerts?.expired || [];
  const expiringSoonBatches = expiryAlerts?.expiringSoon || [];

  const totalWasteValue = (wasteEntries || []).reduce((sum, e) => sum + (e.wasteValue || e.value || 0), 0);

  // Sort entries newest first
  const sortedEntries = useMemo(() => {
    if (!wasteEntries?.length) return [];
    return [...wasteEntries].sort((a, b) => {
      const da = new Date(a.date || a.createdAt || 0);
      const db = new Date(b.date || b.createdAt || 0);
      return db - da;
    });
  }, [wasteEntries]);

  const formatTime = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '1px', background: '#e5e7eb', borderRadius: 10, overflow: 'hidden',
      }}>
        {[
          { label: "Today", value: formatCurrency(todayWaste.value), sub: `${todayWaste.qty} entries`, color: '#ef4444' },
          { label: 'This Week', value: formatCurrency(weekWaste.value), sub: `${weekWaste.qty} entries`, color: '#f59e0b' },
          { label: 'This Month', value: formatCurrency(monthWaste.value), sub: `${monthWaste.qty} entries`, color: '#8b5cf6' },
          { label: 'Top Wasted', value: topItem ? (topItem.itemName || topItem.name || '-') : '-', sub: topItem ? formatCurrency(topItem.totalValue || topItem.value || 0) : 'No data', color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#fff', padding: isMobile ? '12px 10px' : '14px 16px',
          }}>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{stat.sub}</div>
            <div style={{ fontSize: 10, color: stat.color, fontWeight: 600, marginTop: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Expired Alerts Banner */}
      {expiredBatches.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FaExclamationTriangle size={13} color="#ef4444" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
              {expiredBatches.length} expired batch{expiredBatches.length !== 1 ? 'es' : ''} found
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {expiredBatches.map((batch, idx) => (
              <div key={batch.id || idx} style={{
                background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #fecaca',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
              }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{batch.inventoryItemName || batch.itemName || '-'}</span>
                  <span style={{ color: '#6b7280', marginLeft: 6 }}>{batch.remainingQty ?? '-'} {batch.unit || ''}</span>
                </div>
                <button onClick={() => handleMarkExpiredWaste(batch.id)} style={btnStyle('#ef4444', '#fff')}>
                  <FaTrash size={10} /> Waste
                </button>
                <button onClick={() => handleDismissExpired(batch.id)} style={{
                  ...btnStyle('#fff', '#6b7280'), border: '1px solid #d1d5db',
                }}>
                  Used
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Soon Banner */}
      {expiringSoonBatches.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12,
        }}>
          <FaExclamationTriangle size={12} color="#f59e0b" />
          <span style={{ fontWeight: 600, color: '#92400e' }}>Expiring soon:</span>
          {expiringSoonBatches.map((b, i) => {
            const daysLeft = b.daysUntilExpiry ?? Math.max(0, Math.ceil((new Date(b.expiryDate || b.expiry) - new Date()) / 86400000));
            return (
              <span key={i} style={{ background: '#fff', padding: '2px 8px', borderRadius: 6, border: '1px solid #fde68a', color: '#92400e' }}>
                {b.inventoryItemName || b.itemName} ({daysLeft}d)
              </span>
            );
          })}
        </div>
      )}

      {/* Toolbar: Actions + Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setShowQuickWasteModal(true)} style={btnStyle('#059669', '#fff')}>
          <FaPlus size={10} /> Log Waste
        </button>
        <button onClick={() => waste.setShowLeftoverModal(true)} style={btnStyle('#7c3aed', '#fff')}>
          <FaMagic size={10} /> AI Leftover
        </button>
        <button onClick={() => loadWasteData()} style={{
          ...btnStyle('#fff', '#6b7280'), border: '1px solid #d1d5db',
        }}>
          <FaSync size={10} /> Refresh
        </button>
        <div style={{ flex: 1 }} />
        <select value={wastePeriod} onChange={(e) => setWastePeriod(e.target.value)} style={selectStyle}>
          {periodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={wasteReason} onChange={(e) => setWasteReason(e.target.value)} style={selectStyle}>
          {reasonOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <InventoryDownloadPDFButton
          reportType="waste"
          data={{ entries: wasteEntries, summary: wasteSummary }}
          org={{}}
          filename="waste-report.pdf"
        />
      </div>

      {/* Single Flat Table */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden',
      }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f0fdf4' }}>
            <div style={{
              width: 14, height: 14, border: '2px solid #e5e7eb', borderTop: '2px solid #059669',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontSize: 12, color: '#059669' }}>Loading...</span>
          </div>
        )}

        {sortedEntries.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
            <FaCheckCircle size={28} style={{ color: '#10b981', opacity: 0.5 }} />
            <div style={{ fontSize: 14, marginTop: 10, color: '#6b7280' }}>No waste entries</div>
            <div style={{ fontSize: 12, marginTop: 4, color: '#9ca3af' }}>Less waste = more profit</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={thStyle}>When</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Item</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Reason</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Value</th>
                    {!isMobile && <th style={thStyle}>Source</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry, idx) => {
                    const rc = reasonColorMap[entry.reason] || reasonColorMap.other;
                    const srcLabel = sourceLabels[entry.source] || entry.source || '-';
                    return (
                      <tr key={entry.id || entry._id || idx} style={{
                        borderBottom: '1px solid #f3f4f6',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...tdStyle, fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {formatTime(entry.date || entry.createdAt)}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>
                          {entry.itemName || '-'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {entry.quantity} {entry.unit || ''}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                            fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color,
                          }}>
                            {entry.reason}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>
                          {formatCurrency(entry.wasteValue || entry.value || 0)}
                        </td>
                        {!isMobile && (
                          <td style={{ ...tdStyle, textAlign: 'center', fontSize: 11, color: '#6b7280' }}>
                            {srcLabel}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total row */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8,
              padding: '12px 16px', borderTop: '2px solid #e5e7eb', background: '#f9fafb',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                {sortedEntries.length} entries · Total:
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>
                {formatCurrency(totalWasteValue)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: '10px 12px', fontSize: 11, fontWeight: 600,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em',
  textAlign: 'center', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb',
};

const tdStyle = {
  padding: '10px 12px', verticalAlign: 'middle',
};
