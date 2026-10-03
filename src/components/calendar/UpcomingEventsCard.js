'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { t } from '../../lib/i18n';
import { useCurrency } from '../../contexts/CurrencyContext';
import { calendarLang, categoryStyle, countdownLabel, fmtRange, getCachedCalendarAccess, noteCalendarResult, todayKey } from '../../lib/calendar';

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

  return (
    <div className="animate-in" style={{ marginBottom: 20, borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', padding: '12px 16px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
          <FaCalendarAlt color="#6366f1" /> {t('eventCalendar.upcomingTitle')}
        </div>
        <button onClick={() => router.push(href)} style={{ border: 'none', background: 'transparent', color: '#4f46e5', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {t('eventCalendar.openCalendar')} →
        </button>
      </div>
      <div style={{ marginTop: 6 }}>
        {events.slice(0, limit).map((e) => {
          const st = categoryStyle(e);
          return (
            <div key={e.key} onClick={() => router.push(href)} role="link" tabIndex={0}
              onKeyDown={(ev) => { if (ev.key === 'Enter') router.push(href); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid #f1f5f9', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: st.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.name}
                  {e.tentative && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: 999, padding: '1px 6px', verticalAlign: 'middle' }}>{t('eventCalendar.expected')}</span>}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span>{fmtRange(e, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  {e.lastYear && e.lastYear.revenue != null && (
                    <span style={{ color: '#047857', fontWeight: 600 }}>{t('eventCalendar.lastYearRevenue', { revenue: formatCurrency(e.lastYear.revenue || 0) })}</span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', background: '#f1f5f9', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>{countdownLabel(e, today)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
