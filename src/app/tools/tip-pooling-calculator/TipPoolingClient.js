'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { detectCountry } from '../../../lib/detectCountry';
import { track } from '../../../lib/analytics';
import { ROLES, EXAMPLE_STAFF, METHODS, FAQ, RELATED } from './tipPoolContent';

const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'AED', 'SAR'];
const COUNTRY_CURRENCY = { US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', IN: 'INR', AE: 'AED', SA: 'SAR', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR' };
const METHOD_LABEL = { hours: 'by hours', points: 'by hours and role', equal: 'equal split' };
const STORE_KEY = 'dineopen_tip_pool_v1';
const MAX_STAFF = 40;
const defaultPoints = () => Object.fromEntries(ROLES.map(([k, , p]) => [k, p]));
let seq = 0;
const row = (name = '', role = 'server', hours = '') => ({ id: ++seq, name, role, hours: String(hours) });
const example = () => EXAMPLE_STAFF.map(([n, r, h]) => row(n, r, h));

// Split `total` into cents by weight so the payouts always add up to the exact total.
function splitCents(total, weights) {
  const cents = Math.round(total * 100);
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!(cents > 0) || !(sum > 0)) return weights.map(() => 0);
  const raw = weights.map((w) => (cents * w) / sum);
  const out = raw.map(Math.floor);
  let left = cents - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - out[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i] += 1; left -= 1; } });
  return out.map((c) => c / 100);
}

