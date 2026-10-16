'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { detectCountry } from '../../../lib/detectCountry';
import { track } from '../../../lib/analytics';
import {
  TYPES, HAS_KITCHEN, HAS_TABLES, HAS_WAITERS, ITEMS, TIERS, buildKit,
  PRINTER_GUIDE, CONNECTIONS, DEVICE_GUIDE, FAQ, RELATED,
} from './hardwareContent';

const CURRENCIES = ['INR', 'USD', 'CAD', 'GBP', 'EUR', 'AUD', 'AED', 'SAR', 'QAR', 'ZAR', 'KES', 'SGD', 'MYR'];
const COUNTRY_CURRENCY = {
  IN: 'INR', US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', AE: 'AED', SA: 'SAR', QA: 'QAR', ZA: 'ZAR', KE: 'KES', SG: 'SGD', MY: 'MYR',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', AT: 'EUR', BE: 'EUR', PT: 'EUR',
};
const FROM_USD = { USD: 1, CAD: 1.38, GBP: 0.79, EUR: 0.92, AUD: 1.53, AED: 3.67, SAR: 3.75, QAR: 3.64, ZAR: 17.5, KES: 129, SGD: 1.3, MYR: 4.4 };

// Two significant figures keeps converted prices looking like real price tags.
function nice(n) {
  if (n <= 0) return 0;
  const step = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / step) * step;
}

const ICON = {
  device: <><rect x="4" y="3" width="16" height="12" rx="2" /><path d="M8 21h8M12 15v6" /></>,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  printer: <><path d="M7 8V3h10v5" /><rect x="3" y="8" width="18" height="9" rx="2" /><path d="M7 14h10v7H7z" /></>,
  screen: <><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M6 9h5M6 12h8M15 9h3" /></>,
  drawer: <><rect x="3" y="9" width="18" height="10" rx="2" /><path d="M3 13h18M10 16h4M6 9l2-4h8l2 4" /></>,
  scan: <><path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M17 8v8" /></>,
  scale: <><path d="M4 20h16l-2-9H6z" /><path d="M9 11V8h6v3M12 8V5" /></>,
  wifi: <><path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" /></>,
  power: <><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></>,
  bill: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
};
const ITEM_ICON = {
  own: 'device', tablet: 'device', laptop: 'device', aio: 'device', digital: 'bill', oldscreen: 'screen', kds: 'screen', cdisplay: 'screen',
  ownphones: 'phone', phones: 'phone', qrpaper: 'qr', qrstand: 'qr', bt58: 'printer', bill80: 'printer', kot80: 'printer',
  drawer: 'drawer', scanner: 'scan', scale: 'scale', router: 'wifi', ups: 'power',
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON[name]}
    </svg>
  );
}

