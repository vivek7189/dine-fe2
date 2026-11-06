'use client';

// Bank / payout details. Saved encrypted on the server; after saving only a masked view comes back
// (account number "•••• 6789"). The full numbers are never shown again in the portal.
import { Fragment, useEffect, useState } from 'react';
import partnerApi from '../api';
import { date } from '../format';

const METHODS = [
  ['bank', 'Bank transfer'], ['wise', 'Wise'], ['paypal', 'PayPal'], ['upi', 'UPI (India)'],
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
  if (saved === undefined && !msg.err) return <div className="text-gray-500 text-sm">Loading…</div>;
  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        🔒 Your details are encrypted and only used to send your payouts. Please never send bank details by e-mail.
      </div>
      {saved && !saved.unreadable && !form && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
          <div className="font-bold text-gray-900 mb-2">Saved payout details</div>
          <dl className="grid grid-cols-2 gap-y-1">
            {[['Method', (METHODS.find(m => m[0] === saved.method) || [, saved.method])[1]], ['Account holder', saved.accountName], ['Bank', saved.bankName], ['Account', saved.accountNumber], ['IBAN', saved.iban], ['UPI', saved.upiId], ['PayPal', saved.paypalEmail], ['Wise', saved.wiseEmail], ['Country', saved.country], ['Currency', saved.currency]]
              .filter(([, v]) => v).map(([k, v]) => (<Fragment key={k}><dt className="text-gray-500">{k}</dt><dd className="font-semibold text-gray-800">{v}</dd></Fragment>))}
          </dl>
          <div className="text-xs text-gray-500 mt-2">Updated {date(saved.updatedAt)}</div>
          <button type="button" onClick={() => setForm({ method: saved.method || 'bank' })} className="mt-3 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold">Replace details</button>
        </div>
      )}
      {(!saved || saved.unreadable) && !form && (
        <button type="button" onClick={() => setForm({ method: 'bank' })} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold">Add payout details</button>
      )}
      {form && (
        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3" autoComplete="off">
          <div className="flex flex-wrap gap-2">
            {METHODS.map(([k, t]) => (
              <button key={k} type="button" onClick={() => setForm({ method: k })} className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${form.method === k ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}>{t}</button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {FIELDS[form.method].map(([k, label]) => (
              <input key={k} className={input} placeholder={label} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} required={k === 'accountName'} maxLength={k === 'bankAddress' ? 500 : 120} autoComplete="off" />
            ))}
          </div>
          <textarea className={input} rows={2} placeholder="Anything else we need (optional)" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={500} />
          <div className="flex gap-2">
            <button disabled={busy} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Save securely'}</button>
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancel</button>
          </div>
        </form>
      )}
      {msg.ok && <div className="text-sm text-green-700">{msg.ok}</div>}
      {msg.err && <div role="alert" className="text-sm text-red-700">{msg.err}</div>}
    </div>
  );
}
