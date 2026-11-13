'use client';

// Review star page — what the restaurant's review QR opens (when its owner turned it on).
// Stars first. 4–5 → "Write a Google review" (big). 1–3 → a private box to tell the owner what went
// wrong (they read every message and call back), with "Review us on Google" still offered as a quiet
// link: nobody is kept from Google (Google's rules forbid hiding it from unhappy guests).
// Optional (owner switch "draftText"): a 4–5 star guest's own taps (what they liked, a favourite dish)
// become a short draft they can edit; "Copy & open Google" puts it on the clipboard to paste there.
// Nothing is posted for them, no reward is offered, and 1–3 star visits are unchanged.
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const C = { ink: '#1f2937', soft: '#6b7280', line: '#ece9e4', star: '#f59e0b', blue: '#1a73e8', green: '#16a34a', accent: '#ea580c', bg: '#f7f7f5' };
const WORDS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Loved it!'];
const FACES = ['', '😞', '😕', '😐', '🙂', '😍'];
const ICONS = { Food: '🍛', Service: '🤝', Ambience: '✨', Coffee: '☕', Drinks: '🥤', 'Value for money': '💰', Cleanliness: '🧼', 'Quick service': '⚡' };

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
    <main className="rv-root" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff4e6 0%, #fffaf3 38%, #f8f7f4 100%)', display: 'flex', justifyContent: 'center', padding: '28px 16px 40px', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', color: C.ink }}>
      <style>{`
        .rv-root * { box-sizing: border-box; }
        @keyframes rvUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes rvPop { 0% { transform: scale(1); } 40% { transform: scale(1.28); } 100% { transform: scale(1.08); } }
        @keyframes rvCheck { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .rv-in { animation: rvUp .35s ease both; }
        .rv-star { transition: color .15s, transform .15s; }
        .rv-star:active { transform: scale(0.92); }
        .rv-star.on { animation: rvPop .35s ease; }
        .rv-chip { transition: all .15s; }
        .rv-chip:active { transform: scale(0.96); }
        .rv-btn:active { transform: translateY(1px); }
        .rv-input:focus { outline: none; border-color: ${C.accent}; box-shadow: 0 0 0 3px rgba(234,88,12,0.12); }
      `}</style>
      <div style={{ width: '100%', maxWidth: 440 }}>{children}</div>
    </main>
  );

  if (state === 'loading') return shell(<div style={{ textAlign: 'center', color: C.soft, paddingTop: 80 }}>Loading…</div>);
  if (state === 'missing') return shell(<div style={{ textAlign: 'center', color: C.soft, paddingTop: 80 }}>This review page isn&apos;t available.</div>);

  const shown = hover || rating;
  const happy = rating >= 4;
  const card = { background: 'white', borderRadius: 24, padding: '26px 20px 22px', boxShadow: '0 1px 2px rgba(17,24,39,0.04), 0 12px 32px rgba(17,24,39,0.07)', border: '1px solid rgba(17,24,39,0.04)' };
  const input = { width: '100%', padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${C.line}`, fontSize: 15, fontFamily: 'inherit', color: C.ink, background: '#fcfcfb', transition: 'border-color .15s, box-shadow .15s' };
  const initials = String(info.name || 'R').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const chip = (on, color, bg) => ({ padding: '8px 13px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: on ? `1.5px solid ${color}` : `1.5px solid ${C.line}`, background: on ? bg : 'white', color: on ? color : C.ink, fontFamily: 'inherit' });
  const primaryBtn = { width: '100%', padding: '15px 16px', borderRadius: 16, border: 'none', background: C.blue, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(26,115,232,0.28)', fontFamily: 'inherit' };
  // Low ratings: Google stays available to everyone, as a quiet line under the private form.
  const quietGoogle = (
    <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: C.soft }}>
      Prefer to post publicly?{' '}
      <button type="button" data-testid="quiet-google" onClick={goGoogle}
        style={{ background: 'none', border: 'none', padding: 0, color: C.soft, textDecoration: 'underline', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
        Review us on Google
      </button>
    </div>
  );

  return shell(
    <>
      <div className="rv-in" style={{ textAlign: 'center', marginBottom: 22 }}>
        {info.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.logo} alt="" style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 22, background: 'white', boxShadow: '0 6px 18px rgba(17,24,39,0.12)', border: '3px solid white' }} />
        ) : (
          <div aria-hidden="true" style={{ width: 72, height: 72, margin: '0 auto', borderRadius: 22, background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`, color: 'white', fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(234,88,12,0.3)' }}>{initials}</div>
        )}
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 12, letterSpacing: '-0.01em' }}>{info.name}</div>
        <div style={{ fontSize: 13.5, color: C.soft, marginTop: 3 }}>Thank you for dining with us</div>
      </div>

      <div className="rv-in" style={card}>
        <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 800 }}>How was your visit?</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 14 }} onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => pick(n)} onMouseEnter={() => setHover(n)}
              className={`rv-star${n <= rating ? ' on' : ''}`}
              style={{ background: 'none', border: 'none', padding: 3, cursor: 'pointer', fontSize: 46, lineHeight: 1, color: n <= shown ? C.star : '#e7e5e4', transform: n <= shown ? 'scale(1.08)' : 'none', textShadow: n <= shown ? '0 3px 10px rgba(245,158,11,0.35)' : 'none' }}>
              ★
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: shown ? C.ink : C.soft, minHeight: 22, marginTop: 8 }}>
          {shown ? `${FACES[shown]}  ${WORDS[shown]}` : 'Tap a star to rate'}
        </div>

        {rating > 0 && happy && (
          <div key="happy" className="rv-in" style={{ marginTop: 20 }}>
            <div style={{ height: 1, background: C.line, margin: '0 -20px 20px' }} />
            <div style={{ fontSize: 17, fontWeight: 800, textAlign: 'center' }}>So glad you loved it! 🎉</div>
            <div style={{ fontSize: 13.5, color: C.soft, textAlign: 'center', marginTop: 4 }}>Would you share it on Google? It really helps us. What did you like?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '16px 0 18px' }}>
              {(info.liked || []).map((x) => {
                const on = liked.includes(x);
                return (
                  <button key={x} type="button" className="rv-chip" onClick={() => toggleLiked(x)} style={chip(on, '#15803d', '#f0fdf4')}>
                    {on ? '✓' : (ICONS[x] || '•')} {x}
                  </button>
                );
              })}
            </div>
            {draftOn && (info.draft.dishes || []).length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, textAlign: 'center', marginBottom: 10 }}>Favourite dish? <span style={{ fontWeight: 500, color: C.soft }}>(up to 2)</span></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                  {info.draft.dishes.map((d) => {
                    const on = dishes.includes(d);
                    return (
                      <button key={d} type="button" data-testid="dish-chip" className="rv-chip" onClick={() => toggleDish(d)} style={{ ...chip(on, '#b45309', '#fffbeb'), fontSize: 13 }}>
                        {on ? '✓ ' : '🍽 '}{d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {draftOn ? (
              <>
                <div style={{ background: '#fafaf9', border: `1px solid ${C.line}`, borderRadius: 18, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>✍️ Your review</span>
                    {!edited && draft && <button type="button" onClick={() => setSeed((x) => x + 1)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>↻ Try other words</button>}
                  </div>
                  <textarea data-testid="review-draft" className="rv-input" value={draft} rows={3} maxLength={600}
                    onChange={(e) => { setDraft(e.target.value); setEdited(true); }}
                    placeholder="Tap what you liked above, or write a few words in your own way"
                    style={{ ...input, resize: 'vertical', background: 'white', lineHeight: 1.5 }} />
                  <div style={{ fontSize: 11.5, color: C.soft, marginTop: 6 }}>Change it as you like — it&apos;s your review.</div>
                </div>
                <button type="button" data-testid="copy-go" className="rv-btn" onClick={copyAndGo} style={{ ...primaryBtn, marginTop: 16 }}>
                  {!draft.trim() ? 'Write a Google review' : copyFailed ? 'Open Google' : 'Copy & open Google'}
                </button>
                {copyNote && <div data-testid="copy-note" style={{ fontSize: 13, color: C.green, textAlign: 'center', marginTop: 10, fontWeight: 600 }}>{copyNote}</div>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 12, fontSize: 12, color: C.soft }}>
                  <span>① Copy</span><span>② Paste on Google</span><span>③ Pick stars & post</span>
                </div>
              </>
            ) : (
              <>
                <button type="button" className="rv-btn" onClick={goGoogle} style={primaryBtn}>Write a Google review</button>
                <div style={{ fontSize: 12, color: C.soft, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                  Google opens its review page — pick your stars there and write a few words in your own way{liked.length ? ` (you liked: ${liked.join(', ')})` : ''}.
                </div>
              </>
            )}
          </div>
        )}

        {rating > 0 && !happy && (
          <div key="sad" className="rv-in" style={{ marginTop: 20 }}>
            <div style={{ height: 1, background: C.line, margin: '0 -20px 20px' }} />
            {sent ? (
              <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <div style={{ width: 56, height: 56, margin: '0 auto 12px', borderRadius: '50%', background: '#dcfce7', color: C.green, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'rvCheck .35s ease both' }}>✓</div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>Thank you for telling us 🙏</div>
                <div style={{ fontSize: 13.5, color: C.soft, marginTop: 6, lineHeight: 1.5 }}>
                  The owner reads every message{phone.trim() ? ' and will call you back soon.' : ' and will make it right.'}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 800, textAlign: 'center' }}>We&apos;re sorry it wasn&apos;t great 😔</div>
                <div data-testid="owner-note" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '11px 13px', margin: '14px 0' }}>
                  <span style={{ fontSize: 18, lineHeight: 1.2 }}>💬</span>
                  <span style={{ fontSize: 13.5, color: '#9a3412', lineHeight: 1.45 }}>
                    <b>The owner reads every message and will call you back.</b> Tell us what went wrong — we&apos;d love the chance to fix it.
                  </span>
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000} className="rv-input" placeholder="What could we do better?" style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="rv-input" placeholder="Your name" style={{ ...input, flex: '1 1 140px' }} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} inputMode="tel" className="rv-input" placeholder="Phone number" style={{ ...input, flex: '1 1 140px' }} />
                </div>
                <button type="button" className="rv-btn" onClick={sendFeedback} disabled={sending || !message.trim()}
                  style={{ width: '100%', marginTop: 14, padding: '15px 16px', borderRadius: 16, border: 'none', background: message.trim() ? C.accent : '#d6d3d1', color: 'white', fontSize: 16, fontWeight: 700, cursor: message.trim() ? 'pointer' : 'default', opacity: sending ? 0.6 : 1, boxShadow: message.trim() ? '0 8px 20px rgba(234,88,12,0.25)' : 'none', fontFamily: 'inherit', transition: 'background .15s' }}>
                  {sending ? 'Sending…' : 'Send to the owner'}
                </button>
              </>
            )}
            {quietGoogle}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#a8a29e', marginTop: 20 }}>Powered by DineOpen</div>
    </>
  );
}
