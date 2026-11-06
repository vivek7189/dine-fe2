'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Store } from 'lucide-react';
import partnerApi from '../api';
import { money, date, Badge, BILLING_LABEL } from '../format';
import { Alert, Card, EmptyState, Loading, PageHeader, Segmented, inputCls, cx } from './ui';

const FILTERS = [['all', 'All'], ['paying', 'Paying'], ['trial', 'Free trial'], ['notpaying', 'Not paying'], ['unlinked', 'Unlinked']];
const match = (c, f) => (f === 'all' ? true : f === 'paying' ? c.paying : f === 'trial' ? c.billingStatus === 'trial' : f === 'unlinked' ? c.linkStatus !== 'active' : !c.paying && c.billingStatus !== 'trial' && c.linkStatus === 'active');

export default function Clients() {
  const [clients, setClients] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  useEffect(() => { partnerApi.clients().then(r => setClients(r.clients)).catch(e => setError(e.message)); }, []);

  const shown = useMemo(() => (clients || []).filter(c => match(c, filter))
    .filter(c => !q.trim() || String(c.name || '').toLowerCase().includes(q.trim().toLowerCase())), [clients, filter, q]);

  return (
    <div>
      <PageHeader title="Clients" subtitle="Restaurants linked to you, their plan and what you've earned from each." />
      {error && <Alert tone="error">{error}</Alert>}
      {!error && !clients && <Loading rows={4} />}
      {clients && !clients.length && (
        <EmptyState icon={Store} title="No clients yet" text="When a restaurant signs up with your link — or we approve your claim — it shows up here with its plan and payments." />
      )}
      {clients && clients.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <Segmented value={filter} onChange={setFilter} options={FILTERS.map(([k, t]) => [k, t, clients.filter(c => match(c, k)).length])} />
            </div>
            <div className="relative md:ml-auto md:w-64">
              <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clients" className={cx(inputCls, '!pl-9')} aria-label="Search clients" />
            </div>
          </div>
          {!shown.length ? <Card className="p-10 text-center text-sm text-slate-500">No clients here.</Card> : (
            <>
              {/* Table (desktop) */}
              <Card className="hidden md:block overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs font-medium text-slate-500 bg-slate-50/80 border-b border-slate-100">
                    <th className="px-5 py-3 font-medium">Restaurant</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Plan</th>
                    <th className="px-3 py-3 font-medium">Renews / trial ends</th><th className="px-3 py-3 font-medium">Last payment</th><th className="px-5 py-3 font-medium text-right">You earned</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {shown.map(c => (
                      <tr key={c.id} className={cx('hover:bg-slate-50/60', c.linkStatus !== 'active' && 'opacity-55')}>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{c.outlets} outlet{c.outlets === 1 ? '' : 's'} · signed up {date(c.signedUpAt)}{c.linkStatus !== 'active' ? ` · unlinked ${date(c.unlinkedAt)}` : ''}{c.commissionRate !== null ? ` · ${c.commissionRate}% rate` : ''}</div>
                        </td>
                        <td className="px-3 py-3.5"><Badge map={BILLING_LABEL} value={c.billingStatus} /></td>
                        <td className="px-3 py-3.5 text-slate-700">{c.plan || '—'}</td>
                        <td className="px-3 py-3.5 text-slate-700">{date(c.renewalDate)}</td>
                        <td className="px-3 py-3.5 text-slate-700">{date(c.lastPaymentAt)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">{c.earned.length ? c.earned.map(e => money(e.totalMinor, e.currency)).join(' + ') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              {/* Cards (mobile) */}
              <div className="md:hidden space-y-3">
                {shown.map(c => (
                  <Card key={c.id} className={cx('p-4', c.linkStatus !== 'active' && 'opacity-60')}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0"><div className="font-semibold text-slate-900 truncate">{c.name}</div><div className="text-xs text-slate-500 mt-0.5">{c.outlets} outlet{c.outlets === 1 ? '' : 's'} · signed up {date(c.signedUpAt)}</div></div>
                      <Badge map={BILLING_LABEL} value={c.billingStatus} />
                    </div>
                    <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div><dt className="text-xs text-slate-500">Plan</dt><dd className="font-medium text-slate-800">{c.plan || '—'}</dd></div>
                      <div><dt className="text-xs text-slate-500">{c.billingStatus === 'trial' ? 'Trial ends' : 'Renews'}</dt><dd className="font-medium text-slate-800">{date(c.renewalDate)}</dd></div>
                      <div><dt className="text-xs text-slate-500">Last payment</dt><dd className="font-medium text-slate-800">{date(c.lastPaymentAt)}</dd></div>
                      <div><dt className="text-xs text-slate-500">You earned</dt><dd className="font-semibold text-slate-900">{c.earned.length ? c.earned.map(e => money(e.totalMinor, e.currency)).join(' + ') : '—'}</dd></div>
                    </dl>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
