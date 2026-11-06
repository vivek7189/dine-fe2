'use client';

import { useEffect, useState } from 'react';
import partnerApi from '../api';
import { money, date, Badge, BILLING_LABEL } from '../format';

export default function Clients() {
  const [clients, setClients] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  useEffect(() => { partnerApi.clients().then(r => setClients(r.clients)).catch(e => setError(e.message)); }, []);
  if (error) return <div className="text-red-700 text-sm">{error}</div>;
  if (!clients) return <div className="text-gray-500 text-sm">Loading…</div>;

  const shown = clients.filter(c => (filter === 'all' ? true : filter === 'paying' ? c.paying : filter === 'trial' ? c.billingStatus === 'trial' : filter === 'unlinked' ? c.linkStatus !== 'active' : !c.paying && c.billingStatus !== 'trial' && c.linkStatus === 'active'))
    .filter(c => !q.trim() || String(c.name || '').toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {[['all', 'All'], ['paying', 'Paying'], ['trial', 'Free trial'], ['notpaying', 'Not paying'], ['unlinked', 'Unlinked']].map(([k, t]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${filter === k ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}>{t}</button>
        ))}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" className="ml-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40" />
      </div>
      {!shown.length && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">No clients here yet.</div>}
      <div className="grid gap-3">
        {shown.map(c => (
          <div key={c.id} className={`bg-white border border-gray-200 rounded-xl p-4 ${c.linkStatus !== 'active' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{c.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {c.outlets} outlet{c.outlets === 1 ? '' : 's'} · signed up {date(c.signedUpAt)} · linked {date(c.linkedAt)}{c.linkStatus !== 'active' ? ` · unlinked ${date(c.unlinkedAt)}` : ''}
                </div>
              </div>
              <Badge map={BILLING_LABEL} value={c.billingStatus} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
              <div><div className="text-xs text-gray-500">Plan</div><div className="font-semibold text-gray-800">{c.plan || '—'}</div></div>
              <div><div className="text-xs text-gray-500">{c.billingStatus === 'trial' ? 'Trial ends' : 'Renews'}</div><div className="font-semibold text-gray-800">{date(c.renewalDate)}</div></div>
              <div><div className="text-xs text-gray-500">Last payment</div><div className="font-semibold text-gray-800">{date(c.lastPaymentAt)}</div></div>
              <div><div className="text-xs text-gray-500">You earned</div><div className="font-semibold text-gray-800">{c.earned.length ? c.earned.map(e => money(e.totalMinor, e.currency)).join(' + ') : '—'}</div></div>
            </div>
            {c.commissionRate !== null && <div className="text-xs text-gray-500 mt-2">Special rate for this client: {c.commissionRate}%</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
