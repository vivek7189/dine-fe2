'use client';

import { useEffect, useState } from 'react';
import { FaTimes, FaEyeSlash, FaEye, FaEdit, FaTrash, FaRedo, FaHistory } from 'react-icons/fa';
import { t } from '../../lib/i18n';
import { categoryLabel, categoryStyle, countdownLabel, eventCategory, fmtDay, fmtRange } from '../../lib/calendar';

const CROWDS = ['normal', 'busy', 'very_busy'];

/**
 * Side drawer (desktop) / bottom sheet (phone) with one event's details.
 * Managers can set expected crowd + notes, hide/show it, and edit/delete their own (custom) events.
 */
export default function EventDrawer({ event, canManage, isMobile, formatCurrency, onClose, onSaveOverride, onToggleHidden, onEdit, onDelete }) {
  const [crowd, setCrowd] = useState(event?.expectedCrowd || 'normal');
  const [notes, setNotes] = useState(event?.notes || '');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setCrowd(event?.expectedCrowd || 'normal');
    setNotes(event?.notes || '');
    setMsg(null);
    setConfirmDelete(false);
  }, [event?.key, event?.expectedCrowd, event?.notes]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!event) return null;
  const st = categoryStyle(event);
  const cat = eventCategory(event);
  const dirty = crowd !== (event.expectedCrowd || 'normal') || notes !== (event.notes || '');
  const isCustom = event.source === 'custom';

  const run = async (kind, fn) => {
    setBusy(kind); setMsg(null);
    try { await fn(); if (kind === 'save') setMsg({ ok: true, text: t('eventCalendar.saved') }); }
    catch (e) { setMsg({ ok: false, text: e?.message || t('eventCalendar.saveFailed') }); }
    finally { setBusy(''); }
  };

  const panelStyle = isMobile
    ? { position: 'fixed', left: 0, right: 0, bottom: 0, maxHeight: '88vh', borderRadius: '18px 18px 0 0', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }
    : { position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100vw', borderRadius: 0 };

  return (
    <div role="dialog" aria-modal="true" aria-label={event.name} style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.35)' }} />
      <div style={{ ...panelStyle, background: '#fff', boxShadow: '0 10px 40px rgba(15,23,42,0.18)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 5, background: st.color, flexShrink: 0 }} />
        <div style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 999, padding: '2px 9px' }}>{categoryLabel(cat)}</span>
              {event.public && <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', borderRadius: 999, padding: '2px 9px' }}>{t('eventCalendar.publicHoliday')}</span>}
              {event.tentative && <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: 999, padding: '2px 9px' }}>{t('eventCalendar.expected')}</span>}
              {event.hidden && <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f1f5f9', borderRadius: 999, padding: '2px 9px' }}>{t('eventCalendar.hidden')}</span>}
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>{event.name}</h2>
            <div style={{ marginTop: 6, fontSize: 14, color: '#475569' }}>
              {fmtRange(event, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              <span style={{ color: '#94a3b8' }}> · </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{countdownLabel(event)}</span>
            </div>
            {event.tentative && <div style={{ marginTop: 6, fontSize: 12, color: '#92400e' }}>{t('eventCalendar.tentativeNote')}</div>}
            {isCustom && event.repeatYearly && <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaRedo size={10} /> {t('eventCalendar.repeatsYearly')}</div>}
          </div>
          <button onClick={onClose} aria-label={t('common.close')} style={{ border: 'none', background: '#f1f5f9', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', color: '#475569', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </div>

        <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {event.impact && (
            <div style={{ fontSize: 13, color: '#334155' }}>
              <span style={{ color: '#64748b' }}>{t('eventCalendar.typicalDemand')}: </span>
              <strong>{t(`eventCalendar.impact.${event.impact}`)}</strong>
            </div>
          )}

          {canManage && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <FaHistory size={11} /> {t('eventCalendar.lastYear')}
              </div>
              {event.lastYear ? (
                <div style={{ marginTop: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{Number(event.lastYear.totalOrders || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{t('eventCalendar.orders')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(event.lastYear.revenue || 0)}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{t('eventCalendar.revenue')}</div>
                  </div>
                  {event.lastYear.date && <div style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'flex-end' }}>{fmtDay(event.lastYear.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                </div>
              ) : (
                <div style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>{t('eventCalendar.noLastYear')}</div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="dcal-crowd" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>{t('eventCalendar.expectedCrowd')}</label>
            {canManage ? (
              <select id="dcal-crowd" value={crowd} onChange={(e) => setCrowd(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff', color: '#0f172a' }}>
                {CROWDS.map((c) => <option key={c} value={c}>{t(`eventCalendar.crowd.${c}`)}</option>)}
              </select>
            ) : (
              <div style={{ fontSize: 14, color: '#0f172a' }}>{t(`eventCalendar.crowd.${event.expectedCrowd || 'normal'}`)}</div>
            )}
          </div>

          <div>
            <label htmlFor="dcal-notes" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>{t('eventCalendar.notes')}</label>
            {canManage ? (
              <textarea id="dcal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000}
                placeholder={t('eventCalendar.notesPlaceholder')}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            ) : (
              <div style={{ fontSize: 14, color: event.notes ? '#0f172a' : '#94a3b8', whiteSpace: 'pre-wrap' }}>{event.notes || t('eventCalendar.noNotes')}</div>
            )}
          </div>

          {canManage && (
            <button disabled={!dirty || !!busy} onClick={() => run('save', () => onSaveOverride(event, { expectedCrowd: crowd, notes }))}
              style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: dirty ? '#0f172a' : '#cbd5e1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: dirty && !busy ? 'pointer' : 'default' }}>
              {busy === 'save' ? t('eventCalendar.saving') : t('common.save')}
            </button>
          )}

          {msg && <div role="status" style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#047857' : '#b91c1c' }}>{msg.text}</div>}

          {canManage && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button disabled={!!busy} onClick={() => run('hide', () => onToggleHidden(event))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {event.hidden ? <><FaEye size={12} /> {t('eventCalendar.unhide')}</> : <><FaEyeSlash size={12} /> {t('eventCalendar.hide')}</>}
              </button>
              {isCustom && (
                <>
                  <button disabled={!!busy} onClick={() => onEdit(event)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <FaEdit size={12} /> {t('common.edit')}
                  </button>
                  {confirmDelete ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{t('eventCalendar.confirmDelete')}</span>
                      <button disabled={!!busy} onClick={() => run('delete', () => onDelete(event))}
                        style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        {busy === 'delete' ? t('common.deleting') : t('common.delete')}
                      </button>
                      <button onClick={() => setConfirmDelete(false)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: 13, cursor: 'pointer' }}>{t('common.cancel')}</button>
                    </span>
                  ) : (
                    <button disabled={!!busy} onClick={() => setConfirmDelete(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      <FaTrash size={11} /> {t('common.delete')}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
