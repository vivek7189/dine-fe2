'use client';

import { useEffect, useState } from 'react';
import partnerApi from '../api';
import { money, date, Badge, COMMISSION_LABEL } from '../format';

const PAYOUT_LABEL = {
  scheduled: { text: 'Being prepared', cls: 'bg-blue-100 text-blue-800' },
  paid: { text: 'Paid', cls: 'bg-green-100 text-green-800' },
  cancelled: { text: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
};

export default function Earnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([partnerApi.commissions(), partnerApi.payouts()])
      .then(([c, p]) => setData({ commissions: c.commissions, payouts: p.payouts }))
      .catch(e => setError(e.message));
  }, []);
  if (error) return <div className="text-red-700 text-sm">{error}</div>;
  if (!data) return <div className="text-gray-500 text-sm">Loading…</div>;
  const th = 'text-left text-xs font-semibold text-gray-500 uppercase px-3 py-2';
  const td = 'px-3 py-2 text-sm text-gray-800 whitespace-nowrap';
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-bold text-gray-900 mb-2">Payouts</h3>
        {!data.payouts.length ? <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">No payouts yet.</div> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full"><thead className="bg-gray-50"><tr><th className={th}>Period</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Paid on</th><th className={th}>Reference</th></tr></thead>
              <tbody>{data.payouts.map(p => (
                <tr key={p.id} className="border-t border-gray-100"><td className={td}>{p.periodLabel || date(p.createdAt)}</td><td className={`${td} font-semibold`}>{money(p.amountMinor, p.currency)}</td><td className={td}><Badge map={PAYOUT_LABEL} value={p.status} /></td><td className={td}>{date(p.paidAt)}</td><td className={td}>{p.method ? `${p.method} ` : ''}{p.reference || ''}</td></tr>
              ))}</tbody></table>
          </div>
        )}
      </section>
      <section>
        <h3 className="font-bold text-gray-900 mb-2">Commission per payment</h3>
        {!data.commissions.length ? <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">No commission yet. You earn when your clients pay.</div> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full"><thead className="bg-gray-50"><tr><th className={th}>Client</th><th className={th}>Paid on</th><th className={th}>Client paid</th><th className={th}>Excl. tax</th><th className={th}>Rate</th><th className={th}>You earn</th><th className={th}>Status</th></tr></thead>
              <tbody>{data.commissions.map(c => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className={td}>{c.clientName}{c.planName ? <span className="text-xs text-gray-500"> · {c.planName}</span> : null}</td>
                  <td className={td}>{date(c.paidAt)}</td><td className={td}>{money(c.grossMinor, c.currency)}</td><td className={td}>{money(c.baseMinor, c.currency)}</td>
                  <td className={td}>{c.rate}%</td><td className={`${td} font-semibold`}>{money(c.amountMinor, c.currency)}</td>
                  <td className={td}><Badge map={COMMISSION_LABEL} value={c.status} />{c.status === 'pending' ? <div className="text-[11px] text-gray-500">ready {date(c.payableAt)}</div> : null}</td>
                </tr>
              ))}</tbody></table>
          </div>
        )}
      </section>
    </div>
  );
}
