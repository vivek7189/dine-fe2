'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { tipToolStyles } from '../../../components/tools/tipToolStyles';
import { detectCountry } from '../../../lib/detectCountry';
import { track } from '../../../lib/analytics';
import { BENCHMARKS, STEPS, LOWER_COST, FAQ, RELATED } from './foodCostContent';

const STORE_KEY = 'dineopen_food_cost_v1';
const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'NZD', 'ZAR', 'INR', 'AED', 'SAR', 'QAR', 'KES', 'SGD', 'MYR'];
const COUNTRY_CURRENCY = {
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD', ZA: 'ZAR', IN: 'INR', AE: 'AED', SA: 'SAR', QA: 'QAR', KE: 'KES', SG: 'SGD', MY: 'MYR',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', AT: 'EUR', BE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
};
// Typical sales tax / VAT / GST on restaurant food, used only as the default when "prices include tax" is ticked.
const DEFAULT_TAX = { GBP: 20, EUR: 20, AED: 5, SAR: 15, ZAR: 15, AUD: 10, NZD: 15, INR: 5, KES: 16, SGD: 9, MYR: 6 };
// Rough price level against USD, so the metric example looks sensible in any currency.
const PRICE_LEVEL = { USD: 1, CAD: 1.38, GBP: 0.79, EUR: 0.92, AUD: 1.53, NZD: 1.68, ZAR: 17.5, AED: 3.67, SAR: 3.75, QAR: 3.64, KES: 129, SGD: 1.3, MYR: 4.4 };

const UNITS = { g: ['mass', 1], kg: ['mass', 1000], oz: ['mass', 28.3495], lb: ['mass', 453.592], ml: ['vol', 1], L: ['vol', 1000], 'fl oz': ['vol', 29.5735], cup: ['vol', 236.588], tbsp: ['vol', 14.787], tsp: ['vol', 4.929], each: ['each', 1] };
const UNIT_LIST = Object.keys(UNITS);
const TARGETS = [25, 28, 30, 32, 35];
const TABLE_TARGETS = [22, 25, 28, 30, 32, 35, 40];
const ROUNDING = [['exact', 'Exact'], ['99', '.99'], ['whole', 'Whole'], ['five', 'To 5']];

const ing = (name, buyPrice, buyQty, buyUnit, useQty, useUnit) => ({ name, buyPrice: String(buyPrice), buyQty: String(buyQty), buyUnit, useQty: String(useQty), useUnit });

function example(currency) {
  if (currency === 'INR') {
    return { dish: 'Paneer butter masala', portions: '4', items: [
      ing('Paneer', 360, 1, 'kg', 600, 'g'), ing('Butter', 540, 1, 'kg', 60, 'g'), ing('Fresh cream', 260, 1, 'L', 150, 'ml'),
      ing('Tomatoes', 40, 1, 'kg', 600, 'g'), ing('Onions', 35, 1, 'kg', 200, 'g'), ing('Cashews', 900, 1, 'kg', 40, 'g'),
    ] };
  }
  if (currency === 'USD' || currency === 'CAD') {
    const k = PRICE_LEVEL[currency];
    const p = (n) => (n * k).toFixed(2);
    return { dish: 'Classic cheeseburger with fries', portions: '1', items: [
      ing('Ground beef 80/20', p(5.99), 1, 'lb', 6, 'oz'), ing('Brioche buns', p(4.2), 8, 'each', 1, 'each'),
      ing('American cheese', p(6.5), 24, 'each', 1, 'each'), ing('Lettuce, tomato, onion', p(2.4), 1, 'lb', 2.5, 'oz'),
      ing('Burger sauce', p(4.5), 32, 'fl oz', 1, 'fl oz'), ing('Frozen fries', p(36), 30, 'lb', 6, 'oz'),
    ] };
  }
  const k = PRICE_LEVEL[currency] || 1;
  const p = (n) => (k >= 50 ? Math.round(n * k) : (n * k).toFixed(2));
  return { dish: 'Classic cheeseburger with fries', portions: '1', items: [
    ing('Beef mince', p(13.2), 1, 'kg', 170, 'g'), ing('Brioche buns', p(4.2), 8, 'each', 1, 'each'),
    ing('Cheese slices', p(6.5), 24, 'each', 1, 'each'), ing('Salad (lettuce, tomato, onion)', p(5.3), 1, 'kg', 70, 'g'),
    ing('Burger sauce', p(4.5), 1, 'L', 30, 'ml'), ing('Frozen chips / fries', p(2.65), 1, 'kg', 170, 'g'),
  ] };
}

