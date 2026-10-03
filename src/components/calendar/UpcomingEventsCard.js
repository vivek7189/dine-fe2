'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { t } from '../../lib/i18n';
import { useCurrency } from '../../contexts/CurrencyContext';
import { calendarLang, categoryStyle, countdownLabel, getCachedCalendarAccess, noteCalendarResult, todayKey } from '../../lib/calendar';

/**
 * Home → "Upcoming events": the next few festivals / holidays / own events with a countdown and,
 * for managers (the API sends lastYear only to them), last year's revenue on that day.
 * Hidden when the calendar isn't available to this person (403), the backend lacks it (404),
 * or there's nothing coming up. Used by /home and /mobile/home (dine-app WebView).
 */
export default function UpcomingEventsCard({ restaurantId, limit = 3, style }) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [events, setEvents] = useState(null);

  useEffect(() => {
    if (!restaurantId) return undefined;
    // Already refused for this person (staff viewing off) — don't ask again on every visit.
    const cached = getCachedCalendarAccess(restaurantId);
    if (cached?.state === 'denied' && Date.now() - cached.at < 6 * 3600 * 1000) { setEvents([]); return undefined; }
    let cancelled = false;
    apiClient.getUpcomingEvents(restaurantId, { days: 45, lang: calendarLang() })
      .then((res) => {
        noteCalendarResult(restaurantId, null);
        if (cancelled) return;
        const list = Array.isArray(res?.events) ? res.events.filter((e) => !e.hidden) : [];
        setEvents(list);
      })
      .catch((err) => { noteCalendarResult(restaurantId, err); if (!cancelled) setEvents([]); });
    return () => { cancelled = true; };
  }, [restaurantId]);

  if (!events || events.length === 0) return null;
  const today = todayKey();
  const embed = typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
  const href = embed ? '/mobile/calendar' : '/calendar';

  // Compact one-line alert: the next event + how many more; the full list lives on the Calendar page.
  const next = events[0];
  const more = Math.min(events.length, limit) - 1;
  const st = categoryStyle(next);
  const go = () => router.push(href);
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <button type="button" onClick={go} className="animate-in"
        title={events.slice(0, limit).map((e) => `${e.name} — ${countdownLabel(e, today)}`).join('\n')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%', padding: '6px 12px', borderRadius: 999,
          border: '1px solid #e0e7ff', background: '#eef2ff', color: '#3730a3', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
        <FaCalendarAlt color="#6366f1" style={{ flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: 999, background: st.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{next.name}</span>
        <span style={{ fontWeight: 600, color: '#4f46e5', whiteSpace: 'nowrap', flexShrink: 0 }}>· {countdownLabel(next, today)}</span>
        {next.lastYear && next.lastYear.revenue != null && (
          <span className="hidden sm:inline" style={{ color: '#047857', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>· {t('eventCalendar.lastYearRevenue', { revenue: formatCurrency(next.lastYear.revenue || 0) })}</span>
        )}
        {more > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, background: '#fff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: 999, padding: '1px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>+{more}</span>
        )}
        <span aria-hidden style={{ color: '#6366f1', flexShrink: 0 }}>→</span>
      </button>
    </div>
  );
}
