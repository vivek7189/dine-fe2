'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { t } from '../../lib/i18n';
import { CALENDAR_CATEGORIES } from '../../lib/calendar';

const CROWDS = ['normal', 'busy', 'very_busy'];

/** Add / edit a restaurant's own (custom) event. */
export default function EventFormModal({ initial, defaultDate, onClose, onSubmit }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    date: initial?.date || defaultDate || '',
    endDate: initial?.endDate && initial.endDate !== initial.date ? initial.endDate : '',
    category: initial?.category || 'custom',
    repeatYearly: typeof initial?.repeatYearly === 'boolean' ? initial.repeatYearly : true,
    expectedCrowd: initial?.expectedCrowd || 'normal',
    notes: initial?.notes || '',
  }));
  // When editing an event whose repeat flag the list API didn't send, only send it if changed.
  const repeatKnown = !initial || typeof initial.repeatYearly === 'boolean';
  const [repeatTouched, setRepeatTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { setError(t('eventCalendar.form.nameRequired')); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) { setError(t('eventCalendar.form.dateRequired')); return; }
    if (form.endDate && form.endDate < form.date) { setError(t('eventCalendar.form.endBeforeStart')); return; }
    setSaving(true); setError('');
    try {
      await onSubmit({
        name,
        date: form.date,
        endDate: form.endDate || null,
        category: form.category,
        ...(repeatKnown || repeatTouched ? { repeatYearly: !!form.repeatYearly } : {}),
        expectedCrowd: form.expectedCrowd,
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err?.message || t('eventCalendar.saveFailed'));
      setSaving(false);
    }
  };

  const input = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', background: '#fff', color: '#0f172a', fontFamily: 'inherit' };
  const label = { display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 };

  return (
    <div role="dialog" aria-modal="true" aria-label={editing ? t('eventCalendar.form.editTitle') : t('eventCalendar.form.addTitle')}
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }} />
      <form onSubmit={submit} style={{ position: 'relative', width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(15,23,42,0.25)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{editing ? t('eventCalendar.form.editTitle') : t('eventCalendar.form.addTitle')}</h2>
          <button type="button" onClick={onClose} aria-label={t('common.close')} style={{ border: 'none', background: '#f1f5f9', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label htmlFor="dcal-f-name" style={label}>{t('eventCalendar.form.name')}</label>
            <input id="dcal-f-name" autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={120} placeholder={t('eventCalendar.form.namePlaceholder')} style={input} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}>
              <label htmlFor="dcal-f-date" style={label}>{t('eventCalendar.form.date')}</label>
              <input id="dcal-f-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={input} />
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <label htmlFor="dcal-f-end" style={label}>{t('eventCalendar.form.endDate')}</label>
              <input id="dcal-f-end" type="date" value={form.endDate} min={form.date || undefined} onChange={(e) => set('endDate', e.target.value)} style={input} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}>
              <label htmlFor="dcal-f-cat" style={label}>{t('eventCalendar.form.category')}</label>
              <select id="dcal-f-cat" value={form.category} onChange={(e) => set('category', e.target.value)} style={input}>
                {CALENDAR_CATEGORIES.map((c) => <option key={c} value={c}>{t(`eventCalendar.categories.${c}`)}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <label htmlFor="dcal-f-crowd" style={label}>{t('eventCalendar.expectedCrowd')}</label>
              <select id="dcal-f-crowd" value={form.expectedCrowd} onChange={(e) => set('expectedCrowd', e.target.value)} style={input}>
                {CROWDS.map((c) => <option key={c} value={c}>{t(`eventCalendar.crowd.${c}`)}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#0f172a', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.repeatYearly} onChange={(e) => { setRepeatTouched(true); set('repeatYearly', e.target.checked); }} style={{ width: 18, height: 18 }} />
            {t('eventCalendar.form.repeatYearly')}
          </label>
          <div>
            <label htmlFor="dcal-f-notes" style={label}>{t('eventCalendar.notes')}</label>
            <textarea id="dcal-f-notes" rows={3} value={form.notes} maxLength={1000} onChange={(e) => set('notes', e.target.value)} placeholder={t('eventCalendar.notesPlaceholder')} style={{ ...input, resize: 'vertical' }} />
          </div>
          {error && <div role="alert" style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>{t('common.cancel')}</button>
            <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? t('eventCalendar.saving') : (editing ? t('common.save') : t('eventCalendar.addEvent'))}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
