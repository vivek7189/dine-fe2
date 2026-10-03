'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaList, FaExclamationTriangle, FaLock, FaEye, FaEyeSlash, FaFileImport, FaPen } from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  CALENDAR_CATEGORIES, CATEGORY_STYLE, addDays, calendarLang, categoryLabel, categoryStyle, countdownLabel,
  currentRestaurantId, dayMs, eventCategory, eventEnd, eventOnDay, eventOverride, fmtDay, fmtRange, isEventEdited, noteCalendarResult, todayKey,
} from '../../../lib/calendar';
import EventDrawer from '../../../components/calendar/EventDrawer';
import EventFormModal from '../../../components/calendar/EventFormModal';
import ImportEventsModal from '../../../components/calendar/ImportEventsModal';

const VIEW_KEY = 'dineCalendarView';

function monthStartKey(y, m) {
  return `${y}-${String(m + 1).padStart(2, '0')}-01`;
}

// 6-week grid (Sunday first) covering the month.
function gridDays(y, m) {
  const first = new Date(Date.UTC(y, m, 1));
  const start = addDays(monthStartKey(y, m), -first.getUTCDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function sortEvents(list) {
  return [...list].sort((a, b) => (a.date === b.date ? String(a.name).localeCompare(String(b.name)) : (a.date < b.date ? -1 : 1)));
}

export default function CalendarPage() {
  const { formatCurrency } = useCurrency();
  const [restaurantId, setRestaurantId] = useState(null);
  const [today, setToday] = useState('');
  const [cursor, setCursor] = useState(null); // { y, m }
  const [view, setView] = useState('month');
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState(null); // last API response for the visible range
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { denied: bool, message }
  const [selectedDay, setSelectedDay] = useState(null);
  const [openEvent, setOpenEvent] = useState(null);
  const [form, setForm] = useState(null); // { initial?, defaultDate? }
  const [hiddenCats, setHiddenCats] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const cacheRef = useRef(new Map());
  const reqRef = useRef(0);

  useEffect(() => {
    const rid = currentRestaurantId();
    setRestaurantId(rid);
    const tk = todayKey();
    setToday(tk);
    const [y, m] = tk.split('-').map(Number);
    setCursor({ y, m: m - 1 });
    try { const v = localStorage.getItem(VIEW_KEY); if (v === 'list' || v === 'month') setView(v); } catch { /* ignore */ }
    if (!rid) { setLoading(false); setError({ denied: false, message: t('eventCalendar.noRestaurant') }); }
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const range = useMemo(() => {
    if (!cursor || !today) return null;
    if (view === 'list') return { from: today, to: addDays(today, 365) };
    const days = gridDays(cursor.y, cursor.m);
    return { from: days[0], to: days[41] };
  }, [cursor, view, today]);

  const load = useCallback(async ({ fresh = false } = {}) => {
    if (!restaurantId || !range) return;
    const lang = calendarLang();
    const key = `${range.from}|${range.to}|${lang}`;
    if (fresh) cacheRef.current.clear();
    const cached = cacheRef.current.get(key);
    if (cached) { setData(cached); setLoading(false); setError(null); return; }
    const reqId = ++reqRef.current;
    setLoading(true);
    try {
      const res = await apiClient.getCalendar(restaurantId, { ...range, lang });
      noteCalendarResult(restaurantId, null);
      cacheRef.current.set(key, res);
      if (reqId !== reqRef.current) return;
      setData(res); setError(null);
    } catch (err) {
      noteCalendarResult(restaurantId, err);
      if (reqId !== reqRef.current) return;
      setError({ denied: err?.status === 403, missing: err?.status === 404, message: err?.message });
    } finally {
      if (reqId === reqRef.current) setLoading(false);
    }
  }, [restaurantId, range]);

  useEffect(() => { load(); }, [load]);

  // Prefetch the neighbouring months so paging feels instant.
  useEffect(() => {
    if (!restaurantId || !cursor || view !== 'month' || !data) return;
    const lang = calendarLang();
    [-1, 1].forEach((d) => {
      const dt = new Date(Date.UTC(cursor.y, cursor.m + d, 1));
      const days = gridDays(dt.getUTCFullYear(), dt.getUTCMonth());
      const key = `${days[0]}|${days[41]}|${lang}`;
      if (cacheRef.current.has(key)) return;
      apiClient.getCalendar(restaurantId, { from: days[0], to: days[41], lang })
        .then((res) => { cacheRef.current.set(key, res); })
        .catch(() => {});
    });
  }, [restaurantId, cursor, view, data]);

  const canManage = !!data?.canManage;
  const allEvents = useMemo(() => (Array.isArray(data?.events) ? data.events : []), [data]);
  const isEdited = (e) => isEventEdited(e, data?.settings);
  // Own events already loaded — the import preview flags exact repeats (name + date).
  const existingCustom = useMemo(() => allEvents.filter((e) => e.source === 'custom').map((e) => ({ name: e.name, date: e.date })), [allEvents]);
  const hiddenCount = allEvents.filter((e) => e.hidden).length;
  const events = useMemo(() => sortEvents(allEvents.filter((e) =>
    (!e.hidden || (canManage && showHidden)) && !hiddenCats.includes(eventCategory(e)))), [allEvents, canManage, showHidden, hiddenCats]);

  // Keep the open drawer in sync with refreshed data.
  useEffect(() => {
    if (!openEvent) return;
    const fresh = allEvents.find((e) => e.key === openEvent.key);
    if (fresh && fresh !== openEvent) setOpenEvent(fresh);
  }, [allEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeView = (v) => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ }
  };
  const shiftMonth = (d) => {
    setSelectedDay(null);
    setCursor((c) => { const dt = new Date(Date.UTC(c.y, c.m + d, 1)); return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() }; });
  };
  const goToday = () => {
    const [y, m] = today.split('-').map(Number);
    setCursor({ y, m: m - 1 });
    setSelectedDay(today);
  };
  const toggleCat = (c) => setHiddenCats((h) => (h.includes(c) ? h.filter((x) => x !== c) : [...h, c]));

  // ── Mutations ───────────────────────────────────────────────────────────
  const saveOverride = async (ev, { expectedCrowd, notes }) => {
    if (ev.source === 'custom') {
      await apiClient.updateCalendarEvent(restaurantId, ev.id, { expectedCrowd, notes });
    } else {
      await apiClient.updateCalendarSettings(restaurantId, { overrides: { [ev.key]: { expectedCrowd, notes } } });
    }
    await load({ fresh: true });
  };
  const toggleHidden = async (ev) => {
    const current = Array.isArray(data?.settings?.hiddenEventIds) ? data.settings.hiddenEventIds : [];
    const next = ev.hidden
      ? current.filter((x) => x !== ev.id && x !== ev.key)
      : Array.from(new Set([...current, ev.id]));
    await apiClient.updateCalendarSettings(restaurantId, { hiddenEventIds: next });
    if (!ev.hidden && !showHidden) setOpenEvent(null);
    await load({ fresh: true });
  };
  const submitForm = async (payload) => {
    if (form?.initial?.id) await apiClient.updateCalendarEvent(restaurantId, form.initial.id, payload);
    else await apiClient.createCalendarEvent(restaurantId, payload);
    setForm(null);
    setOpenEvent(null);
    await load({ fresh: true });
  };
  // Festival / public-holiday occurrence moved or renamed for this restaurant only.
  const saveDateOverride = async (ev, { date, endDate, name }) => {
    await apiClient.updateCalendarSettings(restaurantId, { overrides: { [ev.key]: { date, endDate, name } } });
    await load({ fresh: true });
  };
  const resetDateOverride = async (ev) => {
    await apiClient.updateCalendarSettings(restaurantId, { overrides: { [ev.key]: { date: null, endDate: null, name: null } } });
    await load({ fresh: true });
  };
  const importEvents = async (list) => {
    const res = await apiClient.bulkCreateCalendarEvents(restaurantId, list);
    await load({ fresh: true });
    return res;
  };
  const deleteEvent = async (ev) => {
    await apiClient.deleteCalendarEvent(restaurantId, ev.id);
    setOpenEvent(null);
    await load({ fresh: true });
  };

  // ── Derived for month view ─────────────────────────────────────────────
  const days = useMemo(() => (cursor ? gridDays(cursor.y, cursor.m) : []), [cursor]);
  const monthPrefix = cursor ? monthStartKey(cursor.y, cursor.m).slice(0, 7) : '';
  const byDay = useMemo(() => {
    const map = {};
    for (const d of days) map[d] = events.filter((e) => eventOnDay(e, d));
    return map;
  }, [days, events]);
  const monthEvents = useMemo(() => events.filter((e) => e.date.slice(0, 7) <= monthPrefix && eventEnd(e).slice(0, 7) >= monthPrefix), [events, monthPrefix]);
  const panelEvents = selectedDay ? (byDay[selectedDay] || events.filter((e) => eventOnDay(e, selectedDay))) : monthEvents;

  const monthTitle = cursor ? fmtDay(monthStartKey(cursor.y, cursor.m), { month: 'long', year: 'numeric' }) : '';
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => fmtDay(addDays('2026-01-04', i), { weekday: isMobile ? 'narrow' : 'short' })), [isMobile]);

  // ── Derived for list view ──────────────────────────────────────────────
  const listGroups = useMemo(() => {
    const groups = [];
    for (const e of events) {
      if (today && eventEnd(e) < today) continue;
      const mk = (e.date < today ? today : e.date).slice(0, 7);
      let g = groups[groups.length - 1];
      if (!g || g.month !== mk) { g = { month: mk, items: [] }; groups.push(g); }
      g.items.push(e);
    }
    return groups;
  }, [events, today]);

  const regionText = data ? [data.country, data.region].filter(Boolean).join(' · ') : '';

  // ── Render helpers ─────────────────────────────────────────────────────
  const lastYearChip = (e) => (canManage && e.lastYear ? (
    <span className="dcal-ly">{t('eventCalendar.lastYearChip', { orders: Number(e.lastYear.totalOrders || 0).toLocaleString(), revenue: formatCurrency(e.lastYear.revenue || 0) })}</span>
  ) : null);

  const eventRow = (e, { showDate = true } = {}) => {
    const st = categoryStyle(e);
    const start = dayMs(e.date);
    return (
      <button key={e.key} className="dcal-row" onClick={() => setOpenEvent(e)} style={{ opacity: e.hidden ? 0.55 : 1 }}>
        {showDate && (
          <div className="dcal-datebox" style={{ borderColor: st.border, background: st.bg }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: st.color, lineHeight: 1 }}>{new Date(start).getUTCDate()}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: st.color, textTransform: 'uppercase', marginTop: 2 }}>{fmtDay(e.date, { weekday: 'short' })}</div>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: st.color, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{e.name}</span>
            {e.tentative && <span className="dcal-badge-exp">{t('eventCalendar.expected')}</span>}
            {e.public && <span className="dcal-badge-pub">{t('eventCalendar.holiday')}</span>}
            {isEdited(e) && <span className="dcal-badge-edit" title={t('eventCalendar.override.editedNote')}><FaPen size={7} /> {t('eventCalendar.edited')}</span>}
            {e.hidden && <FaEyeSlash size={11} color="#94a3b8" title={t('eventCalendar.hidden')} />}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>{fmtRange(e, { day: 'numeric', month: 'short' })}</span>
            <span style={{ color: st.color, fontWeight: 600 }}>{categoryLabel(eventCategory(e))}</span>
            {e.expectedCrowd && e.expectedCrowd !== 'normal' && <span style={{ color: '#b45309', fontWeight: 600 }}>{t(`eventCalendar.crowd.${e.expectedCrowd}`)}</span>}
            {lastYearChip(e)}
          </div>
        </div>
        <div className="dcal-countdown">{countdownLabel(e, today)}</div>
      </button>
    );
  };

  // ── States ─────────────────────────────────────────────────────────────
  let body;
  if (error && !data) {
    body = (
      <div className="dcal-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
        {error.denied ? <FaLock size={28} color="#94a3b8" /> : <FaExclamationTriangle size={28} color="#f59e0b" />}
        <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
          {error.denied ? t('eventCalendar.noAccess') : error.missing ? t('eventCalendar.unavailable') : t('eventCalendar.loadFailed')}
        </div>
        {!error.denied && !error.missing && error.message && <div style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>{error.message}</div>}
        {!error.denied && restaurantId && (
          <button onClick={() => load({ fresh: true })} style={{ marginTop: 16, padding: '9px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>{t('common.retry')}</button>
        )}
      </div>
    );
  } else if (view === 'month') {
    body = (
      <>
        <div className="dcal-card" style={{ overflow: 'hidden', position: 'relative' }}>
          <div className="dcal-grid dcal-head">
            {weekdays.map((w, i) => <div key={i} className="dcal-wd">{w}</div>)}
          </div>
          <div className="dcal-grid" style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
            {days.map((d) => {
              const inMonth = d.slice(0, 7) === monthPrefix;
              const list = byDay[d] || [];
              const isToday = d === today;
              const isSel = d === selectedDay;
              const max = 2;
              return (
                <div key={d} role="button" tabIndex={0} aria-label={`${fmtDay(d, { day: 'numeric', month: 'long' })}${list.length ? ` · ${list.length}` : ''}`}
                  onClick={() => setSelectedDay(isSel ? null : d)}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setSelectedDay(isSel ? null : d); } }}
                  className={`dcal-cell${inMonth ? '' : ' dcal-out'}${isSel ? ' dcal-sel' : ''}`}>
                  <div className={`dcal-num${isToday ? ' dcal-today' : ''}`}>{dayMs(d) ? new Date(dayMs(d)).getUTCDate() : ''}</div>
                  <div className="dcal-chips">
                    {list.slice(0, max).map((e) => {
                      const st = categoryStyle(e);
                      return (
                        <span key={e.key} className="dcal-chip" title={isEdited(e) ? `${e.name} · ${t('eventCalendar.edited')}` : e.name}
                          onClick={(ev) => { ev.stopPropagation(); setOpenEvent(e); }}
                          style={{ background: st.bg, color: st.color, borderColor: st.border, opacity: e.hidden ? 0.5 : 1, borderStyle: e.tentative ? 'dashed' : 'solid' }}>
                          {isEdited(e) && <FaPen size={7} style={{ marginRight: 4, verticalAlign: 'baseline' }} />}{e.name}
                        </span>
                      );
                    })}
                    {list.length > max && <span className="dcal-more">{t('eventCalendar.more', { n: list.length - max })}</span>}
                  </div>
                  <div className="dcal-dots">
                    {list.slice(0, 3).map((e) => <span key={e.key} style={{ background: categoryStyle(e).color }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dcal-card" style={{ marginTop: 14, padding: '14px 14px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
              {selectedDay ? fmtDay(selectedDay, { weekday: 'long', day: 'numeric', month: 'long' }) : t('eventCalendar.thisMonth')}
            </div>
            {selectedDay && canManage && (
              <button onClick={() => setForm({ defaultDate: selectedDay })} className="dcal-linkbtn"><FaPlus size={10} /> {t('eventCalendar.addOnThisDay')}</button>
            )}
          </div>
          {loading && !data ? <div className="dcal-skel" /> : panelEvents.length === 0 ? (
            <div style={{ padding: '18px 4px', fontSize: 13, color: '#94a3b8' }}>{selectedDay ? t('eventCalendar.noEventsDay') : t('eventCalendar.noEventsMonth')}</div>
          ) : (
            <div>{panelEvents.map((e) => eventRow(e))}</div>
          )}
        </div>
      </>
    );
  } else {
    body = loading && !data ? (
      <div className="dcal-card" style={{ padding: 16 }}><div className="dcal-skel" /><div className="dcal-skel" /><div className="dcal-skel" /></div>
    ) : listGroups.length === 0 ? (
      <div className="dcal-card" style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
        <FaCalendarAlt size={28} color="#cbd5e1" />
        <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{t('eventCalendar.noUpcoming')}</div>
        {canManage && <div style={{ marginTop: 4, fontSize: 13 }}>{t('eventCalendar.noUpcomingHint')}</div>}
      </div>
    ) : (
      <div style={{ opacity: loading ? 0.6 : 1 }}>
        {listGroups.map((g) => (
          <div key={g.month} style={{ marginBottom: 16 }}>
            <div className="dcal-group">{fmtDay(`${g.month}-01`, { month: 'long', year: 'numeric' })}</div>
            <div className="dcal-card" style={{ padding: '4px 10px' }}>{g.items.map((e) => eventRow(e))}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dcal-page">
      <style>{`
        .dcal-page { min-height: 100vh; background: #f8fafc; padding: 24px 28px 48px; box-sizing: border-box; }
        .dcal-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
        .dcal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
        .dcal-head { border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .dcal-wd { padding: 8px 6px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; text-align: center; }
        .dcal-cell { min-height: 96px; padding: 6px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; cursor: pointer; outline: none; min-width: 0; transition: background .12s; }
        .dcal-cell:nth-child(7n) { border-right: none; }
        .dcal-cell:hover { background: #f8fafc; }
        .dcal-cell:focus-visible { box-shadow: inset 0 0 0 2px #6366f1; }
        .dcal-out { background: #fcfcfd; }
        .dcal-out .dcal-num { color: #cbd5e1; }
        .dcal-sel { background: #eef2ff !important; }
        .dcal-num { font-size: 12px; font-weight: 700; color: #334155; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 999px; }
        .dcal-today { background: #ef4444; color: #fff !important; }
        .dcal-chips { display: flex; flex-direction: column; gap: 3px; margin-top: 4px; }
        .dcal-chip { display: block; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 6px; border: 1px solid; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dcal-chip:hover { filter: brightness(.96); }
        .dcal-more { font-size: 11px; color: #64748b; font-weight: 600; padding-left: 4px; }
        .dcal-dots { display: none; gap: 3px; justify-content: center; margin-top: 4px; }
        .dcal-dots span { width: 6px; height: 6px; border-radius: 999px; display: block; }
        .dcal-row { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 6px; border: none; border-bottom: 1px solid #f1f5f9; background: transparent; cursor: pointer; font-family: inherit; }
        .dcal-row:last-child { border-bottom: none; }
        .dcal-row:hover { background: #f8fafc; }
        .dcal-datebox { width: 46px; height: 46px; border-radius: 10px; border: 1px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .dcal-countdown { font-size: 12px; font-weight: 700; color: #334155; white-space: nowrap; background: #f1f5f9; border-radius: 999px; padding: 3px 9px; flex-shrink: 0; }
        .dcal-badge-exp { font-size: 10px; font-weight: 700; color: #92400e; background: #fffbeb; border: 1px dashed #f59e0b; border-radius: 999px; padding: 1px 7px; }
        .dcal-badge-pub { font-size: 10px; font-weight: 700; color: #1d4ed8; background: #eff6ff; border-radius: 999px; padding: 1px 7px; }
        .dcal-badge-edit { font-size: 10px; font-weight: 700; color: #4338ca; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 999px; padding: 1px 7px; display: inline-flex; align-items: center; gap: 3px; }
        .dcal-ly { font-size: 11px; font-weight: 600; color: #047857; background: #ecfdf5; border-radius: 999px; padding: 1px 8px; }
        .dcal-group { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 8px 4px; }
        .dcal-linkbtn { display: inline-flex; align-items: center; gap: 6px; border: none; background: transparent; color: #4f46e5; font-weight: 700; font-size: 13px; cursor: pointer; }
        .dcal-seg { display: inline-flex; background: #f1f5f9; border-radius: 10px; padding: 3px; }
        .dcal-seg button { border: none; background: transparent; padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .dcal-seg button.on { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(15,23,42,.12); }
        .dcal-iconbtn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; color: #334155; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .dcal-btn { padding: 8px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; color: #0f172a; font-weight: 600; font-size: 13px; cursor: pointer; }
        .dcal-btn-ic { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; }
        .dcal-primary { padding: 9px 14px; border-radius: 10px; border: none; background: #0f172a; color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .dcal-legend { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 14px; }
        .dcal-legend button { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #334155; background: #fff; border: 1px solid #e2e8f0; border-radius: 999px; padding: 4px 10px; cursor: pointer; font-family: inherit; }
        .dcal-legend button.off { opacity: .45; text-decoration: line-through; }
        .dcal-legend i { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
        .dcal-skel { height: 44px; border-radius: 10px; margin: 6px 0; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%); background-size: 400% 100%; animation: dcalsk 1.2s ease infinite; }
        @keyframes dcalsk { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        @media (max-width: 640px) {
          .dcal-page { padding: 16px 12px 40px; }
          .dcal-cell { min-height: 52px; padding: 4px 2px; display: flex; flex-direction: column; align-items: center; }
          .dcal-chips { display: none; }
          .dcal-dots { display: flex; }
          .dcal-row { gap: 10px; }
          .dcal-countdown { font-size: 11px; padding: 2px 7px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{t('eventCalendar.title')}</h1>
          <div style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>
            {t('eventCalendar.subtitle')}{regionText ? ` · ${regionText}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="dcal-seg" role="tablist">
            <button role="tab" aria-selected={view === 'month'} className={view === 'month' ? 'on' : ''} onClick={() => changeView('month')}><FaCalendarAlt size={11} /> {t('eventCalendar.month')}</button>
            <button role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'on' : ''} onClick={() => changeView('list')}><FaList size={11} /> {t('eventCalendar.list')}</button>
          </div>
          {canManage && <button className="dcal-btn dcal-btn-ic" onClick={() => setImportOpen(true)}><FaFileImport size={12} /> {t('eventCalendar.import.button')}</button>}
          {canManage && <button className="dcal-primary" onClick={() => setForm({ defaultDate: selectedDay || today })}><FaPlus size={11} /> {t('eventCalendar.addEvent')}</button>}
        </div>
      </div>

      {/* Month navigation */}
      {view === 'month' && cursor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <button className="dcal-iconbtn" onClick={() => shiftMonth(-1)} aria-label={t('eventCalendar.prevMonth')}><FaChevronLeft size={12} /></button>
          <button className="dcal-iconbtn" onClick={() => shiftMonth(1)} aria-label={t('eventCalendar.nextMonth')}><FaChevronRight size={12} /></button>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginLeft: 4, flex: 1, minWidth: 0 }}>{monthTitle}</div>
          <button className="dcal-btn" onClick={goToday}>{t('eventCalendar.today')}</button>
        </div>
      )}

      {/* Legend (tap to filter) */}
      <div className="dcal-legend">
        {CALENDAR_CATEGORIES.map((c) => (
          <button key={c} className={hiddenCats.includes(c) ? 'off' : ''} onClick={() => toggleCat(c)} aria-pressed={!hiddenCats.includes(c)}>
            <i style={{ background: CATEGORY_STYLE[c].color }} /> {categoryLabel(c)}
          </button>
        ))}
        {canManage && hiddenCount > 0 && (
          <button onClick={() => setShowHidden((s) => !s)} aria-pressed={showHidden}>
            {showHidden ? <FaEye size={11} /> : <FaEyeSlash size={11} />} {t('eventCalendar.showHidden', { n: hiddenCount })}
          </button>
        )}
      </div>

      {body}

      {openEvent && (
        <EventDrawer event={openEvent} canManage={canManage} isMobile={isMobile} formatCurrency={formatCurrency}
          onClose={() => setOpenEvent(null)} onSaveOverride={saveOverride} onToggleHidden={toggleHidden}
          onEdit={(e) => setForm({ initial: e })} onDelete={deleteEvent}
          edited={isEdited(openEvent)} override={eventOverride(openEvent, data?.settings)}
          onSaveDateOverride={saveDateOverride} onResetOverride={resetDateOverride} />
      )}
      {importOpen && (
        <ImportEventsModal existing={existingCustom} onClose={() => setImportOpen(false)} onImport={importEvents} />
      )}
      {form && (
        <EventFormModal initial={form.initial} defaultDate={form.defaultDate} onClose={() => setForm(null)} onSubmit={submitForm} />
      )}
    </div>
  );
}
