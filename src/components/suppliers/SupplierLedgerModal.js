'use client';

// Supplier statement (ledger): opening balance, every bill, payment and credit note with a running
// balance, closing balance, advance. Pay / use advance / cancel a payment / print / Excel (CSV).
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaMoneyBillWave, FaPrint, FaFileCsv, FaUndo, FaBook } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { useCurrency } from '../../contexts/CurrencyContext';
import SupplierPayModal, { methodLabel } from './SupplierPayModal';

const fmtDay = (v) => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : ''; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const btn = (bg, color, border) => ({ padding: '8px 12px', borderRadius: 8, border: `1px solid ${border || bg}`, background: bg, color, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' });
const dateInput = { padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 };

function lineText(l) {
  if (l.type === 'bill') return { title: `Bill ${l.ref || ''}`.trim(), sub: [l.kra && `KRA ${l.kra}`, l.dueDate && `due ${fmtDay(l.dueDate)}`].filter(Boolean).join(' · ') };
  if (l.type === 'credit_note') return { title: `Credit note ${l.ref || ''}`.trim(), sub: ['Goods returned', l.unallocated > 0 ? 'not used yet' : ''].filter(Boolean).join(' · ') };
  if (l.type === 'payment_void') return { title: `Payment cancelled${l.ref ? ` (${l.ref})` : ''}`, sub: l.voidReason || '' };
  if (l.legacy) return { title: `Payment on bill ${l.ref || ''}`.trim(), sub: methodLabel(l.method) };
  const bills = (l.allocations || []).map(a => a.invoiceNumber).filter(Boolean);
  return {
    title: `Payment${l.method ? ` · ${methodLabel(l.method)}` : ''}${l.ref ? ` · ${l.ref}` : ''}`,
    sub: [bills.length ? `for ${bills.join(', ')}` : '', l.unallocated > 0 ? 'advance' : '', l.notes].filter(Boolean).join(' · '),
  };
}

export default function SupplierLedgerModal({ restaurantId, supplier, onClose, onChanged, formatCurrency, restaurantName = '' }) {
  const { formatCurrency: fmtCtx } = useCurrency();
  const fmtRaw = formatCurrency || fmtCtx;
  // Minus in front of the currency (−KSh100.00, not KSh-100.00) — a minus balance = paid ahead.
  const fmt = (v) => (Number(v) < 0 ? `−${fmtRaw(-Number(v))}` : fmtRaw(v));
  const supplierId = supplier?.id || supplier?.supplierId;
  const [range, setRange] = useState({ from: '', to: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);

  const reqNo = useRef(0); // only the latest request may fill the table (dates changed quickly)
  const load = useCallback(async () => {
    if (!restaurantId || !supplierId) return;
    const mine = ++reqNo.current;
    setLoading(true); setErr('');
    try { const d = await apiClient.getSupplierLedger(restaurantId, supplierId, range); if (mine === reqNo.current) setData(d); }
    catch (e) { if (mine === reqNo.current) setErr(e.message || 'Could not load the statement'); }
    finally { if (mine === reqNo.current) setLoading(false); }
  }, [restaurantId, supplierId, range]);
  useEffect(() => { load(); }, [load]);

  const changed = () => { load(); onChanged && onChanged(); };

  const applyAdvance = async () => {
    setBusy(true); setMsg(''); setErr('');
    try {
      const r = await apiClient.applySupplierAdvance(restaurantId, supplierId);
      setMsg(r.applied > 0 ? `${fmt(r.applied)} of advance set against ${r.bills} bill${r.bills === 1 ? '' : 's'}` : 'No unpaid bills to use the advance on');
      changed();
    } catch (e) { setErr(e.message || 'Could not use the advance'); }
    finally { setBusy(false); }
  };

  const cancelPayment = async (l) => {
    const reason = typeof window !== 'undefined' ? window.prompt(`Cancel this payment of ${fmt(l.credit)}? The bills it paid will show as unpaid again.\n\nReason:`) : null;
    if (!reason || !reason.trim()) return;
    setBusy(true); setMsg(''); setErr('');
    try { await apiClient.voidSupplierPayment(restaurantId, l.id, reason.trim()); setMsg('Payment cancelled'); changed(); }
    catch (e) { setErr(e.message || 'Could not cancel the payment'); }
    finally { setBusy(false); }
  };

  const rows = data?.lines || [];
  const name = data?.supplier?.name || supplier?.name || supplier?.supplierName || '';
  const period = range.from || range.to ? `${range.from ? fmtDay(range.from) : 'Start'} – ${range.to ? fmtDay(range.to) : 'Today'}` : 'All dates';

  const downloadCsv = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const out = [['Date', 'Entry', 'Details', 'Bill amount', 'Paid / credit', 'Balance'].map(q).join(',')];
    out.push([q(''), q('Opening balance'), q(''), q(''), q(''), q(data.openingBalance)].join(','));
    rows.forEach(l => { const t = lineText(l); out.push([fmtDay(l.at), t.title, t.sub, l.debit || '', l.credit || '', l.balance ?? ''].map(q).join(',')); });
    out.push([q(''), q('Closing balance'), q(''), q(data.totals.billed), q(data.totals.paid + data.totals.credited), q(data.closingBalance)].join(','));
    const blob = new Blob([out.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/[^\w-]+/g, '_') || 'supplier'}_statement.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const print = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    const tr = rows.map(l => { const t = lineText(l); return `<tr${l.type === 'payment_void' ? ' style="color:#9ca3af"' : ''}><td>${esc(fmtDay(l.at))}</td><td><b>${esc(t.title)}</b>${t.sub ? `<div class="s">${esc(t.sub)}</div>` : ''}</td><td class="n">${l.debit ? esc(fmt(l.debit)) : ''}</td><td class="n">${l.credit ? esc(fmt(l.credit)) : ''}</td><td class="n">${l.balance != null ? esc(fmt(l.balance)) : ''}</td></tr>`; }).join('');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)} statement</title><style>
      body{font-family:system-ui,Arial,sans-serif;padding:24px;color:#111}h1{font-size:18px;margin:0}h2{font-size:14px;margin:4px 0 16px;color:#555;font-weight:500}
      table{width:100%;border-collapse:collapse;font-size:12px}th,td{border-bottom:1px solid #e5e7eb;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f9fafb}
      .n{text-align:right;white-space:nowrap}.s{color:#6b7280;font-size:11px}.sum{display:flex;gap:24px;margin:0 0 14px;font-size:13px}</style></head><body>
      <h1>${esc(restaurantName ? `${restaurantName} — ` : '')}Supplier statement: ${esc(name)}</h1><h2>${esc(period)}</h2>
      <div class="sum"><div>Opening <b>${esc(fmt(data.openingBalance))}</b></div><div>Bills <b>${esc(fmt(data.totals.billed))}</b></div><div>Paid <b>${esc(fmt(data.totals.paid))}</b></div><div>Credit notes <b>${esc(fmt(data.totals.credited))}</b></div><div>Closing <b>${esc(fmt(data.closingBalance))}</b></div></div>
      <table><thead><tr><th>Date</th><th>Entry</th><th class="n">Bill</th><th class="n">Paid / credit</th><th class="n">Balance</th></tr></thead><tbody>
      <tr><td></td><td><b>Opening balance</b></td><td></td><td></td><td class="n">${esc(fmt(data.openingBalance))}</td></tr>${tr}
      <tr><td></td><td><b>Closing balance</b></td><td></td><td></td><td class="n"><b>${esc(fmt(data.closingBalance))}</b></td></tr></tbody></table>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    w.document.close();
  };

  if (!supplier || typeof document === 'undefined') return null;

  const card = (label, value, color = '#111827') => (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', minWidth: 0 }}>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div data-testid="supplier-ledger" style={{ backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '94vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FaBook size={14} color="#2563eb" /> {name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Supplier statement · {period}{data?.supplier?.phone ? ` · ${data.supplier.phone}` : ''}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><FaTimes size={13} /></button>
        </div>

        <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
          <label style={{ fontSize: 12, color: '#6b7280' }}>From <input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} style={dateInput} /></label>
          <label style={{ fontSize: 12, color: '#6b7280' }}>To <input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} style={dateInput} /></label>
          {(range.from || range.to) && <button style={btn('#fff', '#374151', '#e5e7eb')} onClick={() => setRange({ from: '', to: '' })}>All dates</button>}
          <div style={{ flex: 1 }} />
          <button data-testid="ledger-pay" style={btn('#059669', '#fff')} onClick={() => setPaying(true)}><FaMoneyBillWave size={12} /> Pay</button>
          {data?.advance > 0 && data?.outstanding > 0 && <button data-testid="ledger-use-advance" disabled={busy} style={btn('#eff6ff', '#1d4ed8', '#bfdbfe')} onClick={applyAdvance}>Use advance</button>}
          <button style={btn('#fff', '#374151', '#e5e7eb')} disabled={!data} onClick={print}><FaPrint size={11} /> Print</button>
          <button style={btn('#fff', '#374151', '#e5e7eb')} disabled={!data} onClick={downloadCsv}><FaFileCsv size={12} /> Excel</button>
        </div>

        <div style={{ padding: '12px 18px', overflowY: 'auto', flex: 1 }}>
          {err && <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 8 }}>{err}</div>}
          {msg && <div style={{ color: '#065f46', background: '#ecfdf5', borderRadius: 8, padding: '8px 10px', fontSize: 13, marginBottom: 8 }}>{msg}</div>}
          {!data && loading && <div style={{ color: '#9ca3af', padding: 30, textAlign: 'center' }}>Loading…</div>}
          {data && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 12 }}>
                {card('Opening', fmt(data.openingBalance))}
                {card('Bills', fmt(data.totals.billed))}
                {card('Paid', fmt(data.totals.paid), '#059669')}
                {card('Credit notes', fmt(data.totals.credited))}
                {card('Closing', fmt(data.closingBalance), data.closingBalance > 0 ? '#b91c1c' : '#059669')}
                {data.advance > 0 && card('Advance', fmt(data.advance), '#2563eb')}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table data-testid="ledger-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Entry</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Bill</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Paid / credit</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Balance</th>
                      <th style={{ width: 30 }} />
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 8 }} /><td style={{ padding: 8, fontWeight: 600 }}>Opening balance</td><td /><td />
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{fmt(data.openingBalance)}</td><td />
                    </tr>
                    {rows.map(l => {
                      const t = lineText(l);
                      const voided = l.type === 'payment_void';
                      return (
                        <tr key={`${l.type}-${l.id}`} data-type={l.type} style={{ borderBottom: '1px solid #f3f4f6', color: voided ? '#9ca3af' : '#111827' }}>
                          <td style={{ padding: 8, whiteSpace: 'nowrap' }}>{fmtDay(l.at)}</td>
                          <td style={{ padding: 8 }}>
                            <div style={{ fontWeight: 600, textDecoration: voided ? 'line-through' : 'none' }}>{t.title}</div>
                            {t.sub && <div style={{ fontSize: 11, color: '#6b7280' }}>{t.sub}</div>}
                            {l.type === 'bill' && l.billBalance > 0 && <div style={{ fontSize: 11, color: '#b45309' }}>{fmt(l.billBalance)} unpaid</div>}
                          </td>
                          <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap' }}>{l.debit ? fmt(l.debit) : ''}</td>
                          <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap', color: voided ? '#9ca3af' : '#059669' }}>{l.credit ? fmt(l.credit) : voided ? fmt(l.amount) : ''}</td>
                          <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 }}>{l.balance != null ? fmt(l.balance) : ''}</td>
                          <td style={{ padding: 4 }}>
                            {l.type === 'payment' && !l.legacy && (
                              <button title="Cancel this payment" aria-label="Cancel this payment" disabled={busy} onClick={() => cancelPayment(l)}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}><FaUndo size={11} /></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: '#f9fafb' }}>
                      <td style={{ padding: 8 }} /><td style={{ padding: 8, fontWeight: 700 }}>Closing balance</td><td /><td />
                      <td data-testid="ledger-closing" style={{ padding: 8, textAlign: 'right', fontWeight: 800 }}>{fmt(data.closingBalance)}</td><td />
                    </tr>
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 16 }}>No bills or payments in these dates.</div>}
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>Balance = what you owe this supplier. A minus balance means you have paid ahead.</div>
            </>
          )}
        </div>
      </div>
      {paying && (
        <SupplierPayModal restaurantId={restaurantId} supplier={{ id: supplierId, name }} formatCurrency={fmtRaw}
          onClose={() => setPaying(false)} onDone={() => { setMsg('Payment saved'); changed(); }} />
      )}
    </div>,
    document.body
  );
}
