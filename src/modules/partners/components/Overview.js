'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { money, date } from '../format';

function Card({ label, value, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-extrabold text-gray-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

const MODE_TEXT = (t) => (t.mode === 'first_payment'
  ? 'on each client\'s first payment'
  : t.months ? `on every payment for ${t.months} month${t.months > 1 ? 's' : ''} from the client's first payment` : 'on every payment for as long as the client pays');

export default function Overview({ data }) {
  const [copied, setCopied] = useState(false);
  const { counts, balances, terms, referralLink, productName } = data;
  const copy = async () => {
    try { await navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (_) { /* no clipboard */ }
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Active clients" value={counts.clients} />
        <Card label="Paying" value={counts.paying} />
        <Card label="On free trial" value={counts.trial} />
        <Card label="Not paying" value={counts.notPaying} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900">Your earnings</h3>
        {!balances.length && <p className="text-sm text-gray-500 mt-2">No commission yet. You earn when your clients pay for {productName}.</p>}
        {balances.map(b => (
          <div key={b.currency} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <Card label={`On hold (${b.currency})`} value={money(b.pendingMinor, b.currency)} hint={`Becomes ready ${terms.holdDays} days after the client pays`} />
            <Card label="Ready to pay" value={money(b.payableMinor, b.currency)} />
            <Card label="In next payout" value={money(b.scheduledMinor, b.currency)} />
            <Card label="Paid to you" value={money(b.paidMinor, b.currency)} />
          </div>
        ))}
        <p className="text-sm text-gray-600 mt-4">
          You earn <b>{terms.rate}%</b> {MODE_TEXT(terms)} (excluding taxes). Payouts: <b>{terms.payoutSchedule}</b>
          {terms.nextPayout ? <> — next around <b>{date(terms.nextPayout)}</b></> : null}.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">Your sign-up link</h3>
          <p className="text-sm text-gray-600 mt-1">Share it with restaurants. Anyone who signs up through it is linked to you automatically.</p>
          <div className="mt-3 flex gap-2">
            <input readOnly value={referralLink} className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" onFocus={e => e.target.select()} />
            <button type="button" onClick={copy} className="px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold">{copied ? 'Copied' : 'Copy'}</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Already a {productName} customer? Use <b>Claims</b> to ask us to link them to you.</p>
        </div>
        <div className="bg-white p-2 border border-gray-200 rounded-lg" aria-label="QR code of your sign-up link">
          <QRCode value={referralLink} size={128} />
        </div>
      </div>
    </div>
  );
}
