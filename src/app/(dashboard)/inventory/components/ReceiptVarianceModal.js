'use client';

// Ordered vs received for a purchase order, across all its goods receipts (GRNs): per item the
// ordered, received, rejected and accepted quantities, and what is still short (or extra) with
// its value at the PO price. Opened from a GRN row or a PO row in Procurement.
import { createPortal } from 'react-dom';
import { FaTimes, FaClipboardCheck } from 'react-icons/fa';
import { toJsDate } from '../../../../utils/dateParse';
import { fmtQty } from '../utils/formatQty';

const n = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
const r3 = (v) => Math.round(v * 1000) / 1000;
const grnTime = (g) => toJsDate(g.receivedAt || g.receivedDate || g.createdAt)?.getTime() || 0;

// Per-item totals for one PO. Also used for the "Difference" column of the GRN list.
export function poReceiptSummary(po, grns) {
  const own = (grns || []).filter(g => po && g.purchaseOrderId === (po.id || po._id)).sort((a, b) => grnTime(a) - grnTime(b));
  const lines = new Map();
  (po?.items || []).forEach(it => {
    if (!it.inventoryItemId) return;
    lines.set(it.inventoryItemId, {
      id: it.inventoryItemId, name: it.inventoryItemName || it.name || 'Item', unit: it.purchaseUnit || it.unit || '',
      ordered: n(it.quantity), unitPrice: n(it.unitPrice), received: 0, rejected: 0, accepted: 0, reasons: [],
    });
  });
  own.forEach(g => (g.items || []).forEach(i => {
    const key = i.inventoryItemId || i.inventoryItemName;
    if (!lines.has(key)) lines.set(key, { id: key, name: i.inventoryItemName || 'Item', unit: '', ordered: 0, unitPrice: n(i.unitPrice), received: 0, rejected: 0, accepted: 0, reasons: [], notOnPo: true });
    const l = lines.get(key);
    const rec = n(i.receivedQuantity); const rej = Math.min(n(i.rejectedQuantity), rec);
    l.received += rec; l.rejected += rej;
    l.accepted += i.acceptedQuantity !== undefined && i.acceptedQuantity !== null ? n(i.acceptedQuantity) : Math.max(0, rec - rej);
    if (i.rejectionReason) l.reasons.push(i.rejectionReason);
  }));
  const rows = [...lines.values()].map(l => {
    const diff = r3(l.accepted - l.ordered); // − short, + extra
    return { ...l, received: r3(l.received), rejected: r3(l.rejected), accepted: r3(l.accepted), diff, diffValue: Math.round(diff * l.unitPrice * 100) / 100 };
  });
  return {
    grns: own, rows,
    short: rows.filter(r => r.diff < -0.0005).length,
    extra: rows.filter(r => r.diff > 0.0005).length,
    rejected: rows.filter(r => r.rejected > 0).length,
    shortValue: rows.reduce((s, r) => s + (r.diff < 0 ? -r.diffValue : 0), 0),
  };
}

export default function ReceiptVarianceModal({ po, grn, grns, supplierName, onClose, formatCurrency }) {
  if (typeof document === 'undefined' || (!po && !grn)) return null;
  const fmt = formatCurrency || ((v) => (Number(v) || 0).toFixed(2));
  const sum = po ? poReceiptSummary(po, grns) : null;
  // A GRN whose PO is no longer in the list: show just that receipt.
  const grnOnlyRows = !po && grn ? (grn.items || []).map(i => ({
    id: i.inventoryItemId, name: i.inventoryItemName || 'Item', unit: '', ordered: n(i.orderedQuantity), unitPrice: n(i.unitPrice),
    received: n(i.receivedQuantity), rejected: n(i.rejectedQuantity), accepted: n(i.acceptedQuantity), reasons: i.rejectionReason ? [i.rejectionReason] : [],
  })).map(l => ({ ...l, diff: r3(l.accepted - l.ordered), diffValue: Math.round((l.accepted - l.ordered) * l.unitPrice * 100) / 100 })) : null;
  const rows = sum ? sum.rows : grnOnlyRows;
  const receipts = sum ? sum.grns : [grn];
  const th = { padding: '8px', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' };
  const td = { padding: '8px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap', borderBottom: '1px solid #f3f4f6' };
  const poNo = po ? (po.orderNumber || po.poNumber || po.id) : (grn.purchaseOrderId || '');
  const shortValue = rows.reduce((s, r) => s + (r.diff < 0 ? -r.diffValue : 0), 0);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div data-testid="receipt-variance" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 820, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FaClipboardCheck color="#059669" /> Ordered vs received — PO {poNo}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {supplierName ? `${supplierName} · ` : ''}{receipts.length} goods receipt{receipts.length === 1 ? '' : 's'}
              {receipts.map(g => ` · ${g.grnNumber || (g.id || '').slice(-6)} ${toJsDate(g.receivedAt || g.receivedDate || g.createdAt)?.toLocaleDateString() || ''}`).join('')}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><FaTimes size={13} /></button>
        </div>
        <div style={{ padding: '12px 18px', overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, fontSize: 13 }}>
            {rows.every(r => Math.abs(r.diff) < 0.0005 && r.rejected === 0)
              ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>Everything ordered was received</span>
              : <>
                {rows.some(r => r.diff < -0.0005) && <span style={{ background: '#fef2f2', color: '#991b1b', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>Short: {rows.filter(r => r.diff < -0.0005).length} item(s) · {fmt(shortValue)}</span>}
                {rows.some(r => r.diff > 0.0005) && <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>Extra: {rows.filter(r => r.diff > 0.0005).length} item(s)</span>}
                {rows.some(r => r.rejected > 0) && <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>Rejected: {rows.filter(r => r.rejected > 0).length} item(s)</span>}
              </>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead><tr style={{ background: '#f9fafb' }}>
              <th style={{ ...th, textAlign: 'left' }}>Item</th><th style={th}>Ordered</th><th style={th}>Received</th><th style={th}>Rejected</th><th style={th}>Accepted</th><th style={th}>Difference</th><th style={th}>Value</th>
            </tr></thead>
            <tbody>
              {rows.map(r => {
                const color = r.diff < -0.0005 ? '#b91c1c' : r.diff > 0.0005 ? '#1d4ed8' : '#059669';
                return (
                  <tr key={r.id} data-diff={r.diff}>
                    <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal' }}>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      {r.notOnPo && <div style={{ fontSize: 11, color: '#92400e' }}>Not on the PO</div>}
                      {r.reasons.length > 0 && <div style={{ fontSize: 11, color: '#6b7280' }}>Rejected: {r.reasons.join('; ')}</div>}
                    </td>
                    <td style={td}>{fmtQty(r.ordered)} {r.unit}</td>
                    <td style={td}>{fmtQty(r.received)}</td>
                    <td style={{ ...td, color: r.rejected > 0 ? '#92400e' : '#9ca3af' }}>{fmtQty(r.rejected)}</td>
                    <td style={td}>{fmtQty(r.accepted)}</td>
                    <td style={{ ...td, color, fontWeight: 700 }}>{Math.abs(r.diff) < 0.0005 ? 'OK' : `${r.diff > 0 ? '+' : ''}${fmtQty(r.diff)}`}</td>
                    <td style={{ ...td, color }}>{Math.abs(r.diff) < 0.0005 || !r.unitPrice ? '' : `${r.diffValue < 0 ? '−' : '+'}${fmt(Math.abs(r.diffValue))}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>Difference = accepted − ordered (minus = short, plus = extra). Value at the PO price. Only accepted goods go into stock.</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
