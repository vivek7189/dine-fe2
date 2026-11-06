'use client';

import { useEffect, useState } from 'react';
import { Banknote, Receipt } from 'lucide-react';
import partnerApi from '../api';
import { money, date, Badge, COMMISSION_LABEL } from '../format';
import { Alert, Card, EmptyState, Loading, PageHeader } from './ui';

const PAYOUT_LABEL = {
  scheduled: { text: 'Being prepared', cls: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
  paid: { text: 'Paid', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  cancelled: { text: 'Cancelled', cls: 'bg-slate-50 text-slate-500 ring-slate-500/20', dot: 'bg-slate-400' },
};

const th = 'text-left text-xs font-medium text-slate-500 px-4 py-3 whitespace-nowrap';
const td = 'px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap';

export default function Earnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([partnerApi.commissions(), partnerApi.payouts()])
      .then(([c, p]) => setData({ commissions: c.commissions, payouts: p.payouts }))
      .catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader title="Earnings & payouts" subtitle="Every commission line and every payout we've sent you." />
      {error && <Alert tone="error">{error}</Alert>}
      {!error && !data && <Loading rows={3} />}
      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Payouts</h2>
            {!data.payouts.length ? <EmptyState icon={Banknote} title="No payouts yet" text="Once your commission is ready, we send it on the payout schedule and list it here." /> : (
              <Card className="overflow-x-auto">
                <table className="w-full"><thead className="bg-slate-50/80 border-b border-slate-100"><tr><th className={th}>Period</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Paid on</th><th className={th}>Reference</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{data.payouts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60"><td className={td}>{p.periodLabel || date(p.createdAt)}</td><td className={`${td} font-semibold text-slate-900 tabular-nums`}>{money(p.amountMinor, p.currency)}</td><td className={td}><Badge map={PAYOUT_LABEL} value={p.status} /></td><td className={td}>{date(p.paidAt)}</td><td className={`${td} text-slate-500`}>{p.method ? `${p.method} ` : ''}{p.reference || '—'}</td></tr>
                  ))}</tbody></table>
              </Card>
            )}
          </section>
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Commission per payment</h2>
            {!data.commissions.length ? <EmptyState icon={Receipt} title="No commission yet" text="You earn every time one of your clients pays. Each payment appears here." /> : (
              <Card className="overflow-x-auto">
                <table className="w-full"><thead className="bg-slate-50/80 border-b border-slate-100"><tr><th className={th}>Client</th><th className={th}>Paid on</th><th className={`${th} text-right`}>Client paid</th><th className={`${th} text-right`}>Excl. tax</th><th className={`${th} text-right`}>Rate</th><th className={`${th} text-right`}>You earn</th><th className={th}>Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{data.commissions.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className={td}><span className="font-medium text-slate-900">{c.clientName}</span>{c.planName ? <span className="text-xs text-slate-500"> · {c.planName}</span> : null}</td>
                      <td className={td}>{date(c.paidAt)}</td><td className={`${td} text-right tabular-nums`}>{money(c.grossMinor, c.currency)}</td><td className={`${td} text-right tabular-nums`}>{money(c.baseMinor, c.currency)}</td>
                      <td className={`${td} text-right tabular-nums`}>{c.rate}%</td><td className={`${td} text-right font-semibold text-slate-900 tabular-nums`}>{money(c.amountMinor, c.currency)}</td>
                      <td className={td}><Badge map={COMMISSION_LABEL} value={c.status} />{c.status === 'pending' ? <div className="text-[11px] text-slate-400 mt-1">ready {date(c.payableAt)}</div> : null}</td>
                    </tr>
                  ))}</tbody></table>
              </Card>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