export default function TipPoolingClient() {
  const [currency, setCurrency] = useState('USD');
  const [locale, setLocale] = useState('en-US');
  const [tips, setTips] = useState('600');
  const [method, setMethod] = useState('points');
  const [points, setPoints] = useState(defaultPoints);
  const [staff, setStaff] = useState(example);
  const [showPoints, setShowPoints] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const { countryCode } = detectCountry();
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { /* storage blocked */ }
    if (saved && Array.isArray(saved.staff) && saved.staff.length) {
      setStaff(saved.staff.slice(0, MAX_STAFF).map((s) => row(String(s.name || ''), ROLES.some(([k]) => k === s.role) ? s.role : 'other', s.hours ?? '')));
      if (saved.points) setPoints({ ...defaultPoints(), ...saved.points });
      if (saved.method) setMethod(saved.method);
      if (saved.currency) setCurrency(saved.currency);
    } else if (countryCode && COUNTRY_CURRENCY[countryCode]) {
      setCurrency(COUNTRY_CURRENCY[countryCode]);
    }
    if (navigator.language) setLocale(navigator.language);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ staff: staff.map(({ name, role, hours }) => ({ name, role, hours })), points, method, currency }));
    } catch { /* storage blocked */ }
  }, [loaded, staff, points, method, currency]);

  const fmt = useMemo(() => {
    const opts = { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 };
    let nf;
    try { nf = new Intl.NumberFormat(locale, opts); } catch { nf = new Intl.NumberFormat('en-US', opts); }
    return (n) => nf.format(Number.isFinite(n) ? n : 0);
  }, [currency, locale]);

  const total = Math.max(0, parseFloat(tips) || 0);
  const hoursOf = (s) => Math.max(0, parseFloat(s.hours) || 0);
  const weightOf = (s) => (method === 'equal' ? 1 : method === 'hours' ? hoursOf(s) : hoursOf(s) * (Number(points[s.role]) || 0));
  const weights = staff.map(weightOf);
  const shares = splitCents(total, weights);
  const totalHours = staff.reduce((a, s) => a + hoursOf(s), 0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const unit = totalWeight > 0 ? total / totalWeight : 0;
  const unitLabel = method === 'equal' ? 'per person' : method === 'hours' ? 'per hour' : 'per point';

  const update = (id, patch) => setStaff((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const add = () => setStaff((list) => (list.length >= MAX_STAFF ? list : [...list, row('', list.at(-1)?.role || 'server', '')]));
  const remove = (id) => setStaff((list) => (list.length <= 1 ? list : list.filter((s) => s.id !== id)));
  const clearAll = () => { setTips(''); setStaff([row(), row(), row()]); };
  const loadExample = () => { setTips('600'); setMethod('points'); setPoints(defaultPoints()); setStaff(example()); };

  const copy = async () => {
    const lines = [`Tip pool: ${fmt(total)} (${METHOD_LABEL[method]})`];
    staff.forEach((s, i) => lines.push(`${s.name || `Staff ${i + 1}`}: ${fmt(shares[i])}${method !== 'equal' ? ` (${hoursOf(s)} h)` : ''}`));
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
    track('tool_tip_pool_copy', { method, staff: staff.length });
  };

  return (
    <>
      <CommonHeader />
      <main className="tt">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › Free tools › Tip pooling calculator</nav>

          <header className="head">
            <h1>Tip Pooling Calculator</h1>
            <p className="lede">Share the night’s tips fairly between your staff by hours worked, by hours and role, or equally. Every payout adds up to the exact total, and you can print the payout sheet.</p>
          </header>

          <div className="app">
            <section className="card" aria-label="Tip pool">
              <div className="field">
                <label className="lbl" htmlFor="tp-total">Total tips to share <small>cash + card</small></label>
                <div className="money">
                  <label htmlFor="tp-cur" className="sr">Currency</label>
                  <select id="tp-cur" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input id="tp-total" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" autoComplete="off"
                    value={tips} onChange={(e) => setTips(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <div className="lbl"><span>Split method</span></div>
                <div className="seg" role="group" aria-label="Split method">
                  {[['hours', 'By hours'], ['points', 'Hours × role'], ['equal', 'Equal']].map(([v, l]) => (
                    <button key={v} type="button" className={method === v ? 'on' : ''} aria-pressed={method === v} onClick={() => setMethod(v)}>{l}</button>
                  ))}
                </div>
                {method === 'points' && (
                  <p className="hint">
                    Share = hours × role points.{' '}<button type="button" onClick={() => setShowPoints((v) => !v)} className="linkish" style={{ color: '#0f172a' }}>{showPoints ? 'Hide role points' : 'Edit role points'}</button>
                  </p>
                )}
                {method === 'points' && showPoints && (
                  <div className="pts">
                    {ROLES.map(([k, label]) => (
                      <label key={k}><span>{label}</span>
                        <input className="inp" type="number" inputMode="decimal" min="0" step="0.1" value={points[k]}
                          onChange={(e) => setPoints((p) => ({ ...p, [k]: e.target.value }))} />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <div className="lbl"><span>Staff on the shift</span><small>{staff.length} people{method !== 'equal' ? ` · ${totalHours} h` : ''}</small></div>
                <div className="staff">
                  {staff.map((s, i) => (
                    <div className={'srow' + (method === 'equal' ? ' eq' : '')} key={s.id}>
                      <label className="sr" htmlFor={`n-${i}`}>Name</label>
                      <input id={`n-${i}`} className="inp" placeholder={`Staff ${i + 1}`} value={s.name} maxLength={40}
                        onChange={(e) => update(s.id, { name: e.target.value })} />
                      <label className="sr" htmlFor={`r-${i}`}>Role</label>
                      <select id={`r-${i}`} className="inp" value={s.role} onChange={(e) => update(s.id, { role: e.target.value })}>
                        {ROLES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                      </select>
                      {method !== 'equal' && (
                        <>
                          <label className="sr" htmlFor={`h-${i}`}>Hours</label>
                          <input id={`h-${i}`} className="inp" type="number" inputMode="decimal" min="0" step="0.25" placeholder="Hours"
                            value={s.hours} onChange={(e) => update(s.id, { hours: e.target.value })} />
                        </>
                      )}
                      <button type="button" className="del" aria-label={`Remove ${s.name || `staff ${i + 1}`}`} disabled={staff.length <= 1} onClick={() => remove(s.id)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="staff-acts">
                  <button type="button" className="btn ghost" onClick={add} disabled={staff.length >= MAX_STAFF}>+ Add staff</button>
                  <button type="button" className="linkish" onClick={loadExample}>Load example</button>
                  <button type="button" className="linkish" onClick={clearAll}>Clear</button>
                </div>
                <p className="hint">Names and hours are saved on this device only, so next shift you just update the numbers.</p>
              </div>
            </section>

            <aside className="res" aria-live="polite">
              <div className="k">Payouts</div>
              <div className="big">{fmt(total)}</div>
              <div className="sub">{totalWeight > 0 ? `${fmt(unit)} ${unitLabel} · ${staff.length} people` : 'Add hours to see each share'}</div>
              <ul className="payouts">
                {staff.map((s, i) => (
                  <li key={s.id}>
                    <span><b>{s.name || `Staff ${i + 1}`}</b><small>{ROLES.find(([k]) => k === s.role)?.[1]}{method !== 'equal' && hoursOf(s) > 0 ? ` · ${hoursOf(s)} h · ${fmt(shares[i] / hoursOf(s))}/h` : ''}</small></span>
                    <b className="amt">{fmt(shares[i])}</b>
                  </li>
                ))}
              </ul>
              <div className="acts no-print">
                <button type="button" onClick={copy}>{copied ? '✓ Copied' : 'Copy payouts'}</button>
                <button type="button" onClick={() => { track('tool_tip_pool_print', { method }); window.print(); }}>Print sheet</button>
              </div>
              <p className="note">Payouts are rounded to the cent and always add up to the total.</p>
            </aside>
          </div>

          <section className="sec" id="methods">
            <h2>3 ways to split a tip pool</h2>
            <p className="intro">Worked examples use $600 in tips and five staff: two servers (6 h and 5 h), a bartender (6 h), a busser (4 h) and a runner (3 h).</p>
            <div className="steps">
              {METHODS.map(([t, d, ex], i) => (
                <div className="step" key={t}><i>{i + 1}</i><h3>{t}</h3><p>{d}</p><p className="ex">{ex}</p></div>
              ))}
            </div>
          </section>

          <section className="sec" id="rules">
            <h2>Tip pooling rules in the US and UK</h2>
            <div className="prose">
              <h3>United States</h3>
              <p>Under the federal Fair Labor Standards Act, employers, managers and supervisors cannot keep any part of employees’ tips, including tips from a pool. If you take a tip credit (pay tipped staff less than the full minimum wage), the pool can only include staff who customarily receive tips, such as servers, bartenders, bussers and runners. If you pay everyone in the pool at least the full minimum wage and take no tip credit, you can also include back-of-house staff such as cooks and dishwashers. Several states have stricter rules.</p>
              <h3>United Kingdom</h3>
              <p>Since 1 October 2024, the Employment (Allocation of Tips) Act requires employers to pass all tips, gratuities and service charges on to workers with no deductions other than tax. Tips must be shared fairly, set out in a written tipping policy that staff can read, paid by the end of the month after the customer paid, and recorded for three years.</p>
              <p className="hint">This is general information, not legal advice. Check your state labor department or the UK Code of Practice before changing how you pay tips.</p>
            </div>
          </section>

          <section className="sec" id="faq">
            <h2>Tip pooling FAQ</h2>
            <div className="faq">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}><summary><h3>{q}</h3></summary><p>{a}</p></details>
              ))}
            </div>
          </section>

          <section className="sec">
            <h2>More free tools</h2>
            <div className="related">
              {RELATED.map(([href, t, d]) => <Link key={href} href={href}><b>{t}</b><span>{d}</span></Link>)}
            </div>
          </section>

          <section className="owner no-print">
            <div>
              <h2>Run your restaurant on DineOpen</h2>
              <p>A POS that keeps the numbers behind your tip pool in one place.</p>
              <ul>
                <li>Tip and service charge saved on every bill</li>
                <li>Staff hours from attendance and shifts</li>
                <li>Payroll and staff reports</li>
              </ul>
            </div>
            <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=tip-pooling-calculator"
              onClick={() => track('tool_cta_click', { tool: 'tip-pooling-calculator' })}>Try DineOpen free →</Link>
          </section>

          <p className="updated">Updated October 2026</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/tip-pooling-calculator" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx global>{`
        .tt .pts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
        .tt .pts label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:700;color:#64748b}
        .tt .pts .inp{padding:9px 10px}
        .tt .staff{display:grid;gap:8px}
        .tt .srow{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,.7fr) 40px;gap:8px;align-items:center}
        .tt .srow.eq{grid-template-columns:minmax(0,1.3fr) minmax(0,1.1fr) 40px}
        .tt .srow .inp{padding:11px 12px}
        .tt .srow select.inp{padding-right:4px}
        .tt .del{width:40px;height:44px;border:0;border-radius:10px;background:#f1f5f9;color:#64748b;font-size:20px;cursor:pointer}
        .tt .del:hover:not(:disabled){background:#fee2e2;color:#ef4444}
        .tt .del:disabled{opacity:.4;cursor:default}
        .tt .staff-acts{display:flex;align-items:center;gap:14px;margin-top:12px;flex-wrap:wrap}
        .tt .staff-acts .btn{min-height:44px;padding:10px 16px;font-size:14.5px}
        .tt .linkish{border:0;background:none;padding:10px 4px;min-height:44px;font:inherit;font-size:14px;font-weight:700;color:#64748b;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
        .tt .linkish:hover{color:#ef4444}
        .tt .payouts{list-style:none;margin:18px 0 0;padding:0;border-top:1px solid rgba(255,255,255,.1)}
        .tt .payouts li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1)}
        .tt .payouts b{color:#fff;font-size:15px}
        .tt .payouts small{display:block;color:#94a3b8;font-size:12.5px;margin-top:2px}
        .tt .payouts .amt{font-size:18px;font-variant-numeric:tabular-nums;white-space:nowrap}
        .tt .step .ex{margin-top:10px;padding-top:10px;border-top:1px dashed #e2e8f0;color:#64748b;font-size:13.5px}
        @media (max-width:520px){
          .tt .pts{grid-template-columns:repeat(2,1fr)}
          .tt .srow,.tt .srow.eq{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 40px;row-gap:6px;padding-bottom:10px;border-bottom:1px solid #f1f5f9}
          .tt .srow input:first-of-type{grid-column:1 / 3}
          .tt .srow .del{grid-column:3;grid-row:1}
        }
        @media print{.tt .payouts b,.tt .payouts small{color:#000}}
      `}</style>
    </>
  );
}
