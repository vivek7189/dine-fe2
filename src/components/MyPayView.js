'use client';

// My Pay — a staff member's own payslips, advances, bonuses and appraisals (read-only; the only
// action is acknowledging an appraisal). Shown when the owner switches "My Pay" on for their role.
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';
import StaffProfile from './StaffProfile';
import { useCurrency } from '../contexts/CurrencyContext';

const escapeHtml = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DEFAULT_LABELS = { hra: 'HRA', travel: 'Travel', food: 'Food', pf: 'PF', tax: 'Tax', other: 'Other', esi: 'ESI', tds: 'TDS' };
const labelOf = (key, saved) => (saved && saved[key]) || DEFAULT_LABELS[key] || key;
const monthName = (m) => {
  if (!m || !/^\d{4}-\d{2}$/.test(m)) return m || '';
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const card = { background: '#fff', border: '1px solid #eef0f3', borderRadius: 12, padding: 16, marginBottom: 14 };
const h2 = { fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 10px' };
const muted = { color: '#6b7280', fontSize: 13 };
// Advance status as words (rejected / waiting requests were listed like money owed).
const ADV_STATUS = {
  pending: { label: 'Awaiting approval', style: { background: '#fffbeb', color: '#b45309' } },
  approved: { label: 'Recovering', style: { background: '#ecfdf5', color: '#047857' } },
  settled: { label: 'Settled', style: { background: '#eff6ff', color: '#1d4ed8' } },
  rejected: { label: 'Rejected', style: { background: '#fef2f2', color: '#b91c1c' } },
};
const pill = (bg, fg) => ({ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: bg, color: fg, whiteSpace: 'nowrap' });

export default function MyPayView() {
  // Narrow screens (phones / the app) → one-column profile form.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const f = () => setIsNarrow(typeof window !== 'undefined' && window.innerWidth < 640);
    f(); window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  const { formatCurrency } = useCurrency();
  const fc = (n) => formatCurrency(Number(n) || 0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const rid = typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null;
  const load = async () => {
    if (!rid) { setError({ text: 'Choose your restaurant first.' }); return; }
    try { setData(await apiClient.getMyPay(rid)); setError(null); }
    catch (e) { setError({ text: e.message || 'Could not load your pay details', off: e.code === 'MY_PAY_OFF' || /My Pay is not switched on/i.test(e.message || '') }); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const printSlip = (slip) => {
    const rows = [['Basic salary', fc(slip.baseSalary), '']];
    Object.entries(slip.allowances || {}).forEach(([k, v]) => { if (Number(v) > 0) rows.push([labelOf(k, slip.componentLabels), '+' + fc(v), '']); });
    if (slip.bonus > 0) rows.push(['Bonus / incentive', '+' + fc(slip.bonus), '']);
    if (slip.overtimePay > 0) rows.push(['Overtime pay', '+' + fc(slip.overtimePay), '']);
    const adj = (slip.adjustments && Array.isArray(slip.adjustments.items)) ? slip.adjustments.items : [];
    adj.filter(a => a.kind === 'earning').forEach(a => rows.push([a.name + (a.reason ? ` — ${a.reason}` : ''), '+' + fc(a.amount), '']));
    Object.entries(slip.deductions || {}).forEach(([k, v]) => { if (Number(v) > 0) rows.push([labelOf(k, slip.componentLabels), '', '-' + fc(v)]); });
    if (slip.lopDeduction > 0) rows.push(['Loss of pay (LOP)', '', '-' + fc(slip.lopDeduction)]);
    if (slip.advanceRecovery > 0) rows.push(['Advance recovery', '', '-' + fc(slip.advanceRecovery)]);
    adj.filter(a => a.kind === 'deduction').forEach(a => rows.push([a.name + (a.reason ? ` — ${a.reason}` : ''), '', '-' + fc(a.amount)]));
    const att = slip.attendance;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip · ${escapeHtml(data?.staff?.name || '')} · ${escapeHtml(monthName(slip.month))}</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;max-width:640px;margin:24px auto;padding:0 16px;}
      h1{font-size:20px;margin:0 0 2px;} .sub{color:#6b7280;font-size:13px;margin-bottom:16px;}
      .meta{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:#374151;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:10px 0;margin-bottom:12px;}
      table{width:100%;border-collapse:collapse;font-size:13px;} th,td{text-align:left;padding:7px 4px;border-bottom:1px solid #f3f4f6;}
      th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3){text-align:right;} .earn{color:#047857;} .ded{color:#b91c1c;}
      .net{display:flex;justify-content:space-between;font-size:18px;font-weight:800;margin-top:14px;padding-top:12px;border-top:2px solid #111827;}
      .att{font-size:12px;color:#6b7280;margin-top:14px;} .foot{margin-top:24px;font-size:11px;color:#9ca3af;text-align:center;}</style></head><body>
      <h1>Payslip</h1><div class="sub">${escapeHtml(data?.restaurant?.name || '')} · ${escapeHtml(monthName(slip.month))}</div>
      <div class="meta"><div><b>${escapeHtml(data?.staff?.name || '')}</b>${data?.staff?.role ? ' · ' + escapeHtml(data.staff.role) : ''}</div><div>${slip.status === 'paid' ? 'Paid' + (slip.paidDate ? ' ' + escapeHtml(fmtDate(slip.paidDate)) : '') : 'Approved'}</div></div>
      <table><thead><tr><th>Component</th><th>Earnings</th><th>Deductions</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${escapeHtml(r[0])}</td><td class="earn">${r[1] || ''}</td><td class="ded">${r[2] || ''}</td></tr>`).join('')}
      </tbody></table><div class="net"><span>Net pay</span><span>${fc(slip.netPay)}</span></div>
      ${att ? `<div class="att">Working days: ${att.workingDays ?? '-'} · Present: ${att.presentDays ?? '-'} · Paid leave: ${att.paidLeaveDays ?? '-'} · LOP days: ${att.lopDays ?? '-'}</div>` : ''}
      <div class="foot">Generated by DineOpen</div>
      <script>window.onload=function(){setTimeout(function(){window.print();},250);}</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const acknowledge = async (a) => {
    setBusy(a.id);
    try { await apiClient.acknowledgeMyAppraisal(rid, a.id); await load(); }
    catch (e) { setError({ text: e.message || 'Could not acknowledge' }); }
    finally { setBusy(null); }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '4px 0 2px' }}>My Pay</h1>
      <p style={{ ...muted, margin: '0 0 16px' }}>{data ? `${data.staff.name}${data.restaurant.name ? ' · ' + data.restaurant.name : ''}` : 'Your payslips, advances, bonuses and appraisals'}</p>

      {error && (
        <div role={error.off ? 'status' : 'alert'} style={{ ...card, background: error.off ? '#eef2ff' : '#fef2f2', borderColor: error.off ? '#c7d2fe' : '#fecaca', color: error.off ? '#3730a3' : '#b91c1c', fontSize: 14 }}>
          {error.off ? 'My Pay isn’t switched on for your role. Ask the owner to allow it in Admin → Roles.' : error.text}
        </div>
      )}
      {!data && !error && <div style={card}><span style={muted}>Loading…</span></div>}

      {data && (
        <>
          <section style={card}>
            <h2 style={h2}>Payslips</h2>
            {data.slips.length === 0 && <p style={muted}>No payslips yet. They appear here once payroll is approved.</p>}
            <div style={{ display: 'grid', gap: 8 }}>
              {data.slips.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '10px 12px', border: '1px solid #f3f4f6', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{monthName(s.month)}</div>
                    <div style={{ ...muted, fontSize: 12 }}>Gross {fc(s.grossPay)}{s.advanceRecovery > 0 ? ` · Advance −${fc(s.advanceRecovery)}` : ''}{s.lopDeduction > 0 ? ` · LOP −${fc(s.lopDeduction)}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{fc(s.netPay)}</span>
                    <span style={s.status === 'paid' ? pill('#ecfdf5', '#047857') : pill('#fffbeb', '#b45309')}>{s.status === 'paid' ? 'Paid' : 'Approved'}</span>
                    <button type="button" onClick={() => printSlip(s)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Print / PDF</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <h2 style={h2}>Advances</h2>
            {data.advances.length === 0 ? <p style={muted}>No advances.</p> : (
              <div style={{ display: 'grid', gap: 6 }}>
                {data.advances.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '6px 0', borderBottom: '1px solid #f9fafb', flexWrap: 'wrap' }}>
                    <span>{fmtDate(a.date)}{a.reason ? ` · ${a.reason}` : ''}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {fc(a.amount)}
                      {a.status === 'approved' || a.status === 'settled'
                        ? <> · recovered {fc(a.recovered)} · <b>balance {fc(a.balance)}</b></>
                        : null}
                      {' '}<span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 999, marginLeft: 4, ...(ADV_STATUS[a.status] || ADV_STATUS.approved).style }}>{(ADV_STATUS[a.status] || ADV_STATUS.approved).label}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={card}>
            <h2 style={h2}>Bonuses</h2>
            {data.bonuses.length === 0 ? <p style={muted}>No bonuses.</p> : (
              <div style={{ display: 'grid', gap: 6 }}>
                {data.bonuses.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '6px 0', borderBottom: '1px solid #f9fafb', flexWrap: 'wrap' }}>
                    <span>{fmtDate(b.date)}{b.bonusType ? ` · ${b.bonusType}` : ''}{b.reason ? ` · ${b.reason}` : ''}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}><b>{fc(b.amount)}</b> · {b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={card}>
            <h2 style={h2}>Appraisals</h2>
            {data.appraisals.length === 0 ? <p style={muted}>No appraisals yet.</p> : (
              <div style={{ display: 'grid', gap: 10 }}>
                {data.appraisals.map(a => (
                  <div key={a.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{a.period || fmtDate(a.date)}{a.rating ? ` · ${a.rating}/5` : ''}</span>
                      {a.status === 'acknowledged'
                        ? <span style={pill('#ecfdf5', '#047857')}>Acknowledged {fmtDate(a.acknowledgedAt)}</span>
                        : <button type="button" disabled={busy === a.id} onClick={() => acknowledge(a)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', opacity: busy === a.id ? 0.6 : 1 }}>{busy === a.id ? 'Saving…' : 'Acknowledge'}</button>}
                    </div>
                    {[['Strengths', a.strengths], ['To improve', a.improvements], ['Goals', a.goals], ['Comments', a.comments], ['Recommendation', a.recommendation && a.recommendation !== 'none' ? (a.recommendationLabel || a.recommendation) : null]].filter(([, v]) => v).map(([k, v]) => (
                      <p key={k} style={{ margin: '6px 0 0', fontSize: 13.5, color: '#374151' }}><b style={{ color: '#111827' }}>{k}:</b> {v}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

        </>
      )}

      {/* My Profile (shown even when My Pay is off for the role): personal details, next of kin and
          health they can update; experience is the employer's record (view only). */}
      <StaffProfile self isMobile={isNarrow} />
    </div>
  );
}
