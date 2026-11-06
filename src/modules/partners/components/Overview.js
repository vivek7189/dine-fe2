'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Store, BadgeCheck, Clock3, CircleSlash, Copy, Check, Mail, MessageCircle, ArrowRight, CalendarClock, Percent, Share2, UserPlus, Coins } from 'lucide-react';
import partnerApi from '../api';
import { money, date } from '../format';
import { Card, cx } from './ui';

const MODE_TEXT = (t) => (t.mode === 'first_payment'
  ? 'on each client\'s first payment'
  : t.months ? `on every payment for ${t.months} month${t.months > 1 ? 's' : ''} from the client's first payment` : 'on every payment for as long as the client pays');

const PIPE = [['new', 'New', 'bg-slate-400'], ['contacted', 'Contacted', 'bg-sky-500'], ['demo', 'Demo done', 'bg-violet-500'], ['won', 'Signed up', 'bg-emerald-500'], ['lost', 'Not interested', 'bg-slate-300']];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium text-slate-500">{label}</div>
        <div className={cx('w-8 h-8 rounded-lg flex items-center justify-center', tone)}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-[28px] font-semibold tracking-tight text-slate-900 mt-2 tabular-nums">{value}</div>
    </Card>
  );
}

export default function Overview({ data, go }) {
  const [copied, setCopied] = useState(false);
  const [leads, setLeads] = useState(null);
  const { counts, balances, terms, referralLink, productName, partner } = data;
  useEffect(() => { partnerApi.leads().then(r => setLeads(r.leads)).catch(() => setLeads([])); }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (_) { /* no clipboard */ }
  };
  const shareText = `Run your restaurant on ${productName} — POS, billing, inventory and more. Start here: ${referralLink}`;
  const firstName = String(partner.name || '').split(' ')[0];

  // Main earnings figure: first currency with any balance (USD for most partners).
  const b = balances[0];
  const earnedTotal = b ? b.pendingMinor + b.payableMinor + (b.scheduledMinor || 0) + b.paidMinor : 0;

  const leadCounts = Object.fromEntries(PIPE.map(([k]) => [k, (leads || []).filter(l => l.status === k).length]));
  const leadTotal = (leads || []).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{greeting()}{firstName ? `, ${firstName}` : ''}</h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s how your referrals are doing.</p>
        </div>
      </div>

      {/* Earnings hero */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-6 sm:p-8">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-red-600/30 blur-3xl" />
        <div className="absolute -bottom-32 left-10 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8">
          <div>
            <div className="text-sm text-white/60">Total earned{b ? ` (${b.currency})` : ''}</div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-tight mt-2 tabular-nums">{money(earnedTotal, b ? b.currency : (partner.payoutCurrency || 'USD'))}</div>
            {!b && <p className="text-sm text-white/60 mt-3 max-w-md">No commission yet. You start earning as soon as your first client pays for {productName}.</p>}
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 text-xs font-medium"><Percent className="w-3.5 h-3.5 text-red-300" />{terms.rate}% commission</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 text-xs font-medium"><CalendarClock className="w-3.5 h-3.5 text-red-300" />{String(terms.payoutSchedule || '').replace(/^./, c => c.toUpperCase())} payouts{terms.nextPayout ? ` · next ${date(terms.nextPayout)}` : ''}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            {[
              ['On hold', b ? b.pendingMinor : 0, `Ready ${terms.holdDays} days after the client pays`],
              ['Ready to pay', b ? b.payableMinor : 0],
              ['In next payout', b ? (b.scheduledMinor || 0) : 0],
              ['Paid to you', b ? b.paidMinor : 0],
            ].map(([l, v, hint]) => (
              <div key={l} className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 p-3.5" title={hint}>
                <div className="text-xs text-white/55">{l}</div>
                <div className="text-lg font-semibold mt-0.5 tabular-nums">{money(v, b ? b.currency : (partner.payoutCurrency || 'USD'))}</div>
              </div>
            ))}
          </div>
        </div>
        {balances.length > 1 && (
          <div className="relative mt-5 text-xs text-white/60">Also earning in: {balances.slice(1).map(x => `${money(x.pendingMinor + x.payableMinor + (x.scheduledMinor || 0) + x.paidMinor, x.currency)}`).join(' · ')} — see Earnings.</div>
        )}
        <p className="relative text-xs text-white/50 mt-6">You earn {terms.rate}% {MODE_TEXT(terms)}, excluding taxes.</p>
      </div>

      {/* Client stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Store} label="Active clients" value={counts.clients} tone="bg-slate-100 text-slate-600" />
        <Stat icon={BadgeCheck} label="Paying" value={counts.paying} tone="bg-emerald-50 text-emerald-600" />
        <Stat icon={Clock3} label="On free trial" value={counts.trial} tone="bg-sky-50 text-sky-600" />
        <Stat icon={CircleSlash} label="Not paying" value={counts.notPaying} tone="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.25fr] gap-6">
        {/* Leads pipeline */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Leads pipeline</h3>
              <p className="text-sm text-slate-500 mt-0.5">{leads === null ? 'Loading…' : `${leadTotal} restaurant${leadTotal === 1 ? '' : 's'} you're talking to`}</p>
            </div>
            <button type="button" onClick={() => go('leads')} className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></button>
          </div>
          {leadTotal > 0 && (
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mt-5">
              {PIPE.map(([k, , c]) => leadCounts[k] ? <div key={k} className={c} style={{ width: `${(leadCounts[k] / leadTotal) * 100}%` }} /> : null)}
            </div>
          )}
          <ul className="mt-5 space-y-2.5">
            {PIPE.map(([k, t, c]) => (
              <li key={k} className="flex items-center text-sm">
                <span className={cx('w-2 h-2 rounded-full mr-2.5', c)} />
                <span className="text-slate-600 flex-1">{t}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{leads === null ? '—' : leadCounts[k]}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Sign-up link */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900">Your sign-up link</h3>
          <p className="text-sm text-slate-500 mt-0.5">Restaurants that sign up through this link are linked to you automatically.</p>
          <div className="flex flex-col sm:flex-row gap-5 mt-5">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-1.5 h-11">
                <input readOnly value={referralLink} className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 focus:outline-none" onFocus={e => e.target.select()} aria-label="Your sign-up link" />
                <button type="button" onClick={copy} className={cx('shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium transition', copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800')}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50"><MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp</a>
                <a href={`mailto:?subject=${encodeURIComponent(`Try ${productName} for your restaurant`)}&body=${encodeURIComponent(shareText)}`} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50"><Mail className="w-4 h-4 text-slate-500" /> E-mail</a>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button type="button" onClick={() => navigator.share({ title: productName, text: shareText }).catch(() => {})} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50"><Share2 className="w-4 h-4 text-slate-500" /> Share</button>
                )}
              </div>
              <p className="text-xs text-slate-500">Already a {productName} customer? <button type="button" onClick={() => go('claims')} className="font-medium text-slate-700 hover:underline">Send a claim</button> and we&apos;ll link them to you.</p>
            </div>
            <div className="shrink-0 self-start rounded-xl border border-slate-200 p-3 bg-white" aria-label="QR code of your sign-up link">
              <QRCode value={referralLink} size={112} />
            </div>
          </div>
        </Card>
      </div>

      {/* How it works */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-5 mt-5">
          {[
            [Share2, 'Share your link', 'Send it to restaurants, or register a lead within 48 hours of first contact.'],
            [UserPlus, 'They sign up', `The restaurant starts on ${productName} and appears under Clients.`],
            [Coins, 'You get paid', `${terms.rate}% of what they pay, sent to you ${terms.payoutSchedule}.`],
          ].map(([Icon, t, d], i) => (
            <div key={t} className="flex gap-3.5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Icon className="w-[18px] h-[18px]" /></div>
              <div><div className="text-sm font-semibold text-slate-900"><span className="text-slate-400 mr-1">{i + 1}.</span>{t}</div><div className="text-sm text-slate-500 mt-0.5">{d}</div></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
