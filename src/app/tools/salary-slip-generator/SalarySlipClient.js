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
import { calc, daysIn, inWords, FAQ, ESI_LIMIT } from './slipContent';

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const rs = (n) => `₹${nf.format(Math.round(n))}`;

// A cook at a mid-size restaurant, so the first thing people see is a believable slip.
const EXAMPLE_BIZ = { name: 'Shree Annapurna Kitchen', address: 'Shop 4, Link Road, Andheri West, Mumbai 400053', logo: null };
const EXAMPLE_EMP = {
  name: 'Ramesh Yadav', role: 'Cook (Tandoor)', id: 'EMP-014', joined: '2024-06-01',
  offs: '4', worked: '25', paidLeave: '1',
  basic: '14000', hra: '3000', food: '1500', overtime: '1200', incentive: '800',
  pf: true, pfCap: true, esi: true, pt: '200', advance: '2000', other: '', otherLabel: '',
  payMode: 'Bank', last4: '4821',
};
const BLANK_EMP = {
  name: '', role: '', id: '', joined: '', offs: '4', worked: '', paidLeave: '0',
  basic: '', hra: '', food: '', overtime: '', incentive: '',
  pf: false, pfCap: true, esi: false, pt: '', advance: '', other: '', otherLabel: '',
  payMode: 'Bank', last4: '',
};

