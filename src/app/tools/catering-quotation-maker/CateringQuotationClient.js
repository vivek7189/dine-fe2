'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import ToolCTA from '../../../components/ToolCTA';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { track } from '../../../lib/analytics';
import { SAMPLE, GST_OPTIONS, FAQ } from './quotationContent';

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const rs = (n) => `₹${nf.format(Math.round((Number(n) || 0) * 100) / 100)}`;
const num = (v) => Number(v) || 0;
const fmtDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const isoIn = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

const BLANK = {
  biz: { name: '', address: '', phone: '', email: '', gstin: '' },
  client: { name: '', phone: '' },
  event: { type: '', date: '', venue: '', guests: 100, time: '' },
  menu: SAMPLE.menu.map((m) => ({ title: m.title, items: '' })),
  plateRate: 0,
  items: [{ name: '', qty: 1, rate: 0 }],
  extras: SAMPLE.extras.map((x) => ({ name: x.name.replace(/\s*\(.*\)$/, ''), amount: 0 })),
  discount: 0, gstRate: 5, advancePct: 50, validityDays: 15, terms: '', notes: '',
};

export default function CateringQuotationClient() {
  const [f, setF] = useState(() => structuredClone(SAMPLE));
  const [mode, setMode] = useState('plate');
  const [logo, setLogo] = useState(null);
  const [quoteNo, setQuoteNo] = useState('Q-0001');
  const [quoteDate, setQuoteDate] = useState('');
  const [busy, setBusy] = useState(false);
  const previewRef = useRef(null);

  // Date-based values only on the client, so the static HTML and the first render match.
  useEffect(() => {
    setQuoteNo(`Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
    setQuoteDate(new Date().toISOString().slice(0, 10));
    setF((v) => (v.event.date ? v : { ...v, event: { ...v.event, date: isoIn(30) } }));
  }, []);

  const set = (path) => (e) => {
    const val = e.target.value;
    setF((v) => {
      const n = structuredClone(v);
      const keys = path.split('.');
      let o = n;
      keys.slice(0, -1).forEach((k) => { o = o[k]; });
      o[keys[keys.length - 1]] = val;
      return n;
    });
  };
  const setRow = (list, i, k) => (e) => {
    const val = e.target.value;
    setF((v) => ({ ...v, [list]: v[list].map((r, j) => (j === i ? { ...r, [k]: val } : r)) }));
  };
  const addRow = (list, row) => setF((v) => ({ ...v, [list]: [...v[list], row] }));
  const delRow = (list, i) => setF((v) => ({ ...v, [list]: v[list].filter((_, j) => j !== i) }));

  const q = useMemo(() => {
    const guests = num(f.event.guests);
    const lines = mode === 'plate'
      ? [{ name: 'Food as per menu (per plate)', qty: guests, rate: num(f.plateRate), amount: guests * num(f.plateRate) }]
      : f.items.filter((r) => r.name.trim()).map((r) => ({ name: r.name, qty: num(r.qty), rate: num(r.rate), amount: num(r.qty) * num(r.rate) }));
    const extras = f.extras.filter((x) => x.name.trim() && num(x.amount) > 0).map((x) => ({ name: x.name, amount: num(x.amount) }));
    const food = lines.reduce((a, l) => a + l.amount, 0);
    const subtotal = food + extras.reduce((a, x) => a + x.amount, 0);
    const discount = Math.min(num(f.discount), subtotal);
    const gstRate = num(f.gstRate);
    const gst = (subtotal - discount) * gstRate / 100;
    const total = subtotal - discount + gst;
    const advancePct = num(f.advancePct);
    const advance = total * advancePct / 100;
    const validUntil = quoteDate ? (() => { const d = new Date(quoteDate + 'T00:00:00'); d.setDate(d.getDate() + num(f.validityDays)); return d.toISOString().slice(0, 10); })() : '';
    return {
      biz: f.biz, client: f.client, event: { ...f.event, guests },
      menu: f.menu.map((m) => ({ title: m.title, list: m.items.split('\n').map((x) => x.trim()).filter(Boolean) })).filter((m) => m.list.length),
      lines, extras, gstRate, advancePct,
      totals: { subtotal, discount, gst, total, advance },
      perPlate: guests > 0 ? total / guests : 0,
      terms: f.terms.split('\n').map((x) => x.trim()).filter(Boolean),
      notes: f.notes.trim(), logo, quoteNo,
      quoteDate: fmtDate(quoteDate), eventDate: fmtDate(f.event.date), validUntil: fmtDate(validUntil),
    };
  }, [f, mode, logo, quoteNo, quoteDate]);

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2 MB'); return; }
    const r = new FileReader();
    r.onload = (ev) => setLogo(ev.target.result);
    r.readAsDataURL(file);
  };

  const fileBase = `${(f.biz.name || 'Catering').replace(/[^\w]+/g, '-')}-${quoteNo}`;
  const docHtml = () => `<html><head><meta charset="utf-8"><title>Quotation ${quoteNo}</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;margin:0;padding:28px}table{border-collapse:collapse;width:100%}@media print{body{padding:0}}</style></head><body>${previewRef.current ? previewRef.current.innerHTML : ''}</body></html>`;

  const onPrint = () => {
    track('catering_quote_export', { kind: 'print' });
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(docHtml());
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const onWord = () => {
    track('catering_quote_export', { kind: 'word' });
    const blob = new Blob(['﻿', docHtml()], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileBase}.doc`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const onPdf = async () => {
    setBusy(true);
    track('catering_quote_export', { kind: 'pdf' });
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { QuotationPDFDoc } = await import('./QuotationPDF');
      const blob = await pdf(<QuotationPDFDoc q={q} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${fileBase}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not make the PDF. Please use Print and choose "Save as PDF".');
    } finally {
      setBusy(false);
    }
  };

  const onWhatsApp = () => {
    track('catering_quote_export', { kind: 'whatsapp' });
    const t = q.totals;
    const msg = [
      `*Catering quotation ${quoteNo}* from ${f.biz.name || 'us'}`,
      `${q.event.type || 'Event'}${q.eventDate ? `, ${q.eventDate}` : ''}${q.event.venue ? ` at ${q.event.venue}` : ''}`,
      `Guests: ${q.event.guests}`,
      '',
      ...q.lines.map((l) => `${l.name}: ${rs(l.amount)}`),
      ...q.extras.map((x) => `${x.name}: ${rs(x.amount)}`),
      t.discount > 0 ? `Discount: -${rs(t.discount)}` : '',
      q.gstRate > 0 ? `GST ${q.gstRate}%: ${rs(t.gst)}` : '',
      `*Total: ${rs(t.total)}* (about ${rs(Math.round(q.perPlate))} per guest)`,
      q.advancePct > 0 ? `Advance to confirm: ${rs(t.advance)} (${q.advancePct}%)` : '',
      q.validUntil ? `Valid till ${q.validUntil}` : '',
      '',
      'Full quotation with menu and terms attached.',
    ].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const reset = (sample) => {
    setF(sample ? { ...structuredClone(SAMPLE), event: { ...SAMPLE.event, date: isoIn(30) } } : structuredClone(BLANK));
    setMode('plate');
    if (!sample) setLogo(null);
    track('catering_quote_reset', { sample });
  };

  const gstHint = GST_OPTIONS.find(([r]) => r === num(f.gstRate))?.[2];

  return (
    <>
      <CommonHeader />
      <main className="tt cq">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Catering quotation maker</nav>

          <header className="head">
            <h1>Catering Quotation Maker</h1>
            <p className="lede">Fill in the menu, the rate and the extras. The quotation on the right updates as you type. Download it as PDF or Word, print it, or send the summary on WhatsApp. We have filled in a sample sangeet so you can see how it looks.</p>
            <div className="starts no-print">
              <button type="button" className="btn ghost sm" onClick={() => reset(false)}>Start blank</button>
              <button type="button" className="btn ghost sm" onClick={() => reset(true)}>Load the sample again</button>
            </div>
          </header>

          <div className="app">
            <section className="card form no-print" aria-label="Quotation details">
              <fieldset>
                <legend>Your business</legend>
                <div className="g2">
                  <label className="f"><span>Business name</span><input className="inp" value={f.biz.name} onChange={set('biz.name')} placeholder="e.g. Shree Caterers" /></label>
                  <label className="f"><span>Phone</span><input className="inp" value={f.biz.phone} onChange={set('biz.phone')} inputMode="tel" /></label>
                  <label className="f full"><span>Address</span><input className="inp" value={f.biz.address} onChange={set('biz.address')} /></label>
                  <label className="f"><span>Email</span><input className="inp" value={f.biz.email} onChange={set('biz.email')} inputMode="email" /></label>
                  <label className="f"><span>GSTIN <small>optional</small></span><input className="inp" value={f.biz.gstin} onChange={set('biz.gstin')} /></label>
                  <div className="f full logo">
                    <span>Logo <small>optional, under 2 MB</small></span>
                    <div className="logorow">
                      {logo && <img src={logo} alt="Your logo" />}
                      <label className="btn ghost sm">{logo ? 'Change logo' : 'Upload logo'}<input type="file" accept="image/*" onChange={onLogo} className="sr" /></label>
                      {logo && <button type="button" className="link" onClick={() => setLogo(null)}>Remove</button>}
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Client and event</legend>
                <div className="g2">
                  <label className="f"><span>Client name</span><input className="inp" value={f.client.name} onChange={set('client.name')} /></label>
                  <label className="f"><span>Client phone</span><input className="inp" value={f.client.phone} onChange={set('client.phone')} inputMode="tel" /></label>
                  <label className="f"><span>Event</span><input className="inp" value={f.event.type} onChange={set('event.type')} placeholder="Wedding, birthday, office lunch…" /></label>
                  <label className="f"><span>Guests</span><input className="inp" type="number" min="0" inputMode="numeric" value={f.event.guests} onChange={set('event.guests')} /></label>
                  <label className="f"><span>Date</span><input className="inp" type="date" value={f.event.date} onChange={set('event.date')} /></label>
                  <label className="f"><span>Time</span><input className="inp" value={f.event.time} onChange={set('event.time')} placeholder="7 pm to 11 pm" /></label>
                  <label className="f full"><span>Venue</span><input className="inp" value={f.event.venue} onChange={set('event.venue')} /></label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Menu <small>one dish per line</small></legend>
                <div className="g2">
                  {f.menu.map((m, i) => (
                    <div key={i} className="f">
                      <input className="inp title" value={m.title} onChange={setRow('menu', i, 'title')} aria-label="Section name" />
                      <textarea className="inp" rows={5} value={m.items} onChange={setRow('menu', i, 'items')} aria-label={`${m.title} dishes`} />
                    </div>
                  ))}
                </div>
                <button type="button" className="link" onClick={() => addRow('menu', { title: 'Live counter', items: '' })}>+ Add a menu section</button>
              </fieldset>

              <fieldset>
                <legend>Price</legend>
                <div className="seg" role="group" aria-label="How to price">
                  <button type="button" className={mode === 'plate' ? 'on' : ''} aria-pressed={mode === 'plate'} onClick={() => setMode('plate')}>Per plate</button>
                  <button type="button" className={mode === 'items' ? 'on' : ''} aria-pressed={mode === 'items'} onClick={() => setMode('items')}>Item by item</button>
                </div>
                {mode === 'plate' ? (
                  <div className="g2" style={{ marginTop: 14 }}>
                    <label className="f"><span>Rate per plate (₹)</span><input className="inp" type="number" min="0" inputMode="decimal" value={f.plateRate} onChange={set('plateRate')} /></label>
                    <div className="f calc"><span>Food total</span><b>{num(f.event.guests)} × {rs(f.plateRate)} = {rs(num(f.event.guests) * num(f.plateRate))}</b></div>
                  </div>
                ) : (
                  <div className="rows" style={{ marginTop: 14 }}>
                    <div className="rowh"><span>Item</span><span>Qty</span><span>Rate (₹)</span><span /></div>
                    {f.items.map((r, i) => (
                      <div key={i} className="row">
                        <input className="inp" value={r.name} onChange={setRow('items', i, 'name')} aria-label="Item" />
                        <input className="inp" type="number" min="0" inputMode="decimal" value={r.qty} onChange={setRow('items', i, 'qty')} aria-label="Quantity" />
                        <input className="inp" type="number" min="0" inputMode="decimal" value={r.rate} onChange={setRow('items', i, 'rate')} aria-label="Rate" />
                        <button type="button" className="x" onClick={() => delRow('items', i)} aria-label="Remove item">×</button>
                      </div>
                    ))}
                    <button type="button" className="link" onClick={() => addRow('items', { name: '', qty: 1, rate: 0 })}>+ Add item</button>
                  </div>
                )}
                <p className="hint">Not sure what to charge per plate? Use the <Link href="/tools/catering-calculator">catering price calculator</Link> first.</p>
              </fieldset>

              <fieldset>
                <legend>Extras <small>leave ₹0 to hide a line</small></legend>
                <div className="rows">
                  {f.extras.map((x, i) => (
                    <div key={i} className="row ex">
                      <input className="inp" value={x.name} onChange={setRow('extras', i, 'name')} aria-label="Extra" />
                      <input className="inp" type="number" min="0" inputMode="decimal" value={x.amount} onChange={setRow('extras', i, 'amount')} aria-label="Amount in rupees" />
                      <button type="button" className="x" onClick={() => delRow('extras', i)} aria-label="Remove extra">×</button>
                    </div>
                  ))}
                  <button type="button" className="link" onClick={() => addRow('extras', { name: '', amount: 0 })}>+ Add extra</button>
                </div>
              </fieldset>

              <fieldset>
                <legend>GST, discount and payment</legend>
                <div className="seg" role="group" aria-label="GST rate">
                  {GST_OPTIONS.map(([r, label]) => (
                    <button key={r} type="button" className={num(f.gstRate) === r ? 'on' : ''} aria-pressed={num(f.gstRate) === r} onClick={() => setF((v) => ({ ...v, gstRate: r }))}>{label}</button>
                  ))}
                </div>
                {gstHint && <p className="hint">{gstHint} Check with your CA if you are unsure.</p>}
                <div className="g2" style={{ marginTop: 14 }}>
                  <label className="f"><span>Discount (₹)</span><input className="inp" type="number" min="0" inputMode="decimal" value={f.discount} onChange={set('discount')} /></label>
                  <label className="f"><span>Advance to confirm (%)</span><input className="inp" type="number" min="0" max="100" inputMode="numeric" value={f.advancePct} onChange={set('advancePct')} /></label>
                  <label className="f"><span>Quote valid for (days)</span><input className="inp" type="number" min="1" inputMode="numeric" value={f.validityDays} onChange={set('validityDays')} /></label>
                  <label className="f"><span>Quotation no.</span><input className="inp" value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} /></label>
                  <label className="f full"><span>Terms <small>one per line</small></span><textarea className="inp" rows={5} value={f.terms} onChange={set('terms')} /></label>
                  <label className="f full"><span>Notes for the client</span><textarea className="inp" rows={2} value={f.notes} onChange={set('notes')} /></label>
                </div>
              </fieldset>
            </section>

            <aside className="pv" aria-label="Quotation preview">
              <div className="acts no-print">
                <button type="button" className="btn" onClick={onPdf} disabled={busy}>{busy ? 'Making PDF…' : 'Download PDF'}</button>
                <button type="button" className="btn ghost" onClick={onWord}>Download Word</button>
                <button type="button" className="btn ghost" onClick={onPrint}>Print</button>
                <button type="button" className="btn ghost wa" onClick={onWhatsApp}>Send on WhatsApp</button>
              </div>
              <div className="paper">
                <Preview q={q} innerRef={previewRef} />
              </div>
              <p className="hint">About {rs(Math.round(q.perPlate))} per guest, all included. Nothing you type is saved on our servers.</p>
            </aside>
          </div>

          <ToolCTA
            tool="catering-quotation-maker"
            title="Running a kitchen or café as well?"
            text="DineOpen does GST billing, kitchen tickets, stock and staff for food businesses, on the phone or computer you already have. 7-day free trial."
          />

          <section className="sec" id="guide">
            <h2>How to write a catering quotation clients say yes to</h2>
            <div className="prose">
              <h3>Price the plate from your food cost</h3>
              <p>Start with what one plate costs you: every dish at the portion you serve, plus gas, disposables and a little extra for wastage. Most caterers keep food at 30–40% of the plate rate. So if a veg plate costs you ₹220 to make, ₹550–700 is a normal rate. Non-veg and live counters push the food cost up, so price them higher rather than squeezing your margin.</p>
              <p>For a quick check of your numbers, the <Link href="/tools/catering-calculator">catering price calculator</Link> works out a per-person price from the menu and service style.</p>
              <h3>Show extras as separate lines</h3>
              <p>Waiters, live counters, crockery, transport and decoration are real costs. Showing them as their own lines makes your quote easy to compare, and the client can see why a cheaper quote from someone else may leave out staff or crockery. If the client wants one simple number, fold them into the plate rate and say so in the notes.</p>
              <h3>Terms that save arguments later</h3>
              <ul>
                <li>When the final guest count is due (2–3 days before is common), and that you bill for the higher of the confirmed or actual count.</li>
                <li>The rate for extra plates on the day.</li>
                <li>Who arranges gas, water, electricity and space for cooking at the venue.</li>
                <li>Service hours, and the charge for each extra hour.</li>
                <li>What happens to the advance if the event is cancelled or moved.</li>
              </ul>
              <h3>Advance and payment</h3>
              <p>Most caterers take 25–50% to confirm the date. That pays for stock and holds your team for the day. The balance usually comes in one or two parts, for example 40% a week before and the rest on the event day. Put the plan in the quotation, and send it the same day the client asks. A quick, clear quote often wins over a cheaper slow one.</p>
            </div>
          </section>

          <section className="sec" id="faq">
            <h2>Questions caterers ask</h2>
            <div className="faq">
              {FAQ.map(([qq, a], i) => (
                <details key={qq} open={i === 0}><summary><h3>{qq}</h3></summary><p>{a}</p></details>
              ))}
            </div>
          </section>

          <section className="sec">
            <h2>More for caterers</h2>
            <div className="related">
              <Link href="/tools/catering-calculator"><b>Catering price calculator</b><span>Per-person price from menu and service style.</span></Link>
              <Link href="/tools/restaurant-invoice-generator"><b>Bill generator</b><span>Make the final GST bill after the event.</span></Link>
              <Link href="/tools/food-cost-calculator"><b>Food cost calculator</b><span>Cost each dish before you quote.</span></Link>
              <Link href="/hi/blog/catering-business-kaise-shuru-kare"><b>Catering business (Hindi)</b><span>Catering business kaise shuru karein.</span></Link>
              <Link href="/tools/fssai-fee-calculator"><b>FSSAI fee calculator</b><span>Which food licence you need and its fee.</span></Link>
              <Link href="/tools/menu-card-maker"><b>Menu card maker</b><span>A printable menu for your counters.</span></Link>
            </div>
          </section>

          <p className="updated">Updated November 2026 · The sample uses typical rates for a veg event in a big Indian city. GST rules can change; confirm your rate with your CA.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/catering-quotation-maker" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{cqStyles}</style>
    </>
  );
}

// Inline styles on purpose: Print and Download Word copy this HTML into a new document.
function Preview({ q, innerRef }) {
  const t = q.totals;
  const c = { muted: '#6b7280', ink: '#111827', line: '#e5e7eb', brand: '#b45309', soft: '#fffbeb' };
  const th = { textAlign: 'left', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.04em', padding: '6px 4px', borderBottom: `1.5px solid ${c.line}` };
  const td = { fontSize: '13px', padding: '7px 4px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' };
  const r = { textAlign: 'right', whiteSpace: 'nowrap' };
  const row = (label, val, style = {}) => (
    <tr><td style={{ padding: '3px 0', fontSize: '13px', ...style }}>{label}</td><td style={{ padding: '3px 0', fontSize: '13px', textAlign: 'right', whiteSpace: 'nowrap', ...style }}>{val}</td></tr>
  );
  return (
    <div ref={innerRef} style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#1f2937', lineHeight: 1.45 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: `3px solid ${c.brand}` }}>
        <tbody><tr>
          {q.logo && <td style={{ width: '64px', paddingBottom: '12px', verticalAlign: 'top' }}><img src={q.logo} alt="" style={{ width: '56px', height: '56px', objectFit: 'contain' }} /></td>}
          <td style={{ paddingBottom: '12px', verticalAlign: 'top' }}>
            <div style={{ fontSize: '19px', fontWeight: 800, color: c.ink }}>{q.biz.name || 'Your business name'}</div>
            {q.biz.address && <div style={{ fontSize: '12px', color: c.muted }}>{q.biz.address}</div>}
            <div style={{ fontSize: '12px', color: c.muted }}>{[q.biz.phone, q.biz.email].filter(Boolean).join(' · ')}</div>
            {q.biz.gstin && <div style={{ fontSize: '12px', color: c.muted }}>GSTIN: {q.biz.gstin}</div>}
          </td>
          <td style={{ paddingBottom: '12px', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: c.brand, letterSpacing: '.05em' }}>QUOTATION</div>
            <div style={{ fontSize: '12px', color: c.muted }}>{q.quoteNo}</div>
            {q.quoteDate && <div style={{ fontSize: '12px', color: c.muted }}>Date: {q.quoteDate}</div>}
            {q.validUntil && <div style={{ fontSize: '12px', color: c.muted }}>Valid till: {q.validUntil}</div>}
          </td>
        </tr></tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: c.soft, marginTop: '14px' }}>
        <tbody><tr>
          <td style={{ padding: '10px 12px', verticalAlign: 'top', width: '50%' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Prepared for</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: c.ink }}>{q.client.name || '—'}</div>
            {q.client.phone && <div style={{ fontSize: '12px' }}>{q.client.phone}</div>}
          </td>
          <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Event</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: c.ink }}>{q.event.type || 'Event'}{q.event.guests ? ` · ${q.event.guests} guests` : ''}</div>
            {(q.eventDate || q.event.time) && <div style={{ fontSize: '12px' }}>{[q.eventDate, q.event.time].filter(Boolean).join(', ')}</div>}
            {q.event.venue && <div style={{ fontSize: '12px' }}>{q.event.venue}</div>}
          </td>
        </tr></tbody>
      </table>

      {q.menu.length > 0 && (
        <>
          <div style={{ fontSize: '14px', fontWeight: 800, color: c.ink, margin: '16px 0 6px' }}>Menu</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Array.from({ length: Math.ceil(q.menu.length / 2) }, (_, i) => (
                <tr key={i}>
                  {q.menu.slice(i * 2, i * 2 + 2).map((m) => (
                    <td key={m.title} style={{ width: '50%', verticalAlign: 'top', padding: '0 10px 10px 0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '3px' }}>{m.title}</div>
                      {m.list.map((it) => <div key={it} style={{ fontSize: '12.5px' }}>• {it}</div>)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div style={{ fontSize: '14px', fontWeight: 800, color: c.ink, margin: '12px 0 4px' }}>Charges</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Description</th><th style={{ ...th, ...r }}>Qty</th><th style={{ ...th, ...r }}>Rate</th><th style={{ ...th, ...r }}>Amount</th></tr></thead>
        <tbody>
          {q.lines.map((l, i) => (
            <tr key={i}><td style={{ ...td, fontWeight: 700 }}>{l.name}</td><td style={{ ...td, ...r }}>{nf.format(l.qty)}</td><td style={{ ...td, ...r }}>{rs(l.rate)}</td><td style={{ ...td, ...r, fontWeight: 700 }}>{rs(l.amount)}</td></tr>
          ))}
          {q.extras.map((x, i) => (
            <tr key={`x${i}`}><td style={td}>{x.name}</td><td style={td} /><td style={td} /><td style={{ ...td, ...r, fontWeight: 700 }}>{rs(x.amount)}</td></tr>
          ))}
        </tbody>
      </table>

      <table style={{ width: '62%', minWidth: '230px', marginLeft: 'auto', marginTop: '10px', borderCollapse: 'collapse' }}>
        <tbody>
          {row('Subtotal', rs(t.subtotal))}
          {t.discount > 0 && row('Discount', `− ${rs(t.discount)}`, { color: '#dc2626' })}
          {q.gstRate > 0 && row(`CGST (${q.gstRate / 2}%)`, rs(t.gst / 2), { color: c.muted })}
          {q.gstRate > 0 && row(`SGST (${q.gstRate / 2}%)`, rs(t.gst / 2), { color: c.muted })}
          <tr><td style={{ padding: '8px 10px', fontSize: '16px', fontWeight: 800, background: c.soft, borderTop: '1px solid #fde68a', borderBottom: '1px solid #fde68a' }}>Total</td><td style={{ padding: '8px 10px', fontSize: '16px', fontWeight: 800, background: c.soft, textAlign: 'right', whiteSpace: 'nowrap', borderTop: '1px solid #fde68a', borderBottom: '1px solid #fde68a' }}>{rs(t.total)}</td></tr>
          {q.advancePct > 0 && row(`Advance to confirm (${q.advancePct}%)`, rs(t.advance), { fontWeight: 700, paddingTop: '8px' })}
          {q.advancePct > 0 && row('Balance', rs(t.total - t.advance), { color: c.muted })}
        </tbody>
      </table>

      {q.terms.length > 0 && (
        <>
          <div style={{ fontSize: '14px', fontWeight: 800, color: c.ink, margin: '16px 0 4px' }}>Terms</div>
          <ol style={{ margin: 0, paddingLeft: '18px', listStyle: 'decimal' }}>{q.terms.map((x, i) => <li key={i} style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>{x}</li>)}</ol>
        </>
      )}
      {q.notes && (
        <>
          <div style={{ fontSize: '14px', fontWeight: 800, color: c.ink, margin: '14px 0 4px' }}>Notes</div>
          <div style={{ fontSize: '12px', color: '#4b5563' }}>{q.notes}</div>
        </>
      )}

      <table style={{ width: '100%', marginTop: '34px', borderCollapse: 'collapse' }}>
        <tbody><tr>
          <td style={{ width: '50%', paddingRight: '20px' }}><div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', fontSize: '11px', color: c.muted, textAlign: 'center' }}>Client signature</div></td>
          <td style={{ width: '50%', paddingLeft: '20px' }}><div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', fontSize: '11px', color: c.muted, textAlign: 'center' }}>For {q.biz.name || 'the caterer'}</div></td>
        </tr></tbody>
      </table>
    </div>
  );
}

const cqStyles = css.global`
  .cq .starts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px}
  .cq .btn.sm{padding:9px 14px;min-height:40px;font-size:14px}
  .cq .app{grid-template-columns:minmax(0,1fr) minmax(0,1.05fr)}
  .cq fieldset{border:0;margin:0;padding:0;min-width:0}
  .cq fieldset+fieldset{margin-top:26px;padding-top:22px;border-top:1px solid var(--line)}
  .cq legend{font-size:17px;font-weight:800;color:var(--ink);margin-bottom:12px;padding:0}
  .cq legend small,.cq .f small{font-weight:500;color:var(--muted);font-size:12.5px;margin-left:6px}
  .cq .g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .cq .f{display:flex;flex-direction:column;gap:6px;min-width:0}
  .cq .f.full{grid-column:1/-1}
  .cq .f>span{font-size:13px;font-weight:700;color:var(--ink)}
  .cq .inp{font-size:15px;padding:10px 12px;min-width:0}
  .cq textarea.inp{resize:vertical;line-height:1.5;font-size:14px}
  .cq .inp.title{font-weight:800;font-size:14px;background:var(--soft)}
  .cq .calc b{font-size:15px;color:var(--ink);padding:11px 0;font-variant-numeric:tabular-nums}
  .cq .logorow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .cq .logorow img{width:44px;height:44px;object-fit:contain;border:1px solid var(--line);border-radius:8px}
  .cq .link{border:0;background:none;color:var(--red-d);font:inherit;font-weight:700;font-size:14px;cursor:pointer;padding:8px 0;text-align:left}
  .cq .rows{display:flex;flex-direction:column;gap:8px}
  .cq .rowh,.cq .row{display:grid;grid-template-columns:minmax(0,1fr) 70px 96px 34px;gap:8px;align-items:center}
  .cq .row.ex{grid-template-columns:minmax(0,1fr) 110px 34px}
  .cq .rowh span{font-size:12px;font-weight:700;color:var(--muted)}
  .cq .x{width:34px;height:40px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--muted);font-size:18px;cursor:pointer}
  .cq .x:hover{color:var(--red);border-color:#fca5a5}
  .cq .hint a{color:var(--red-d);font-weight:700}
  .cq .pv{position:sticky;top:88px;min-width:0}
  .cq .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
  .cq .acts .btn{padding:12px 10px;font-size:14.5px;min-height:46px}
  .cq .acts .btn:disabled{opacity:.7;cursor:wait}
  .cq .acts .wa{color:#15803d}
  .cq .paper{background:#fff;border:1px solid var(--line);border-radius:14px;padding:26px;box-shadow:0 12px 32px -20px rgba(15,23,42,.35);overflow-x:auto}
  .cq .prose ul{padding-left:20px;list-style:disc}
  .cq .prose a{color:var(--red-d);font-weight:700}
  @media (max-width:860px){
    .cq .app{grid-template-columns:minmax(0,1fr)}
    .cq .pv{position:static}
  }
  @media (max-width:520px){
    .cq .g2{grid-template-columns:minmax(0,1fr)}
    .cq .paper{padding:14px}
    .cq .rowh,.cq .row{grid-template-columns:minmax(0,1fr) 54px 76px 32px;gap:6px}
    .cq .row.ex{grid-template-columns:minmax(0,1fr) 92px 32px}
    .cq .acts .btn{font-size:13.5px}
  }
`;
