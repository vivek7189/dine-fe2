'use client';

// One supplier invoice, read only: its lines (qty, price, tax, total), totals, what is paid and
// what is left, KRA no., notes and the scanned invoice file. Opened from the Invoices list in
// Procurement. Uses only what the invoices list already loaded — no extra request.
import { createPortal } from 'react-dom';
import { FaTimes, FaFileInvoice } from 'react-icons/fa';
import { toJsDate } from '../../../../utils/dateParse';
import { fmtQty } from '../utils/formatQty';

const n = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
const fmtDay = (v) => { const d = toJsDate(v); return d ? d.toLocaleDateString() : ''; };
const METHOD_LABEL = { cash: 'Cash', bank_transfer: 'Bank transfer', mpesa: 'M-Pesa', upi: 'UPI', cheque: 'Cheque', card: 'Card', other: 'Other' };

export default function InvoiceDetailModal({ invoice, supplierName, payState, onClose, formatCurrency }) {
  if (typeof document === 'undefined' || !invoice) return null;
  const fmt = formatCurrency || ((v) => (Number(v) || 0).toFixed(2));
  const inv = invoice;
  const lines = (inv.items || []).map((it, i) => {
    // As bought (e.g. 2 kg at 2,075) when saved; else the stock-unit qty and price (e.g. 2000 g).
    const asBought = it.purchaseQty != null && n(it.purchaseQty) > 0;
    const qty = asBought ? n(it.purchaseQty) : n(it.quantity);
    const price = asBought ? n(it.purchaseRate) : n(it.unitPrice);
    const tax = n(it.tax);
    return {
      key: `${it.inventoryItemId || it.inventoryItemName || 'line'}-${i}`,
      name: it.inventoryItemName || it.name || 'Item',
      unit: asBought ? (it.purchaseUnit || '') : (it.unit || ''),
      qty, price, tax,
      total: n(it.total) > 0 ? n(it.total) : Math.round((qty * price + tax) * 100) / 100,
    };
  });
  const total = n(inv.totalAmount || inv.amount || inv.total);
  const subtotal = n(inv.subtotal);
  const taxAmount = n(inv.taxAmount);
  const paid = payState ? Math.max(0, Math.round((total - payState.left) * 100) / 100) : n(inv.paidAmount);
  const fileUrl = inv.invoiceFileUrl || inv.imageUrl || '';
  const isPdf = /\.pdf($|\?)/i.test(fileUrl) || /\.pdf$/i.test(inv.invoiceFileName || '');
  const facts = [
    ['Invoice date', fmtDay(inv.invoiceDate || inv.date || inv.invoice_date)],
    ['Received', fmtDay(inv.receivedDate)],
    ['Due date', fmtDay(inv.dueDate)],
    ['Payment terms', inv.paymentTerms || ''],
    ['KRA no.', inv.kraInvoiceNumber || ''],
    ['Stock', inv.stockAdded ? 'Added to stock' : ''],
  ].filter(([, v]) => v);
  const th = { padding: '8px', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' };
  const td = { padding: '8px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap', borderBottom: '1px solid #f3f4f6' };
  const sumRow = (label, value, strong) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: strong ? 14 : 13, fontWeight: strong ? 700 : 500, color: strong ? '#111827' : '#374151', padding: '3px 0' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div data-testid="invoice-detail" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 820, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FaFileInvoice color="#059669" /> Invoice {inv.invoiceNumber || inv.id || ''}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{supplierName || ''}{inv.isOpeningBalance ? ' · from old book' : ''}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><FaTimes size={13} /></button>
        </div>
        <div style={{ padding: '12px 18px', overflow: 'auto' }}>
          {facts.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {facts.map(([k, v]) => (
                <div key={k} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                  <div style={{ color: '#6b7280' }}>{k}</div>
                  <div style={{ fontWeight: 600, color: '#111827', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {lines.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6b7280', padding: '12px 0' }}>No item lines on this invoice.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead><tr style={{ background: '#f9fafb' }}>
                  <th style={{ ...th, textAlign: 'left' }}>Item</th><th style={th}>Qty</th><th style={th}>Unit price</th><th style={th}>Tax</th><th style={th}>Total</th>
                </tr></thead>
                <tbody>
                  {lines.map(l => (
                    <tr key={l.key} data-testid="invoice-detail-line">
                      <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal', fontWeight: 600 }}>{l.name}</td>
                      <td style={td}>{fmtQty(l.qty)}{l.unit ? ` ${l.unit}` : ''}</td>
                      <td style={td}>{fmt(l.price)}</td>
                      <td style={{ ...td, color: l.tax > 0 ? '#374151' : '#9ca3af' }}>{l.tax > 0 ? fmt(l.tax) : '-'}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{fmt(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <div style={{ minWidth: 260 }}>
              {subtotal > 0 && Math.abs(subtotal - total) > 0.005 && sumRow('Subtotal', fmt(subtotal))}
              {taxAmount > 0 && sumRow('Tax', fmt(taxAmount))}
              {sumRow('Invoice total', fmt(total), true)}
              {sumRow('Paid', fmt(paid))}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14, fontWeight: 700, padding: '6px 0 0', marginTop: 4, borderTop: '1px solid #e5e7eb', color: payState?.left > 0 ? '#991b1b' : '#065f46' }}>
                <span>{payState?.left > 0 ? 'Left to pay' : 'Fully paid'}</span>
                <span data-testid="invoice-detail-left">{fmt(payState ? payState.left : Math.max(0, total - paid))}</span>
              </div>
              {paid > 0 && (inv.lastPaidDate || inv.paidDate || inv.paymentMethod) && (
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4, textAlign: 'right' }}>
                  Last paid {fmtDay(inv.lastPaidDate || inv.paidDate)}{inv.paymentMethod ? ` · ${METHOD_LABEL[inv.paymentMethod] || inv.paymentMethod}` : ''}
                </div>
              )}
            </div>
          </div>

          {inv.notes && (
            <div style={{ marginTop: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#78350f', whiteSpace: 'pre-wrap' }}>
              <b>Notes:</b> {inv.notes}
            </div>
          )}

          {fileUrl && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Invoice file</div>
              {isPdf ? (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>Open {inv.invoiceFileName || 'invoice PDF'}</a>
              ) : (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="Open full size">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fileUrl} alt="Invoice" style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                  <div style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600, marginTop: 4 }}>Open full size</div>
                </a>
              )}
            </div>
          )}

          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>Every payment to this supplier: Suppliers → Statement.</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
