'use client';

// Daily Diary — "Anticipation & Assessment". The manager's few minutes a day: in the morning what
// they expect and prepare for, at night how it went plus any incidents (quarrel, theft, complaint,
// great / low sales …). Sales and the rota are filled in automatically. Incidents with a follow-up
// date show in the Event Calendar until resolved. Turned on in Admin → POS settings → Daily Diary.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import apiClient from '../../../lib/api';
import { restaurantToday } from '../../../lib/restaurantTime';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  FaBook, FaChevronLeft, FaChevronRight, FaSun, FaMoon, FaExclamationTriangle, FaPlus, FaTrash,
  FaSpinner, FaCheck, FaCalendarAlt, FaUsers, FaArrowUp, FaArrowDown,
} from 'react-icons/fa';

const INCIDENTS = {
  staff: { label: 'Staff issue / quarrel', emoji: '😠' },
  theft: { label: 'Theft / cash short', emoji: '🚨' },
  complaint: { label: 'Customer complaint', emoji: '🙁' },
  equipment: { label: 'Equipment / power', emoji: '🔧' },
  'great-sales': { label: 'Outstanding sales', emoji: '🎉' },
  'low-sales': { label: 'Low sales', emoji: '📉' },
  wastage: { label: 'Wastage / spoilage', emoji: '🗑️' },
  safety: { label: 'Safety / hygiene', emoji: '⚠️' },
  other: { label: 'Other', emoji: '📝' },
};
const SEV = { low: 'bg-gray-100 text-gray-700', medium: 'bg-amber-100 text-amber-800', high: 'bg-red-100 text-red-700' };
const RATINGS = [[1, '😣', 'Bad'], [2, '😕', 'Below par'], [3, '😐', 'OK'], [4, '🙂', 'Good'], [5, '🤩', 'Great']];
const FOCUS_CHIPS = ['Push promo items', 'Upsell drinks & desserts', 'Festival / event day', 'Big booking / catering', 'Deep cleaning', 'New staff training'];

