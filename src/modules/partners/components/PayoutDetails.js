'use client';

// Bank / payout details. Saved encrypted on the server; after saving only a masked view comes back
// (account number "•••• 6789"). The full numbers are never shown again in the portal.
import { useEffect, useState } from 'react';
import { Lock, Landmark, Globe2, Wallet, IndianRupee, ShieldCheck } from 'lucide-react';
import partnerApi from '../api';
import { date } from '../format';
import { Alert, Button, Card, EmptyState, Field, Loading, PageHeader, inputCls, textareaCls, cx } from './ui';

const METHODS = [
  ['bank', 'Bank transfer', Landmark], ['wise', 'Wise', Globe2], ['paypal', 'PayPal', Wallet], ['upi', 'UPI (India)', IndianRupee],
];
const FIELDS = {
  bank: [['accountName', 'Account holder name *'], ['bankName', 'Bank name'], ['accountNumber', 'Account number'], ['routingNumber', 'Routing / sort code / BSB'], ['swift', 'SWIFT / BIC'], ['iban', 'IBAN'], ['ifsc', 'IFSC (India)'], ['bankAddress', 'Bank address'], ['country', 'Country'], ['currency', 'Currency (e.g. USD)']],
  wise: [['accountName', 'Account holder name *'], ['wiseEmail', 'Wise e-mail'], ['currency', 'Currency (e.g. USD)']],
  paypal: [['accountName', 'Account holder name *'], ['paypalEmail', 'PayPal e-mail'], ['currency', 'Currency (e.g. USD)']],
  upi: [['accountName', 'Account holder name *'], ['upiId', 'UPI ID']],
};

export default function PayoutDetails() {
  const [saved, setSaved] = useState(undefined);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => { partnerApi.payoutDetails().then(r => setSaved(r.details)).catch(e => setMsg({ ok: '', err: e.message })); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg({ ok: '', err: '' });
    try {
      const r = await partnerApi.savePayoutDetails(form);
      setSaved(r.details); setForm(null);
      setMsg({ ok: 'Saved securely.', err: '' });
    } catch (err) { setMsg({ ok: '', err: err.message }); } finally { setBusy(false); }
  }
  const has = saved && !saved.unreadable;
  const methodName = (k) => (METHODS.find(m => m[0] === k) || [, k])[1];

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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <div className="flex-1"><div className="font-semibold text-slate-900">{methodName(saved.method)}</div><div className="text-xs text-slate-500">Updated {date(saved.updatedAt)}</div></div>
            <Button variant="secondary" size="sm" onClick={() => setForm({ method: saved.method || 'bank' })}>Replace</Button>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-5 pt-5 border-t border-slate-100 text-sm">
            {[['Account holder', saved.accountName], ['Bank', saved.bankName], ['Account', saved.accountNumber], ['IBAN', saved.iban], ['UPI', saved.upiId], ['PayPal', saved.paypalEmail], ['Wise', saved.wiseEmail], ['Country', saved.country], ['Currency', saved.currency]]
              .filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-800 mt-0.5">{v}</dd></div>))}
          </dl>
        </Card>
      )}

      {saved !== undefined && !has && !form && (
        <EmptyState icon={Landmark} title="No payout details yet" text="Add where you'd like to be paid. You can change it any time."
          action={<Button variant="brand" onClick={() => setForm({ method: 'bank' })}>Add payout details</Button>} />
      )}

      {form && (
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-5" autoComplete="off">
            <div>
              <div className="text-[13px] font-medium text-slate-700 mb-2">How should we pay you?</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {METHODS.map(([k, t, Icon]) => (
                  <button key={k} type="button" onClick={() => setForm({ method: k })}
                    className={cx('flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-[13px] font-medium transition',
                      form.method === k ? 'border-red-500 bg-red-50 text-red-700 ring-4 ring-red-500/10' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                    <Icon className="w-5 h-5" />{t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {FIELDS[form.method].map(([k, label]) => (
                <Field key={k} label={label} className={k === 'bankAddress' ? 'sm:col-span-2' : ''}>
                  <input className={inputCls} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} required={k === 'accountName'} maxLength={k === 'bankAddress' ? 500 : 120} autoComplete="off" />
                </Field>
              ))}
            </div>
            <Field label="Anything else we need (optional)"><textarea className={textareaCls} rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={500} /></Field>
            {msg.err && <Alert tone="error">{msg.err}</Alert>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button variant="brand" icon={Lock} busy={busy}>{busy ? 'Saving…' : 'Save securely'}</Button>
            </div>
          </form>
        </Card>
      )}
      {!form && msg.ok && <Alert tone="success" className="mt-4">{msg.ok}</Alert>}
      {!form && msg.err && <Alert tone="error" className="mt-4">{msg.err}</Alert>}
    </div>
  );
}
