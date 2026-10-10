'use client';

// Home: "you have a meeting" / "minutes to read" for anyone invited (MFC). Hidden when there's nothing.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../lib/api';

const UPCOMING_DAYS = 7;
const whenText = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

export default function MeetingsHomeCard({ restaurantId }) {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;
    let alive = true;
    apiClient.getMyMeetings(restaurantId).then(r => { if (alive) setData(r); }).catch(() => {});
    return () => { alive = false; };
  }, [restaurantId]);

  const now = Date.now();
  const meetings = data?.meetings || [];
  const upcoming = meetings
    .filter(m => m.status === 'scheduled' && new Date(m.scheduledAt).getTime() > now - 3600e3 && new Date(m.scheduledAt).getTime() < now + UPCOMING_DAYS * 864e5)
    .sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));
  const toRead = meetings.filter(m => m.minutesPublishedAt && !m.acknowledgedAt);
  if (!upcoming.length && !toRead.length) return null;

  const next = upcoming[0];
  return (
    <div onClick={() => router.push('/my-meetings')} role="button"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', marginBottom: 16, borderRadius: 14, border: '1px solid #c7d2fe', background: '#eef2ff', cursor: 'pointer' }}>
      <div style={{ minWidth: 0 }}>
        {next && (
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3730a3' }}>
            📅 Meeting: {next.title} — {whenText(next.scheduledAt)}{next.location ? ` · ${next.location}` : ''}
            {upcoming.length > 1 ? <span style={{ fontWeight: 500 }}> (+{upcoming.length - 1} more)</span> : null}
          </div>
        )}
        {toRead.length > 0 && (
          <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600, marginTop: next ? 4 : 0 }}>
            📄 {toRead.length === 1 ? `Minutes of “${toRead[0].title}” are out` : `${toRead.length} meeting minutes are out`} — please read and tap “I have read it”
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', whiteSpace: 'nowrap' }}>My Meetings →</div>
    </div>
  );
}
