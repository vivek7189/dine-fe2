'use client';

// Photos + voice notes on a staff meeting (MFC: "add photos and voice clippings to be sent to the staff,
// trainees"). MediaList shows them (tap a photo for full size, voice notes play inline); MediaAdder adds
// photos (camera / gallery) and voice notes — recorded right here when the browser allows the
// microphone, or picked from the phone's recordings.

import { useEffect, useRef, useState } from 'react';

const btn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' };
const mmss = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, '0')}`;
const MAX_RECORD_SEC = 300;

export function MediaList({ media = [], onRemove }) {
  const [viewer, setViewer] = useState(null);
  if (!media.length) return null;
  const photos = media.filter(x => x.kind === 'photo');
  const voices = media.filter(x => x.kind === 'voice');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {photos.map(p => (
            <div key={p.url} style={{ position: 'relative' }}>
              <button type="button" onClick={() => setViewer(p.url)} style={{ padding: 0, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in', background: '#f9fafb' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name || 'Meeting photo'} style={{ width: 84, height: 84, objectFit: 'cover', display: 'block' }} />
              </button>
              {onRemove && <button type="button" aria-label="Remove photo" onClick={() => onRemove(p)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 999, border: 'none', background: '#111827', color: '#fff', fontSize: 11, cursor: 'pointer' }}>✕</button>}
            </div>
          ))}
        </div>
      )}
      {voices.map((v, i) => (
        <div key={v.url} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280', minWidth: 90 }}>🎤 Voice note {voices.length > 1 ? i + 1 : ''}{v.durationSec ? ` · ${mmss(v.durationSec)}` : ''}</span>
          <audio controls preload="none" src={v.url} style={{ height: 36, maxWidth: '100%' }} />
          {onRemove && <button type="button" onClick={() => onRemove(v)} style={{ ...btn, padding: '4px 8px', color: '#b91c1c', borderColor: '#fecaca' }}>Remove</button>}
        </div>
      ))}
      {viewer && (
        <div role="dialog" aria-label="Photo" onClick={() => setViewer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewer} alt="Meeting photo, full size" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

// upload(files) → [{ url, kind, name }]; onAdded(items) gets them (+ durationSec for recordings).
export function MediaAdder({ upload, onAdded, disabled, max = 12, count = 0 }) {
  const photoRef = useRef(null);
  const audioRef = useRef(null);
  const recRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [rec, setRec] = useState(null); // { started } while recording
  const [secs, setSecs] = useState(0);
  const canRecord = typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof window.MediaRecorder !== 'undefined';
  const full = count >= max;

  useEffect(() => {
    if (!rec) return undefined;
    const t = setInterval(() => {
      const s = Math.round((Date.now() - rec.started) / 1000);
      setSecs(s);
      if (s >= MAX_RECORD_SEC) stop();
    }, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec]);
  // stop the microphone if the screen closes mid-recording
  useEffect(() => () => { try { recRef.current?.stream?.getTracks().forEach(t => t.stop()); } catch (_) {} }, []);

  const send = async (files, extra = {}) => {
    if (!files.length) return;
    setBusy(true); setErr('');
    try { const got = await upload(files.slice(0, Math.max(0, max - count))); onAdded((got || []).map(x => ({ ...x, ...extra }))); }
    catch (e) { setErr(e?.message || 'Could not upload'); }
    finally { setBusy(false); }
  };

  const start = async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ['audio/webm', 'audio/mp4', 'audio/ogg'].find(t => window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported(t)) || '';
      const mr = new window.MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const mime = (mr.mimeType || type || 'audio/webm').split(';')[0];
        const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
        const dur = Math.round((Date.now() - (recRef.current?.started || Date.now())) / 1000);
        recRef.current = null; setRec(null); setSecs(0);
        if (!chunks.length) { setErr('Nothing was recorded'); return; }
        const file = new File([new Blob(chunks, { type: mime })], `voice-note.${ext}`, { type: mime });
        send([file], { durationSec: dur });
      };
      const started = Date.now();
      recRef.current = { mr, stream, started };
      mr.start();
      setRec({ started });
    } catch (e) {
      setErr('The microphone is not available here — choose a recording from your phone instead.');
    }
  };
  const stop = () => { try { recRef.current?.mr?.state !== 'inactive' && recRef.current?.mr?.stop(); } catch (_) {} };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" disabled={disabled || busy || full || !!rec} onClick={() => photoRef.current?.click()} style={btn}>📷 Add photos</button>
        {canRecord && !rec && <button type="button" disabled={disabled || busy || full} onClick={start} style={btn}>🎤 Record voice note</button>}
        {rec && <button type="button" onClick={stop} style={{ ...btn, background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>■ Stop · {mmss(secs)}</button>}
        <button type="button" disabled={disabled || busy || full || !!rec} onClick={() => audioRef.current?.click()} style={btn}>🎵 Choose a recording</button>
        {busy && <span style={{ fontSize: 12, color: '#6b7280' }}>Uploading…</span>}
        {full && <span style={{ fontSize: 12, color: '#6b7280' }}>Up to {max} files</span>}
      </div>
      <input ref={photoRef} type="file" accept="image/*" multiple hidden onChange={e => { send([...(e.target.files || [])]); e.target.value = ''; }} />
      <input ref={audioRef} type="file" accept="audio/*" hidden onChange={e => { send([...(e.target.files || [])]); e.target.value = ''; }} />
      {err && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>{err}</div>}
    </div>
  );
}
