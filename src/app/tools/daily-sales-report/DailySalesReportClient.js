'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import ToolCTA from '../../../components/ToolCTA';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { track } from '../../../lib/analytics';
import { MODES, SAMPLE, BLANK, calc, FAQ } from './dsrContent';

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const rs = (x) => `${x < 0 ? '−' : ''}₹${nf.format(Math.round(Math.abs(x)))}`;
const DRAFT_KEY = 'dineopen-dsr-draft-v2';

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function niceDate(iso) {
  const [y, m, d] = (iso || '').split('-').map(Number);
  if (!y) return '';
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function diffText(r) {
  if (r.diff == null) return 'Not counted yet';
  if (Math.round(r.diff) === 0) return 'Matches';
  return `${r.diff < 0 ? 'Short' : 'Extra'} ${rs(Math.abs(r.diff))}`;
}

export default function DailySalesReportClient() {
  const [v, setV] = useState(SAMPLE);
  const [date, setDate] = useState('');
  const [copied, setCopied] = useState(false);
  const r = useMemo(() => calc(v), [v]);

  useEffect(() => {
    setDate(today());
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (saved && Array.isArray(saved.expenses)) setV({ ...BLANK, ...saved });
    } catch { /* no saved draft */ }
  }, []);
  useEffect(() => {
    try { if (v !== SAMPLE) localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* storage blocked */ }
  }, [v]);

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const setExp = (i, k) => (e) => setV((s) => ({ ...s, expenses: s.expenses.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) }));
  const addExp = () => setV((s) => ({ ...s, expenses: [...s.expenses, { what: '', amt: '' }] }));
  const delExp = (i) => setV((s) => ({ ...s, expenses: s.expenses.length > 1 ? s.expenses.filter((_, j) => j !== i) : [{ what: '', amt: '' }] }));
  const clearAll = () => { setV(BLANK); try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };

  const title = v.outlet.trim() || 'Daily sales report';
  const fileDate = date || today();

  const whatsappText = () => {
    const L = [`*${title} – Daily sales*`, niceDate(fileDate), ''];
    L.push(`Total sales: *${rs(r.total)}*`);
    if (r.bills) L.push(`Bills: ${r.bills} · Avg bill ${rs(r.avg)}`);
    r.modes.filter((m) => m.amt).forEach((m) => L.push(`${m.label}: ${rs(m.amt)}`));
    if (r.discounts) L.push(`Discounts: ${rs(r.discounts)}`);
    if (r.voidCount || r.voidAmount) L.push(`Cancelled bills: ${r.voidCount} (${rs(r.voidAmount)})`);
    L.push('', '*Cash drawer*', `Opening: ${rs(r.opening)}`, `Cash sales: ${rs(r.cash)}`);
    if (r.expTotal) L.push(`Paid from drawer: ${rs(r.expTotal)}`);
    if (r.takenOut) L.push(`Taken out: ${rs(r.takenOut)}`);
    L.push(`Expected: ${rs(r.expected)}`);
    if (r.countedSet) L.push(`Counted: ${rs(r.counted)} → *${diffText(r)}*`);
    if (r.expenses.length) { L.push('', '*Expenses*'); r.expenses.forEach((e) => L.push(`${e.what}: ${rs(e.amt)}`)); }
    if (v.notes.trim()) L.push('', `Note: ${v.notes.trim()}`);
    if (v.preparedBy.trim()) L.push(`– ${v.preparedBy.trim()}`);
    return L.join('\n');
  };

  const copyWa = async () => {
    track('tool_dsr_export', { kind: 'whatsapp_copy' });
    try { await navigator.clipboard.writeText(whatsappText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  const openWa = () => {
    track('tool_dsr_export', { kind: 'whatsapp_open' });
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText())}`, '_blank', 'noopener,noreferrer');
  };

  const downloadExcel = async () => {
    track('tool_dsr_export', { kind: 'excel' });
    const XLSX = await import('xlsx');
    const rows = [
      [title + ' – Daily sales report'],
      ['Date', niceDate(fileDate)],
      ...(v.preparedBy.trim() ? [['Prepared by', v.preparedBy.trim()]] : []),
      [],
      ['SALES BY PAYMENT MODE', 'Amount (₹)', 'Share'],
      ...r.modes.map((m) => [m.label, Math.round(m.amt), r.total ? `${((m.amt / r.total) * 100).toFixed(1)}%` : '']),
      ['Total sales', Math.round(r.total), ''],
      [],
      ['Number of bills', r.bills],
      ['Average bill (₹)', Math.round(r.avg)],
      ['Discounts given (₹)', Math.round(r.discounts)],
      ['Cancelled bills (count)', r.voidCount],
      ['Cancelled bills (₹)', Math.round(r.voidAmount)],
      [],
      ['CASH DRAWER', 'Amount (₹)'],
      ['Opening cash', Math.round(r.opening)],
      ['+ Cash sales', Math.round(r.cash)],
      ['− Expenses paid from drawer', Math.round(r.expTotal)],
      ['− Cash taken out', Math.round(r.takenOut)],
      ['Expected closing cash', Math.round(r.expected)],
      ['Counted closing cash', r.countedSet ? Math.round(r.counted) : ''],
      ['Difference', r.diff == null ? '' : Math.round(r.diff), diffText(r)],
      [],
      ['EXPENSES PAID FROM DRAWER', 'Amount (₹)'],
      ...(r.expenses.length ? r.expenses.map((e) => [e.what, Math.round(e.amt)]) : [['None', 0]]),
      ...(v.notes.trim() ? [[], ['Notes', v.notes.trim()]] : []),
      [],
      ['Made with the free daily sales report tool at dineopen.com/tools/daily-sales-report'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 34 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily sales');
    XLSX.writeFile(wb, `daily-sales-report-${fileDate}.xlsx`);
  };

  const printReport = () => {
    track('tool_dsr_export', { kind: 'print' });
    const row = (a, b, cls = '') => `<tr class="${cls}"><td>${esc(a)}</td><td class="n">${esc(b)}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)} – ${esc(fileDate)}</title><style>
      body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;margin:28px;font-size:13px}
      h1{font-size:20px;margin:0}.d{color:#555;margin:4px 0 18px}
      h2{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#555;margin:18px 0 6px}
      table{width:100%;border-collapse:collapse;max-width:520px}td{padding:6px 8px;border-bottom:1px solid #e5e5e5}
      td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}tr.t td{font-weight:700;border-top:2px solid #111}
      tr.bad td{color:#b91c1c;font-weight:700}tr.ok td{color:#15803d;font-weight:700}
      .sig{margin-top:40px;display:flex;gap:60px}.sig div{border-top:1px solid #999;padding-top:6px;width:180px;color:#555}
      .f{margin-top:28px;color:#888;font-size:11px}@page{margin:14mm}</style></head><body>
      <h1>${esc(title)} – Daily sales report</h1><div class="d">${esc(niceDate(fileDate))}${v.preparedBy.trim() ? ' · Prepared by ' + esc(v.preparedBy.trim()) : ''}</div>
      <h2>Sales by payment mode</h2><table>${r.modes.map((m) => row(m.label, rs(m.amt))).join('')}${row('Total sales', rs(r.total), 't')}</table>
      <h2>Bills</h2><table>${row('Number of bills', r.bills)}${row('Average bill', rs(r.avg))}${row('Discounts given', rs(r.discounts))}${row('Cancelled bills', `${r.voidCount} (${rs(r.voidAmount)})`)}</table>
      <h2>Cash drawer</h2><table>${row('Opening cash', rs(r.opening))}${row('+ Cash sales', rs(r.cash))}${row('− Paid from drawer', rs(r.expTotal))}${row('− Cash taken out', rs(r.takenOut))}${row('Expected closing cash', rs(r.expected), 't')}${row('Counted closing cash', r.countedSet ? rs(r.counted) : '—')}${row('Difference', diffText(r), r.diff == null ? '' : Math.round(r.diff) === 0 ? 'ok' : 'bad')}</table>
      ${r.expenses.length ? `<h2>Expenses paid from drawer</h2><table>${r.expenses.map((e) => row(e.what, rs(e.amt))).join('')}</table>` : ''}
      ${v.notes.trim() ? `<h2>Notes</h2><p>${esc(v.notes.trim())}</p>` : ''}
      <div class="sig"><div>Cashier</div><div>Manager / Owner</div></div>
      <div class="f">Made with the free daily sales report tool at dineopen.com</div></body></html>`;
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
    setTimeout(() => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 1000); }, 150);
  };

  const diffCls = r.diff == null ? '' : Math.round(r.diff) === 0 ? 'ok' : 'bad';
  const money = (k, label, hint) => (
    <div className="fld">
      <label className="lbl" htmlFor={`dsr-${k}`}><span>{label}</span></label>
      <div className="inwrap"><span className="pre">₹</span>
        <input id={`dsr-${k}`} className="inp" type="number" inputMode="decimal" min="0" value={v[k]} onChange={set(k)} placeholder="0" />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );

  return (
    <>
      <CommonHeader />
      <main className="tt dsr">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Daily sales report format</nav>

          <header className="head">
            <h1>Daily Sales Report Format</h1>
            <p className="lede">Fill in today’s sales and count the drawer. You get a clean report you can download as Excel, print as a PDF, or send to the owner on WhatsApp. Works for restaurants, cafés, bakeries and shops.</p>
          </header>

          <div className="app">
            <section className="card" aria-label="Today’s numbers">
              <div className="top">
                <div className="fld"><label className="lbl" htmlFor="dsr-outlet"><span>Outlet name</span></label>
                  <input id="dsr-outlet" className="inp" value={v.outlet} onChange={set('outlet')} placeholder="Your shop or restaurant" /></div>
                <div className="fld"><label className="lbl" htmlFor="dsr-date"><span>Date</span></label>
                  <input id="dsr-date" className="inp" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              </div>

              <h2 className="grp">Sales by payment mode</h2>
              <div className="fields">
                {MODES.map(([k, label]) => <div key={k}>{money(k, label)}</div>)}
              </div>

              <h2 className="grp">Bills</h2>
              <div className="fields">
                <div className="fld"><label className="lbl" htmlFor="dsr-bills"><span>Number of bills</span></label>
                  <input id="dsr-bills" className="inp" type="number" inputMode="numeric" min="0" value={v.bills} onChange={set('bills')} placeholder="0" /></div>
                {money('discounts', 'Discounts given')}
                <div className="fld"><label className="lbl" htmlFor="dsr-voidCount"><span>Cancelled bills</span></label>
                  <input id="dsr-voidCount" className="inp" type="number" inputMode="numeric" min="0" value={v.voidCount} onChange={set('voidCount')} placeholder="0" /></div>
                {money('voidAmount', 'Value of cancelled bills')}
              </div>

              <h2 className="grp">Cash drawer</h2>
              <div className="fields">
                {money('opening', 'Opening cash', 'Cash in the drawer when you opened.')}
                {money('takenOut', 'Cash taken out', 'Bank deposit or handed to the owner.')}
              </div>

              <div className="exp">
                <div className="lbl"><span>Expenses paid from the drawer</span></div>
                {v.expenses.map((e, i) => (
                  <div className="exprow" key={i}>
                    <input className="inp" aria-label="What was it for" value={e.what} onChange={setExp(i, 'what')} placeholder="e.g. milk, vegetables" />
                    <div className="inwrap"><span className="pre">₹</span>
                      <input className="inp" aria-label="Amount" type="number" inputMode="decimal" min="0" value={e.amt} onChange={setExp(i, 'amt')} placeholder="0" /></div>
                    <button type="button" className="x" onClick={() => delExp(i)} aria-label="Remove expense">×</button>
                  </div>
                ))}
                <button type="button" className="add" onClick={addExp}>+ Add expense</button>
              </div>

              <div className="fields" style={{ marginTop: 16 }}>
                {money('counted', 'Cash counted at closing', 'Count the drawer before you close.')}
                <div className="fld"><label className="lbl" htmlFor="dsr-by"><span>Prepared by</span></label>
                  <input id="dsr-by" className="inp" value={v.preparedBy} onChange={set('preparedBy')} placeholder="Cashier name" /></div>
              </div>
              <div className="fld" style={{ marginTop: 14 }}><label className="lbl" htmlFor="dsr-notes"><span>Notes</span></label>
                <textarea id="dsr-notes" className="inp" rows={2} value={v.notes} onChange={set('notes')} placeholder="Anything the owner should know" /></div>

              <p className="hint" style={{ marginTop: 16 }}>Example numbers are filled in so you can see the report. <button type="button" className="link" onClick={clearAll}>Start blank</button> · Your entries stay in this browser only.</p>
            </section>

            <aside className="res" aria-live="polite">
              <div className="k">Total sales · {niceDate(fileDate) || 'today'}</div>
              <div className="big">{rs(r.total)}</div>
              <div className="sub">{r.bills ? `${r.bills} bills · average bill ${rs(r.avg)}` : 'Add the number of bills to see the average bill'}</div>

              <ul className="costs">
                {r.modes.map((m) => (
                  <li key={m.k}><span>{m.label}</span><span>{rs(m.amt)}{r.total > 0 && <small>{((m.amt / r.total) * 100).toFixed(0)}%</small>}</span></li>
                ))}
              </ul>

              <div className={'cashbox ' + diffCls}>
                <div className="row"><span>Expected in drawer</span><b>{rs(r.expected)}</b></div>
                <div className="row"><span>Counted</span><b>{r.countedSet ? rs(r.counted) : '–'}</b></div>
                <div className="row d"><span>Difference</span><b>{diffText(r)}</b></div>
              </div>

              <div className="acts col">
                <button type="button" onClick={downloadExcel}>Download Excel</button>
                <button type="button" onClick={printReport}>Print / save PDF</button>
              </div>
              <div className="acts">
                <button type="button" onClick={copyWa}>{copied ? 'Copied ✓' : 'Copy for WhatsApp'}</button>
                <button type="button" onClick={openWa}>Open WhatsApp</button>
              </div>
              <p className="note">Swiggy and Zomato money reaches you in the weekly payout after commission, so it isn’t counted in the drawer.</p>
            </aside>
          </div>

          <ToolCTA
            tool="daily-sales-report"
            title="Get this report without typing it every night"
            text="DineOpen builds the daily report from every bill, split by cash, UPI, card and apps, and sends it to the owner on WhatsApp. 7-day free trial."
          />

          <section className="sec" id="format">
            <h2>What goes in a daily sales report</h2>
            <p className="intro">This is the format most owners settle on after a few months. It fits on one page and answers the two questions that matter at night: how much did we sell, and is the cash right?</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Section</th><th>What to write</th></tr></thead>
                <tbody>
                  <tr><td>Sales by payment mode</td><td>Cash, UPI, card, Swiggy, Zomato and credit (udhaar), with the total.</td></tr>
                  <tr><td>Bills</td><td>Number of bills, average bill, discounts and cancelled bills.</td></tr>
                  <tr><td>Cash drawer</td><td>Opening cash, cash sales, expenses paid from the drawer, cash taken out, expected and counted cash.</td></tr>
                  <tr><td>Expenses</td><td>Each payment from the drawer with what it was for.</td></tr>
                  <tr><td>Sign-off</td><td>Who prepared it, and any note for the owner.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="cash-check">
            <h2>How the cash check works</h2>
            <div className="prose">
              <div className="formula">Expected cash = Opening cash + Cash sales − Paid from drawer − Cash taken out</div>
              <p>Count the drawer and compare it with the expected cash. A difference of a few rupees on a busy day is normal. A shortage that keeps coming back on the same shift is not, and that is usually the first thing an owner notices once the report is filled every night.</p>
              <p>Keep UPI out of the drawer count. If staff note a UPI payment as cash by mistake, the drawer looks short even though the money is in your bank.</p>
            </div>
          </section>

          <section className="sec" id="faq">
            <h2>Questions owners ask</h2>
            <div className="faq">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}><summary><h3>{q}</h3></summary><p>{a}</p></details>
              ))}
            </div>
          </section>

          <section className="sec">
            <h2>Guides and tools</h2>
            <div className="related">
              <Link href="/tools/restaurant-invoice-generator"><b>Restaurant bill generator</b><span>Make a GST bill with your logo.</span></Link>
              <Link href="/tools/swiggy-zomato-calculator"><b>Swiggy & Zomato calculator</b><span>What you really get from each app order.</span></Link>
              <Link href="/tools/kot-system"><b>KOT format</b><span>Printable kitchen order ticket.</span></Link>
              <Link href="/tools/food-business-profit-calculator"><b>Profit calculator</b><span>What you keep each month.</span></Link>
              <Link href="/blog/restaurant-profit-margins-india-guide.html"><b>Restaurant profit margins</b><span>Usual margins in India.</span></Link>
              <Link href="/tools/gst-calculator"><b>GST calculator</b><span>GST on restaurant bills.</span></Link>
            </div>
          </section>

          <p className="updated">Updated November 2026 · Nothing you type here is sent to us. The report is made in your browser.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/daily-sales-report" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{dsrStyles}</style>
    </>
  );
}

const dsrStyles = css.global`
  .dsr .top{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px}
  .dsr .grp{font-size:13px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);font-weight:800;margin:24px 0 12px;padding-top:18px;border-top:1px solid var(--line)}
  .dsr .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .dsr .fld{min-width:0}
  .dsr .inwrap{position:relative;display:flex;align-items:center;min-width:0}
  .dsr .inwrap .inp{padding-left:28px;font-weight:700}
  .dsr .pre{position:absolute;left:12px;color:var(--muted);font-weight:700;pointer-events:none}
  .dsr textarea.inp{resize:vertical;font-size:15px}
  .dsr .exp{margin-top:16px}
  .dsr .exprow{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) 40px;gap:8px;margin-bottom:8px}
  .dsr .x{border:1.5px solid var(--line);background:#fff;border-radius:12px;font-size:20px;color:var(--muted);cursor:pointer}
  .dsr .x:hover{color:var(--red);border-color:#fca5a5}
  .dsr .add,.dsr .link{border:0;background:none;color:var(--red-d);font:inherit;font-weight:700;cursor:pointer;padding:4px 0}
  .dsr .link{font-size:13px;padding:0}
  .dsr .costs{list-style:none;margin:18px 0 0;padding:0;border-top:1px solid rgba(255,255,255,.12)}
  .dsr .costs li{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px;color:#cbd5e1}
  .dsr .costs li span:last-child{color:#fff;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
  .dsr .costs small{color:#94a3b8;font-weight:600;margin-left:8px;display:inline-block;min-width:32px;text-align:right}
  .dsr .cashbox{margin-top:16px;border-radius:14px;background:#1e293b;padding:12px 14px}
  .dsr .cashbox .row{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:14px;color:#cbd5e1}
  .dsr .cashbox b{color:#fff;font-variant-numeric:tabular-nums}
  .dsr .cashbox .d{border-top:1px solid rgba(255,255,255,.1);margin-top:4px;padding-top:9px}
  .dsr .cashbox.ok .d b{color:#4ade80}
  .dsr .cashbox.bad{box-shadow:inset 0 0 0 1.5px #f87171}
  .dsr .cashbox.bad .d b{color:#fca5a5}
  .dsr .res .acts.col button:first-child{background:#ef4444;border-color:#ef4444}
  .dsr .res .acts.col button:first-child:hover{background:#dc2626}
  @media (max-width:520px){
    .dsr .top{grid-template-columns:minmax(0,1fr)}
    .dsr .fields{gap:12px 10px}
    .dsr .exprow{grid-template-columns:minmax(0,1fr) 110px 40px}
    .dsr .res .acts{flex-direction:column}
  }
`;
