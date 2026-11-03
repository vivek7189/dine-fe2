'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import ToolCTA from '../../../components/ToolCTA';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { track } from '../../../lib/analytics';
import { GROUPS, PRESETS, FAQ } from './equipmentContent';

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const rs = (n) => `₹${nf.format(Math.round(n))}`;

// "₹4.2 lakh" reads better than "₹4,20,000" in the big total.
function lakh(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} lakh`;
  return rs(n);
}

const clone = (p) => p.items.map((it) => ({ ...it }));

export default function EquipmentListClient() {
  const [presetId, setPresetId] = useState('cafe');
  const [items, setItems] = useState(() => clone(PRESETS[0]));
  const [custom, setCustom] = useState({ name: '', low: '', high: '' });
  const [copied, setCopied] = useState(false);

  const preset = PRESETS.find((p) => p.id === presetId);

  const pick = (id) => {
    setPresetId(id);
    setItems(clone(PRESETS.find((p) => p.id === id)));
    track('tool_kitchen_preset', { preset: id });
  };
  const update = (id, patch) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => setItems((list) => list.filter((it) => it.id !== id));

  const addCustom = (e) => {
    e.preventDefault();
    const name = custom.name.trim();
    const low = Number(custom.low) || 0;
    const high = Math.max(Number(custom.high) || low, low);
    if (!name) return;
    setItems((list) => [...list, { id: `c${Date.now()}`, name, group: 'Other', qty: 1, low, high, note: '', on: true, custom: true }]);
    setCustom({ name: '', low: '', high: '' });
  };

  const totals = useMemo(() => {
    let low = 0; let high = 0; let count = 0;
    const byGroup = {};
    for (const it of items) {
      if (!it.on) continue;
      const q = Math.max(0, Number(it.qty) || 0);
      low += it.low * q; high += it.high * q; count += q;
      byGroup[it.group] = byGroup[it.group] || [0, 0];
      byGroup[it.group][0] += it.low * q; byGroup[it.group][1] += it.high * q;
    }
    return { low, high, count, byGroup };
  }, [items]);

  const groups = [...GROUPS, 'Other'].filter((g) => items.some((it) => it.group === g));

  const whatsappText = () => {
    const lines = [`Kitchen equipment list: ${preset.name}`, ''];
    for (const g of groups) {
      const rows = items.filter((it) => it.group === g && it.on && Number(it.qty) > 0);
      if (!rows.length) continue;
      lines.push(`*${g}*`);
      rows.forEach((it) => lines.push(`- ${it.name} × ${it.qty}  (${rs(it.low * it.qty)}–${rs(it.high * it.qty)})`));
      lines.push('');
    }
    lines.push(`Total: ${rs(totals.low)} – ${rs(totals.high)} (before GST)`);
    lines.push('Made with dineopen.com/tools/restaurant-kitchen-equipment-list');
    return lines.join('\n');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: nothing to do */ }
    track('tool_kitchen_copy', { preset: presetId });
  };
  const printList = () => {
    track('tool_kitchen_print', { preset: presetId });
    window.print();
  };

  return (
    <>
      <CommonHeader />
      <main className="tt kq">
        <div className="wrap">
          <nav className="crumb no-print" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Kitchen equipment list</nav>

          <div className="head">
            <h1>Restaurant Kitchen Equipment List with Price</h1>
            <p className="lede no-print">Pick your kind of food business. You get a full list of kitchen and counter equipment with typical Indian prices. Untick what you already have, change quantities, add your own items, then print it or send it on WhatsApp.</p>
            <p className="print-only">{preset.name} · prices are typical dealer ranges in India, before GST · dineopen.com</p>
          </div>

          <div className="types no-print" role="group" aria-label="Type of food business">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className={'chip' + (presetId === p.id ? ' on' : '')} aria-pressed={presetId === p.id} onClick={() => pick(p.id)}>{p.name}</button>
            ))}
          </div>
          <p className="blurb no-print">{preset.blurb}</p>

          <div className="app">
            <section className="card list" aria-label="Equipment list">
              {groups.map((g) => (
                <div key={g} className="grp">
                  <div className="gh">
                    <h2>{g}</h2>
                    {totals.byGroup[g] && <span>{rs(totals.byGroup[g][0])}–{rs(totals.byGroup[g][1])}</span>}
                  </div>
                  <ul>
                    {items.filter((it) => it.group === g).map((it) => (
                      <li key={it.id} className={it.on ? '' : 'off'}>
                        <label className="nm">
                          <input type="checkbox" checked={it.on} onChange={(e) => update(it.id, { on: e.target.checked })} />
                          <span>
                            {it.name}
                            <small>{rs(it.low)}–{rs(it.high)} each{it.note ? `. ${it.note}` : ''}</small>
                          </span>
                        </label>
                        <div className="qty">
                          <label className="sr" htmlFor={`q-${it.id}`}>Quantity of {it.name}</label>
                          <input id={`q-${it.id}`} className="inp" type="number" inputMode="numeric" min="0" max="99" value={it.qty}
                            onChange={(e) => update(it.id, { qty: e.target.value === '' ? '' : Math.min(99, Math.max(0, Math.round(Number(e.target.value) || 0))) })} />
                          {it.custom && <button type="button" className="x no-print" aria-label={`Remove ${it.name}`} onClick={() => remove(it.id)}>×</button>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <form className="add no-print" onSubmit={addCustom}>
                <div className="lbl"><span>Add your own item</span></div>
                <div className="addrow">
                  <input className="inp" placeholder="e.g. Shawarma machine" value={custom.name} onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))} aria-label="Item name" />
                  <input className="inp" type="number" inputMode="numeric" min="0" placeholder="₹ low" value={custom.low} onChange={(e) => setCustom((c) => ({ ...c, low: e.target.value }))} aria-label="Lowest price" />
                  <input className="inp" type="number" inputMode="numeric" min="0" placeholder="₹ high" value={custom.high} onChange={(e) => setCustom((c) => ({ ...c, high: e.target.value }))} aria-label="Highest price" />
                  <button type="submit" className="btn ghost">Add</button>
                </div>
              </form>
            </section>

            <aside className="res" id="kq-total" aria-live="polite">
              <div className="k">Estimated equipment cost</div>
              <div className="big">{lakh(totals.low)} – {lakh(totals.high)}</div>
              <div className="sub">{nf.format(totals.count)} pieces · before GST</div>
              <div className="grid">
                <div><span>Low estimate</span><b>{rs(totals.low)}</b></div>
                <div><span>High estimate</span><b>{rs(totals.high)}</b></div>
                <div><span>With 18% GST (low)</span><b>{rs(totals.low * 1.18)}</b></div>
                <div><span>With 18% GST (high)</span><b>{rs(totals.high * 1.18)}</b></div>
              </div>
              <div className="acts no-print">
                <button type="button" onClick={printList}>Download PDF / Print</button>
                <button type="button" onClick={copy}>{copied ? 'Copied ✓' : 'Copy for WhatsApp'}</button>
              </div>
              <p className="note">Prices are typical dealer ranges seen in India in late 2026. Check locally: steel items vary by city and by steel grade (304 costs more than 202). Delivery, gas piping and ducting are extra.</p>
            </aside>
          </div>

          <a className="mbar no-print" href="#kq-total" aria-label="See the total">
            <span>Total {totals.high >= 100000 ? `₹${(totals.low / 100000).toFixed(1)}–${(totals.high / 100000).toFixed(1)} lakh` : `${rs(totals.low)}–${rs(totals.high)}`}</span><small>before GST · see details</small>
          </a>

          <div className="no-print">
            <ToolCTA
              tool="restaurant-kitchen-equipment-list"
              title="Your billing setup is the cheapest line on this list"
              text="DineOpen runs on the tablet, phone or computer you already have and prints KOTs to any thermal printer. 7-day free trial, no card needed."
            />

            <section className="sec" id="guide">
              <h2>How to buy kitchen equipment without overspending</h2>
              <div className="prose">
                <h3>Buy new or used?</h3>
                <p>Plain steel items are safe to buy used: work tables, racks, sinks, gas ranges and tandoor bodies. There is no motor to fail, and a used table is often half the price of a new one. Look for welds that are not cracked and check that the steel is not rusting at the legs.</p>
                <p>Buy anything with a compressor or motor new, or at least with a warranty. That means fridges, freezers, ice machines, espresso machines and dough kneaders. A dead fridge on a Saturday costs you the stock inside it as well as the repair.</p>

                <h3>Gas or electric?</h3>
                <p>For Indian cooking on burners, commercial LPG is faster and usually cheaper to run. Electric is better for ovens, sandwich grills and small fryers, and in malls or food courts where gas is not allowed. Before you buy many electric items, ask an electrician about your sanctioned load. A bakery oven or a big espresso machine may need a three-phase connection.</p>

                <h3>A minimum list for a ₹10 lakh café</h3>
                <p>If your total budget for the café is around ₹10 lakh, keep equipment near ₹3–4 lakh so there is money left for interiors, deposit and the first two months of running costs. A workable starting list:</p>
                <ul>
                  <li>2-burner range, sandwich griller and a microwave</li>
                  <li>One under-counter fridge and one 300 L visi cooler</li>
                  <li>A commercial blender and a mixer grinder</li>
                  <li>One steel work table, one rack, a 2-bowl sink and an RO purifier</li>
                  <li>A tablet or old laptop with a thermal printer for billing</li>
                </ul>
                <p>Start with a good bean-to-cup or a small single-group machine if coffee is only part of the menu. Move to a 2-group espresso machine once you sell more than 80–100 coffees a day.</p>

                <h3>Get three quotes</h3>
                <p>Send the same list to three local fabricators or dealers. Ask each one to write the steel grade, size, GST and delivery on the quote. Prices for the same table can differ by 30% or more between shops in the same market.</p>
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
                <Link href="/tools/startup-cost-calculator"><b>Startup cost calculator</b><span>Add rent, interiors and licences to your budget.</span></Link>
                <Link href="/tools/food-business-profit-calculator"><b>Profit calculator</b><span>See what you keep each month once you open.</span></Link>
                <Link href="/tools/restaurant-pos-hardware"><b>POS hardware kit builder</b><span>Tablet, printer and cash drawer for your counter.</span></Link>
                <Link href="/blog/how-to-start-cafe-coffee-shop-india.html"><b>Start a café</b><span>Costs, licences and setup in India.</span></Link>
                <Link href="/blog/cloud-kitchen-guide-2026"><b>Cloud kitchen guide</b><span>Brands, apps and margins.</span></Link>
                <Link href="/blog/how-to-start-bakery-india.html"><b>Start a bakery</b><span>From home or a shop.</span></Link>
              </div>
            </section>

            <section className="owner">
              <div>
                <h2>Setting up a new place?</h2>
                <p>Billing, kitchen tickets, stock and staff in one place, on the phone or computer you already have.</p>
                <ul>
                  <li>7-day free trial</li>
                  <li>GST bills and KOT printing</li>
                  <li>Works on phone, tablet or computer</li>
                </ul>
              </div>
              <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=restaurant-kitchen-equipment-list"
                onClick={() => track('tool_cta_click', { tool: 'restaurant-kitchen-equipment-list', where: 'footer' })}>Try DineOpen free →</Link>
            </section>

            <p className="updated">Updated November 2026 · Prices are typical dealer asking prices, not quotes. Check with local dealers before you buy.</p>
          </div>
        </div>
      </main>
      <div className="kq-noprint"><InternalLinks currentPath="/tools/restaurant-kitchen-equipment-list" variant="tool" /></div>
      <div className="kq-noprint"><Footer /></div>
      <style jsx>{tipToolStyles}</style>
      <style jsx>{kqStyles}</style>
    </>
  );
}

const kqStyles = css.global`
  .kq .types{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 10px}
  .kq .types .chip{padding:10px 16px;font-size:14.5px;font-weight:700}
  .kq .blurb{text-align:center;color:var(--muted);font-size:14.5px;margin:0 0 20px}
  .kq .print-only{display:none}
  .kq .list{padding:8px 24px 24px}
  .kq .grp{padding-top:16px}
  .kq .gh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-bottom:1px solid var(--line);padding-bottom:8px}
  .kq .gh h2{margin:0;font-size:15px;font-weight:800;color:var(--ink);letter-spacing:.01em}
  .kq .gh span{font-size:13px;color:var(--muted);font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
  .kq .grp ul{list-style:none;margin:0;padding:0}
  .kq .grp li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9}
  .kq .grp li.off .nm span{color:#94a3b8;text-decoration:line-through}
  .kq .nm{display:flex;align-items:flex-start;gap:10px;min-width:0;cursor:pointer;font-size:15px;color:var(--ink);font-weight:600;line-height:1.4}
  .kq .nm input{width:19px;height:19px;margin-top:2px;flex-shrink:0;accent-color:var(--red)}
  .kq .nm small{display:block;font-weight:500;color:var(--muted);font-size:12.5px;margin-top:2px;text-decoration:none}
  .kq .qty{display:flex;align-items:center;gap:6px;flex-shrink:0}
  .kq .qty .inp{width:62px;padding:8px 8px;text-align:center;font-weight:700}
  .kq .x{border:0;background:#f1f5f9;border-radius:50%;width:28px;height:28px;font-size:18px;line-height:1;color:var(--body);cursor:pointer}
  .kq .add{margin-top:22px}
  .kq .addrow{display:grid;grid-template-columns:minmax(0,1fr) 96px 96px auto;gap:8px}
  .kq .addrow .btn{min-height:46px;padding:10px 18px}
  .kq .res .big{font-size:clamp(30px,4vw,40px)}
  .kq .mbar{display:none}
  @media (max-width:860px){
    .kq .mbar{position:sticky;bottom:12px;z-index:5;display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 8px;margin:12px 76px 0 0;padding:12px 16px;border-radius:14px;background:var(--ink);color:#fff;text-decoration:none;font-weight:800;font-size:15.5px;box-shadow:0 10px 30px -12px rgba(15,23,42,.6)}
    .kq .mbar span{white-space:nowrap}
    .kq .mbar small{color:#94a3b8;font-weight:600;font-size:12.5px}
    .kq .res{scroll-margin-top:80px}
  }
  @media (max-width:520px){
    .kq .types{justify-content:flex-start}
    .kq .types .chip{padding:9px 12px;font-size:14px}
    .kq .blurb{text-align:left}
    .kq .list{padding:4px 16px 18px}
    .kq .addrow{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
    .kq .addrow input:first-child{grid-column:1 / -1}
    .kq .addrow .btn{grid-column:1 / -1}
  }
  @media print{
    .kq .no-print,.kq-noprint,button.fixed{display:none!important}
    .kq .head{display:block!important}
    .kq .qty .inp{border:0;padding:0;width:auto}
    .kq .print-only{display:block;color:#000;margin-top:6px}
    .kq .head{padding:0 0 12px}
    .kq h1{font-size:24px}
    .kq .app{display:block}
    .kq .card{border:0;box-shadow:none;padding:0}
    .kq .grp li.off{display:none}
    .kq .res{margin-top:16px}
    .kq .res .grid div{background:#fff;color:#000}
    .kq .res .k,.kq .res .sub,.kq .res .note,.kq .res .grid span{color:#333}
  }
`;
