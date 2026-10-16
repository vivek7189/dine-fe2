'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { detectCountry } from '../../../lib/detectCountry';
import { track } from '../../../lib/analytics';
import { US_GUIDE, WORLD_GUIDE, FAQ, RELATED } from './tipContent';

const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR', 'MXN', 'AUD', 'INR', 'AED', 'SAR'];
const COUNTRY_CURRENCY = {
  US: 'USD', CA: 'CAD', GB: 'GBP', MX: 'MXN', AU: 'AUD', IN: 'INR', AE: 'AED', SA: 'SAR',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', AT: 'EUR', BE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
};
const PRESETS = [10, 15, 18, 20, 22, 25];
const CHART = [10, 12, 15, 18, 20, 22, 25];

export default function TipCalculatorClient() {
  const [currency, setCurrency] = useState('USD');
  const [bill, setBill] = useState('');
  const [pct, setPct] = useState(18);
  const [custom, setCustom] = useState('');
  const [people, setPeople] = useState(1);
  const [preTax, setPreTax] = useState(false);
  const [tax, setTax] = useState('');
  const [round, setRound] = useState('none');
  const [copied, setCopied] = useState(false);
  const [locale, setLocale] = useState('en-US');

  useEffect(() => {
    const { countryCode } = detectCountry();
    if (countryCode && COUNTRY_CURRENCY[countryCode]) setCurrency(COUNTRY_CURRENCY[countryCode]);
    if (navigator.language) setLocale(navigator.language);
  }, []);

  const fmt = useMemo(() => {
    const opts = { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 };
    let nf;
    try { nf = new Intl.NumberFormat(locale, opts); } catch { nf = new Intl.NumberFormat('en-US', opts); }
    return (n) => nf.format(Number.isFinite(n) ? n : 0);
  }, [currency, locale]);

  const billN = Math.max(0, parseFloat(bill) || 0);
  const taxN = preTax ? Math.min(billN, Math.max(0, parseFloat(tax) || 0)) : 0;
  const rate = (custom !== '' ? Math.max(0, parseFloat(custom) || 0) : pct) / 100;
  const base = billN - taxN;

  let tip = base * rate;
  let total = billN + tip;
  let each = total / people;
  if (round === 'total' && total > 0) {
    total = Math.ceil(total);
    tip = total - billN;
    each = total / people;
  } else if (round === 'person' && total > 0) {
    each = Math.ceil(total / people);
    total = each * people;
    tip = total - billN;
  }
  const effective = base > 0 ? (tip / base) * 100 : 0;
  const shownPct = custom !== '' ? (parseFloat(custom) || 0) : pct;
  const chartBill = billN > 0 ? billN : 100;

  const copy = async () => {
    const lines = [`Bill: ${fmt(billN)}`, `Tip (${shownPct}%): ${fmt(tip)}`, `Total: ${fmt(total)}`];
    if (people > 1) lines.push(`Each of ${people} pays: ${fmt(each)}`);
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
    track('tool_tip_copy', { people, pct: shownPct });
  };

  const reset = () => { setBill(''); setPct(18); setCustom(''); setPeople(1); setPreTax(false); setTax(''); setRound('none'); };

  return (
    <>
      <CommonHeader />
      <main className="tt">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › Free tools › Tip calculator</nav>

          <header className="head">
            <h1>Tip Calculator</h1>
            <p className="lede">Work out the tip, split the bill between friends and round up to an even amount. Includes a tip chart and a guide to how much to tip in the US and around the world.</p>
          </header>

          <div className="app">
            <section className="card" aria-label="Tip calculator">
              <div className="field">
                <label className="lbl" htmlFor="tc-bill">Bill amount</label>
                <div className="money">
                  <label htmlFor="tc-cur" className="sr">Currency</label>
                  <select id="tc-cur" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input id="tc-bill" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" autoComplete="off"
                    value={bill} onChange={(e) => setBill(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <div className="lbl"><span>Tip</span><small>{shownPct}%</small></div>
                <div className="chips" role="group" aria-label="Tip percentage">
                  {PRESETS.map((p) => (
                    <button key={p} type="button" className={'chip' + (custom === '' && pct === p ? ' on' : '')} aria-pressed={custom === '' && pct === p}
                      onClick={() => { setPct(p); setCustom(''); }}>{p}%</button>
                  ))}
                </div>
                <label className="sr" htmlFor="tc-custom">Custom tip percentage</label>
                <input id="tc-custom" className="inp" style={{ marginTop: 10 }} type="number" inputMode="decimal" min="0" max="100" placeholder="Custom %"
                  value={custom} onChange={(e) => setCustom(e.target.value)} />
              </div>

              <div className="field row2">
                <div>
                  <div className="lbl"><span>Split between</span></div>
                  <div className="stepper">
                    <button type="button" aria-label="One person fewer" disabled={people <= 1} onClick={() => setPeople((n) => Math.max(1, n - 1))}>−</button>
                    <output aria-live="polite">{people} {people === 1 ? 'person' : 'people'}</output>
                    <button type="button" aria-label="One more person" disabled={people >= 50} onClick={() => setPeople((n) => Math.min(50, n + 1))}>+</button>
                  </div>
                </div>
                <div>
                  <div className="lbl"><span>Round up</span></div>
                  <div className="seg" role="group" aria-label="Round up">
                    {[['none', 'Off'], ['total', 'Total'], ['person', 'Each']].map(([v, l]) => (
                      <button key={v} type="button" className={round === v ? 'on' : ''} aria-pressed={round === v} onClick={() => setRound(v)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="toggle"><input type="checkbox" checked={preTax} onChange={(e) => setPreTax(e.target.checked)} /> Tip on pre-tax amount</label>
                {preTax && (
                  <>
                    <label className="sr" htmlFor="tc-tax">Tax on the bill</label>
                    <input id="tc-tax" className="inp" style={{ marginTop: 10 }} type="number" inputMode="decimal" min="0" step="0.01" placeholder="Tax shown on the bill"
                      value={tax} onChange={(e) => setTax(e.target.value)} />
                    <p className="hint">The tip is worked out on {fmt(base)} (bill minus tax). You still pay the tax.</p>
                  </>
                )}
              </div>
            </section>

            <aside className="res" aria-live="polite">
              <div className="k">{people > 1 ? 'Each person pays' : 'Total to pay'}</div>
              <div className="big">{fmt(people > 1 ? each : total)}</div>
              <div className="sub">{people > 1 ? `${people} people · total ${fmt(total)}` : `Bill ${fmt(billN)} + tip ${fmt(tip)}`}</div>
              <div className="grid">
                <div><span>Tip</span><b>{fmt(tip)}</b></div>
                <div><span>Total</span><b>{fmt(total)}</b></div>
                <div><span>Tip each</span><b>{fmt(tip / people)}</b></div>
                <div><span>Real tip %</span><b>{effective.toFixed(1)}%</b></div>
              </div>
              <div className="acts no-print">
                <button type="button" onClick={copy}>{copied ? '✓ Copied' : 'Copy result'}</button>
                <button type="button" onClick={reset}>Reset</button>
              </div>
              {round !== 'none' && billN > 0 && <p className="note">Rounded up, so the tip is {effective.toFixed(1)}% instead of {shownPct}%.</p>}
            </aside>
          </div>

          <section className="sec" id="tip-chart">
            <h2>Tip chart{billN > 0 ? ` for a ${fmt(billN)} bill` : ''}</h2>
            <p className="intro">{billN > 0 ? 'Tip and total at common percentages for your bill.' : 'Enter your bill above to fill this chart. The example below is for a 100 bill.'}</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Tip</th><th className="num">Tip amount</th><th className="num">Total</th>{people > 1 && <th className="num">Each ({people})</th>}</tr></thead>
                <tbody>
                  {CHART.map((p) => {
                    const t = (chartBill - taxN) * p / 100;
                    return (
                      <tr key={p} className={custom === '' && p === pct ? 'hl' : ''}>
                        <td>{p}%</td><td className="num">{fmt(t)}</td><td className="num">{fmt(chartBill + t)}</td>
                        {people > 1 && <td className="num">{fmt((chartBill + t) / people)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="how-to-calculate">
            <h2>How to calculate a tip</h2>
            <p className="intro">The maths is simple, and there are quick ways to do it in your head.</p>
            <p className="formula">Tip = Bill × Tip % &nbsp;·&nbsp; Total = Bill + Tip &nbsp;·&nbsp; Each = Total ÷ People</p>
            <div className="steps" style={{ marginTop: 16 }}>
              <div className="step"><i>1</i><h3>Find 10%</h3><p>Move the decimal one place left. On a $64.50 bill, 10% is $6.45.</p></div>
              <div className="step"><i>2</i><h3>Build the tip</h3><p>Double it for 20% ($12.90). For 15%, add half of 10% ($6.45 + $3.23 = $9.68).</p></div>
              <div className="step"><i>3</i><h3>Split and round</h3><p>Add the tip to the bill, divide by the number of people, and round up to an easy amount.</p></div>
            </div>
          </section>

          <section className="sec" id="how-much-to-tip">
            <h2>How much to tip in the US (2026)</h2>
            <p className="intro">Typical amounts by type of service. Tip more for great service and large or complicated orders.</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Where</th><th>Typical tip</th><th>Notes</th></tr></thead>
                <tbody>{US_GUIDE.map(([w, t, n]) => <tr key={w}><td><b>{w}</b></td><td>{t}</td><td style={{ color: '#64748b' }}>{n}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="tipping-around-the-world">
            <h2>Tipping around the world</h2>
            <p className="intro">Restaurant tipping customs change a lot from country to country. Always check the bill for a service charge first.</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Country</th><th>Restaurant tip</th><th>Good to know</th></tr></thead>
                <tbody>{WORLD_GUIDE.map(([c, t, n]) => <tr key={c}><td><b>{c}</b></td><td>{t}</td><td style={{ color: '#64748b' }}>{n}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="faq">
            <h2>Tip calculator FAQ</h2>
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
              <h2>Run a restaurant?</h2>
              <p>DineOpen is a POS that handles the bill side of tipping for you.</p>
              <ul>
                <li>Add a tip or service charge to any bill</li>
                <li>Split bills at the table</li>
                <li>Staff hours from attendance</li>
              </ul>
            </div>
            <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=tip-calculator"
              onClick={() => track('tool_cta_click', { tool: 'tip-calculator' })}>Try DineOpen free →</Link>
          </section>

          <p className="updated">Updated October 2026 · Tipping customs are general guidance and vary by place.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/tip-calculator" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
    </>
  );
}
