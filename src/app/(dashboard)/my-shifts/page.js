'use client';

// My Shifts & Leave — staff self-service (web port of dine-app (tabs)/my-shifts.js, plus leave).
//  • Shifts: my shifts (next 4 weeks) + ask a colleague to swap, swap requests for me, open shifts to pick up
//  • Leave: balances, apply, my requests (cancel while pending)
//  • Availability: which days/hours I can work (up to 2 time slots a day) + dates I can't
// Manager approvals (claims / swaps / extra pay) live on the full /shifts page, not here.

import { useCallback, useEffect, useState } from 'react';
import { FaSyncAlt, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import apiClient from '../../../lib/api';

const DAYS = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']];
const FULL = { mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday' };
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nice = (s) => {
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return String(s || '');
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};
const t12 = (t) => {
  const [h, m] = String(t || '').split(':').map(Number);
  if (Number.isNaN(h)) return t || '';
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'pm' : 'am'}`;
};
const cap = (r) => String(r || '').replace(/\b\w/g, c => c.toUpperCase());
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// A day's time slots (max 2). Days saved before slots existed have one: startTime–endTime.
const daySlots = (d) => {
  const ok = (x) => x && TIME_RE.test(x.startTime || '') && TIME_RE.test(x.endTime || '');
  const list = Array.isArray(d?.slots) && d.slots.filter(ok).length ? d.slots.filter(ok) : [{ startTime: d?.startTime || '09:00', endTime: d?.endTime || '22:00' }];
  return list.slice(0, 2).map(x => ({ startTime: x.startTime, endTime: x.endTime }));
};
const toM = (t) => { const [h, m] = String(t || '').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const slotsOverlap = ([a, b]) => {
  if (!a || !b) return false;
  const span = (x) => { const s1 = toM(x.startTime); let e1 = toM(x.endTime); if (e1 <= s1) e1 += 1440; return [s1, e1]; };
  const [x, y] = [a, b].sort((p, q) => toM(p.startTime) - toM(q.startTime));
  const [a1, b1] = span(x); const [a2, b2] = span(y);
  return (a1 < b2 && a2 < b1) || (b2 > 1440 && b2 - 1440 > a1);
};
const LEAVE_STATUS = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};
const emptyLeaveForm = () => ({ leaveType: '', startDate: ymd(new Date()), endDate: ymd(new Date()), isHalfDay: false, halfDayType: 'first', reason: '' });

const card = 'bg-white border border-gray-100 rounded-2xl p-4 mb-3';
const h2 = 'text-[15px] font-extrabold text-gray-900 mb-2';
const muted = 'text-[13px] text-gray-500';
const btn = 'px-3 py-2 rounded-lg text-[13px] font-bold disabled:opacity-50 whitespace-nowrap';
const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-200';

export default function MyShiftsPage() {
  const [user, setUser] = useState(null);
  const [rid, setRid] = useState(null);
  const [tab, setTab] = useState('shifts');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null); // { ok: bool, text }
  const [busy, setBusy] = useState(null);
  const [confirmKey, setConfirmKey] = useState(null); // inline "are you sure" for cancels
  const [swapFor, setSwapFor] = useState(null); // shift being offered
  const [avail, setAvail] = useState(null);
  const [availDirty, setAvailDirty] = useState(false);
  const [newDate, setNewDate] = useState('');
  // Leave
  const [leaveConfig, setLeaveConfig] = useState(null);
  const [balances, setBalances] = useState({});
  const [requests, setRequests] = useState([]);
  const [leaveError, setLeaveError] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [leaveForm, setLeaveForm] = useState(emptyLeaveForm);

  const say = (ok, text) => { setNotice({ ok, text }); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const loadShifts = useCallback(async (r, u) => {
    if (!r || !u) return;
    setError('');
    try {
      // From yesterday: an overnight shift that is still running after midnight stays listed.
      const from = new Date(); from.setDate(from.getDate() - 1);
      const end = new Date(); end.setDate(end.getDate() + 27);
      const [res, av] = await Promise.all([
        apiClient.request(`/api/shift-scheduling/my-shifts/${r}?startDate=${ymd(from)}&endDate=${ymd(end)}`),
        apiClient.request(`/api/shift-scheduling/availability/${u.id}`).catch(() => null),
      ]);
      // Yesterday's shifts are fetched only for an overnight shift still running now — drop the rest.
      const todayKey = ymd(new Date());
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      const stillOn = (sh) => sh.date >= todayKey || (toM(sh.endTime) <= toM(sh.startTime) && nowMin < toM(sh.endTime));
      if (res && Array.isArray(res.myShifts)) res.myShifts = res.myShifts.filter(stillOn);
      if (res && Array.isArray(res.openShifts)) res.openShifts = res.openShifts.filter(sh => sh.date >= todayKey);
      if (res && Array.isArray(res.swapIncoming)) res.swapIncoming = res.swapIncoming.filter(sh => sh.date >= todayKey);
      setData(res);
      const a = av?.availability || {};
      const weekly = {};
      DAYS.forEach(([k]) => {
        const d = a.availability?.[k] || a.availability?.[FULL[k]] || { available: true, startTime: '09:00', endTime: '22:00' };
        weekly[k] = { available: d.available !== false, slots: daySlots(d) };
      });
      setAvail({ weekly, unavailableDates: a.unavailableDates || [] });
      setAvailDirty(false);
    } catch (e) {
      setError(e?.message || 'Could not load your shifts');
    }
  }, []);

  const loadLeave = useCallback(async (r, u) => {
    if (!r || !u) return;
    setLeaveError('');
    try {
      const [cfg, bal, reqs] = await Promise.all([
        apiClient.request(`/api/attendance/${r}/leave/config`),
        apiClient.request(`/api/attendance/${r}/leave/balances/${u.id}`).catch(() => null),
        apiClient.request(`/api/attendance/${r}/leave/requests?staffId=${encodeURIComponent(u.id)}`),
      ]);
      setLeaveConfig(cfg || {});
      setBalances(bal?.balances || {});
      setRequests(Array.isArray(reqs?.requests) ? reqs.requests : []);
    } catch (e) {
      setLeaveError(e?.message || 'Could not load your leave');
    }
  }, []);

  const loadAll = useCallback(async (r = rid, u = user) => {
    await Promise.all([loadShifts(r, u), loadLeave(r, u)]);
  }, [rid, user, loadShifts, loadLeave]);

  useEffect(() => {
    (async () => {
      let u = null;
      try { u = JSON.parse(localStorage.getItem('user') || 'null'); } catch { u = null; }
      const r = localStorage.getItem('selectedRestaurantId') || u?.restaurantId || null;
      const me = u ? { ...u, id: u.id || u.userId || u.uid } : null;
      if (!me?.id) { setError('Please log in again.'); setLoading(false); return; }
      if (!r) { setError('Choose your restaurant first.'); setLoading(false); return; }
      setUser(me); setRid(r);
      await Promise.all([loadShifts(r, me), loadLeave(r, me)]);
      setLoading(false);
    })();
  }, [loadShifts, loadLeave]);

  const refresh = async () => { setBusy('refresh'); setNotice(null); await loadAll(); setBusy(null); };

  // Same POST calls as the app: /api/shift-scheduling/shifts/:rid/<path>
  const act = async (key, path, body, okMsg) => {
    setBusy(key); setConfirmKey(null); setNotice(null);
    try {
      await apiClient.request(`/api/shift-scheduling/shifts/${rid}/${path}`, { method: 'POST', body: body || {} });
      if (okMsg) say(true, okMsg);
      await loadShifts(rid, user);
    } catch (e) {
      say(false, e?.message || 'Could not do that. Please try again.');
    } finally { setBusy(null); }
  };

  // ── Availability ──
  const setDay = (k, patch) => {
    setAvail(a => ({ ...a, weekly: { ...a.weekly, [k]: { ...a.weekly[k], ...patch } } }));
    setAvailDirty(true);
  };
  const setSlotTime = (day, slot, field, value) => setDay(day, { slots: (avail.weekly[day].slots || []).map((x, i) => (i === slot ? { ...x, [field]: value } : x)) });
  const addSlot = (day) => setDay(day, { slots: [...(avail.weekly[day].slots || []).slice(0, 1), { startTime: '17:00', endTime: '22:00' }] });
  const removeSlot = (day, slot) => setDay(day, { slots: (avail.weekly[day].slots || []).filter((_, i) => i !== slot) });
  const addUnavailable = () => {
    if (!newDate || newDate < ymd(new Date())) return;
    setAvail(a => ({ ...a, unavailableDates: [...new Set([...a.unavailableDates, newDate])].sort() }));
    setAvailDirty(true); setNewDate('');
  };
  const removeUnavailable = (x) => { setAvail(a => ({ ...a, unavailableDates: a.unavailableDates.filter(y => y !== x) })); setAvailDirty(true); };

  const saveAvailability = async () => {
    setBusy('avail'); setNotice(null);
    try {
      const weekly = {};
      for (const [k, label] of DAYS) {
        const d = avail.weekly[k];
        const slots = (d.slots || []).slice(0, 2);
        if (d.available !== false) {
          if (slots.some(x => !TIME_RE.test(x.startTime || '') || !TIME_RE.test(x.endTime || ''))) throw new Error(`${label}: pick the times`);
          if (slots.some(x => x.startTime === x.endTime)) throw new Error(`${label}: start and end can't be the same`);
          if (slotsOverlap(slots)) throw new Error(`${label}: the two time slots overlap`);
        }
        // startTime / endTime = first slot, so older screens still read a sensible range.
        weekly[k] = { available: d.available !== false, startTime: slots[0]?.startTime || '09:00', endTime: slots[0]?.endTime || '22:00', slots };
      }
      await apiClient.request(`/api/shift-scheduling/availability/${user.id}`, {
        method: 'POST', body: { availability: weekly, unavailableDates: avail.unavailableDates },
      });
      setAvailDirty(false);
      say(true, 'Availability saved. Your manager will see this when planning the rota.');
    } catch (e) {
      say(false, `Not saved: ${e?.message || 'Please try again'}`);
    } finally { setBusy(null); }
  };

  // ── Leave ──
  const leaveTypes = (leaveConfig?.leaveTypes || []).filter(Boolean);
  const typeName = (id) => {
    const t = leaveTypes.find(x => x.id === id) || balances[id];
    return t?.name || t?.shortName || String(id || '').toUpperCase();
  };
  const openApply = () => { setLeaveForm({ ...emptyLeaveForm(), leaveType: leaveTypes[0]?.id || '' }); setShowApply(true); setLeaveError(''); };

  const applyLeave = async () => {
    const f = leaveForm;
    if (!f.leaveType) { setLeaveError('Choose a leave type'); return; }
    if (!f.startDate) { setLeaveError('Pick the start date'); return; }
    if (!f.isHalfDay && f.endDate && f.endDate < f.startDate) { setLeaveError('End date is before the start date'); return; }
    setBusy('leave-apply'); setLeaveError(''); setNotice(null);
    try {
      const body = {
        staffId: user.id,
        staffName: user.name || user.staffName || '',
        leaveType: f.leaveType,
        startDate: f.startDate,
        isHalfDay: !!f.isHalfDay,
        reason: f.reason.trim(),
      };
      // Half day = one date; the server ignores endDate for it.
      if (f.isHalfDay) body.halfDayType = f.halfDayType;
      else body.endDate = f.endDate || f.startDate;
      await apiClient.request(`/api/attendance/${rid}/leave/apply`, { method: 'POST', body });
      setShowApply(false);
      say(true, 'Leave requested — your manager will approve it.');
      await loadLeave(rid, user);
    } catch (e) {
      // UNKNOWN_LEAVE_TYPE comes back with the restaurant's real types — use them.
      if (e?.code === 'UNKNOWN_LEAVE_TYPE' && Array.isArray(e?.data?.leaveTypes)) {
        setLeaveConfig(c => ({ ...(c || {}), leaveTypes: e.data.leaveTypes }));
        setLeaveForm(x => ({ ...x, leaveType: e.data.leaveTypes[0]?.id || '' }));
      }
      setLeaveError(e?.message || 'Could not apply. Please try again.');
    } finally { setBusy(null); }
  };

  const cancelLeave = async (r) => {
    setBusy(`lc${r.id}`); setConfirmKey(null); setNotice(null);
    try {
      await apiClient.request(`/api/attendance/${rid}/leave/${r.id}/cancel`, { method: 'PATCH', body: {} });
      say(true, 'Leave request cancelled.');
      await loadLeave(rid, user);
    } catch (e) {
      say(false, e?.message || 'Could not cancel. Please try again.');
    } finally { setBusy(null); }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-4"><div className={card}><span className={muted}>Loading…</span></div></div>;
  }

  const my = data?.myShifts || [];
  const next = my[0];
  const open = data?.openShifts || [];
  const incoming = data?.swapIncoming || [];
  const colleagues = data?.colleagues || [];
  const currency = data?.currencySymbol || '';
  const balanceList = Object.entries(balances || {});
  const todayKey = ymd(new Date());

  // Inline "Cancel?" → Yes / No, so nothing is cancelled by a stray tap.
  const ConfirmCancel = ({ k, onYes, label = 'Cancel' }) => (confirmKey === k ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600">Sure?</span>
      <button type="button" disabled={!!busy} onClick={onYes} className={`${btn} bg-red-500 text-white !py-1`}>{busy ? '…' : 'Yes'}</button>
      <button type="button" onClick={() => setConfirmKey(null)} className={`${btn} bg-gray-100 text-gray-700 !py-1`}>No</button>
    </div>
  ) : (
    <button type="button" disabled={!!busy} onClick={() => setConfirmKey(k)} className="text-xs font-semibold text-red-500 hover:underline">{label}</button>
  ));

  const shiftRow = (s, right) => (
    <div key={s.id} className="flex items-start gap-3 py-3 border-t border-gray-100 first:border-t-0">
      <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: s.color || '#ef4444' }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">{nice(s.date)} · {t12(s.startTime)}–{t12(s.endTime)}</div>
        <div className={muted}>{[s.shiftName, cap(s.role), s.breakMinutes ? `${s.breakMinutes} min break` : null].filter(Boolean).join(' · ')}</div>
        {Number(s.incentive?.amount) > 0 && (
          <div className="text-xs font-bold text-amber-700 mt-0.5">+{currency}{s.incentive.amount} extra{s.incentive.note ? ` · ${s.incentive.note}` : ''}</div>
        )}
        {s.notes && <div className="text-xs text-amber-800 mt-0.5">{s.notes}</div>}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1.5">{right}</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900 mt-1 mb-0.5">My Shifts &amp; Leave</h1>
          <p className={`${muted} mb-3`}>{user?.name ? `${user.name}${user.role ? ' · ' + cap(user.role) : ''}` : 'Your rota, leave and availability'}</p>
        </div>
        <button type="button" onClick={refresh} disabled={!!busy} aria-label="Refresh" className="mt-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50">
          <FaSyncAlt className={busy === 'refresh' ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl mb-3" role="tablist">
        {[['shifts', 'Shifts'], ['leave', 'Leave'], ['availability', 'Availability']].map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setConfirmKey(null); }}
            className={`py-2 rounded-lg text-sm font-bold transition ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            {label}{k === 'shifts' && incoming.length > 0 ? ` · ${incoming.length}` : ''}
          </button>
        ))}
      </div>

      {error && <div role="alert" className={`${card} !bg-red-50 !border-red-200 text-red-700 text-sm`}>{error}</div>}
      {notice && (
        <div role="status" className={`${card} flex items-start justify-between gap-2 text-sm ${notice.ok ? '!bg-emerald-50 !border-emerald-200 text-emerald-800' : '!bg-red-50 !border-red-200 text-red-700'}`}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Close" className="opacity-60 hover:opacity-100"><FaTimes /></button>
        </div>
      )}

      {/* ── Shifts ── */}
      {tab === 'shifts' && (<>
        <div className={`${card} ${next ? '!bg-red-50 !border-red-100' : ''}`}>
          <div className="text-[11px] font-bold tracking-wide text-gray-500">NEXT SHIFT</div>
          {next ? (<>
            <div className="text-[22px] font-extrabold text-gray-900 mt-1">{nice(next.date)}</div>
            <div className="text-[15px] text-gray-700">{t12(next.startTime)} – {t12(next.endTime)}{next.shiftName ? ` · ${next.shiftName}` : ''}</div>
          </>) : <p className={muted}>No shifts in the next 4 weeks yet.</p>}
        </div>

        {/* 1) My shifts */}
        <section className={card}>
          <h2 className={h2}>My upcoming shifts ({my.length})</h2>
          {my.length === 0 ? <p className={muted}>Nothing scheduled yet. You&apos;ll get a notification when your schedule is published.</p>
            : my.map(s => {
              const sr = s.swapRequest;
              const pendingSwap = sr && ['pending_colleague', 'pending_approval'].includes(sr.status) && sr.fromStaffId === user?.id;
              return shiftRow(s, pendingSwap ? (<>
                <span className="text-xs font-semibold text-violet-600">{sr.status === 'pending_colleague' ? `Asked ${sr.toName}` : 'Waiting approval'}</span>
                <ConfirmCancel k={`sc${s.id}`} label="Cancel swap" onYes={() => act(`sc${s.id}`, `${s.id}/swap/cancel`, {}, 'Swap request cancelled')} />
              </>) : (
                <button type="button" disabled={!!busy} onClick={() => setSwapFor(swapFor?.id === s.id ? null : s)}
                  className={`${btn} border border-violet-200 text-violet-700 bg-white hover:bg-violet-50 flex items-center gap-1.5`}>
                  <FaExchangeAlt className="text-[11px]" /> Offer swap
                </button>
              ));
            })}

          {/* Ask a colleague to swap */}
          {swapFor && (
            <div className="mt-3 border border-violet-200 bg-violet-50/40 rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-gray-900">Who can take it?</div>
                  <div className={muted}>{nice(swapFor.date)} · {t12(swapFor.startTime)}–{t12(swapFor.endTime)}</div>
                </div>
                <button type="button" onClick={() => setSwapFor(null)} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-600"><FaTimes /></button>
              </div>
              <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-violet-100">
                {colleagues.map(c => (
                  <button key={c.id} type="button" disabled={!!busy}
                    onClick={() => { const s = swapFor; setSwapFor(null); act(`sw${s.id}`, `${s.id}/swap`, { toStaffId: c.id }, `Asked ${c.name}. Once they accept, your manager approves.`); }}
                    className="w-full text-left py-2.5 px-1 hover:bg-white rounded disabled:opacity-50">
                    <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                    <div className={muted}>{cap(c.role)}</div>
                  </button>
                ))}
                {colleagues.length === 0 && <p className={`${muted} py-2`}>No colleagues found.</p>}
              </div>
            </div>
          )}
        </section>

        {/* 2) Swap requests for me */}
        <section className={`${card} ${incoming.length ? '!border-violet-200' : ''}`}>
          <h2 className={h2}>Swap requests for me{incoming.length ? ` (${incoming.length})` : ''}</h2>
          {incoming.length === 0 ? <p className={muted}>No one has asked you to take a shift.</p>
            : incoming.map(s => shiftRow(s, (<>
              <span className={`${muted} text-right max-w-[120px]`}>from {s.swapRequest?.fromName}</span>
              <div className="flex gap-1.5">
                <button type="button" disabled={!!busy} onClick={() => act(`ia${s.id}`, `${s.id}/swap/respond`, { accept: true }, 'Accepted — waiting for manager approval')} className={`${btn} bg-green-600 text-white`}>Accept</button>
                <button type="button" disabled={!!busy} onClick={() => act(`id${s.id}`, `${s.id}/swap/respond`, { accept: false }, 'Declined')} className={`${btn} bg-gray-100 text-gray-700`}>Decline</button>
              </div>
            </>)))}
        </section>

        {/* 3) Open shifts */}
        <section className={card}>
          <h2 className={h2}>Open shifts you can pick ({open.length})</h2>
          {open.length === 0 ? <p className={muted}>None right now.</p> : open.map(s => {
            const mine = s.myClaim;
            return shiftRow(s, mine?.status === 'pending' ? (<>
              <span className="text-xs font-semibold text-blue-600">Requested</span>
              <ConfirmCancel k={`cc${s.id}`} onYes={() => act(`cc${s.id}`, `${s.id}/claim/cancel`, {}, 'Request cancelled')} />
            </>) : mine?.status === 'rejected' ? <span className={muted}>Declined</span> : (
              <button type="button" disabled={!!busy} onClick={() => act(`cl${s.id}`, `${s.id}/claim`, {}, 'Requested — your manager will confirm')} className={`${btn} bg-blue-600 text-white`}>
                {busy === `cl${s.id}` ? 'Sending…' : 'I’ll take it'}
              </button>
            ));
          })}
        </section>
      </>)}

      {/* ── 4) Leave ── */}
      {tab === 'leave' && (<>
        {leaveError && !showApply && <div role="alert" className={`${card} !bg-red-50 !border-red-200 text-red-700 text-sm`}>{leaveError}</div>}

        <section className={card}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className={`${h2} !mb-0`}>My leave balance</h2>
            {!showApply && <button type="button" onClick={openApply} className={`${btn} bg-red-500 text-white`}>Apply for leave</button>}
          </div>
          {balanceList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {balanceList.map(([id, b]) => (
                <div key={id} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-600">{b?.name || typeName(id)}</div>
                  <div className="text-sm text-gray-900"><b>{Number(b?.remaining) || 0}</b><span className="text-gray-500"> / {Number(b?.total) || 0} left</span></div>
                </div>
              ))}
            </div>
          ) : leaveTypes.length > 0 ? (
            <p className={muted}>Your balance shows here after your first leave this year ({leaveTypes.map(t => t.shortName || t.name).join(', ')}).</p>
          ) : <p className={muted}>No leave types set up yet — ask your manager.</p>}

          {/* Apply form */}
          {showApply && (
            <div className="mt-4 border border-red-100 bg-red-50/30 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900">Apply for leave</div>
                <button type="button" onClick={() => { setShowApply(false); setLeaveError(''); }} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-600"><FaTimes /></button>
              </div>
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-gray-500">TYPE</span>
                <select className={`${input} mt-1`} value={leaveForm.leaveType} onChange={e => setLeaveForm(f => ({ ...f, leaveType: e.target.value }))}>
                  {leaveTypes.length === 0 && <option value="">No leave types</option>}
                  {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}{t.shortName ? ` (${t.shortName})` : ''}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={leaveForm.isHalfDay} onChange={e => setLeaveForm(f => ({ ...f, isHalfDay: e.target.checked }))} className="w-4 h-4 accent-red-500" />
                Half day
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-bold tracking-wide text-gray-500">{leaveForm.isHalfDay ? 'DATE' : 'FROM'}</span>
                  <input type="date" className={`${input} mt-1`} value={leaveForm.startDate}
                    onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value, endDate: f.endDate < e.target.value ? e.target.value : f.endDate }))} />
                </label>
                {leaveForm.isHalfDay ? (
                  <label className="block">
                    <span className="text-[11px] font-bold tracking-wide text-gray-500">WHICH HALF</span>
                    <select className={`${input} mt-1`} value={leaveForm.halfDayType} onChange={e => setLeaveForm(f => ({ ...f, halfDayType: e.target.value }))}>
                      <option value="first">First half</option>
                      <option value="second">Second half</option>
                    </select>
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-[11px] font-bold tracking-wide text-gray-500">TO</span>
                    <input type="date" className={`${input} mt-1`} min={leaveForm.startDate} value={leaveForm.endDate}
                      onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
                  </label>
                )}
              </div>
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-gray-500">REASON (OPTIONAL)</span>
                <textarea rows={2} maxLength={300} className={`${input} mt-1`} value={leaveForm.reason} placeholder="e.g. Family function"
                  onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
              </label>
              {leaveError && <p role="alert" className="text-sm text-red-700">{leaveError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowApply(false); setLeaveError(''); }} className={`${btn} flex-1 bg-gray-100 text-gray-700`}>Cancel</button>
                <button type="button" disabled={busy === 'leave-apply' || !leaveForm.leaveType} onClick={applyLeave} className={`${btn} flex-1 bg-red-500 text-white`}>
                  {busy === 'leave-apply' ? 'Sending…' : 'Send request'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className={h2}>My leave requests ({requests.length})</h2>
          {requests.length === 0 ? <p className={muted}>You haven&apos;t asked for leave yet.</p> : requests.map(r => {
            const days = Number(r.totalDays) || 0;
            const half = r.isHalfDay || r.halfDay;
            return (
              <div key={r.id} className="flex items-start justify-between gap-3 py-3 border-t border-gray-100 first:border-t-0">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {nice(r.startDate)}{r.endDate && r.endDate !== r.startDate ? ` – ${nice(r.endDate)}` : ''}
                  </div>
                  <div className={muted}>
                    {[typeName(r.leaveType), half ? `Half day${r.halfDayType ? ` (${r.halfDayType === 'second' ? '2nd' : '1st'} half)` : ''}` : `${days} day${days === 1 ? '' : 's'}`, r.paid === false ? 'Unpaid' : null].filter(Boolean).join(' · ')}
                  </div>
                  {r.reason && <div className="text-xs text-gray-600 mt-0.5 break-words">{r.reason}</div>}
                  {r.status === 'rejected' && (r.rejectedReason || r.rejectionReason) && <div className="text-xs text-red-600 mt-0.5">{r.rejectedReason || r.rejectionReason}</div>}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${LEAVE_STATUS[r.status] || 'bg-gray-100 text-gray-600'}`}>{cap(r.status)}</span>
                  {r.status === 'pending' && <ConfirmCancel k={`lc${r.id}`} onYes={() => cancelLeave(r)} />}
                </div>
              </div>
            );
          })}
        </section>
      </>)}

      {/* ── 5) Availability ── */}
      {tab === 'availability' && avail && (
        <section className={card}>
          <h2 className={h2}>My availability</h2>
          <p className={`${muted} mb-2`}>When you can work. Your manager sees this while planning.</p>
          {DAYS.map(([k, label]) => {
            const d = avail.weekly[k];
            const on = d.available !== false;
            return (
              <div key={k} className="flex items-start gap-3 py-2 border-t border-gray-100 first:border-t-0">
                <span className="w-10 pt-1.5 text-sm font-semibold text-gray-900">{label}</span>
                <button type="button" role="switch" aria-checked={on} aria-label={`${label} available`} onClick={() => setDay(k, { available: !on })}
                  className={`mt-1 relative w-10 h-6 rounded-full shrink-0 transition ${on ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : ''}`} />
                </button>
                {on ? (
                  <div className="flex-1 space-y-1.5">
                    {(d.slots || []).map((slot, i) => (
                      <div key={i} className="flex items-center gap-1.5 flex-wrap">
                        <input type="time" value={slot.startTime} onChange={e => setSlotTime(k, i, 'startTime', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold tabular-nums w-[104px]" />
                        <span className={muted}>to</span>
                        <input type="time" value={slot.endTime} onChange={e => setSlotTime(k, i, 'endTime', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold tabular-nums w-[104px]" />
                        {i > 0 && (
                          <button type="button" onClick={() => removeSlot(k, i)} aria-label={`Remove ${label} second slot`} className="p-1 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        )}
                      </div>
                    ))}
                    {(d.slots || []).length < 2 && (
                      <button type="button" onClick={() => addSlot(k)} className="text-[13px] font-semibold text-blue-600 hover:underline">+ 2nd slot</button>
                    )}
                  </div>
                ) : <span className={`${muted} pt-1.5`}>Can&apos;t work</span>}
              </div>
            );
          })}

          <div className="text-[11px] font-bold tracking-wide text-gray-500 mt-4">DATES I CAN&apos;T WORK</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {avail.unavailableDates.filter(x => x >= todayKey).map(x => (
              <button key={x} type="button" onClick={() => removeUnavailable(x)} className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[13px] font-semibold flex items-center gap-1.5">
                {nice(x)} <FaTimes className="text-[10px]" />
              </button>
            ))}
            {avail.unavailableDates.filter(x => x >= todayKey).length === 0 && <span className={muted}>None</span>}
          </div>
          <div className="flex gap-2 mt-2">
            <input type="date" min={todayKey} value={newDate} onChange={e => setNewDate(e.target.value)} className={`${input} !w-auto flex-1 max-w-[200px]`} />
            <button type="button" disabled={!newDate} onClick={addUnavailable} className={`${btn} bg-gray-100 text-gray-700`}>+ Add date</button>
          </div>

          <button type="button" disabled={!availDirty || busy === 'avail'} onClick={saveAvailability} className={`${btn} w-full mt-4 py-2.5 bg-red-500 text-white`}>
            {busy === 'avail' ? 'Saving…' : 'Save availability'}
          </button>
        </section>
      )}
    </div>
  );
}
