'use client';

// Review star page — what the restaurant's review QR opens (when its owner turned it on).
// Stars first. 4–5 → "Write a Google review" (big). 1–3 → a private box to tell the restaurant
// what went wrong, and the Google button is still there (smaller): nobody is kept from Google.
// Optional (owner switch "draftText"): a 4–5 star guest's own taps (what they liked, a favourite dish)
// become a short draft they can edit; "Copy & open Google" puts it on the clipboard to paste there.
// Nothing is posted for them, no reward is offered, and 1–3 star visits are unchanged.
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const C = { ink: '#1f2937', soft: '#6b7280', line: '#e5e7eb', star: '#f59e0b', blue: '#1a73e8', green: '#16a34a', bg: '#f7f7f5' };
const WORDS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Loved it!'];

// A short review from the guest's own picks. Several wordings, so no two guests' texts read alike.
const PHRASES = {
  Food: ['the food was delicious', 'really tasty food', 'fresh, flavourful food'],
  Service: ['friendly service', 'the staff were warm and helpful', 'attentive staff'],
  Ambience: ['a nice, relaxed feel', 'a pleasant ambience', 'a comfortable place to sit'],
  Coffee: ['great coffee', 'the coffee was excellent'],
  Drinks: ['good drinks', 'refreshing drinks'],
  'Value for money': ['good value for money', 'fair prices for what you get'],
  Cleanliness: ['clean and well kept', 'a really clean place'],
  'Quick service': ['quick service', 'the food came out fast'],
};
const DISH = [(d) => `loved the ${d}`, (d) => `the ${d} was a highlight`, (d) => `must try the ${d}`];
const OPEN = { 5: ['Loved it here!', 'Really good experience.', 'Great visit.'], 4: ['Good experience.', 'Nice place.', 'Enjoyed our visit.'] };
const CLOSE = ['Will be back.', 'Would recommend.', 'Definitely coming again.', ''];
const pickOne = (arr, seed) => arr[Math.abs(seed) % arr.length];
function buildDraft({ rating, liked = [], dishes = [], seed = 0 }) {
  const parts = [];
  liked.forEach((x, i) => { const p = PHRASES[x]; if (p) parts.push(pickOne(p, seed + i * 7)); });
  dishes.slice(0, 2).forEach((d, i) => parts.push(pickOne(DISH, seed + i * 3)(d)));
  if (!parts.length) return '';
  const body = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  const sentence = body.charAt(0).toUpperCase() + body.slice(1) + '.';
  return [pickOne(OPEN[rating >= 5 ? 5 : 4], seed), sentence, pickOne(CLOSE, seed + 5)].filter(Boolean).join(' ');
}

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
  const [dishes, setDishes] = useState([]);   // draft: favourite dishes the guest tapped
  const [draft, setDraft] = useState('');     // draft: the text (guest can edit)
  const [edited, setEdited] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copyNote, setCopyNote] = useState('');
  const [copyFailed, setCopyFailed] = useState(false); // browser blocked copying → next tap just opens Google
  const visitId = useRef(null);
  const draftOn = !!(info && info.draft && info.draft.on);

  // Rebuild the draft from the guest's picks until they type in it themselves.
  useEffect(() => {
    if (!draftOn || edited || rating < 4) return;
    setDraft(buildDraft({ rating, liked, dishes, seed }));
  }, [draftOn, edited, rating, liked, dishes, seed]);

  useEffect(() => {
    visitId.current = newVisitId();
    setSeed(Math.floor(Math.random() * 1000));
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

  // Copy the draft, then open Google's review page (the guest pastes it and picks their stars there).
  const copyAndGo = async () => {
    const text = draft.trim();
    if (!text || copyFailed) { goGoogle(); return; }
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch (_) {
      try {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); copied = document.execCommand('copy'); ta.remove();
      } catch (__) { copied = false; }
    }
    if (!copied) {
      setCopyFailed(true);
      setCopyNote('Press and hold the text above → Copy, then tap "Open Google".');
      try { const el = document.querySelector('[data-testid="review-draft"]'); el && el.focus(); el && el.select(); } catch (_) { /* nothing to select */ }
      return;
    }
    setCopyNote('Copied! Paste it on Google and pick your stars.');
    setTimeout(goGoogle, 900);
  };
  const toggleDish = (d) => setDishes((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].slice(-2)));

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
            {draftOn && (info.draft.dishes || []).length > 0 && (
              <>
                <div style={{ fontSize: 13, color: C.soft, textAlign: 'center', margin: '-6px 0 10px' }}>Favourite dish? (up to 2)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
                  {info.draft.dishes.map((d) => {
                    const on = dishes.includes(d);
                    return (
                      <button key={d} type="button" data-testid="dish-chip" onClick={() => toggleDish(d)}
                        style={{ padding: '6px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: on ? `2px solid ${C.star}` : `1px solid ${C.line}`, background: on ? '#fffbeb' : 'white', color: on ? '#92400e' : C.ink }}>
                        {on ? '✓ ' : ''}{d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {draftOn ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Your review</span>
                  {!edited && draft && <button type="button" onClick={() => setSeed((x) => x + 1)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Try other words</button>}
                </div>
                <textarea data-testid="review-draft" value={draft} rows={3} maxLength={600}
                  onChange={(e) => { setDraft(e.target.value); setEdited(true); }}
                  placeholder="Tap what you liked above, or write a few words in your own way"
                  style={{ ...input, resize: 'vertical', marginBottom: 6 }} />
                <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 12 }}>Change it as you like — it&apos;s your review.</div>
                <button type="button" data-testid="copy-go" onClick={copyAndGo}
                  style={{ width: '100%', padding: '15px 16px', borderRadius: 14, border: 'none', background: C.blue, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(26,115,232,0.3)' }}>
                  {!draft.trim() ? 'Write a Google review' : copyFailed ? 'Open Google' : 'Copy & open Google'}
                </button>
                {copyNote && <div data-testid="copy-note" style={{ fontSize: 13, color: C.green, textAlign: 'center', marginTop: 10, fontWeight: 600 }}>{copyNote}</div>}
                <div style={{ fontSize: 12, color: C.soft, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                  Google opens its review page — tap the box, paste, pick your stars and post.
                </div>
              </>
            ) : (
              <>
                {googleBtn(true)}
                <div style={{ fontSize: 12, color: C.soft, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                  Google opens its review page — pick your stars there and write a few words in your own way{liked.length ? ` (you liked: ${liked.join(', ')})` : ''}.
                </div>
              </>
            )}
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
