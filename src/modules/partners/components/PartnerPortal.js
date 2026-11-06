'use client';

// Partner portal shell: loads the dashboard, shows the tabs. Needs a partner token (else → login).
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import partnerApi, { partnerToken } from '../api';
import Overview from './Overview';
import Clients from './Clients';
import Earnings from './Earnings';
import Leads from './Leads';
import Claims from './Claims';
import PayoutDetails from './PayoutDetails';
import Account from './Account';

const TABS = [['overview', 'Overview'], ['clients', 'Clients'], ['earnings', 'Earnings & payouts'], ['leads', 'Leads'], ['claims', 'Claims'], ['payout', 'Payout details'], ['account', 'Account']];

export default function PartnerPortal() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const load = useCallback(() => {
    partnerApi.me().then(setData).catch(e => setError(e.message));
  }, []);
  useEffect(() => {
    if (!partnerToken.get()) { router.replace('/partner/login'); return; }
    try { const t = new URLSearchParams(window.location.search).get('tab'); if (TABS.some(x => x[0] === t)) setTab(t); } catch (_) { /* no window */ }
    load();
  }, [router, load]);

  const go = (t) => { setTab(t); try { window.history.replaceState(null, '', t === 'overview' ? '/partner' : `/partner?tab=${t}`); } catch (_) { /* no window */ } };
  const logout = () => { partnerToken.clear(); router.replace('/partner/login'); };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <div><p className="text-gray-700">{error}</p><button type="button" onClick={logout} className="mt-4 text-red-600 underline text-sm">Back to login</button></div>
    </div>
  );
  if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-extrabold text-gray-900">DineOpen <span className="text-red-600">Partners</span></div>
          <div className="ml-auto text-right">
            <div className="text-sm font-semibold text-gray-900">{data.partner.company || data.partner.name}</div>
            <div className="text-xs text-gray-500">Code {data.partner.code}</div>
          </div>
          <button type="button" onClick={logout} className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5">Log out</button>
        </div>
        <nav className="max-w-6xl mx-auto px-2 flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map(([k, t]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => go(k)}
              className={`px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 ${tab === k ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600'}`}>{t}</button>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-5">
        {tab === 'overview' && <Overview data={data} />}
        {tab === 'clients' && <Clients />}
        {tab === 'earnings' && <Earnings />}
        {tab === 'leads' && <Leads />}
        {tab === 'claims' && <Claims />}
        {tab === 'payout' && <PayoutDetails />}
        {tab === 'account' && <Account partner={data.partner} />}
      </main>
    </div>
  );
}