const num = (v) => Math.max(0, parseFloat(v) || 0);

function lineCost(it) {
  const bu = UNITS[it.buyUnit]; const uu = UNITS[it.useUnit];
  const buyQty = num(it.buyQty);
  if (!bu || !uu || !buyQty) return { cost: 0, ok: true };
  if (bu[0] !== uu[0]) return { cost: 0, ok: false };
  return { cost: (num(it.buyPrice) / (buyQty * bu[1])) * num(it.useQty) * uu[1], ok: true };
}

function roundPrice(p, mode) {
  if (!(p > 0)) return 0;
  // Nearest menu-friendly price, never below the smallest step.
  if (mode === '99') return Math.max(1, Math.round(p)) - 0.01;
  if (mode === 'whole') return Math.max(1, Math.round(p));
  if (mode === 'five') return Math.max(5, Math.round(p / 5) * 5);
  return Math.round(p * 100) / 100;
}

export default function FoodCostCalculatorClient() {
  const [currency, setCurrency] = useState('USD');
  const [locale, setLocale] = useState('en-US');
  const [mode, setMode] = useState('recipe');
  const [dish, setDish] = useState('');
  const [items, setItems] = useState([]);
  const [portions, setPortions] = useState('1');
  const [extras, setExtras] = useState('5');
  const [plateCost, setPlateCost] = useState('');
  const [target, setTarget] = useState(30);
  const [customTarget, setCustomTarget] = useState('');
  const [rounding, setRounding] = useState('99');
  const [yourPrice, setYourPrice] = useState('');
  const [inclTax, setInclTax] = useState(false);
  const [taxRate, setTaxRate] = useState('');
  const [period, setPeriod] = useState({ open: '', buy: '', close: '', sales: '' });
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (navigator.language) setLocale(navigator.language);
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { /* storage blocked */ }
    if (saved && saved.currency) {
      setCurrency(saved.currency); setMode(saved.mode || 'recipe'); setDish(saved.dish || ''); setItems(saved.items || []);
      setPortions(saved.portions || '1'); setExtras(saved.extras ?? '5'); setPlateCost(saved.plateCost || '');
      setTarget(saved.target || 30); setCustomTarget(saved.customTarget || ''); setRounding(saved.rounding || '99');
      setYourPrice(saved.yourPrice || ''); setInclTax(!!saved.inclTax); setTaxRate(saved.taxRate || '');
    } else {
      const { countryCode } = detectCountry();
      const cur = COUNTRY_CURRENCY[countryCode] || 'USD';
      const ex = example(cur);
      setCurrency(cur); setDish(ex.dish); setItems(ex.items); setPortions(ex.portions);
      if (cur === 'INR') setRounding('five');
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ currency, mode, dish, items, portions, extras, plateCost, target, customTarget, rounding, yourPrice, inclTax, taxRate }));
    } catch { /* storage blocked */ }
  }, [currency, mode, dish, items, portions, extras, plateCost, target, customTarget, rounding, yourPrice, inclTax, taxRate]);

  const fmt = useMemo(() => {
    const opts = { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 };
    let nf;
    try { nf = new Intl.NumberFormat(locale, opts); } catch { nf = new Intl.NumberFormat('en-US', opts); }
    return (n) => nf.format(Number.isFinite(n) ? n : 0);
  }, [currency, locale]);

  const lines = items.map(lineCost);
  const recipeTotal = lines.reduce((s, l) => s + l.cost, 0);
  const portionsN = Math.max(1, Math.round(num(portions)) || 1);
  const extrasPct = Math.min(100, num(extras));
  const cost = mode === 'recipe' ? (recipeTotal / portionsN) * (1 + extrasPct / 100) : num(plateCost);

  const targetPct = customTarget !== '' ? Math.min(95, Math.max(1, num(customTarget))) : target;
  const tax = inclTax ? Math.min(100, num(taxRate)) / 100 : 0;
  const toMenu = (net) => net * (1 + tax);
  const toNet = (menu) => menu / (1 + tax);
  const suggested = roundPrice(toMenu(cost / (targetPct / 100)), rounding);
  const yourN = num(yourPrice);
  const price = yourN > 0 ? yourN : suggested;
  const net = toNet(price);
  const fcPct = net > 0 ? (cost / net) * 100 : 0;
  const profit = net - cost;
  const markup = cost > 0 ? net / cost : 0;
  const status = !(cost > 0 && net > 0) ? null : fcPct <= targetPct + 0.05 ? ['ok', 'On target'] : fcPct <= targetPct + 5 ? ['warn', 'A bit high'] : ['bad', 'Too high'];

  const p = { open: num(period.open), buy: num(period.buy), close: num(period.close), sales: num(period.sales) };
  const used = Math.max(0, p.open + p.buy - p.close);
  const periodPct = p.sales > 0 ? (used / p.sales) * 100 : 0;

  const setItem = (i, key, val) => setItems((arr) => arr.map((it, j) => (j === i ? { ...it, [key]: val } : it)));
  const addItem = () => setItems((arr) => [...arr, ing('', '', 1, UNITS[arr[arr.length - 1]?.buyUnit] ? arr[arr.length - 1].buyUnit : 'kg', '', arr[arr.length - 1]?.useUnit || 'g')]);
  const removeItem = (i) => setItems((arr) => arr.filter((_, j) => j !== i));
  const loadExample = () => { const ex = example(currency); setDish(ex.dish); setItems(ex.items); setPortions(ex.portions); setExtras('5'); setMode('recipe'); setYourPrice(''); };
  const clearAll = () => { setDish(''); setItems([ing('', '', 1, 'kg', '', 'g')]); setPortions('1'); setPlateCost(''); setYourPrice(''); };
  const changeCurrency = (c) => {
    setCurrency(c);
    if (inclTax && taxRate === '' && DEFAULT_TAX[c]) setTaxRate(String(DEFAULT_TAX[c]));
  };
  const toggleTax = (on) => {
    setInclTax(on);
    if (on && taxRate === '') setTaxRate(String(DEFAULT_TAX[currency] || 10));
  };

  const copy = async () => {
    const out = [
      dish ? `${dish}` : 'Dish',
      `Cost per plate: ${fmt(cost)}`,
      `Suggested price (${targetPct}% food cost): ${fmt(suggested)}`,
    ];
    if (yourN > 0) out.push(`Your price ${fmt(yourN)}: food cost ${fcPct.toFixed(1)}%, profit ${fmt(profit)} per plate`);
    if (mode === 'recipe') items.forEach((it, i) => { if (it.name || lines[i].cost) out.push(`  ${it.name || 'Ingredient'}: ${fmt(lines[i].cost / portionsN)}`); });
    try { await navigator.clipboard.writeText(out.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
    track('tool_food_cost_copy', { mode, currency });
  };

  return (
    <>
      <CommonHeader />
      <main className="tt fc">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Food cost calculator</nav>

          <header className="head">
            <h1>Food Cost Calculator</h1>
            <p className="lede">Work out what each dish costs to make, its food cost percentage, and the menu price that hits your target. Add ingredients in any unit, or just enter the plate cost.</p>
          </header>

          <div className="app">
            <section className="card" aria-label="Food cost calculator">
              <div className="field">
                <div className="lbl"><span>Plate cost</span></div>
                <div className="seg" role="group" aria-label="How to enter the cost">
                  {[['recipe', 'Build from ingredients'], ['quick', 'I know the plate cost']].map(([v, l]) => (
                    <button key={v} type="button" className={mode === v ? 'on' : ''} aria-pressed={mode === v} onClick={() => setMode(v)}>{l}</button>
                  ))}
                </div>
              </div>

              {mode === 'recipe' ? (
                <>
                  <div className="field">
                    <label className="lbl" htmlFor="fc-dish">Dish name <small>optional</small></label>
                    <input id="fc-dish" className="inp" placeholder="e.g. Chicken burger" value={dish} onChange={(e) => setDish(e.target.value)} />
                  </div>

                  <div className="field">
                    <div className="lbl"><span>Ingredients</span><small>Recipe total {fmt(recipeTotal)}</small></div>
                    {items.map((it, i) => (
                      <div className="ing" key={i}>
                        <div className="ing-top">
                          <label className="sr" htmlFor={`fc-n${i}`}>Ingredient {i + 1} name</label>
                          <input id={`fc-n${i}`} className="inp sm" placeholder={`Ingredient ${i + 1}`} value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} />
                          <span className={'ing-cost' + (lines[i].ok ? '' : ' err')}>{lines[i].ok ? fmt(lines[i].cost) : 'Check units'}</span>
                          <button type="button" className="del" aria-label={`Remove ${it.name || `ingredient ${i + 1}`}`} onClick={() => removeItem(i)}>×</button>
                        </div>
                        <div className="ing-bot">
                          <div className="grp">
                            <span>You paid</span>
                            <div className="trio">
                              <input aria-label="Price paid" type="number" inputMode="decimal" min="0" step="0.01" placeholder="Price" value={it.buyPrice} onChange={(e) => setItem(i, 'buyPrice', e.target.value)} />
                              <em>for</em>
                              <input aria-label="Amount bought" type="number" inputMode="decimal" min="0" step="any" placeholder="Qty" value={it.buyQty} onChange={(e) => setItem(i, 'buyQty', e.target.value)} />
                              <select aria-label="Unit bought" value={it.buyUnit} onChange={(e) => setItem(i, 'buyUnit', e.target.value)}>
                                {UNIT_LIST.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="grp">
                            <span>Recipe uses</span>
                            <div className="trio">
                              <input aria-label="Amount used in recipe" type="number" inputMode="decimal" min="0" step="any" placeholder="Qty" value={it.useQty} onChange={(e) => setItem(i, 'useQty', e.target.value)} />
                              <select aria-label="Unit used" value={it.useUnit} onChange={(e) => setItem(i, 'useUnit', e.target.value)}>
                                {UNIT_LIST.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="ing-acts">
                      <button type="button" className="btn ghost sm" onClick={addItem}>+ Add ingredient</button>
                      <button type="button" className="linkish" onClick={loadExample}>Load example</button>
                      <button type="button" className="linkish" onClick={clearAll}>Clear</button>
                    </div>
                  </div>

                  <div className="field row2">
                    <div>
                      <label className="lbl" htmlFor="fc-por">Recipe makes</label>
                      <div className="unit-in"><input id="fc-por" className="inp" type="number" inputMode="numeric" min="1" step="1" value={portions} onChange={(e) => setPortions(e.target.value)} /><span>portions</span></div>
                    </div>
                    <div>
                      <label className="lbl" htmlFor="fc-ext">Extras &amp; waste</label>
                      <div className="unit-in"><input id="fc-ext" className="inp" type="number" inputMode="decimal" min="0" max="100" value={extras} onChange={(e) => setExtras(e.target.value)} /><span>%</span></div>
                    </div>
                  </div>
                  <p className="hint">Extras &amp; waste covers oil, spices, garnish and trim you didn’t list. 3–10% is typical.</p>
                </>
              ) : (
                <div className="field">
                  <label className="lbl" htmlFor="fc-plate">Cost to make one plate</label>
                  <div className="money">
                    <label htmlFor="fc-cur1" className="sr">Currency</label>
                    <select id="fc-cur1" value={currency} onChange={(e) => changeCurrency(e.target.value)}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input id="fc-plate" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" autoComplete="off" value={plateCost} onChange={(e) => setPlateCost(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="field">
                <div className="lbl"><span>Target food cost</span><small>{targetPct}%</small></div>
                <div className="chips c5" role="group" aria-label="Target food cost percentage">
                  {TARGETS.map((t) => (
                    <button key={t} type="button" className={'chip' + (customTarget === '' && target === t ? ' on' : '')} aria-pressed={customTarget === '' && target === t}
                      onClick={() => { setTarget(t); setCustomTarget(''); }}>{t}%</button>
                  ))}
                </div>
                <label className="sr" htmlFor="fc-ct">Custom target percentage</label>
                <input id="fc-ct" className="inp" style={{ marginTop: 10 }} type="number" inputMode="decimal" min="1" max="95" placeholder="Custom %" value={customTarget} onChange={(e) => setCustomTarget(e.target.value)} />
              </div>

              <div className="field row2">
                <div>
                  <div className="lbl"><span>Round the price</span></div>
                  <div className="seg" role="group" aria-label="Round the suggested price">
                    {ROUNDING.map(([v, l]) => (
                      <button key={v} type="button" className={rounding === v ? 'on' : ''} aria-pressed={rounding === v} onClick={() => setRounding(v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="lbl" htmlFor="fc-yp">Your menu price <small>optional</small></label>
                  <div className="money sm">
                    {mode === 'recipe' ? (
                      <>
                        <label htmlFor="fc-cur2" className="sr">Currency</label>
                        <select id="fc-cur2" value={currency} onChange={(e) => changeCurrency(e.target.value)}>
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </>
                    ) : <b className="cur">{currency}</b>}
                    <input id="fc-yp" type="number" inputMode="decimal" min="0" step="0.01" placeholder="Check a price" value={yourPrice} onChange={(e) => setYourPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="toggle"><input type="checkbox" checked={inclTax} onChange={(e) => toggleTax(e.target.checked)} /> Menu prices include tax (VAT / GST)</label>
                {inclTax && (
                  <>
                    <div className="unit-in" style={{ marginTop: 10, maxWidth: 220 }}>
                      <label className="sr" htmlFor="fc-tax">Tax rate</label>
                      <input id="fc-tax" className="inp" type="number" inputMode="decimal" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} /><span>% tax</span>
                    </div>
                    <p className="hint">Food cost is worked out on the price without tax, because the tax isn’t yours to keep.</p>
                  </>
                )}
              </div>
            </section>

            <aside className="res" aria-live="polite">
              <div className="k">Suggested menu price</div>
              <div className="big">{fmt(suggested)}</div>
              <div className="sub">{targetPct}% food cost{inclTax ? `, incl. ${num(taxRate)}% tax` : ''}{dish && mode === 'recipe' ? ` · ${dish}` : ''}</div>
              <div className="grid">
                <div><span>Cost per plate</span><b>{fmt(cost)}</b></div>
                <div><span>Profit per plate</span><b>{fmt(profit)}</b></div>
                <div><span>Food cost %</span><b>{fcPct.toFixed(1)}%</b></div>
                <div><span>Markup</span><b>{markup ? `${markup.toFixed(2)}×` : '–'}</b></div>
              </div>
              {yourN > 0 && status && (
                <p className={'verdict ' + status[0]}><b>{status[1]}.</b> At your price of {fmt(yourN)} the food cost is {fcPct.toFixed(1)}%{status[0] === 'ok' ? '.' : `, above your ${targetPct}% target. ${fmt(suggested)} would hit it.`}</p>
              )}
              {!yourN && cost > 0 && <p className="note">Figures are at the suggested price. Enter your menu price to check it.</p>}
              {mode === 'recipe' && lines.some((l) => !l.ok) && <p className="note warn-t">One ingredient mixes weight and volume units, so it isn’t counted. Use the same kind of unit for “paid” and “uses”.</p>}
              <div className="acts no-print">
                <button type="button" onClick={copy}>{copied ? '✓ Copied' : 'Copy result'}</button>
                <button type="button" onClick={() => { window.print(); track('tool_food_cost_print', {}); }}>Print</button>
              </div>
              <p className="note">Saved on this device only.</p>
            </aside>
          </div>

          <section className="sec" id="price-table">
            <h2>Menu price at each food cost %</h2>
            <p className="intro">{cost > 0 ? `For a plate that costs ${fmt(cost)} to make.` : 'Add ingredients or a plate cost above to fill this table.'}{inclTax ? ` Prices include ${num(taxRate)}% tax.` : ''}</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Food cost</th><th className="num">Menu price</th><th className="num">Profit per plate</th><th className="num">Markup</th></tr></thead>
                <tbody>
                  {TABLE_TARGETS.map((t) => {
                    const pr = toMenu(cost / (t / 100));
                    return (
                      <tr key={t} className={t === targetPct ? 'hl' : ''}>
                        <td>{t}%</td><td className="num">{fmt(pr)}</td><td className="num">{fmt(toNet(pr) - cost)}</td><td className="num">{(100 / t).toFixed(2)}×</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="period-food-cost">
            <h2>Weekly or monthly food cost %</h2>
            <p className="intro">Recipe costs show what a dish <em>should</em> cost. Your stock count shows what you <em>really</em> spent, including waste and over-portioning.</p>
            <div className="card period">
              <div className="pgrid">
                {[['open', 'Opening stock value'], ['buy', 'Food purchases'], ['close', 'Closing stock value'], ['sales', 'Food sales (before tax)']].map(([k, l]) => (
                  <div key={k}>
                    <label className="lbl" htmlFor={`fp-${k}`}>{l}</label>
                    <div className="money sm"><b className="cur">{currency}</b>
                      <input id={`fp-${k}`} type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={period[k]} onChange={(e) => setPeriod((s) => ({ ...s, [k]: e.target.value }))} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pres">
                <div><span>Food used</span><b>{fmt(used)}</b></div>
                <div><span>Food cost %</span><b>{p.sales > 0 ? `${periodPct.toFixed(1)}%` : '–'}</b></div>
                <div><span>Gross profit on food</span><b>{fmt(p.sales - used)}</b></div>
              </div>
              <p className="formula" style={{ marginTop: 14 }}>Food cost % = (Opening stock + Purchases − Closing stock) ÷ Food sales × 100</p>
            </div>
          </section>

          <section className="sec" id="how-to-calculate-food-cost">
            <h2>How to calculate food cost</h2>
            <p className="intro">Three steps for any dish. The calculator above does them for you.</p>
            <p className="formula">Food cost % = Plate cost ÷ Menu price × 100 &nbsp;·&nbsp; Menu price = Plate cost ÷ Target %</p>
            <div className="steps" style={{ marginTop: 16 }}>
              {STEPS.map(([t, d], i) => <div className="step" key={t}><i>{i + 1}</i><h3>{t}</h3><p>{d}</p></div>)}
            </div>
            <div className="prose">
              <h3>Worked example: a cheeseburger</h3>
              <p>A 6 oz patty from beef at $5.99 a pound costs $2.25. Add the bun ($0.53), a cheese slice ($0.27), salad ($0.38), sauce ($0.14) and fries ($0.45), and the plate costs $4.01. With 5% for extras and waste, that’s $4.21.</p>
              <p>For a 30% food cost, the price is $4.21 ÷ 0.30 = $14.03. Round it to $13.99 and the food cost is 30.1%. That leaves $9.78 to pay for staff, rent and profit.</p>
            </div>
          </section>

          <section className="sec" id="food-cost-benchmarks">
            <h2>What food cost % should you aim for?</h2>
            <p className="intro">Typical ranges by type of business. Your own target depends on your prices, rent and staff costs.</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Type of business</th><th>Typical food cost</th><th>Why</th></tr></thead>
                <tbody>{BENCHMARKS.map(([w, r, n]) => <tr key={w}><td><b>{w}</b></td><td>{r}</td><td style={{ color: '#64748b' }}>{n}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="sec" id="lower-food-cost">
            <h2>6 ways to lower your food cost</h2>
            <div className="steps">
              {LOWER_COST.map(([t, d], i) => <div className="step" key={t}><i>{i + 1}</i><h3>{t}</h3><p>{d}</p></div>)}
            </div>
          </section>

          <section className="sec" id="faq">
            <h2>Food cost FAQ</h2>
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
              <h2>Track food cost without spreadsheets</h2>
              <p>DineOpen is a restaurant POS with recipes and stock built in.</p>
              <ul>
                <li>Recipes take stock off on every sale</li>
                <li>Expected vs counted stock</li>
                <li>Food cost in your profit &amp; loss</li>
                <li>Menu engineering report</li>
              </ul>
            </div>
            <Link className="btn" href="/login?utm_source=dineopen&utm_medium=tool&utm_campaign=food-cost-calculator"
              onClick={() => track('tool_cta_click', { tool: 'food-cost-calculator' })}>Try DineOpen free →</Link>
          </section>

          <p className="updated">Updated October 2026 · Benchmarks are typical industry ranges, not rules.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/food-cost-calculator" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{fcStyles}</style>
    </>
  );
}

const fcStyles = css.global`
  .fc .chips.c5{grid-template-columns:repeat(5,1fr)}
  .fc .inp.sm{padding:9px 11px}
  .fc .ing{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--soft)}
  .fc .ing+.ing{margin-top:10px}
  .fc .ing-top{display:flex;gap:8px;align-items:center}
  .fc .ing-top .inp{flex:1;min-width:0;font-weight:700}
  .fc .ing-cost{font-weight:800;color:var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums;font-size:15px;min-width:64px;text-align:right}
  .fc .ing-cost.err{color:var(--red-d);font-size:13px}
  .fc .del{flex-shrink:0;width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--muted);font-size:20px;cursor:pointer}
  .fc .del:hover{color:var(--red);border-color:#fca5a5}
  .fc .ing-bot{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:10px;margin-top:10px}
  .fc .grp>span{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px}
  .fc .trio{display:flex;border:1.5px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}
  .fc .trio:focus-within{border-color:var(--red)}
  .fc .trio input{min-width:0;flex:1;width:100%;border:0;outline:0;padding:9px 10px;font:inherit;font-size:16px;color:var(--ink);background:transparent}
  .fc .trio em{display:grid;place-items:center;padding:0 6px;font-style:normal;color:var(--muted);font-size:13px;font-weight:600;background:var(--soft);border-left:1px solid var(--line);border-right:1px solid var(--line)}
  .fc .trio select{border:0;border-left:1px solid var(--line);background:var(--soft);font:inherit;font-size:15px;font-weight:700;color:var(--ink);padding:0 4px;cursor:pointer;max-width:72px}
  .fc .ing-acts{display:flex;gap:14px;align-items:center;margin-top:12px;flex-wrap:wrap}
  .fc .btn.sm{padding:10px 16px;min-height:44px;font-size:14.5px}
  .fc .linkish{border:0;background:none;padding:10px 2px;font:inherit;font-size:14px;font-weight:700;color:var(--muted);cursor:pointer;text-decoration:underline;text-underline-offset:3px}
  .fc .linkish:hover{color:var(--red)}
  .fc .unit-in{display:flex;align-items:center;gap:8px}
  .fc .unit-in .inp{flex:1;min-width:0}
  .fc .unit-in span{font-size:14px;font-weight:600;color:var(--muted)}
  .fc .money.sm input{font-size:18px;padding:11px 12px}
  .fc .money .cur{display:grid;place-items:center;padding:0 10px;background:var(--soft);border-right:1px solid var(--line);font-size:14px;color:var(--ink)}
  .fc .verdict{margin:14px 0 0;padding:12px 14px;border-radius:12px;font-size:14px;line-height:1.5}
  .fc .verdict.ok{background:rgba(22,163,74,.18);color:#bbf7d0}
  .fc .verdict.warn{background:rgba(245,158,11,.18);color:#fde68a}
  .fc .verdict.bad{background:rgba(239,68,68,.2);color:#fecaca}
  .fc .note.warn-t{color:#fde68a}
  .fc .period{max-width:860px}
  .fc .pgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
  .fc .pres{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-top:18px}
  .fc .pres div{background:#fff;padding:14px 16px}
  .fc .pres span{display:block;font-size:12.5px;font-weight:600;color:var(--muted)}
  .fc .pres b{display:block;font-size:20px;font-weight:800;color:var(--ink);margin-top:4px;font-variant-numeric:tabular-nums}
  .fc .steps+.prose{margin-top:8px}
  @media (max-width:860px){
    .fc .pgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  }
  @media (max-width:520px){
    .fc .ing-bot{grid-template-columns:minmax(0,1fr)}
    .fc .chips.c5{grid-template-columns:repeat(5,1fr);gap:6px}
    .fc .chips.c5 .chip{font-size:14px}
    .fc .pgrid{grid-template-columns:minmax(0,1fr)}
    .fc .pres{grid-template-columns:minmax(0,1fr)}
    .fc .seg button{font-size:13px;padding:10px 4px}
  }
`;