function Stepper({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="lbl"><span>{label}</span></div>
      <div className="stepper">
        <button type="button" aria-label={`Fewer: ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`More: ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

export default function HardwareKitClient() {
  const [type, setType] = useState('cafe');
  const [counts, setCounts] = useState(TYPES[0][2]);
  const [currency, setCurrency] = useState('USD');
  const [tier, setTier] = useState('ess');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const { countryCode } = detectCountry();
    if (countryCode && COUNTRY_CURRENCY[countryCode]) setCurrency(COUNTRY_CURRENCY[countryCode]);
  }, []);

  const fmt = useMemo(() => {
    let nf;
    try { nf = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }); } catch { nf = new Intl.NumberFormat('en-US'); }
    return (n) => nf.format(n);
  }, [currency]);

  const price = (id) => {
    const it = ITEMS[id];
    if (currency === 'INR') return it[4];
    const k = FROM_USD[currency] || 1;
    return [nice(it[5][0] * k), nice(it[5][1] * k)];
  };
  const range = (lo, hi) => (hi === 0 ? 'Free' : `${fmt(lo)} – ${fmt(hi)}`);

  const kits = useMemo(() => TIERS.map(([id]) => {
    const list = buildKit(type, id, counts, currency);
    const total = list.reduce((s, [it, q]) => { const [lo, hi] = price(it); return [s[0] + lo * q, s[1] + hi * q]; }, [0, 0]);
    return [id, list, total];
  }), [type, counts, currency]); // eslint-disable-line react-hooks/exhaustive-deps

  const [, list, total] = kits.find(([id]) => id === tier);
  const typeName = TYPES.find(([id]) => id === type)[1];
  const tierName = TIERS.find(([id]) => id === tier)[1];

  const pickType = (id) => { setType(id); setCounts(TYPES.find(([t]) => t === id)[2]); track('tool_hw_type', { type: id }); };
  const setCount = (k) => (v) => setCounts((c) => ({ ...c, [k]: v }));

  const copy = async () => {
    const lines = [`${typeName} – ${tierName}`, ...list.map(([id, q]) => { const [lo, hi] = price(id); return `${q} × ${ITEMS[id][0]}: ${range(lo * q, hi * q)}`; }), `Approx. total: ${range(total[0], total[1])}`];
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
    track('tool_hw_copy', { type, tier });
  };

  return (
    <>
      <CommonHeader />
      <main className="tt hw">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Restaurant POS hardware</nav>

          <header className="head">
            <h1>Restaurant POS Hardware Kit Builder</h1>
            <p className="lede">Tell us about your place and see exactly what to buy: billing device, printers, cash drawer, kitchen screen and more, with typical prices. Or start with the phone in your pocket.</p>
          </header>

          <section className="card setup" aria-label="Your restaurant">
            <div className="lbl"><span>Type of business</span></div>
            <div className="types" role="group" aria-label="Type of business">
              {TYPES.map(([id, name]) => (
                <button key={id} type="button" className={'chip' + (type === id ? ' on' : '')} aria-pressed={type === id} onClick={() => pickType(id)}>{name}</button>
              ))}
            </div>
            <div className="counts">
              <Stepper label="Billing counters" value={counts.counters} min={1} max={6} onChange={setCount('counters')} />
              {HAS_KITCHEN.includes(type) && <Stepper label="Kitchen stations" value={counts.stations} min={1} max={6} onChange={setCount('stations')} />}
              {HAS_TABLES.includes(type) && <Stepper label="Tables" value={counts.tables} min={0} max={80} onChange={setCount('tables')} />}
              {HAS_WAITERS.includes(type) && <Stepper label="Waiters per shift" value={counts.waiters} min={0} max={20} onChange={setCount('waiters')} />}
              <div>
                <label className="lbl" htmlFor="hw-cur">Prices in</label>
                <select id="hw-cur" className="inp" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {HAS_KITCHEN.includes(type) && <p className="hint">A station is anywhere that needs its own order tickets, such as the main kitchen, tandoor, grill or bar.</p>}
          </section>

          <div className="tiers" role="tablist" aria-label="Choose a setup">
            {kits.map(([id, , tot]) => {
              const t = TIERS.find(([x]) => x === id);
              return (
                <button key={id} type="button" role="tab" aria-selected={tier === id} className={'tier' + (tier === id ? ' on' : '')} onClick={() => { setTier(id); track('tool_hw_tier', { tier: id }); }}>
                  <span className="tn">{t[1]}</span>
                  <b>{tot[1] === 0 ? fmt(0) : `${fmt(tot[0])} – ${fmt(tot[1])}`}</b>
                  <span className="td">{t[2]}</span>
                </button>
              );
            })}
          </div>

          <div className="kit" role="tabpanel" aria-label={tierName}>
            <div className="kit-head">
              <div>
                <h2>Your {tierName.toLowerCase()} kit</h2>
                <p>{typeName} · {counts.counters} counter{counts.counters > 1 ? 's' : ''}{HAS_KITCHEN.includes(type) ? ` · ${counts.stations} kitchen station${counts.stations > 1 ? 's' : ''}` : ''}</p>
              </div>
              <div className="kit-total">
                <span>Approx. total</span>
                <b>{total[1] === 0 ? fmt(0) : `${fmt(total[0])} – ${fmt(total[1])}`}</b>
              </div>
            </div>
            <ul className="items">
              {list.map(([id, q]) => {
                const it = ITEMS[id]; const [lo, hi] = price(id);
                return (
                  <li key={id}>
                    <span className="ic"><Icon name={ITEM_ICON[id]} /></span>
                    <div className="body">
                      <div className="nm"><b>{q > 1 ? `${q} × ` : ''}{it[0]}</b><span className="pr">{range(lo * q, hi * q)}</span></div>
                      <p className="spec">{it[1]}{q > 1 && hi > 0 ? ` · ${range(lo, hi)} each` : ''}</p>
                      <p className="why">{it[2]}</p>
                      <p className="works">✓ Works with DineOpen: {it[3]}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {tier === 'lean' && <p className="kit-note">Add a receipt printer and cash drawer when you’re ready. They connect in a few minutes.</p>}
            <div className="kit-acts no-print">
              <button type="button" className="btn ghost" onClick={copy}>{copied ? '✓ Copied' : 'Copy shopping list'}</button>
              <button type="button" className="btn ghost" onClick={() => { window.print(); track('tool_hw_print', { type, tier }); }}>Print</button>
              <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=pos-hardware"
                onClick={() => track('tool_cta_click', { tool: 'pos-hardware', tier })}>Start free on the device you have →</Link>
            </div>
            <p className="kit-fine">Typical prices for new hardware, October 2026. {currency === 'INR' ? 'Indian market prices.' : currency === 'USD' ? 'US market prices.' : `Converted from typical US prices; local prices vary with import duty and brand.`} DineOpen doesn’t sell hardware. Buy from any local supplier.</p>
          </div>

          <section className="sec" id="do-you-need-a-pos-machine">
            <h2>Do you need a special POS machine?</h2>
            <div className="prose">
              <p>No. A “POS machine” is just a device that runs billing software, plus a printer. DineOpen runs in the browser and as apps for Windows, Android and iPhone, so the phone, tablet or laptop you own already works. Many owners bill from a phone on day one and buy hardware once they know what they need.</p>
              <p>Buy dedicated hardware when the counter gets busy: a receipt printer speeds up billing, a kitchen printer or screen stops lost orders, and a cash drawer keeps cash safe.</p>
            </div>
          </section>

          <section className="sec" id="which-device">
            <h2>Phone, tablet, laptop or terminal?</h2>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Device</th><th>Best for</th><th>Good to know</th></tr></thead>
                <tbody>{DEVICE_GUIDE.map(([d, b, n]) => <tr key={d}><td><b>{d}</b></td><td>{b}</td><td style={{ color: '#64748b' }}>{n}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="choosing-a-printer">
            <h2>Choosing a restaurant printer</h2>
            <p className="intro">Two questions: what size and type of printer, and how it connects.</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Printer</th><th>Best for</th><th>Good to know</th></tr></thead>
                <tbody>{PRINTER_GUIDE.map(([d, b, n]) => <tr key={d}><td><b>{d}</b></td><td>{b}</td><td style={{ color: '#64748b' }}>{n}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="tbl-wrap" style={{ marginTop: 16 }}>
              <table className="tbl">
                <thead><tr><th>Connection</th><th>Best for</th><th>Good to know</th></tr></thead>
                <tbody>{CONNECTIONS.map(([d, b, n]) => <tr key={d}><td><b>{d}</b></td><td>{b}</td><td style={{ color: '#64748b' }}>{n}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="works-with-dineopen">
            <h2>What works with DineOpen</h2>
            <div className="steps">
              <div className="step"><i>W</i><h3>Windows app</h3><p>USB and network printers print without a dialog box. Cash drawer, USB barcode scanner and USB or RS-232 weighing scale.</p></div>
              <div className="step"><i>A</i><h3>Android app</h3><p>Bluetooth (BLE), USB and network printers, plus the built-in printer on Android POS handhelds.</p></div>
              <div className="step"><i>i</i><h3>iPhone &amp; iPad</h3><p>Network and Bluetooth (BLE) printers and AirPrint. The kitchen display and customer display run in any browser.</p></div>
            </div>
          </section>

          <section className="sec" id="faq">
            <h2>Restaurant POS hardware FAQ</h2>
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
              <h2>Start billing today, buy hardware later</h2>
              <p>DineOpen works on the phone, tablet or laptop you already have, in any country.</p>
              <ul>
                <li>7-day free trial</li>
                <li>No card needed</li>
                <li>Free menu setup</li>
              </ul>
            </div>
            <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=pos-hardware"
              onClick={() => track('tool_cta_click', { tool: 'pos-hardware', where: 'footer' })}>Try DineOpen free →</Link>
          </section>

          <p className="updated">Updated October 2026 · Prices are typical ranges for new hardware and change often.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/restaurant-pos-hardware" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{hwStyles}</style>
    </>
  );
}

const hwStyles = css.global`
  .hw .setup{max-width:none}
  .hw .types{display:flex;flex-wrap:wrap;gap:8px}
  .hw .types .chip{padding:10px 16px;font-size:14.5px;font-weight:700}
  .hw .counts{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-top:20px}
  .hw .counts select.inp{height:50px;font-weight:700;cursor:pointer}
  .hw .tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}
  .hw .tier{text-align:left;border:1.5px solid var(--line);background:#fff;border-radius:18px;padding:18px;cursor:pointer;font:inherit;transition:all .15s;min-width:0}
  .hw .tier:hover{border-color:#fca5a5}
  .hw .tier.on{border-color:var(--red);box-shadow:0 0 0 4px rgba(239,68,68,.1);background:var(--red-soft)}
  .hw .tier .tn{display:block;font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
  .hw .tier.on .tn{color:var(--red-d)}
  .hw .tier b{display:block;font-size:clamp(19px,2.2vw,24px);font-weight:900;color:var(--ink);margin:6px 0 4px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
  .hw .tier .td{display:block;font-size:13.5px;color:var(--body);line-height:1.45}
  .hw .kit{margin-top:16px;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#fff}
  .hw .kit-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 24px;background:var(--ink);color:#fff}
  .hw .kit-head h2{margin:0;font-size:20px;color:#fff}
  .hw .kit-head p{margin:4px 0 0;color:#cbd5e1;font-size:14px}
  .hw .kit-total{text-align:right}
  .hw .kit-total span{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8}
  .hw .kit-total b{font-size:clamp(22px,3vw,30px);font-weight:900;font-variant-numeric:tabular-nums;white-space:nowrap}
  .hw .items{list-style:none;margin:0;padding:0}
  .hw .items li{display:flex;gap:14px;padding:18px 24px;border-top:1px solid #f1f5f9}
  .hw .items li:first-child{border-top:0}
  .hw .ic{flex-shrink:0;width:44px;height:44px;border-radius:12px;background:var(--red-soft);color:var(--red);display:grid;place-items:center}
  .hw .body{flex:1;min-width:0}
  .hw .nm{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
  .hw .nm b{color:var(--ink);font-size:16px}
  .hw .pr{font-weight:800;color:var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums}
  .hw .spec{margin:3px 0 0;font-size:13.5px;color:var(--muted)}
  .hw .why{margin:6px 0 0;font-size:14.5px;color:var(--body);line-height:1.55}
  .hw .works{margin:6px 0 0;font-size:13px;font-weight:600;color:var(--green)}
  .hw .kit-note{margin:0;padding:14px 24px;background:var(--green-soft);color:#166534;font-size:14.5px;font-weight:600}
  .hw .kit-acts{display:flex;gap:10px;flex-wrap:wrap;padding:18px 24px;border-top:1px solid var(--line)}
  .hw .kit-acts .btn{min-height:46px;padding:12px 18px;font-size:15px}
  .hw .kit-acts .btn:last-child{margin-left:auto}
  .hw .kit-fine{margin:0;padding:0 24px 18px;font-size:12.5px;color:var(--muted);line-height:1.5}
  .hw .steps .step i{font-size:13px}
  @media (max-width:860px){
    .hw .tiers{grid-template-columns:minmax(0,1fr)}
    .hw .tier{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:2px 12px;padding:14px 16px}
    .hw .tier .tn{grid-column:1}
    .hw .tier b{grid-column:2;grid-row:1 / span 2;margin:0;font-size:18px;text-align:right}
    .hw .tier .td{grid-column:1}
  }
  @media (max-width:520px){
    .hw .types .chip{padding:9px 12px;font-size:14px}
    .hw .counts{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .hw .stepper button{width:44px}
    .hw .kit-head{flex-direction:column;align-items:flex-start;padding:18px}
    .hw .kit-total{text-align:left}
    .hw .items li{padding:16px 18px;gap:12px}
    .hw .ic{width:38px;height:38px}
    .hw .nm{flex-direction:column;gap:2px}
    .hw .kit-acts{padding:16px 18px}
    .hw .kit-acts .btn{flex:1 1 100%}
    .hw .kit-acts .btn:last-child{margin-left:0}
    .hw .kit-note,.hw .kit-fine{padding-left:18px;padding-right:18px}
  }
`;