const addDays = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const fmtDay = (d, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => { try { return new Date(`${d}T12:00:00`).toLocaleDateString([], opts); } catch { return d; } };
const fmtTime = (iso) => { try { return new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch { return ''; } };
const newIncident = () => ({ id: '', type: 'other', severity: 'medium', title: '', note: '', people: '', amount: '', followUp: '', status: 'open', resolution: '' });

export default function DiaryPage() {
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();
  const [rid, setRid] = useState(null);
  const [today, setToday] = useState('');
  const [date, setDate] = useState('');
  const [tab, setTab] = useState('day'); // day | history | incidents
  const [day, setDay] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    let r = null; try { r = localStorage.getItem('selectedRestaurantId'); } catch { /* none */ }
    setRid(r);
    const t = restaurantToday();
    setToday(t);
    const q = searchParams.get('date');
    setDate(/^\d{4}-\d{2}-\d{2}$/.test(q || '') ? q : t);
    if (searchParams.get('tab') === 'incidents') setTab('incidents');
  }, [searchParams]);

  const loadDay = useCallback(async () => {
    if (!rid || !date) return;
    setLoading(true); setError(null);
    try {
      const r = await apiClient.getDiaryDay(rid, date);
      setDay(r);
      const e = r.entry || {};
      setForm({
        anticipation: { target: e.anticipation?.target ?? '', focus: e.anticipation?.focus || '', staffing: e.anticipation?.staffing || '', notes: e.anticipation?.notes || '' },
        assessment: { rating: e.assessment?.rating || null, wentWell: e.assessment?.wentWell || '', wentWrong: e.assessment?.wentWrong || '', tomorrow: e.assessment?.tomorrow || '' },
        incidents: (e.incidents || []).map((i) => ({ ...newIncident(), ...i, amount: i.amount ?? '', followUp: i.followUp || '' })),
      });
      setDirty(false); setSavedAt(e.updatedAt ? { at: e.updatedAt, by: e.updatedBy?.name } : null);
    } catch (err) {
      setError({ off: err?.data?.code === 'DIARY_OFF' || /switched off/i.test(err?.message || ''), message: err?.message || 'Could not load the diary' });
    } finally { setLoading(false); }
  }, [rid, date]);
  useEffect(() => { if (tab === 'day') loadDay(); }, [tab, loadDay]);

  useEffect(() => {
    if (!rid) return;
    apiClient.getDiaryIncidents(rid, 'open').then((r) => setOpenCount((r?.incidents || []).length)).catch(() => {});
  }, [rid, savedAt]);

  useEffect(() => {
    if (!rid || !today) return;
    if (tab === 'history') { setHistory(null); apiClient.getDiary(rid, { from: addDays(today, -60), to: addDays(today, 30) }).then(setHistory).catch((e) => setHistory({ error: e?.message })); }
    if (tab === 'incidents') { setIncidents(null); apiClient.getDiaryIncidents(rid, 'all').then(setIncidents).catch((e) => setIncidents({ error: e?.message })); }
  }, [tab, rid, today, savedAt]);

  const set = (section, patch) => { setForm((f) => ({ ...f, [section]: { ...f[section], ...patch } })); setDirty(true); };
  const setInc = (k, patch) => { setForm((f) => ({ ...f, incidents: f.incidents.map((x, j) => (j === k ? { ...x, ...patch } : x)) })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        anticipation: { ...form.anticipation, target: form.anticipation.target === '' ? null : Number(form.anticipation.target) },
        assessment: form.assessment,
        incidents: form.incidents.map((i) => ({ ...i, amount: i.amount === '' ? null : Number(i.amount), followUp: i.followUp || null })),
      };
      const r = await apiClient.saveDiaryDay(rid, date, body);
      const e = r.entry || {};
      setForm((f) => ({ ...f, incidents: (e.incidents || []).map((i) => ({ ...newIncident(), ...i, amount: i.amount ?? '', followUp: i.followUp || '' })) }));
      setSavedAt({ at: e.updatedAt, by: e.updatedBy?.name }); setDirty(false);
    } catch (err) {
      setError({ message: err?.message || 'Could not save' });
    } finally { setSaving(false); }
  };

  const facts = day?.facts;
  const target = Number(form?.anticipation?.target) || 0;
  const actual = facts?.sales?.sales || 0;
  const pct = target > 0 ? Math.round((actual / target) * 100) : null;
  const isFuture = date && today && date > today;

  if (error?.off) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-xl bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="font-bold text-gray-900 flex items-center gap-2"><FaBook className="text-amber-700" /> The Daily Diary is off</div>
          <p className="text-sm text-gray-600 mt-2">Turn it on in Admin → POS settings → Daily Diary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center shadow"><FaBook className="text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Daily Diary</h1>
              <div className="text-xs text-gray-500">Anticipation &amp; assessment — a few minutes a day</div>
            </div>
          </div>
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            {[['day', 'Day'], ['history', 'History'], ['incidents', `Incidents${openCount ? ` · ${openCount} open` : ''}`]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold ${tab === k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-5xl">
        {tab === 'day' && (
          <>
            {/* Date switcher */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setDate(addDays(date, -1))} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50" aria-label="Previous day"><FaChevronLeft size={12} /></button>
              <div className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold text-gray-800 min-w-[200px] text-center">
                {date ? fmtDay(date) : ''}{date === today && <span className="ml-2 text-xs text-amber-700 font-bold">TODAY</span>}
              </div>
              <button onClick={() => setDate(addDays(date, 1))} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50" aria-label="Next day"><FaChevronRight size={12} /></button>
              {date !== today && <button onClick={() => setDate(today)} className="text-sm text-amber-700 font-semibold ml-1">Today</button>}
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="ml-auto px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white" />
            </div>

            {loading || !form ? (
              <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-amber-600 text-2xl" /></div>
            ) : (
              <div className="space-y-4 pb-24">
                {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">{error.message}</div>}

                {/* Auto facts */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Fact label={isFuture ? 'Sales' : date === today ? 'Sales so far' : 'Sales'} value={isFuture ? '—' : formatCurrency(actual)} sub={isFuture ? '' : `${facts?.sales?.orders || 0} orders`} />
                  <Fact label="Same day last week" value={facts?.lastWeek ? formatCurrency(facts.lastWeek.sales) : '—'} sub={facts?.lastWeek ? `${facts.lastWeek.orders} orders` : ''} />
                  <Fact label="Avg of last 4 same days" value={facts?.avgSameWeekday != null ? formatCurrency(facts.avgSameWeekday) : '—'} sub="suggested target" />
                  <Fact label="On the rota" value={facts?.rota?.length ? `${facts.rota.length} staff` : '—'} sub={facts?.rota?.slice(0, 3).map((r) => r.name).join(', ')} icon={<FaUsers className="text-amber-700" />} />
                </div>

                {/* Morning */}
                <Section icon={<FaSun className="text-amber-500" />} title="Morning — anticipation" hint="Before service: what are you expecting and preparing for?">
                  <div className="grid sm:grid-cols-[220px_1fr] gap-4">
                    <div>
                      <Label>Sales target</Label>
                      <input type="number" min="0" inputMode="decimal" value={form.anticipation.target} onChange={(e) => set('anticipation', { target: e.target.value })}
                        placeholder={facts?.avgSameWeekday ? String(facts.avgSameWeekday) : 'e.g. 50000'} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-lg font-bold tabular-nums" />
                      {facts?.avgSameWeekday != null && form.anticipation.target === '' && (
                        <button onClick={() => set('anticipation', { target: String(facts.avgSameWeekday) })} className="text-xs text-amber-700 font-semibold mt-1">Use {formatCurrency(facts.avgSameWeekday)}</button>
                      )}
                      <Label className="mt-3">Staffing</Label>
                      <div className="flex gap-1.5">
                        {[['ok', 'Enough'], ['short', 'Short'], ['extra', 'Extra']].map(([k, l]) => (
                          <button key={k} onClick={() => set('anticipation', { staffing: form.anticipation.staffing === k ? '' : k })}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${form.anticipation.staffing === k ? (k === 'short' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-amber-50 border-amber-300 text-amber-800') : 'bg-white border-gray-200 text-gray-600'}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <Label>Focus / promotion today</Label>
                      <input value={form.anticipation.focus} onChange={(e) => set('anticipation', { focus: e.target.value })} placeholder="e.g. Push the new biryani combo, Diwali crowd from 7 pm"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {FOCUS_CHIPS.map((c) => (
                          <button key={c} onClick={() => set('anticipation', { focus: form.anticipation.focus ? (form.anticipation.focus.includes(c) ? form.anticipation.focus : `${form.anticipation.focus}; ${c}`) : c })}
                            className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-amber-50">+ {c}</button>
                        ))}
                      </div>
                      <Label className="mt-3">Preparation notes</Label>
                      <textarea rows={2} value={form.anticipation.notes} onChange={(e) => set('anticipation', { notes: e.target.value })} placeholder="Stock to check, bookings, VIP guests, maintenance…"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 resize-y" />
                    </div>
                  </div>
                </Section>

                {/* Night */}
                <Section icon={<FaMoon className="text-indigo-500" />} title="Night — assessment" hint="After closing: how did the day really go?">
                  {target > 0 && !isFuture && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{formatCurrency(actual)} of {formatCurrency(target)} target</span>
                        <span className={`font-bold flex items-center gap-1 ${pct >= 100 ? 'text-emerald-600' : 'text-red-600'}`}>{pct >= 100 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                    </div>
                  )}
                  <Label>How was the day?</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {RATINGS.map(([n, e, l]) => (
                      <button key={n} onClick={() => set('assessment', { rating: form.assessment.rating === n ? null : n })}
                        className={`flex flex-col items-center w-[68px] py-2 rounded-xl border ${form.assessment.rating === n ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-2xl leading-none">{e}</span><span className="text-[11px] text-gray-600 mt-1">{l}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>What went well</Label><textarea rows={2} value={form.assessment.wentWell} onChange={(e) => set('assessment', { wentWell: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 resize-y" /></div>
                    <div><Label>What went wrong</Label><textarea rows={2} value={form.assessment.wentWrong} onChange={(e) => set('assessment', { wentWrong: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 resize-y" /></div>
                  </div>
                  <Label className="mt-3">Plan for tomorrow</Label>
                  <input value={form.assessment.tomorrow} onChange={(e) => set('assessment', { tomorrow: e.target.value })} placeholder="One thing to do differently tomorrow" className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                </Section>

                {/* Incidents */}
                <Section icon={<FaExclamationTriangle className="text-red-500" />} title="Incidents & events" hint="Anything the owner should know — it stays trackable in the calendar until resolved.">
                  <div className="space-y-3">
                    {form.incidents.map((x, k) => (
                      <div key={x.id || `n${k}`} className={`rounded-xl border p-3 ${x.status === 'resolved' ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-white'}`}>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {Object.entries(INCIDENTS).map(([t, m]) => (
                            <button key={t} onClick={() => setInc(k, { type: t })}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${x.type === t ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600'}`}>{m.emoji} {m.label}</button>
                          ))}
                        </div>
                        <div className="grid sm:grid-cols-[1fr_auto] gap-2">
                          <input value={x.title} onChange={(e) => setInc(k, { title: e.target.value })} placeholder="What happened (one line)" className="px-3 py-2 rounded-lg border border-gray-200 font-medium" />
                          <div className="flex gap-1">
                            {Object.keys(SEV).map((s) => (
                              <button key={s} onClick={() => setInc(k, { severity: s })} className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${x.severity === s ? SEV[s] + ' ring-1 ring-current' : 'bg-white border border-gray-200 text-gray-500'}`}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <textarea rows={2} value={x.note} onChange={(e) => setInc(k, { note: e.target.value })} placeholder="Details, action taken" className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 resize-y text-sm" />
                        <div className="grid sm:grid-cols-3 gap-2 mt-2">
                          <input value={x.people} onChange={(e) => setInc(k, { people: e.target.value })} placeholder="People involved" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                          <input type="number" min="0" value={x.amount} onChange={(e) => setInc(k, { amount: e.target.value })} placeholder="Amount (if any)" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendarAlt className="text-gray-400 shrink-0" />
                            <input type="date" value={x.followUp} onChange={(e) => setInc(k, { followUp: e.target.value })} className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-gray-200 text-sm" title="Follow-up date (shows in the calendar)" />
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button onClick={() => setInc(k, { status: x.status === 'resolved' ? 'open' : 'resolved' })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${x.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>
                            <FaCheck size={10} /> {x.status === 'resolved' ? 'Resolved' : 'Mark resolved'}
                          </button>
                          {x.status === 'resolved' && <input value={x.resolution} onChange={(e) => setInc(k, { resolution: e.target.value })} placeholder="How it was resolved" className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border border-gray-200 text-sm" />}
                          {x.by?.name && <span className="text-[11px] text-gray-400 ml-auto">by {x.by.name}</span>}
                          <button onClick={() => { setForm((f) => ({ ...f, incidents: f.incidents.filter((_, j) => j !== k) })); setDirty(true); }} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Remove"><FaTrash size={12} /></button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { setForm((f) => ({ ...f, incidents: [...f.incidents, newIncident()] })); setDirty(true); }}
                      className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-700 hover:bg-white flex items-center justify-center gap-2"><FaPlus size={10} /> Add incident or event</button>
                  </div>
                </Section>

                {/* Save bar */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-[240px] bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 z-20" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
                  <span className="text-xs text-gray-500 truncate">{dirty ? 'Unsaved changes' : savedAt ? `Saved ${fmtTime(savedAt.at)}${savedAt.by ? ` by ${savedAt.by}` : ''}` : 'Nothing written for this day yet'}</span>
                  <button onClick={save} disabled={saving || !dirty} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-40 flex items-center gap-2">
                    {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save diary
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          !history ? <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-amber-600 text-2xl" /></div>
            : history.error ? <div className="text-red-600 text-sm">{history.error}</div>
              : (history.days || []).length === 0 ? <div className="text-center text-gray-500 py-16">No diary pages yet.</div>
                : (
                  <div className="space-y-2">
                    {history.days.map((d) => {
                      const p = d.target ? Math.round(((d.sales || 0) / d.target) * 100) : null;
                      const r = RATINGS.find(([n]) => n === d.rating);
                      return (
                        <button key={d.date} onClick={() => { setDate(d.date); setTab('day'); }} className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:border-amber-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="font-semibold text-gray-900 w-40">{fmtDay(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span className="text-xl w-8">{r ? r[1] : <span className="text-gray-300 text-sm">—</span>}</span>
                          <span className="text-sm text-gray-700 tabular-nums w-48">{d.sales != null ? formatCurrency(d.sales) : '—'}{d.target ? <span className={`ml-1 text-xs font-bold ${p >= 100 ? 'text-emerald-600' : 'text-red-600'}`}>{p}% of target</span> : ''}</span>
                          <span className="text-sm text-gray-500 flex-1 min-w-0 truncate">{d.focus}</span>
                          <span className="flex gap-1">
                            {d.incidents.map((i) => <span key={i.id} title={i.title} className={`text-xs px-2 py-0.5 rounded-full ${i.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : SEV[i.severity] || SEV.medium}`}>{INCIDENTS[i.type]?.emoji} {i.title || INCIDENTS[i.type]?.label}</span>)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )
        )}

        {tab === 'incidents' && (
          !incidents ? <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-amber-600 text-2xl" /></div>
            : incidents.error ? <div className="text-red-600 text-sm">{incidents.error}</div>
              : (incidents.incidents || []).length === 0 ? <div className="text-center text-gray-500 py-16">No incidents recorded.</div>
                : (
                  <div className="space-y-2">
                    {[...incidents.incidents].sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1)).map((i) => (
                      <button key={i.id} onClick={() => { setDate(i.date); setTab('day'); }} className={`w-full text-left bg-white rounded-xl border shadow-sm px-4 py-3 hover:border-amber-300 ${i.status === 'open' ? 'border-gray-100' : 'border-emerald-100 opacity-75'}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg">{INCIDENTS[i.type]?.emoji}</span>
                          <span className="font-semibold text-gray-900">{i.title || INCIDENTS[i.type]?.label}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${SEV[i.severity] || SEV.medium}`}>{i.severity}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${i.status === 'open' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{i.status === 'open' ? 'Open' : 'Resolved'}</span>
                          <span className="ml-auto text-xs text-gray-500">{fmtDay(i.date, { day: 'numeric', month: 'short' })}{i.followUp ? ` · follow up ${fmtDay(i.followUp, { day: 'numeric', month: 'short' })}` : ''}</span>
                        </div>
                        {(i.note || i.resolution) && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{i.note}{i.resolution ? ` — ✔ ${i.resolution}` : ''}</div>}
                      </button>
                    ))}
                  </div>
                )
        )}

        <div className="mt-6 text-xs text-gray-400">Incidents with a follow-up date also show in the <Link href="/calendar" className="text-amber-700 font-semibold">calendar</Link>.</div>
      </div>
    </div>
  );
}

function Section({ icon, title, hint, children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
        <div><h2 className="font-bold text-gray-900">{title}</h2><p className="text-xs text-gray-500">{hint}</p></div>
      </div>
      {children}
    </section>
  );
}
function Label({ children, className = '' }) {
  return <div className={`text-xs font-semibold text-gray-600 mb-1 ${className}`}>{children}</div>;
}
function Fact({ label, value, sub, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3.5 py-3 min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-1.5">{icon}{label}</div>
      <div className="text-lg font-bold text-gray-900 tabular-nums mt-0.5 truncate">{value}</div>
      {sub ? <div className="text-[11px] text-gray-400 truncate">{sub}</div> : null}
    </div>
  );
}
