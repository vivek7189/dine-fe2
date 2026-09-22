'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSpinner, FaPlus, FaTrash, FaReceipt, FaCheckCircle, FaFileInvoiceDollar, FaBuilding } from 'react-icons/fa';
import hotelApi, { FOLIO_ITEM_TYPES, PAY_METHODS } from '../api/hotelApi';
import { inputCls, Btn, Modal, Field, Select } from './ui';
import InvoiceModal from './InvoiceModal';

const TYPE_LABEL = { room: 'Room', food: 'Food', beverage: 'Beverage', service: 'Service', tax: 'Tax', discount: 'Discount', misc: 'Misc' };

export default function FolioDrawer({ restaurantId, reservation, formatCurrency, onClose, onChanged }) {
  const [folio, setFolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [charge, setCharge] = useState({ description: '', type: 'food', amount: '' });
  const [pay, setPay] = useState({ amount: '', method: 'cash' });
  const [services, setServices] = useState([]);
  const [svc, setSvc] = useState({ id: '', qty: 1 });
  const [showInvoice, setShowInvoice] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [billCompanyId, setBillCompanyId] = useState('');
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toFixed(2));

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const res = await hotelApi.folioByReservation(restaurantId, reservation.id);
      setFolio(res.folio);
    } catch (e) { setErr(e.message || 'Failed to load folio'); }
    finally { setLoading(false); }
  }, [restaurantId, reservation]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { hotelApi.listServices(restaurantId).then((r) => setServices(r.services || [])).catch(() => {}); }, [restaurantId]);

  const addService = async () => {
    const s = services.find((x) => x.id === svc.id);
    if (!s) return setErr('Pick a service');
    const qty = Math.max(1, Number(svc.qty) || 1);
    setBusy(true); setErr(null);
    try {
      const res = await hotelApi.postCharge(restaurantId, folio.id, {
        description: qty > 1 ? `${s.name} × ${qty}` : s.name,
        type: s.taxable ? 'service' : 'misc', unitPrice: s.price, quantity: qty,
      });
      setSvc({ id: '', qty: 1 });
      refresh(res.folio);
    } catch (e) { setErr(e.message || 'Could not add service'); }
    finally { setBusy(false); }
  };

  const refresh = (updated) => { if (updated) setFolio(updated); else load(); onChanged && onChanged(); };

  const openBill = async () => {
    setBillOpen(true);
    try { const r = await hotelApi.listCompanies(restaurantId); setCompanies(r.companies || []); }
    catch (e) { setErr(e.message); }
  };
  const billToCompany = async () => {
    if (!billCompanyId) return setErr('Choose a company');
    setBusy(true); setErr(null);
    try { const res = await hotelApi.billFolioToCompany(restaurantId, billCompanyId, folio.id); refresh(res.folio); setBillOpen(false); }
    catch (e) { setErr(e.message || 'Could not bill to company'); }
    finally { setBusy(false); }
  };

  const addCharge = async () => {
    if (!charge.description.trim() || charge.amount === '') return setErr('Enter a description and amount');
    setBusy(true); setErr(null);
    try {
      const res = await hotelApi.postCharge(restaurantId, folio.id, { description: charge.description.trim(), type: charge.type, amount: Number(charge.amount) });
      setCharge({ description: '', type: 'food', amount: '' });
      refresh(res.folio);
    } catch (e) { setErr(e.message || 'Could not post charge'); }
    finally { setBusy(false); }
  };
  const voidItem = async (itemId) => {
    setBusy(true); setErr(null);
    try { const res = await hotelApi.voidCharge(restaurantId, folio.id, itemId); refresh(res.folio); }
    catch (e) { setErr(e.message || 'Could not void'); }
    finally { setBusy(false); }
  };
  const addPayment = async () => {
    if (pay.amount === '' || Number(pay.amount) <= 0) return setErr('Enter a payment amount');
    setBusy(true); setErr(null);
    try {
      const res = await hotelApi.addPayment(restaurantId, folio.id, { amount: Number(pay.amount), method: pay.method });
      setPay({ amount: '', method: 'cash' });
      refresh(res.folio);
    } catch (e) { setErr(e.message || 'Could not add payment'); }
    finally { setBusy(false); }
  };
  const settle = async (force = false) => {
    setBusy(true); setErr(null);
    try { const res = await hotelApi.settleFolio(restaurantId, folio.id, force); refresh(res.folio); }
    catch (e) {
      if (!force && /balance/i.test(e.message) && window.confirm(`${e.message}\n\nClose anyway as unpaid (due)?`)) return settle(true);
      setErr(e.message || 'Could not settle');
    } finally { setBusy(false); }
  };

  const isOpen = folio?.status === 'open';

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[10050] flex justify-end bg-[color-mix(in_srgb,var(--h-ink)_50%,transparent)]" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--h-bsoft2)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FaReceipt className="text-[var(--h-brand)]" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--h-ink)]">Folio · {reservation.guestName}</h3>
              <p className="text-xs text-[var(--h-faint)]">{reservation.roomNumber ? `Room ${reservation.roomNumber}` : 'Unassigned'} {folio ? `· ${folio.status}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--h-faint)] hover:text-[var(--h-text)]" aria-label="Close"><FaTimes /></button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center gap-2 p-6 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
        ) : !folio ? (
          <div className="p-6 text-sm text-rose-600">{err || 'No folio.'}</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

              {/* charges */}
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--h-faint)]">Charges</div>
              <table className="mb-3 w-full text-sm">
                <tbody>
                  {folio.items.length === 0 && <tr><td className="py-2 text-[var(--h-faint)]">No charges yet.</td></tr>}
                  {folio.items.map((it) => (
                    <tr key={it.id} className="border-b border-[var(--h-divider)]">
                      <td className="py-1.5 pr-2">
                        <div className="text-[var(--h-ink)]">{it.description}</div>
                        <div className="text-[11px] text-[var(--h-faint)]">{TYPE_LABEL[it.type] || it.type}{it.source === 'pos' ? ' · POS' : ''}</div>
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-[var(--h-ink2)] whitespace-nowrap">{money(it.amount)}</td>
                      <td className="py-1.5 pl-2 text-right">
                        {isOpen && it.type !== 'room' && it.source !== 'pos' && (
                          <button onClick={() => voidItem(it.id)} disabled={busy} className="text-[var(--h-faint3)] hover:text-rose-600" aria-label="Void"><FaTrash size={11} /></button>
                        )}
                        {it.source === 'pos' && <span className="text-[10px] text-[var(--h-faint3)]" title="Posted from the POS — reverse it in the POS order">POS</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isOpen && services.length > 0 && (
                <div className="mb-2.5 grid grid-cols-[1fr_auto_auto] gap-2">
                  <Select value={svc.id} onChange={(v) => setSvc({ ...svc, id: v })} placeholder="Add a service…"
                    options={[{ value: '', label: 'Add a service…' }, ...services.map((s) => ({ value: s.id, label: s.name, right: `${money(s.price)}${s.unit !== 'per-item' ? `/${s.unit.replace('per-', '')}` : ''}` }))]} />
                  <input className={`${inputCls} w-16`} type="number" min="1" value={svc.qty} onChange={(e) => setSvc({ ...svc, qty: e.target.value })} title="Quantity" />
                  <button onClick={addService} disabled={busy || !svc.id} className="rounded-lg bg-[var(--h-brand)] px-2.5 text-white hover:bg-[var(--h-brand-ink)] disabled:opacity-50" aria-label="Add service"><FaPlus size={12} /></button>
                </div>
              )}
              {isOpen && (
                <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-2">
                  <input className={inputCls} placeholder="Or a custom charge…" value={charge.description} onChange={(e) => setCharge({ ...charge, description: e.target.value })} />
                  <Select value={charge.type} onChange={(v) => setCharge({ ...charge, type: v })}
                    options={FOLIO_ITEM_TYPES.filter((t) => t !== 'room').map((t) => ({ value: t, label: TYPE_LABEL[t] }))} />
                  <div className="flex gap-1">
                    <input className={`${inputCls} w-24`} type="number" step="0.01" placeholder="Amt" value={charge.amount} onChange={(e) => setCharge({ ...charge, amount: e.target.value })} />
                    <button onClick={addCharge} disabled={busy} className="rounded-lg bg-[var(--h-ink)] px-2.5 text-white hover:bg-[var(--h-ink)] disabled:opacity-50" aria-label="Add charge"><FaPlus size={12} /></button>
                  </div>
                </div>
              )}

              {/* payments */}
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--h-faint)]">Payments</div>
              <table className="mb-3 w-full text-sm">
                <tbody>
                  {folio.payments.length === 0 && <tr><td className="py-2 text-[var(--h-faint)]">No payments yet.</td></tr>}
                  {folio.payments.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--h-divider)]">
                      <td className="py-1.5 capitalize text-[var(--h-ink2)]">{p.method}{p.reference ? <span className="text-[11px] text-[var(--h-faint)]"> · {p.reference}</span> : null}</td>
                      <td className="py-1.5 text-right tabular-nums text-emerald-700">{money(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isOpen && (
                <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-2">
                  <input className={inputCls} type="number" step="0.01" placeholder="Payment amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                  <Select value={pay.method} onChange={(v) => setPay({ ...pay, method: v })} options={PAY_METHODS.map((m) => ({ value: m, label: m }))} />
                  <button onClick={addPayment} disabled={busy} className="rounded-lg bg-emerald-600 px-2.5 text-white hover:bg-emerald-700 disabled:opacity-50" aria-label="Add payment"><FaPlus size={12} /></button>
                </div>
              )}
            </div>

            {/* footer totals + settle */}
            <div className="border-t border-[var(--h-bsoft2)] px-5 py-4">
              <div className="mb-1 flex justify-between text-sm text-[var(--h-muted)]"><span>Charges</span><span className="tabular-nums">{money(folio.totalCharges)}</span></div>
              {(folio.taxLines || []).map((tl, i) => (
                <div key={i} className="mb-1 flex justify-between text-xs text-[var(--h-faint)]"><span>{tl.name} ({tl.rate}%)</span><span className="tabular-nums">{money(tl.amount)}</span></div>
              ))}
              {folio.taxTotal > 0 && <div className="mb-1 flex justify-between text-sm text-[var(--h-muted)]"><span>Tax</span><span className="tabular-nums">{money(folio.taxTotal)}</span></div>}
              <div className="mb-1 flex justify-between text-sm text-[var(--h-muted)]"><span>Paid</span><span className="tabular-nums">{money(folio.totalPaid)}</span></div>
              <div className="mb-3 flex justify-between text-base font-semibold text-[var(--h-ink)]"><span>Balance</span><span className={`tabular-nums ${folio.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{money(folio.balance)}</span></div>
              {isOpen ? (
                <Btn onClick={() => settle(false)} disabled={busy} className="w-full justify-center"><FaCheckCircle size={13} /> {folio.balance > 0 ? 'Collect & settle' : 'Settle folio'}</Btn>
              ) : (
                <div className="rounded-lg bg-emerald-50 py-2 text-center text-sm font-medium capitalize text-emerald-700">{folio.status}</div>
              )}
              <div className="mt-2 flex gap-2">
                <button onClick={() => setShowInvoice(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--h-border2)] bg-white py-2 text-[13px] font-semibold text-[var(--h-ink2)] hover:bg-[var(--h-hover)]">
                  <FaFileInvoiceDollar size={12} /> Invoice
                </button>
                {isOpen && folio.balance > 0 && (
                  <button onClick={openBill}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--h-border2)] bg-white py-2 text-[13px] font-semibold text-[var(--h-ink2)] hover:bg-[var(--h-hover)]">
                    <FaBuilding size={12} /> Bill to company
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {showInvoice && folio && (
        <InvoiceModal restaurantId={restaurantId} folioId={folio.id} open={showInvoice}
          onClose={() => setShowInvoice(false)} notify={(t, m) => setErr(t === 'error' ? m : null)} />
      )}
      {billOpen && folio && (
        <Modal open title="Bill folio to a company" onClose={() => setBillOpen(false)}
          footer={<><Btn variant="ghost" onClick={() => setBillOpen(false)}>Cancel</Btn><Btn onClick={billToCompany} disabled={busy || !billCompanyId}>{busy ? 'Transferring…' : `Transfer ${money(folio.balance)}`}</Btn></>}>
          {companies.length === 0 ? (
            <p className="text-[13px] text-[var(--h-faint)]">No company accounts yet. Add one under City Ledger first.</p>
          ) : (
            <>
              <Field label="Company"><Select value={billCompanyId} onChange={setBillCompanyId} placeholder="Choose a company…" options={[{ value: '', label: 'Choose a company…' }, ...companies.map((c) => ({ value: c.id, label: c.name, right: c.balance ? money(c.balance) : undefined }))]} /></Field>
              <p className="mt-2 text-[12px] text-[var(--h-muted)]">The outstanding balance of <strong>{money(folio.balance)}</strong> moves to the company city-ledger account and the folio is settled.</p>
            </>
          )}
        </Modal>
      )}
    </div>,
    document.body
  );
}
