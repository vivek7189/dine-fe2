'use client';

// "Send statement" — Khatabook-style customer credit statement (L'oeuf 2026-10).
// Pick a period, see the totals, then send it: WhatsApp from this phone/PC (the restaurant's own
// number, nothing to approve), email from DineOpen, copy the link, or open/print the statement.

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../../lib/api';
import { restaurantToday, ymd } from '../../lib/restaurantTime';
import { getCountryByCode } from '../../lib/countries';
import { useCurrency } from '../../contexts/CurrencyContext';
import { t } from '../../lib/i18n';

const tr = (key, fallback, vars) => {
  const v = t(key, vars);
  if (v && v !== key) return v;
  return vars ? String(fallback).replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? vars[k] : '')) : fallback;
};

function presetRange(preset, lastPaymentDate) {
  const today = restaurantToday();
  const to = ymd(today);
  if (preset === 'week') {
    const d = new Date(today); const dow = (d.getDay() + 6) % 7; // Monday start
    d.setDate(d.getDate() - dow); return { from: ymd(d), to };
  }
  if (preset === 'month') { const d = new Date(today); d.setDate(1); return { from: ymd(d), to }; }
  if (preset === 'since') return { from: lastPaymentDate || null, to };
  return { from: null, to }; // all
}

// wa.me needs digits with the country code; numbers saved without one get the restaurant's.
function waDigits(phone, countryCode) {
  const raw = String(phone || '').trim();
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+') || raw.startsWith('00')) return digits.replace(/^00/, '');
  const dial = ((getCountryByCode(countryCode || 'IN') || {}).dialCode || '+91').replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');
  return digits.startsWith(dial) && digits.length > 10 ? digits : `${dial}${digits}`;
}

