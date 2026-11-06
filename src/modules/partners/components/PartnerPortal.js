'use client';

// Partner portal shell: loads the dashboard, shows the navigation. Needs a partner token (else → login).
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Store, Wallet, Target, FileCheck2, Landmark, UserCircle2, LogOut } from 'lucide-react';
import partnerApi, { partnerToken } from '../api';
import Overview from './Overview';
import Clients from './Clients';
import Earnings from './Earnings';
import Leads from './Leads';
import Claims from './Claims';
import PayoutDetails from './PayoutDetails';
import Account from './Account';
import { Button, Loading, cx } from './ui';

const NAV = [
  ['overview', 'Overview', LayoutDashboard],
  ['clients', 'Clients', Store],
  ['leads', 'Leads', Target],
  ['earnings', 'Earnings & payouts', Wallet],
  ['claims', 'Claims', FileCheck2],
  ['payout', 'Payout details', Landmark],
  ['account', 'Account', UserCircle2],
];

function initials(s) {
  return String(s || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-red-600/30">D</div>
      <div className="text-[15px] font-semibold tracking-tight text-slate-900">DineOpen <span className="text-red-600">Partners</span></div>
    </div>
  );
}

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
    try { const t = new URLSearchParams(window.location.search).get('tab'); if (NAV.some(x => x[0] === t)) setTab(t); } catch (_) { /* no window */ }
    load();
  }, [router, load]);

  const go = (t) => {
    setTab(t);
    try { window.history.replaceState(null, '', t === 'overview' ? '/partner' : `/partner?tab=${t}`); window.scrollTo({ top: 0 }); } catch (_) { /* no window */ }
  };
  const logout = () => { partnerToken.clear(); router.replace('/partner/login'); };

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div><p className="text-slate-700">{error}</p><Button variant="secondary" className="mt-4" onClick={logout}>Back to login</Button></div>
    </div>
  );
  if (!data) return (
    <div className="min-h-screen bg-slate-50 p-6 lg:pl-72"><div className="max-w-5xl mx-auto pt-10"><Loading rows={4} /></div></div>
  );

  const p = data.partner;
  const who = p.company || p.name;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-5 border-b border-slate-100"><Logo /></div>
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Partner navigation">
          {NAV.map(([k, t, Icon]) => (
            <button key={k} type="button" onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}
              className={cx('w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition',
                tab === k ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
              <Icon className={cx('w-[18px] h-[18px]', tab === k ? 'text-red-600' : 'text-slate-400')} />{t}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">{initials(p.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-900 truncate" title={who}>{who}</div>
              <div className="text-xs text-slate-500 truncate">Code {p.code}</div>
            </div>
            <button type="button" onClick={logout} title="Log out" aria-label="Log out" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      {/* Top bar (mobile / tablet) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="h-14 px-4 flex items-center gap-3">
          <Logo />
          <button type="button" onClick={logout} className="ml-auto text-sm text-slate-600 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg hover:bg-slate-100"><LogOut className="w-4 h-4" /> Log out</button>
        </div>
        <nav className="px-2 pb-2 flex gap-1 overflow-x-auto scrollbar-hide" aria-label="Partner navigation">
          {NAV.map(([k, t, Icon]) => (
            <button key={k} type="button" onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}
              className={cx('shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium whitespace-nowrap',
                tab === k ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100')}>
              <Icon className="w-3.5 h-3.5" />{t}
            </button>
          ))}
        </nav>
      </header>

      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {tab === 'overview' && <Overview data={data} go={go} />}
          {tab === 'clients' && <Clients />}
          {tab === 'earnings' && <Earnings />}
          {tab === 'leads' && <Leads />}
          {tab === 'claims' && <Claims />}
          {tab === 'payout' && <PayoutDetails />}
          {tab === 'account' && <Account partner={p} />}
        </div>
      </main>
    </div>
  );
}
