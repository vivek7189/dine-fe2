'use client';

// Review star page — what the restaurant's review QR opens (when its owner turned it on).
// Stars first. 4–5 → "Write a Google review" (big). 1–3 → a private box to tell the restaurant
// what went wrong, and the Google button is still there (smaller): nobody is kept from Google and
// no review is written for the customer — they write it on Google in their own words.
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const C = { ink: '#1f2937', soft: '#6b7280', line: '#e5e7eb', star: '#f59e0b', blue: '#1a73e8', green: '#16a34a', bg: '#f7f7f5' };
const WORDS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Loved it!'];

function newVisitId() {
  try {
    const a = new Uint8Array(12);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

export default function ReviewPage() {
  const { restaurantId } = useParams();
  const [info, setInfo] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [liked, setLiked] = useState([]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const visitId = useRef(null);

  useEffect(() => {
    visitId.current = newVisitId();
    fetch(`${API_URL}/api/google-reviews/public/review-page/${encodeURIComponent(restaurantId)}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok && j && j.success) { setInfo(j); setState('ready'); } else setState('missing');
      })
      .catch(() => setState('missing'));
  }, [restaurantId]);

  const record = (body, keepalive = false) =>
    fetch(`${API_URL}/api/google-reviews/public/review-page/${encodeURIComponent(restaurantId)}/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitId: visitId.current, ...body }),
      keepalive,
    }).catch(() => {});

  const pick = (n) => {
    setRating(n);
    record({ rating: n });
  };

  const toggleLiked = (x) => {
    const next = liked.includes(x) ? liked.filter((v) => v !== x) : [...liked, x];
    setLiked(next);
    record({ liked: next });
  };

  const goGoogle = () => {
    record({ google: true, ...(liked.length ? { liked } : {}) }, true);
    window.location.href = info.reviewUrl;
  };

  const sendFeedback = async () => {
    if (!message.trim()) return;
    setSending(true);
    await record({ message: message.trim(), name: name.trim(), phone: phone.trim() });
    setSending(false);
    setSent(true);
  };

  const shell = (children) => (
    <main style={{ minHeight: '100vh', background: C.bg, display: 'flex', justifyContent: 'center', padding: '28px 16px 40px', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', color: C.ink }}>
      <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
    </main>
  );

  if (state === 'loading') return shell(<div style={{ textAlign: 'center', color: C.soft, paddingTop: 80 }}>Loading…</div>);
  if (state === 'missing') return shell(<div style={{ textAlign: 'center', color: C.soft, paddingTop: 80 }}>This review page isn&apos;t available.</div>);

  const shown = hover || rating;
  const happy = rating >= 4;
  const card = { background: 'white', borderRadius: 20, padding: '24px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' };
  const googleBtn = (big) => (
    <button type="button" onClick={goGoogle}
      style={big
        ? { width: '100%', padding: '15px 16px', borderRadius: 14, border: 'none', background: C.blue, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(26,115,232,0.3)' }
        : { width: '100%', padding: '11px 16px', borderRadius: 12, border: `1px solid ${C.line}`, background: 'white', color: C.blue, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
      {big ? 'Write a Google review' : 'Post a review on Google'}
    </button>
  );
  const input = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 15, fontFamily: 'inherit', color: C.ink, background: 'white' };

  return shell(
    <>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {info.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.logo} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 18, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        ) : null}
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: info.logo ? 12 : 0 }}>{info.name}</div>
      </div>

      <div style={card}>
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700 }}>How was your visit?</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }} onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => pick(n)} onMouseEnter={() => setHover(n)}
              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', fontSize: 42, lineHeight: 1, color: n <= shown ? C.star : '#d6d3d1', transform: n <= shown ? 'scale(1.06)' : 'none', transition: 'color .12s, transform .12s' }}>
              ★
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: C.soft, minHeight: 18, marginTop: 6 }}>{shown ? WORDS[shown] : 'Tap a star'}</div>

        {rating > 0 && happy && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, textAlign: 'center' }}>Thank you! Would you share it on Google?</div>
            <div style={{ fontSize: 13, color: C.soft, textAlign: 'center', marginTop: 4 }}>It helps other people find us. What did you like?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '14px 0 18px' }}>
              {(info.liked || []).map((x) => {
                const on = liked.includes(x);
                return (
                  <button key={x} type="button" onClick={() => toggleLiked(x)}
                    style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: on ? `2px solid ${C.green}` : `1px solid ${C.line}`, background: on ? '#f0fdf4' : 'white', color: on ? '#166534' : C.ink }}>
                    {on ? '✓ ' : ''}{x}
                  </button>
                );
              })}
            </div>
            {googleBtn(true)}
            <div style={{ fontSize: 12, color: C.soft, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              Google opens its review page — pick your stars there and write a few words in your own way{liked.length ? ` (you liked: ${liked.join(', ')})` : ''}.
            </div>
          </div>
        )}

        {rating > 0 && !happy && (
          <div style={{ marginTop: 18 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Thank you for telling us 🙏</div>
                <div style={{ fontSize: 13, color: C.soft, marginTop: 4 }}>The team will look into it.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, textAlign: 'center' }}>Sorry it wasn&apos;t great</div>
                <div style={{ fontSize: 13, color: C.soft, textAlign: 'center', marginTop: 4, marginBottom: 12 }}>Tell us what went wrong — it goes straight to the restaurant.</div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000} placeholder="What could we do better?" style={{ ...input, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Name (optional)" style={{ ...input, flex: '1 1 140px' }} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} inputMode="tel" placeholder="Phone (optional)" style={{ ...input, flex: '1 1 140px' }} />
                </div>
                <button type="button" onClick={sendFeedback} disabled={sending || !message.trim()}
                  style={{ width: '100%', marginTop: 12, padding: '13px 16px', borderRadius: 14, border: 'none', background: C.ink, color: 'white', fontSize: 15, fontWeight: 700, cursor: message.trim() ? 'pointer' : 'default', opacity: sending || !message.trim() ? 0.5 : 1 }}>
                  {sending ? 'Sending…' : 'Send to the restaurant'}
                </button>
              </>
            )}
            <div style={{ marginTop: 14 }}>{googleBtn(false)}</div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#a8a29e', marginTop: 18 }}>Powered by DineOpen</div>
    </>
  );
}