export default function StatementModal({ customerId, customerName, customerPhone, customerEmail, onClose }) {
  const { formatCurrency } = useCurrency();
  const [preset, setPreset] = useState('since');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [full, setFull] = useState(null); // all-time statement (for "since last payment" + preview)
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // all-time once: finds the last payment date for the "since last payment" preset
  useEffect(() => {
    let off = false;
    apiClient.getCustomerStatement(customerId, {})
      .then(r => { if (!off) setFull(r.statement); })
      .catch(e => { if (!off) setErr(e.message || 'Could not load the statement'); });
    return () => { off = true; };
  }, [customerId]);

  const lastPaymentDate = useMemo(() => {
    const pays = ((full && full.entries) || []).filter(e => e.type === 'payment');
    return pays.length ? pays[pays.length - 1].localDate : null;
  }, [full]);

  const range = useMemo(() => {
    if (preset === 'custom') return { from: custom.from || null, to: custom.to || ymd(restaurantToday()) };
    return presetRange(preset, lastPaymentDate);
  }, [preset, custom, lastPaymentDate]);

  useEffect(() => {
    if (!full) return undefined;
    let off = false;
    setPreview(null);
    apiClient.getCustomerStatement(customerId, range)
      .then(r => { if (!off) setPreview(r.statement); })
      .catch(e => { if (!off) setErr(e.message || 'Could not load the statement'); });
    return () => { off = true; };
  }, [customerId, range.from, range.to, full]); // eslint-disable-line react-hooks/exhaustive-deps

  const country = (preview && preview.restaurant && preview.restaurant.countryCode) || 'IN';
  const phone = waDigits(customerPhone || (full && full.customer && full.customer.phone), country);
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail || (full && full.customer && full.customer.email) || ''));

  const share = async () => apiClient.shareCustomerStatement(customerId, range);
  const run = async (kind) => {
    setBusy(kind); setErr(''); setMsg('');
    try {
      if (kind === 'whatsapp') {
        const r = await share();
        const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(r.message)}` : `https://wa.me/?text=${encodeURIComponent(r.message)}`;
        window.open(url, '_blank', 'noopener');
        setMsg(tr('statement.whatsappOpened', 'WhatsApp opened with the message — press send there.'));
      } else if (kind === 'email') {
        const r = await apiClient.emailCustomerStatement(customerId, range);
        setMsg(tr('statement.emailSent', 'Statement emailed to {{to}}', { to: r.sentTo }));
      } else if (kind === 'copy') {
        const r = await share();
        try { await navigator.clipboard.writeText(`${r.message}`); setMsg(tr('statement.copied', 'Message with link copied')); }
        catch { window.prompt('Copy this', r.url); }
      } else if (kind === 'open') {
        const r = await share();
        window.open(r.url, '_blank', 'noopener');
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong');
    } finally { setBusy(''); }
  };

  const tot = preview && preview.totals;
  const warn = full && full.warnings;
  const btn = (bg, color = '#fff') => ({ flex: '1 1 45%', padding: '10px 12px', border: 'none', borderRadius: 10, background: bg, color, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: busy ? 0.7 : 1 });
  const chip = (on) => ({ padding: '6px 10px', borderRadius: 999, border: `1px solid ${on ? '#ef4444' : '#e2e8f0'}`, background: on ? '#fef2f2' : '#fff', color: on ? '#b91c1c' : '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' });

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{tr('statement.title', 'Send statement')}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{customerName}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {[['since', tr('statement.sinceLastPayment', 'Since last payment')], ['week', tr('statement.thisWeek', 'This week')], ['month', tr('statement.thisMonth', 'This month')], ['all', tr('statement.all', 'All time')], ['custom', tr('statement.custom', 'Custom')]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setPreset(k)} style={chip(preset === k)}>{l}</button>
          ))}
        </div>
        {preset === 'custom' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input type="date" value={custom.from} onChange={e => setCustom(c => ({ ...c, from: e.target.value }))} style={{ flex: 1, padding: 8, border: '1px solid #e2e8f0', borderRadius: 8 }} />
            <input type="date" value={custom.to} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))} style={{ flex: 1, padding: 8, border: '1px solid #e2e8f0', borderRadius: 8 }} />
          </div>
        )}

        <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 12, minHeight: 72 }}>
          {!tot ? (
            <div style={{ color: '#64748b', fontSize: 13 }}>{err ? '' : tr('statement.loading', 'Loading…')}</div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: '#64748b' }}>{preview.period.from} → {preview.period.to}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#64748b' }}>{tr('statement.bills', 'Bills')} ({tot.bills})</div><div style={{ fontWeight: 800 }}>{formatCurrency(tot.billed)}</div></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#64748b' }}>{tr('statement.paid', 'Paid')}</div><div style={{ fontWeight: 800, color: '#047857' }}>{formatCurrency(tot.paid)}</div></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#64748b' }}>{tr('statement.balance', 'Balance due')}</div><div style={{ fontWeight: 800, color: tot.closingBalance > 0 ? '#b91c1c' : '#047857' }}>{formatCurrency(tot.closingBalance)}</div></div>
              </div>
              {preview.openingBalance ? <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{tr('statement.opening', 'Opening balance')}: <b>{formatCurrency(preview.openingBalance)}</b></div> : null}
            </>
          )}
        </div>

        {warn && (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 12 }}>
            {tr('statement.ledgerWarning', '{{n}} due bill(s) worth {{amt}} are not in this customer\'s balance yet. They show on the statement but not in the balance — please check before sending.', { n: warn.dueBillsNotInBalance, amt: formatCurrency(warn.amountNotInBalance) })}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <button type="button" disabled={!!busy || !tot} onClick={() => run('whatsapp')} style={btn('#16a34a')}>{busy === 'whatsapp' ? '…' : 'WhatsApp'}</button>
          <button type="button" disabled={!!busy || !tot || !hasEmail} title={hasEmail ? '' : tr('statement.noEmail', 'Add an email to this customer to send by email')} onClick={() => run('email')} style={{ ...btn(hasEmail ? '#2563eb' : '#cbd5e1'), cursor: hasEmail ? 'pointer' : 'not-allowed' }}>{busy === 'email' ? '…' : tr('statement.email', 'Email')}</button>
          <button type="button" disabled={!!busy || !tot} onClick={() => run('copy')} style={btn('#f1f5f9', '#0f172a')}>{tr('statement.copyLink', 'Copy message')}</button>
          <button type="button" disabled={!!busy || !tot} onClick={() => run('open')} style={btn('#f1f5f9', '#0f172a')}>{tr('statement.openPrint', 'Open / Print')}</button>
        </div>
        {!phone && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{tr('statement.noPhone', 'No phone saved — WhatsApp will ask you to pick the contact.')}</div>}
        {msg && <div style={{ marginTop: 10, fontSize: 12, color: '#047857' }}>{msg}</div>}
        {err && <div style={{ marginTop: 10, fontSize: 12, color: '#b91c1c' }}>{err}</div>}
        <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8' }}>{tr('statement.linkNote', 'The link shows the statement for 30 days. It does not show the customer\'s full phone number.')}</div>
      </div>
    </div>,
    document.body,
  );
}
