'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { t } from '../../lib/i18n';
import { calendarLang, noteCalendarResult, todayKey } from '../../lib/calendar';

// Regions the backend auto-detects (ISO-3166-2 subdivision codes without the country prefix).
const REGIONS = {
  IN: { AN: 'Andaman & Nicobar', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', CT: 'Chhattisgarh', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh', JK: 'Jammu & Kashmir', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Odisha', PY: 'Puducherry', PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh', UT: 'Uttarakhand', WB: 'West Bengal' },
  AE: { AZ: 'Abu Dhabi', AJ: 'Ajman', DU: 'Dubai', FU: 'Fujairah', RK: 'Ras Al Khaimah', SH: 'Sharjah', UQ: 'Umm Al Quwain' },
};

const TOGGLES = [
  { key: 'staffCanView', label: 'eventCalendar.settings.staffCanView', hint: 'eventCalendar.settings.staffCanViewHint' },
  { key: 'showPublicHolidays', label: 'eventCalendar.settings.showPublicHolidays', hint: 'eventCalendar.settings.showPublicHolidaysHint' },
  { key: 'showFestivals', label: 'eventCalendar.settings.showFestivals', hint: 'eventCalendar.settings.showFestivalsHint' },
  { key: 'showCommercial', label: 'eventCalendar.settings.showCommercial', hint: 'eventCalendar.settings.showCommercialHint' },
];

/** Admin → Calendar: region + what the calendar shows. Owner / admin / co-owner / manager. */
export default function CalendarSettingsPanel({ restaurantId, isMobile }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null); // { country, region, regionSource }
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState('');
  const [msg, setMsg] = useState(null);
  const [regionDraft, setRegionDraft] = useState('');

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError(null);
    try {
      const day = todayKey();
      const res = await apiClient.getCalendar(restaurantId, { from: day, to: day, lang: calendarLang() });
      noteCalendarResult(restaurantId, null);
      const s = res?.settings || {};
      setSettings(s);
      setInfo({ country: res?.country || '', region: res?.region ?? s.region ?? null, regionSource: res?.regionSource || s.regionSource || 'auto' });
      setRegionDraft(res?.region ?? s.region ?? '');
    } catch (err) {
      noteCalendarResult(restaurantId, err);
      setError(err);
    } finally { setLoading(false); }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const save = async (kind, partial) => {
    setSaving(kind); setMsg(null);
    try {
      const res = await apiClient.updateCalendarSettings(restaurantId, partial);
      const merged = (res && res.settings && typeof res.settings === 'object') ? res.settings : { ...settings, ...partial };
      setSettings(merged);
      if ('region' in partial || 'regionSource' in partial) await load();
      setMsg({ ok: true, text: t('eventCalendar.saved') });
    } catch (err) {
      setMsg({ ok: false, text: err?.message || t('eventCalendar.saveFailed') });
    } finally { setSaving(''); setTimeout(() => setMsg(null), 3000); }
  };

  const card = { backgroundColor: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
  const regions = REGIONS[String(info?.country || '').toUpperCase()] || null;
  const regionName = (code) => (regions && regions[code]) || code;

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FaCalendarAlt color="#6366f1" /> {t('eventCalendar.settings.title')}</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{t('eventCalendar.settings.subtitle')}</p>
        </div>
        <Link href="/calendar" style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', textDecoration: 'none' }}>{t('eventCalendar.openCalendar')} →</Link>
      </div>

      {!restaurantId ? (
        <div style={{ color: '#6b7280' }}>{t('eventCalendar.noRestaurant')}</div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}><FaSpinner className="animate-spin" style={{ fontSize: 22 }} /></div>
      ) : error ? (
        <div style={{ ...card, color: '#b91c1c' }}>
          {error.status === 403 ? t('eventCalendar.noAccess') : error.status === 404 ? t('eventCalendar.unavailable') : (error.message || t('eventCalendar.loadFailed'))}
          {error.status !== 403 && <button onClick={load} style={{ marginLeft: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>{t('common.retry')}</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
          {/* Region */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}><FaMapMarkerAlt color="#6b7280" /> {t('eventCalendar.settings.region')}</div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
              {info?.country ? `${info.country}${info?.region ? ` · ${regionName(info.region)}` : ''}` : t('eventCalendar.settings.noCountry')}
              {info?.regionSource === 'auto' && info?.region && (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#047857', background: '#ecfdf5', borderRadius: 999, padding: '2px 8px' }}>{t('eventCalendar.settings.detectedFromAddress')}</span>
              )}
              {info?.regionSource === 'manual' && (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', borderRadius: 999, padding: '2px 8px' }}>{t('eventCalendar.settings.setManually')}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {regions ? (
                <select value={regionDraft || ''} onChange={(e) => setRegionDraft(e.target.value)} aria-label={t('eventCalendar.settings.region')}
                  style={{ flex: '1 1 220px', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#374151', background: '#fff' }}>
                  <option value="">{t('eventCalendar.settings.wholeCountry')}</option>
                  {Object.entries(regions).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              ) : (
                <input value={regionDraft || ''} onChange={(e) => setRegionDraft(e.target.value.toUpperCase().slice(0, 6))} placeholder={t('eventCalendar.settings.regionCodePlaceholder')}
                  aria-label={t('eventCalendar.settings.region')}
                  style={{ flex: '1 1 220px', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }} />
              )}
              <button disabled={!!saving || (regionDraft || '') === (info?.region || '')}
                onClick={() => save('region', { region: regionDraft || null, regionSource: 'manual' })}
                style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: (saving || (regionDraft || '') === (info?.region || '')) ? 0.5 : 1 }}>
                {saving === 'region' ? t('eventCalendar.saving') : t('common.save')}
              </button>
              {info?.regionSource === 'manual' && (
                <button disabled={!!saving} onClick={() => save('region', { region: null, regionSource: 'auto' })}
                  style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {t('eventCalendar.settings.useDetected')}
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>{t('eventCalendar.settings.regionHint')}</div>
          </div>

          {/* Toggles */}
          <div style={card}>
            {TOGGLES.map(({ key, label, hint }, i) => {
              const on = settings?.[key] !== false;
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0, borderTop: i ? '1px solid #f3f4f6' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{t(label)}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{t(hint)}</div>
                  </div>
                  <button role="switch" aria-checked={on} aria-label={t(label)} disabled={!!saving} onClick={() => save(key, { [key]: !on })}
                    style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', backgroundColor: on ? '#ef4444' : '#d1d5db', position: 'relative', transition: 'background-color 0.2s', flexShrink: 0, opacity: saving === key ? 0.6 : 1 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', position: 'absolute', top: 2, left: on ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              );
            })}
          </div>
          {msg && <div role="status" style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#059669' : '#dc2626' }}>{msg.text}</div>}
        </div>
      )}
    </div>
  );
}
