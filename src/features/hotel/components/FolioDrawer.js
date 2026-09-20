'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSpinner, FaPlus, FaTrash, FaReceipt, FaCheckCircle } from 'react-icons/fa';
import hotelApi, { FOLIO_ITEM_TYPES, PAY_METHODS } from '../api/hotelApi';
import { inputCls, Btn } from './ui';

const TYPE_LABEL = { room: 'Room', food: 'Food', beverage: 'Beverage', service: 'Service', tax: 'Tax', discount: 'Discount', misc: 'Misc' };

export default function FolioDrawer({ restaurantId, reservation, formatCurrency, onClose, onChanged }) {
  const [folio, setFolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [charge, setCharge] = useState({ description: '', type: 'food', amount: '' });
  const [pay, setPay] = useState({ amount: '', method: 'cash' });
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

  const refresh = (updated) => { if (updated) setFolio(updated); else load(); onChanged && onChanged(); };

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FaReceipt className="text-indigo-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Folio · {reservation.guestName}</h3>
              <p className="text-xs text-slate-400">{reservation.roomNumber ? `Room ${reservation.roomNumber}` : 'Unassigned'} {folio ? `· ${folio.status}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><FaTimes /></button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center gap-2 p-6 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>
        ) : !folio ? (
          <div className="p-6 text-sm text-rose-600">{err || 'No folio.'}</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

              {/* charges */}
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Charges</div>
              <table className="mb-3 w-full text-sm">
                <tbody>
                  {folio.items.length === 0 && <tr><td className="py-2 text-slate-400">No charges yet.</td></tr>}
                  {folio.items.map((it) => (
                    <tr key={it.id} className="border-b border-slate-50">
                      <td className="py-1.5 pr-2">
                        <div className="text-slate-800">{it.description}</div>
                        <div className="text-[11px] text-slate-400">{TYPE_LABEL[it.type] || it.type}{it.source === 'pos' ? ' · POS' : ''}</div>
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-slate-700 whitespace-nowrap">{money(it.amount)}</td>
                      <td className="py-1.5 pl-2 text-right">
                        {isOpen && it.type !== 'room' && it.source !== 'pos' && (
                          <button onClick={() => voidItem(it.id)} disabled={busy} className="text-slate-300 hover:text-rose-600" aria-label="Void"><FaTrash size={11} /></button>
                        )}
                        {it.source === 'pos' && <span className="text-[10px] text-slate-300" title="Posted from the POS — reverse it in the POS order">POS</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isOpen && (
                <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-2">
                  <input className={inputCls} placeholder="Add charge…" value={charge.description} onChange={(e) => setCharge({ ...charge, description: e.target.value })} />
                  <select className={inputCls} value={charge.type} onChange={(e) => setCharge({ ...charge, type: e.target.value })}>
                    {FOLIO_ITEM_TYPES.filter((t) => t !== 'room').map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <input className={`${inputCls} w-24`} type="number" step="0.01" placeholder="Amt" value={charge.amount} onChange={(e) => setCharge({ ...charge, amount: e.target.value })} />
                    <button onClick={addCharge} disabled={busy} className="rounded-lg bg-slate-800 px-2.5 text-white hover:bg-slate-900 disabled:opacity-50" aria-label="Add charge"><FaPlus size={12} /></button>
                  </div>
                </div>
              )}

              {/* payments */}
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Payments</div>
              <table className="mb-3 w-full text-sm">
                <tbody>
                  {folio.payments.length === 0 && <tr><td className="py-2 text-slate-400">No payments yet.</td></tr>}
                  {folio.payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50">
                      <td className="py-1.5 capitalize text-slate-700">{p.method}{p.reference ? <span className="text-[11px] text-slate-400"> · {p.reference}</span> : null}</td>
                      <td className="py-1.5 text-right tabular-nums text-emerald-700">{money(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isOpen && (
                <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-2">
                  <input className={inputCls} type="number" step="0.01" placeholder="Payment amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                  <select className={inputCls} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                    {PAY_METHODS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
                  </select>
                  <button onClick={addPayment} disabled={busy} className="rounded-lg bg-emerald-600 px-2.5 text-white hover:bg-emerald-700 disabled:opacity-50" aria-label="Add payment"><FaPlus size={12} /></button>
                </div>
              )}
            </div>

            {/* footer totals + settle */}
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="mb-1 flex justify-between text-sm text-slate-500"><span>Charges</span><span className="tabular-nums">{money(folio.totalCharges)}</span></div>
              {(folio.taxLines || []).map((tl, i) => (
                <div key={i} className="mb-1 flex justify-between text-xs text-slate-400"><span>{tl.name} ({tl.rate}%)</span><span className="tabular-nums">{money(tl.amount)}</span></div>
              ))}
              {folio.taxTotal > 0 && <div className="mb-1 flex justify-between text-sm text-slate-500"><span>Tax</span><span className="tabular-nums">{money(folio.taxTotal)}</span></div>}
              <div className="mb-1 flex justify-between text-sm text-slate-500"><span>Paid</span><span className="tabular-nums">{money(folio.totalPaid)}</span></div>
              <div className="mb-3 flex justify-between text-base font-semibold text-slate-900"><span>Balance</span><span className={`tabular-nums ${folio.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{money(folio.balance)}</span></div>
              {isOpen ? (
                <Btn onClick={() => settle(false)} disabled={busy} className="w-full justify-center"><FaCheckCircle size={13} /> {folio.balance > 0 ? 'Collect & settle' : 'Settle folio'}</Btn>
              ) : (
                <div className="rounded-lg bg-emerald-50 py-2 text-center text-sm font-medium capitalize text-emerald-700">{folio.status}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
