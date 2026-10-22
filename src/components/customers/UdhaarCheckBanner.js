'use client';

// Udhaar check (owner / manager): where a bill and a customer's khata disagree — a bill marked Due that is
// not on the khata, a khata entry whose bill is already paid / cancelled, or an Outstanding that does not
// match the khata. One tap to fix each; nothing is changed until someone taps. (22 Oct 2026)
import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../../lib/api';

const MANAGERS = ['owner', 'admin', 'co-owner', 'manager'];

export default function UdhaarCheckBanner({ restaurantId, formatCurrency, onOpenCustomer, onChanged }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    try {
      const r = String((JSON.parse(localStorage.getItem('user') || '{}') || {}).role || '').toLowerCase();
      setAllowed(MANAGERS.includes(r));
    } catch (_) { setAllowed(false); }
  }, []);

  const load = useCallback(async () => {
    if (!restaurantId || !allowed) return;
    try { setData(await apiClient.getUdhaarCheck(restaurantId)); } catch (_) { setData(null); }
  }, [restaurantId, allowed]);
  useEffect(() => { load(); }, [load]);

  if (!allowed || !data || !(data.total > 0)) return null;
  const fmt = (n) => (formatCurrency ? formatCurrency(n) : String(n));

  const closeEntry = async (it) => {
    if (busy) return;
    if (!window.confirm(`Close the khata entry of bill #${it.dailyOrderId || it.orderNumber} for ${it.customerName || 'this customer'}? Their Outstanding goes down by ${fmt(it.amount)}.`)) return;
    setBusy(it.orderId);
    try { await apiClient.khataCloseBill(it.customerId, it.orderId); await load(); if (onChanged) onChanged(); }
    catch (err) { alert(err.message || 'Could not close the entry'); }
    finally { setBusy(null); }
  };

  const label = {
    notOnKhata: (it) => <>Bill <b>#{it.dailyOrderId || it.orderNumber}</b> is marked Due (<b>{fmt(it.amount)}</b>) but is not on the khata{it.wasOnKhata ? <span style={{ color: '#b45309' }}> — it was on the khata before and was closed{it.wasOnKhata.note ? ` (${it.wasOnKhata.note})` : ''}: check if it was already paid</span> : null}</>,
    paidButOpen: (it) => <>Khata still shows bill <b>#{it.dailyOrderId || it.orderNumber}</b> (<b>{fmt(it.amount)}</b>) but the bill is {it.billStatus}</>,
    balanceOff: (it) => <>Outstanding {fmt(it.balance)} does not match the khata ({fmt(it.openEntries)}) — DineOpen support will fix this</>,
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
        ⚠️ {data.total} udhaar item{data.total === 1 ? '' : 's'} need a check {open ? '▲' : '▼'}
        <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, marginTop: '2px' }}>
          A bill and the customer’s khata disagree. Check each one so customers are never shown the wrong amount.
        </span>
      </button>
      {open && (
        <div style={{ border: '1px solid #fde68a', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'white' }}>
          {data.items.map((it, i) => (
            <div key={`${it.type}-${it.customerId}-${it.orderId || i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '8px 14px', borderTop: i ? '1px solid #fef3c7' : 'none', fontSize: '12.5px', color: '#374151' }}>
              <div style={{ minWidth: 0 }}>
                <b>{it.customerName || 'Customer'}</b>{it.phone ? <span style={{ color: '#6b7280' }}> · {it.phone}</span> : null}
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{label[it.type] ? label[it.type](it) : it.type}</div>
              </div>
              {it.type === 'notOnKhata' && (
                <button type="button" onClick={() => onOpenCustomer && onOpenCustomer({ id: it.customerId })}
                  style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #f59e0b', background: 'white', color: '#92400e', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                  Open customer
                </button>
              )}
              {it.type === 'paidButOpen' && (
                <button type="button" disabled={!!busy} onClick={() => closeEntry(it)}
                  style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: '#16a34a', color: 'white', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                  {busy === it.orderId ? 'Closing…' : 'Close entry'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
