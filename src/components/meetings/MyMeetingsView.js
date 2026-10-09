'use client';

// Staff side of Books → Meetings: my upcoming meetings, the minutes of past ones (with "I have read it"),
// and the goals / targets set for me or my role. Shown on its own page (/my-meetings) and on top of My Pay.

import { useEffect, useState } from 'react';
import apiClient from '../../lib/api';

const card = { background: '#fff', border: '1px solid #eef0f3', borderRadius: 14, padding: 16, marginBottom: 14 };
const muted = { color: '#6b7280', fontSize: 13 };
const h2 = { fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 10px' };
const pill = (bg, fg) => ({ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color: fg, whiteSpace: 'nowrap' });
const whenText = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const GOAL_LABEL = { target: 'Target', skill: 'Skill', promotion: 'Promotion', other: 'Goal' };
const UPCOMING_GRACE_MS = 6 * 3600e3;

export default function MyMeetingsView({ embedded = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const rid = typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null;

  const load = async () => {
    if (!rid) { setError('Choose your restaurant first.'); return; }
    try { setData(await apiClient.getMyMeetings(rid)); setError(''); }
    catch (e) { setError(e?.message || 'Could not load your meetings'); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const ack = async (m) => {
    setBusy(m.id);
    try { await apiClient.acknowledgeMeeting(rid, m.id); await load(); }
    catch (e) { setError(e?.message || 'Could not save'); }
    finally { setBusy(null); }
  };

  const meetings = data?.meetings || [];
  const goals = data?.goals || [];
  const now = Date.now();
  const upcoming = meetings.filter(m => m.status === 'scheduled' && new Date(m.scheduledAt).getTime() > now - UPCOMING_GRACE_MS)
    .sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));
  const toRead = meetings.filter(m => m.minutesPublishedAt && !m.acknowledgedAt);
  const done = meetings.filter(m => (m.minutesPublishedAt && m.acknowledgedAt) || m.status === 'cancelled');

  // On My Pay, stay out of the way when there's nothing for this person.
  if (embedded && (!data || (!upcoming.length && !toRead.length && !goals.length))) return null;

  const Minutes = ({ m }) => (
    <div style={{ border: `1px solid ${m.acknowledgedAt ? '#f3f4f6' : '#fde68a'}`, background: m.acknowledgedAt ? '#fff' : '#fffbeb', borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700 }}>{m.title}</div>
        {m.status === 'cancelled' ? <span style={pill('#fef2f2', '#b91c1c')}>Cancelled</span>
          : m.attended === 'present' || m.attended === 'late' ? <span style={pill('#ecfdf5', '#047857')}>You attended</span>
          : <span style={pill('#fef2f2', '#b91c1c')}>{m.attended === 'excused' ? 'Excused' : 'You missed it'}</span>}
      </div>
      <div style={{ ...muted, fontSize: 12 }}>{whenText(m.scheduledAt)}{m.location ? ` · ${m.location}` : ''}</div>
      {m.cancelledReason && <p style={{ ...muted, margin: '6px 0 0' }}>{m.cancelledReason}</p>}
      {m.minutes && <p style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', margin: '8px 0 0' }}><b>Conclusion:</b> {m.minutes}</p>}
      {m.decisions && <p style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', margin: '6px 0 0' }}><b>Decisions:</b> {m.decisions}</p>}
      {m.minutesPublishedAt && (m.acknowledgedAt
        ? <div style={{ fontSize: 12, color: '#047857', fontWeight: 600, marginTop: 8 }}>✓ You read this on {new Date(m.acknowledgedAt).toLocaleDateString()}</div>
        : <button type="button" disabled={busy === m.id} onClick={() => ack(m)} style={{ marginTop: 10, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#047857', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', opacity: busy === m.id ? 0.6 : 1 }}>{busy === m.id ? 'Saving…' : 'I have read it'}</button>)}
    </div>
  );

  return (
    <div style={embedded ? {} : { maxWidth: 760, margin: '0 auto', padding: 16 }}>
      {!embedded && (<>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '4px 0 2px' }}>My Meetings</h1>
        <p style={{ ...muted, margin: '0 0 16px' }}>{data?.me?.name ? `${data.me.name}${data.me.role ? ' · ' + data.me.role : ''}` : 'Your meetings, minutes and goals'}</p>
      </>)}
      {error && <div role="alert" style={{ ...card, background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c', fontSize: 14 }}>{error}</div>}
      {!data && !error && <div style={card}><span style={muted}>Loading…</span></div>}

      {data && (<>
        {toRead.length > 0 && (
          <section style={card}>
            <h2 style={h2}>Please read · {toRead.length}</h2>
            <div style={{ display: 'grid', gap: 8 }}>{toRead.map(m => <Minutes key={m.id} m={m} />)}</div>
          </section>
        )}
        {(upcoming.length > 0 || !embedded) && (
          <section style={card}>
            <h2 style={h2}>Upcoming meetings</h2>
            {!upcoming.length ? <p style={muted}>No meetings scheduled for you.</p> : (
              <div style={{ display: 'grid', gap: 8 }}>
                {upcoming.map(m => (
                  <div key={m.id} style={{ border: '1px solid #e0e7ff', background: '#fafaff', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>{m.title}</div>
                    <div style={{ ...muted, fontSize: 12.5 }}>{whenText(m.scheduledAt)} · {m.durationMin} min{m.location ? ` · ${m.location}` : ''}</div>
                    {m.agenda && <p style={{ fontSize: 13, whiteSpace: 'pre-wrap', margin: '6px 0 0' }}>{m.agenda}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {(goals.length > 0 || !embedded) && (
          <section style={card}>
            <h2 style={h2}>My goals &amp; targets</h2>
            {!goals.length ? <p style={muted}>No goals set for you yet.</p> : (
              <div style={{ display: 'grid', gap: 6 }}>
                {goals.map(g => (
                  <div key={`${g.meetingId}-${g.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{g.text}</div>
                      <div style={{ ...muted, fontSize: 12 }}>{g.target ? `${g.target} · ` : ''}{g.dueDate ? `by ${g.dueDate} · ` : ''}from “{g.meetingTitle}”</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={g.category === 'promotion' ? pill('#f5f3ff', '#6d28d9') : pill('#eef2ff', '#4338ca')}>{GOAL_LABEL[g.category] || 'Goal'}</span>
                      {g.status === 'achieved' ? <span style={pill('#ecfdf5', '#047857')}>Achieved</span> : g.status === 'missed' ? <span style={pill('#fef2f2', '#b91c1c')}>Missed</span> : <span style={pill('#fffbeb', '#b45309')}>Open</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {!embedded && done.length > 0 && (
          <section style={card}>
            <h2 style={h2}>Past meetings</h2>
            <div style={{ display: 'grid', gap: 8 }}>{done.map(m => <Minutes key={m.id} m={m} />)}</div>
          </section>
        )}
      </>)}
    </div>
  );
}
