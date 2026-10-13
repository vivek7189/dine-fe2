'use client';

// Announcements from the owner / managers to the team (MFC). Staff: the notices meant for them, newest
// and pinned first; opening one marks it read. Owner / managers: post a notice (everyone, roles or
// chosen staff, photos, pin, phone notification) and see who has read it.
// Shown on /announcements and /mobile/announcements (the phone app opens that one).

import { useEffect, useState } from 'react';
import apiClient from '../../lib/api';
import { MediaList } from '../meetings/MeetingMedia';

const card = { background: '#fff', border: '1px solid #eef0f3', borderRadius: 14, padding: 16, marginBottom: 12 };
const muted = { color: '#6b7280', fontSize: 13 };
const input = { width: '100%', padding: '9px 11px', border: '1px solid #d1d5db', borderRadius: 9, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' };
const btn = (primary) => ({ padding: '9px 16px', borderRadius: 9, border: primary ? 'none' : '1px solid #d1d5db', background: primary ? '#111827' : '#fff', color: primary ? '#fff' : '#374151', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' });
const chip = (on) => ({ padding: '5px 11px', borderRadius: 999, border: `1px solid ${on ? '#111827' : '#d1d5db'}`, background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' });
const pill = (bg, fg) => ({ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color: fg, whiteSpace: 'nowrap' });
const whenText = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const audienceText = (a) => (!a || a.everyone ? 'Everyone' : [...(a.roles || []), (a.staffIds || []).length ? `${a.staffIds.length} staff` : ''].filter(Boolean).join(', '));

const emptyDraft = () => ({ title: '', body: '', everyone: true, roles: [], staffIds: [], media: [], pinned: false, notify: true });

function Composer({ rid, roles, staff, onPosted }) {
  const [d, setD] = useState(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const set = (p) => setD(x => ({ ...x, ...p }));
  const toggle = (list, v) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

  const addPhotos = async (files) => {
    if (!files.length) return;
    setBusy(true); setMsg('');
    try { const got = await apiClient.uploadAnnouncementPhotos(rid, files); set({ media: [...d.media, ...got].slice(0, 8) }); }
    catch (e) { setMsg(e?.message || 'Could not add the photo'); }
    finally { setBusy(false); }
  };
  const post = async () => {
    if (!d.title.trim()) { setMsg('Write a title'); return; }
    if (!d.everyone && !d.roles.length && !d.staffIds.length) { setMsg('Choose who should see it'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await apiClient.createStaffAnnouncement(rid, {
        title: d.title, body: d.body, media: d.media, pinned: d.pinned, notify: d.notify,
        audience: d.everyone ? { everyone: true } : { roles: d.roles, staffIds: d.staffIds },
      });
      setD(emptyDraft());
      setMsg(`Posted to ${r.recipients} staff${r.notified ? ` · ${r.notified.push} phone notification${r.notified.push === 1 ? '' : 's'}${r.notified.whatsapp ? `, ${r.notified.whatsapp} WhatsApp` : ''}` : ''}`);
      onPosted();
    } catch (e) { setMsg(e?.message || 'Could not post'); }
    finally { setBusy(false); }
  };
  const shownStaff = staff.filter(s => !staffSearch || `${s.name} ${s.role}`.toLowerCase().includes(staffSearch.toLowerCase()));

  return (
    <div style={card}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>New announcement</div>
      <input style={input} placeholder="Title — e.g. Diwali opening hours" maxLength={150} value={d.title} onChange={e => set({ title: e.target.value })} />
      <textarea style={{ ...input, marginTop: 8, minHeight: 90, resize: 'vertical' }} placeholder="Message (optional)" maxLength={4000} value={d.body} onChange={e => set({ body: e.target.value })} />

      <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: '#374151' }}>Who should see it</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        <button type="button" style={chip(d.everyone)} onClick={() => set({ everyone: true, roles: [], staffIds: [] })}>Everyone</button>
        <button type="button" style={chip(!d.everyone)} onClick={() => set({ everyone: false })}>Choose roles / staff</button>
      </div>
      {!d.everyone && (
        <div style={{ marginTop: 8, border: '1px solid #eef0f3', borderRadius: 10, padding: 10 }}>
          <div style={{ ...muted, fontSize: 12 }}>Roles</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {roles.map(r => <button type="button" key={r} style={chip(d.roles.includes(r))} onClick={() => set({ roles: toggle(d.roles, r) })}>{r}</button>)}
          </div>
          <div style={{ ...muted, fontSize: 12, marginTop: 10 }}>Staff{d.staffIds.length ? ` · ${d.staffIds.length} chosen` : ''}</div>
          <input style={{ ...input, marginTop: 4, padding: '7px 10px', fontSize: 13 }} placeholder="Search staff" value={staffSearch} onChange={e => setStaffSearch(e.target.value)} />
          <div style={{ maxHeight: 180, overflow: 'auto', marginTop: 6 }}>
            {shownStaff.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px', fontSize: 13 }}>
                <input type="checkbox" checked={d.staffIds.includes(s.id)} onChange={() => set({ staffIds: toggle(d.staffIds, s.id) })} />
                {s.name || 'Unnamed'} <span style={{ ...muted, fontSize: 12 }}>{s.role}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {d.media.length > 0 && <div style={{ marginTop: 10 }}><MediaList media={d.media} onRemove={(p) => set({ media: d.media.filter(x => x.url !== p.url) })} /></div>}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
        <label style={{ ...btn(false), display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '7px 12px' }}>
          📷 Add photo
          <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={e => { addPhotos([...e.target.files]); e.target.value = ''; }} />
        </label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={d.pinned} onChange={e => set({ pinned: e.target.checked })} /> Pin to top</label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={d.notify} onChange={e => set({ notify: e.target.checked })} /> Send a phone notification</label>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <button type="button" style={btn(true)} disabled={busy} onClick={post}>{busy ? 'Please wait…' : 'Post announcement'}</button>
        {msg && <span style={{ fontSize: 13, color: /^Posted/.test(msg) ? '#047857' : '#b91c1c' }}>{msg}</span>}
      </div>
    </div>
  );
}

function ManagerItem({ a, rid, onChange }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const act = async (fn) => { setBusy(true); try { await fn(); onChange(); } catch (e) { alert(e?.message || 'Could not save'); } finally { setBusy(false); } };
  return (
    <div style={{ ...card, borderColor: a.pinned ? '#fde68a' : '#eef0f3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800 }}>{a.pinned ? '📌 ' : ''}{a.title}</div>
        <span style={pill(a.read.length === a.recipients ? '#ecfdf5' : '#f3f4f6', a.read.length === a.recipients ? '#047857' : '#374151')}>Read {a.read.length}/{a.recipients}</span>
      </div>
      <div style={{ ...muted, fontSize: 12 }}>{whenText(a.createdAt)}{a.createdByName ? ` · ${a.createdByName}` : ''} · {audienceText(a.audience)}</div>
      {a.body && <p style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>{a.body}</p>}
      {(a.media || []).length > 0 && <div style={{ marginTop: 8 }}><MediaList media={a.media} /></div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <button type="button" style={{ ...btn(false), padding: '6px 12px', fontSize: 12.5 }} onClick={() => setOpen(o => !o)}>{open ? 'Hide' : 'Who has read it'}</button>
        <button type="button" disabled={busy} style={{ ...btn(false), padding: '6px 12px', fontSize: 12.5 }} onClick={() => act(() => apiClient.updateStaffAnnouncement(rid, a.id, { pinned: !a.pinned }))}>{a.pinned ? 'Unpin' : 'Pin'}</button>
        <button type="button" disabled={busy || !a.notRead.length} style={{ ...btn(false), padding: '6px 12px', fontSize: 12.5 }} onClick={() => act(() => apiClient.updateStaffAnnouncement(rid, a.id, { notify: true }))}>Notify again</button>
        <button type="button" disabled={busy} style={{ ...btn(false), padding: '6px 12px', fontSize: 12.5, color: '#b91c1c', borderColor: '#fecaca' }} onClick={() => { if (confirm('Remove this announcement for everyone?')) act(() => apiClient.deleteStaffAnnouncement(rid, a.id)); }}>Remove</button>
      </div>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Read ({a.read.length})</div>
            {a.read.map(p => <div key={p.staffId} style={{ fontSize: 12.5 }}>{p.name} <span style={muted}>· {whenText(p.at)}</span></div>)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>Not yet ({a.notRead.length})</div>
            {a.notRead.map(p => <div key={p.staffId} style={{ fontSize: 12.5 }}>{p.name} <span style={muted}>· {p.role}</span></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnnouncementsView() {
  const [mine, setMine] = useState(null);
  const [all, setAll] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const rid = typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null;

  const load = async () => {
    if (!rid) { setError('Choose your restaurant first.'); return; }
    try {
      const m = await apiClient.getMyAnnouncements(rid);
      setMine(m); setError('');
      if (m.enabled && m.canPost) setAll(await apiClient.getStaffAnnouncements(rid));
    } catch (e) { setError(e?.message || 'Could not load announcements'); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const openOne = async (a) => {
    setOpenId(openId === a.id ? null : a.id);
    if (!a.readAt) {
      try { const r = await apiClient.markAnnouncementRead(rid, a.id); if (r?.at) setMine(m => ({ ...m, unread: Math.max(0, (m.unread || 0) - 1), announcements: m.announcements.map(x => (x.id === a.id ? { ...x, readAt: r.at } : x)) })); } catch (_) {}
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 120px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Announcements</h1>
      <p style={{ ...muted, margin: '0 0 16px' }}>{mine?.canPost ? 'Tell your team — they get a phone notification and see it here.' : 'Notices from your manager.'}</p>
      {error && <div style={{ ...card, color: '#b91c1c' }}>{error}</div>}
      {!mine && !error && <div style={muted}>Loading…</div>}
      {mine && !mine.enabled && <div style={card}>Announcements are not switched on for this restaurant.</div>}

      {mine?.enabled && mine.canPost && (
        <>
          <Composer rid={rid} roles={all?.roles || []} staff={all?.staff || []} onPosted={load} />
          {all && all.announcements.length === 0 && <div style={muted}>No announcements yet.</div>}
          {(all?.announcements || []).map(a => <ManagerItem key={a.id} a={a} rid={rid} onChange={load} />)}
        </>
      )}

      {mine?.enabled && !mine.canPost && (
        mine.announcements.length === 0 ? <div style={card}>Nothing yet. New notices from your manager will show here.</div>
          : mine.announcements.map(a => {
            const isOpen = openId === a.id;
            return (
              <div key={a.id} style={{ ...card, borderColor: a.readAt ? '#eef0f3' : '#93c5fd', background: a.readAt ? '#fff' : '#f8fbff', cursor: 'pointer' }} onClick={() => openOne(a)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontWeight: 800 }}>{a.pinned ? '📌 ' : ''}{a.title}</div>
                  {!a.readAt && <span style={pill('#dbeafe', '#1d4ed8')}>New</span>}
                </div>
                <div style={{ ...muted, fontSize: 12 }}>{whenText(a.createdAt)}{a.createdByName ? ` · ${a.createdByName}` : ''}</div>
                {a.body && <p style={{ fontSize: 14, whiteSpace: 'pre-wrap', margin: '8px 0 0', ...(isOpen ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>{a.body}</p>}
                {isOpen && (a.media || []).length > 0 && <div style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}><MediaList media={a.media} /></div>}
                {!isOpen && (a.media || []).length > 0 && <div style={{ ...muted, fontSize: 12, marginTop: 6 }}>📷 {a.media.length} photo{a.media.length > 1 ? 's' : ''} — tap to see</div>}
              </div>
            );
          })
      )}
    </div>
  );
}
