'use client';

// One person's dates: birthday (+ share with the team), wedding anniversary, and important personal
// dates — prayer / religious day, own or family wedding, child birth, family event, medical, other
// (own words), once or every year, one day or a few, private or shared with the team.
// Used by the staff member (My Shifts → My dates, `self`) and by managers (Shift Scheduling →
// Calendar). Birthday / anniversary are saved with the Staff Profile; important dates one by one
// (/api/staff-dates). `onRequestLeave(from, to, reason)` lets staff ask for leave for a date.

import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaUsers, FaLock, FaRedo } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { IMPORTANT_TYPES } from './constants';

const inp = { width: '100%', padding: '9px 11px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, background: '#fff', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const btn = (primary) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: primary ? 'none' : '1px solid #e5e7eb', background: primary ? '#111827' : '#fff', color: primary ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' });
const nice = (ymd, withYear = true) => {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
};
const blank = () => ({ id: null, type: 'religious', label: '', date: '', endDate: '', yearly: false, note: '', share: false, askLeave: false });

export default function StaffDatesEditor({ restaurantId, staffId, self = false, onSaved, onRequestLeave, isMobile }) {
  const [profile, setProfile] = useState(null);
  const [who, setWho] = useState(null);       // { id, name }
  const [canEdit, setCanEdit] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState('');
  const [form, setForm] = useState(null);     // important date being added / changed
  const [personal, setPersonal] = useState(null); // { dateOfBirth, shareBirthday, weddingAnniversary } while changed

  const load = async () => {
    setErr('');
    try {
      const r = self ? await apiClient.getMyStaffProfile() : await apiClient.getStaffProfile(staffId);
      setProfile(r?.profile || {}); setWho(r?.staff || { id: staffId });
      setCanEdit((r?.access?.edit || []).includes('personal'));
      setPersonal(null);
    } catch (e) { setErr(e?.message || 'Could not load the dates'); }
  };
  useEffect(() => { setProfile(null); setForm(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [staffId, self]);
  const flash = (t) => { setOk(t); setTimeout(() => setOk(''), 4000); };

  const savePersonal = async () => {
    setBusy('personal'); setErr('');
    try {
      const { importantDates, ...rest } = profile; // eslint-disable-line no-unused-vars
      const body = { ...rest, ...personal };
      const r = self ? await apiClient.saveMyStaffProfile(body) : await apiClient.saveStaffProfile(staffId, body);
      setProfile(p => ({ ...p, ...(r?.profile || body), importantDates: p.importantDates })); setPersonal(null);
      flash('Saved'); onSaved && onSaved();
    } catch (e) { setErr(e?.message || 'Could not save'); }
    finally { setBusy(''); }
  };

  const saveDate = async () => {
    const f = form;
    if (!f.date) return setErr('Choose the date');
    if (f.type === 'other' && !f.label.trim()) return setErr('Say what the day is');
    if (f.endDate && f.endDate < f.date) return setErr('“Until” must be on or after the date');
    setBusy('date'); setErr('');
    try {
      const r = await apiClient.saveStaffImportantDate(restaurantId, who.id, {
        ...(f.id ? { id: f.id } : {}), type: f.type, label: f.label.trim(), date: f.date, endDate: f.endDate || '', yearly: f.yearly, note: f.note.trim(), share: f.share,
      });
      setProfile(p => ({ ...p, importantDates: r?.importantDates || p.importantDates }));
      setForm(null); flash(f.id ? 'Date updated' : 'Date added');
      onSaved && onSaved();
      if (f.askLeave && onRequestLeave) onRequestLeave(f.date, f.endDate || f.date, f.label.trim() || (IMPORTANT_TYPES.find(t => t[0] === f.type) || [])[1] || '');
    } catch (e) { setErr(e?.message || 'Could not save the date'); }
    finally { setBusy(''); }
  };
  const removeDate = async (d) => {
    setBusy(`del-${d.id}`); setErr('');
    try {
      const r = await apiClient.deleteStaffImportantDate(restaurantId, who.id, d.id);
      setProfile(p => ({ ...p, importantDates: r?.importantDates || [] }));
      onSaved && onSaved();
    } catch (e) { setErr(e?.message || 'Could not remove it'); }
    finally { setBusy(''); }
  };

  if (!profile) return <div style={{ fontSize: 13, color: err ? '#b91c1c' : '#9ca3af', padding: 8 }}>{err || 'Loading…'}</div>;
  const pv = { dateOfBirth: profile.dateOfBirth || '', shareBirthday: !!profile.shareBirthday, weddingAnniversary: profile.weddingAnniversary || '', ...(personal || {}) };
  const setP = (patch) => setPersonal(x => ({ ...(x || {}), ...patch }));
  const list = [...(profile.importantDates || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const typeOf = (k) => IMPORTANT_TYPES.find(t => t[0] === k) || IMPORTANT_TYPES[6];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {err && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: 9, padding: '8px 12px', fontSize: 13 }}>{err}</div>}
      {ok && <div role="status" style={{ background: '#f0fdf4', color: '#166534', borderRadius: 9, padding: '8px 12px', fontSize: 13 }}>{ok}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>🎂 Birthday</label>
          <input type="date" disabled={!canEdit} value={pv.dateOfBirth} onChange={e => setP({ dateOfBirth: e.target.value })} style={inp} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#4b5563', marginTop: 6, cursor: canEdit ? 'pointer' : 'default' }}>
            <input type="checkbox" disabled={!canEdit} checked={pv.shareBirthday} onChange={e => setP({ shareBirthday: e.target.checked })} />
            Team can see it (day only — never the year)
          </label>
        </div>
        <div>
          <label style={lbl}>💍 Wedding anniversary <span style={{ color: '#9ca3af', fontWeight: 500 }}>(optional)</span></label>
          <input type="date" disabled={!canEdit} value={pv.weddingAnniversary} onChange={e => setP({ weddingAnniversary: e.target.value })} style={inp} />
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Only {self ? 'you and your managers' : 'they and their managers'} see it.</div>
        </div>
      </div>
      {personal && canEdit && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" disabled={busy === 'personal'} onClick={savePersonal} style={btn(true)}>{busy === 'personal' ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={() => setPersonal(null)} style={btn(false)}>Cancel</button>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>Important days</div>
          {canEdit && !form && <button type="button" onClick={() => setForm(blank())} style={{ ...btn(false), padding: '6px 11px', fontSize: 12.5 }}><FaPlus size={10} /> Add a day</button>}
        </div>
        {!list.length && !form && <div style={{ fontSize: 13, color: '#6b7280' }}>{self ? 'Prayer days, a wedding, a child’s birth, a family event — add the days you’d like your manager to plan around.' : 'No important days added yet.'}</div>}
        <div style={{ display: 'grid', gap: 6 }}>
          {list.map(d => {
            const t = typeOf(d.type);
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', border: '1px solid #f1f5f9', borderRadius: 10, background: '#fff' }}>
                <span style={{ fontSize: 18 }}>{t[2]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{d.label || t[1]}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>{nice(d.date, !d.yearly)}{d.endDate ? ` – ${nice(d.endDate, !d.yearly)}` : ''}</span>
                    {d.yearly && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><FaRedo size={8} /> every year</span>}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{d.share ? <><FaUsers size={10} /> team can see</> : <><FaLock size={9} /> managers only</>}</span>
                  </div>
                  {d.note && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>{d.note}</div>}
                </div>
                {canEdit && (<>
                  <button type="button" aria-label="Change" onClick={() => setForm({ ...blank(), ...d, endDate: d.endDate || '', askLeave: false })} style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}><FaEdit size={13} /></button>
                  <button type="button" aria-label="Remove" disabled={busy === `del-${d.id}`} onClick={() => removeDate(d)} style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', padding: 4 }}><FaTrash size={12} /></button>
                </>)}
              </div>
            );
          })}
        </div>

        {form && (
          <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#fafafa', display: 'grid', gap: 12 }}>
            <div>
              <label style={lbl}>What is it?</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {IMPORTANT_TYPES.map(([k, name, icon]) => (
                  <button key={k} type="button" onClick={() => setForm(f => ({ ...f, type: k }))}
                    style={{ padding: '6px 11px', borderRadius: 999, border: `1px solid ${form.type === k ? '#111827' : '#e5e7eb'}`, background: form.type === k ? '#111827' : '#fff', color: form.type === k ? '#fff' : '#374151', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                    {icon} {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Name {form.type === 'other' ? '' : <span style={{ color: '#9ca3af', fontWeight: 500 }}>(optional)</span>}</label>
              <input style={inp} maxLength={60} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder={form.type === 'religious' ? 'e.g. Friday prayers, Sabbath, Ramadan, Karva Chauth' : form.type === 'family_wedding' ? 'e.g. Sister’s wedding' : 'Short name'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Date</label><input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><label style={lbl}>Until <span style={{ color: '#9ca3af', fontWeight: 500 }}>(if more than a day)</span></label><input type="date" style={inp} min={form.date || undefined} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div><label style={lbl}>Note <span style={{ color: '#9ca3af', fontWeight: 500 }}>(only managers see it)</span></label><input style={inp} maxLength={200} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Needs 1–2 pm off for prayers" /></div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}><input type="checkbox" checked={form.yearly} onChange={e => setForm(f => ({ ...f, yearly: e.target.checked }))} /> Every year on this date</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}><input type="checkbox" checked={form.share} onChange={e => setForm(f => ({ ...f, share: e.target.checked }))} /> Team can see it (the name only)</label>
              {self && onRequestLeave && !form.id && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}><input type="checkbox" checked={form.askLeave} onChange={e => setForm(f => ({ ...f, askLeave: e.target.checked }))} /> I need leave on these days — open the leave request</label>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" disabled={busy === 'date'} onClick={saveDate} style={btn(true)}>{busy === 'date' ? 'Saving…' : form.id ? 'Save' : 'Add'}</button>
              <button type="button" onClick={() => { setForm(null); setErr(''); }} style={btn(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