function prevMonth() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(m) {
  const [y, mo] = String(m).split('-').map(Number);
  if (!y || !mo) return '';
  return new Date(y, mo - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function SalarySlipClient() {
  const [biz, setBiz] = useState(EXAMPLE_BIZ);
  const [emp, setEmp] = useState(EXAMPLE_EMP);
  const [month, setMonth] = useState('');
  const [days, setDays] = useState('30');
  const [busy, setBusy] = useState(false);
  const slipRef = useRef(null);
  const logoRef = useRef(null);
  const formTop = useRef(null);

  // Month depends on today's date, so set it after load (the page itself is static).
  useEffect(() => {
    const m = prevMonth();
    setMonth(m);
    setDays(String(daysIn(m)));
  }, []);

  const r = useMemo(() => calc({ ...emp, days }), [emp, days]);
  const words = inWords(r.net);
  const mLabel = monthLabel(month);

  const setB = (k) => (e) => setBiz((b) => ({ ...b, [k]: e.target.value }));
  const setE = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEmp((x) => ({ ...x, [k]: k === 'last4' ? String(v).replace(/\D/g, '').slice(0, 4) : v }));
  };
  const pickMonth = (e) => {
    setMonth(e.target.value);
    if (e.target.value) setDays(String(daysIn(e.target.value)));
  };

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Please use a logo under 2 MB'); return; }
    const fr = new FileReader();
    fr.onload = (ev) => setBiz((b) => ({ ...b, logo: ev.target.result }));
    fr.readAsDataURL(file);
  };

  const info = [
    ['Employee', emp.name || '—'],
    ['Employee ID', emp.id || '—'],
    ['Role', emp.role || '—'],
    ['Date of joining', emp.joined ? new Date(`${emp.joined}T00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
    ['Days in month', String(r.days)],
    ['Paid days', `${r.paidDays}${r.lop ? ` (LOP ${r.lop})` : ''}`],
    ['Paid by', emp.payMode === 'Cash' ? 'Cash' : `${emp.payMode}${emp.last4 ? ` ····${emp.last4}` : ''}`],
    ['Pay month', mLabel || '—'],
  ];

  const fileName = `Salary-slip-${(emp.name || 'staff').trim().replace(/\s+/g, '-')}-${month || 'month'}.pdf`;

  const download = async () => {
    if (!biz.name.trim() || !emp.name.trim()) { alert('Add the business name and the employee name first'); return; }
    setBusy(true);
    track('tool_salary_slip_download', { format: 'pdf' });
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { SlipPDFDoc } = await import('./SlipPDF');
      const blob = await pdf(<SlipPDFDoc d={{ biz, emp: { info }, r, words, monthLabel: mLabel }} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Salary slip PDF failed:', err);
      alert('Could not make the PDF. Please use Print instead.');
    } finally {
      setBusy(false);
    }
  };

  const print = () => {
    const el = slipRef.current;
    if (!el) return;
    track('tool_salary_slip_download', { format: 'print' });
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${fileName.replace('.pdf', '')}</title><style>body{font-family:Arial,Helvetica,sans-serif;margin:32px;color:#1f2937}@media print{body{margin:12mm}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const nextStaff = () => {
    setEmp(BLANK_EMP);
    track('tool_salary_slip_next', {});
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const money = (k, label, hint) => (
    <div className="fld">
      <label className="lbl" htmlFor={`ss-${k}`}><span>{label}</span></label>
      <div className="inwrap rs"><span className="pre">₹</span>
        <input id={`ss-${k}`} className="inp" type="number" inputMode="numeric" min="0" value={emp[k]} onChange={setE(k)} />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
  const count = (k, label) => (
    <div className="fld">
      <label className="lbl" htmlFor={`ss-${k}`}><span>{label}</span></label>
      <input id={`ss-${k}`} className="inp" type="number" inputMode="numeric" min="0" max="31" value={emp[k]} onChange={setE(k)} />
    </div>
  );
  const text = (obj, setter, k, label, ph) => (
    <div className="fld">
      <label className="lbl" htmlFor={`ss-${k}`}><span>{label}</span></label>
      <input id={`ss-${k}`} className="inp" type="text" value={obj[k]} placeholder={ph} onChange={setter(k)} />
    </div>
  );

  const cell = { padding: '7px 10px', fontSize: '13px' };
  const rows = Math.max(r.earnings.length, r.deductions.length);
  const pad = (list) => [...list, ...Array(rows - list.length).fill(['', null])];

  return (
    <>
      <CommonHeader />
      <main className="tt ss">
        <div className="wrap">
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/tools">Free tools</Link> › Salary slip generator</nav>

          <header className="head">
            <h1>Salary Slip Generator</h1>
            <p className="lede">Make a salary slip for your cook, waiter or shop staff in a couple of minutes. Add your logo, enter the days and pay, and PF, ESI and leave cuts are worked out for you. Download the PDF or print it. Free, no signup.</p>
          </header>

          <div className="app" ref={formTop}>
            <section className="card" aria-label="Slip details">
              <h2 className="grp">Your business</h2>
              <div className="fields">
                {text(biz, setB, 'name', 'Business name', 'e.g. Sharma Dhaba')}
                <div className="fld">
                  <span className="lbl"><span>Logo (optional)</span></span>
                  <div className="logo-row">
                    <button type="button" className="btn ghost sm" onClick={() => logoRef.current?.click()}>{biz.logo ? 'Change logo' : 'Upload logo'}</button>
                    {biz.logo && <button type="button" className="linkbtn" onClick={() => setBiz((b) => ({ ...b, logo: null }))}>Remove</button>}
                    <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogo} hidden />
                  </div>
                </div>
                <div className="fld wide">{text(biz, setB, 'address', 'Address', 'Shop no., street, city')}</div>
              </div>

              <h2 className="grp">Employee</h2>
              <div className="fields">
                {text(emp, setE, 'name', 'Name', 'Full name')}
                {text(emp, setE, 'role', 'Role', 'Cook, waiter, cashier…')}
                {text(emp, setE, 'id', 'Employee ID', 'Optional')}
                <div className="fld">
                  <label className="lbl" htmlFor="ss-joined"><span>Date of joining</span></label>
                  <input id="ss-joined" className="inp" type="date" value={emp.joined} onChange={setE('joined')} />
                </div>
              </div>

              <h2 className="grp">Month and days</h2>
              <div className="fields">
                <div className="fld">
                  <label className="lbl" htmlFor="ss-month"><span>Pay month</span></label>
                  <input id="ss-month" className="inp" type="month" value={month} onChange={pickMonth} />
                </div>
                <div className="fld">
                  <label className="lbl" htmlFor="ss-days"><span>Days in month</span></label>
                  <input id="ss-days" className="inp" type="number" min="1" max="31" value={days} onChange={(e) => setDays(e.target.value)} />
                </div>
                {count('worked', 'Days worked')}
                {count('offs', 'Weekly offs & holidays')}
                {count('paidLeave', 'Paid leave taken')}
                <div className="fld">
                  <span className="lbl"><span>Leave without pay</span></span>
                  <div className="readout">{r.lop} {r.lop === 1 ? 'day' : 'days'}</div>
                  <p className="hint">Days not covered by work, offs or paid leave.</p>
                </div>
              </div>

              <h2 className="grp">Earnings for a full month</h2>
              <div className="fields">
                {money('basic', 'Basic pay')}
                {money('hra', 'HRA', 'House rent allowance, if you pay one')}
                {money('food', 'Food allowance', 'Leave blank if staff eat on duty')}
                {money('overtime', 'Overtime this month', 'Not cut for leave')}
                {money('incentive', 'Incentive / tips share', 'Not cut for leave')}
              </div>

              <h2 className="grp">Deductions</h2>
              <div className="checks">
                <label className="toggle"><input type="checkbox" checked={emp.pf} onChange={setE('pf')} /> PF at 12% of basic</label>
                {emp.pf && <label className="toggle sub"><input type="checkbox" checked={emp.pfCap} onChange={setE('pfCap')} /> Cap PF at ₹25,000 basic (₹3,000 max)</label>}
                <label className="toggle"><input type="checkbox" checked={emp.esi} onChange={setE('esi')} /> ESI at 0.75% of gross</label>
                {r.esiOver && <p className="hint warn">Gross pay is above ₹{nf.format(ESI_LIMIT)}, so ESI doesn’t apply and is left off.</p>}
              </div>
              <div className="fields">
                {money('pt', 'Professional tax', 'Depends on your state, e.g. ₹200 in Maharashtra')}
                {money('advance', 'Advance recovery', 'Part of an advance being paid back')}
                {money('other', 'Other deduction')}
                {text(emp, setE, 'otherLabel', 'Other deduction name', 'e.g. Uniform, breakage')}
              </div>

              <h2 className="grp">Payment</h2>
              <div className="fields">
                <div className="fld">
                  <label className="lbl" htmlFor="ss-mode"><span>Paid by</span></label>
                  <select id="ss-mode" className="inp" value={emp.payMode} onChange={setE('payMode')}>
                    <option>Bank</option><option>UPI</option><option>Cash</option>
                  </select>
                </div>
                {emp.payMode !== 'Cash' && (
                  <div className="fld">
                    <label className="lbl" htmlFor="ss-last4"><span>Last 4 digits of account</span></label>
                    <input id="ss-last4" className="inp" type="text" inputMode="numeric" maxLength={4} value={emp.last4} placeholder="Optional" onChange={setE('last4')} />
                    <p className="hint">Only the last 4 digits go on the slip.</p>
                  </div>
                )}
              </div>
            </section>

            <aside className="prev" aria-live="polite">
              <div className="paper" ref={slipRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '2px solid #111827' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {biz.logo && <img src={biz.logo} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827', overflowWrap: 'anywhere' }}>{biz.name || 'Your business name'}</div>
                    {biz.address && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', overflowWrap: 'anywhere' }}>{biz.address}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '12px', letterSpacing: '.08em', margin: '12px 0', color: '#111827' }}>
                  SALARY SLIP{mLabel ? ` · ${mLabel.toUpperCase()}` : ''}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', fontSize: '12.5px' }}>
                  <tbody>
                    {[0, 2, 4, 6].map((i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        {[info[i], info[i + 1]].map(([k, v]) => (
                          <td key={k} style={{ padding: '6px 8px', verticalAlign: 'top', width: '50%' }}>
                            <div style={{ color: '#6b7280', fontSize: '11px' }}>{k}</div>
                            <div style={{ fontWeight: 700, color: '#111827', overflowWrap: 'anywhere' }}>{v}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', marginTop: '12px', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>
                      <th style={{ ...cell, fontSize: '11px', textAlign: 'left', width: '30%' }}>Earnings</th>
                      <th style={{ ...cell, fontSize: '11px', textAlign: 'right', width: '20%', borderRight: '1px solid #e5e7eb' }}>₹</th>
                      <th style={{ ...cell, fontSize: '11px', textAlign: 'left', width: '30%' }}>Deductions</th>
                      <th style={{ ...cell, fontSize: '11px', textAlign: 'right', width: '20%' }}>₹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pad(r.earnings).map(([ek, ea], i) => {
                      const [dk, da] = pad(r.deductions)[i];
                      return (
                        <tr key={i}>
                          <td style={cell}>{ek}</td>
                          <td style={{ ...cell, textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>{ea == null ? '' : nf.format(ea)}</td>
                          <td style={cell}>{dk}</td>
                          <td style={{ ...cell, textAlign: 'right' }}>{da == null ? '' : nf.format(da)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ borderTop: '1px solid #e5e7eb', fontWeight: 800 }}>
                      <td style={cell}>Gross pay</td>
                      <td style={{ ...cell, textAlign: 'right', borderRight: '1px solid #e5e7eb' }}>{nf.format(r.gross)}</td>
                      <td style={cell}>Total deductions</td>
                      <td style={{ ...cell, textAlign: 'right' }}>{nf.format(r.totalDed)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', color: '#111827' }}>
                    <span>Net pay</span><span style={{ color: '#047857' }}>{rs(r.net)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>{words}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '40px', fontSize: '11px', color: '#6b7280' }}>
                  <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', flex: 1, textAlign: 'center' }}>Employee signature</div>
                  <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', flex: 1, textAlign: 'center' }}>For {biz.name || 'the business'}</div>
                </div>
              </div>

              <div className="acts">
                <button type="button" className="btn" onClick={download} disabled={busy}>{busy ? 'Making PDF…' : 'Download PDF'}</button>
                <button type="button" className="btn ghost" onClick={print}>Print</button>
              </div>
              <button type="button" className="next" onClick={nextStaff}>+ Make another slip for the next staff member</button>
              <p className="hint center">Your business details stay filled in. Nothing is uploaded or saved by us.</p>
            </aside>
          </div>

          <ToolCTA
            tool="salary-slip-generator"
            title="Stop making slips by hand every month"
            text="DineOpen tracks staff attendance on the same app you bill with, works out the month’s pay from it, and keeps advances on record. 7-day free trial."
          />

          <section className="sec" id="guide">
            <h2>What a salary slip should show</h2>
            <div className="prose">
              <p>A slip is the record of what you paid and why. If a staff member leaves on bad terms or a labour inspector asks, it is the first thing you’ll be asked for. Keep it simple, but don’t leave out:</p>
              <ul>
                <li>Your business name and address, and the employee’s name, role and joining date.</li>
                <li>The month, the days in it, and how many days you paid for. Write leave without pay separately so it isn’t argued over later.</li>
                <li>Every earning line and every deduction line, with gross pay, total deductions and net pay.</li>
                <li>How the money was paid: bank, UPI or cash.</li>
                <li>Two signatures: yours (or a stamp) and the employee’s.</li>
              </ul>

              <h3>PF and ESI, in plain words</h3>
              <p><strong>PF:</strong> the employee pays 12% of basic pay (plus DA if you pay any), and you add your own 12%. It is compulsory once you have 20 or more employees. Since 17 September 2026 the wage ceiling is ₹25,000 a month, up from ₹15,000, so the employee’s share tops out at ₹3,000 unless you both choose to pay on the full salary.</p>
              <p><strong>ESI:</strong> for staff whose gross pay is ₹21,000 a month or less, in places with 10 or more employees in most states. The employee pays 0.75% of gross and you pay 3.25%. Above ₹21,000, there’s no ESI on the slip.</p>
              <p>Only the employee’s share is deducted on the slip. Your share as the employer is paid on top and doesn’t reduce their pay.</p>

              <h3>Put every advance on paper</h3>
              <p>Most kitchens give staff advances, and most disputes start there. Write the advance down the day you give it, agree how much comes off each month, and show the recovery on the slip as its own line. When the slip shows “Advance recovery ₹2,000”, nobody has to remember who said what.</p>
              <p>For what cooks, waiters and helpers are paid in different cities, see our <Link href="/blog/restaurant-staff-salary-india.html">restaurant staff salary guide for India</Link>.</p>
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
            <h2>More for running your staff and shop</h2>
            <div className="related">
              <Link href="/blog/restaurant-staff-salary-india.html"><b>Staff salary guide</b><span>What cooks and waiters earn across India.</span></Link>
              <Link href="/tools/labor-cost-calculator"><b>Labour cost calculator</b><span>Is your staff bill too high for your sales?</span></Link>
              <Link href="/tools/restaurant-invoice-generator"><b>Restaurant bill generator</b><span>Make a GST bill with your logo.</span></Link>
            </div>
          </section>

          <section className="owner">
            <div>
              <h2>Attendance, pay and advances in one place</h2>
              <p>DineOpen’s staff module records who came in, works out salary from attendance, and keeps advances and deductions on record, on the same app you use for billing.</p>
              <ul>
                <li>7-day free trial</li>
                <li>Staff clock in from their phone</li>
                <li>Works on phone, tablet or computer</li>
              </ul>
            </div>
            <Link className="btn" href="/pricing" onClick={() => track('tool_cta_click', { tool: 'salary-slip-generator', where: 'footer' })}>See plans →</Link>
          </section>

          <p className="updated">Updated November 2026 · PF and ESI figures follow the rules in force from 17 September 2026. Check your state’s professional tax slab.</p>
        </div>
      </main>
      <InternalLinks currentPath="/tools/salary-slip-generator" variant="tool" />
      <Footer />
      <style jsx>{tipToolStyles}</style>
      <style jsx>{ssStyles}</style>
    </>
  );
}

const ssStyles = css.global`
  .ss .app{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .ss .grp{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:26px 0 12px}
  .ss .grp:first-child{margin-top:0}
  .ss .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .ss .fld{min-width:0}
  .ss .fld.wide{grid-column:1/-1}
  .ss .inwrap{position:relative;display:flex;align-items:center}
  .ss .inwrap.rs .inp{padding-left:30px}
  .ss .pre{position:absolute;left:13px;color:var(--muted);font-weight:700;pointer-events:none}
  .ss .hint{margin-top:5px}
  .ss .hint.warn{color:#b45309}
  .ss .hint.center{text-align:center}
  .ss .readout{border:1.5px dashed var(--line);border-radius:12px;padding:12px 14px;font-weight:700;color:var(--ink);background:var(--soft)}
  .ss .checks{display:grid;gap:10px;margin-bottom:14px}
  .ss .toggle.sub{margin-left:30px;font-weight:500}
  .ss .logo-row{display:flex;align-items:center;gap:12px;min-height:48px}
  .ss .btn.sm{padding:10px 14px;min-height:44px;font-size:14px}
  .ss .linkbtn{border:0;background:none;color:var(--red-d);font:inherit;font-weight:700;cursor:pointer;padding:0}
  .ss .prev{position:sticky;top:88px;min-width:0}
  .ss .paper{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px;color:#1f2937;box-shadow:0 1px 2px rgba(15,23,42,.04),0 20px 40px -28px rgba(15,23,42,.35);overflow-x:auto}
  .ss .acts{display:flex;gap:10px;margin-top:14px}
  .ss .acts .btn{flex:1}
  .ss .acts .btn:disabled{opacity:.6;cursor:wait}
  .ss .next{width:100%;margin-top:10px;border:1.5px dashed #fca5a5;background:var(--red-soft);color:var(--red-d);border-radius:12px;padding:12px;font:inherit;font-weight:700;cursor:pointer}
  .ss .prose ul{padding-left:20px}
  @media (max-width:860px){
    .ss .app{grid-template-columns:minmax(0,1fr)}
    .ss .prev{position:static}
  }
  @media (max-width:520px){
    .ss .fields{grid-template-columns:minmax(0,1fr)}
    .ss .paper{padding:14px}
  }
`;
