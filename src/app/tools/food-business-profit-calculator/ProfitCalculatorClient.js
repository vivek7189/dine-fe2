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
import { FORMATS, FIELDS, calc, BENCHMARKS, FAQ } from './profitContent';

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const rs = (n) => `${n < 0 ? '−' : ''}₹${nf.format(Math.round(Math.abs(n)))}`;

// "₹1.2 lakh" reads better than "₹1,20,000" in a sentence.
function spoken(n) {
  const a = Math.abs(n);
  if (a >= 10000000) return `₹${(a / 10000000).toFixed(1)} crore`;
  if (a >= 100000) return `₹${(a / 100000).toFixed(1)} lakh`;
  return `₹${nf.format(Math.round(a / 100) * 100)}`;
}

function toStrings(v) {
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x)]));
}

export default function ProfitCalculatorClient() {
  const [formatId, setFormatId] = useState('cafe');
  const [vals, setVals] = useState(() => toStrings(FORMATS[0].v));

  const fmt = FORMATS.find((f) => f.id === formatId);
  const r = useMemo(() => calc(vals), [vals]);

  const pick = (id) => {
    const f = FORMATS.find((x) => x.id === id);
    setFormatId(id);
    setVals(toStrings(f.v));
    track('tool_profit_format', { format: id });
  };
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  const [lo, hi] = fmt.bench;
  const perDay = Number(vals.ordersPerDay) || 0;
  let verdict = '';
  if (r.revenue <= 0) verdict = '';
  else if (r.profit <= 0) verdict = `At ${nf.format(perDay)} ${fmt.unit} a day you lose about ${spoken(r.profit)} a month. Costs are higher than sales, so start with food cost, rent and staff.`;
  else {
    verdict = `At ${nf.format(perDay)} ${fmt.unit} a day you keep about ${spoken(r.profit)} a month, a ${r.margin.toFixed(1)}% margin. ${fmt.benchText}`;
    if (r.margin < lo) verdict += ' You are below that range. Food cost, rent and app commission are the usual places to look.';
    else if (r.margin > hi) verdict += ' You are above that range, so check that every cost is in, including your own salary.';
    else verdict += ' Your numbers sit inside that range.';
  }

  const months = r.payback;
  const paybackText = months == null ? 'Not at this profit' : months < 1 ? 'Under a month' : `${months < 10 ? months.toFixed(1) : Math.round(months)} months`;

  return (
    <>
      <CommonHeader />
      <main className="tt pc">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Food business profit calculator</nav>

          <header className="head">
            <h1>Food Business Profit Calculator</h1>
            <p className="lede">Pick your kind of food business. We fill in typical Indian numbers, and you change anything that doesn’t match yours. You’ll see what you keep each month and how long it takes to earn back what you spent to open.</p>
          </header>

          <div className="types" role="group" aria-label="Type of food business">
            {FORMATS.map((f) => (
              <button key={f.id} type="button" className={'chip' + (formatId === f.id ? ' on' : '')} aria-pressed={formatId === f.id} onClick={() => pick(f.id)}>{f.name}</button>
            ))}
          </div>

          <div className="app">
            <section className="card" aria-label="Your numbers">
              <div className="fields">
                {FIELDS.map(([k, label, hint, kind]) => (
                  <div key={k} className="fld">
                    <label className="lbl" htmlFor={`pc-${k}`}><span>{label}</span></label>
                    <div className={'inwrap ' + kind}>
                      {kind === 'rs' && <span className="pre">₹</span>}
                      <input id={`pc-${k}`} className="inp" type="number" inputMode="decimal" min="0" step={kind === 'pct' ? '0.5' : '1'} value={vals[k]} onChange={set(k)} />
                      {kind === 'pct' && <span className="post">%</span>}
                    </div>
                    {hint && <p className="hint">{hint}</p>}
                  </div>
                ))}
              </div>
              <p className="hint" style={{ marginTop: 18 }}>Starting numbers are typical for a {fmt.noun} in India. {fmt.setupText}</p>
            </section>

            <aside className="res" aria-live="polite">
              <div className="k">Monthly profit</div>
              <div className="big" style={{ color: r.profit < 0 ? '#fca5a5' : '#fff' }}>{rs(r.profit)}</div>
              <div className="sub">{r.revenue > 0 ? `${r.margin.toFixed(1)}% net margin · usual range ${lo}–${hi}%` : 'Enter orders and average bill'}</div>

              <div className="grid">
                <div><span>Monthly revenue</span><b>{rs(r.revenue)}</b></div>
                <div><span>Net margin</span><b>{r.revenue > 0 ? `${r.margin.toFixed(1)}%` : '–'}</b></div>
                <div><span>Total costs</span><b>{rs(r.total)}</b></div>
                <div><span>Setup cost back in</span><b>{paybackText}</b></div>
              </div>

              <ul className="costs">
                {r.costs.map(([name, c]) => (
                  <li key={name}><span>{name}</span><span>{rs(c)}{r.revenue > 0 && <small>{((c / r.revenue) * 100).toFixed(0)}%</small>}</span></li>
                ))}
              </ul>
              <p className="note">{nf.format(r.orders)} {fmt.unit} a month. Amounts are before GST. Your own time isn’t counted unless you add your salary to staff.</p>
            </aside>
          </div>

          {verdict && (
            <div className="verdict">
              <p>{verdict}</p>
              <p className="more">Next: <Link href={fmt.guide[0]}>{fmt.guide[1]}</Link>{fmt.guide[0] !== '/resources/business-plan' && <> · <Link href="/resources/business-plan">Restaurant business plan template</Link></>}</p>
            </div>
          )}

          <ToolCTA
            tool="food-business-profit-calculator"
            title="See your real profit every day, not once a month"
            text="DineOpen shows today’s sales, food cost and staff attendance on your phone, tablet or computer. From ₹899/month in India, with a 7-day free trial."
          />

          <section className="sec" id="benchmarks">
            <h2>What profit do food businesses in India usually keep?</h2>
            <p className="intro">Net margin is what is left after food, salaries, rent, bills, commission and everything else, as a share of sales. These are the usual ranges we see across India.</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Type of business</th><th className="num">Usual net margin</th></tr></thead>
                <tbody>{BENCHMARKS.map(([t, m]) => <tr key={t}><td>{t}</td><td className="num">{m}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="how-it-works">
            <h2>How is the profit worked out?</h2>
            <div className="prose">
              <p>Revenue is orders a day × average bill × days open. Food cost and app commission are a share of sales, packaging is per order, and the rest are fixed monthly costs. What is left is your monthly profit.</p>
              <div className="formula">Profit = Revenue − (Food + Staff + Rent + Utilities + App commission + Packaging + Other)</div>
              <p>Setup payback is your one-time setup cost divided by monthly profit. It ignores loan interest and the slow first few months, so treat it as the best case. Most places take a few months to reach their normal daily orders.</p>
              <p>If you are still planning, run the numbers at half your expected orders too. A place that only works at full capacity is a risky place to put your savings.</p>
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
              <Link href="/blog/how-to-start-cafe-coffee-shop-india.html"><b>Start a café</b><span>Costs, licences and setup in India.</span></Link>
              <Link href="/blog/cloud-kitchen-guide-2026"><b>Cloud kitchen guide</b><span>Brands, apps and margins.</span></Link>
              <Link href="/blog/how-to-start-bakery-india.html"><b>Start a bakery</b><span>From home or a shop.</span></Link>
              <Link href="/hi/blog/tiffin-service-kaise-shuru-kare"><b>Tiffin service (Hindi)</b><span>Ghar se tiffin business kaise shuru karein.</span></Link>
              <Link href="/blog/how-to-start-food-truck-india.html"><b>Start a food truck</b><span>Truck, permits and running costs.</span></Link>
              <Link href="/tools/food-cost-calculator"><b>Food cost calculator</b><span>Price every dish for a healthy food cost.</span></Link>
            </div>
          </section>

          <section className="owner">
            <div>
              <h2>Already open? Track it for real</h2>
              <p>Billing, kitchen tickets, stock, staff attendance and payroll in one place, on the phone or computer you already have.</p>
              <ul>
                <li>7-day free trial</li>
                <li>From ₹899/month in India</li>
                <li>Works on phone, tablet or computer</li>
              </ul>
            </div>
            <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=food-business-profit-calculator"
              onClick={() => track('tool_cta_click', { tool: 'food-business-profit-calculator', where: 'footer' })}>Try DineOpen free →</Link>
          </section>

          <p className="updated">Updated October 2026 · Starting numbers are typical, not a forecast. Your rent, prices and orders decide your real profit.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/food-business-profit-calculator" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{pcStyles}</style>
    </>
  );
}

const pcStyles = css.global`
  .pc .types{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 20px}
  .pc .types .chip{padding:10px 16px;font-size:14.5px;font-weight:700}
  .pc .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 14px}
  .pc .fld{min-width:0}
  .pc .inwrap{position:relative;display:flex;align-items:center}
  .pc .inwrap .inp{font-weight:700}
  .pc .inwrap.rs .inp{padding-left:30px}
  .pc .inwrap.pct .inp{padding-right:32px}
  .pc .pre,.pc .post{position:absolute;color:var(--muted);font-weight:700;pointer-events:none}
  .pc .pre{left:13px}
  .pc .post{right:13px}
  .pc .hint{margin-top:5px}
  .pc .costs{list-style:none;margin:18px 0 0;padding:0;border-top:1px solid rgba(255,255,255,.12)}
  .pc .costs li{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px;color:#cbd5e1}
  .pc .costs li span:last-child{color:#fff;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
  .pc .costs small{color:#94a3b8;font-weight:600;margin-left:8px;display:inline-block;min-width:32px;text-align:right}
  .pc .verdict{margin-top:20px;border:1px solid var(--line);border-left:4px solid var(--red);border-radius:14px;padding:18px 20px;background:var(--soft)}
  .pc .verdict p{margin:0;color:var(--ink);font-size:16.5px;line-height:1.65}
  .pc .verdict .more{margin-top:10px;font-size:14.5px;color:var(--body)}
  .pc .verdict a{color:var(--red-d);font-weight:700;text-decoration:none}
  .pc .verdict a:hover{text-decoration:underline}
  @media (max-width:520px){
    .pc .fields{grid-template-columns:minmax(0,1fr)}
    .pc .types{justify-content:flex-start}
    .pc .types .chip{padding:9px 12px;font-size:14px}
  }
`;
