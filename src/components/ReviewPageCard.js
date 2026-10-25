'use client';

// Google Reviews → Collect: the "Review page" (a DineOpen star page in front of the Google review
// link — /review/<restaurantId>). Shown only where DineOpen made it available for the restaurant.
// On/off switch, its own QR + link, last-30-day numbers and the private feedback from 1–3 star visits.
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

const fmtWhen = (iso) => {
  try { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch (_) { return ''; }
};

export default function ReviewPageCard({ restaurantId, cardStyle, isMobile }) {
  const [data, setData] = useState(null);
  const [qr, setQr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await apiClient.get(`/api/google-reviews/review-page/${restaurantId}`);
      setData(r && r.success ? r : { allowed: false });
    } catch (_) { setData({ allowed: false }); }
  };
  useEffect(() => { if (restaurantId) load(); }, [restaurantId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!data || !data.pageUrl) return;
    let alive = true;
    import('qrcode').then((QR) => (QR.default || QR).toDataURL(data.pageUrl, { width: 480, margin: 2 }))
      .then((d) => { if (alive) setQr(d); }).catch(() => {});
    return () => { alive = false; };
  }, [data?.pageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data || !data.allowed) return null;

  const toggle = async () => {
    setBusy(true); setMsg('');
    try {
      await apiClient.post(`/api/google-reviews/review-page/${restaurantId}`, { enabled: !data.enabled });
      await load();
    } catch (e) { setMsg(e?.message || 'Could not save'); }
    setBusy(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.pageUrl); setMsg('Link copied'); } catch (_) { setMsg(data.pageUrl); }
  };
  const download = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr; a.download = 'review-page-qr.png'; a.click();
  };

  const s = data.stats || {};
  const tiles = [
    ['Ratings', s.rated], ['Average', s.avg != null ? `${s.avg} ★` : '—'], ['Went to Google', s.toGoogle], ['Private feedback', s.feedback],
  ];

  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>Review page</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', maxWidth: 560, lineHeight: 1.5 }}>
            Customers tap stars first. 4–5 stars get a big &quot;Write a Google review&quot; button; 1–3 stars first get a private box to tell you what went wrong (the Google button stays available to everyone).
          </p>
        </div>
        <button onClick={toggle} disabled={busy} aria-label="Review page on/off"
          style={{ position: 'relative', width: 50, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: data.enabled ? '#16a34a' : '#d1d5db', flexShrink: 0, opacity: busy ? 0.6 : 1 }}>
          <span style={{ position: 'absolute', top: 3, left: data.enabled ? 25 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left .2s' }} />
        </button>
      </div>

      {!data.hasGoogleLink && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '8px 12px' }}>
          Add your Google review link in Settings first — the page needs it.
        </div>
      )}
      {msg && <div style={{ marginTop: 10, fontSize: 13, color: '#166534', wordBreak: 'break-all' }}>{msg}</div>}

      {data.enabled && (
        <>
          <div style={{ display: 'flex', gap: 20, marginTop: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ textAlign: 'center' }}>
              {qr
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={qr} alt="Review page QR" style={{ width: 170, height: 170, border: '1px solid #e5e7eb', borderRadius: 12 }} />
                : <div style={{ width: 170, height: 170, background: '#f3f4f6', borderRadius: 12 }} />}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                <button onClick={download} style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Download QR</button>
                <button onClick={copy} style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Copy link</button>
              </div>
            </div>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Use this QR on tables and bills instead of the plain Google QR. Last {data.days} days:</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
                {tiles.map(([k, v]) => (
                  <div key={k} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{k}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{v ?? 0}</div>
                  </div>
                ))}
              </div>
              <a href={data.pageUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: '#1a73e8' }}>Open the page ↗</a>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Private feedback</div>
            {(!data.feedback || data.feedback.length === 0) ? (
              <div style={{ fontSize: 13, color: '#9ca3af' }}>Nothing yet. Feedback from 1–3 star visits shows here.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.feedback.map((f, i) => (
                  <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#6b7280' }}>
                      <span><span style={{ color: '#f59e0b' }}>{'★'.repeat(f.rating || 0)}</span><span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - (f.rating || 0))}</span>{f.name ? ` · ${f.name}` : ''}{f.phone ? ` · ${f.phone}` : ''}{f.wentToGoogle ? ' · went to Google' : ''}</span>
                      <span>{fmtWhen(f.at)}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#1f2937', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{f.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
