'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import ToolCTA from '../../../components/ToolCTA';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { track } from '../../../lib/analytics';
import { ORDER_TYPES, PAPERS, SAMPLE_ITEMS, FAQ } from './kotContent';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function nowParts() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return { date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` };
}

// One HTML document used for both the on-screen preview and printing, so what you see is what prints.
function kotDoc(k, paperId, blank) {
  const paper = PAPERS.find((p) => p.id === paperId);
  const thermal = paper.id !== 'a5';
  const items = blank ? Array.from({ length: 12 }, () => ({ name: '', qty: '', note: '' })) : k.items.filter((i) => i.name.trim());
  const where = k.type === 'Dine-in' ? `Table: <b>${esc(k.table || (blank ? '' : '–'))}</b>` : `<b>${esc(k.type.toUpperCase())}</b>`;
  const head = blank
    ? `<div class="g"><span>KOT No: ________</span><span>Table: ______</span></div><div class="g"><span>Date: __________</span><span>Time: ______</span></div><div class="g"><span>Waiter: ______________</span><span>Dine-in / Parcel</span></div>`
    : `<div class="g"><span>KOT <b>#${esc(k.kotNo || '1')}</b></span><span>${where}</span></div><div class="g"><span>${esc(k.date)}</span><span>${esc(k.time)}</span></div>${k.waiter.trim() ? `<div class="g"><span>Waiter: ${esc(k.waiter.trim())}</span>${k.type !== 'Dine-in' && k.table ? `<span>Ref: ${esc(k.table)}</span>` : '<span></span>'}</div>` : ''}`;
  const rows = items.map((i) => `<tr><td class="q">${esc(i.qty)}</td><td>${esc(i.name)}${i.note && i.note.trim() ? `<div class="nt">→ ${esc(i.note.trim())}</div>` : ''}</td></tr>`).join('');
  const totalQty = items.reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
  const style = thermal
    ? `@page{size:${paper.widthMm}mm auto;margin:0}body{width:${paper.widthMm - 6}mm;margin:0 auto;padding:3mm 0;font-family:'Courier New',ui-monospace,monospace;font-size:${paper.id === '58' ? 12 : 13.5}px;line-height:1.35;color:#000}`
    : `@page{size:A5;margin:10mm}body{margin:0;padding:6px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#000}`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>KOT</title><style>${style}
    *{box-sizing:border-box}h1{font-size:1.25em;text-align:center;margin:0 0 2px;letter-spacing:.04em}
    .sub{text-align:center;font-size:.85em;margin-bottom:6px}.g{display:flex;justify-content:space-between;gap:8px;margin:2px 0}
    hr{border:0;border-top:1px dashed #000;margin:6px 0}table{width:100%;border-collapse:collapse;font-size:inherit}
    th{text-align:left;font-size:.85em;border-bottom:1px dashed #000;padding:3px 0}td{padding:4px 0;vertical-align:top}
    td.q,th.q{width:${thermal ? '3.2em' : '4em'};font-weight:700}${blank && !thermal ? 'td{border-bottom:1px solid #bbb;height:30px}' : ''}
    .nt{font-size:.85em;font-style:italic}.tot{display:flex;justify-content:space-between;font-weight:700;margin-top:4px}
    .ft{text-align:center;font-size:.8em;margin-top:8px}${thermal ? '' : '.box{border:1.5px solid #000;padding:12px;border-radius:4px}'}
    </style></head><body><div class="box">
    ${k.outlet.trim() ? `<div class="sub">${esc(k.outlet.trim())}</div>` : ''}
    <h1>KITCHEN ORDER TICKET</h1><hr>${head}<hr>
    <table><thead><tr><th class="q">Qty</th><th>Item</th></tr></thead><tbody>${rows}</tbody></table>
    ${blank ? '' : `<hr><div class="tot"><span>Items: ${items.length}</span><span>Qty: ${totalQty}</span></div>`}
    ${blank && !thermal ? '<div class="g" style="margin-top:14px"><span>Kitchen sign: __________</span><span>Captain sign: __________</span></div>' : ''}
    </div></body></html>`;
}

function printDoc(html) {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(f);
  f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
  setTimeout(() => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 1000); }, 150);
}

export default function KOTSystemClient() {
  const [k, setK] = useState({ outlet: '', type: 'Dine-in', table: 'T4', kotNo: '27', waiter: 'Ramesh', date: '', time: '', items: SAMPLE_ITEMS });
  const [paper, setPaper] = useState('80');
  const [h, setH] = useState(300);
  const frame = useRef(null);

  useEffect(() => { const n = nowParts(); setK((s) => ({ ...s, date: n.date, time: n.time })); }, []);

  const set = (f) => (e) => setK((s) => ({ ...s, [f]: e.target.value }));
  const setItem = (i, f) => (e) => setK((s) => ({ ...s, items: s.items.map((x, j) => (j === i ? { ...x, [f]: e.target.value } : x)) }));
  const addItem = () => setK((s) => ({ ...s, items: [...s.items, { name: '', qty: '1', note: '' }] }));
  const delItem = (i) => setK((s) => ({ ...s, items: s.items.length > 1 ? s.items.filter((_, j) => j !== i) : [{ name: '', qty: '1', note: '' }] }));

  const doc = kotDoc(k, paper, false);
  const p = PAPERS.find((x) => x.id === paper);
  const previewW = p.id === 'a5' ? 520 : Math.round(p.widthMm * 3.78);

  const fit = () => {
    try { const b = frame.current.contentDocument.body; setH(Math.max(200, b.scrollHeight + 16)); } catch { /* preview not ready */ }
  };

  return (
    <>
      <CommonHeader />
      <main className="tt kot">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › KOT format</nav>

          <header className="head">
            <h1>KOT Format for Restaurants</h1>
            <p className="lede">Type the table, waiter and items, and print a kitchen order ticket on a 58 mm or 80 mm thermal printer, or as an A5 page for a KOT book. You can also print blank KOT pages to use by hand.</p>
          </header>

          <div className="app">
            <section className="card" aria-label="KOT details">
              <div className="fld"><div className="lbl"><span>Order type</span></div>
                <div className="seg" role="group" aria-label="Order type">
                  {ORDER_TYPES.map((t) => <button key={t} type="button" className={k.type === t ? 'on' : ''} aria-pressed={k.type === t} onClick={() => setK((s) => ({ ...s, type: t }))}>{t}</button>)}
                </div>
              </div>
              <div className="fields" style={{ marginTop: 16 }}>
                <div className="fld"><label className="lbl" htmlFor="kot-table"><span>{k.type === 'Dine-in' ? 'Table no.' : 'Order ref / token'}</span></label>
                  <input id="kot-table" className="inp" value={k.table} onChange={set('table')} placeholder={k.type === 'Dine-in' ? 'T4' : 'Token 12'} /></div>
                <div className="fld"><label className="lbl" htmlFor="kot-no"><span>KOT no.</span></label>
                  <input id="kot-no" className="inp" value={k.kotNo} onChange={set('kotNo')} /></div>
                <div className="fld"><label className="lbl" htmlFor="kot-waiter"><span>Waiter / captain</span></label>
                  <input id="kot-waiter" className="inp" value={k.waiter} onChange={set('waiter')} /></div>
                <div className="fld"><label className="lbl" htmlFor="kot-time"><span>Time</span></label>
                  <input id="kot-time" className="inp" value={k.time} onChange={set('time')} /></div>
              </div>
              <div className="fld" style={{ marginTop: 14 }}><label className="lbl" htmlFor="kot-outlet"><span>Restaurant name <small>optional</small></span></label>
                <input id="kot-outlet" className="inp" value={k.outlet} onChange={set('outlet')} placeholder="Shown small at the top" /></div>

              <div className="items">
                <div className="lbl"><span>Items</span></div>
                <div className="ihead"><span>Qty</span><span>Item</span><span>Note for kitchen</span><span /></div>
                {k.items.map((it, i) => (
                  <div className="irow" key={i}>
                    <input className="inp q" aria-label="Quantity" type="number" inputMode="numeric" min="0" value={it.qty} onChange={setItem(i, 'qty')} />
                    <input className="inp" aria-label="Item name" value={it.name} onChange={setItem(i, 'name')} placeholder="Item name" />
                    <input className="inp" aria-label="Note" value={it.note} onChange={setItem(i, 'note')} placeholder="e.g. no onion" />
                    <button type="button" className="x" onClick={() => delItem(i)} aria-label="Remove item">×</button>
                  </div>
                ))}
                <button type="button" className="add" onClick={addItem}>+ Add item</button>
              </div>
            </section>

            <aside className="prev" aria-label="KOT preview">
              <div className="seg" role="group" aria-label="Paper size">
                {PAPERS.map((x) => <button key={x.id} type="button" className={paper === x.id ? 'on' : ''} aria-pressed={paper === x.id} onClick={() => setPaper(x.id)}>{x.name}</button>)}
              </div>
              <p className="hint" style={{ textAlign: 'center' }}>{p.hint}</p>
              <div className="paper">
                <iframe ref={frame} title="KOT preview" srcDoc={doc} onLoad={fit} style={{ width: previewW, height: h }} />
              </div>
              <div className="pacts">
                <button type="button" className="btn" onClick={() => { track('tool_kot_print', { paper, blank: false }); printDoc(doc); }}>Print KOT</button>
                <button type="button" className="btn ghost" onClick={() => { track('tool_kot_print', { paper, blank: true }); printDoc(kotDoc(k, paper, true)); }}>Print blank KOT</button>
              </div>
              <p className="hint">On a thermal printer, pick the printer in the print window and set margins to none. For a KOT book, print blank A5 pages and staple them.</p>
            </aside>
          </div>

          <ToolCTA
            tool="kot-system"
            title="Let the KOT print itself"
            text="With DineOpen, the KOT prints in the kitchen the moment the waiter saves the order. Each station gets only its items, and nothing gets lost between the KOT and the bill. 7-day free trial."
          />

          <section className="sec" id="what-is-kot">
            <h2>What is a KOT?</h2>
            <div className="prose">
              <p>A KOT, or kitchen order ticket, is the slip that tells the kitchen what to cook. The waiter takes the order at the table, writes or prints the KOT, and the kitchen cooks from it. Later the bill is made from the same items.</p>
              <p>A good KOT format is short. The cook needs the table, the items, the quantity and any special request, all readable from a metre away. Prices, GST and the restaurant’s address don’t belong on a KOT.</p>
              <h3>Fields in a standard KOT format</h3>
              <ul>
                <li><b>KOT number</b>, so every ticket can be matched to a bill later</li>
                <li><b>Date and time</b>, which also tells you how long an order waited</li>
                <li><b>Table number</b>, or takeaway / delivery with a token number</li>
                <li><b>Waiter or captain</b> who took the order</li>
                <li><b>Items with quantity</b>, one per line</li>
                <li><b>Notes</b> like less spicy, no onion, Jain, extra cheese</li>
              </ul>
            </div>
          </section>

          <section className="sec" id="kot-book-vs-pos">
            <h2>KOT book or KOT printer?</h2>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th></th><th>Handwritten KOT book</th><th>KOT printed from a POS</th></tr></thead>
                <tbody>
                  <tr><td>Cost to start</td><td>A few hundred rupees</td><td>Thermal printer and software</td></tr>
                  <tr><td>Reading the order</td><td>Depends on handwriting</td><td>Clear print every time</td></tr>
                  <tr><td>Items added later</td><td>New slip, easy to miss</td><td>Prints only the new items</td></tr>
                  <tr><td>More than one kitchen</td><td>Copy by hand for each</td><td>Each station gets its own items</td></tr>
                  <tr><td>Matching KOT to bill</td><td>By hand at closing</td><td>Bill is made from the KOT itself</td></tr>
                </tbody>
              </table>
            </div>
            <p className="intro" style={{ marginTop: 16 }}>A KOT book is fine for a small place in its first months. Once there are several waiters or a busy dinner rush, the gap between what was cooked and what was billed starts costing more than a printer.</p>
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
              <Link href="/tools/daily-sales-report"><b>Daily sales report format</b><span>Excel, PDF or WhatsApp.</span></Link>
              <Link href="/tools/restaurant-pos-hardware"><b>POS hardware kit</b><span>Printers and devices you need.</span></Link>
              <Link href="/tools/menu-card-maker"><b>Menu card maker</b><span>Design and print your menu.</span></Link>
              <Link href="/restaurant-pos-software-india"><b>Restaurant POS software</b><span>Billing and KOT together.</span></Link>
              <Link href="/products/kitchen"><b>Kitchen display</b><span>KOTs on a screen instead of paper.</span></Link>
            </div>
          </section>

          <p className="updated">Updated November 2026 · The KOT is made in your browser. Nothing you type is sent to us.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/kot-system" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{kotStyles}</style>
    </>
  );
}

const kotStyles = css.global`
  .kot .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .kot .fld{min-width:0}
  .kot .items{margin-top:22px;padding-top:18px;border-top:1px solid var(--line)}
  .kot .ihead,.kot .irow{display:grid;grid-template-columns:64px minmax(0,1.5fr) minmax(0,1fr) 40px;gap:8px}
  .kot .ihead{font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px}
  .kot .irow{margin-bottom:8px}
  .kot .irow .inp{padding:10px 10px;font-size:15px}
  .kot .irow .q{text-align:center;font-weight:800}
  .kot .x{border:1.5px solid var(--line);background:#fff;border-radius:12px;font-size:20px;color:var(--muted);cursor:pointer}
  .kot .x:hover{color:var(--red);border-color:#fca5a5}
  .kot .prose p{margin:0 0 14px}
  .kot .add{border:0;background:none;color:var(--red-d);font:inherit;font-weight:700;cursor:pointer;padding:4px 0}
  .kot .prev{min-width:0;position:sticky;top:88px;background:var(--soft);border:1px solid var(--line);border-radius:20px;padding:18px}
  .kot .paper{margin:12px 0;display:flex;justify-content:center;overflow:hidden}
  .kot .paper iframe{max-width:100%;border:0;background:#fff;box-shadow:0 10px 30px -12px rgba(15,23,42,.35);border-radius:4px}
  .kot .pacts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .kot .pacts .btn{padding:12px 10px;font-size:15px}
  @media (max-width:860px){ .kot .prev{position:static} }
  @media (max-width:520px){
    .kot .fields{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
    .kot .ihead{display:none}
    .kot .irow{grid-template-columns:56px minmax(0,1fr) 40px}
    .kot .irow .inp:nth-child(3){grid-column:2 / 3}
    .kot .pacts{grid-template-columns:1fr}
  }
`;
