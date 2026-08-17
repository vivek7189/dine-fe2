'use client';
// Employee self-service — view today's meals, pre-book, show your QR, check wallet & history.
// Mobile-first. Resolves the employee from the logged-in phone (corporate-employee API).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { FaUtensils, FaQrcode, FaWallet, FaCheckCircle, FaClock, FaSpinner, FaSignOutAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';
import corporateApi from '../../lib/corporateApi';
import { C, money } from '../../corporate/theme';
import { useToast } from '../../components/corporate/ui';

function todayIST() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }

export default function MyMealsPage() {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState('loading'); // loading | ok | unregistered | unauth
  const [me, setMe] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState({ walletBalance: 0, recent: [] });
  const [tab, setTab] = useState('meals'); // meals | qr | wallet
  const [busy, setBusy] = useState('');
  const date = todayIST();

  const load = async () => {
    try {
      const meRes = await corporateApi.employee.me();
      setMe(meRes);
      const [mn, bk, wl] = await Promise.all([
        corporateApi.employee.menu().catch(() => ({ periods: [] })),
        corporateApi.employee.bookings({ date }).catch(() => ({ bookings: [] })),
        corporateApi.employee.wallet().catch(() => ({ walletBalance: meRes.employee?.walletBalance || 0, recent: [] })),
      ]);
      setPeriods(mn.periods || []);
      setBookings(bk.bookings || []);
      setWallet(wl);
      setState('ok');
    } catch (e) {
      if (e?.data?.code === 'NOT_REGISTERED' || e?.status === 404) setState('unregistered');
      else setState('unauth');
    }
  };

  useEffect(() => {
    if (!apiClient.isAuthenticated?.()) { setState('unauth'); return; }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bookedFor = (pid) => bookings.find((b) => b.periodId === pid && b.status === 'booked');

  const book = async (p) => {
    setBusy(p.id);
    try { await corporateApi.employee.book({ periodId: p.id, date }); toast.success(`Booked ${p.name}`); const bk = await corporateApi.employee.bookings({ date }); setBookings(bk.bookings || []); }
    catch (e) { toast.error(e?.data?.error || e.message || 'Could not book'); }
    finally { setBusy(''); }
  };
  const cancel = async (b) => {
    setBusy(b.id);
    try { await corporateApi.employee.cancel(b.id); toast.success('Booking cancelled'); const bk = await corporateApi.employee.bookings({ date }); setBookings(bk.bookings || []); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(''); }
  };

  if (state === 'loading') return <Center><FaSpinner size={22} color={C.primary} style={{ animation: 'spin 0.9s linear infinite' }} /></Center>;
  if (state === 'unauth') return <Center><Msg title="Please sign in" body="Log in with your phone to see your meals." cta="Go to login" onClick={() => router.replace('/login')} /></Center>;
  if (state === 'unregistered') return <Center><Msg title="No meal account" body="We couldn't find a meal account for your number. Ask your admin to add you." /></Center>;

  const emp = me.employee;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ background: C.grad, color: '#fff', padding: '20px 18px 22px', borderRadius: '0 0 22px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, opacity: 0.85 }}>{me.site?.name || 'Your canteen'}</div>
            <div style={{ fontSize: 21, fontWeight: 800 }}>Hi, {(emp.name || '').split(' ')[0]} 👋</div>
          </div>
          <button onClick={() => { apiClient.logout?.(); router.replace('/login'); }} title="Sign out" style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', width: 38, height: 38, borderRadius: 11, cursor: 'pointer' }}><FaSignOutAlt size={15} /></button>
        </div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.16)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaWallet size={16} />
          <div><div style={{ fontSize: 11, opacity: 0.85 }}>Wallet balance</div><div style={{ fontSize: 18, fontWeight: 800 }}>{money(wallet.walletBalance)}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 6px' }}>
        {[['meals', 'Meals', FaUtensils], ['qr', 'My QR', FaQrcode], ['wallet', 'History', FaWallet]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 11, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab === id ? C.primarySoft : '#fff', color: tab === id ? C.primary : C.muted, boxShadow: tab === id ? 'none' : C.shadow }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '8px 16px' }}>
        {tab === 'meals' && (
          periods.length === 0 ? <Blank text="No meals available today." /> :
          periods.map((p) => {
            const bk = bookedFor(p.id);
            return (
              <div key={p.id} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: C.shadow }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{p.name}</div>
                    <div style={{ fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><FaClock size={10} /> {p.startTime}–{p.endTime}</div>
                    {(p.menu || []).length > 0 && <div style={{ fontSize: 12.5, color: C.slate, marginTop: 6 }}>{(p.menu || []).map((m) => m.name).join(' · ')}</div>}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{money(p.price)}</div>
                </div>
                <div style={{ marginTop: 12 }}>
                  {bk ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.green, fontWeight: 700, fontSize: 13.5 }}><FaCheckCircle size={13} /> Booked</span>
                      <button onClick={() => cancel(bk)} disabled={busy === bk.id} style={{ marginLeft: 'auto', border: `1px solid ${C.border}`, background: '#fff', color: C.muted, borderRadius: 9, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => book(p)} disabled={busy === p.id} style={{ width: '100%', background: C.grad, color: '#fff', border: 'none', borderRadius: 11, padding: '11px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {busy === p.id ? <FaSpinner size={13} style={{ animation: 'spin 0.9s linear infinite' }} /> : null} Book this meal
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {tab === 'qr' && (
          <div style={{ textAlign: 'center', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginTop: 8, boxShadow: C.shadow }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{emp.name}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18 }}>{emp.empCode || emp.phone}</div>
            <div style={{ display: 'inline-block', padding: 16, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16 }}><QRCode value={emp.qrToken || 'x'} size={200} /></div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 16 }}>Show this at the counter to collect your meal.</div>
          </div>
        )}

        {tab === 'wallet' && (
          <div style={{ marginTop: 8 }}>
            {(wallet.recent || []).length === 0 ? <Blank text="No meals yet." /> :
              wallet.recent.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUtensils size={15} color={C.green} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>Meal · {r.date}</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>Subsidy {money(r.subsidyAmount)} · You paid {money(r.employeeCopay)}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{money(r.amount)}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Center({ children }) { return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>{children}</div>; }
function Blank({ text }) { return <div style={{ textAlign: 'center', color: C.faint, fontSize: 13.5, padding: '40px 0' }}>{text}</div>; }
function Msg({ title, body, cta, onClick }) {
  return (
    <div style={{ textAlign: 'center', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 30, maxWidth: 380 }}>
      <div style={{ width: 54, height: 54, borderRadius: 15, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><FaUtensils size={20} color={C.primary} /></div>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: C.muted, marginBottom: cta ? 18 : 0 }}>{body}</div>
      {cta && <button onClick={onClick} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: C.grad, color: '#fff', fontWeight: 700 }}>{cta}</button>}
    </div>
  );
}
