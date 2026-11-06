'use client';

// Bank / payout details, by country (US ACH/wire, Canada, India, UK, IBAN countries, Australia, …).
// Saved encrypted on the server; after saving only a masked view comes back (account "•••• 6789").
import { useEffect, useMemo, useState } from 'react';
import { Lock, Landmark, Globe2, Wallet, IndianRupee, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import partnerApi from '../api';
import { date } from '../format';
import { Alert, Button, Card, EmptyState, Field, Loading, PageHeader, inputCls, textareaCls, cx } from './ui';

// ── validators (mirrors the server; the server is the final check) ──
const compact = (v) => String(v || '').replace(/[\s.-]/g, '').toUpperCase();
function ibanOk(v) {
  const s = compact(v);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let m = 0; for (const ch of r) m = (m * 10 + Number(ch)) % 97;
  return m === 1;
}
const abaOk = (v) => { const s = compact(v); return /^\d{9}$/.test(s) && (3 * (+s[0] + +s[3] + +s[6]) + 7 * (+s[1] + +s[4] + +s[7]) + (+s[2] + +s[5] + +s[8])) % 10 === 0; };
const re = (rx) => (v) => rx.test(compact(v));
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

const F = {
  accountNumber: { label: 'Account number', check: re(/^[A-Z0-9]{4,34}$/), msg: 'Account number looks wrong', mode: 'numeric' },
  routingNumber: { label: 'Routing number (ABA)', hint: '9 digits, on your checks / bank app', check: abaOk, msg: 'Routing number must be a valid 9-digit ABA number', mode: 'numeric', ph: '021000021' },
  accountType: { label: 'Account type', type: 'select', options: [['checking', 'Checking'], ['savings', 'Savings']] },
  institutionNumber: { label: 'Institution number', hint: '3 digits', check: re(/^\d{3}$/), msg: 'Institution number must be 3 digits', mode: 'numeric', ph: '003' },
  transitNumber: { label: 'Transit (branch) number', hint: '5 digits', check: re(/^\d{5}$/), msg: 'Transit number must be 5 digits', mode: 'numeric', ph: '12345' },
  ifsc: { label: 'IFSC code', hint: '11 characters, e.g. HDFC0001234', check: re(/^[A-Z]{4}0[A-Z0-9]{6}$/), msg: 'IFSC must look like HDFC0001234', upper: true, ph: 'HDFC0001234' },
  sortCode: { label: 'Sort code', hint: '6 digits', check: re(/^\d{6}$/), msg: 'Sort code must be 6 digits', mode: 'numeric', ph: '12-34-56' },
  bsb: { label: 'BSB', hint: '6 digits', check: re(/^\d{6}$/), msg: 'BSB must be 6 digits', mode: 'numeric', ph: '062-000' },
  iban: { label: 'IBAN', check: ibanOk, msg: 'IBAN looks wrong — please check it', upper: true, ph: 'DE89 3704 0044 0532 0130 00' },
  swift: { label: 'SWIFT / BIC', hint: '8 or 11 characters', check: re(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/), msg: 'SWIFT / BIC must be 8 or 11 characters', upper: true, ph: 'CHASUS33' },
  bankCode: { label: 'Bank / branch code', hint: 'If your bank uses one' },
  bankName: { label: 'Bank name' },
  bankAddress: { label: 'Bank address', wide: true },
};

// Country → currency + which bank fields (required ones end with "*").
const IBAN_EU = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK'];
const COUNTRIES = [
  ['US', 'United States', '🇺🇸', 'USD', ['routingNumber*', 'accountNumber*', 'accountType*', 'bankName', 'swift']],
  ['CA', 'Canada', '🇨🇦', 'CAD', ['institutionNumber*', 'transitNumber*', 'accountNumber*', 'bankName', 'swift']],
  ['IN', 'India', '🇮🇳', 'INR', ['accountNumber*', 'ifsc*', 'bankName', 'swift']],
  ['GB', 'United Kingdom', '🇬🇧', 'GBP', ['sortCode*', 'accountNumber*', 'bankName', 'iban', 'swift']],
  ['AU', 'Australia', '🇦🇺', 'AUD', ['bsb*', 'accountNumber*', 'bankName', 'swift']],
  ['AE', 'United Arab Emirates', '🇦🇪', 'AED', ['iban*', 'swift*', 'bankName']],
  ['SA', 'Saudi Arabia', '🇸🇦', 'SAR', ['iban*', 'swift*', 'bankName']],
  ['QA', 'Qatar', '🇶🇦', 'QAR', ['iban*', 'swift*', 'bankName']],
  ['KE', 'Kenya', '🇰🇪', 'KES', ['accountNumber*', 'bankName*', 'bankCode', 'swift*']],
  ['NG', 'Nigeria', '🇳🇬', 'NGN', ['accountNumber*', 'bankName*', 'bankCode', 'swift']],
  ['ZA', 'South Africa', '🇿🇦', 'ZAR', ['accountNumber*', 'bankName*', 'bankCode*', 'swift']],
  ['SG', 'Singapore', '🇸🇬', 'SGD', ['accountNumber*', 'bankName*', 'bankCode', 'swift*']],
  ...IBAN_EU.map(c => [c, new Intl.DisplayNames(['en'], { type: 'region' }).of(c), '🇪🇺', 'EUR', ['iban*', 'swift', 'bankName']]),
  ['CH', 'Switzerland', '🇨🇭', 'CHF', ['iban*', 'swift', 'bankName']],
  ['XX', 'Other country', '🌍', '', ['accountNumber', 'iban', 'swift*', 'bankName*', 'bankCode', 'bankAddress']],
].sort((a, b) => (a[0] === 'XX' ? 1 : b[0] === 'XX' ? -1 : 0));
const COUNTRY = Object.fromEntries(COUNTRIES.map(c => [c[0], c]));
const PINNED = ['US', 'CA', 'IN', 'GB', 'AU', 'AE'];

const METHODS = [
  ['bank', 'Bank transfer', Landmark, 'Direct to your bank account'],
  ['wise', 'Wise', Globe2, 'Fast, low-fee international'],
  ['paypal', 'PayPal', Wallet, 'To your PayPal e-mail'],
  ['upi', 'UPI', IndianRupee, 'India only'],
];

function flag(code) {
  if (!code || code === 'XX' || code.length !== 2) return '🌍';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

function TextField({ name, spec, required, form, setForm, touched, onBlur }) {
  const v = form[name] || '';
  const bad = v && spec.check && !spec.check(v);
  const showErr = bad && touched[name];
  const good = v && spec.check && !bad;
  return (
    <Field label={`${spec.label}${required ? ' *' : ''}`} className={spec.wide ? 'sm:col-span-2' : ''}>
      {spec.type === 'select' ? (
        <select className={inputCls} value={v} onChange={e => setForm({ ...form, [name]: e.target.value })} required={required}>
          <option value="">Choose…</option>
          {spec.options.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </select>
      ) : (
        <div className="relative">
          <input className={cx(inputCls, '!pr-9 font-mono tracking-wide', showErr && '!border-red-400 focus:!border-red-400', spec.upper && 'uppercase')}
            value={v} placeholder={spec.ph || ''} inputMode={spec.mode} autoComplete="off" spellCheck={false}
            onChange={e => setForm({ ...form, [name]: e.target.value })} onBlur={() => onBlur(name)} required={required} maxLength={spec.wide ? 500 : 64} />
          {good && <CheckCircle2 className="absolute z-10 right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
          {showErr && <AlertCircle className="absolute z-10 right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
        </div>
      )}
      {showErr ? <span className="block text-xs text-red-600 mt-1.5">{spec.msg}</span> : spec.hint ? <span className="block text-xs text-slate-500 mt-1.5">{spec.hint}</span> : null}
    </Field>
  );
}

const LABELS = {
  accountName: 'Account holder', accountHolderType: 'Holder type', bankName: 'Bank', accountNumber: 'Account', accountType: 'Account type',
  routingNumber: 'Routing (ABA)', institutionNumber: 'Institution', transitNumber: 'Transit', sortCode: 'Sort code', bsb: 'BSB', ifsc: 'IFSC',
  iban: 'IBAN', swift: 'SWIFT / BIC', bankCode: 'Bank code', upiId: 'UPI ID', paypalEmail: 'PayPal', wiseEmail: 'Wise', currency: 'Currency',
};

export default function PayoutDetails() {
  const [saved, setSaved] = useState(undefined);
  const [form, setForm] = useState(null);
  const [touched, setTouched] = useState({});
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => { partnerApi.payoutDetails().then(r => setSaved(r.details)).catch(e => setMsg({ ok: '', err: e.message })); }, []);

  const country = form ? COUNTRY[form.country] : null;
  const bankFields = useMemo(() => (country ? country[4].map(f => [f.replace('*', ''), f.endsWith('*')]) : []), [country]);
  const methods = METHODS.filter(([k]) => k !== 'upi' || !form || form.country === 'IN');

  const start = (base = {}) => { setTouched({}); setMsg({ ok: '', err: '' }); setForm({ method: 'bank', country: 'US', currency: 'USD', accountHolderType: 'individual', accountType: 'checking', ...base }); };
  const pickCountry = (c) => {
    const def = COUNTRY[c];
    setTouched({});
    setForm(f => ({ method: f.method === 'upi' && c !== 'IN' ? 'bank' : f.method, country: c, currency: def ? def[3] || f.currency : f.currency,
      accountName: f.accountName, accountHolderType: f.accountHolderType, holderAddress: f.holderAddress, paypalEmail: f.paypalEmail, wiseEmail: f.wiseEmail,
      accountType: c === 'US' ? (f.accountType || 'checking') : undefined }));
  };

  function problems() {
    const list = [];
    if (!String(form.accountName || '').trim()) list.push('Account holder name');
    if (form.method === 'bank') {
      for (const [k, req] of bankFields) {
        const v = form[k];
        if (req && !String(v || '').trim()) list.push(F[k].label);
        else if (v && F[k].check && !F[k].check(v)) list.push(F[k].label);
      }
      if (form.country === 'XX' && !form.accountNumber && !form.iban) list.push('Account number or IBAN');
    }
    if (form.method === 'paypal' && !emailOk(form.paypalEmail)) list.push('PayPal e-mail');
    if (form.method === 'wise' && !emailOk(form.wiseEmail)) list.push('Wise e-mail');
    if (form.method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(String(form.upiId || '').trim())) list.push('UPI ID');
    return list;
  }

  async function submit(e) {
    e.preventDefault();
    const p = problems();
    if (p.length) { setTouched(Object.fromEntries(Object.keys(F).map(k => [k, true]))); setMsg({ ok: '', err: `Please check: ${p.join(', ')}` }); return; }
    setBusy(true); setMsg({ ok: '', err: '' });
    // Send only what this method / country uses.
    const keep = new Set(['method', 'country', 'currency', 'accountName', 'accountHolderType', 'holderAddress', 'notes',
      ...(form.method === 'bank' ? bankFields.map(([k]) => k).concat(form.country === 'US' ? ['accountType'] : []) : []),
      ...(form.method === 'paypal' ? ['paypalEmail'] : []), ...(form.method === 'wise' ? ['wiseEmail'] : []), ...(form.method === 'upi' ? ['upiId'] : [])]);
    const body = Object.fromEntries(Object.entries(form).filter(([k, v]) => keep.has(k) && v !== undefined && v !== ''));
    if (body.country === 'XX') delete body.country;
    try {
      const r = await partnerApi.savePayoutDetails(body);
      setSaved(r.details); setForm(null);
      setMsg({ ok: 'Saved securely.', err: '' });
    } catch (err) { setMsg({ ok: '', err: err.message }); } finally { setBusy(false); }
  }

  const has = saved && !saved.unreadable;
  const methodName = (k) => (METHODS.find(m => m[0] === k) || [, k])[1];
  const savedCountry = has && saved.country ? COUNTRY[saved.country] : null;
  const touch = (k) => setTouched(t => ({ ...t, [k]: true }));

  return (
    <div className="max-w-3xl">
      <PageHeader title="Payout details" subtitle="Where we send your commission." />
      <div className="flex gap-3 items-start rounded-2xl bg-slate-900 text-white p-4 sm:p-5 mb-6">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center"><Lock className="w-4 h-4 text-emerald-300" /></div>
        <div className="text-sm"><div className="font-medium">Encrypted and private</div><div className="text-white/60 mt-0.5">Your details are encrypted and only used to send your payouts. Please never send bank details by e-mail.</div></div>
      </div>

      {saved === undefined && !msg.err && <Loading rows={2} />}

      {has && !form && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900">{methodName(saved.method)}{savedCountry ? <span className="text-slate-500 font-normal"> · {flag(saved.country)} {savedCountry[1]}</span> : null}</div>
              <div className="text-xs text-slate-500">Updated {date(saved.updatedAt)}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => start({ method: saved.method || 'bank', country: COUNTRY[saved.country] ? saved.country : 'US', currency: saved.currency || 'USD', accountHolderType: saved.accountHolderType || 'individual' })}>Replace</Button>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-5 pt-5 border-t border-slate-100 text-sm">
            {Object.keys(LABELS).filter(k => saved[k]).map(k => (
              <div key={k}><dt className="text-xs text-slate-500">{LABELS[k]}</dt><dd className={cx('font-medium text-slate-800 mt-0.5 break-all', !['accountName', 'accountHolderType', 'accountType', 'bankName', 'currency'].includes(k) && 'font-mono tracking-wide')}>{k === 'accountHolderType' || k === 'accountType' ? String(saved[k]).replace(/^./, c => c.toUpperCase()) : saved[k]}</dd></div>
            ))}
          </dl>
        </Card>
      )}

      {saved !== undefined && !has && !form && (
        <EmptyState icon={Landmark} title="No payout details yet" text="Add where you'd like to be paid. You can change it any time."
          action={<Button variant="brand" onClick={() => start()}>Add payout details</Button>} />
      )}

      {form && (
        <form onSubmit={submit} className="space-y-5" autoComplete="off" noValidate>
          {/* 1. Country + currency */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4"><span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">1</span><h2 className="font-semibold text-slate-900">Where is your account?</h2></div>
            <div className="flex flex-wrap gap-2 mb-4">
              {PINNED.map(c => (
                <button key={c} type="button" onClick={() => pickCountry(c)}
                  className={cx('inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-[13px] font-medium transition',
                    form.country === c ? 'border-red-500 bg-red-50 text-red-700 ring-4 ring-red-500/10' : 'border-slate-200 text-slate-700 hover:border-slate-300')}>
                  <span className="text-base leading-none">{flag(c)}</span>{COUNTRY[c][1]}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-[1fr_160px] gap-4">
              <Field label="Bank country">
                <select className={inputCls} value={form.country} onChange={e => pickCountry(e.target.value)}>
                  {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{c === 'XX' ? '🌍' : flag(c)}  {n}</option>)}
                </select>
              </Field>
              <Field label="Payout currency">
                <input className={cx(inputCls, 'uppercase font-mono')} value={form.currency || ''} maxLength={3} placeholder="USD" onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })} />
              </Field>
            </div>
          </Card>

          {/* 2. Method */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4"><span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">2</span><h2 className="font-semibold text-slate-900">How should we pay you?</h2></div>
            <div className={cx('grid gap-2', methods.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3')}>
              {methods.map(([k, t, Icon, sub]) => (
                <button key={k} type="button" onClick={() => setForm({ ...form, method: k })}
                  className={cx('flex items-start gap-3 text-left rounded-xl border px-3.5 py-3 transition',
                    form.method === k ? 'border-red-500 bg-red-50 ring-4 ring-red-500/10' : 'border-slate-200 hover:border-slate-300')}>
                  <Icon className={cx('w-5 h-5 mt-0.5 shrink-0', form.method === k ? 'text-red-600' : 'text-slate-400')} />
                  <span><span className={cx('block text-sm font-medium', form.method === k ? 'text-red-700' : 'text-slate-800')}>{t}</span><span className="block text-xs text-slate-500 mt-0.5">{sub}</span></span>
                </button>
              ))}
            </div>
          </Card>

          {/* 3. Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4"><span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">3</span><h2 className="font-semibold text-slate-900">Account details</h2></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Account holder name *" hint="Exactly as on the bank account">
                <input className={inputCls} value={form.accountName || ''} onChange={e => setForm({ ...form, accountName: e.target.value })} required maxLength={120} autoComplete="off" />
              </Field>
              <Field label="Account holder is">
                <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-xl p-1 h-10">
                  {[['individual', 'Individual'], ['business', 'Business']].map(([k, t]) => (
                    <button key={k} type="button" onClick={() => setForm({ ...form, accountHolderType: k })}
                      className={cx('rounded-lg text-[13px] font-medium', form.accountHolderType === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>{t}</button>
                  ))}
                </div>
              </Field>

              {form.method === 'bank' && bankFields.map(([k, req]) => (
                <TextField key={k} name={k} spec={F[k]} required={req} form={form} setForm={setForm} touched={touched} onBlur={touch} />
              ))}
              {form.method === 'bank' && form.country === 'US' && !bankFields.some(([k]) => k === 'accountType') && (
                <TextField name="accountType" spec={F.accountType} required form={form} setForm={setForm} touched={touched} onBlur={touch} />
              )}
              {form.method === 'paypal' && <Field label="PayPal e-mail *" className="sm:col-span-2"><input className={inputCls} type="email" value={form.paypalEmail || ''} onChange={e => setForm({ ...form, paypalEmail: e.target.value })} required /></Field>}
              {form.method === 'wise' && <Field label="Wise e-mail *" hint="The e-mail of your Wise account" className="sm:col-span-2"><input className={inputCls} type="email" value={form.wiseEmail || ''} onChange={e => setForm({ ...form, wiseEmail: e.target.value })} required /></Field>}
              {form.method === 'upi' && <Field label="UPI ID *" className="sm:col-span-2"><input className={cx(inputCls, 'font-mono')} value={form.upiId || ''} placeholder="name@bank" onChange={e => setForm({ ...form, upiId: e.target.value })} required /></Field>}

              {form.method === 'bank' && (
                <Field label="Account holder address" hint="Needed by most banks for international transfers" className="sm:col-span-2">
                  <textarea className={textareaCls} rows={2} value={form.holderAddress || ''} placeholder="Street, city, state / province, postal code" onChange={e => setForm({ ...form, holderAddress: e.target.value })} maxLength={500} />
                </Field>
              )}
              <Field label="Anything else we need (optional)" className="sm:col-span-2"><textarea className={textareaCls} rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={500} /></Field>
            </div>
          </Card>

          {msg.err && <Alert tone="error">{msg.err}</Alert>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => { setForm(null); setMsg({ ok: '', err: '' }); }}>Cancel</Button>
            <Button variant="brand" icon={Lock} busy={busy}>{busy ? 'Saving…' : 'Save securely'}</Button>
          </div>
        </form>
      )}
      {!form && msg.ok && <Alert tone="success" className="mt-4">{msg.ok}</Alert>}
      {!form && msg.err && <Alert tone="error" className="mt-4">{msg.err}</Alert>}
    </div>
  );
}
